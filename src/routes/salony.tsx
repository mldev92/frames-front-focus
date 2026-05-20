import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock } from "lucide-react";
import { salons } from "@/data/salons";
import { SalonMap } from "@/components/SalonMap";

export const Route = createFileRoute("/salony")({
  head: () => ({
    meta: [
      { title: "Салоны ОПТИКА 100% в Санкт-Петербурге" },
      {
        name: "description",
        content:
          "Адреса салонов ОПТИКА 100%: Кирочная 17, Невский 88, Васильевский остров.",
      },
      { property: "og:title", content: "Наши салоны · ОПТИКА 100%" },
    ],
  }),
  component: SalonsPage,
});

function SalonsPage() {
  return (
    <div>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h1 className="font-serif text-4xl lg:text-5xl">Наши салоны</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Приходите за подбором оправы, диагностикой зрения или просто за советом.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <SalonMap salons={salons} />
      </section>

      {/* Compact list below map */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 pb-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {salons.map((s) => (
          <article
            key={s.id}
            className="border border-border rounded-2xl overflow-hidden bg-card"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <h2 className="font-serif text-lg">{s.name}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{s.address}, м. {s.metro}</span>
                </li>
                <li className="flex gap-2">
                  <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <a href={`tel:${s.phone}`} className="hover:text-brand">{s.phone}</a>
                </li>
                <li className="flex gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{s.hours}</span>
                </li>
              </ul>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
