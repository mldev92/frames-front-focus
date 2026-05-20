import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ChevronRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { getProduct, products } from "@/data/products";
import type { Product } from "@/data/types";
import { useCart, formatPrice } from "@/lib/store/cart";
import { ProductCard } from "@/components/ProductCard";
import { TryOnBadge, TryOnIcon } from "@/components/TryOnIcon";
import { PrescriptionInput } from "@/components/PrescriptionInput";
import { LensPurposeModal } from "@/components/LensPurposeModal";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { TBankWidget } from "@/components/TBankWidget";
import { Glasses } from "lucide-react";
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
  const [lensModal, setLensModal] = useState(false);
  const [vtoOpen, setVtoOpen] = useState(false);
  // Always show VTO — fall back to demo SKU when product has no custom model yet
  const vtoSku = product.vtoSku ?? "rayban_wayfarer_havane_marron";


  const specIcons: Record<string, string> = {
    "Длина дужки": "/icon_param_glasses_length.svg",
    "Ширина моста": "/icon_param_bridge_length.svg",
    "Ширина окуляра": "/icon_param_hinge_distance.svg",
  };

  const isLens = product.category === "kontaktnye-linzy";
  const isMisight = product.slug.toLowerCase().includes("misight");
  const showInstallment =
    ((product.category === "opravy" || product.category === "linzy-dlya-ochkov") &&
      product.price > 3500) ||
    (product.category === "kontaktnye-linzy" && isMisight);
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
          <div className="group/card relative bg-white rounded-sm overflow-hidden mb-3">
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="w-full h-auto object-contain"
            />
            <TryOnBadge
              className="absolute bottom-3 left-3"
              onClick={() => setVtoOpen(true)}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "w-16 h-16 bg-surface rounded-sm overflow-hidden border-2 flex items-center justify-center",
                  activeImg === i ? "border-brand" : "border-transparent",
                )}
              >
                <img src={img} alt="" className="max-w-full max-h-full object-contain" />
              </button>
            ))}
            {/* VTO thumbnail — always last in the strip */}
            <button
              onClick={() => setVtoOpen(true)}
              className="w-16 h-16 rounded-sm overflow-hidden border-2 border-transparent flex items-center justify-center bg-surface hover:border-brand transition-colors"
              aria-label="Примерить онлайн"
            >
              <TryOnIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-10 border-t border-border">
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
                  {product.specs.map((s) => {
                    const icon = specIcons[s.label];
                    return (
                      <div key={s.label} className="flex justify-between border-b border-border pb-2">
                        <dt className="text-muted-foreground flex items-center gap-2">
                          {icon && <img src={icon} alt="" className="opacity-60" style={{ width: 95, height: 37 }} />}
                          {s.label}
                        </dt>
                        <dd>{s.value}</dd>
                      </div>
                    );
                  })}
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

          {showInstallment && <TBankWidget />}

          {/* Availability + Product Code */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              В наличии
            </span>
            <span className="text-muted-foreground">
              Артикул: <span className="text-foreground">{product.slug}</span>
            </span>
          </div>

          <p className="mt-6 text-muted-foreground">{product.description}</p>

          {/* Colors + Lens button — side by side */}
          {(product.colors && product.colors.length > 0) && (
            <div className="mt-8">
              <div className="text-sm mb-3">
                Цвет: <span className="text-muted-foreground">{color}</span>
              </div>
              <div className="flex items-end gap-4">
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      aria-label={c.name}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all shrink-0",
                        color === c.name ? "border-foreground" : "border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                {(product.category === "opravy" ||
                  product.category === "linzy-dlya-ochkov") && (
                  <button
                    onClick={() => setLensModal(true)}
                    className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-sm hover:border-foreground transition-colors group"
                  >
                    <Glasses className="h-4 w-4 text-brand" />
                    <span className="text-sm font-medium whitespace-nowrap">Подобрать линзы</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Prescription + lens button (for lens-only products, or when no colors) */}
          {(isLens ||
            product.category === "opravy" ||
            product.category === "linzy-dlya-ochkov") && (
            <div className="mt-4 space-y-4">
              {(!product.colors || product.colors.length === 0) &&
                (product.category === "opravy" ||
                  product.category === "linzy-dlya-ochkov") && (
                  <button
                    onClick={() => setLensModal(true)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 border border-border rounded-sm hover:border-foreground transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Glasses className="h-5 w-5 text-brand" />
                      <div className="text-left">
                        <div className="text-sm font-medium">Подобрать линзы</div>
                        <div className="text-xs text-muted-foreground">
                          Для дали, близи, работы за компьютером и др.
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </button>
                )}
              <PrescriptionInput />
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <div className="flex gap-3">
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
            {(product.category === "opravy" ||
              product.category === "linzy-dlya-ochkov") && (
              <button
                onClick={() => {
                  add(product, { color, openDrawer: false });
                  toast.success(`«${product.name}» (без линз) добавлен в корзину`);
                }}
                className="w-full text-sm text-muted-foreground border border-border rounded-sm py-3 hover:text-foreground hover:border-foreground transition-colors"
              >
                Купить оправу без подбора линз
              </button>
            )}
          </div>

          {/* Trust strip */}
          <div className="mt-8 grid grid-cols-4 gap-4 text-xs text-muted-foreground">
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
            <div className="relative flex flex-col items-center text-center gap-1 group cursor-default">
              <img src="/icon_best_price_garanty.svg" alt="" className="h-5 w-5 opacity-60" />
              <span>Гарантия лучшей цены</span>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ink text-primary-foreground text-[11px] px-2.5 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Нашли дешевле? Снизим цену
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-serif text-2xl lg:text-3xl mb-8">Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <LensPurposeModal open={lensModal} onClose={() => setLensModal(false)} />
      <VirtualTryOnModal
        open={vtoOpen}
        onClose={() => setVtoOpen(false)}
        vtoSku={vtoSku}
      />
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
