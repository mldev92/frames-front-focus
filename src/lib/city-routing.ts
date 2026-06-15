import { regionalCatalogHref } from "@/data/categories";
import { diagnosticsHref } from "@/data/services";
import type { CityCode } from "@/lib/store/city";

const DIAGNOSTICS_PATHS = new Set([
  "/kabinet-diagnostiki-spb",
  "/kabinet-diagnostiki-spb/",
  "/kabinet-diagnostiki-nk",
  "/kabinet-diagnostiki-nk/",
]);

export function regionalSiteHref(href: string, city: CityCode) {
  if (DIAGNOSTICS_PATHS.has(href)) return diagnosticsHref(city);
  return regionalCatalogHref(href, city);
}

export function regionalLocationHref(
  location: Pick<Location, "pathname" | "search" | "hash">,
  city: CityCode,
) {
  const pathname = regionalSiteHref(location.pathname, city);
  return `${pathname}${location.search}${location.hash}`;
}
