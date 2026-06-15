import { createFileRoute } from "@tanstack/react-router";
import { categoryForCatalogPath } from "@/data/categories";
import { CatalogRouteView } from "@/components/CatalogRouteView";
import { catalogConfig } from "./catalog_s.$category";
import type { Category } from "@/data/types";
import {
  applyCatalogState,
  catalogSearchSchema,
  loadCatalogPage,
  type CatalogSearch,
  type LoaderResult,
} from "@/lib/catalog-route";

export const Route = createFileRoute("/catalog_n/$category/")({
  validateSearch: (search: Record<string, unknown>) => catalogSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps, abortController }) =>
    loadCatalogPage(params.category, deps, "nvk", abortController.signal),
  head: ({ params }) => {
    const category = categoryForCatalogPath(params.category) as Category | undefined;
    if (!category) return { meta: [{ title: "Каталог · ОПТИКА 100%" }] };
    const config = catalogConfig[category];
    return {
      meta: [
        { title: config.metaTitle },
        { name: "description", content: config.metaDescription },
        { property: "og:title", content: config.metaTitle },
        { property: "og:description", content: config.metaDescription },
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
      catalogPath={`/catalog_n/${segment}`}
      city="nvk"
      result={result}
      search={search}
      onRetry={() => navigate({ search: (current) => ({ ...current }), replace: true })}
      onStateChange={(next) => {
        void navigate({
          search: (current: CatalogSearch) => applyCatalogState(current, next),
          resetScroll: next.page !== undefined,
        });
      }}
    />
  );
}
