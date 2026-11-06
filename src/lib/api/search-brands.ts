import { getCatalogFacetSummary } from "./bitrix";
import type { Category } from "@/data/types";
import type { CityCode } from "@/lib/store/city";
import type { SearchBrand } from "@/lib/search-query";

const categories: Array<[string, Category]> = [
  ["opravy", "opravy"],
  ["solntsezashchitnye_ochki", "solntsezashchitnye"],
  ["kontaktnye_linzy_", "kontaktnye-linzy"],
];
const cache = new Map<
  CityCode,
  { expires: number; request: Promise<{ brands: SearchBrand[]; partial: boolean }> }
>();

export function getSearchBrands(city: CityCode) {
  const cached = cache.get(city);
  if (cached && cached.expires > Date.now()) return cached.request;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  const request = Promise.allSettled(
    categories.map(async ([segment, category]) => {
      const summary = await getCatalogFacetSummary(segment, city, controller.signal);
      return Object.entries(summary.facets.brand ?? {})
        .filter(([, count]) => count > 0)
        .map(([name]) => ({ name, category }));
    }),
  )
    .then((results) => {
      const partial = results.some((result) => result.status === "rejected");
      if (partial) cache.delete(city);
      return {
        brands: results.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
        partial,
      };
    })
    .finally(() => clearTimeout(timeout));
  cache.set(city, { expires: Date.now() + 5 * 60_000, request });
  return request;
}
