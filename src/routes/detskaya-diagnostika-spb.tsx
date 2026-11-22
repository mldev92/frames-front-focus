import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { CONTACT, PRIMARY_SALON } from "@/data/contact";
import { breadcrumbSchema, faqSchema } from "@/lib/seo-schema";

const path = "/detskaya-diagnostika-spb/";
const canonical = "https://optika100.com" + path;
const heading = "Детская диагностика зрения";
const title = "Детская диагностика зрения в Санкт-Петербурге — приём детского врача · ОПТИКА 100%";
const description =
  "Детская диагностика зрения в Санкт-Петербурге: приём детского офтальмолога, биометрия Lenstar LS 900, контроль миопии у детей. Запись в «Оптика 100%», Кирочная, 17.";
const heroImage = "/pic1.webp";
const bookingLabel = "Записаться к детскому врачу";

const breadcrumbs = [
  { label: "Главная", href: "/" },
  { label: "Услуги", href: "/uslugi/" },
  { label: "Детская диагностика", href: path },
];

const examIncludes = [
  "Проверка остроты зрения и определение рефракции.",
  "Оценка состояния глаз.",
  "Анализ прежних рецептов и измерений.",
  "При необходимости — биометрия (измерение осевой длины глаза) для наблюдения динамики.",
  "Индивидуальные рекомендации: наблюдение, коррекция (очковые или контактные линзы), график контрольных визитов.",
];

const steps = [
  {
    title: "Обследование",
    text: "Врач проверяет зрение и состояние глаз, изучает прежние рецепты и измерения.",
  },
  {
    title: "Оценка динамики",
    text: "Рефракция и биометрия помогают оценить прогрессирование и риски.",
  },
  {
    title: "Выбор линз",
    text: "Обсуждаются показания, рецепт, удобство очков или контактной коррекции.",
  },
  {
    title: "Наблюдение",
    text: "Назначается режим ношения и индивидуальный график контрольных визитов.",
  },
];

const signs = [
  "Ребёнок щурится или придвигается ближе к доске и экрану.",
  "Рецепт на очки меняется, близорукость увеличивается.",
  "У родителей есть миопия — зрение ребёнка важно наблюдать.",
];

const faq = [
  {
    q: "Чем контроль миопии отличается от обычных очков?",
    a: "Обычные однофокальные линзы корректируют нечёткое зрение вдаль. Специальные дизайны для контроля миопии также направлены на замедление её прогрессирования. Они не устраняют уже имеющуюся близорукость и не гарантируют остановку её роста.",
  },
  {
    q: "С какого возраста можно подбирать линзы?",
    a: "Возрастные показания различаются у разных изделий. Врач учитывает возраст ребёнка, рецепт, динамику миопии, состояние глаз и инструкцию производителя. Для контактных линз важны также готовность к уходу и участие родителей.",
  },
  {
    q: "Что выбрать: очковые или контактные линзы?",
    a: "Очки не требуют прикосновения к глазу. Контактные линзы могут быть удобны при активном образе жизни, но требуют строгой гигиены. Выбор делают вместе с врачом после обследования, а не только по названию или стоимости.",
  },
  {
    q: "Myopilux Plus — то же самое, что Stellest?",
    a: "Нет. Myopilux Plus обеспечивает поддержку зрения вблизи, а Stellest использует асферические микролинзы. Показания и доказательная база различаются; заменять одну линзу другой без консультации нельзя.",
  },
  {
    q: "Зачем измерять осевую длину глаза?",
    a: "При прогрессировании миопии глаз часто удлиняется. Биометрия позволяет отслеживать осевую длину в динамике — вместе с рефракцией и другими данными это помогает врачу оценивать течение миопии и выбранную тактику.",
  },
  {
    q: "Биометрия Lenstar LS 900 болезненна?",
    a: "Это бесконтактное оптическое измерение. Прибор не касается глаза. Состав обследования и необходимость дополнительных процедур определяет врач.",
  },
  {
    q: "Как часто нужны контрольные осмотры?",
    a: "Индивидуальный график назначает врач. Часто динамику оценивают примерно каждые шесть месяцев, а после первичного подбора могут понадобиться более ранние визиты. При боли, покраснении или внезапном ухудшении зрения обратитесь за медицинской помощью без ожидания планового осмотра.",
  },
  {
    q: "Можно ли спать в контактных линзах?",
    a: "Не следует спать в перечисленных дневных линзах. Соблюдайте инструкцию производителя и рекомендации врача; однодневные линзы повторно не используют. Не допускайте контакта линз с водопроводной водой.",
  },
  {
    q: "Сколько стоит подбор и сами линзы?",
    a: "Стоимость зависит от выбранного изделия, рецепта, комплектации и обследования. Актуальные варианты смотрите в каталоге, а стоимость приёма детского врача и биометрии уточняйте при записи. Для очков отдельно учитываются оправа и изготовление.",
  },
  {
    q: "Что взять на приём?",
    a: "Предыдущие рецепты, очки, результаты обследований и биометрии, если они есть. Эти данные позволяют оценить динамику, а не только состояние зрения в день визита.",
  },
];

