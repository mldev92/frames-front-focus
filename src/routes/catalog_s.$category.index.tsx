import { createFileRoute } from "@tanstack/react-router";
import { CatalogListing } from "@/components/CatalogListing";
import { getByCategory } from "@/data/products";
import { segmentToCategory } from "@/data/categories";
import { catalogConfig } from "./catalog_s.$category";
import { Route as CategoryRoute } from "./catalog_s.$category";
import type { Category } from "@/data/types";

// Index route — renders the catalog listing at /catalog_s/$category/
// The parent layout route (catalog_s.$category.tsx) validates the category
// and renders <Outlet />, which delivers this component.
export const Route = createFileRoute("/catalog_s/$category/")({
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
  const { category } = CategoryRoute.useLoaderData() as { category: Category };
  const c = catalogConfig[category];
  return (
    <CatalogListing
      title={c.title}
      subtitle={c.subtitle}
      products={getByCategory(category)}
      facets={c.facets}
    />
  );
}
