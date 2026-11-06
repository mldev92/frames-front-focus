import { searchProducts } from "./bitrix";
import { fetchLensSearch } from "./lens-recommend";
import { canonicalSearchQuery } from "@/lib/search-query";
import type { CityCode } from "@/lib/store/city";

export async function searchGlobalProducts(
  query: string,
  city: CityCode,
  limit: number,
  signal: AbortSignal,
) {
  const term = canonicalSearchQuery(query);
  const [catalog, lenses] = await Promise.allSettled([
    searchProducts(term, limit, { city, signal }),
    term.length >= 2
      ? fetchLensSearch(term, { limit, city }, signal)
      : Promise.resolve({ matches: [] }),
  ]);
  return {
    // Очковые линзы берём из общей базы подборщика, а не из старых карточек Bitrix.
    products:
      catalog.status === "fulfilled"
        ? catalog.value.filter((product) => product.category !== "linzy-dlya-ochkov")
        : [],
    lenses: lenses.status === "fulfilled" ? lenses.value.matches : [],
    partial: catalog.status === "rejected" || lenses.status === "rejected",
  };
}
