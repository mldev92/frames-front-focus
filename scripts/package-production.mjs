import "./validate-production-build.mjs";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

if (process.env.O100_PRERENDER_LIMIT || process.env.O100_PRERENDER_ROUTES) throw new Error("Partial production builds cannot be packaged");
const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const backendSha = process.env.O100_BACKEND_SHA;
const baseline = process.env.O100_ROUTING_SHA256;
if (!/^[a-f0-9]{40}$/.test(backendSha ?? "") || !/^[a-f0-9]{64}$/.test(baseline ?? "")) throw new Error("Backend SHA and approved routing hash are required");
const backend = JSON.parse(await readFile(process.env.O100_BACKEND_MANIFEST, "utf8"));
if (backend.sha !== backendSha || !Object.keys(backend.files ?? {}).length) throw new Error("Backend manifest does not match release");
const templateFiles = {};
for (const file of ["deploy/production.htaccess", "deploy/redirects.production.txt", "deploy/release.sh", "deploy/merge-routing.php", "deploy/verify-release.php"]) {
  templateFiles[file] = createHash("sha256").update(await readFile(file)).digest("hex");
}
const root = path.resolve("dist/client");
await writeFile(path.join(root, ".release-sha"), sha + "\n");
const files = {};
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.isFile() && entry.name !== "release-manifest.json") {
      const relative = path.relative(root, file).replaceAll("\\", "/");
      files[relative] = createHash("sha256").update(await readFile(file)).digest("hex");
    } else if (!entry.isFile()) throw new Error("Unexpected artifact entry: " + file);
  }
}
await walk(root);
const routes = JSON.parse(await readFile("generated/production-routes.json", "utf8"));
await writeFile(path.join(root, "release-manifest.json"), JSON.stringify({ version: 1, frontendSha: sha, backendSha,
  backendFiles: backend.files, templateFiles, runtime: process.version, apiOrigin: "https://optika100.com", routingBaseline: baseline, builtAt: new Date().toISOString(), routeCount: routes.count,
  settings: { privateBeta: false, fixtures: false, virtualTryOn: false }, files }, null, 2) + "\n");
