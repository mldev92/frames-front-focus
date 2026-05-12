import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ChevronRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getProduct, products } from "@/data/products";
import type { Product } from "@/data/types";
import { useCart, formatPrice } from "@/lib/store/cart";
import { ProductCard } from "@/components/ProductCard";
import { TryOnBadge, TryOnIcon } from "@/components/TryOnIcon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Товар · ОПТИКА 100%" }] };
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.brand} ${p.name} — купить · ОПТИКА 100%` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.brand} ${p.name}` },
        { property: "og:description", content: p.description },
        { property: "og:image", content: p.images[0] },
        { property: "og:type", content: "product" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="font-serif text-3xl">Товар не найден</h1>
      <Link to="/opravy" className="text-brand mt-4 inline-block">
        В каталог
      </Link>
    </div>
  ),
});

function ProductPage() {
  const data = Route.useLoaderData() as { product: Product };
  const { product } = data;
  const { add, toggleSaved, saved } = useCart();
  const isSaved = saved.includes(product.slug);
  const [color, setColor] = useState(product.colors?.[0]?.name);
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState<"specs" | "delivery" | "guide">("specs");

  const isLens = product.category === "kontaktnye-linzy";
  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
        <Link to="/" className="hover:text-foreground">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <a
          href={`/${product.category}`}
          className="hover:text-foreground capitalize"
        >
          {categoryName(product.category)}
        </a>
        <ChevronRight className="h-3 w-3" />
        <span>{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-surface rounded-sm overflow-hidden mb-3">
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "aspect-square bg-surface rounded-sm overflow-hidden border-2",
                    activeImg === i ? "border-brand" : "border-transparent",
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </div>
          <h1 className="font-serif text-3xl lg:text-4xl mt-1">{product.name}</h1>
          <div className="mt-3 flex gap-1.5">
            {product.badges?.map((b) => (
              <span
                key={b}
                className={cn(
                  "text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm",
                  b === "Скидка"
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface",
                )}
              >
                {b}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-3xl">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <p className="mt-6 text-muted-foreground">{product.description}</p>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-8">
              <div className="text-sm mb-3">
                Цвет: <span className="text-muted-foreground">{color}</span>
              </div>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    aria-label={c.name}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      color === c.name ? "border-foreground" : "border-border",
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Lens prescription */}
          {isLens && (
            <div className="mt-8 p-4 bg-surface rounded-sm">
              <div className="text-sm font-medium mb-3">Параметры рецепта</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {["SPH", "BC", "DIA"].map((p) => (
                  <label key={p} className="block">
                    <span className="block text-xs text-muted-foreground mb-1">
                      {p}
                    </span>
                    <select className="w-full bg-background border border-border rounded-sm px-2 py-1.5">
                      <option>—</option>
                      {p === "SPH" &&
                        ["-1.00", "-1.50", "-2.00", "-2.50", "-3.00", "-4.00"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      {p === "BC" && ["8.4", "8.6", "8.8"].map((v) => <option key={v}>{v}</option>)}
                      {p === "DIA" && ["14.0", "14.2"].map((v) => <option key={v}>{v}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => {
                add(product, { color });
                toast.success(`«${product.name}» добавлен в корзину`);
              }}
              className="flex-1 bg-ink text-primary-foreground py-4 rounded-sm hover:opacity-90 font-medium"
            >
              В корзину
            </button>
            <button
              onClick={() => toggleSaved(product.slug)}
              aria-label="Отложить"
              className={cn(
                "px-5 border border-border rounded-sm hover:bg-accent",
                isSaved && "bg-surface",
              )}
            >
              <Heart
                className={cn("h-5 w-5", isSaved && "fill-brand text-brand")}
              />
            </button>
          </div>

          {/* Trust strip */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div className="flex flex-col items-center text-center gap-1">
              <Truck className="h-5 w-5" />
              Доставка по СПб
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <ShieldCheck className="h-5 w-5" />
              Гарантия 12 мес
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <RotateCcw className="h-5 w-5" />
              Возврат 14 дней
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12 border-t border-border">
            <div className="flex gap-6 border-b border-border text-sm">
              {[
                ["specs", "Характеристики"],
                ["guide", "Как подобрать"],
                ["delivery", "Доставка"],
              ].map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k as typeof tab)}
                  className={cn(
                    "py-4 border-b-2 -mb-px",
                    tab === k ? "border-foreground" : "border-transparent text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="py-6 text-sm">
              {tab === "specs" && (
                <dl className="space-y-2">
                  {product.specs.map((s) => (
                    <div key={s.label} className="flex justify-between border-b border-border pb-2">
                      <dt className="text-muted-foreground">{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {tab === "guide" && (
                <p className="text-muted-foreground">
                  Не уверены в размере? Запишитесь на бесплатный подбор в любом из наших
                  салонов — оптики помогут с выбором формы и посадкой.
                </p>
              )}
              {tab === "delivery" && (
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Доставка по СПб от 1 дня</li>
                  <li>• Самовывоз из салонов — бесплатно</li>
                  <li>• Оплата картой, наличными, СБП</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-serif text-2xl lg:text-3xl mb-8">С этим покупают</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function categoryName(c: string) {
  switch (c) {
    case "opravy": return "Оправы";
    case "solntsezashchitnye": return "Солнцезащитные";
    case "kontaktnye-linzy": return "Контактные линзы";
    case "linzy-dlya-ochkov": return "Линзы для очков";
    case "aksessuary": return "Аксессуары";
    default: return c;
  }
}
