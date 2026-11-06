import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { searchGlobalProducts } from "@/lib/api/global-search";
import type { Product } from "@/data/types";
import { ProductCard } from "@/components/ProductCard";
import { searchSiteContent } from "@/data/site-search";
import { useCityStore } from "@/lib/store/city";
import { regionalSiteHref } from "@/lib/city-routing";
import { searchProductHref, lensSearchHref } from "@/lib/search-query";
import type { CityCode } from "@/lib/store/city";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q: string; city: CityCode } => ({
    q: typeof s.q === "string" ? s.q.slice(0, 120) : "",
    city: s.city === "nvk" ? "nvk" : "spb",
  }),
  loaderDeps: ({ search }) => ({ q: search.q, city: search.city }),
  loader: async ({ deps, abortController }) => {
    const pages = searchSiteContent(deps.q);
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), 4000);
    try {
      const result = await searchGlobalProducts(
        deps.q,
        deps.city,
        24,
        AbortSignal.any([timeout.signal, abortController.signal]),
      );
      return {
        pages,
        products: result.products,
        lenses: result.lenses,
        productError: result.partial,
      };
    } catch {
      return { pages, products: [] as Product[], lenses: [], productError: true };
    } finally {
      clearTimeout(timer);
    }
  },
  head: () => ({
    meta: [{ title: "Поиск · ОПТИКА 100%" }, { name: "robots", content: "noindex" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, city: searchCity } = Route.useSearch();
  const { pages, products, lenses, productError } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(q);
  const city = useCityStore((state) => state.city);
  const hydrated = useCityStore((state) => state.hydrated);
  useEffect(() => {
    setQuery(q);
  }, [q]);
  useEffect(() => {
    if (hydrated && city !== searchCity) void navigate({ search: { q, city }, replace: true });
  }, [city, searchCity, hydrated, q, navigate]);
  const regionalProducts = city === searchCity ? products : [];
  const regionalLenses = city === searchCity ? lenses : [];
  const regionalPages = pages.filter((page) => city === "spb" || page.region !== "spb");

  const term = q.trim();

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <h1 className="font-serif text-4xl lg:text-5xl">Поиск</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ search: { q: query, city } });
        }}
        className="mt-6 flex items-center gap-2 max-w-xl border-b border-border pb-2"
      >
        <SearchIcon className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Что вы ищете?"
          className="flex-1 bg-transparent outline-none text-lg"
        />
      </form>

      {term && (
        <p className="mt-6 text-sm text-muted-foreground">
          {regionalPages.length + regionalProducts.length + regionalLenses.length > 0
            ? `Показано результатов: ${regionalPages.length + regionalProducts.length + regionalLenses.length}`
            : productError
              ? "Не удалось загрузить товары. Попробуйте повторить поиск."
              : "Ничего не найдено. Попробуйте изменить запрос."}
        </p>
      )}

      {regionalPages.length > 0 && (
        <section className="mt-8" aria-labelledby="site-search-pages">
          <h2 id="site-search-pages" className="font-serif text-2xl">
            Страницы, услуги и категории
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {regionalPages.map((page) => (
              <a
                key={page.href}
                href={regionalSiteHref(page.href, city)}
                className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
              >
                <span className="text-xs font-medium uppercase tracking-wide text-brand">
                  {page.type}
                </span>
                <span className="mt-2 block text-lg font-medium">{page.title}</span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">
                  {page.description}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {productError &&
        regionalPages.length + regionalProducts.length + regionalLenses.length > 0 && (
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            Часть товарного поиска временно недоступна. Доступные результаты показаны ниже.
          </p>
        )}
      {regionalProducts.length > 0 && <h2 className="mt-10 font-serif text-2xl">Товары</h2>}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
        {regionalProducts.map((p: Product) => (
          <ProductCard
            key={p.slug}
            product={p}
            city={city}
            productHref={searchProductHref(p, city)}
          />
        ))}
      </div>
      {regionalLenses.length > 0 && (
        <section className="mt-10" aria-labelledby="search-lenses">
          <h2 id="search-lenses" className="font-serif text-2xl">
            Линзы для очков
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Предложения из актуальной базы подборщика. Цена за одну линзу; совместимость с рецептом
            проверяется при подборе.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {regionalLenses.map((lens) => (
              <a
                key={lens.id}
                href={lensSearchHref(q, city)}
                className="rounded-2xl border border-border p-5 hover:border-brand/40"
              >
                <span className="block text-base font-medium">
                  {[lens.line, lens.coating, lens.treatment].filter(Boolean).join(" · ")}
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">
                  {lens.supplier.toUpperCase()} ·{" "}
                  {lens.priceRub && lens.priceRub > 0
                    ? `${lens.priceRub.toLocaleString("ru-RU")} ₽ / линза`
                    : "Стоимость уточняется"}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
