import type { CSSProperties } from "react";
import type { CatalogBannerData } from "@/data/catalog-banners";
import { useCityStore } from "@/lib/store/city";
import { diagnosticsHref } from "@/data/services";
import { cn } from "@/lib/utils";

interface CatalogBannerProps {
  banner: CatalogBannerData;
  className?: string;
  style?: CSSProperties;
}

const variantClasses: Record<
  CatalogBannerData["variant"],
  { eyebrow: string; dot: string; cta: string }
> = {
  category: {
    eyebrow: "text-cream",
    dot: "bg-brand",
    cta: "bg-background text-ink",
  },
  service: {
    eyebrow: "text-cream",
    dot: "bg-brand",
    cta: "bg-background text-ink",
  },
  guide: {
    eyebrow: "text-cream",
    dot: "bg-cream",
    cta: "border border-white/45 bg-white/10 text-cream backdrop-blur-sm",
  },
  promo: {
    eyebrow: "text-[#ffd9c2]",
    dot: "bg-brand",
    cta: "bg-brand text-cream",
  },
};

export function CatalogBanner({ banner, className, style }: CatalogBannerProps) {
  const variant = variantClasses[banner.variant];
  const city = useCityStore((state) => state.city);
  const href = banner.href === "/kabinet-diagnostiki-spb" ? diagnosticsHref(city) : banner.href;
  const isInteractive = Boolean(href && banner.cta);
  const BannerTag = isInteractive ? "a" : "div";

  return (
    <div className={cn("h-full min-h-0", className)} style={style}>
      <BannerTag
        {...(isInteractive ? { href } : {})}
        className="catalog-banner group/banner relative isolate block h-full min-h-[260px] overflow-hidden rounded-md bg-ink text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        {...(isInteractive ? { "aria-label": `${banner.title}: ${banner.cta}` } : {})}
      >
        <img
          src={banner.image}
          alt=""
          loading="lazy"
          className="catalog-banner__image absolute inset-0 h-full w-full object-cover"
        />
        <span
          className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.16_0.012_250/0.9)_0%,oklch(0.16_0.012_250/0.64)_30%,oklch(0.16_0.012_250/0.14)_60%,transparent_82%)]"
          aria-hidden="true"
        />
        <span className="absolute inset-0 bg-ink/5" aria-hidden="true" />

        {banner.badge && (
          <span className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-brand font-serif text-[15px] font-medium text-cream shadow-lg sm:right-3.5 sm:top-3.5 sm:h-[52px] sm:w-[52px] sm:text-[17px]">
            {banner.badge}
          </span>
        )}

        <span className="absolute inset-x-0 bottom-0 z-[1] flex flex-col items-start p-3.5 sm:p-5 lg:p-6">
          <span
            className={cn(
              "mb-2.5 inline-flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.13em] sm:mb-3 sm:text-[10px] sm:tracking-[0.16em]",
              variant.eyebrow,
            )}
          >
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", variant.dot)} />
            {banner.eyebrow}
          </span>

          <span className="max-w-full font-serif text-[21px] leading-[1.04] tracking-[-0.015em] text-cream [text-shadow:0_1px_18px_oklch(0.16_0.012_250/0.35)] sm:text-[25px] lg:text-[28px]">
            {banner.title}
          </span>

          {banner.description && (
            <span className="mt-2 hidden max-w-[26ch] text-[12px] leading-[1.4] text-cream/80 sm:block lg:text-[13px]">
              {banner.description}
            </span>
          )}

          {banner.meta && (
            <span className="mt-3 inline-flex max-w-full rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-medium text-cream/90 backdrop-blur-sm sm:mt-4 sm:text-[11px]">
              {banner.meta}
            </span>
          )}

          {banner.note && (
            <span className="mt-3 max-w-[34ch] text-[11px] leading-[1.45] text-cream/82 sm:mt-3.5 sm:text-[12px] lg:text-[12.5px]">
              {banner.note}
            </span>
          )}

          {banner.cta && (
            <span
              className={cn(
                "catalog-banner__cta mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-medium sm:mt-4 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[12px] lg:mt-[18px] lg:px-[18px] lg:text-[13px]",
                variant.cta,
              )}
            >
              {banner.cta}
              <svg
                className="catalog-banner__arrow h-3.5 w-3.5 shrink-0"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h9M8.5 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </span>
      </BannerTag>
    </div>
  );
}
