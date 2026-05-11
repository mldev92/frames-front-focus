import { createFileRoute } from "@tanstack/react-router";
import { CatalogListing } from "@/components/CatalogListing";
import { getByCategory } from "@/data/products";

export const Route = createFileRoute("/solntsezashchitnye")({
  head: () => ({
    meta: [
      { title: "Солнцезащитные очки — каталог · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Солнцезащитные очки с UV-защитой, поляризацией и градиентными линзами. Ray-Ban, Persol, OPTIKA Studio.",
      },
      { property: "og:title", content: "Солнцезащитные очки · ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Брендовые солнцезащитные очки с защитой UV400.",
      },
    ],
  }),
  component: () => (
    <CatalogListing
      title="Солнцезащитные очки"
      subtitle="100% UV-защита, поляризация, зеркальные и градиентные линзы."
      products={getByCategory("solntsezashchitnye")}
      facets={["shape", "material", "gender", "size", "brand"]}
    />
  ),
});
