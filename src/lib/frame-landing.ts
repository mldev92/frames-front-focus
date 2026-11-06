import type { CatalogPage, CatalogQuery } from "./api/bitrix";
import { matchesSearchBrand } from "./search-query.ts";

export const WOMENS_FRAMES_PATH = "opravy/zhenskie";
export const LIONS_HEART_PATH = "opravy/lions-heart";
export const LIONS_HEART_BRAND = "LION`S HEART";

export function frameLanding(path: string) {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  if (normalized === WOMENS_FRAMES_PATH) return "women";
  if (normalized === LIONS_HEART_PATH) return "brand";
  return undefined;
}

export function frameLandingQuery(path: string, query: CatalogQuery): CatalogQuery {
  return frameLanding(path) === "brand"
    ? { ...query, filters: { ...query.filters, brand: [LIONS_HEART_BRAND] } }
    : query;
}

export function frameBrandHref(brand: string) {
  return brand === LIONS_HEART_BRAND
    ? `/catalog_s/${LIONS_HEART_PATH}/`
    : `/catalog_s/${WOMENS_FRAMES_PATH}/?brand=${encodeURIComponent(brand)}`;
}

export function matchesFrameBrand(brand: string, query: string) {
  return matchesSearchBrand(brand, query);
}

export function frameFacetEntries(data: CatalogPage, facet: "brand" | "shape" | "material") {
  return Object.entries(data.facets[facet] ?? {})
    .filter(([, count]) => Number.isFinite(count) && count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"));
}

export function framePriceRange(data: CatalogPage) {
  const { min, max } = data.priceBounds;
  const format = (price: number) => `${price.toLocaleString("ru-RU")} ₽`;
  if (!data.total || !Number.isFinite(min) || min <= 0 || !Number.isFinite(max) || max < min)
    return undefined;
  return min === max ? format(min) : `от ${format(min)} до ${format(max)}`;
}
