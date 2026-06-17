import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { categoryForCatalogPath } from "@/data/categories";

export const Route = createFileRoute("/catalog_n/$category")({
  loader: ({ params }) => {
    const category = categoryForCatalogPath(params.category);
    if (!category) throw notFound();
    return { category };
  },
  component: () => <Outlet />,
});
