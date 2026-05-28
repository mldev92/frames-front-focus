import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart, formatPrice } from "@/lib/store/cart";
import { categoryToSegment } from "@/data/categories";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  compactLensPreview?: boolean;
}

const noTryOnCategories = new Set<Product["category"]>([
  "kontaktnye-linzy",
  "linzy-dlya-ochkov",
]);

export function ProductCard({ product, compactLensPreview = false }: ProductCardProps) {
  const { toggleSaved, saved } = useCart();
  const isSaved = saved.includes(product.slug);
  const hasHoverImage = product.images.length > 1;
  const [vtoOpen, setVtoOpen] = useState(false);
  const vtoSku = product.vtoSku ?? "rayban_wayfarer_havane_marron";
  const showTryOn = !noTryOnCategories.has(product.category);
  const imagePadding = compactLensPreview && product.category === "kontaktnye-linzy" ? "15%" : undefined;

  const displayColors = product.colors?.slice(0, 3) ?? [];
  const extraCount = (product.colors?.length ?? 0) - displayColors.length;

  return (
    <div className="group/card">
      <Link
        to="/catalog_s/$category/$slug"
        params={{ category: categoryToSegment[product.category], slug: product.slug }}
        className="block relative aspect-square bg-white rounded-sm overflow-hidden"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={cn(
            "absolute inset-0 w-full h-full object-contain transition-opacity duration-500",
            hasHoverImage ? "opacity-100 group-hover/card:opacity-0" : "opacity-100",
          )}
          style={imagePadding ? { padding: imagePadding } : undefined}
        />
        {hasHoverImage && (
          <img
            src={product.images[1]}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
            style={imagePadding ? { padding: imagePadding } : undefined}
          />
        )}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-14 left-3 z-10 flex flex-col gap-1">
            {product.badges.map((b) => (
              <span
                key={b}
                className={cn(
                  "text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm",
                  b === "Скидка"
                    ? "bg-brand text-brand-foreground"
                    : "bg-background text-foreground",
                )}
              >
                {b}
              </span>
            ))}
          </div>
        )}
        {showTryOn && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setVtoOpen(true);
            }}
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-brand active:translate-y-0 active:scale-[0.98]"
            style={{
              borderColor: "color-mix(in oklch, var(--foreground) 14%, transparent)",
              background: "color-mix(in oklch, white 92%, transparent)",
            }}
            aria-label="Примерить"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.402 2.652a.25.25 0 0 0-.25.25v2a.75.75 0 1 1-1.5 0v-2c0-.966.784-1.75 1.75-1.75h2a.75.75 0 1 1 0 1.5h-2Zm11.146.25a.25.25 0 0 0-.25-.25h-2a.75.75 0 0 1 0-1.5h2c.967 0 1.75.784 1.75 1.75v2a.75.75 0 0 1-1.5 0v-2ZM2.402 14.048a.25.25 0 0 1-.25-.25v-2a.75.75 0 1 0-1.5 0v2c0 .966.784 1.75 1.75 1.75h2a.75.75 0 0 0 0-1.5h-2Zm10.896 0a.25.25 0 0 0 .25-.25v-2a.75.75 0 0 1 1.5 0v2a1.75 1.75 0 0 1-1.75 1.75h-2a.75.75 0 0 1 0-1.5h2ZM8 7.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-3.75 4.5a3.75 3.75 0 1 1 7.5 0h-1.5a2.25 2.25 0 1 0-4.5 0h-1.5Z"
                fill="currentColor"
              />
            </svg>
            <span>Примерить</span>
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaved(product.slug);
          }}
          className="absolute top-3 left-3 z-10 flex items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            background: "transparent",
            color: "var(--brand)",
          }}
          aria-label="В избранное"
        >
          <Heart
            className="h-5 w-5"
            strokeWidth={1.75}
            fill={isSaved ? "var(--brand)" : "none"}
          />
        </button>
      </Link>
      <div className="mt-3 space-y-1.5">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</div>
        <Link
          to="/catalog_s/$category/$slug"
          params={{ category: categoryToSegment[product.category], slug: product.slug }}
          className="block text-base font-semibold leading-snug hover:text-brand transition-colors"
        >
          {product.name}
        </Link>
        {product.colors && product.colors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayColors.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground border border-border rounded-full px-2 py-0.5"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
                {c.name}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="inline-flex items-center text-[11px] text-muted-foreground border border-border rounded-full px-2 py-0.5">
                +{extraCount}
              </span>
            )}
          </div>
        )}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-semibold text-sm">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>

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
