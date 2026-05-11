import { createFileRoute } from "@tanstack/react-router";
import { CatalogListing } from "@/components/CatalogListing";
import { getByCategory } from "@/data/products";

export const Route = createFileRoute("/opravy")({
  head: () => ({
    meta: [
      { title: "Оправы — каталог · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Купить оправы для очков в Санкт-Петербурге: ацетат, титан, металл. Мужские, женские, детские модели.",
      },
      { property: "og:title", content: "Оправы — каталог · ОПТИКА 100%" },
      { property: "og:description", content: "Большой выбор оправ от классики до авангарда." },
    ],
  }),
  component: () => (
    <CatalogListing
      title="Оправы"
      subtitle="Современные оправы из ацетата, титана и металла. Подбираем под форму лица и образ жизни."
      products={getByCategory("opravy")}
      facets={["shape", "material", "gender", "size", "brand"]}
    />
  ),
});