const relatedLinks = [
  { label: "Линзы для контроля миопии", href: "/stellest-katalog-s-linzami/" },
  { label: "Биометрия глаза", href: "/biometriya-glaza/" },
  { label: "Диагностика зрения", href: "/kabinet-diagnostiki-spb/" },
  { label: "Детские очковые линзы", href: "/catalog_s/linzy_dlya_ochkov/detskie/" },
];

const medicalSchema = {
  type: "application/ld+json",
  children: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    name: heading,
    description,
    url: canonical,
    audience: {
      "@type": "PeopleAudience",
      audienceType: "Дети и подростки",
    },
    provider: {
      "@type": "MedicalClinic",
      name: "Оптика 100%",
      medicalSpecialty: "https://schema.org/Ophthalmology",
      telephone: CONTACT.phone.label,
      address: {
        "@type": "PostalAddress",
        streetAddress: "ул. Кирочная, 17",
        addressLocality: PRIMARY_SALON.cityLabel,
        addressCountry: "RU",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => "https://schema.org/" + day),
        opens: "10:00",
        closes: PRIMARY_SALON.closesAt,
      },
    },
  }),
};

export const Route = createFileRoute("/detskaya-diagnostika-spb")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { property: "og:image", content: "https://optika100.com" + heroImage },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: [medicalSchema, breadcrumbSchema(breadcrumbs), faqSchema(faq)],
  }),
  component: PediatricEyeExamsPage,
});

const sectionWidth = "mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16";
const sectionHeading = "font-serif text-3xl leading-tight sm:text-4xl";
const bookingButton =
  "rounded-full bg-brand px-4 py-3 text-center text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 sm:px-6";

