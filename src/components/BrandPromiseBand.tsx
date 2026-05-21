import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { n: "01", t: "Выбираете оправу" },
  { n: "02", t: "Подбираем линзы" },
  { n: "03", t: "Примеряете онлайн" },
  { n: "04", t: "Доставим бесплатно" },
];

export function BrandPromiseBand() {
  return (
    <section className="bg-brand text-brand-foreground">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20 text-center">
        <div className="text-xs uppercase tracking-[0.2em] opacity-80 mb-3">
          ОПТИКА 100% · Сервис
        </div>
        <h2 className="font-serif text-3xl lg:text-5xl leading-tight max-w-2xl mx-auto">
          Подобрать очки — это просто
        </h2>
        <p className="mt-4 text-base/relaxed opacity-90 max-w-xl mx-auto">
          От первой примерки до доставки на дом — мы сопровождаем на каждом шаге.
        </p>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-px bg-brand-foreground/15 rounded-2xl overflow-hidden max-w-4xl mx-auto">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-brand px-6 py-6 text-left">
              <div className="font-serif text-2xl opacity-70">{s.n}</div>
              <div className="mt-2 text-sm">{s.t}</div>
            </div>
          ))}
        </div>

        <Link
          to="/catalog_s/$category" params={{ category: "opravy" }}
          className="mt-10 inline-flex items-center gap-2 bg-background text-foreground rounded-full px-6 py-3 hover:opacity-90"
        >
          Перейти к подбору <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
