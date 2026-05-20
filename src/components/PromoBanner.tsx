import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PromoBannerData } from "@/data/promotions";

interface Props {
  data: PromoBannerData;
}

function useCountdown(endsAt: Date) {
  const [delta, setDelta] = useState(() => Math.max(0, endsAt.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setDelta(Math.max(0, endsAt.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const totalSecs = Math.floor(delta / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return { days, hours, mins, secs };
}

function Nblk({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-black/25 rounded-md px-1 py-2 text-center">
      <div className="font-serif text-[22px] font-medium leading-none">
        {String(value).padStart(2, "0")}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-[0.08em] opacity-60 mt-0.5">
        {label}
      </div>
    </div>
  );
}

export function PromoBanner({ data }: Props) {
  const { days, hours, mins, secs } = useCountdown(data.endsAt);

  return (
    <section className="relative rounded-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-8 px-8 py-9 sm:px-11">
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, oklch(0.55 0.18 28 / 0.25), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.45 0.15 35 / 0.3), transparent 50%), oklch(0.22 0.04 35)",
        }}
      />

      <div className="text-[oklch(0.96_0.005_80)] max-w-[540px]">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[oklch(0.85_0.12_28)] mb-3.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.18_28)]" />
          {data.tag}
        </div>
        <h2 className="font-serif text-[36px] sm:text-[40px] font-normal leading-[1.05] tracking-[-0.015em] m-0 text-[oklch(0.96_0.005_80)]">
          {data.title}
        </h2>
        <p className="text-[14.5px] opacity-85 mt-3.5 mb-5 max-w-[44ch] leading-relaxed">
          {data.description}
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to={data.ctaHref as "/uslugi"}
            className="inline-flex items-center gap-2 bg-background text-ink px-5 py-3 rounded-full text-[14px] font-medium border-0 no-underline hover:opacity-90 transition-opacity"
          >
            {data.ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button className="bg-transparent text-[oklch(0.96_0.005_80)] px-5 py-3 rounded-full text-[14px] border border-white/40 hover:border-white/70 transition-colors cursor-pointer">
            Подробнее об акции
          </button>
        </div>
      </div>

      <div className="bg-white/8 border border-white/12 rounded-xl p-4 sm:p-[18px_22px] text-center min-w-[200px] shrink-0 text-[oklch(0.96_0.005_80)]">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] opacity-70 mb-2">
          Акция закончится через
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Nblk value={days} label="дн" />
          <Nblk value={hours} label="ч" />
          <Nblk value={mins} label="мин" />
          <Nblk value={secs} label="сек" />
        </div>
      </div>
    </section>
  );
}
