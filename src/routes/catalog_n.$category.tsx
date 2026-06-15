import { createFileRoute, Outlet, notFound } from "@tanstack/react-router";
import { segmentToCategory } from "@/data/categories";

export const Route = createFileRoute("/catalog_n/$category")({
  loader: ({ params }) => {
    const category = segmentToCategory[params.category];
    if (!category) throw notFound();
    return { category };
  },
  component: () => <Outlet />,
});
