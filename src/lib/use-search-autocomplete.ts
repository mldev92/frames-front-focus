import { useEffect, useState } from "react";
import { searchGlobalProducts } from "@/lib/api/global-search";
import type { LensRecommendCard } from "@/lib/api/lens-recommend";
import { getSearchBrands } from "@/lib/api/search-brands";
import {
  canonicalSearchQuery,
  matchesSearchBrand,
  normalizeSearchText,
  SEARCH_ALIASES,
  type SearchBrand,
} from "@/lib/search-query";
import { searchSiteContent } from "@/data/site-search";
import type { Product } from "@/data/types";
import type { CityCode } from "@/lib/store/city";

export function useSearchAutocomplete(query: string, city: CityCode) {
  const term = canonicalSearchQuery(query);
  const enabled = query.trim().length >= 2;
  const key = `${city}:${term}`;
  const [remote, setRemote] = useState<{
    key: string;
    products: Product[];
    lenses: LensRecommendCard[];
    error: boolean;
    loading: boolean;
  }>({ key: "", products: [], lenses: [], error: false, loading: false });
  const [directory, setDirectory] = useState<{
    city: CityCode;
    brands: SearchBrand[];
    partial: boolean;
  }>();

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void getSearchBrands(city).then((result) => {
      if (active) setDirectory({ city, ...result });
    });
    return () => {
      active = false;
    };
  }, [city, enabled]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const debounce = setTimeout(() => {
      setRemote({ key, products: [], lenses: [], error: false, loading: true });
      timeout = setTimeout(() => controller.abort(), 4000);
      void searchGlobalProducts(term, city, 6, controller.signal)
        .then(
          ({ products, lenses, partial }) => {
            if (active) setRemote({ key, products, lenses, error: partial, loading: false });
          },
          () => {
            if (active) setRemote({ key, products: [], lenses: [], error: true, loading: false });
          },
        )
        .finally(() => clearTimeout(timeout));
    }, 250);
    return () => {
      active = false;
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [term, key, city, enabled]);

  const products = enabled && remote.key === key ? remote.products : [];
  const knownBrands = [
    ...(directory?.city === city ? directory.brands : []),
    ...products.map((product) => ({ name: product.brand, category: product.category })),
    // Региональный API иногда не заполняет бренд и не поддерживает его фасет.
    ...products
      .filter((product) => !product.brand)
      .flatMap((product) =>
        SEARCH_ALIASES.filter((entry) =>
          normalizeSearchText(product.name).includes(`${normalizeSearchText(entry.name)} `),
        ).map((entry) => ({ name: entry.name, category: product.category, searchOnly: true })),
      ),
  ];
  const brands = enabled
    ? [...new Map(knownBrands.map((brand) => [`${brand.category}:${brand.name}`, brand])).values()]
        .filter((brand) => brand.name && matchesSearchBrand(brand.name, query))
        .slice(0, 3)
    : [];
  const pages = enabled
    ? searchSiteContent(query, 30)
        .filter((page) => city === "spb" || page.region !== "spb")
        .slice(0, 4)
    : [];
  return {
    enabled,
    brands,
    products,
    lenses: enabled && remote.key === key ? remote.lenses : [],
    pages,
    loading: enabled && (remote.key !== key || remote.loading || directory?.city !== city),
    productError: enabled && remote.key === key && remote.error,
    brandError: enabled && directory?.city === city && directory.partial,
  };
}
