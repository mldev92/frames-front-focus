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
for (const route of ["/o100_frontend_current/index.html", "/o100_frontend_releases/private/index.html", "/cutover-unknown-page/", "/catalog_s/opravy/cutover-unknown-product/"]) {
  const response = await fetch(origin + route, {redirect:"manual"});
  if (response.status !== 404) failures.push(`${route}: expected 404, got ${response.status}`);
}
if (failures.length) throw new Error(`${failures.length} Apache failures:\n${failures.slice(0, 50).join("\n")}`);
console.log(`PASS: Apache served all ${routes.length} manifest routes byte-for-byte; private and unknown paths returned 404.`);
