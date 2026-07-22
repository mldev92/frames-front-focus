import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, formatPrice } from "@/lib/store/cart";

export const Route = createFileRoute("/basket")({
  head: () => ({
    meta: [
      { title: "Корзина · ОПТИКА 100%" },
      { name: "description", content: "Ваши товары перед оформлением заказа." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, totals, clear } = useCart();
  const { subtotal, count } = totals();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Корзина пуста</h1>
        <p className="mt-3 text-muted-foreground">
          Загляните в каталог — у нас много новинок.
        </p>
        <Link
          to="/catalog_s/$category" params={{ category: "opravy" }}
          className="mt-8 inline-block bg-ink text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90"
        >
          В каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
      <h1 className="font-serif text-4xl mb-8">Корзина · {count}</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-12">
        <div className="divide-y divide-border border-y border-border">
          {lines.map((l) => (
            <div key={l.lineId} className="flex gap-5 py-6">
              <img
                src={l.image}
                alt={l.name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 object-cover bg-surface rounded-sm"
              />
              <div className="flex-1">
                <div className="text-xs text-muted-foreground">{l.brand}</div>
                <a href={l.canonicalPath} className="font-medium hover:text-brand">
                  {l.name}
                </a>
                {l.parameters.color && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Цвет: {l.parameters.color}
                  </div>
                )}
                {l.parameters.purpose && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Назначение: {l.parameters.purpose}
                  </div>
                )}
                <div className="mt-3 flex items-center border border-border rounded-sm w-fit">
                  <button
                    onClick={() => setQty(l.lineId, l.qty - 1)}
                    className="p-2"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-3 text-sm">{l.qty}</span>
                  <button
                    onClick={() => setQty(l.lineId, l.qty + 1)}
                    className="p-2"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => remove(l.lineId)}
                  className="text-muted-foreground hover:text-brand"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="font-medium">{formatPrice(l.price * l.qty)}</div>
              </div>
            </div>
          ))}
          <button
            onClick={clear}
            className="text-sm text-muted-foreground hover:text-brand py-4"
          >
            Очистить корзину
          </button>
        </div>

        <aside className="bg-surface p-6 rounded-sm h-fit sticky top-24">
          <h2 className="font-serif text-xl mb-5">Итого</h2>
          <div className="space-y-2 text-sm pb-4 border-b border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Товары · {count}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Доставка</span>
              <span className="text-muted-foreground">Рассчитывается при оформлении</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline pt-4 mb-6">
            <span>К оплате</span>
            <span className="font-serif text-2xl">{formatPrice(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            className="block text-center bg-ink text-primary-foreground py-3 rounded-sm hover:opacity-90"
          >
            Перейти к оформлению
          </Link>
        </aside>
      </div>
    </div>
  );
}
