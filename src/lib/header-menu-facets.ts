import type { CatalogFacetSummary, FacetKey } from "@/lib/api/bitrix";

const FACET_KEYS = new Set<FacetKey>([
  "gender",
  "shape",
  "material",
  "construction",
  "size",
  "brand",
  "color",
  "wearMode",
  "lensType",
  "design",
  "technology",
  "purpose",
  "coating",
  "index",
  "thickness",
  "lightTransmission",
  "photochromicColor",
  "astigmatic",
  "prism",
  "pd",
  "sunLens",
  "sphere",
  "cylinder",
  "axis",
  "addition",
  "bc",
  "availability",
]);

const SAFE_QUERY_PARAMS = new Set(["expand", "page", "sort", "priceMin", "priceMax"]);

function normalizeFacetValue(value: string): string {
  const normalized = value.trim().replace(/[−–—]/g, "-").replace(",", ".");

  if (/^[+-]?\d*\.?\d+$/.test(normalized)) {
    const number = Number(normalized);
    if (Number.isFinite(number)) return Object.is(number, -0) ? "0" : String(number);
  }

  return normalized.toLocaleLowerCase("ru-RU");
}

function facetValueHasProducts(
  counts: Record<string, number> | undefined,
  requestedValue: string,
): boolean {
  if (!counts) return false;
  const requested = normalizeFacetValue(requestedValue);
  return Object.entries(counts).some(
    ([value, count]) => count > 0 && normalizeFacetValue(value) === requested,
  );
}

/**
 * Safe links (category, section, price, sort, expand) remain available without
 * a facet response. Actual facet links are exposed only after the catalog API
 * confirms at least one matching product for every selected facet.
 */
export function isHeaderMenuHrefAvailable(
  href: string,
  summary: CatalogFacetSummary | undefined,
): boolean {
  const search = new URL(href, "https://optika100.com").searchParams;
  const selectedFacets: Array<[FacetKey, string[]]> = [];

  for (const [key, value] of search.entries()) {
    if (SAFE_QUERY_PARAMS.has(key)) continue;
    if (!FACET_KEYS.has(key as FacetKey)) return false;
    const values = value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (values.length) selectedFacets.push([key as FacetKey, values]);
  }

  if (selectedFacets.length === 0) return true;
  if (!summary) return false;

  return selectedFacets.every(([key, values]) =>
    values.some((value) => facetValueHasProducts(summary.facets[key], value)),
  );
}

export function availableHeaderMenuItems<T extends { href: string }>(
  items: readonly T[],
  summary: CatalogFacetSummary | undefined,
): T[] {
  return items.filter((item) => isHeaderMenuHrefAvailable(item.href, summary));
}

export function catalogSegmentFromHref(href: string): string | undefined {
  const segments = new URL(href, "https://optika100.com").pathname.split("/").filter(Boolean);
  if (segments[0] !== "catalog_s" && segments[0] !== "catalog_n") return undefined;
  return segments[1];
}
