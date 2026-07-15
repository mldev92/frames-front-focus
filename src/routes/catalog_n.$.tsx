import { createFileRoute, notFound } from "@tanstack/react-router";
import { CatalogRouteView } from "@/components/CatalogRouteView";
import { categoryForCatalogPath } from "@/data/categories";
import { ProductPage } from "@/routes/catalog_s.$category.$slug";
import { catalogConfig } from "@/routes/catalog_s.$category";
import {
  applyCatalogState,
  catalogSearchSchema,
  normalizeCatalogSearch,
  resolveCatalogRoute,
  type CatalogSearch,
} from "@/lib/catalog-route";

export const Route = createFileRoute("/catalog_n/$")({
  validateSearch: (search: Record<string, unknown>) => normalizeCatalogSearch(catalogSearchSchema.parse(search)),
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps, abortController }) => {
    const resolved = await resolveCatalogRoute(params._splat ?? "", deps, "nvk", abortController.signal);
    if (!resolved || !categoryForCatalogPath(resolved.sectionPath)) throw notFound();
    return resolved;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Каталог · ОПТИКА 100%" }] };
    const canonical = `https://optika100.com/catalog_n/${(params._splat ?? "").replace(/^\/|\/$/g, "")}/`;
    if (loaderData.kind === "product") {
      const product = loaderData.data.product;
      return {
        meta: [
          { title: `${product.brand} ${product.name} — купить · ОПТИКА 100%` },
          { name: "description", content: product.description },
          { property: "og:title", content: `${product.brand} ${product.name}` },
          { property: "og:image", content: product.images[0] },
        ],
        links: [{ rel: "canonical", href: canonical }],
      };
    }
    const category = categoryForCatalogPath(loaderData.sectionPath);
    const config = category ? catalogConfig[category] : undefined;
    return {
      meta: [
        { title: config?.metaTitle ?? "Каталог · ОПТИКА 100%" },
        { name: "description", content: config?.metaDescription ?? "" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: CatalogNSplatPage,
});

function CatalogNSplatPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch() as CatalogSearch;
  const navigate = Route.useNavigate();

  if (data.kind === "product") {
    return <ProductPage data={data.data} city="nvk" catalogPath={`/catalog_n/${data.sectionPath}`} />;
  }

  return (
    <CatalogRouteView
      sectionPath={data.sectionPath}
      catalogPath={`/catalog_n/${data.sectionPath}`}
      city="nvk"
      result={data.result}
      search={search}
      onRetry={() => navigate({ search: (current: CatalogSearch) => ({ ...current }), replace: true })}
      onStateChange={(next) => {
        void navigate({
          search: (current: CatalogSearch) => applyCatalogState(current, next),
          resetScroll: next.page !== undefined,
        });
      }}
    />
  );
}
