import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";
import { AppointmentModal } from "@/components/AppointmentModal";

const STEPS = [
  {
    n: "01",
    t: "Выбираете оправу",
    d: "Каталог под ваш стиль и форму лица",
    img: "/main1example.webp",
  },
  {
    n: "02",
    t: "Подбираем линзы",
    d: "Диагностика и рекомендация оптометриста",
    img: "/services2_vision_diagnostics.webp",
  },
  {
    n: "03",
    t: "Примеряете онлайн",
    d: "Виртуальная примерка прямо в браузере",
    img: "/services3_selection_of_glasses.webp",
  },
  {
    n: "04",
    t: "Доставим бесплатно",
    d: "По СПб от 5 000 ₽ — курьером до двери",
    img: "/main3example.webp",
  },
];

export function BrandPromiseBand() {
  const { ref, inView } = useInView();
  const [aptOpen, setAptOpen] = useState(false);

  return (
    <section
      ref={ref}
      className="relative bg-brand text-brand-foreground overflow-hidden"
    >
      {/* Soft radial overlays */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 15% 0%, oklch(1 0 0 / 0.10), transparent 55%), radial-gradient(ellipse at 85% 100%, oklch(0 0 0 / 0.18), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8 py-20 lg:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] uppercase tracking-[0.24em] opacity-80 mb-4">
            ОПТИКА 100% · Сервис
          </div>
          <h2 className="font-serif text-3xl lg:text-5xl leading-[1.05]">
            Подобрать очки — это просто
          </h2>
          <p className="mt-5 text-base/relaxed opacity-90 max-w-xl mx-auto">
            От первой примерки до доставки на дом — мы сопровождаем
            на каждом шаге.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-14 lg:mt-20">
          {/* Connector — horizontal on lg, vertical on mobile */}
          <div
            aria-hidden
            className="hidden lg:block absolute left-[6%] right-[6%] top-[48px] h-px bg-brand-foreground/30 origin-left"
            style={{
              transform: inView ? "scaleX(1)" : "scaleX(0)",
              transition: "transform 1100ms cubic-bezier(.4,0,.2,1) 120ms",
            }}
          />
          <div
            aria-hidden
            className="lg:hidden absolute top-0 bottom-0 left-[47px] w-px bg-brand-foreground/25 origin-top"
            style={{
              transform: inView ? "scaleY(1)" : "scaleY(0)",
              transition: "transform 1100ms cubic-bezier(.4,0,.2,1) 120ms",
            }}
          />

          <ol className="relative grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
            {STEPS.map((s, i) => (
              <li
                key={s.n}
                className={cn(
                  "group flex lg:flex-col items-start lg:items-center gap-5 lg:gap-4 lg:text-center transition-all duration-700",
                  inView
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3",
                )}
                style={{ transitionDelay: `${300 + i * 130}ms` }}
              >
                <div className="relative shrink-0">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden ring-2 ring-brand-foreground/80 ring-offset-4 ring-offset-brand transition-transform duration-300 group-hover:-translate-y-1">
                    <img
                      src={s.img}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-brand/20 mix-blend-multiply" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background text-brand flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-md">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </div>
                <div className="lg:mt-2">
                  <div className="font-serif text-2xl opacity-70">{s.n}</div>
                  <div className="mt-1 font-serif text-lg leading-tight">{s.t}</div>
                  <div className="mt-1.5 text-[13px] opacity-75 max-w-[22ch] mx-auto">
                    {s.d}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/catalog_s/$category"
            params={{ category: "opravy" }}
            className="inline-flex items-center gap-2 bg-background text-foreground rounded-full px-6 py-3 text-sm font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            Перейти к подбору
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={() => setAptOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-brand-foreground/60 text-brand-foreground px-6 py-3 text-sm hover:bg-brand-foreground/10 transition-colors"
          >
            Записаться к врачу
          </button>
        </div>
      </div>

      <AppointmentModal open={aptOpen} onOpenChange={setAptOpen} />
    </section>
  );
}
