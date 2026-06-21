import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ChevronRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { catalogSectionTitle } from "@/data/categories";
import type { Product } from "@/data/types";
import { useCart, formatPrice } from "@/lib/store/cart";
import { ProductCard } from "@/components/ProductCard";
import { TryOnBadge, TryOnIcon } from "@/components/TryOnIcon";
import { ProductInfoSections } from "@/components/ProductInfoSections";
import { getProductDisplayBrand } from "@/lib/product";
import { LensWizard } from "@/components/LensWizard/LensWizard";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { TBankWidget } from "@/components/TBankWidget";
import { cn } from "@/lib/utils";
import type { EyePrescription, Prescription } from "@/lib/store/cart";
import { prescriptionComplete } from "@/components/PrescriptionInput";
import { useCityStore, type CityCode } from "@/lib/store/city";
import { CatalogRouteView } from "@/components/CatalogRouteView";
import {
  applyCatalogState,
  catalogSearchSchema,
  resolveCatalogRoute,
  type CatalogSearch,
} from "@/lib/catalog-route";

export const Route = createFileRoute("/catalog_s/$category/$slug")({
  validateSearch: (search: Record<string, unknown>) => catalogSearchSchema.parse(search),
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps, abortController }) => {
    const resolved = await resolveCatalogRoute(
      `${params.category}/${params.slug}`,
      deps,
      "spb",
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
        links: [{
          rel: "canonical",
          href: `https://optika100.com/catalog_s/${params.category}/${params.slug}/`,
        }],
      };
    }
    const p = loaderData.data.product;
    return {
      meta: [
        { title: `${p.brand} ${p.name} — купить · ОПТИКА 100%` },
        { name: "description", content: p.description },
        { property: "og:title", content: `${p.brand} ${p.name}` },
        { property: "og:description", content: p.description },
        { property: "og:image", content: p.images[0] },
        { property: "og:type", content: "product" },
      ],
      links: [
        {
          rel: "canonical",
          href: `https://optika100.com/catalog_s/${params.category}/${params.slug}/`,
        },
      ],
    };
  },
  component: ProductRoutePage,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="font-serif text-3xl">Товар не найден</h1>
      <a href="/catalog_s/opravy/" className="text-brand mt-4 inline-block">
        В каталог
      </a>
    </div>
  ),
});

export interface ProductRouteData {
  product: Product;
  related: Product[];
}

