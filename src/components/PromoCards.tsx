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

function PromoCard({ promo }: { promo: Promotion }) {
  const timeLeft = useTimeLeft(promo.expiresAt);
  const [bookOpen, setBookOpen] = useState(false);

  return (
    <>
      <article className="bg-card border border-border rounded-2xl overflow-hidden grid grid-rows-[auto_1fr_auto] relative transition-[box-shadow,transform] duration-200 hover:shadow-md hover:-translate-y-0.5">
        {/* Visual area */}
        <div
          className={cn(
            "relative flex items-center justify-center aspect-[5/3]",
            visualClasses[promo.visual],
          )}
        >
          {promo.pct && (
            <div className="font-serif text-[60px] font-normal leading-none tracking-[-0.02em] opacity-90">
              {promo.pct}
            </div>
          )}
          {promo.badge && (
            <span
              className={cn(
                "absolute top-3 left-3 font-mono text-[10.5px] uppercase tracking-[0.12em] px-2 py-1 rounded",
                promo.badgeVariant === "brand"
                  ? "bg-brand text-white"
                  : "bg-background text-ink",
              )}
            >
              {promo.badge}
            </span>
          )}
          {timeLeft && (
            <span className="absolute bottom-3 right-3 font-mono text-[11px] bg-black/55 text-white px-2 py-1 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_28)] animate-[pulse-ring_2s_infinite]" />
              {timeLeft}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <h4 className="font-serif text-[19px] font-medium leading-tight tracking-[-0.01em] mb-1.5">
            {promo.title}
          </h4>
          <p className="text-[13px] text-muted-foreground leading-[1.45] m-0">
            {promo.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-[18px] pt-3 border-t border-border mt-3">
          <button
            onClick={() => setBookOpen(true)}
            className="flex-1 bg-ink text-primary-foreground border-0 rounded-full py-3 text-[13.5px] font-medium cursor-pointer flex items-center justify-center gap-2 hover:-translate-y-px hover:shadow-md transition-all duration-200"
          >
            Забронировать
          </button>
          <button className="bg-transparent text-foreground border border-border rounded-full px-4 text-[13px] cursor-pointer hover:border-ink/50 transition-colors">
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
      {promotions.map((p) => (
        <PromoCard key={p.id} promo={p} />
      ))}
    </div>
  );
}
