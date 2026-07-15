import { createFileRoute, notFound } from "@tanstack/react-router";
import { CatalogRouteView } from "@/components/CatalogRouteView";
import { ProductPage } from "./catalog_s.$category.$slug";
import {
  applyCatalogState,
  catalogSearchSchema,
  normalizeCatalogSearch,
  resolveCatalogRoute,
  type CatalogSearch,
} from "@/lib/catalog-route";

export const Route = createFileRoute("/catalog_n/$category/$slug")({
  validateSearch: (search: Record<string, unknown>) => normalizeCatalogSearch(catalogSearchSchema.parse(search)),
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps, abortController }) => {
    const resolved = await resolveCatalogRoute(
      `${params.category}/${params.slug}`,
      deps,
      "nvk",
      abortController.signal,
    );
    if (!resolved) throw notFound();
    return resolved;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Товар · ОПТИКА 100%" }] };
    if (loaderData.kind === "catalog") {
      return {
        meta: [{ title: "Каталог · ОПТИКА 100%" }],
        links: [
          {
            rel: "canonical",
            href: `https://optika100.com/catalog_n/${params.category}/${params.slug}/`,
          },
        ],
      };
    }
    const product = loaderData.data.product;
    return {
      meta: [
        { title: `${product.brand} ${product.name} — купить · ОПТИКА 100%` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.brand} ${product.name}` },
        { property: "og:description", content: product.description },
        { property: "og:image", content: product.images[0] },
        { property: "og:type", content: "product" },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://optika100.com/catalog_n/${params.category}/${params.slug}/`,
        },
      ],
    };
  },
  component: ProductRoutePage,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="font-serif text-3xl">Товар не найден</h1>
      <a href="/catalog_n/opravy/" className="text-brand mt-4 inline-block">
        В каталог
      </a>
    </div>
  ),
});

function ProductRoutePage() {
  const params = Route.useParams();
  const resolved = Route.useLoaderData();
  const search = Route.useSearch() as CatalogSearch;
  const navigate = Route.useNavigate();

  if (resolved.kind === "catalog") {
    return (
      <CatalogRouteView
        sectionPath={resolved.sectionPath}
        catalogPath={`/catalog_n/${resolved.sectionPath}`}
        city="nvk"
        result={resolved.result}
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

  return (
    <ProductPage data={resolved.data} city="nvk" catalogPath={`/catalog_n/${params.category}`} />
  );
}
