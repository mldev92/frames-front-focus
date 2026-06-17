import { mkdir, readFile, writeFile } from "node:fs/promises";

const origin = (process.env.VITE_BITRIX_API || "https://optika100.com").replace(/\/$/, "");
const outputDir = new URL("../generated/", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const excludedPrefixes = [
  "/api/",
  "/auth/",
  "/bitrix/",
  "/sale/",
  "/upload/",
  "/personal/order/",
  "/1c_exchange/",
];
const excludedExact = new Set([
  "/sitemap.xml",
  "/robots.txt",
]);
const staticRoutes = [
  "/",
  "/basket/",
  "/checkout/",
  "/contacts/",
  "/o-nas/",
  "/payment/",
  "/personal/",
  "/personal/orders/",
  "/personal/private/",
  "/podbor-ochkov/",
  "/politika-konfidentsialnosti/",
  "/remont-ochkov/",
  "/requisites/",
  "/search/",
  "/stellest-katalog-s-linzami/",
  "/tinkoff/",
  "/uslugi/",
  "/uslugi/priem-vracha/",
  "/uslugi/diagnostika/",
  "/uslugi/podbor-ochkov/",
  "/uslugi/remont/",
  "/warranty/",
  "/kabinet-diagnostiki-spb/",
  "/kabinet-diagnostiki-nk/",
  "/blog/",
  "/blog/linzy-dlya-ochkov/",
];
const articleContent = JSON.parse(
  await readFile(new URL("../src/data/articles-content.json", import.meta.url), "utf8"),
);
const articleRoutes = [
  "/blog/linzy-dlya-ochkov/pokrytiya-linz-dlya-ochkov/",
  ...Object.keys(articleContent).map((slug) => `/blog/linzy-dlya-ochkov/${slug}/`),
];
const redirectText = await readFile(
  new URL("../deploy/redirects.production.txt", import.meta.url),
  "utf8",
);
const redirectSources = new Set(
  redirectText
    .split(/\r?\n/)
    .map((line) => line.match(/^Redirect\s+301\s+(\S+)\s+\S+/)?.[1])
    .filter(Boolean)
    .map((path) => normalizePath(path)),
);

function normalizePath(value) {
  const url = new URL(value, origin);
  if (url.origin !== new URL(origin).origin) return null;
  const decoded = decodeURI(url.pathname).replace(/\/{2,}/g, "/");
  const path = decoded === "/" ? "/" : `${decoded.replace(/\/$/, "")}/`;
  if (excludedExact.has(path) || excludedPrefixes.some((prefix) => path.startsWith(prefix))) {
    return null;
  }
  if (/\.(?:xml|php|txt|json|jpg|jpeg|png|webp|svg|pdf|zip)$/i.test(path)) return null;
  return path;
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { "User-Agent": "Optika100 production manifest builder" } });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function sitemapPaths() {
  const pending = [`${origin}/sitemap.xml`];
  const visited = new Set();
  const paths = new Set();
  while (pending.length) {
    const sitemap = pending.shift();
    if (!sitemap || visited.has(sitemap)) continue;
    visited.add(sitemap);
    const xml = await fetchText(sitemap);
    const locations = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) =>
      match[1].replace(/&amp;/g, "&"),
    );
    for (const location of locations) {
      if (/\.xml(?:\?|$)/i.test(location)) {
        pending.push(location);
        continue;
      }
      const path = normalizePath(location);
      if (path) paths.add(path);
    }
  }
  return paths;
}

async function catalogPaths() {
  const categories = [
    ["spb", "catalog_s", "opravy"],
    ["spb", "catalog_s", "solntsezashchitnye_ochki"],
    ["spb", "catalog_s", "kontaktnye_linzy_"],
    ["spb", "catalog_s", "linzy_dlya_ochkov"],
    ["spb", "catalog_s", "soputstvuyushchie_tovary"],
    ["nvk", "catalog_n", "opravy"],
    ["nvk", "catalog_n", "solntsezashchitnye_ochki"],
    ["nvk", "catalog_n", "kontaktnye_linzy"],
    ["nvk", "catalog_n", "soputstvuyushchie_tovary"],
  ];
  const paths = new Set();
  for (const [city, namespace, category] of categories) {
    paths.add(`/${namespace}/${category}/`);
    let page = 1;
    let pages = 1;
    do {
      const params = new URLSearchParams({
        category,
        city,
        page: String(page),
        limit: "96",
      });
      if (city === "spb") params.set("v2", "1");
      const response = await fetch(`${origin}/api/store/products.php?${params}`);
      if (!response.ok) throw new Error(`catalog ${city}/${category} returned ${response.status}`);
      const data = await response.json();
      pages = Math.max(1, Number(data.pages) || 1);
      for (const product of data.products || []) {
        const canonical = normalizePath(product.canonicalPath || `/${namespace}/${category}/${product.slug}/`);
        if (canonical) paths.add(canonical.replace(/^\/catalog_s\//, `/${namespace}/`));
      }
      page += 1;
    } while (page <= pages);
  }
  return paths;
}

const routeSet = new Set([...staticRoutes, ...articleRoutes]);
const legacyPaths = await sitemapPaths();
for (const path of legacyPaths) {
  if (redirectSources.has(path)) continue;
  const isCatalog = path.startsWith("/catalog_s/") || path.startsWith("/catalog_n/");
  if (isCatalog || routeSet.has(path)) {
    routeSet.add(path);
    continue;
  }
  throw new Error(`Legacy sitemap path has no React route or reviewed redirect: ${path}`);
}
for (const path of await catalogPaths()) routeSet.add(path);

const routes = [...routeSet].sort((a, b) => a.localeCompare(b, "ru"));
const generatedAt = new Date().toISOString();
const snapshot = { version: 1, generatedAt, origin, count: routes.length, routes };

await mkdir(outputDir, { recursive: true });
await mkdir(publicDir, { recursive: true });
await writeFile(new URL("production-routes.json", outputDir), `${JSON.stringify(snapshot, null, 2)}\n`);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((path) => `  <url><loc>${origin}${path}</loc></url>`),
  "</urlset>",
  "",
].join("\n");
await writeFile(new URL("sitemap.xml", publicDir), sitemap);
await writeFile(
  new URL("robots.txt", publicDir),
  `User-agent: *\nAllow: /\nDisallow: /personal/\nDisallow: /checkout/\nSitemap: ${origin}/sitemap.xml\n`,
);
console.log(`Generated ${routes.length} production routes at ${generatedAt}`);
