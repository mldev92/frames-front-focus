import { createFileRoute } from "@tanstack/react-router";
import { PodborOchkovPage } from "@/components/pages/PodborOchkovPage";

export const Route = createFileRoute("/podbor-ochkov")({
  head: () => ({
    meta: [
      { title: "Подбор очков и проверка зрения · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Профессиональный подбор очков: проверка зрения, подбор очковых линз и оправы в салонах ОПТИКА 100%.",
      },
      { property: "og:title", content: "Подбор очков и проверка зрения · ОПТИКА 100%" },
      {
        property: "og:description",
        content:
          "Комплексная диагностика зрения, подбор линз и удобной оправы с учётом ваших задач и образа жизни.",
      },
      { property: "og:image", content: "/podbor-hero.webp" },
    ],
  }),
  component: PodborOchkovPage,
});
