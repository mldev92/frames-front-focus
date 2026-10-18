import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const routes = JSON.parse(await readFile("generated/production-routes.json", "utf8")).routes;
const origin = process.env.O100_REHEARSAL_ORIGIN || "http://127.0.0.1:8089";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const failures = [];
let position = 0;
async function worker() {
  while (position < routes.length) {
    const route = routes[position++];
    const filename = route === "/" ? "index.html" : route.replace(/^\/|\/$/g, "") + "/index.html";
    try {
      const response = await fetch(origin + route, { redirect: "manual", signal: AbortSignal.timeout(30000) });
      const body = Buffer.from(await response.arrayBuffer());
      const expected = await readFile("dist/client/" + filename);
      if (response.status !== 200 || hash(body) !== hash(expected)) failures.push(`${route}: status=${response.status}, content match=${hash(body) === hash(expected)}`);
    } catch (error) { failures.push(`${route}: ${error.message}`); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
const redirectText = await readFile("deploy/redirects.production.txt", "utf8");
let redirectCount = 0;
for (const line of redirectText.split(/\r?\n/)) {
  if (!line.startsWith("RedirectMatch ")) continue;
  const match = line.match(/^RedirectMatch 301 \^(\S+?)\/\?\$\s+(\S+)$/);
  if (!match) throw new Error(`Unverified redirect pattern: ${line}`);
  const source = match[1].replace(/\\([.\-])/g, "$1") + "/";
  const response = await fetch(origin + source + "?cutover_probe=1", { redirect: "manual" });
  const expected = new URL(match[2], origin);
  expected.searchParams.set("cutover_probe", "1");
  if (response.status !== 301 || response.headers.get("location") !== expected.href) {
    failures.push(`${source}: expected redirect ${expected.href}, got ${response.status} ${response.headers.get("location")}`);
  }
  redirectCount++;
}
for (const route of ["/o100_frontend_current/index.html", "/o100_frontend_releases/private/index.html", "/cutover-unknown-page/", "/catalog_s/opravy/cutover-unknown-product/"]) {
  const response = await fetch(origin + route, {redirect:"manual"});
  if (response.status !== 404) failures.push(`${route}: expected 404, got ${response.status}`);
}
if (failures.length) throw new Error(`${failures.length} Apache failures:\n${failures.slice(0, 50).join("\n")}`);
console.log(`PASS: Apache served all ${routes.length} manifest routes byte-for-byte; ${redirectCount} exact redirects preserved targets and queries; private and unknown paths returned 404.`);
