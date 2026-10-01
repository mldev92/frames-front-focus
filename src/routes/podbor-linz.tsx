import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LensWizard } from "@/components/LensWizard/LensWizard";

/**
 * Standalone «Подбор линз» (owner ask, 2026-10-01): the same wizard the frame
 * card opens, with no frame — the customer picks lenses by themselves and the
 * request goes to the salon mailbox marked «Модель: не указана». Entry points:
 * the lens catalogue page's search block and direct links.
 */
export const Route = createFileRoute("/podbor-linz")({
  head: () => ({
    meta: [
      { title: "Подбор очковых линз · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Подберите очковые линзы без оправы: назначение, рецепт, толщина, покрытие — и варианты с ценами из полной базы Essilor, ZEISS, HOYA.",
      },
      { property: "og:title", content: "Подбор очковых линз · ОПТИКА 100%" },
      {
        property: "og:description",
        content:
          "Подбор линз по параметрам с ориентировочными ценами. Заявка уходит специалисту — он проверит подбор и свяжется с вами.",
      },
    ],
  }),
  component: PodborLinzPage,
});

function PodborLinzPage() {
  const navigate = useNavigate();
  return (
    <LensWizard
      open
      onClose={() => void navigate({ to: "/catalog_s/$category/", params: { category: "linzy_dlya_ochkov" } })}
    />
  );
}
