import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import type { Product } from "@/data/types";
import { useCart, formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { toggleSaved, saved } = useCart();
  const isSaved = saved.includes(product.slug);

  return (
    <div className="group">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block relative aspect-square bg-surface rounded-sm overflow-hidden"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
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
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(product.slug);
          }}
          className="absolute top-3 right-3 p-2 bg-background/90 rounded-full hover:bg-background"
          aria-label="Отложить"
        >
          <Heart
            className={cn("h-4 w-4", isSaved && "fill-brand text-brand")}
          />
        </button>
      </Link>
      <div className="mt-3">
        <div className="text-xs text-muted-foreground">{product.brand}</div>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="block font-medium hover:text-brand transition-colors"
        >
          {product.name}
        </Link>
        {product.colors && product.colors.length > 0 && (
          <div className="mt-1.5 flex gap-1">
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.name}
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-medium">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
