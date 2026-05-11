import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";

export const Route = createFileRoute("/uslugi")({
  head: () => ({
    meta: [
      { title: "Услуги клиники зрения · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Запись к врачу-офтальмологу, диагностика зрения, подбор очков, ремонт. Услуги клиники ОПТИКА 100% в Санкт-Петербурге.",
      },
      { property: "og:title", content: "Услуги клиники · ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Полный комплекс услуг по зрению: от диагностики до ремонта очков.",
      },
    ],
  }),
  component: ServicesHub,
});

function ServicesHub() {
  return (
    <div>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
          <div className="text-xs uppercase tracking-[0.2em] text-brand mb-3">
            Клиника зрения
          </div>
          <h1 className="font-serif text-4xl lg:text-6xl max-w-3xl">
            Услуги, которые делают выбор очков простым.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((s) => (
            <Link
              key={s.slug}
              to="/uslugi/$slug"
              params={{ slug: s.slug }}
              className="group block bg-surface rounded-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h2 className="font-serif text-2xl">{s.title}</h2>
                <p className="mt-2 text-muted-foreground">{s.short}</p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <span>{s.price}</span>
                  <span className="text-muted-foreground">· {s.duration}</span>
                  <span className="ml-auto inline-flex items-center gap-1 group-hover:text-brand">
                    Подробнее <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
