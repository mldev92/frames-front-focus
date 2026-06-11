/**
 * Bitrix storefront API client.
 *
 * Talks to the read-path JSON endpoints added to the Bitrix site under
 * `/api/store/` (see public_html/api/store/). Returns the same `Product`
 * shape the app already uses, so route loaders swap mock → live with no
 * component changes.
 *
 * Base URL comes from `VITE_BITRIX_API` (staging now, Beget later). When it
 * is unset, or a request fails, we fall back to the static `src/data` fixtures
 * so local dev and SSR never hard-crash on a missing backend.
 */
import type { Product, Category } from "@/data/types";
import {
  getByCategory as mockByCategory,
  getProduct as mockGetProduct,
  products as mockProducts,
} from "@/data/products";
import { segmentToCategory } from "@/data/categories";

const BASE = (import.meta.env.VITE_BITRIX_API as string | undefined)?.replace(/\/$/, "") ?? "";

const url = (path: string) => `${BASE}/api/store/${path}`;
const productGalleryCache = new Map<string, Promise<string[]>>();

async function hydrateProductGalleries(
  products: Product[],
  city: "spb" | "nvk" = "spb",
): Promise<Product[]> {
  if (!BASE || products.length === 0) return products;
  const missing = products.filter((product) => product.images.length < 2);
  if (missing.length === 0) return products;

  try {
    const chunks: Product[][] = [];
    for (let index = 0; index < missing.length; index += 40) {
      chunks.push(missing.slice(index, index + 40));
    }
    const responses = await Promise.all(chunks.map((chunk) => {
      const params = new URLSearchParams({
        slugs: chunk.map((product) => product.slug).join(","),
        city,
      });
      return fetchJson<{ galleries: Record<string, string[]> }>(
        `galleries.php?${params.toString()}`,
      );
    }));
    const galleries = Object.assign({}, ...responses.map((data) => data.galleries));
    return products.map((product) => {
      const gallery = galleries[product.slug];
      if (!gallery?.length) return product;
      productGalleryCache.set(product.slug, Promise.resolve(gallery));
      return { ...product, images: gallery };
    });
  } catch (error) {
    console.error("[bitrix] gallery batch unavailable:", error);
    return products;
  }
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    colors: product.colors?.map((color) => ({
      ...color,
      // Bitrix directory entries use 70x70 UF_FILE icons as swatches, not product photos.
      image: color.image?.includes("/upload/uf/") ? undefined : color.image,
    })),
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`Bitrix API ${res.status} for ${path}`);
  return (await res.json()) as T;
}

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  sort?: "default" | "price_asc" | "price_desc" | "name";
  color?: string;
  size?: string;
  shape?: string;
  gender?: string;
  brand?: string;
  priceMin?: number;
  priceMax?: number;
}

/** Map a URL segment (e.g. "opravy") to the v2 Category union for fallbacks. */
const toCategory = (segment: string): Category | undefined => segmentToCategory[segment];

/** List products for a category URL segment (or union value). */
export async function getProducts(categoryOrSegment: string, q: ProductQuery = {}): Promise<Product[]> {
  if (!BASE) {
    const cat = toCategory(categoryOrSegment) ?? (categoryOrSegment as Category);
    return mockByCategory(cat);
  }
  try {
    const params = new URLSearchParams({ category: categoryOrSegment });
    for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== "") params.set(k, String(v));
    const data = await fetchJson<ProductsResponse>(`products.php?${params.toString()}`);
    return hydrateProductGalleries(data.products.map(normalizeProduct));
  } catch (e) {
    console.error("[bitrix] getProducts fallback:", e);
    const cat = toCategory(categoryOrSegment) ?? (categoryOrSegment as Category);
    return mockByCategory(cat);
  }
}

