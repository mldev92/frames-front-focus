import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CallbackModal } from "./CallbackModal";
import type { Promotion } from "@/data/promotions";

function useTimeLeft(expiresAt?: Date) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!expiresAt) return;
    function update() {
      const diff = Math.max(0, expiresAt!.getTime() - Date.now());
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      if (days > 0) setLabel(`осталось ${days} ${days === 1 ? "день" : "дня"}`);
      else if (hrs > 0) setLabel(`осталось ${hrs} ч`);
      else setLabel("последние часы");
    }
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return label;
}

const visualClasses: Record<string, string> = {
  brand: "bg-gradient-to-br from-[oklch(0.55_0.18_28)] to-[oklch(0.4_0.16_28)] text-white",
  dark: "bg-gradient-to-br from-[oklch(0.22_0.014_250)] to-[oklch(0.18_0.012_250)] text-white",
  cream: "[background:repeating-linear-gradient(135deg,oklch(0.93_0.035_60)_0_10px,oklch(0.96_0.025_60)_10px_20px)]",
  neutral: "[background:repeating-linear-gradient(135deg,oklch(0.93_0.012_80)_0_10px,oklch(0.96_0.012_80)_10px_20px)]",
};

function PromoCard({ promo, featured = false }: { promo: Promotion; featured?: boolean }) {
  const timeLeft = useTimeLeft(promo.expiresAt);
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <>
      <article
        className={cn(
          "group bg-card border border-border rounded-2xl overflow-hidden grid grid-rows-[auto_1fr_auto] relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full",
        )}
      >
        {/* Visual area */}
        <div
          className={cn(
            "relative flex items-center justify-center overflow-hidden",
            featured ? "aspect-[5/4]" : "aspect-[5/3]",
            !promo.image && visualClasses[promo.visual],
          )}
        >
          {promo.image && (
            <img
              src={promo.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          )}
          {!promo.image && promo.pct && (
            <div
              className={cn(
                "font-serif font-normal leading-none tracking-[-0.03em] opacity-95 transition-transform duration-500 group-hover:scale-110",
                featured ? "text-[120px]" : "text-[64px]",
              )}
            >
              {promo.pct}
            </div>
          )}
          {promo.badge && (
            <span
              className={cn(
                "absolute top-3 left-3 font-mono text-[10.5px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full backdrop-blur-sm",
                promo.badgeVariant === "brand"
                  ? "bg-brand/90 text-white"
                  : "bg-background/90 text-ink",
              )}
            >
              {promo.badge}
            </span>
          )}
          {timeLeft && (
            <span className="absolute bottom-3 right-3 font-mono text-[11px] bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.18_28)] animate-[pulse-ring_2s_infinite]" />
              {timeLeft}
            </span>
          )}
        </div>

        {/* Body */}
        <div className={cn("px-5 py-4", featured && "px-7 py-6")}>
          <h4
            className={cn(
              "font-serif font-medium leading-tight tracking-[-0.01em] mb-2",
              featured ? "text-[26px]" : "text-[19px]",
            )}
          >
            {promo.title}
          </h4>
          <p
            className={cn(
              "text-muted-foreground leading-[1.5] m-0",
              featured ? "text-[15px]" : "text-[13px]",
            )}
          >
            {promo.description}
          </p>
        </div>

        {/* Footer */}
        <div className={cn("flex gap-2 pb-5 pt-3 mt-3 border-t border-border", featured ? "px-7 pb-6" : "px-5")}>
          <button
            onClick={() => setBookOpen(true)}
            className="flex-1 bg-brand text-brand-foreground rounded-full py-3 text-[13.5px] font-medium cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-px hover:shadow-[0_8px_24px_-8px_oklch(0.55_0.18_28/0.6)] transition-all duration-300"
          >
            Забронировать
          </button>
          <button className="bg-transparent text-foreground border border-border rounded-full px-4 text-[13px] cursor-pointer hover:border-ink hover:bg-cream transition-colors">
            Условия
          </button>
        </div>
      </article>
      <CallbackModal open={bookOpen} onOpenChange={setBookOpen} />
    </>
  );
}

interface Props {
  promotions: Promotion[];
}

export function PromoCards({ promotions }: Props) {
  if (promotions.length === 0) return null;
  const [featured, ...rest] = promotions;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
      <div className="lg:col-span-2 lg:row-span-2 reveal is-visible">
        <PromoCard promo={featured} featured />
      </div>
      {rest.map((p, i) => (
        <div
          key={p.id}
          className="reveal is-visible"
          style={{ transitionDelay: `${i * 70}ms` }}
        >
          <PromoCard promo={p} />
        </div>
      ))}
    </div>
  );
}