function PediatricEyeExamsPage() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);

  return (
    <>
      <nav aria-label="Хлебные крошки" className="border-b border-border">
        <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-3 text-xs text-muted-foreground lg:px-8">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1">
              {index > 0 && <ChevronRight aria-hidden="true" className="size-3.5" />}
              {crumb.href === path ? (
                <span aria-current="page" className="text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <a href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <section className="border-b border-border bg-cream/50">
        <div className={sectionWidth + " grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]"}>
          <div>
            <h1 className="max-w-3xl font-serif text-4xl leading-tight lg:text-6xl">{heading}</h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground sm:text-lg">
              Комплексное обследование детей и подростков с наблюдением детского врача. Чёткое
              зрение сегодня и контроль близорукости на годы вперёд.
            </p>
            {/* На узком экране оставляем место для плавающей кнопки связи. */}
            <div className="mt-7 flex flex-wrap items-center gap-3 pr-[72px] sm:pr-0">
              <button type="button" onClick={openBooking} className={bookingButton}>
                {bookingLabel}
              </button>
              <a
                href={CONTACT.phone.href}
                className="px-2 py-3 text-sm font-semibold hover:underline"
              >
                {CONTACT.phone.label}
              </a>
            </div>
          </div>
          <img
            src={heroImage}
            alt="Специалист проверяет зрение ребёнка в салоне «Оптика 100%»"
            width={1280}
            height={837}
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className={sectionWidth + " grid gap-5 lg:grid-cols-2 lg:gap-12"}>
        <h2 className={sectionHeading}>Приём детского врача</h2>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          Детский врач оценивает зрение, рефракцию и состояние глаз ребёнка, анализирует предыдущие
          рецепты и подбирает индивидуальную тактику контроля миопии — с учётом возрастных
          особенностей и зрительных нагрузок.
        </p>
      </section>

      <section className="border-y border-border bg-cream/40">
        <div className={sectionWidth}>
          <h2 className={sectionHeading}>Что входит в детскую диагностику</h2>
          <ul className="mt-7 grid gap-3 md:grid-cols-2">
            {examIncludes.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-border bg-background p-4"
              >
                <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={sectionWidth}>
        <div className="rounded-2xl border border-border bg-cream/50 p-5 sm:p-9">
          <h2 className={sectionHeading}>Биометрия Lenstar LS 900 (Швейцария)</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            Бесконтактное оптическое измерение параметров глаза, включая осевую длину. Сравнение
            повторных измерений помогает врачу отслеживать динамику роста глаза и оценивать
            эффективность контроля миопии.
          </p>
          <a
            href="/biometriya-glaza/"
            className="mt-5 inline-flex items-center gap-2 font-semibold text-brand hover:underline"
          >
            Подробнее о биометрии <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </section>

      <section className="border-t border-border">
        <div className={sectionWidth}>
          <h2 className={sectionHeading}>Как проходит приём</h2>
          <ol className="mt-7 grid list-decimal gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li
                key={step.title}
                className="list-inside rounded-2xl border border-border bg-cream/40 p-5 marker:font-semibold marker:text-brand"
              >
                <h3 className="inline font-serif text-xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-border bg-cream/40">
        <div className={sectionWidth + " grid gap-5 lg:grid-cols-2 lg:gap-12"}>
          <h2 className={sectionHeading}>Когда показать ребёнка врачу</h2>
          <ul className="list-disc space-y-3 pl-5 leading-relaxed marker:text-brand">
            {signs.map((sign) => (
              <li key={sign}>{sign}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={sectionWidth}>
        <h2 className={sectionHeading}>Вопросы родителей</h2>
        <div className="mt-7 max-w-3xl divide-y divide-border rounded-2xl border border-border">
          {faq.map(({ q, a }) => (
            <details key={q} className="group px-4 sm:px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-cream/40">
        <div className={sectionWidth}>
          <h2 className={sectionHeading}>Привычки, которые берегут зрение</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
            Помимо коррекции, обсудите с врачом прогулки на открытом воздухе, перерывы при работе
            вблизи и удобное освещение. Эти привычки дополняют наблюдение, но не заменяют
            назначенные линзы.
          </p>
        </div>
      </section>

      <section className={sectionWidth}>
        <div className="grid gap-6 rounded-2xl bg-ink p-4 text-primary-foreground sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className={sectionHeading}>Запись на приём и контакты</h2>
            <p className="mt-4 max-w-xl leading-relaxed">
              Начните с приёма детского врача — обсудите метод контроля миопии, обследование на
              Lenstar LS 900 и стоимость вариантов.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 pr-[72px] sm:pr-0">
              <button type="button" onClick={openBooking} className={bookingButton}>
                {bookingLabel}
              </button>
              <a
                href={CONTACT.phone.href}
                className="px-2 py-3 text-sm font-semibold hover:underline"
              >
                {CONTACT.phone.label}
              </a>
            </div>
          </div>
          <div className="rounded-xl border border-white/20 p-4 text-sm leading-relaxed">
            <h3 className="font-serif text-xl">Салон оптики</h3>
            <address className="mt-2 not-italic">
              {PRIMARY_SALON.routeQuery}, м. {PRIMARY_SALON.metro}.
            </address>
            <p>{PRIMARY_SALON.hours}.</p>
            <p className="mt-2">Стоимость и время приёма уточняются при записи.</p>
          </div>
        </div>

        <p className="mt-6 rounded-xl bg-cream/50 p-4 text-sm leading-relaxed text-muted-foreground">
          Линзы не излечивают миопию. Результат индивидуален; назначение и наблюдение необходимы при
          любом выбранном методе.
        </p>

        <nav aria-label="Связанные страницы" className="mt-8 border-t border-border pt-6">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relatedLinks.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="flex h-full items-center justify-between gap-3 rounded-xl border border-border p-4 text-sm font-medium hover:border-brand hover:text-brand"
                >
                  {label} <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <AppointmentModal
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        initialSelection={{ salonId: PRIMARY_SALON.id, ageType: "child" }}
      />
    </>
  );
}
