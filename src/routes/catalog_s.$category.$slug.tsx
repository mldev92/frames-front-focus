import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, ChevronRight, Truck, ShieldCheck, RotateCcw, Check } from "lucide-react";
import { toast } from "sonner";
import { getProduct, products } from "@/data/products";
import { catalogHref } from "@/data/categories";
import type { Product } from "@/data/types";
import { useCart, formatPrice } from "@/lib/store/cart";
import { ProductCard } from "@/components/ProductCard";
import { TryOnBadge, TryOnIcon } from "@/components/TryOnIcon";
import { PrescriptionInput } from "@/components/PrescriptionInput";
import { LensPurposeModal } from "@/components/LensPurposeModal";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { TBankWidget } from "@/components/TBankWidget";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalog_s/$category/$slug")({
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
      <a href="/catalog_s/opravy/" className="text-brand mt-4 inline-block">
        В каталог
      </a>
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
  const [lensModal, setLensModal] = useState(false);
  const [vtoOpen, setVtoOpen] = useState(false);
  const vtoSku = product.vtoSku ?? "rayban_wayfarer_havane_marron";
  const selectedColor = product.colors?.find((item) => item.name === color);
  const galleryImages = selectedColor?.image
    ? [selectedColor.image, ...product.images.filter((img) => img !== selectedColor.image)]
    : product.images;
  const currentImage = galleryImages[activeImg] ?? galleryImages[0] ?? product.images[0];

  const specIcons: Record<string, string> = {
    "Длина дужки": "/icon_param_glasses_length.svg",
    "Ширина моста": "/icon_param_bridge_length.svg",
    "Ширина окуляра": "/icon_param_hinge_distance.svg",
  };

  const isLens = product.category === "kontaktnye-linzy";
  const isFrameLike =
    product.category === "opravy" || product.category === "linzy-dlya-ochkov";
  const showTryOn =
    product.category !== "kontaktnye-linzy" && product.category !== "linzy-dlya-ochkov";
  const isMisight = product.slug.toLowerCase().includes("misight");
  const showInstallment =
    (isFrameLike && product.price > 3500) ||
    (product.category === "kontaktnye-linzy" && isMisight);
  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  const includedFeatures = [
    "Однодневная сборка в салоне",
    "Бесплатная подгонка по лицу",
    "Покрытие от царапин на 12 месяцев",
    "Защита от ультрафиолета и бликов",
    "Жёсткий футляр и салфетка из микрофибры",
    "Возврат и обмен в течение 14 дней",
    "Гарантия лучшей цены",
  ];

  const handlePrimaryCta = () => {
    if (isFrameLike) {
      setLensModal(true);
    } else {
      add(product, { color, image: currentImage });
      toast.success(`«${product.name}» добавлен в корзину`);
    }
  };

  return (
    <div className="px-4 pb-28 pt-8 lg:px-10 lg:pb-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
        <Link to="/" className="hover:text-foreground">Главная</Link>
        <ChevronRight className="h-3 w-3" />
        <a
          href={catalogHref(product.category)}
          className="hover:text-foreground capitalize"
        >
          {categoryName(product.category)}
        </a>
        <ChevronRight className="h-3 w-3" />
        <span>{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">
        {/* LEFT: gallery + long content */}
        <div className="min-w-0">
          {/* Gallery with vertical thumb rail */}
          <div className="flex gap-3">
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "w-16 h-16 bg-surface rounded-sm overflow-hidden border-2 flex items-center justify-center",
                    activeImg === i ? "border-brand" : "border-transparent hover:border-border",
                  )}
                >
                  <img
                    src={img}
                    alt=""
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
              {showTryOn && (
                <button
                  onClick={() => setVtoOpen(true)}
                  className="w-16 h-16 rounded-sm overflow-hidden border-2 border-transparent flex items-center justify-center bg-surface hover:border-brand transition-colors"
                  aria-label="Примерить онлайн"
                >
                  <TryOnIcon className="h-6 w-6" />
                </button>
              )}
            </div>

            <div className="relative flex-1 bg-surface rounded-lg overflow-hidden flex items-center justify-center min-h-[420px] lg:min-h-[560px]">
              <img
                src={currentImage}
                alt={product.name}
                className="max-w-[80%] max-h-[80%] object-contain mix-blend-multiply"
              />
              {showTryOn && (
                <TryOnBadge
                  variant="pill"
                  label="Примерить"
                  className="absolute top-4 right-4"
                  onClick={() => setVtoOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Mobile thumb strip */}
          <div className="sm:hidden mt-3 grid grid-cols-5 gap-2">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "aspect-square bg-surface rounded-sm overflow-hidden border-2 flex items-center justify-center",
                  activeImg === i ? "border-brand" : "border-transparent",
                )}
              >
                <img
                  src={img}
                  alt=""
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </button>
            ))}
          </div>

          {/* Included for price */}
          <section className="mt-12">
            <h2 className="font-serif text-2xl mb-5">
              Что входит за {formatPrice(product.price)}
            </h2>
            <ul className="space-y-3">
              {includedFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-brand shrink-0">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Accordion sections */}
          <Accordion
            type="multiple"
            defaultValue={["specs"]}
            className="mt-10 border-t border-border"
          >
            <AccordionItem value="specs">
              <AccordionTrigger className="text-base py-5">Характеристики</AccordionTrigger>
              <AccordionContent>
                <dl className="space-y-2">
                  {product.specs.map((s) => {
                    const icon = specIcons[s.label];
                    return (
                      <div
                        key={s.label}
                        className="flex justify-between border-b border-border pb-2"
                      >
                        <dt className="text-muted-foreground flex items-center gap-2">
                          {icon && (
                            <img
                              src={icon}
                              alt=""
                              className="opacity-60"
                              style={{ width: 95, height: 37 }}
                            />
                          )}
                          {s.label}
                        </dt>
                        <dd>{s.value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </AccordionContent>
            </AccordionItem>

            {(isLens || isFrameLike) && (
              <AccordionItem value="rx">
                <AccordionTrigger className="text-base py-5">
                  Нужен рецепт?
                </AccordionTrigger>
                <AccordionContent>
                  <PrescriptionInput />
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="guide">
              <AccordionTrigger className="text-base py-5">Как подобрать</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Не уверены в размере? Запишитесь на бесплатный подбор в любом из наших
                  салонов — оптики помогут с выбором формы и посадкой.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger className="text-base py-5">
                Доставка и возврат
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Доставка по СПб от 1 дня</li>
                  <li>• Самовывоз из салонов — бесплатно</li>
                  <li>• Оплата картой, наличными, СБП</li>
                  <li>• Возврат и обмен в течение 14 дней</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="brand">
              <AccordionTrigger className="text-base py-5">
                О бренде {product.brand}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  {product.brand} — один из брендов, представленных в ОПТИКА 100%. Подробнее
                  о коллекции и наличии моделей уточняйте у консультантов.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* RIGHT: sticky purchase card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative bg-background border border-border rounded-lg shadow-sm p-6">
            <button
              onClick={() => toggleSaved(product.slug)}
              aria-label="Отложить"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface transition-colors"
            >
              <Heart
                className={cn("h-5 w-5", isSaved && "fill-brand text-brand")}
              />
            </button>

            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.brand}
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl mt-1 pr-10">{product.name}</h1>

            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                В наличии
              </span>
              <span className="text-muted-foreground">Арт. {product.slug}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-serif text-3xl">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {showInstallment && (
              <div className="mt-2">
                <TBankWidget />
              </div>
            )}

            {product.badges && product.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.badges.map((b) => (
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
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="mt-5">
                <div className="text-xs text-muted-foreground mb-2">
                  Цвет: <span className="text-foreground">{color}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setColor(c.name);
                        if (c.image) setActiveImg(0);
                      }}
                      aria-label={c.name}
                      className={cn(
                        "w-9 h-9 rounded-full border-2 transition-all shrink-0",
                        color === c.name ? "border-foreground" : "border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 space-y-2.5">
              <button
                onClick={handlePrimaryCta}
                className="w-full bg-brand text-brand-foreground py-3.5 rounded-full hover:opacity-90 font-medium transition-opacity"
              >
                {isFrameLike ? "Подобрать линзы и купить" : "В корзину"}
              </button>
              {isFrameLike && (
                <button
                  onClick={() => {
                    add(product, { color, openDrawer: false, image: currentImage });
                    toast.success(`«${product.name}» (без линз) добавлен в корзину`);
                  }}
                  className="w-full text-sm text-muted-foreground border border-border rounded-full py-3 hover:text-foreground hover:border-foreground transition-colors"
                >
                  Купить оправу без линз
                </button>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-border grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="h-4 w-4" />
                Доставка
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                Гарантия
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RotateCcw className="h-4 w-4" />
                Возврат 14 дн.
              </div>
            </div>
          </div>
        </aside>
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {selectedColor ? `Цвет: ${selectedColor.name}` : product.brand}
            </div>
            <div className="font-serif text-xl leading-tight">{formatPrice(product.price)}</div>
          </div>
          <button
            onClick={handlePrimaryCta}
            className="shrink-0 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
          >
            {isFrameLike ? (
              <>
                <span className="sm:hidden">Подобрать</span>
                <span className="hidden sm:inline">Подобрать линзы</span>
              </>
            ) : (
              "В корзину"
            )}
          </button>
        </div>
      </div>

      <LensPurposeModal
        open={lensModal}
        onClose={() => setLensModal(false)}
        product={product}
        selectedColor={color}
        onComplete={({ lensLabel, lensPrice }) => {
          add(product, {
            color,
            image: currentImage,
            lensLabel,
            lensPrice,
          });
          toast.success(`Комплект «${product.name}» добавлен в корзину`);
        }}
      />
      {showTryOn && (
        <VirtualTryOnModal
          open={vtoOpen}
          onClose={() => setVtoOpen(false)}
          vtoSku={vtoSku}
        />
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
