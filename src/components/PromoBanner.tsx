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
    <div className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-lg px-1 py-2.5 text-center overflow-hidden">
      <div
        key={value}
        className="font-serif text-[26px] font-medium leading-none animate-flip"
      >
        {String(value).padStart(2, "0")}
      </div>
      <div className="font-mono text-[9px] uppercase tracking-[0.1em] opacity-70 mt-1">
        {label}
      </div>
    </div>
  );
}

export function PromoBanner({ data }: Props) {
  const { days, hours, mins, secs } = useCountdown(data.endsAt);

  return (
    <section className="relative rounded-3xl overflow-hidden min-h-[340px] grid sm:grid-cols-[1.1fr_1fr] gap-0 group">
      {/* Photo background */}
      <img
        src="/promo_banner_22_05.webp"
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
      />
      {/* Tinted overlays */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, oklch(0.18 0.012 250 / 0.85) 0%, oklch(0.22 0.04 35 / 0.7) 55%, oklch(0.55 0.18 28 / 0.5) 100%)",
        }}
      />

      <div className="relative z-10 p-8 sm:p-12 flex flex-col justify-center text-[oklch(0.96_0.005_80)] max-w-[560px]">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[oklch(0.92_0.08_28)] mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.18_28)] animate-[pulse-ring_2s_infinite]" />
          {data.tag}
        </div>
        <h2 className="font-serif text-[38px] sm:text-[46px] font-normal leading-[1.02] tracking-[-0.02em] m-0">
          {data.title}
        </h2>
        <p className="text-[15px] opacity-85 mt-4 mb-6 max-w-[44ch] leading-relaxed">
          {data.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to={data.ctaHref as "/uslugi"}
            className="group/btn inline-flex items-center gap-2 bg-background text-ink px-6 py-3 rounded-full text-[14px] font-medium hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
          >
            {data.ctaLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
          </Link>
          <button className="bg-transparent text-[oklch(0.96_0.005_80)] px-6 py-3 rounded-full text-[14px] border border-white/40 hover:bg-white/10 hover:border-white/70 transition-colors cursor-pointer">
            Подробнее об акции
          </button>
        </div>
      </div>

      <div className="relative z-10 p-8 sm:p-12 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-7 text-center w-full max-w-[280px] text-[oklch(0.96_0.005_80)] shadow-2xl">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] opacity-80 mb-4">
            До конца акции
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Nblk value={days} label="дн" />
            <Nblk value={hours} label="ч" />
            <Nblk value={mins} label="мин" />
            <Nblk value={secs} label="сек" />
          </div>
        </div>
      </div>
    </section>
  );
}
