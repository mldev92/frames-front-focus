import { execFileSync, spawn } from "node:child_process";
import { availableParallelism } from "node:os";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { publishedMatches } from "./published-page.mjs";
import { releaseMode } from "./storefront-release-mode.mjs";

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const parent = path.resolve(process.env.O100_PUBLISHED_DIR || process.argv[2] || "");
const manifestBytes = await readFile(path.join(parent, "release-manifest.json"));
if (digest(manifestBytes) !== process.env.O100_PARENT_MANIFEST_SHA256)
  throw Error("Published manifest checksum mismatch");
const baseline = JSON.parse(manifestBytes);
const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (
  execFileSync("git", ["status", "--porcelain", "--", ".", ":!src/routeTree.gen.ts"], {
    encoding: "utf8",
  }).trim()
)
  throw Error("Commit the build source before preparing a code-only release");
const decision = releaseMode(baseline.frontendSha);
if (decision.mode !== "code-only")
  throw Error("Full catalog build required: " + decision.reasons.join(", "));
if (
  !baseline.catalogFingerprint ||
  baseline.backendSha !== process.env.O100_BACKEND_SHA ||
  !/^[a-f0-9]{64}$/.test(process.env.O100_ROUTING_SHA256 || "") ||
  Object.values(baseline.settings).some(Boolean)
)
  throw Error("Invalid production baseline");
if (process.env.O100_BACKEND_MANIFEST) {
  const backend = JSON.parse(await readFile(process.env.O100_BACKEND_MANIFEST, "utf8"));
  const hashes = Object.fromEntries(
    Object.entries(backend.files).map(([name, entry]) => [name, entry.sha256 ?? entry]),
  );
  if (backend.sha !== baseline.backendSha || !isDeepStrictEqual(hashes, baseline.backendFiles))
    throw Error("Published backend contract changed");
}

async function readPublished(name) {
  const bytes = await readFile(path.join(parent, name));
  if (digest(bytes) !== baseline.files[name]) throw Error("Published file changed: " + name);
  return bytes;
}
const pageFiles = Object.keys(baseline.files).filter(
  (f) => f === "index.html" || f.endsWith("/index.html"),
);
if (pageFiles.length !== baseline.routeCount || !pageFiles.includes("index.html"))
  throw Error("Published route count mismatch");
const routes = pageFiles.map((f) => "/" + f.slice(0, -"index.html".length));
await mkdir("generated", { recursive: true });
await writeFile(
  "generated/production-routes.json",
  JSON.stringify({ routes, count: routes.length, retiredProductPaths: baseline.retiredPaths }),
);
const preload = (name) => new URL(name, import.meta.url).href;
const env = {
  ...process.env,
  O100_PUBLISHED_DIR: parent,
  VITE_BITRIX_API: "https://optika100.com",
  O100_BUILD_ORIGIN: "https://optika100.com",
  O100_BUILD_MODE: "replay",
  O100_BUILD_GATEWAY: "http://127.0.0.1:9",
  NODE_OPTIONS:
    "--import=" +
    preload("./build-network-guard.mjs") +
    " --import=" +
    preload("./published-loaders.mjs"),
};
execFileSync(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "build", "--config", "vite.config.code-only.ts"],
  { env, stdio: "inherit" },
);
const client = "dist/client";
for (const file of ["sitemap.xml", "robots.txt"])
  await writeFile(path.join(client, file), await readPublished(file));

const files = {};
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.isFile())
      files[path.relative(client, full).split(path.sep).join("/")] = digest(await readFile(full));
    else throw Error("Unexpected build output: " + full);
  }
}
const shell = await readFile(path.join(client, "_shell.html"), "utf8");
if (
  !isDeepStrictEqual(
    publishedMatches((await readPublished("_shell.html")).toString()),
    publishedMatches(shell),
  )
)
  throw Error("Shell route data changed");
const count = Math.max(1, Math.min(6, availableParallelism() - 1, routes.length));
const controller = new AbortController();
try {
  await Promise.all(
    Array.from(
      { length: count },
      (_, index) =>
        new Promise((resolve, reject) => {
          const worker = spawn(
            process.execPath,
            ["scripts/published-render.mjs", String(index), String(count)],
            {
              env: { ...env, TSS_PRERENDERING: "true", NODE_ENV: "production" },
              stdio: "inherit",
              signal: controller.signal,
              windowsHide: true,
            },
          );
          worker.once("error", reject);
          worker.once("exit", (code) =>
            code === 0 ? resolve() : reject(Error("Published route worker exited " + code)),
          );
        }),
    ),
  );
} finally {
  controller.abort();
}
await writeFile(path.join(client, ".release-sha"), sha + "\n");
await walk(client);
const outputPages = Object.keys(files).filter(
  (f) => f === "index.html" || f.endsWith("/index.html"),
);
if (
  outputPages.length !== routes.length ||
  outputPages.some((f) => !Object.hasOwn(baseline.files, f))
)
  throw Error("Code-only release changed routes");
for (const name of ["404.html", "robots.txt", "sitemap.xml", "_shell.html"])
  if (!files[name]) throw Error("Missing " + name);
const templateFiles = {};
for (const name of [
  "release.sh",
  "verify-release.php",
  "verify-code-only.php",
  "accept-catalog-release.php",
  "production.htaccess",
  "redirects.production.txt",
  "merge-routing.php",
  "link-unchanged.php",
  "tar-extract.sh",
]) {
  templateFiles["deploy/" + name] = digest(await readFile("deploy/" + name));
}
const manifest = {
  ...baseline,
  frontendSha: sha,
  routingBaseline: process.env.O100_ROUTING_SHA256,
  files,
  templateFiles,
  builtAt: new Date().toISOString(),
  codeOnly: { parentSha: baseline.frontendSha, parentManifestSha256: digest(manifestBytes) },
};
// Панель из React-компонента теперь входит в обычный бандл.
delete manifest.adminToolbar;
await writeFile(
  path.join(client, "release-manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  "Verified offline release:",
  sha,
  "routes:",
  routes.length,
  "catalog:",
  manifest.catalogFingerprint,
);
