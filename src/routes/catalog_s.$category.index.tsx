import { createFileRoute } from "@tanstack/react-router";
import { categoryForCatalogPath } from "@/data/categories";
import { CatalogRouteView } from "@/components/CatalogRouteView";
import { catalogConfig } from "./catalog_s.$category";
import type { Category } from "@/data/types";
import {
  contactLensCatalogCanonical,
  contactLensCatalogDescription,
  contactLensCatalogSchemas,
  contactLensCatalogTitle,
} from "@/data/contact-lens-catalog-seo";
import {
  applyCatalogState,
  catalogSearchSchema,
  loadCatalogPage,
  normalizeCatalogSearch,
  type CatalogSearch,
  type LoaderResult,
} from "@/lib/catalog-route";

// ---------------------------------------------------------------------------
// Server-driven catalog (A2): the FULL catalog state lives in the URL —
// page, sort, price range and every supported facet — and the loader issues
// exactly ONE paged+faceted v2 request per state. Totals, priceBounds and
// facet counts all come from the server response (never recomputed from the
// current page slice).
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/catalog_s/$category/")({
  validateSearch: (search: Record<string, unknown>) => normalizeCatalogSearch(catalogSearchSchema.parse(search)),
  // One request per distinct catalog state — these deps ARE the state.
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps, abortController }) =>
    loadCatalogPage(params.category, deps, "spb", abortController.signal),
  head: ({ params, loaderData }) => {
    if (params.category === "kontaktnye_linzy_") {
      const scripts = loaderData?.state === "ok"
        ? contactLensCatalogSchemas(
            loaderData.data.products,
            loaderData.data.page,
            loaderData.data.pageSize,
          )
        : [];
      return {
        meta: [
          { title: contactLensCatalogTitle },
          { name: "description", content: contactLensCatalogDescription },
          { property: "og:title", content: contactLensCatalogTitle },
          { property: "og:description", content: contactLensCatalogDescription },
          { property: "og:type", content: "website" },
          { property: "og:url", content: contactLensCatalogCanonical },
          { property: "og:image", content: "https://optika100.com/podbor_linz.webp" },
          { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [{ rel: "canonical", href: contactLensCatalogCanonical }],
        scripts,
      };
    }
    const category = categoryForCatalogPath(params.category) as Category | undefined;
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

export function CatalogPending() {
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

function CatalogPage() {
  const { category: segment } = Route.useParams();
  const result = Route.useLoaderData() as LoaderResult;
  const search = Route.useSearch() as CatalogSearch;
  const navigate = Route.useNavigate();

  return (
    <CatalogRouteView
      sectionPath={segment}
      catalogPath={`/catalog_s/${segment}`}
      city="spb"
      result={result}
      search={search}
      onRetry={() => navigate({ search: (s: CatalogSearch) => ({ ...s }), replace: true })}
      onStateChange={(next) => {
        void navigate({
          search: (prev: CatalogSearch) => {
            return applyCatalogState(prev, next);
          },
          resetScroll: next.page !== undefined,
        });
      }}
    />
  );
}