function ProductRoutePage() {
  const params = Route.useParams();
  const resolved = Route.useLoaderData();
  const search = Route.useSearch() as CatalogSearch;
  const navigate = Route.useNavigate();

  if (resolved.kind === "catalog") {
    return (
      <CatalogRouteView
        sectionPath={resolved.sectionPath}
        catalogPath={`/catalog_s/${resolved.sectionPath}`}
        city="spb"
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
    <ProductPage
      data={resolved.data}
      city="spb"
      catalogPath={`/catalog_s/${params.category}`}
    />
  );
}

export function ProductPage({
  data,
  city,
  catalogPath,
}: {
  data: ProductRouteData;
  city: CityCode;
  catalogPath: string;
}) {
  const { product, related } = data;
  const setCity = useCityStore((state) => state.setCity);
  const displayBrand = getProductDisplayBrand(product);
  const { add, toggleSaved, saved } = useCart();
  const isSaved = saved.includes(product.slug);
  const [color, setColor] = useState(
    product.lensOptions?.colors?.options[0]?.label ?? product.colors?.[0]?.name,
  );
  const [activeImg, setActiveImg] = useState(0);
  const [lensModal, setLensModal] = useState(false);
  const [vtoOpen, setVtoOpen] = useState(false);
  const [prescription, setPrescription] = useState<Prescription>({ right: {}, left: {} });
  const [lensEyeMode, setLensEyeMode] = useState<"same" | "different">("same");
  const vtoSku = product.vtoSku ?? "rayban_wayfarer_havane_marron";
  const selectedColor = product.colors?.find((item) => item.name === color);
  const galleryImages = selectedColor?.image
    ? [selectedColor.image, ...product.images.filter((img) => img !== selectedColor.image)]
    : product.images;
  const currentImage =
    galleryImages[activeImg] ?? galleryImages[0] ?? product.images[0] ?? "/no-product-image.svg";

  useEffect(() => setCity(city), [city, setCity]);

  const isLens = product.category === "kontaktnye-linzy";
  const isFrameLike = product.category === "opravy" || product.category === "linzy-dlya-ochkov";
  const showTryOn =
    product.category !== "kontaktnye-linzy" && product.category !== "linzy-dlya-ochkov";
  const isMisight = product.slug.toLowerCase().includes("misight");
  const showInstallment =
    (isFrameLike && product.price > 3500) || (product.category === "kontaktnye-linzy" && isMisight);
  const lensQty = isLens && lensEyeMode === "different" ? 2 : 1;
  const lensTotal = product.price * lensQty;

  useEffect(() => {
    if (!isLens || !product.lensOptions) return;
    if (!color && product.lensOptions.colors?.options[0]) {
      setColor(product.lensOptions.colors.options[0].label);
    }
    setPrescription((current) => {
      const right = defaultLensEye(product, current.right);
      const left = lensEyeMode === "same" ? { ...right } : defaultLensEye(product, current.left);
      if (eyesEqual(current.right, right) && eyesEqual(current.left, left)) return current;
      return { right, left };
    });
  }, [color, isLens, lensEyeMode, product]);

  const handlePrimaryCta = () => {
    if (isFrameLike) {
      setLensModal(true);
    } else {
      if (isLens && !lensPurchaseComplete(product, prescription)) {
        toast.error("Заполните доступные параметры для обоих глаз");
        return;
      }
      add(product, {
        color,
        image: currentImage,
        prescription: isLens ? prescription : undefined,
        lensEyeMode: isLens ? lensEyeMode : undefined,
        qty: lensQty,
        city,
      });
      toast.success(`«${product.name}» добавлен в корзину`);
    }
  };

  return (
    <div className="product-detail-page px-4 pb-28 pt-8 lg:px-10 lg:pb-8">
      {/* Breadcrumbs */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
        <Link to="/" className="hover:text-foreground">
          Главная
        </Link>
        <ChevronRight className="h-3 w-3" />
        <a href={`${catalogPath.replace(/\/$/, "")}/`} className="hover:text-foreground capitalize">
          {catalogSectionTitle(catalogPath, categoryName(product.category))}
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
                    referrerPolicy="no-referrer"
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

            <div className="group relative flex min-h-[420px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-surface lg:min-h-[560px]">
              <img
                key={currentImage}
                src={currentImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="product-gallery-image max-h-[80%] max-w-[80%] object-contain mix-blend-multiply"
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
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </button>
            ))}
          </div>

          <ProductInfoSections
            product={product}
            showPrescription={!isLens && isFrameLike}
            prescriptionVariant={isLens ? "contacts" : "frames"}
            prescription={prescription}
            onPrescriptionChange={setPrescription}
          />
        </div>

        {/* RIGHT: sticky purchase card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative rounded-xl border border-border bg-card p-6 shadow-sm">
            <button
              onClick={() => toggleSaved(product.slug)}
              aria-label="Отложить"
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface transition-colors"
            >
              <Heart className={cn("h-5 w-5", isSaved && "fill-brand text-brand")} />
            </button>

            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {displayBrand}
            </div>
            <h1 className="font-serif text-2xl lg:text-3xl mt-1 pr-10">{product.name}</h1>

            <div className="mt-2 flex items-center gap-3 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  product.inStock === false ? "text-amber-700" : "text-green-700",
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    product.inStock === false ? "bg-amber-600" : "bg-green-600",
                  )}
                />
                {product.inStock === false ? "Наличие уточняйте" : "В наличии"}
              </span>
              <span className="text-muted-foreground">Арт. {product.slug}</span>
            </div>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-serif text-3xl">{formatPrice(isLens ? lensTotal : product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(isLens ? product.oldPrice * lensQty : product.oldPrice)}
                </span>
              )}
            </div>
            {isLens && lensQty > 1 && (
              <div className="mt-1 text-xs text-muted-foreground">
                {formatPrice(product.price)} × 2 упаковки
              </div>
            )}

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
                      b === "Скидка" ? "bg-brand text-brand-foreground" : "bg-surface",
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

            {isLens && product.lensOptions && (
              <LensPurchaseOptions
                product={product}
                color={color}
                onColorChange={setColor}
                eyeMode={lensEyeMode}
                onEyeModeChange={(mode) => {
                  setLensEyeMode(mode);
                  if (mode === "same") {
                    setPrescription((current) => ({ right: current.right, left: { ...current.right } }));
                  }
                }}
                prescription={prescription}
                onPrescriptionChange={setPrescription}
              />
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
                    add(product, { color, openDrawer: false, image: currentImage, city });
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
              <ProductCard key={p.slug} product={p} catalogPath={catalogPath} city={city} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {selectedColor ? `Цвет: ${selectedColor.name}` : displayBrand}
            </div>
            <div className="font-serif text-xl leading-tight">{formatPrice(product.price)}</div>
            {isLens && lensQty > 1 && (
              <div className="text-[11px] text-muted-foreground">Итого: {formatPrice(lensTotal)}</div>
            )}
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

      <LensWizard
        open={lensModal}
        onClose={() => setLensModal(false)}
        frame={product}
      />
      {showTryOn && (
        <VirtualTryOnModal open={vtoOpen} onClose={() => setVtoOpen(false)} vtoSku={vtoSku} />
      )}
    </div>
  );
}

const LENS_OPTION_FIELDS: Array<{
  key: Exclude<keyof NonNullable<Product["lensOptions"]>, "eyeModes" | "colors">;
  prescriptionKey: keyof EyePrescription;
}> = [
  { key: "sphere", prescriptionKey: "sphere" },
  { key: "cylinder", prescriptionKey: "cylinder" },
  { key: "axis", prescriptionKey: "axis" },
  { key: "addition", prescriptionKey: "addition" },
  { key: "curvatureRadius", prescriptionKey: "bc" },
  { key: "diameter", prescriptionKey: "diameter" },
];

function lensPurchaseFields(product: Product) {
  return LENS_OPTION_FIELDS.filter(({ key }) => {
    const options = product.lensOptions?.[key]?.options;
    return Array.isArray(options) && options.length > 0;
  });
}

function defaultLensEye(product: Product, current: EyePrescription): EyePrescription {
  const next = { ...current };
  for (const { key, prescriptionKey } of lensPurchaseFields(product)) {
    if (!next[prescriptionKey]) {
      next[prescriptionKey] = product.lensOptions?.[key]?.options[0]?.label;
    }
  }
  return next;
}

function eyesEqual(a: EyePrescription, b: EyePrescription): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function lensPurchaseComplete(product: Product, value: Prescription): boolean {
  const fields = lensPurchaseFields(product);
  if (!fields.length) return prescriptionComplete(product, value);
  return fields.every(({ prescriptionKey }) =>
    Boolean(value.right[prescriptionKey]) && Boolean(value.left[prescriptionKey]),
  );
}

function LensPurchaseOptions({
  product,
  color,
  onColorChange,
  eyeMode,
  onEyeModeChange,
  prescription,
  onPrescriptionChange,
}: {
  product: Product;
  color?: string;
  onColorChange: (value: string) => void;
  eyeMode: "same" | "different";
  onEyeModeChange: (value: "same" | "different") => void;
  prescription: Prescription;
  onPrescriptionChange: (value: Prescription) => void;
}) {
  const fields = lensPurchaseFields(product);
  const colorOptions = product.lensOptions?.colors?.options ?? [];

  const updateEye = (eye: "right" | "left", field: keyof EyePrescription, next: string) => {
    const updated: Prescription = {
      ...prescription,
      [eye]: { ...prescription[eye], [field]: next },
    };
    if (eyeMode === "same" && eye === "right") {
      updated.left = { ...updated.right };
    }
    onPrescriptionChange(updated);
  };

  return (
    <section className="mt-6 border-t border-border pt-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold">Параметры линз</h2>
        {eyeMode === "different" && (
          <span className="text-xs text-muted-foreground">2 упаковки</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onEyeModeChange("same")}
          className={cn(
            "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
            eyeMode === "same" ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground",
          )}
        >
          Одинаковые параметры
        </button>
        <button
          type="button"
          onClick={() => onEyeModeChange("different")}
          className={cn(
            "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
            eyeMode === "different" ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground",
          )}
        >
          Разные параметры
        </button>
      </div>

      {fields.length > 0 && (
        <div className="mt-4 space-y-4">
          {(["right", "left"] as const).map((eye) => (
            <div
              key={eye}
              className={cn(
                "space-y-3 rounded-xl border border-border bg-surface/40 p-3",
                eye === "left" && eyeMode === "same" && "hidden",
              )}
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {eyeMode === "different"
                  ? eye === "right" ? "Правый глаз (OD)" : "Левый глаз (OS)"
                  : "Оба глаза"}
              </div>
              {fields.map(({ key, prescriptionKey }) => {
                const field = product.lensOptions?.[key];
                if (!field) return null;
                return (
                  <label key={`${eye}-${key}`} className="block">
                    <span className="mb-1 block text-xs text-muted-foreground">{field.label}</span>
                    <select
                      value={prescription[eye][prescriptionKey] ?? ""}
                      onChange={(event) => updateEye(eye, prescriptionKey, event.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    >
                      {field.options.map((option) => (
                        <option key={option.id} value={option.label}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {colorOptions.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs text-muted-foreground">
            Цвет: <span className="text-foreground">{color}</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(46px,1fr))] gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onColorChange(option.label)}
                title={option.label}
                aria-label={option.label}
                className={cn(
                  "flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-card p-1 transition-colors",
                  color === option.label ? "border-foreground ring-2 ring-foreground/10" : "border-border hover:border-foreground",
                )}
              >
                {option.image ? (
                  <img
                    src={option.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-medium">{option.label.slice(0, 2)}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function categoryName(c: string) {
  switch (c) {
    case "opravy":
      return "Оправы";
    case "solntsezashchitnye":
      return "Солнцезащитные";
    case "kontaktnye-linzy":
      return "Контактные линзы";
    case "linzy-dlya-ochkov":
      return "Линзы для очков";
    case "aksessuary":
      return "Аксессуары";
    default:
      return c;
  }
}
