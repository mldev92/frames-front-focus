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
    return data.products;
  } catch (e) {
    console.error("[bitrix] getProducts fallback:", e);
    const cat = toCategory(categoryOrSegment) ?? (categoryOrSegment as Category);
    return mockByCategory(cat);
  }
}

/** Full paginated response (when total/pages are needed). */
export async function getProductsPage(categoryOrSegment: string, q: ProductQuery = {}): Promise<ProductsResponse> {
  const products = await getProducts(categoryOrSegment, q);
  return { products, total: products.length, page: q.page ?? 1, pages: 1 };
}

/** Single product by slug (element CODE). Returns null when not found. */
export async function getProduct(slug: string): Promise<Product | null> {
  if (!BASE) return mockGetProduct(slug) ?? null;
  try {
    const res = await fetch(url(`product.php?slug=${encodeURIComponent(slug)}`));
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Bitrix API ${res.status}`);
    const data = (await res.json()) as Product | { error: string };
    if ("error" in data) return null;
    return data;
  } catch (e) {
    console.error("[bitrix] getProduct fallback:", e);
    return mockGetProduct(slug) ?? null;
  }
}

/** Related products: same category, excluding the current slug. */
export async function getRelated(categoryOrSegment: string, excludeSlug: string, limit = 4): Promise<Product[]> {
  const list = await getProducts(categoryOrSegment, { limit: limit + 4 });
  return list.filter((p) => p.slug !== excludeSlug).slice(0, limit);
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
    return data.products;
  } catch (e) {
    console.error("[bitrix] searchProducts fallback:", e);
    const t = q.toLowerCase();
    return mockProducts
      .filter((p) => p.name.toLowerCase().includes(t) || p.brand.toLowerCase().includes(t))
      .slice(0, limit);
  }
}
