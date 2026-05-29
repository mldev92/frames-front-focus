import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CatalogListing } from "@/components/CatalogListing";
import { getAllProducts } from "@/lib/api/bitrix";
import { segmentToCategory } from "@/data/categories";
import { catalogConfig } from "./catalog_s.$category";
import type { Category, Product } from "@/data/types";

// Header dropdown deep-links the catalog with these facet query params, e.g.
// /catalog_s/opravy?gender=Мужские&shape=Прямоугольные . The catalog reads them
// here and seeds the listing's active-filter state.
const catalogSearchSchema = z.object({
  gender:   z.string().optional(),
  color:    z.string().optional(),
  shape:    z.string().optional(),
  size:     z.string().optional(),
  brand:    z.string().optional(),
  material: z.string().optional(),
});
type CatalogSearch = z.infer<typeof catalogSearchSchema>;

// Index route — renders the catalog listing at /catalog_s/$category/
// The parent layout route (catalog_s.$category.tsx) validates the category
// and renders <Outlet />, which delivers this component.
export const Route = createFileRoute("/catalog_s/$category/")({
  validateSearch: (search: Record<string, unknown>) => catalogSearchSchema.parse(search),
  loader: async ({ params }) => {
    // Fetch the full section (all pages), so the catalog shows every active
    // frame the Bitrix admin lists — not just the first 96.
    const products = await getAllProducts(params.category);
    return { products };
  },
  head: ({ params }) => {
    const category = segmentToCategory[params.category] as Category | undefined;
    if (!category) return { meta: [{ title: "Каталог · ОПТИКА 100%" }] };
    const c = catalogConfig[category];
    return {
      meta: [
        { title: c.metaTitle },
        { name: "description", content: c.metaDescription },
        { property: "og:title", content: c.metaTitle },
        { property: "og:description", content: c.metaDescription },
      ],
    };
  },
  component: CatalogPage,
});

function CatalogPage() {
  const { category: segment } = Route.useParams();
  const { products } = Route.useLoaderData() as { products: Product[] };
  const search = Route.useSearch() as CatalogSearch;
  const category = segmentToCategory[segment] as Category;
  const c = catalogConfig[category];

  // Header dropdown → catalog. Each present param becomes an active filter on
  // that facet. Comma-separated values allow ?shape=Прямоугольные,Квадратные .
  const initialFilters: Record<string, string[]> = {};
  for (const k of ["gender", "color", "shape", "size", "brand", "material"] as const) {
    const v = search[k];
    if (v) {
      const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length) initialFilters[k] = parts;
    }
  }

  return (
    <CatalogListing
      title={c.title}
      subtitle={c.subtitle}
      products={products}
      facets={c.facets}
      categoryKey={category}
      initialFilters={initialFilters}
    />
  );
}
