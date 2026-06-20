import { createFileRoute, Outlet, notFound, redirect } from "@tanstack/react-router";
import { getBlogCategory } from "@/data/articles";

// Layout-only route — validates blog category and renders child (index or article)
export const Route = createFileRoute("/blog/$category")({
  loader: ({ params }) => {
    if (params.category === "pochemyMi.php") {
      throw redirect({ href: "/o-nas#pochemu-my" });
    }

    const category = getBlogCategory(params.category);
    if (!category) throw notFound();
    return { category };
  },
  component: () => <Outlet />,
});
