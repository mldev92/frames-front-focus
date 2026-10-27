import { regionalCatalogHref, catalogHref, categoryForCatalogPath } from "@/data/categories";
import { diagnosticsHref } from "@/data/services";
import type { CityCode } from "@/lib/store/city";

const DIAGNOSTICS_PATHS = new Set([
  "/kabinet-diagnostiki-spb",
  "/kabinet-diagnostiki-spb/",
  "/kabinet-diagnostiki-nk",
  "/kabinet-diagnostiki-nk/",
]);

const NVK_ROUTE_FALLBACKS = new Map<string, string>([
  ["/optika-spb", "/contacts/"],
  ["/optika-spb/", "/contacts/"],
  ["/tsvetnye-linzy-s-dioptriyami", "/catalog_n/kontaktnye_linzy/tsvetnye/"],
  ["/tsvetnye-linzy-s-dioptriyami/", "/catalog_n/kontaktnye_linzy/tsvetnye/"],
  ["/biometriya-glaza", "/kabinet-diagnostiki-nk/"],
  ["/biometriya-glaza/", "/kabinet-diagnostiki-nk/"],
  // Блок «Специальные предложения» на главной — акции Санкт-Петербурга и в Новокузнецке не выводится;
  // там акция — блок контактных линз, к нему и ведут ссылки «Все Акции».
  ["/#promotions", "/#lens-promo"],
]);

export function regionalSiteHref(href: string, city: CityCode) {
  if (DIAGNOSTICS_PATHS.has(href)) return diagnosticsHref(city);
  if (city === "nvk") {
    const fallback = NVK_ROUTE_FALLBACKS.get(href);
    if (fallback) return fallback;
  }
  return regionalCatalogHref(href, city);
}

export function regionalLocationHref(
  location: Pick<Location, "pathname" | "search" | "hash">,
  city: CityCode,
) {
  // Ассортимент и коды товаров городов различаются: переключение города
  // возвращает в соответствующую категорию, не выдумывает адрес другого товара.
  if (/^\/catalog_[sn]\//.test(location.pathname)) {
    const currentCity = location.pathname.startsWith("/catalog_n/") ? "nvk" : "spb";
    if (currentCity === city) return `${location.pathname}${location.search}${location.hash}`;
    const category = categoryForCatalogPath(location.pathname);
    if (category) return catalogHref(category, city);
  }
  const pathname = regionalSiteHref(location.pathname, city);
  return `${pathname}${location.search}${location.hash}`;
}