/** Full paginated response (real total/pages from the endpoint). */
export async function getProductsPage(categoryOrSegment: string, q: ProductQuery = {}): Promise<ProductsResponse> {
  if (!BASE) {
    const cat = toCategory(categoryOrSegment) ?? (categoryOrSegment as Category);
    const products = mockByCategory(cat);
    return { products, total: products.length, page: 1, pages: 1 };
  }
  const params = new URLSearchParams({ category: categoryOrSegment });
  for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== "") params.set(k, String(v));
  const data = await fetchJson<ProductsResponse>(`products.php?${params.toString()}`);
  return { ...data, products: data.products.map(normalizeProduct) };
}

// getAllProducts (fetch-every-page fan-out) was REMOVED in A2: with honest
// totals (opravy=9477) it would issue ~99 requests per catalog visit. The
// catalog now makes exactly one getCatalogPage request per state.

/** Single product by slug (element CODE). Returns null when not found. */
export async function getProduct(slug: string): Promise<Product | null> {
  if (!BASE) return mockGetProduct(slug) ?? null;
  try {
    const res = await fetch(url(`product.php?slug=${encodeURIComponent(slug)}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Bitrix API ${res.status}`);
    const data = (await res.json()) as Product | { error: string };
    if ("error" in data) return null;
    return normalizeProduct(data);
  } catch (e) {
    console.error("[bitrix] getProduct fallback:", e);
    return mockGetProduct(slug) ?? null;
  }
}

/**
 * Fetch the full product gallery on demand for card hover previews.
 * List responses intentionally stay lightweight, so cards request this only
 * after the user hovers or focuses them. The promise cache prevents duplicate
 * requests when the same product appears in multiple carousels/sections.
 */
export function getProductGallery(slug: string): Promise<string[]> {
  const cached = productGalleryCache.get(slug);
  if (cached) return cached;

  const request = getProduct(slug)
    .then((product) => product?.images ?? [])
    .catch(() => []);
  productGalleryCache.set(slug, request);
  return request;
}

/** Related products: same category, excluding the current slug. */
export async function getRelated(categoryOrSegment: string, excludeSlug: string, limit = 4): Promise<Product[]> {
  const list = await getProducts(categoryOrSegment, { limit: limit + 4 });
  return list.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}

// ---------------------------------------------------------------------------
// v2 server-driven catalog (A2) — one paged, faceted request per catalog view.
// Backed by the full-catalog index on prod (?v2=1&facets=1): honest totals
// (opravy=9477, not the 500-capped fallback), drill-down facet counts computed
// server-side (own-facet excluded, AND across facets, OR within), priceBounds
// over the filtered set. See A2_CATALOG_CONTRACT.md.
// ---------------------------------------------------------------------------

export interface CatalogQuery {
  page?: number;
  limit?: number;
  sort?: "default" | "price_asc" | "price_desc" | "name";
  priceMin?: number;
  priceMax?: number;
  city?: "spb" | "nvk";
  /** Multi-select facet selections; values are OR'd within a facet, AND'd across. */
  filters?: Partial<Record<FacetKey, string[]>>;
}

export type FacetKey =
  | "gender" | "shape" | "material" | "construction" | "size" | "brand" | "color"
  | "wearMode" | "lensType" | "design"
  | "technology" | "purpose" | "coating" | "index"
  | "sphere" | "cylinder" | "axis" | "addition" | "bc"
  | "availability";

export interface CatalogPage {
  products: Product[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
  priceBounds: { min: number; max: number };
  /** facet -> value -> count; empty facets are omitted by the server. */
  facets: Partial<Record<FacetKey, Record<string, number>>>;
  source: "index" | "fallback";
}

/** Thrown when the server has no valid catalog index (HTTP 503 index_not_ready). */
export class IndexNotReadyError extends Error {
  constructor() { super("catalog index not ready"); this.name = "IndexNotReadyError"; }
}

/**
 * One server-driven catalog page: products slice + totals + facet counts in a
 * single request. No mock fallback — the catalog page owns its error states.
 */
export async function getCatalogPage(
  categoryOrSegment: string,
  q: CatalogQuery = {},
  signal?: AbortSignal,
): Promise<CatalogPage> {
  const params = new URLSearchParams({ category: categoryOrSegment });
  params.set("v2", "1");
  params.set("facets", "1");
  if (q.page) params.set("page", String(q.page));
  if (q.limit) params.set("limit", String(q.limit));
  if (q.sort && q.sort !== "default") params.set("sort", q.sort);
  if (q.priceMin !== undefined) params.set("priceMin", String(q.priceMin));
  if (q.priceMax !== undefined) params.set("priceMax", String(q.priceMax));
  if (q.city && q.city !== "spb") params.set("city", q.city);
  for (const [k, vals] of Object.entries(q.filters ?? {})) {
    if (vals && vals.length) params.set(k, vals.join(","));
  }
  const res = await fetch(url(`products.php?${params.toString()}`), { signal });
  if (res.status === 503) throw new IndexNotReadyError();
  if (!res.ok) throw new Error(`Bitrix API ${res.status} for catalog page`);
  const data = (await res.json()) as Partial<CatalogPage> & Pick<CatalogPage, "products" | "total" | "page" | "pages" | "source">;
  const products = await hydrateProductGalleries(
    data.products.map(normalizeProduct),
    q.city ?? "spb",
  );
  const prices = products.map((product) => product.price).filter((price) => Number.isFinite(price));
  return {
    ...data,
    products,
    pageSize: data.pageSize ?? q.limit ?? products.length,
    priceBounds: data.priceBounds ?? {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
    facets: data.facets ?? {},
  };
}

/** Live counts for the header dropdown — one fetch per category. */
export interface MenuCounts {
  category: string;
  total: number;
  gender:       Record<string, number>;
  shape:        Record<string, number>;
  construction: Record<string, number>;
  material:     Record<string, number>;
  // Contact lenses + eyeglass lenses (filled for kontaktnye_linzy_ /
  // linzy_dlya_ochkov, empty/absent for frames).
  wearMode?:    Record<string, number>;
  lensType?:    Record<string, number>;
  lensMaterial?: Record<string, number>;
  design?:      Record<string, number>;
  brand:        { name: string; count: number }[];
}

export async function getMenuCounts(
  category: string,
  city: "spb" | "nvk" = "spb",
): Promise<MenuCounts | null> {
  if (!BASE) return null;
  try {
    const params = new URLSearchParams({ category });
    if (city !== "spb") params.set("city", city);
    return await fetchJson<MenuCounts>(`menu_counts.php?${params.toString()}`);
  } catch (e) {
    console.error("[bitrix] getMenuCounts:", e);
    return null;
  }
}

function menuCountsToFacets(menu: MenuCounts): Partial<Record<FacetKey, Record<string, number>>> {
  const brand: Record<string, number> = {};
  for (const item of menu.brand) brand[item.name] = item.count;

  return {
    gender: menu.gender,
    shape: menu.shape,
    construction: menu.construction,
    material: menu.material,
    wearMode: menu.wearMode,
    lensType: menu.lensType,
    design: menu.design,
    brand,
  };
}

export interface CallbackData {
  name: string;
  phone: string;
  comment?: string;
}

export interface AppointmentData {
  name: string;
  lastName?: string;
  patronymic?: string;
  phone: string;
  dob?: string;
  salon: string;
  service: string;
  date: string;
  time: string;
  comment?: string;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function submitCallback(data: CallbackData): Promise<void> {
  await postJson("callback.php", data);
}

export async function submitAppointment(data: AppointmentData): Promise<void> {
  await postJson("appointment.php", data);
}

/** Name/article substring search. */
export async function searchProducts(query: string, limit = 24): Promise<Product[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  if (!BASE) {
    const t = q.toLowerCase();
    return mockProducts
      .filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t))
      .slice(0, limit);
  }
  try {
    const data = await fetchJson<{ products: Product[]; total: number }>(
      `search.php?q=${encodeURIComponent(q)}&limit=${limit}`,
    );
    return data.products.map(normalizeProduct);
  } catch (e) {
    console.error("[bitrix] searchProducts fallback:", e);
    const t = q.toLowerCase();
    return mockProducts
      .filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t))
      .slice(0, limit);
  }
}
