import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LoaderCircle, Search } from "lucide-react";
import {
  fetchLensSearch,
  type LensRecommendCard,
  type LensSearchResponse,
} from "@/lib/api/lens-recommend";
import {
  availabilityBadge,
  brandDisplayLabel,
  offerProductName,
  offerSpecs,
} from "@/components/LensWizard/LensWizard";
import { formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

/**
 * «Поиск по названию» on the lens catalogue page (owner ask, 2026-10-01): the
 * manual cards below cover a fraction of the assortment, so this searches the
 * selector's FULL base through lens_search.php and renders the same offer
 * rows the wizard's «Посмотреть все варианты» list shows. Independent of the
 * catalog listing's own filters on purpose — those filter the hand-made
 * cards, this looks up the base.
 */

const PAGE = 20;
const MIN_QUERY = 2;

export function LensSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<LensSearchResponse | null>(null);
  const [rows, setRows] = useState<LensRecommendCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const q = query.trim();

  useEffect(() => {
    abortRef.current?.abort();
    setError(false);
    if (q.length < MIN_QUERY) {
      setResult(null);
      setRows([]);
      setLoading(false);
      return;
    }
    const ctl = new AbortController();
    abortRef.current = ctl;
    setLoading(true);
    const t = setTimeout(() => {
      fetchLensSearch(q, { limit: PAGE }, ctl.signal)
        .then((res) => {
          setResult(res);
          setRows(res.matches);
          setLoading(false);
        })
        .catch((e: unknown) => {
          if ((e as Error).name === "AbortError") return;
          setError(true);
          setLoading(false);
        });
    }, 350);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  const loadMore = () => {
    if (!result) return;
    setMore(true);
    fetchLensSearch(q, { limit: PAGE, offset: rows.length })
      .then((res) => {
        setRows((prev) => [...prev, ...res.matches]);
        setMore(false);
      })
      .catch(() => setMore(false));
  };

  const open = q.length >= MIN_QUERY;

  return (
    <section className="mt-8 rounded-2xl bg-surface p-5 lg:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="font-serif text-xl">Поиск по базе линз</h2>
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {result ? `более ${Math.floor(result.catalogueSize / 100) * 100} позиций` : "вся база подборщика"}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Наберите название с упаковки или из рецепта — например, «Stellest», «Crizal Sapphire» или «цейс драйв».
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Название линзы…"
          aria-label="Поиск линз по названию"
          className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm focus:border-brand focus:outline-none"
        />
        {loading && (
          <LoaderCircle className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="text-muted-foreground">Не помните название?</span>
        <Link to="/podbor-linz" className="font-medium text-brand hover:underline">
          Подобрать линзы по параметрам →
        </Link>
      </div>

      {open && error && (
        <p className="mt-4 text-sm text-muted-foreground">
          Не удалось выполнить поиск — проверьте соединение и попробуйте ещё раз.
        </p>
      )}

      {open && !error && result && rows.length === 0 && !loading && (
        <p className="mt-4 text-sm text-muted-foreground">
          Ничего не нашлось. Попробуйте короче — одно слово названия или бренд.
        </p>
      )}

      {open && rows.length > 0 && (
        <>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-background">
            {rows.map((offer) => (
              <LensSearchRow key={offer.id} offer={offer} />
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">
              Показано {rows.length} из {result?.total ?? rows.length}
            </span>
            {result && rows.length < result.total && (
              <button
                type="button"
                onClick={loadMore}
                disabled={more}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:border-foreground/40 disabled:opacity-50"
              >
                {more ? "Загружаем…" : "Показать ещё"}
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Цены — за пару линз. Окончательная проверка параметров выполняется специалистом.
          </p>
        </>
      )}
    </section>
  );
}

export function LensSearchRow({ offer }: { offer: LensRecommendCard }) {
  const badge = availabilityBadge(offer.availability, offer.channel);
  const specs = offerSpecs(offer.coating, offer.treatment);
  return (
    <li className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {brandDisplayLabel(offer.supplier)}
          {offer.index !== null && <> · индекс {offer.index}</>}
        </div>
        <div className="mt-0.5 font-serif text-base leading-snug">
          {offerProductName(offer.supplier, offer.line)}
        </div>
        {specs && <div className="mt-0.5 text-xs text-muted-foreground">{specs}</div>}
        <div
          className={cn(
            "mt-1 text-[11px]",
            badge.good ? "text-foreground/70" : "text-muted-foreground",
          )}
        >
          {badge.label}
        </div>
      </div>
      <div className="shrink-0 sm:text-right">
        {offer.priceRub !== null ? (
          <>
            {/* Её 02.10: старую цену перечёркивать, скидочную — ярче. */}
            {offer.priceBeforeDiscountRub !== null && (
              <div className="text-[11px] text-muted-foreground line-through">
                {formatPrice(offer.priceBeforeDiscountRub * 2)}
              </div>
            )}
            <div
              className={cn(
                "font-serif text-lg",
                offer.priceBeforeDiscountRub !== null && "text-brand",
              )}
            >
              {formatPrice(offer.priceRub * 2)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              за пару · {formatPrice(offer.priceRub)} за линзу
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">цена по запросу</div>
        )}
      </div>
    </li>
  );
}
