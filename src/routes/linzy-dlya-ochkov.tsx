import { createFileRoute } from "@tanstack/react-router";
import { CatalogListing } from "@/components/CatalogListing";
import { getByCategory } from "@/data/products";

export const Route = createFileRoute("/linzy-dlya-ochkov")({
  head: () => ({
    meta: [
      { title: "Линзы для очков — каталог · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Линзы для очков ZEISS, Essilor, Hoya. Прогрессивные, фотохромные, с защитой от синего света.",
      },
      { property: "og:title", content: "Линзы для очков · ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Очковые линзы ведущих мировых производителей.",
      },
    ],
  }),
  component: () => (
    <CatalogListing
      title="Линзы для очков"
      subtitle="Линзы мировых брендов: однофокусные, прогрессивные, фотохромные, с защитой от синего света."
      products={getByCategory("linzy-dlya-ochkov")}
      facets={["brand", "purpose"]}
    />
  ),
});
