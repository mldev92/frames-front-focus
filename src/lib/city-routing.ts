import { regionalCatalogHref } from "@/data/categories";
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
  ["/linzy-spb", "/catalog_n/kontaktnye_linzy_/"],
  ["/linzy-spb/", "/catalog_n/kontaktnye_linzy_/"],
  ["/tsvetnye-linzy-s-dioptriyami", "/catalog_n/kontaktnye_linzy_/tsvetnye/"],
  ["/tsvetnye-linzy-s-dioptriyami/", "/catalog_n/kontaktnye_linzy_/tsvetnye/"],
  ["/biometriya-glaza", "/kabinet-diagnostiki-nk/"],
  ["/biometriya-glaza/", "/kabinet-diagnostiki-nk/"],
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
  const pathname = regionalSiteHref(location.pathname, city);
  return `${pathname}${location.search}${location.hash}`;
}
