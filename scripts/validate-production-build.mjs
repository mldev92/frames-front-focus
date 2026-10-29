if (process.env.O100_PRERENDER_LIMIT || process.env.O100_PRERENDER_ROUTES) throw new Error("Production validation requires the complete manifest");
if (process.env.VITE_VIRTUAL_TRY_ON === "true" || process.env.VITE_ALLOW_FIXTURES === "true" || process.env.VITE_PRIVATE_BETA === "true") throw new Error("Unsafe production flags");
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { catalogLinks, redirectPaths } from "./catalog-link-check.mjs";
import { catalogHtmlProblems } from "./catalog-html-validation.mjs";

const manifest = JSON.parse(
  await readFile(new URL("../generated/production-routes.json", import.meta.url), "utf8"),
);
const routes = manifest.routes;
const clientDir = new URL("../dist/client/", import.meta.url);
for (const prototype of ["main-v2/index.html", "loyalty/index.html"]) {
  if (existsSync(new URL(prototype, clientDir))) throw new Error(`Prototype page in production artifact: ${prototype}`);
}
const missing = routes.filter((route) => {
  const relative = route === "/" ? "index.html" : `${route.replace(/^\/|\/$/g, "")}/index.html`;
  return !existsSync(new URL(relative, clientDir));
});

for (const required of ["index.html", "_shell.html", "404.html", "sitemap.xml", "robots.txt"]) {
  if (!existsSync(new URL(required, clientDir))) missing.push(`release asset: ${required}`);
}

if (missing.length) {
  throw new Error(`Production build is missing ${missing.length} required outputs:\n${missing.join("\n")}`);
}

console.log(`Validated ${routes.length} prerendered production routes and release assets.`);

const shell = await readFile(new URL("_shell.html", clientDir), "utf8");
if (!shell.includes('id="$tsr-stream-barrier"')) throw new Error("Production SPA shell is missing the TanStack bootstrap barrier");

const home = await readFile(new URL("index.html", clientDir), "utf8");
const robots = await readFile(new URL("robots.txt", clientDir), "utf8");
if (robots !== await readFile(new URL("../deploy/robots.production.txt", import.meta.url), "utf8")) throw new Error("Production robots policy differs from reviewed baseline");
if (/<meta[^>]+(?:noindex|nofollow)/i.test(home) || /Disallow:\s*\/\s*$/m.test(robots)) throw new Error("Production home or robots still blocks indexing");
if (/beta\.optika100\.com/.test(await readFile(new URL("sitemap.xml", clientDir), "utf8"))) throw new Error("Beta URLs in production sitemap");

const invalid = [];
const knownCatalogPaths = new Set([
  ...routes,
  ...redirectPaths(await readFile(new URL("../deploy/redirects.production.txt", import.meta.url), "utf8")),
  // Этот точный редирект записан в mod_rewrite, чтобы сохранить пробел и query.
  "/catalog_s/linzy_dlya_ochkov/ofisnye/VX Start_orma_crizal_prevencia_uv_rasshirenyy_diapazon_dioptriy/",
]);
const brokenCatalogLinks = new Map();
for (const route of routes) {
  const relative = route === "/" ? "index.html" : `${route.replace(/^\/|\/$/g, "")}/index.html`;
  const html = await readFile(new URL(relative, clientDir), "utf8");
  if (/^\/catalog_[sn]\//.test(route)) {
    for (const problem of catalogHtmlProblems(html)) invalid.push(`${route}: ${problem}`);
  }
  for (const href of catalogLinks(html)) {
    if (!knownCatalogPaths.has(href) && !brokenCatalogLinks.has(href)) brokenCatalogLinks.set(href, route);
  }
  const privatePage = /^\/(?:basket|checkout|personal|search)(?:\/|$)/.test(route);
  // Эти юридические страницы намеренно закрыты от индексации в исходной витрине.
  const legalPage = ["/politika-konfidentsialnosti/", "/requisites/"].includes(route);
  const title = html.match(/<title[^>]*>(.*?)<\/title>/s)?.[1];
  if (!title || /^(?:404\b|Страница не найдена|Ошибка)/i.test(title)) invalid.push(`${route}: error title`);
  if ((!privatePage && !legalPage && /<meta[^>]+noindex/i.test(html)) || /<meta[^>]+nofollow/i.test(html)) invalid.push(`${route}: blocked indexing`);
  const canonicals = [...html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];
  if (canonicals.length !== 1 || !/href=["']https:\/\/optika100\.com\//.test(canonicals[0]?.[0] ?? "")) invalid.push(`${route}: canonical missing or ambiguous`);
  if (/<h[12][^>]*>(?:Страница не найдена|Что-то пошло не так)<\/h[12]>/.test(html)) invalid.push(`${route}: rendered error page`);
}
if (brokenCatalogLinks.size) throw new Error(
  `Unverified catalog links in rendered pages (${brokenCatalogLinks.size}):\n` +
  [...brokenCatalogLinks].slice(0, 50).map(([href, source]) => `${source} -> ${href}`).join("\n"),
);
if (invalid.length) throw new Error(`Production metadata validation failed:\n${invalid.join("\n")}`);
console.log(`Validated title, canonical and indexing on all ${routes.length} routes.`);
