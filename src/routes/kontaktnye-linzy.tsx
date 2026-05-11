import { createFileRoute } from "@tanstack/react-router";
import { CatalogListing } from "@/components/CatalogListing";
import { getByCategory } from "@/data/products";

export const Route = createFileRoute("/kontaktnye-linzy")({
  head: () => ({
    meta: [
      { title: "Контактные линзы — каталог · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Контактные линзы Acuvue, CooperVision, Bausch+Lomb, Alcon. Однодневные, месячные, торические, для контроля миопии.",
      },
      { property: "og:title", content: "Контактные линзы · ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Каталог контактных линз ведущих мировых производителей.",
      },
    ],
  }),
  component: () => (
    <CatalogListing
      title="Контактные линзы"
      subtitle="Однодневные, двухнедельные, месячные. Сферические, торические, для контроля миопии."
      products={getByCategory("kontaktnye-linzy")}
      facets={["brand", "wearMode", "lensType", "material"]}
    />
  ),
});
