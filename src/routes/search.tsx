import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q: string } => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
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
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(q);

  const term = query.trim().toLowerCase();
  const results = term
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term),
      )
    : [];

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
          {results.length > 0
            ? `Найдено товаров: ${results.length}`
            : "Ничего не найдено. Попробуйте изменить запрос."}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
        {results.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
