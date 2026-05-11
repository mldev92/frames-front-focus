import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/types";
import { cn } from "@/lib/utils";

type FacetKey = "shape" | "material" | "gender" | "size" | "brand" | "wearMode" | "lensType" | "purpose";

const FACET_LABELS: Record<FacetKey, string> = {
  shape: "Форма",
  material: "Материал",
  gender: "Пол",
  size: "Размер",
  brand: "Бренд",
  wearMode: "Режим ношения",
  lensType: "Тип линз",
  purpose: "Назначение",
};

interface ListingProps {
  title: string;
  subtitle?: string;
  products: Product[];
  facets?: FacetKey[];
}

export function CatalogListing({ title, subtitle, products, facets = [] }: ListingProps) {
  const [active, setActive] = useState<Record<string, Set<string>>>({});
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [mobileFilters, setMobileFilters] = useState(false);

  const facetOptions = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const f of facets) {
      const values = new Set<string>();
      for (const p of products) {
        const v = (p as unknown as Record<string, string | undefined>)[f];
        if (v) values.add(v);
      }
      out[f] = [...values].sort();
    }
    return out;
  }, [products, facets]);

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      Object.entries(active).every(([k, set]) => {
        if (!set || set.size === 0) return true;
        const v = (p as unknown as Record<string, string | undefined>)[k];
        return v ? set.has(v) : false;
      }),
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, active, sort]);

  const toggle = (facet: string, value: string) => {
    setActive((prev) => {
      const next = { ...prev };
      const set = new Set(next[facet] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      next[facet] = set;
      return next;
    });
  };

  const clearAll = () => setActive({});
  const activeChips: { facet: string; value: string }[] = [];
  for (const [k, set] of Object.entries(active)) {
    for (const v of set) activeChips.push({ facet: k, value: v });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl lg:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-muted-foreground max-w-2xl">{subtitle}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        {/* Sidebar (desktop) */}
        {facets.length > 0 && (
          <aside className="hidden lg:block">
            {facets.map((f) => (
              <FacetGroup
                key={f}
                title={FACET_LABELS[f]}
                values={facetOptions[f] ?? []}
                active={active[f] ?? new Set()}
                onToggle={(v) => toggle(f, v)}
              />
            ))}
            {activeChips.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-brand hover:underline mt-2"
              >
                Сбросить все
              </button>
            )}
          </aside>
        )}

        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              Найдено: {filtered.length}
            </div>
            <div className="flex items-center gap-3">
              {facets.length > 0 && (
                <button
                  onClick={() => setMobileFilters(true)}
                  className="lg:hidden inline-flex items-center gap-2 text-sm border border-border rounded-sm px-3 py-1.5"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Фильтры
                </button>
              )}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="bg-background border border-border rounded-sm px-3 py-1.5 text-sm"
              >
                <option value="featured">Популярные</option>
                <option value="price-asc">Цена ↑</option>
                <option value="price-desc">Цена ↓</option>
              </select>
            </div>
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeChips.map(({ facet, value }) => (
                <button
                  key={facet + value}
                  onClick={() => toggle(facet, value)}
                  className="inline-flex items-center gap-1 bg-surface border border-border text-xs px-2 py-1 rounded-sm hover:border-brand"
                >
                  {value} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              Ничего не найдено. Попробуйте изменить фильтры.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
              {filtered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setMobileFilters(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-lg max-h-[85vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl">Фильтры</h3>
              <button onClick={() => setMobileFilters(false)} aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>
            {facets.map((f) => (
              <FacetGroup
                key={f}
                title={FACET_LABELS[f]}
                values={facetOptions[f] ?? []}
                active={active[f] ?? new Set()}
                onToggle={(v) => toggle(f, v)}
              />
            ))}
            <div className="sticky bottom-0 bg-background pt-4 flex gap-3">
              <button
                onClick={clearAll}
                className="flex-1 border border-border py-3 rounded-sm"
              >
                Сбросить
              </button>
              <button
                onClick={() => setMobileFilters(false)}
                className={cn(
                  "flex-1 bg-ink text-primary-foreground py-3 rounded-sm",
                )}
              >
                Показать ({filtered.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FacetGroup({
  title,
  values,
  active,
  onToggle,
}: {
  title: string;
  values: string[];
  active: Set<string>;
  onToggle: (v: string) => void;
}) {
  if (values.length === 0) return null;
  return (
    <div className="mb-6 pb-6 border-b border-border">
      <div className="font-serif text-sm uppercase tracking-wider mb-3">{title}</div>
      <div className="space-y-2">
        {values.map((v) => (
          <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={active.has(v)}
              onChange={() => onToggle(v)}
              className="accent-[var(--brand)]"
            />
            <span>{v}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
