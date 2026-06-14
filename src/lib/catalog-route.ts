import { z } from "zod";
import {
  getCatalogPage,
  getProduct,
  getRelated,
  IndexNotReadyError,
  type CatalogPage as CatalogPageData,
  type CatalogQuery,
  type FacetKey,
} from "@/lib/api/bitrix";
import type { CityCode } from "@/lib/store/city";
import type { Product } from "@/data/types";
import type { CatalogStateChange } from "@/components/CatalogListing";

const numOrStr = z
  .preprocess((value) => (typeof value === "number" ? String(value) : value), z.string())
  .optional();

export const FACET_PARAMS = [
  "gender", "color", "shape", "size", "brand", "material", "construction",
  "wearMode", "lensType", "design", "technology", "purpose", "coating",
  "index", "sphere", "cylinder", "axis", "addition", "bc", "availability",
] as const satisfies readonly FacetKey[];

export const catalogSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  sort: z.enum(["price_asc", "price_desc", "name"]).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  gender: z.string().optional(),
  color: z.string().optional(),
  shape: z.string().optional(),
  size: z.string().optional(),
  brand: z.string().optional(),
  material: z.string().optional(),
  construction: z.string().optional(),
  wearMode: z.string().optional(),
  lensType: z.string().optional(),
  design: z.string().optional(),
  technology: z.string().optional(),
  purpose: z.string().optional(),
  coating: z.string().optional(),
  index: numOrStr,
  sphere: numOrStr,
  cylinder: numOrStr,
  axis: numOrStr,
  addition: numOrStr,
  bc: numOrStr,
  availability: z.string().optional(),
});

export type CatalogSearch = z.infer<typeof catalogSearchSchema>;

export function searchToFilters(search: CatalogSearch): Partial<Record<FacetKey, string[]>> {
  const filters: Partial<Record<FacetKey, string[]>> = {};
  for (const key of FACET_PARAMS) {
    const value = search[key];
    if (typeof value !== "string" || value.trim() === "") continue;
    const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
    if (parts.length) filters[key] = parts;
  }
  return filters;
}

export type LoaderResult =
  | { state: "ok"; data: CatalogPageData }
  | { state: "index_not_ready" }
  | { state: "error"; message: string };

export async function loadCatalogPage(
  section: string,
  search: CatalogSearch,
  city: CityCode,
  signal?: AbortSignal,
): Promise<LoaderResult> {
  const query: CatalogQuery = {
    page: search.page ?? 1,
    limit: 24,
    sort: search.sort ?? "default",
    priceMin: search.priceMin,
    priceMax: search.priceMax,
    city,
    filters: searchToFilters(search),
  };
  try {
    const data = await getCatalogPage(section, query, signal);
    return { state: "ok", data };
  } catch (error) {
    if (error instanceof IndexNotReadyError) return { state: "index_not_ready" };
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return { state: "error", message: error instanceof Error ? error.message : String(error) };
  }
}

export type ResolvedCatalogRoute =
  | {
      kind: "catalog";
      sectionPath: string;
      section: string;
      legacyFilterPath?: string;
      result: LoaderResult;
    }
  | {
      kind: "product";
      sectionPath: string;
      data: { product: Product; related: Product[] };
    };

export async function resolveCatalogRoute(
  splat: string,
  search: CatalogSearch,
  city: CityCode,
  signal?: AbortSignal,
): Promise<ResolvedCatalogRoute | null> {
  const segments = splat.split("/").filter(Boolean);
  const filterIndex = segments.indexOf("filter");
  const sectionSegments = filterIndex >= 0 ? segments.slice(0, filterIndex) : segments;
  const legacyFilterPath = filterIndex >= 0 ? segments.slice(filterIndex + 1).join("/") : undefined;
  if (sectionSegments.length === 0) return null;

  if (!legacyFilterPath && sectionSegments.length >= 2) {
    const slug = sectionSegments.at(-1) ?? "";
    const parentSegments = sectionSegments.slice(0, -1);
    const section = parentSegments.at(-1) ?? "";
    try {
      const product = await getProduct(slug, city, section);
      if (product) {
        const related = await getRelated(section, slug, 4, city);
        return {
          kind: "product",
          sectionPath: parentSegments.join("/"),
          data: { product, related },
        };
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      console.error("[catalog-route] product resolution failed:", error);
    }
  }

  const section = sectionSegments.at(-1) ?? "";
  return {
    kind: "catalog",
    sectionPath: sectionSegments.join("/"),
    section,
    legacyFilterPath,
    result: await loadCatalogPage(section, search, city, signal),
  };
}

export function applyCatalogState(
  current: CatalogSearch,
  next: CatalogStateChange,
): CatalogSearch {
  const output: Record<string, unknown> = { ...current };
  if (next.filters !== undefined) {
    for (const key of FACET_PARAMS) delete output[key];
    for (const [key, values] of Object.entries(next.filters)) {
      if (values?.length) output[key] = values.join(",");
    }
  }
  if (next.sort !== undefined) {
    if (next.sort === "default") delete output.sort;
    else output.sort = next.sort;
  }
  if ("priceMin" in next) {
    if (next.priceMin === undefined) delete output.priceMin;
    else output.priceMin = next.priceMin;
  }
  if ("priceMax" in next) {
    if (next.priceMax === undefined) delete output.priceMax;
    else output.priceMax = next.priceMax;
  }
  const page = next.page ?? 1;
  if (page <= 1) delete output.page;
  else output.page = page;
  return output as CatalogSearch;
}
