import type { CatalogPage, CatalogQuery } from "./api/bitrix";
import { matchesSearchBrand } from "./search-query.ts";
import { frameBrandForName, frameBrandForPath } from "../data/frame-brand-landings.ts";
import { frameCategoryForPath } from "../data/frame-category-landings.ts";

export const WOMENS_FRAMES_PATH = "opravy/zhenskie";

export function frameLanding(path: string) {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  if (normalized === WOMENS_FRAMES_PATH) return "women";
  if (frameBrandForPath(normalized)) return "brand";
  if (frameCategoryForPath(normalized)) return "category";
  return undefined;
}

export function frameLandingQuery(path: string, query: CatalogQuery): CatalogQuery {
  const brand = frameBrandForPath(path);
  return brand ? { ...query, filters: { ...query.filters, brand: [brand.brand] } } : query;
}

export function frameBrandHref(brand: string, sectionPath = WOMENS_FRAMES_PATH) {
  const landing = frameBrandForName(brand);
  return landing
    ? `/catalog_s/opravy/${landing.slug}/`
    : `/catalog_s/${sectionPath}/?brand=${encodeURIComponent(brand)}`;
}

export function frameLandingTitle(path: string) {
  const brand = frameBrandForPath(path);
  return brand
    ? `Оправы ${brand.name} в Санкт-Петербурге`
    : (frameCategoryForPath(path)?.title ?? "Женские оправы для очков");
}

export function frameApiSection(path: string) {
  return frameBrandForPath(path) ? "opravy" : (frameCategoryForPath(path)?.section ?? "zhenskie");
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
