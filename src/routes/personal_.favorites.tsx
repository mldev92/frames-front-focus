import { Link, createFileRoute } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

import { ProductCard } from "@/components/ProductCard";
import { getProduct } from "@/lib/api/bitrix";
import { useCart } from "@/lib/store/cart";
import { useCityStore } from "@/lib/store/city";

export const Route = createFileRoute("/personal_/favorites")({
  head: () => ({
    meta: [
      { title: "Избранное · ОПТИКА 100%" },
      { name: "description", content: "Товары, которые вы отложили на сайте ОПТИКА 100%." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { saved, savedCities = {}, toggleSaved } = useCart();
  const currentCity = useCityStore((state) => state.city);
  // Список лежит в браузере (localStorage): до монтирования показываем пустой каркас,
  // чтобы пререндер и первая отрисовка совпадали.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = mounted
    ? saved.map((slug) => ({ slug, city: savedCities[slug] ?? currentCity }))
    : [];
  const results = useQueries({
    queries: items.map(({ slug, city }) => ({
      queryKey: ["favorite-product", city, slug],
      queryFn: () => getProduct(slug, city),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const loading = !mounted || results.some((result) => result.isPending);
  const found = items.flatMap((item, index) => {
    const product = results[index]?.data;
    return product ? [{ ...item, product }] : [];
  });
  // Карточку сняли с продажи — даём убрать её из списка, а не прячем молча.
  const missing = items.filter((_, index) => results[index]?.isSuccess && !results[index]?.data);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <h1 className="font-serif text-4xl lg:text-5xl">Избранное</h1>

      {mounted && saved.length === 0 && (
        <div className="mt-10 max-w-xl">
          <p className="text-muted-foreground">
            Здесь появятся товары, которые вы отметите сердечком{" "}
            <Heart className="inline h-4 w-4 align-[-2px] text-brand" />.
          </p>
          <Link
            to="/catalog_s/$category"
            params={{ category: "opravy" }}
            className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            В каталог
          </Link>
        </div>
      )}

      {loading && saved.length > 0 && (
        <p className="mt-6 text-sm text-muted-foreground">Загружаем товары…</p>
      )}

      {found.length > 0 && (
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
          {found.map(({ slug, city, product }) => (
            <ProductCard key={`${city}:${slug}`} product={product} city={city} />
          ))}
        </div>
      )}

      {missing.length > 0 && (
        <div className="mt-10 max-w-xl space-y-2">
          <p className="text-sm text-muted-foreground">Эти товары больше не продаются:</p>
          {missing.map(({ slug }) => (
            <div
              key={slug}
              className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 text-sm"
            >
              <span className="truncate">{slug}</span>
              <button
                type="button"
                onClick={() => toggleSaved(slug)}
                className="shrink-0 text-brand hover:opacity-70"
              >
                Убрать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
