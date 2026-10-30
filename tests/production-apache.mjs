import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { catalogLinks } from "../scripts/catalog-link-check.mjs";
const routeManifest = JSON.parse(await readFile("generated/production-routes.json", "utf8"));
const routes = routeManifest.routes;
const origin = process.env.O100_REHEARSAL_ORIGIN || "http://127.0.0.1:8089";
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const failures = [];
const navigationLinks = new Set();
let position = 0;
async function worker() {
  while (position < routes.length) {
    const route = routes[position++];
    const filename = route === "/" ? "index.html" : route.replace(/^\/|\/$/g, "") + "/index.html";
    try {
      const response = await fetch(origin + route, { redirect: "manual", signal: AbortSignal.timeout(30000) });
      const body = Buffer.from(await response.arrayBuffer());
      const expected = await readFile("dist/client/" + filename);
      for (const link of catalogLinks(expected.toString("utf8"))) navigationLinks.add(link);
      if (response.status !== 200 || hash(body) !== hash(expected)) failures.push(`${route}: status=${response.status}, content match=${hash(body) === hash(expected)}`);
    } catch (error) { failures.push(`${route}: ${error.message}`); }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
// Проходим именно ссылки из страниц, включая полную цепочку старых редиректов.
const pendingLinks = [...navigationLinks];
let linkPosition = 0;
async function navigationWorker() {
  while (linkPosition < pendingLinks.length) {
    const source = pendingLinks[linkPosition++];
    let path = source;
    const seen = new Set();
    try {
      for (let hop = 0; ; hop++) {
        if (seen.has(path) || hop > 5) throw new Error("redirect loop");
        seen.add(path);
        const response = await fetch(origin + path, { redirect: "manual", signal: AbortSignal.timeout(30000) });
        if ([301, 302, 307, 308].includes(response.status)) {
          const location = response.headers.get("location");
          if (!location) throw new Error("redirect without Location");
          const target = new URL(location, origin);
          if (![new URL(origin).origin, "https://optika100.com"].includes(target.origin)) throw new Error("unexpected redirect origin");
          path = target.pathname + target.search;
          continue;
        }
        if (response.status !== 200) throw new Error(`status ${response.status} at ${path}`);
        break;
      }
    } catch (error) { failures.push(`Navigation ${source}: ${error.message}`); }
  }
}
await Promise.all(Array.from({ length: 4 }, navigationWorker));
const redirectText = await readFile("deploy/redirects.production.txt", "utf8");
let redirectCount = 0;
for (const line of redirectText.split(/\r?\n/)) {
  if (!line.startsWith("RedirectMatch ")) continue;
  const match = line.match(/^RedirectMatch 301 \^(\S+?)\/\?\$\s+(\S+)$/);
  if (!match) throw new Error(`Unverified redirect pattern: ${line}`);
  const source = match[1].replace(/\\x20/g, "%20").replace(/\\([.\-])/g, "$1") + "/";
  const response = await fetch(origin + source + "?cutover_probe=1", { redirect: "manual" });
  const expected = new URL(match[2], origin);
  if (expected.protocol !== "https:") throw new Error(`Production redirect downgrades HTTPS: ${line}`);
  expected.searchParams.set("cutover_probe", "1");
  if (response.status !== 301 || response.headers.get("location") !== expected.href) {
    failures.push(`${source}: expected redirect ${expected.href}, got ${response.status} ${response.headers.get("location")}`);
  }
  redirectCount++;
}
const fragment = await fetch(origin + "/blog/pochemyMi.php/?cutover_probe=1", { redirect: "manual" });
if (fragment.status !== 301 || fragment.headers.get("location") !== "https://optika100.com/o-nas/?cutover_probe=1#pochemu-my") failures.push("Fragment redirect did not preserve query before anchor");
redirectCount++;
// Оба VX URL остаются 200: обратный 301 создал бы цикл при закешированном старом редиректе.
for (const section of ['linzy_dlya_ochkov', 'linzy_dlya_ochkov/ofisnye']) {
  const path = `/catalog_s/${section}/VX%20Start_orma_crizal_prevencia_uv_rasshirenyy_diapazon_dioptriy/`;
  const response = await fetch(origin + path + '?cutover_probe=1', {redirect:'manual'});
  const html = await response.text();
  const expected = await readFile('dist/client/' + decodeURI(path).replace(/^\//,'') + 'index.html','utf8');
  if (response.status !== 200 || html !== expected) failures.push(`Encoded product with query: ${path}`);
}
const retiredPaths = [...(routeManifest.retiredProductPaths || []), ...(routeManifest.retiredSectionPaths || [])];
for (const route of ["/o100_frontend_current/index.html", "/%6f100_frontend_current/index.html", "/o100_frontend_releases/private/index.html", "/cutover-unknown-page/", "/catalog_s/opravy/cutover-unknown-product/", "/main-v2/", "/loyalty/", ...(routeManifest.retiredRedirectTargets || []), ...retiredPaths]) {
  const response = await fetch(origin + route, {redirect:"manual"});
  if (response.status !== 404) failures.push(`${route}: expected 404, got ${response.status}`);
}
if (failures.length) throw new Error(`${failures.length} Apache failures:\n${failures.slice(0, 50).join("\n")}`);
console.log(`PASS: Apache served all ${routes.length} manifest routes byte-for-byte; ${redirectCount} exact redirects preserved targets and queries; private and unknown paths returned 404.`);
console.log(`PASS: followed ${navigationLinks.size} catalog links from rendered pages, including redirect chains.`);
console.log(`PASS: ${retiredPaths.length} retired catalog URLs returned 404.`);
