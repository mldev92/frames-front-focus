import { mkdir, readFile, writeFile } from "node:fs/promises";
import { redirectTargets } from "./catalog-link-check.mjs";
import { reconcileRetiredProducts } from "./reconcile-retired-products.mjs";

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
  "/podbor-linz/",
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
  "/biometriya-glaza/",
  "/linzy-spb/",
  "/optika-spb/",
  "/tsvetnye-linzy-s-dioptriyami/",
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
    .map((line) => {
      const direct = line.match(/^Redirect\s+301\s+(\S+)\s+\S+/)?.[1];
      if (direct) return direct;
      const exact = line.match(/^RedirectMatch\s+301\s+\^(\S+?)\/\?\$\s+\S+/)?.[1];
      return exact?.replace(/\\x20/g, "%20").replace(/\\([.\-])/g, "$1");
    })
    .filter(Boolean)
    .map((path) => normalizePath(path)),
);
// Эти два точных редиректа используют mod_rewrite для корректных fragment/пробела.
for (const source of ["/blog/pochemyMi.php/", "/catalog_s/linzy_dlya_ochkov/ofisnye/VX%20Start_orma_crizal_prevencia_uv_rasshirenyy_diapazon_dioptriy/"]) redirectSources.add(normalizePath(source));

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
  for (const city of ["spb", "nvk"]) {
    const response = await fetch(`${origin}/api/store/catalog_sections.php?city=${city}`);
    if (!response.ok) throw new Error(`Catalog sections ${city}: ${response.status}`);
    const data = await response.json();
    if (data.city !== city || !data.sections?.length) throw new Error(`Empty section tree: ${city}`);
    for (const section of data.sections) {
      const path = normalizePath(section.path);
      if (!path?.startsWith(city === "nvk" ? "/catalog_n/" : "/catalog_s/")) throw new Error("Invalid regional section");
      paths.add(path);
      regionalSectionPaths.add(path);
    }
  }
  // Общий подбор очковых линз доступен в обоих городах.
  paths.add("/catalog_n/linzy_dlya_ochkov/");
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
        if (canonical) {
          paths.add(canonical);
          // Меню и хлебные крошки используют настоящее дерево, а не старые
          // сокращённые адреса разделов из sitemap.
          const parts = canonical.split("/").filter(Boolean);
          for (let length = 2; length < parts.length; length++) paths.add(`/${parts.slice(0, length).join("/")}/`);
        }
      }
      page += 1;
    } while (page <= pages);
  }
  return paths;
}

const routeSet = new Set([...staticRoutes, ...articleRoutes]);
const regionalSectionPaths = new Set();
const legacyPaths = await sitemapPaths();
console.log(`Read ${legacyPaths.size} paths from the live legacy sitemap.`);
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
console.log(`Collected ${routeSet.size} sitemap, native section and current catalog paths.`);

// Старый sitemap не перечисляет все согласованные SEO-адреса. Без них полная
// карточка может отвечать 301, а конечный короткий URL — 404 или циклом fallback.
const destinations = redirectTargets(redirectText);
destinations.add("/catalog_s/linzy_dlya_ochkov/VX Start_orma_crizal_prevencia_uv_rasshirenyy_diapazon_dioptriy/");
const missingTargets = [...destinations].filter((path) => !routeSet.has(path) && !redirectSources.has(path));
// Проверено в Bitrix 20.10.2026: элементы 24669 и 49976 имеют ACTIVE=N.
// Не создаём успешную карточку для снятых товаров; реальные ссылки на них
// по-прежнему отклоняются полной проверкой переходов Apache.
const reviewedInactiveTargets = new Set([
  "/catalog_s/linzy_dlya_ochkov/fsv_1_5_uc/",
  "/catalog_s/solntsezashchitnye_ochki/solntsezashchitnye_ochki_ray_ban_3025_aviator_large_metal_9196af58/",
]);
const retiredRedirectTargets = [];
let targetPosition = 0;
let validatedTargets = 0;
async function validateRedirectTarget() {
  while (targetPosition < missingTargets.length) {
    const path = missingTargets[targetPosition++];
    const parts = path.split("/").filter(Boolean);
    if (!/^catalog_[sn]$/.test(parts[0]) || parts.length < 3) throw new Error(`Unverified redirect target: ${path}`);
    const slug = parts.at(-1);
    const params = new URLSearchParams({slug, city: parts[0] === "catalog_n" ? "nvk" : "spb", section: parts.slice(1, -1).join("/")});
    const response = await fetch(`${origin}/api/store/product.php?${params}`, {signal: AbortSignal.timeout(30000)});
    if (response.status === 404 && reviewedInactiveTargets.has(path)) {
      retiredRedirectTargets.push(path);
      continue;
    }
    if (!response.ok) throw new Error(`Redirect target product unavailable: ${path} (${response.status})`);
    const product = await response.json();
    if (!product.id || product.slug !== slug) throw new Error(`Redirect target identity mismatch: ${path}`);
    routeSet.add(path);
    validatedTargets++;
    if (validatedTargets % 50 === 0) console.log(`Validated ${validatedTargets}/${missingTargets.length} additional SEO destinations.`);
  }
}
await Promise.all(Array.from({length: 4}, validateRedirectTarget));
console.log(`Validated ${missingTargets.length - retiredRedirectTargets.length} additional SEO destinations; ${retiredRedirectTargets.length} confirmed inactive products retain 404.`);

