import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, LoaderCircle } from "lucide-react";
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
const BRANDS = ["essilor", "hoya", "zeiss", "synchrony"];

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

export function LensLinesCatalog() {
  const [cards, setCards] = useState<LensLineCard[] | null>(null);
  const [error, setError] = useState(false);
  const [brand, setBrand] = useState<string | null>(null);
  const [design, setDesign] = useState<string | null>(null);
  const [stockOnly, setStockOnly] = useState(false);

  useEffect(() => {
    const ctl = new AbortController();
    fetchLensLines(ctl.signal)
      .then(setCards)
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setError(true);
      });
    return () => ctl.abort();
  }, []);

  if (error) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Не удалось загрузить линзы — обновите страницу.
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

  const designs = DESIGN_ORDER.filter((d) => cards.some((c) => c.designs.includes(d)));
  const shown = cards.filter(
    (c) =>
      (!brand || c.supplier === brand) &&
      (!design || c.designs.includes(design)) &&
      (!stockOnly || c.availability === "warehouse"),
  );

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-1.5 text-sm transition-colors",
      active
        ? "border-foreground bg-foreground text-background"
        : "border-border hover:border-foreground/40",
    );

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-2">
        {BRANDS.map((b) => (
          <button key={b} type="button" className={chip(brand === b)}
            onClick={() => setBrand(brand === b ? null : b)}>
            {brandDisplayLabel(b)}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        {designs.map((d) => (
          <button key={d} type="button" className={chip(design === d)}
            onClick={() => setDesign(design === d ? null : d)}>
            {DESIGN_RU[d]}
          </button>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        <button type="button" className={chip(stockOnly)} onClick={() => setStockOnly(!stockOnly)}>
          В наличии
        </button>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {shown.length} из {cards.length} линеек · цены за пару линз, со скидкой сайта
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((card) => (
          <LensLineCardView key={card.id} card={card} />
        ))}
      </div>

      {shown.length === 0 && (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Под выбранные фильтры линеек нет — снимите один из них.
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
              <div className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">от</div>
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
