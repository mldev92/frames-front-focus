import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { serviceHref, services } from "@/data/services";
import { AppointmentModal } from "@/components/AppointmentModal";

const others = services.filter((service) => service.slug !== "diagnostika");

const visionCheckItems = [
  "авторефрактометрию;",
  "определение остроты зрения с помощью таблицы;",
  "рекомендации по способам коррекции.",
];

const contactLensItems = [
  "авторефрактометрию;",
  "подбор на цифровом фороптере;",
  "помощь в выборе контактных линз с учетом потребностей пациента;",
  "обучение правилам ношения, пользования и ухода за контактными линзами.",
];

const glassesSelectionItems = [
  "авторефрактометрию;",
  "подбор на цифровом фороптере;",
  "помощь в выборе очковых линз с учетом потребностей пациента.",
];

const consultationItems = [
  "проверку зрения (авторефрактометрия);",
  "биомикроскопию (осмотр на щелевой лампе);",
  "назначение лечения;",
];

function CheckIcon({ size = 5 }: { size?: number }) {
  return (
    <svg
      className={`w-${size} h-${size} text-brand shrink-0 mt-0.5`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BrandBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm hover:opacity-90"
      style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}
    >
      {children}
    </button>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckIcon size={5} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function DiagnosticsNkPage() {
  const [aptOpen, setAptOpen] = useState(false);
  const openApt = () => setAptOpen(true);

  return (
    <div>
      <section className="relative">
        <div className="overflow-hidden" style={{ aspectRatio: "21/7" }}>
          <img
            src="/izmenenie_davleniya.webp"
            alt="Диагностика зрения в Новокузнецке"
            className="h-full w-full object-cover"
          />
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "oklch(0.18 0.01 250 / 0.42)" }}
        >
          <div className="px-4 text-center text-primary-foreground">
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-primary-foreground/80">
              Новокузнецк
            </p>
            <h1 className="font-serif text-4xl lg:text-6xl">Кабинет диагностики</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="max-w-4xl space-y-6 leading-relaxed">
            <p>
              Во всех салонах «ОПТИКА 100%» Вы имеете возможность получить консультацию
              врача-офтальмолога, подобрать контактные линзы и средства ухода за ними, подобрать
              очки любой сложности (астигматические, бифокальные, офисные, прогрессивные). Прием
              ведется каждый день, включая выходные, с 10.00 до 19.00.
            </p>
          </div>

          <div className="rounded-3xl bg-surface p-6 lg:p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Режим работы
            </p>
            <p className="mt-4 font-serif text-2xl">Ежедневно</p>
            <p className="mt-2 text-lg">10:00 — 19:00</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Прием ведется без выходных во всех салонах Новокузнецка.
            </p>
            <div className="mt-6">
              <BrandBtn onClick={openApt}>Записаться на консультацию</BrandBtn>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <article className="rounded-3xl bg-background p-8 shadow-sm">
              <h2 className="font-serif text-3xl">Проверка зрения</h2>
              <p className="mt-4 leading-relaxed">Проверка зрения включает:</p>
              <div className="mt-6">
                <FeatureList items={visionCheckItems} />
              </div>
            </article>

            <article className="rounded-3xl bg-background p-8 shadow-sm">
              <h2 className="font-serif text-3xl">Подбор мягких контактных линз</h2>
              <p className="mt-4 leading-relaxed">Подбор мягких контактных линз включает:</p>
              <div className="mt-6">
                <FeatureList items={contactLensItems} />
              </div>
            </article>

            <article className="rounded-3xl bg-background p-8 shadow-sm">
              <h2 className="font-serif text-3xl">Подбор очков</h2>
              <p className="mt-4 leading-relaxed">Подбор очков включает:</p>
              <div className="mt-6">
                <FeatureList items={glassesSelectionItems} />
              </div>
            </article>

            <article className="rounded-3xl bg-background p-8 shadow-sm">
              <h2 className="font-serif text-3xl">Консультация врача-офтальмолога</h2>
              <p className="mt-4 leading-relaxed">Консультация врача-офтальмолога включает:</p>
              <div className="mt-6">
                <FeatureList items={consultationItems} />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl">Диагностика в салонах Новокузнецка</h2>
            <div className="mt-6 space-y-6 leading-relaxed">
              <p>
                В салонах «ОПТИКА 100%» в Новокузнецке можно пройти базовую проверку зрения,
                получить консультацию врача-офтальмолога и подобрать очки или контактные линзы с
                учетом ваших зрительных задач и образа жизни.
              </p>
              <p>
                Мы помогаем подобрать коррекцию любой сложности и подробно объясняем дальнейшие
                рекомендации по ношению линз, уходу за ними и лечению, если оно требуется по
                результатам приема.
              </p>
            </div>
            <div className="mt-8">
              <BrandBtn onClick={openApt}>Записаться на диагностику</BrandBtn>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-accent" style={{ aspectRatio: "4 / 5" }}>
            <img
              src="/konsultaciya_oftalmologa.webp"
              alt="Консультация врача-офтальмолога в Новокузнецке"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="mb-8 font-serif text-2xl">Другие услуги</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {others.map((service) => (
            <a
              key={service.slug}
              href={serviceHref(service.slug)}
              className="block rounded-2xl bg-surface p-6 transition-shadow hover:shadow-md"
            >
              <div className="font-serif text-lg">{service.title}</div>
              <div className="mt-2 text-sm text-muted-foreground">{service.short}</div>
            </a>
          ))}
        </div>
      </section>

      <AppointmentModal open={aptOpen} onOpenChange={setAptOpen} />
    </div>
  );
}

export const Route = createFileRoute("/kabinet-diagnostiki-nk")({
  head: () => ({
    meta: [
      { title: "Кабинет диагностики в Новокузнецке · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Диагностика зрения в салонах ОПТИКА 100% в Новокузнецке: авторефрактометрия, подбор очков и контактных линз, консультация врача-офтальмолога.",
      },
      { property: "og:title", content: "Кабинет диагностики в Новокузнецке · ОПТИКА 100%" },
      { property: "og:image", content: "/izmenenie_davleniya.webp" },
    ],
  }),
  component: DiagnosticsNkPage,
});
