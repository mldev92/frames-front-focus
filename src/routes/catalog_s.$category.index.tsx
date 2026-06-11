import { createFileRoute, useRouterState, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useCityStore } from "@/lib/store/city";
import { CatalogListing } from "@/components/CatalogListing";
import {
  getCatalogPage,
  IndexNotReadyError,
  type CatalogPage as CatalogPageData,
  type CatalogQuery,
  type FacetKey,
} from "@/lib/api/bitrix";
import { segmentToCategory } from "@/data/categories";
import { catalogConfig } from "./catalog_s.$category";
import type { Category } from "@/data/types";

// ---------------------------------------------------------------------------
// Server-driven catalog (A2): the FULL catalog state lives in the URL —
// page, sort, price range and every supported facet — and the loader issues
// exactly ONE paged+faceted v2 request per state. Totals, priceBounds and
// facet counts all come from the server response (never recomputed from the
// current page slice).
// ---------------------------------------------------------------------------

// TanStack Router's default search parser auto-converts JSON-ish tokens, so
// `?bc=8.4` arrives as the *number* 8.4 — z.string() would throw. Every facet
// that can carry numeric-looking values is wrapped to string-ify first.
const numOrStr = z
  .preprocess((v) => (typeof v === "number" ? String(v) : v), z.string())
  .optional();

// Facets the server actually filters on (A2_CATALOG_CONTRACT.md). Unsupported
// params (tag, tryOn, width/temple ranges, q) are intentionally NOT in the
// schema — they are stripped from the URL instead of silently doing nothing.
const FACET_PARAMS = [
  "gender", "color", "shape", "size", "brand", "material", "construction",
  "wearMode", "lensType", "design", "technology", "purpose", "coating",
  "index", "sphere", "cylinder", "axis", "addition", "bc", "availability",
] as const satisfies readonly FacetKey[];

const catalogSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  sort: z.enum(["price_asc", "price_desc", "name"]).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  gender: z.string().optional(),
  color: z.string().optional(),
  shape: z.string().optional(),
  size: z.string().optional(),
  brand: z.string().optional(),
  material: z.string().optional(),
  construction: z.string().optional(),
  wearMode: z.string().optional(),
  lensType: z.string().optional(),
  design: z.string().optional(),
  technology: z.string().optional(),
  purpose: z.string().optional(),
  coating: z.string().optional(),
  index: numOrStr,
  sphere: numOrStr,
  cylinder: numOrStr,
  axis: numOrStr,
  addition: numOrStr,
  bc: numOrStr,
  availability: z.string().optional(),
});
export type CatalogSearch = z.infer<typeof catalogSearchSchema>;

/** URL search → the multi-select filter map the API client takes. */
function searchToFilters(search: CatalogSearch): Partial<Record<FacetKey, string[]>> {
  const filters: Partial<Record<FacetKey, string[]>> = {};
  for (const k of FACET_PARAMS) {
    const v = search[k];
    if (typeof v === "string" && v.trim() !== "") {
      const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length) filters[k] = parts;
    }
  }
  return filters;
}

type LoaderResult =
  | { state: "ok"; data: CatalogPageData }
  | { state: "index_not_ready" }
  | { state: "error"; message: string };

export const Route = createFileRoute("/catalog_s/$category/")({
  validateSearch: (search: Record<string, unknown>) => catalogSearchSchema.parse(search),
  // One request per distinct catalog state — these deps ARE the state.
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps, abortController }): Promise<LoaderResult> => {
    const city = useCityStore.getState().city;
    const q: CatalogQuery = {
      page: deps.page ?? 1,
      limit: 24,
      sort: deps.sort ?? "default",
      priceMin: deps.priceMin,
      priceMax: deps.priceMax,
      city,
      filters: searchToFilters(deps),
    };
    try {
      // abortController.signal cancels the fetch when a newer navigation
      // supersedes this load (stale requests never race the fresh one).
      const data = await getCatalogPage(params.category, q, abortController.signal);
      return { state: "ok", data };
    } catch (e) {
      if (e instanceof IndexNotReadyError) return { state: "index_not_ready" };
      if (e instanceof DOMException && e.name === "AbortError") throw e;
      return { state: "error", message: e instanceof Error ? e.message : String(e) };
    }
  },
  head: ({ params }) => {
    const category = segmentToCategory[params.category] as Category | undefined;
    if (!category) return { meta: [{ title: "Каталог · ОПТИКА 100%" }] };
    const c = catalogConfig[category];
    return {
      meta: [
        { title: c.metaTitle },
        { name: "description", content: c.metaDescription },
        { property: "og:title", content: c.metaTitle },
        { property: "og:description", content: c.metaDescription },
      ],
    };
  },
  pendingComponent: CatalogPending,
  component: CatalogPage,
});

