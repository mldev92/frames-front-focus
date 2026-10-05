import type { CityCode } from "@/lib/store/city";
import { doctorPricesFor } from "@/data/doctor-prices";
import { formatRub } from "@/lib/format-rub";

export function DoctorPriceTable({ city }: { city: CityCode }) {
  const rows = doctorPricesFor(city);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8" aria-labelledby="doctor-prices-title">
      <h2 id="doctor-prices-title" className="mb-8 font-serif text-3xl lg:text-4xl">
        Стоимость услуг врача
      </h2>
      <div className="max-w-4xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b-2 border-foreground py-3 text-sm font-semibold uppercase">
          <span>Услуга</span>
          <span>Стоимость</span>
        </div>
        {rows.map(({ name, price }) => (
          <div
            key={name}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-border py-3"
          >
            <span className="text-sm leading-relaxed text-muted-foreground">{name}</span>
            <span className="whitespace-nowrap text-right text-sm font-semibold tabular-nums">
              {formatRub(price)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
