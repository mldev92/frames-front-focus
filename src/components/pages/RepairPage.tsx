import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Gem,
  Glasses,
  Info,
  LifeBuoy,
  MapPin,
  Phone,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";

type IconItem = {
  title: string;
  text: string;
  Icon: LucideIcon;
};

const benefits: IconItem[] = [
  {
    title: "Быстро",
    text: "Большинство работ за 30 минут",
    Icon: Clock,
  },
  {
    title: "Качественно",
    text: "Опытные мастера, оригинальные детали",
    Icon: ShieldCheck,
  },
  {
    title: "Надёжно",
    text: "Гарантия на все виды работ",
    Icon: CheckCircle2,
  },
  {
    title: "Удобно",
    text: "Ремонт в наших салонах",
    Icon: MapPin,
  },
];

const serviceCards = [
  {
    Icon: Glasses,
    text: "Если заушники ваших очков сломались или потеряли первоначальный вид, мы заменим их на новые, подобрав по форме и цвету к вашей оправе.",
  },
  {
    Icon: Gem,
    text: "Удобство ношения очков во многом зависит от носовых упоров — заменим и отрегулируем их, чтобы ваши очки сидели максимально комфортно.",
  },
  {
    Icon: Wrench,
    text: "Со временем оправа может деформироваться — вернём правильную форму и подгоним по лицу, чтобы очки сидели ровно и давали надлежащую коррекцию.",
  },
  {
    Icon: LifeBuoy,
    text: "Если на линзах появились царапины или необходимо заменить их по новому рецепту, мы предложим широкий выбор линз по стоимости и характеристикам.",
  },
  {
    Icon: BadgeCheck,
    text: "Проведём глубокую очистку ваших очков, вернув им блеск и красивый вид.",
  },
];

const priceColumns = [
  [
    ["Выправка оправы безободковой", "500 ₽"],
    ["Выправка оправы на леске", "400 ₽"],
    ["Выправка оправы ободковой", "300 ₽"],
    ["Замена заушника (шт.)", "300 ₽"],
    ["Замена лески (шт.)", "300 ₽"],
    ["Замена наконечника (шт.)", "50 ₽"],
    ["Замена носоупора SILHOUETTE (шт.)", "400 ₽"],
    ["Замена силиконового носоупора (шт.)", "150 ₽"],
    ["Замена носоупора (шт.)", "100 ₽"],
    ["Нарезка резьбы (шт.)", "100 ₽"],
    ["Ремонт крепления заушника (шт.)", "1 000 ₽"],
    ["Снятие тонировки (одни очки)", "200 ₽"],
    ["Срочная работа вне очереди (одни очки)", "400 ₽"],
  ],
  [
    ["Тонировка линз градиент с UV защитой (одни очки)", "950 ₽"],
    ["Тонировка линз однотонная с UV защитой (одни очки)", "800 ₽"],
    ["Уплотнение и фиксация линзы в оправе (шт.)", "200 ₽"],
    ["Установка (замена) винта или гайки (шт.)", "100 ₽"],
    ["Установка (замена) втулки (шт.)", "250 ₽"],
    ["Установка колпачка на винт (шт.)", "50 ₽"],
    ["Установка линз в оправу безободковую", "1 100 ₽"],
    ["Установка линз в оправу на леске", "900 ₽"],
    ["Установка линз в оправу ободковую", "700 ₽"],
    ["Установка страз (шт.)", "50 ₽"],
    ["Фиксация крепежного элемента (шт.)", "50 ₽"],
    ["Чистка оправы в УЗ-ванне (одни очки)", "300 ₽"],
    ["Экстракция винта (шт.)", "300 ₽"],
  ],
] as const;

const ctaBadges: IconItem[] = [
  {
    title: "Гарантия качества",
    text: "Гарантия на все виды работ и установленные детали",
    Icon: ShieldCheck,
  },
  {
    title: "Срочный ремонт",
    text: "Большинство услуг выполняем за 30 минут",
    Icon: Star,
  },
  {
    title: "Опыт мастеров",
    text: "Специалисты с опытом более 7 лет",
    Icon: Users,
  },
];

const primaryButton =
  "inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90";
const secondaryButton =
  "inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-foreground hover:bg-foreground hover:text-primary-foreground";

