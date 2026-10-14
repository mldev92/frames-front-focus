import type { LensCartSelection } from "@/lib/store/cart";
import type { LensSelectionRequestDraft } from "@/lib/api/lens-selection";

export function lensCartDraft(items: LensCartSelection[]): LensSelectionRequestDraft {
  return {
    selection: {
      purpose: "Подбор очковых линз из корзины",
      rxMode: "none",
      finish: "Уточнить по рецепту",
      thickness: "По выбранным позициям",
      thicknessIsRecommended: false,
      design: "По выбранным позициям",
      brand: [...new Set(items.map((item) => item.brand))].join(", "),
      chosenOffer: items.map((item) => [
        `${item.qty} пара: ${item.brand} ${item.name}`,
        item.index === null ? "" : `индекс ${item.index}`,
        item.coating,
        item.treatment,
        item.pricePerLens === null ? "цена по запросу" : `${item.pricePerLens * 2} ₽ за пару`,
      ].filter(Boolean).join(" · ")).join("; "),
    },
    prescription: null,
  };
}
