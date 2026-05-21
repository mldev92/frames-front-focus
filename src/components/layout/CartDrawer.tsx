import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart, formatPrice } from "@/lib/store/cart";

export function CartDrawer() {
  const { isOpen, close, lines, setQty, remove, totals } = useCart();
  const { subtotal, count } = totals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40" onClick={close}>
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md bg-background flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-serif text-xl">Корзина · {count}</h2>
          <button onClick={close} aria-label="Закрыть">
            <X className="h-5 w-5" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="text-muted-foreground mb-4">Корзина пуста</div>
            <Link
              to="/catalog_s/$category" params={{ category: "opravy" }}
              onClick={close}
              className="bg-ink text-primary-foreground px-5 py-2.5 rounded-sm text-sm hover:opacity-90"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {lines.map((l) => (
                <div key={l.slug + (l.color ?? "")} className="flex gap-4 p-5">
                  <img
                    src={l.image}
                    alt={l.name}
                    className="w-20 h-20 object-cover rounded-sm bg-surface"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{l.brand}</div>
                    <div className="font-medium truncate">{l.name}</div>
                    {l.color && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Цвет: {l.color}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-border rounded-sm">
                        <button
                          className="p-1.5"
                          onClick={() => setQty(l.slug, l.qty - 1, l.color)}
                          aria-label="Меньше"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-sm w-6 text-center">{l.qty}</span>
                        <button
                          className="p-1.5"
                          onClick={() => setQty(l.slug, l.qty + 1, l.color)}
                          aria-label="Больше"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="text-sm font-medium">
                        {formatPrice(l.price * l.qty)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(l.slug, l.color)}
                    className="text-muted-foreground hover:text-brand"
                    aria-label="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <footer className="border-t border-border p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Итого</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={close}
                className="block text-center bg-ink text-primary-foreground py-3 rounded-sm hover:opacity-90"
              >
                Оформить заказ
              </Link>
              <Link
                to="/basket"
                onClick={close}
                className="block text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Перейти в корзину
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
