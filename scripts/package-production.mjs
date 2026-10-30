import "./validate-production-build.mjs";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { verifyCheckoutRuntime } from "./checkout-runtime-manifest.mjs";
import { loadInventory } from './seo-inventory.mjs';
import { catalogFingerprint } from './catalog-refresh-policy.mjs';

if (process.env.O100_PRERENDER_LIMIT || process.env.O100_PRERENDER_ROUTES) throw new Error("Partial production builds cannot be packaged");
const sha = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const backendSha = process.env.O100_BACKEND_SHA;
const baseline = process.env.O100_ROUTING_SHA256;
if (!/^[a-f0-9]{40}$/.test(backendSha ?? "") || !/^[a-f0-9]{64}$/.test(baseline ?? "")) throw new Error("Backend SHA and approved routing hash are required");
const backend = JSON.parse(await readFile(process.env.O100_BACKEND_MANIFEST, "utf8"));
if (backend.sha !== backendSha || !Object.keys(backend.files ?? {}).length) throw new Error("Backend manifest does not match release");
verifyCheckoutRuntime(backend.files);
const templateFiles = {};
await writeFile('deploy/catalog-export.php', (await readFile('scripts/catalog-content-fingerprint.php','utf8')) + '\n' + (await readFile('scripts/export-seo-inventory.php','utf8')).replace(/^<\?php/,''));
for (const file of ["deploy/production.htaccess", "deploy/redirects.production.txt", "deploy/release.sh", "deploy/merge-routing.php", "deploy/verify-release.php", "deploy/accept-catalog-release.php", "deploy/catalog-export.php"]) {
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
const inventory = await loadInventory();
const required = JSON.parse(await readFile('deploy/seo-required-products.json','utf8')).paths;
const available = new Set(routes.routes);
const samples = inventory.products.filter(p=>p.sectionActive).filter((p,i)=>i%150===0).map(p=>p.canonicalPath);
const acceptancePaths = [...new Set(['/', '/catalog_s/opravy/', '/catalog_n/opravy/', ...required, ...samples])].filter(p=>available.has(p));
await writeFile(path.join(root, "release-manifest.json"), JSON.stringify({ version: 1, frontendSha: sha, backendSha,
  backendFiles: backend.files, templateFiles, runtime: process.version, apiOrigin: "https://optika100.com", routingBaseline: baseline, builtAt: new Date().toISOString(), routeCount: routes.count,
  inventorySha256: routes.inventorySha256, inventoryGeneratedAt: routes.inventoryGeneratedAt,
  catalogFingerprint: inventory.content ? catalogFingerprint(inventory) : null, acceptancePaths,
  retiredPaths: [...new Set([...routes.retiredProductPaths,...routes.retiredSectionPaths])],
  settings: { privateBeta: false, fixtures: false, virtualTryOn: false }, files }, null, 2) + "\n");
