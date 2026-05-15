import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart, formatPrice } from "@/lib/store/cart";
import { TryOnBadge } from "@/components/TryOnIcon";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { toggleSaved, saved } = useCart();
  const isSaved = saved.includes(product.slug);
  const hasHoverImage = product.images.length > 1;
  const [vtoOpen, setVtoOpen] = useState(false);
  const vtoSku = product.vtoSku ?? "rayban_wayfarer_havane_marron";

  const displayColors = product.colors?.slice(0, 3) ?? [];
  const extraCount = (product.colors?.length ?? 0) - displayColors.length;

  return (
    <div className="group/card">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
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
        />
        {hasHoverImage && (
          <img
            src={product.images[1]}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
          />
        )}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
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
        {/* Always-visible VTO badge — click opens modal without navigating */}
        <TryOnBadge
          className="absolute bottom-3 left-3"
          onClick={(e) => {
            e?.preventDefault();
            e?.stopPropagation();
            setVtoOpen(true);
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(product.slug);
          }}
          className={cn(
            "absolute top-3 right-3 p-2 bg-background/90 rounded-full hover:bg-background",
            "opacity-0 group-hover/card:opacity-100 transition-opacity duration-200",
            isSaved && "opacity-100",
          )}
          aria-label="Отложить"
        >
          <Heart className={cn("h-4 w-4", isSaved && "fill-brand text-brand")} />
        </button>
      </Link>
      <div className="mt-3 space-y-1.5">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{product.brand}</div>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
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

      <VirtualTryOnModal
        open={vtoOpen}
        onClose={() => setVtoOpen(false)}
        vtoSku={vtoSku}
      />
    </div>
  );
}
