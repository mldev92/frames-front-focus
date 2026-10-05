import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  fetchLensLine,
  fetchLensLines,
  type LensLineCard,
  type LensRecommendCard,
} from "@/lib/api/lens-recommend";
import { brandDisplayLabel, LensDetailDialog } from "@/components/LensWizard/LensWizard";
import { LensSearchRow } from "@/components/LensSearch";
import { formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import type { CatalogStateChange } from "@/components/CatalogListing";
import type { CatalogQuery, FacetKey } from "@/lib/api/bitrix";
import {
  canonicalLensLineFacetValue,
  filterLensLines,
  lensLineFacetCount,
  lensLineFacetOptions,
  LENS_LINE_FACET_ORDER,
  LENS_LINE_FACET_TITLES,
  sortLensLines,
  type LensLineFacet,
} from "@/lib/lens-lines-filter";

/**
 * «Очковые линзы» as curated base cards («один источник», владелец
 * 01–02.10.2026): one card per row she ticked in the перечень, prices from
 * the selector base with the site discount (старая цена перечёркнута,
 * скидочная ярче — её 02.10). Replaces the hand-made Bitrix cards for this
 * section; the manual cards' own grid no longer renders here.
 */

const DESIGN_RU: Record<string, string> = {
  single: "Однофокальные",
  progressive: "Прогрессивные",
  office: "Офисные",
  bifocal: "Бифокальные",
  myopia_control: "Контроль миопии",
};
const DESIGN_ORDER = ["single", "progressive", "office", "bifocal", "myopia_control"];
const PAGE_SIZE = 24;

function indexLabel(indexes: number[]): string {
  if (indexes.length === 0) return "—";
  if (indexes.length === 1) return String(indexes[0]);
  return `${Math.min(...indexes)}–${Math.max(...indexes)}`;
}

function treatmentsLabel(treatments: string[]): string {
  const isClear = (t: string) => t === "Прозрачные" || t === "Бесцветные";
  const clear = treatments.filter(isClear);
  const rest = treatments.filter((t) => !isClear(t));
  const parts = [...(clear.length ? ["Прозрачные"] : []), ...rest];
  if (parts.length <= 3) return parts.join(", ");
  return `${parts.slice(0, 3).join(", ")} и ещё ${parts.length - 3}`;
}

interface LensLinesCatalogProps {
  initialFilters: Partial<Record<FacetKey, string[]>>;
  appliedSort: NonNullable<CatalogQuery["sort"]>;
  appliedPriceMin?: number;
  appliedPriceMax?: number;
  page: number;
  onStateChange: (next: CatalogStateChange) => void;
}

function pageWindow(page: number, pages: number): Array<number | null> {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1);
  const values = new Set(
    [1, pages, page - 1, page, page + 1].filter((value) => value >= 1 && value <= pages),
  );
  const sorted = [...values].sort((a, b) => a - b);
  const out: Array<number | null> = [];
  for (let index = 0; index < sorted.length; index += 1) {
    if (index > 0 && sorted[index] - sorted[index - 1] > 1) out.push(null);
    out.push(sorted[index]);
  }
  return out;
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-border/70 py-5">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

export function LensLinesCatalog({
  initialFilters,
  appliedSort,
  appliedPriceMin,
  appliedPriceMax,
  page,
  onStateChange,
}: LensLinesCatalogProps) {
  const [cards, setCards] = useState<LensLineCard[] | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [priceDraft, setPriceDraft] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    const ctl = new AbortController();
    setError(false);
    fetchLensLines(ctl.signal)
      .then(setCards)
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setError(true);
      });
    return () => ctl.abort();
  }, [reload]);

  const priceBounds = useMemo(() => {
    const prices = (cards ?? [])
      .map((card) => (card.fromPriceRub === null ? null : card.fromPriceRub * 2))
      .filter((value): value is number => value !== null && Number.isFinite(value));
    return {
      min: prices.length ? Math.floor(Math.min(...prices) / 50) * 50 : 0,
      max: prices.length ? Math.ceil(Math.max(...prices) / 50) * 50 : 0,
    };
  }, [cards]);

  useEffect(() => {
    setPriceDraft([appliedPriceMin ?? priceBounds.min, appliedPriceMax ?? priceBounds.max]);
  }, [appliedPriceMin, appliedPriceMax, priceBounds.min, priceBounds.max]);

  if (error) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        <p>Не удалось загрузить линзы.</p>
        <button
          type="button"
          onClick={() => setReload((value) => value + 1)}
          className="mt-4 rounded-full border border-border px-5 py-2 hover:border-ink"
        >
          Попробовать снова
        </button>
      </div>
    );
  }
  if (!cards) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filters = initialFilters as Partial<Record<string, string[]>>;
  const filtered = filterLensLines(
    cards,
    filters,
    appliedPriceMin,
    appliedPriceMax,
  ) as LensLineCard[];
  const sorted = sortLensLines(filtered, appliedSort);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), pages);
  const start = (safePage - 1) * PAGE_SIZE;
  const shown = sorted.slice(start, start + PAGE_SIZE);
  const activeChips = LENS_LINE_FACET_ORDER.flatMap((facet) =>
    (filters[facet] ?? []).map((value) => ({ facet, value })),
  );

  const emitFilters = (next: Partial<Record<string, string[]>>) => {
    onStateChange({ filters: next as Partial<Record<FacetKey, string[]>> });
  };
  const toggle = (facet: LensLineFacet, value: string) => {
    const next = { ...filters };
    const selected = new Set(next[facet] ?? []);
    const equivalent = [...selected].find(
      (picked) =>
        canonicalLensLineFacetValue(facet, picked) === canonicalLensLineFacetValue(facet, value),
    );
    if (equivalent) selected.delete(equivalent);
    else selected.add(value);
    if (selected.size) next[facet] = [...selected];
    else delete next[facet];
    emitFilters(next);
  };
  const clearAll = () => {
    setPriceDraft([priceBounds.min, priceBounds.max]);
    onStateChange({ filters: {}, sort: "default", priceMin: undefined, priceMax: undefined });
  };
  const commitPrice = (value: [number, number]) => {
    onStateChange({
      priceMin: value[0] > priceBounds.min ? value[0] : undefined,
      priceMax: value[1] < priceBounds.max ? value[1] : undefined,
    });
  };

  const FilterContent = (
    <div className="text-sm">
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background pb-4 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif text-xl">
            <SlidersHorizontal className="h-4 w-4" /> Фильтры
          </div>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Сбросить
          </button>
        </div>
      </div>

      <FilterSection title="Цена за пару">
        <div className="mb-3 flex items-center gap-2">
          {[0, 1].map((index) => (
            <label
              key={index}
              className="flex flex-1 items-center gap-1 rounded-full border border-border px-3 py-2"
            >
              <span className="text-xs text-muted-foreground">₽</span>
              <input
                type="number"
                aria-label={index === 0 ? "Цена от" : "Цена до"}
                value={priceDraft[index]}
                onChange={(event) =>
                  setPriceDraft(
                    index === 0
                      ? [Number(event.target.value), priceDraft[1]]
                      : [priceDraft[0], Number(event.target.value)],
                  )
                }
                onBlur={() => commitPrice(priceDraft)}
                className="min-w-0 w-full bg-transparent text-xs outline-none"
              />
            </label>
          ))}
        </div>
        {priceBounds.max > priceBounds.min && (
          <Slider
            min={priceBounds.min}
            max={priceBounds.max}
            step={50}
            value={priceDraft}
            onValueChange={(value) => setPriceDraft([value[0], value[1]])}
            onValueCommit={(value) => commitPrice([value[0], value[1]])}
          />
        )}
      </FilterSection>

      {LENS_LINE_FACET_ORDER.map((facet) => {
        const options = lensLineFacetOptions(cards, facet)
          .map((value) => ({
            value,
            count: lensLineFacetCount(
              cards,
              filters,
              facet,
              value,
              appliedPriceMin,
              appliedPriceMax,
            ),
          }))
          .filter(({ value, count }) => count > 0 || (filters[facet] ?? []).includes(value));
        if (!options.length) return null;
        return (
          <FilterSection key={facet} title={LENS_LINE_FACET_TITLES[facet]}>
            <div className="space-y-2">
              {options.map(({ value, count }) => {
                const checked = (filters[facet] ?? []).some(
                  (picked) =>
                    canonicalLensLineFacetValue(facet, picked) ===
                    canonicalLensLineFacetValue(facet, value),
                );
                return (
                  <button
                    key={value}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(facet, value)}
                    className="flex w-full items-center gap-2.5 rounded px-1 py-0.5 text-left hover:bg-surface/60"
                  >
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        checked ? "border-ink bg-ink text-primary-foreground" : "border-border",
                      )}
                    >
                      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="flex-1">{value}</span>
                    <span className="text-xs text-muted-foreground">({count})</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>
        );
      })}
      <div className="h-8" />
    </div>
  );

  return (
    <div className="mt-8 lg:flex lg:items-start" style={{ minHeight: "80vh" }}>
      <aside
        className="hidden shrink-0 self-start overflow-hidden transition-[width,margin-right] duration-300 lg:sticky lg:top-4 lg:block"
        style={{ width: sidebarOpen ? 300 : 0, marginRight: sidebarOpen ? 40 : 0 }}
      >
        <div
          className="h-[calc(100vh-6rem)] overflow-y-auto pr-5"
          style={{ width: 300, scrollbarGutter: "stable" }}
        >
          {FilterContent}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="hidden h-9 items-center gap-2 rounded-full border border-border px-4 text-xs hover:border-ink hover:bg-ink hover:text-background lg:inline-flex"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />{" "}
            {sidebarOpen ? "Скрыть фильтры" : "Показать фильтры"}
          </button>
          <button
            type="button"
            onClick={() => setMobileFilters(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-4 text-xs hover:border-ink lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Фильтры
          </button>
          <span className="text-xs text-muted-foreground">
            {sorted.length} из {cards.length} линеек
          </span>
          <div className="relative ml-auto">
            <select
              value={appliedSort}
              onChange={(event) =>
                onStateChange({ sort: event.target.value as NonNullable<CatalogQuery["sort"]> })
              }
              className="h-9 w-[170px] appearance-none rounded-full border border-border bg-background pl-4 pr-9 text-xs outline-none hover:border-ink"
            >
              <option value="default">Популярные</option>
              <option value="price_asc">Сначала дешёвые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="name">По названию</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {activeChips.map(({ facet, value }) => (
              <button
                key={`${facet}:${value}`}
                type="button"
                onClick={() => toggle(facet, value)}
                className="inline-flex items-center gap-1 rounded-full border border-ink/20 bg-cream px-3 py-1 text-xs hover:border-ink"
              >
                {value} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        {shown.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((card) => (
              <LensLineCardView key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <div className="mb-3 font-serif text-2xl text-foreground/60">Ничего не найдено</div>
            <p className="mb-5">Измените параметры фильтрации.</p>
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-border px-5 py-2.5 hover:border-ink"
            >
              Сбросить все фильтры
            </button>
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Страницы">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => onStateChange({ page: safePage - 1 })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageWindow(safePage, pages).map((value, index) =>
              value === null ? (
                <span key={`gap-${index}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={value}
                  type="button"
                  onClick={() => onStateChange({ page: value })}
                  aria-current={value === safePage ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm",
                    value === safePage
                      ? "border-ink bg-ink text-background"
                      : "border-border hover:border-ink",
                  )}
                >
                  {value}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={safePage >= pages}
              onClick={() => onStateChange({ page: safePage + 1 })}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>

      {mobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setMobileFilters(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-background p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-xl">Фильтры</h3>
              <button type="button" onClick={() => setMobileFilters(false)} aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterContent}
            <div className="sticky bottom-0 flex gap-3 bg-background pt-4">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 rounded-full border border-border py-3 text-sm"
              >
                Сбросить
              </button>
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                className="flex-1 rounded-full bg-ink py-3 text-sm text-primary-foreground"
              >
                Показать ({sorted.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LensLineCardView({ card }: { card: LensLineCard }) {
  const [open, setOpen] = useState(false);
  const [offers, setOffers] = useState<LensRecommendCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailOffer, setDetailOffer] = useState<LensRecommendCard | null>(null);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && offers === null && !loading) {
      setLoading(true);
      fetchLensLine(card.id)
        .then((full) => setOffers(full.offers ?? []))
        .catch(() => setOffers([]))
        .finally(() => setLoading(false));
    }
  };

  const designLine = card.designs
    .slice()
    .sort((a, b) => DESIGN_ORDER.indexOf(a) - DESIGN_ORDER.indexOf(b))
    .map((d) => DESIGN_RU[d])
    .join(" / ");

  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[0_6px_24px_-12px_rgb(0_0_0/0.12)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {brandDisplayLabel(card.supplier)}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em]",
            card.availability === "warehouse"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-surface text-muted-foreground",
          )}
        >
          {card.availability === "warehouse" ? "В наличии" : "Под заказ"}
        </span>
      </div>

      <h3 className="mt-3 font-serif text-xl leading-snug">{card.title}</h3>
      {designLine && (
        <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {designLine}
        </div>
      )}

      <div className="mt-4 flex items-baseline gap-2.5">
        <span className="font-serif text-4xl leading-none">{indexLabel(card.indexes)}</span>
        <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {card.indexes.length > 1 ? "индексы" : "индекс"}
        </span>
      </div>

      <dl className="mt-4 border-t border-border pt-1 text-[13px]">
        <div className="flex justify-between gap-4 border-b border-border/55 py-2">
          <dt className="shrink-0 text-muted-foreground">Исполнения</dt>
          <dd className="text-right font-medium">{treatmentsLabel(card.treatments)}</dd>
        </div>
        <div className="flex justify-between gap-4 py-2">
          <dt className="text-muted-foreground">Вариантов</dt>
          <dd className="font-medium">{card.offerCount}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-end justify-between gap-4 pt-3">
        <div>
          {card.fromPriceRub !== null ? (
            <>
              <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                от
              </div>
              {card.fromPriceBeforeDiscountRub !== null && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatPrice(card.fromPriceBeforeDiscountRub * 2)}
                </div>
              )}
              <div
                className={cn(
                  "font-serif text-[22px] leading-tight",
                  card.fromPriceBeforeDiscountRub !== null && "text-brand",
                )}
              >
                {formatPrice(card.fromPriceRub * 2)}{" "}
                <span className="font-sans text-xs font-normal text-muted-foreground">за пару</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">цена по запросу</div>
          )}
        </div>
        <button
          type="button"
          onClick={toggle}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foreground px-5 py-2.5 text-[13px] font-semibold transition-colors hover:bg-foreground hover:text-background"
        >
          Варианты
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="mt-4">
          {loading && (
            <div className="flex justify-center py-6">
              <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {offers && offers.length > 0 && (
            <ul className="divide-y divide-border rounded-xl border border-border bg-background">
              {offers.map((offer) => (
                <LensSearchRow key={offer.id} offer={offer} onShowDetail={setDetailOffer} />
              ))}
            </ul>
          )}
          {offers && offers.length === 0 && !loading && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Не удалось загрузить варианты — попробуйте ещё раз.
            </div>
          )}
          <div className="mt-3 text-xs text-muted-foreground">
            Точную цену под ваш рецепт посчитает{" "}
            <Link to="/podbor-linz" className="font-medium text-brand hover:underline">
              подборщик линз →
            </Link>
          </div>
        </div>
      )}

      <LensDetailDialog
        offer={detailOffer}
        onOpenChange={(open) => !open && setDetailOffer(null)}
      />
    </article>
  );
}
