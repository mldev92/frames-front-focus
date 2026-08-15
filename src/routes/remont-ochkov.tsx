import { createFileRoute } from "@tanstack/react-router";
import { RepairPage } from "@/components/pages/RepairPage";

export const Route = createFileRoute("/remont-ochkov")({
  head: () => ({
    meta: [
      { title: "Ремонт очков · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Ремонт очков: замена заушников, носоупоров, винтов, правка оправы, установка линз и чистка очков в салонах ОПТИКА 100%.",
      },
      { property: "og:title", content: "Ремонт очков · ОПТИКА 100%" },
      {
        property: "og:description",
        content:
          "Возвращаем очкам комфорт и надёжность. Сертифицированные запчасти, профессиональное оборудование и срочный ремонт в салоне.",
      },
      { property: "og:image", content: "/remont_hero.webp" },
    ],
  }),
  component: RepairPage,
});
