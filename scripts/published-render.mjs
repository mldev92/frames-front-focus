import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import path from "node:path";
import server from "../dist/server/server.js";
import { publishedMatches, routeFile } from "./published-page.mjs";
import { catalogHtmlProblems } from "./catalog-html-validation.mjs";
import { catalogLinks, redirectPaths } from "./catalog-link-check.mjs";

const [index, count] = process.argv.slice(2).map(Number);
const { routes } = JSON.parse(await readFile("generated/production-routes.json"));
const parent = process.env.O100_PUBLISHED_DIR;
const manifest = JSON.parse(await readFile(path.join(parent, "release-manifest.json")));
const allowed = new Set([
  ...routes,
  ...redirectPaths(await readFile("deploy/redirects.production.txt", "utf8")),
]);
const identity = /data-catalog-product-id=["'](\d+)["']/;
const canonical = /<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/gi;
const canonicals = (html) => Array.from(html.matchAll(canonical), (m) => m[1]);
let networkRequest = false;
globalThis.fetch = () => {
  networkRequest = true;
  throw Error("Network request during offline rendering");
};

async function render(route) {
  let url = new URL(route, "http://localhost");
  const pathname = url.pathname;
  const seen = new Set();
  while (seen.size < 5 && !seen.has(url.href)) {
    seen.add(url.href);
    const response = await server.fetch(new Request(url));
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    if (!location) break;
    url = new URL(location, url);
    // Загрузчик поиска нормализует query перед рендером того же маршрута.
    if (url.origin !== "http://localhost" || url.pathname !== pathname) break;
  }
  throw Error("Unexpected redirect while rendering " + route);
}

for (let i = index; i < routes.length; i += count) {
  const route = routes[i],
    file = routeFile(route);
  try {
    const bytes = await readFile(path.join(parent, file));
    if (createHash("sha256").update(bytes).digest("hex") !== manifest.files[file])
      throw Error("Published checksum mismatch");
    const source = bytes.toString("utf8");
    const response = await render(route);
    if (response.status !== 200 || !response.headers.get("content-type")?.includes("text/html"))
      throw Error("Unexpected SSR response " + response.status);
    const html = await response.text();
    if (networkRequest) throw Error("Unexpected network dependency");
    if (!isDeepStrictEqual(publishedMatches(source), publishedMatches(html)))
      throw Error("Route or catalog data changed");
    if (route.startsWith("/catalog_") && catalogHtmlProblems(html).length)
      throw Error("Invalid catalog HTML");
    if (source.match(identity)?.[1] !== html.match(identity)?.[1])
      throw Error("Product identity changed");
    if (!isDeepStrictEqual(canonicals(source), canonicals(html)))
      throw Error("Canonical route changed");
    if (!html.includes('type="module"') || !html.includes('id="$tsr-stream-barrier"'))
      throw Error("Missing hydration assets");
    for (const link of catalogLinks(html))
      if (!allowed.has(link)) throw Error("Unknown catalog link: " + link);
    const output = path.join("dist/client", file);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, html);
    if (i % (count * 500) === 0)
      console.log("Rendering published routes:", i + 1, "/", routes.length);
  } catch (error) {
    throw Error("Offline render failed at " + route, { cause: error });
  }
}