const reviewedRetired = JSON.parse(await readFile(new URL("../deploy/reviewed-retired-products.json", import.meta.url), "utf8"));
const seoRequired = JSON.parse(await readFile(new URL("../deploy/seo-required-products.json", import.meta.url), "utf8"));
// URL из GSC и внутренних ссылок проверяем отдельно от списков наличия.
for (const path of seoRequired.paths) routeSet.add(path);
const reviewedPaths = [...new Set([...reviewedRetired.paths, ...seoRequired.paths])];
const retiredProductPaths = await reconcileRetiredProducts(routeSet, reviewedPaths, origin);
console.log(`Rechecked ${reviewedPaths.length} audited products; ${retiredProductPaths.length} return 404 and are omitted.`);
// Снятые разделы проверяем по дереву, а не по наличию товаров.
const reviewedSections = JSON.parse(await readFile(new URL("../deploy/reviewed-retired-sections.json", import.meta.url), "utf8"));
const retiredSectionPaths = reviewedSections.paths.filter((path) => !regionalSectionPaths.has(path));
for (const path of retiredSectionPaths) routeSet.delete(path);
const routes = [...routeSet].filter((path) => !redirectSources.has(path)).sort((a, b) => a.localeCompare(b, "ru"));
const sitemapSeo = new Map([
  ["/linzy-spb/", { priority: "0.7", changefreq: "weekly" }],
  ["/optika-spb/", { priority: "0.7", changefreq: "weekly" }],
  ["/tsvetnye-linzy-s-dioptriyami/", { priority: "0.6", changefreq: "monthly" }],
  ["/biometriya-glaza/", { priority: "0.6", changefreq: "monthly" }],
]);
const generatedAt = new Date().toISOString();
const snapshot = { version: 1, generatedAt, origin, count: routes.length, routes, retiredRedirectTargets: retiredRedirectTargets.sort(), retiredProductPaths, retiredSectionPaths };

await mkdir(outputDir, { recursive: true });
await mkdir(publicDir, { recursive: true });
await writeFile(new URL("production-routes.json", outputDir), `${JSON.stringify(snapshot, null, 2)}\n`);

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.filter((path) => !/^\/(?:basket|checkout|personal|search)(?:\/|$)/.test(path)
    && !["/politika-konfidentsialnosti/", "/requisites/"].includes(path)).map((path) => {
    const seo = sitemapSeo.get(path);
    if (!seo) return `  <url><loc>${origin}${path}</loc></url>`;
    return `  <url><loc>${origin}${path}</loc><changefreq>${seo.changefreq}</changefreq><priority>${seo.priority}</priority></url>`;
  }),
  "</urlset>",
  "",
].join("\n");
await writeFile(new URL("sitemap.xml", publicDir), sitemap);
await writeFile(
  new URL("robots.txt", publicDir),
  await readFile(new URL("../deploy/robots.production.txt", import.meta.url), "utf8"),
);
console.log(`Generated ${routes.length} production routes at ${generatedAt}`);
