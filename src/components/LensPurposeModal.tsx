import { useEffect, useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import type { Product } from "@/data/types";
import { getProducts } from "@/lib/api/bitrix";
import { formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const PURPOSES = [
  "Для дали",
  "Для близи",
  "Прогрессивные",
  "Для защиты от солнца",
  "Для вождения",
  "Для компьютера",
] as const;

export function LensPurposeModal({
  open,
  onClose,
  frame,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  frame: Product;
  onComplete: (selection: { lens: Product; purpose: string }) => void;
}) {
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]>("Для дали");
  const [lenses, setLenses] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || lenses.length) return;
    setLoading(true);
    getProducts("linzy_dlya_ochkov", { limit: 24 })
      .then((products) => {
        const sellable = products.filter((product) => product.id && product.price > 0);
        setLenses(sellable);
        setSelectedId(sellable[0]?.id ?? null);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Не удалось загрузить линзы"))
      .finally(() => setLoading(false));
  }, [lenses.length, open]);

  if (!open) return null;
  const selected = lenses.find((lens) => lens.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl bg-background shadow-xl sm:rounded-xl">
        <header className="flex items-start justify-between border-b border-border p-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
              Линзы из каталога Bitrix
            </div>
            <h2 className="mt-1 font-serif text-2xl">Подберите линзы к оправе</h2>
          </div>
          <button onClick={onClose} aria-label="Закрыть" className="p-2">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {PURPOSES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPurpose(item)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm",
                  purpose === item ? "border-ink bg-ink text-white" : "border-border",
                )}
              >
                {item}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" /> Загружаем доступные линзы
            </div>
          )}
          {error && <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
          {!loading && !error && !lenses.length && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
              В Bitrix нет опубликованных линз с ценой. Комплект нельзя добавить онлайн.
            </div>
          )}
          <div className="grid gap-3">
            {lenses.map((lens) => (
              <button
                key={lens.id}
                type="button"
                onClick={() => setSelectedId(lens.id ?? null)}
                className={cn(
                  "grid grid-cols-[1fr_auto] gap-4 rounded-xl border p-4 text-left",
                  selectedId === lens.id ? "border-brand bg-brand/5" : "border-border",
                )}
              >
                <span>
                  <span className="font-medium">{lens.brand} {lens.name}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {lens.description || lens.specs.map((spec) => spec.value).slice(0, 3).join(" · ")}
                  </span>
                </span>
                <span className="flex items-center gap-2 font-serif text-xl">
                  {selectedId === lens.id && <Check className="h-4 w-4 text-brand" />}
                  {formatPrice(lens.price)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-border p-5">
          <div className="text-sm text-muted-foreground">
            Итого: <strong className="text-foreground">{formatPrice(frame.price + (selected?.price ?? 0))}</strong>
          </div>
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              onComplete({ lens: selected, purpose });
              onClose();
            }}
            className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Добавить оправу и линзы
          </button>
        </footer>
      </div>
    </div>
  );
}
