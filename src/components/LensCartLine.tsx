import { Minus, Plus, Trash2 } from "lucide-react";
import { PriceSavings } from "@/components/PriceSavings";
import { formatPrice, useCart, type LensCartSelection } from "@/lib/store/cart";

export function LensCartLine({ item }: { item: LensCartSelection }) {
  const setQty = useCart((state) => state.setLensQty);
  const remove = useCart((state) => state.removeLens);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{item.brand} {item.name}</div>
        <div className="text-xs text-muted-foreground">
          {[item.index && `Индекс ${item.index}`, item.coating, item.treatment].filter(Boolean).join(" · ")}
        </div>
        <div className="mt-1 text-sm">
          {item.pricePerLens === null
            ? "Цена по запросу"
            : `Ориентир: ${formatPrice(item.pricePerLens * item.qty)}`}
        </div>
        <PriceSavings
          oldPrice={item.priceBeforeDiscountPerLens ?? null}
          price={item.pricePerLens}
          discountPercent={item.discountPercent ?? null}
          quantity={item.qty}
          className="mt-1"
        />
        <div className="mt-2 inline-flex items-center rounded-sm border border-border" role="group" aria-label="Количество линз">
          <button type="button" disabled={item.qty <= 1} onClick={() => setQty(item.id, item.qty - 1)}
            aria-label="Убрать одну линзу" className="grid size-9 place-items-center disabled:opacity-40">
            <Minus className="size-3" />
          </button>
          <span className="min-w-13 px-1 text-center text-sm" aria-live="polite">{item.qty} шт.</span>
          <button type="button" onClick={() => setQty(item.id, item.qty + 1)}
            aria-label="Добавить одну линзу" className="grid size-9 place-items-center">
            <Plus className="size-3" />
          </button>
        </div>
      </div>
      <button type="button" onClick={() => remove(item.id)} aria-label="Удалить линзы"
        className="p-1 text-muted-foreground hover:text-brand">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
