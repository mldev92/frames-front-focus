import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { searchProducts } from "@/lib/api/bitrix";
import type { Product } from "@/data/types";
import { ProductCard } from "@/components/ProductCard";
import { searchSiteContent } from "@/data/site-search";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q: string } => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => {
    const pages = searchSiteContent(deps.q);
    const products = await Promise.race([
      searchProducts(deps.q).catch(() => []),
      new Promise<Product[]>((resolve) => setTimeout(() => resolve([]), 4000)),
    ]);
    return { pages, products };
  },
  head: () => ({
    meta: [
      { title: "Поиск · ОПТИКА 100%" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { pages, products } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(q);

  const term = q.trim();

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <h1 className="font-serif text-4xl lg:text-5xl">Поиск</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ search: { q: query } });
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
          {pages.length + products.length > 0
            ? `Найдено: ${pages.length + products.length}`
            : "Ничего не найдено. Попробуйте изменить запрос."}
        </p>
      )}

      {pages.length > 0 && (
        <section className="mt-8" aria-labelledby="site-search-pages">
          <h2 id="site-search-pages" className="font-serif text-2xl">Страницы, услуги и категории</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pages.map((page) => (
              <a key={page.href} href={page.href} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/40">
                <span className="text-xs font-medium uppercase tracking-wide text-brand">{page.type}</span>
                <span className="mt-2 block text-lg font-medium">{page.title}</span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">{page.description}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && <h2 className="mt-10 font-serif text-2xl">Товары</h2>}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
        {products.map((p: Product) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