function CatalogPending() {
  return (
    <div className="w-full py-24 flex flex-col items-center gap-4 text-muted-foreground">
      <div
        className="h-8 w-8 rounded-full border-2 border-border border-t-foreground"
        style={{ animation: "spin 0.8s linear infinite" }}
      />
      <span className="text-sm">Загружаем каталог…</span>
    </div>
  );
}

function CatalogMessage({
  title,
  text,
  onRetry,
}: {
  title: string;
  text: string;
  onRetry: () => void;
}) {
  return (
    <div className="w-full py-24 text-center">
      <div className="font-serif text-2xl text-foreground/70 mb-3">{title}</div>
      <p className="text-sm text-muted-foreground mb-6">{text}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 border border-border rounded-full px-5 py-2.5 text-sm hover:border-ink hover:bg-surface transition-all"
        style={{ transitionDuration: "var(--duration-snap)" }}
      >
        Попробовать снова
      </button>
    </div>
  );
}

function CatalogPage() {
  const { category: segment } = Route.useParams();
  const result = Route.useLoaderData() as LoaderResult;
  const search = Route.useSearch() as CatalogSearch;
  const navigate = Route.useNavigate();
  const { city: storeCity, hydrated: cityHydrated } = useCityStore();
  const router = useRouter();
  // Router pending state differs between the SSR pass and the client's first
  // hydration render → gate it behind a mounted flag so the initial markup is
  // identical (no hydration warning); the dim only applies to later navigations.
  const pending = useRouterState({ select: (s) => s.status === "pending" });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const loading = mounted && pending;

  // Re-run the loader when the persisted city changes (or when the store first
  // hydrates from localStorage and the city differs from the loader's initial guess).
  useEffect(() => {
    if (!cityHydrated) return;
    router.invalidate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeCity, cityHydrated]);

  const category = segmentToCategory[segment] as Category;
  const c = catalogConfig[category];

  if (result.state === "index_not_ready") {
    return (
      <CatalogMessage
        title="Каталог обновляется"
        text="Идёт обновление каталога — это занимает около минуты. Попробуйте обновить страницу."
        onRetry={() => navigate({ search: (s) => ({ ...s }), replace: true })}
      />
    );
  }
  if (result.state === "error") {
    return (
      <CatalogMessage
        title="Не удалось загрузить каталог"
        text="Проверьте соединение и попробуйте ещё раз."
        onRetry={() => navigate({ search: (s) => ({ ...s }), replace: true })}
      />
    );
  }

  const supportsFacetFiltering = result.data.source === "index";
  const appliedFilters: Record<string, string[]> = supportsFacetFiltering ? searchToFilters(search) : {};

  return (
    <CatalogListing
      title={c.title}
      subtitle={c.subtitle}
      data={result.data}
      facets={c.facets ?? []}
      facetFilteringEnabled={supportsFacetFiltering}
      categoryKey={category}
      initialFilters={appliedFilters}
      appliedSort={search.sort ?? "default"}
      appliedPriceMin={search.priceMin}
      appliedPriceMax={search.priceMax}
      page={search.page ?? 1}
      loading={loading}
      onStateChange={(next) => {
        void navigate({
          search: (prev: CatalogSearch) => {
            const out: Record<string, unknown> = { ...prev };
            if (next.filters !== undefined) {
              // Filters fully replace the facet params; absent keys drop out
              // of the URL entirely.
              for (const k of FACET_PARAMS) delete out[k];
              for (const [k, vals] of Object.entries(next.filters)) {
                if (vals && vals.length) out[k] = vals.join(",");
              }
            }
            if (next.sort !== undefined) {
              if (next.sort === "default") delete out.sort; else out.sort = next.sort;
            }
            if ("priceMin" in next) {
              if (next.priceMin === undefined) delete out.priceMin; else out.priceMin = next.priceMin;
            }
            if ("priceMax" in next) {
              if (next.priceMax === undefined) delete out.priceMax; else out.priceMax = next.priceMax;
            }
            // Any filter / price / sort change resets pagination; an explicit
            // page change sets it.
            const page = next.page ?? 1;
            if (page <= 1) delete out.page; else out.page = page;
            return out as CatalogSearch;
          },
          resetScroll: next.page !== undefined,
        });
      }}
    />
  );
}