export function RepairPage() {
  return (
    <div className="bg-background">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-[13px] text-muted-foreground lg:px-8">
        <Link to="/" className="transition-colors hover:text-foreground">
          Главная
        </Link>
        <span className="text-[10px] opacity-50">›</span>
        <Link to="/uslugi" className="transition-colors hover:text-foreground">
          Услуги
        </Link>
        <span className="text-[10px] opacity-50">›</span>
        <span className="font-medium text-foreground">Ремонт очков</span>
      </nav>

      <section className="overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:px-8">
          <Reveal className="py-12 lg:py-20">
            <div className="mb-4 text-xs font-semibold uppercase text-brand">
              Услуги мастера
            </div>
            <h1 className="font-serif text-4xl leading-[1.06] text-foreground sm:text-5xl lg:text-6xl">
              Ремонт очков
              <br />
              в&nbsp;Санкт-Петербурге
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Мы возвращаем вашим очкам комфорт и надёжность. Используем сертифицированные запчасти
              и профессиональное оборудование.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {benefits.map(({ title, text, Icon }) => (
                <div key={title} className="group flex flex-col items-center gap-2.5 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-card text-brand transition-colors group-hover:border-brand/30 group-hover:bg-brand-50">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="text-[13px] font-semibold text-foreground">{title}</div>
                  <div className="max-w-[120px] text-xs leading-snug text-muted-foreground">
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="pb-4 lg:h-full lg:min-h-[420px] lg:py-8" delay={120}>
            <div className="h-[280px] overflow-hidden rounded-2xl bg-accent sm:h-[360px] lg:h-full">
              <img
                src="/remont_hero.webp"
                alt="Мастер ремонтирует очки"
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {serviceCards.map(({ Icon, text }, index) => (
            <Reveal
              key={text}
              delay={index * 60}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-8 lg:pb-20">
        <Reveal>
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-foreground lg:text-4xl">
            Прейскурант на услуги мастера Оптика&nbsp;100%
          </h2>
        </Reveal>

        <div className="mt-9 grid gap-x-12 lg:grid-cols-2">
          {priceColumns.map((column, columnIndex) => (
            <Reveal key={columnIndex} delay={columnIndex * 100}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b-2 border-foreground py-3 text-[13px] font-semibold uppercase text-foreground">
                <span>Услуга</span>
                <span>Стоимость</span>
              </div>
              {column.map(([name, price]) => (
                <div
                  key={name}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-border py-3 transition-colors hover:bg-surface lg:hover:px-2"
                >
                  <span className="text-sm leading-relaxed text-muted-foreground">{name}</span>
                  <span className="whitespace-nowrap text-right text-sm font-semibold tabular-nums text-foreground">
                    {price}
                  </span>
                </div>
              ))}
            </Reveal>
          ))}
        </div>

        <div className="mt-6 flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>Точная стоимость определяется мастером после осмотра очков.</span>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <Reveal>
          <h2 className="font-serif text-3xl leading-tight text-foreground lg:text-4xl">
            Адрес нашего салона в&nbsp;Санкт-Петербурге
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal className="rounded-2xl border border-border bg-card p-7">
            <h3 className="text-lg font-semibold leading-snug text-foreground">
              Салон оптики «Оптика 100%»
              <br />
              Санкт-Петербург, ул. Кирочная, 17
            </h3>

            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                  М
                </span>
                <span>Чернышевская — 5 мин пешком</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0" />
                <span>Ежедневно с 10:00 до 20:00</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+7 (812) 100-00-00</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/contacts/" className={primaryButton}>
                <Route className="mr-2 h-4 w-4" />
                Построить маршрут
              </a>
              <a href="tel:+78121000000" className={secondaryButton}>
                <Phone className="mr-2 h-4 w-4" />
                Позвонить
              </a>
            </div>
          </Reveal>

          <Reveal
            delay={100}
            className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface text-muted-foreground"
          >
            <MapPin className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-sm">Яндекс Карта · Санкт-Петербург</span>
            <span className="text-xs opacity-60">Вставьте iframe Яндекс.Карт</span>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-cream">
        <div className="mx-auto flex max-w-7xl flex-col gap-9 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 lg:justify-start">
            {ctaBadges.map(({ title, text, Icon }) => (
              <div key={title} className="flex max-w-[160px] flex-col items-center gap-2 text-center">
                <Icon className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                <div className="text-sm font-semibold text-foreground">{title}</div>
                <div className="text-xs leading-snug text-muted-foreground">{text}</div>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3 text-center lg:items-end lg:text-right">
            <h3 className="font-serif text-2xl font-semibold text-foreground">
              Нужен ремонт очков?
            </h3>
            <p className="max-w-[260px] text-sm leading-relaxed text-muted-foreground">
              Приходите в удобный вам салон или запишитесь онлайн
            </p>
            <a href="/contacts/" className={primaryButton}>
              <Sparkles className="mr-2 h-4 w-4" />
              Записаться на ремонт
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
