import { createFileRoute } from "@tanstack/react-router";

import { LensCoatingsArticlePage } from "@/components/pages/LensCoatingsArticlePage";

export const Route = createFileRoute("/blog/linzy-dlya-ochkov/pokrytiya-linz-dlya-ochkov/")({
  head: () => ({
    meta: [
      { title: "Покрытия линз для очков · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Какие покрытия делают очковые линзы комфортнее, защищают от бликов, царапин и помогают выбрать линзы под ваш образ жизни.",
      },
      { property: "og:title", content: "Покрытия линз для очков" },
      {
        property: "og:description",
        content:
          "Какие покрытия делают очковые линзы комфортнее, защищают от бликов, царапин и помогают выбрать линзы под ваш образ жизни.",
      },
      { property: "og:image", content: "/article-pokrytiya-linz/pokrytie_hero.webp" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: LensCoatingsArticlePage,
});
