import { CartPrescription } from "@/components/CartPrescription";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, formatPrice } from "@/lib/store/cart";
import { cartTotals } from "@/lib/cart-totals";
import { lensCartDraft } from "@/lib/lens-cart";
import { LensRequestForm } from "@/components/LensWizard/LensRequestForm";
import { useState } from "react";
import { LensCartLine } from "@/components/LensCartLine";

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
  const { lines, lensSelections, setQty, remove, clear, consumeLens } = useCart();
  const [lensSubmitted, setLensSubmitted] = useState(false);
  const { subtotal, count } = cartTotals(lines, lensSelections);

  if (lines.length === 0 && lensSelections.length === 0 && !lensSubmitted) {
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
      {lines.length > 0 && <div className="grid lg:grid-cols-[1fr_360px] gap-12">
        <div className="divide-y divide-border border-y border-border">
          {lines.map((l) => (
            <div key={l.lineId} className="flex gap-3 py-6 sm:gap-5">
              <img
                src={l.image}
                alt={l.name}
                referrerPolicy="no-referrer"
                className="h-20 w-20 shrink-0 object-cover bg-surface rounded-sm sm:h-28 sm:w-28"
              />
              <div className="min-w-0 flex-1">
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
                <CartPrescription line={l} />
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
              <span className="text-muted-foreground">Товары · {lines.reduce((sum, line) => sum + line.qty, 0)}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Доставка</span>
              <span className="text-muted-foreground">Рассчитывается при оформлении</span>
            </div>
          </div>
          <div className="flex justify-between items-baseline pt-4 mb-6">
            <span>Товары без доставки</span>
            <span className="font-serif text-2xl">{formatPrice(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            className="block text-center bg-ink text-primary-foreground py-3 rounded-sm hover:opacity-90"
          >
            Перейти к оформлению
          </Link>
          {lensSelections.length > 0 && (
            <a href="#lens-order" className="mt-3 block text-center text-sm text-brand hover:underline">
              Оформить подбор очковых линз
            </a>
          )}
        </aside>
      </div>}
      {(lensSelections.length > 0 || lensSubmitted) && (
        <section id="lens-order" className="mt-10 scroll-mt-24 border-t border-border pt-8">
          <h2 className="font-serif text-2xl">Очковые линзы</h2>
          {lensSelections.length > 0 && (
            <div className="mt-5 divide-y divide-border border-y border-border">
              {lensSelections.map((item) => (
                <div key={item.id} className="py-4">
                  <LensCartLine item={item} />
                </div>
              ))}
            </div>
          )}
          <LensRequestForm
            draft={lensCartDraft(lensSelections)}
            fromBasket
            onSent={() => { setLensSubmitted(true); consumeLens(lensSelections); }}
          />
        </section>
      )}
    </div>
  );
}
