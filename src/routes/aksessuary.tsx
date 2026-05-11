import { createFileRoute } from "@tanstack/react-router";
import { CatalogListing } from "@/components/CatalogListing";
import { getByCategory } from "@/data/products";

export const Route = createFileRoute("/aksessuary")({
  head: () => ({
    meta: [
      { title: "Аксессуары для очков — каталог · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Футляры, цепочки, салфетки и средства для ухода за очками и линзами.",
      },
      { property: "og:title", content: "Аксессуары · ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Всё для ежедневного ухода за вашими очками.",
      },
    ],
  }),
  component: () => (
    <CatalogListing
      title="Аксессуары"
      subtitle="Футляры, цепочки, салфетки, средства для очистки линз."
      products={getByCategory("aksessuary")}
    />
  ),
});
