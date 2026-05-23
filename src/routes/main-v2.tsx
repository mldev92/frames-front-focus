import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Eye,
  Glasses,
  Wrench,
  Heart,
  GraduationCap,
  Microscope,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { SalonsSection } from "@/components/SalonsSection";
import { AppointmentModal } from "@/components/AppointmentModal";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { TryOnIcon } from "@/components/TryOnIcon";
import { Reveal } from "@/components/Reveal";
import { catalogHref, categoryToSegment } from "@/data/categories";
import { bestsellers } from "@/data/products";
import { articles } from "@/data/articles";
import { serviceHref } from "@/data/services";
import { useCart, formatPrice } from "@/lib/store/cart";
import type { Product } from "@/data/types";

export const Route = createFileRoute("/main-v2")({
  head: () => ({
    meta: [
      { title: "ОПТИКА 100% — новая главная (preview)" },
      { name: "description", content: "Предпросмотр новой главной страницы." },
    ],
  }),
  component: MainV2Page,
});

const HERO_SERVICES = [
  {
    slug: "priem-vracha",
    title: "Запись к врачу",
    subtitle: "Онлайн в 2 клика",
    Icon: Stethoscope,
  },
  {
    slug: "podbor-ochkov",
    title: "Подбор оправ",
    subtitle: "С учётом черт лица",
    Icon: Glasses,
  },
  {
    slug: "diagnostika",
    title: "Диагностика зрения",
    subtitle: "Полное обследование",
    Icon: Eye,
  },
  {
    slug: "remont",
    title: "Ремонт очков",
    subtitle: "Свой сервис-центр",
    Icon: Wrench,
  },
] as const;

const HERO_STATS = [
  { value: "11 000+", label: "оправ от 120 брендов" },
  { value: "2 города", label: "СПб · Новокузнецк" },
  { value: "4.9 ★", label: "1 840 отзывов" },
];

const TRUST_REASONS = [
  {
    Icon: GraduationCap,
    title: "Опыт и экспертиза",
    text: "Более 10 лет помогаем видеть лучше.",
  },
  {
    Icon: Microscope,
    title: "Современное оборудование",
    text: "Диагностика на оборудовании премиум-класса.",
  },
  {
    Icon: ShieldCheck,
    title: "Гарантия качества",
    text: "Оригинальные линзы и оправы с гарантией.",
  },
  {
    Icon: HeartHandshake,
    title: "Сервис на высоте",
    text: "Индивидуальный подход и забота о каждом клиенте.",
  },
];

const SERVICE_IMAGES = [
  "/services1_online_appointment_doctor.png",
  "/services2_vision_diagnostics.png",
  "/services3_selection_of_glasses.png",
  "/services4_glasses_repair.png",
];
const SERVICE_LIST = [
  { slug: "priem-vracha", title: "Запись к врачу" },
  { slug: "diagnostika", title: "Диагностика зрения" },
  { slug: "podbor-ochkov", title: "Подбор очков" },
  { slug: "remont", title: "Ремонт очков" },
];

// Asymmetric category grid cells. Layout (desktop):
//   ┌────────────┬───────────────────────┐
//   │            │  Солнцезащитные       │  (wide top-right)
//   │  Женские   ├───────────┬───────────┤
//   │  оправы    │  Мужские  │  Детские  │
//   │            │  оправы   │  очки     │
//   └────────────┴───────────┴───────────┘
// `titlePos: "top" | "bottom"` controls text placement inside the tile.
const CAT_CELLS = [
  {
    slug: "opravy-zhenskie",
    title: "Женские оправы",
    subtitle: "Более 1500 моделей",
    image: "/new_categories_1.png",
    href: catalogHref("opravy"),
    titlePos: "bottom" as const,
  },
  {
    slug: "solntsezashchitnye",
    title: "Солнцезащитные очки",
    subtitle: "Новые коллекции 2024",
    image: "/new_categories_2.png",
    href: catalogHref("solntsezashchitnye"),
    titlePos: "top" as const,
  },
  {
    slug: "opravy-muzhskie",
    title: "Мужские оправы",
    subtitle: "Более 1200 моделей",
    image: "/new_categories_3.png",
    href: catalogHref("opravy"),
    titlePos: "bottom" as const,
  },
  {
    slug: "detskie-ochki",
    title: "Детские очки",
    subtitle: "Для заботы о будущем",
    image: "/new_categories_4.png",
    href: catalogHref("opravy"),
    titlePos: "bottom" as const,
  },
];

function MainV2Page() {
  const hits = bestsellers();
  const recent = articles.slice(0, 3);
  const [aptOpen, setAptOpen] = useState(false);
  const [vtoOpen, setVtoOpen] = useState(false);

  return (
    <div>
      {/* ─────────────────────────────────────────────────────────────
          1. HERO — full-bleed banner, text overlaid on left
         ───────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          minHeight: "clamp(440px, 56vw, 680px)",
        }}
      >
        {/* Full-bleed banner photo */}
        <img
          src="/new_main_banner.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "right center", zIndex: 0 }}
        />
        {/* Soft left-side wash so text stays legible on any crop */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(245,239,231,0.92) 0%, rgba(245,239,231,0.78) 30%, rgba(245,239,231,0.35) 55%, rgba(245,239,231,0) 75%)",
            zIndex: 1,
          }}
        />

        {/* Text content overlay */}
        <div
          className="relative mx-auto max-w-7xl flex items-center"
          style={{
            zIndex: 2,
            minHeight: "clamp(440px, 56vw, 680px)",
            padding:
              "clamp(48px, 8vw, 96px) clamp(24px, 5vw, 64px)",
          }}
        >
          <Reveal>
            <div style={{ maxWidth: 520 }}>
              <span
                className="inline-block text-[11px] font-semibold uppercase tracking-[0.18em] mb-5"
                style={{ color: "var(--brand)" }}
              >
                Новая коллекция · Лето 2026
              </span>
              <h1
                className="font-serif font-bold tracking-[-0.02em] text-foreground"
                style={{
                  fontSize: "clamp(40px, 6vw, 72px)",
                  lineHeight: 1.04,
                  marginBottom: 24,
                }}
              >
                Видеть мир
                <br />
                на 100%
              </h1>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: 18,
                  lineHeight: 1.55,
                  maxWidth: 460,
                  marginBottom: 32,
                }}
              >
                Более 11&nbsp;000 оправ от 120 брендов. Ручная подгонка
                в&nbsp;наших салонах в&nbsp;Санкт-Петербурге
                и&nbsp;Новокузнецке.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/catalog_s/$category"
                  params={{ category: "opravy" }}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold bg-brand text-brand-foreground hover:opacity-90 transition-opacity"
                >
                  Подобрать оправу
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setVtoOpen(true)}
                  className="group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold border border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                >
                  <span
                    className="flex items-center justify-center rounded-full transition-colors"
                    style={{
                      width: 26,
                      height: 26,
                      background: "var(--brand)",
                      color: "var(--brand-foreground)",
                    }}
                  >
                    <TryOnIcon className="h-3.5 w-3.5" />
                  </span>
                  Виртуальная примерка
                </button>
              </div>

              <div
                className="mt-10 grid grid-cols-3 gap-6"
                style={{ maxWidth: 460 }}
              >
                {HERO_STATS.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <strong
                      className="font-serif text-foreground"
                      style={{ fontSize: 20 }}
                    >
                      {s.value}
                    </strong>
                    <span
                      className="text-muted-foreground"
                      style={{ fontSize: 12, lineHeight: 1.35 }}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          1b. SERVICE STRIP — separate white section, 4 icon cards
         ───────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full"
        style={{ background: "var(--background)" }}
      >
        <div
          className="mx-auto max-w-7xl"
          style={{
            padding: "clamp(28px, 4vw, 48px) clamp(24px, 5vw, 64px)",
          }}
        >
          <Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {HERO_SERVICES.map(({ slug, title, subtitle, Icon }) => {
                const inner = (
                  <>
                    <span
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: 44,
                        height: 44,
                        background: "var(--brand)",
                        color: "var(--brand-foreground)",
                        boxShadow:
                          "0 6px 16px -6px rgba(180, 40, 30, 0.45)",
                      }}
                    >
                      <Icon size={20} strokeWidth={2} />
                    </span>
                    <div className="flex flex-col">
                      <span
                        className="font-medium text-foreground leading-tight"
                        style={{ fontSize: 15 }}
                      >
                        {title}
                      </span>
                      <span
                        className="text-muted-foreground leading-tight"
                        style={{ fontSize: 12.5, marginTop: 3 }}
                      >
                        {subtitle}
                      </span>
                    </div>
                  </>
                );
                const className =
                  "flex items-center gap-3.5 text-left w-full hover:-translate-y-0.5 transition-transform duration-200";
                if (slug === "priem-vracha") {
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => setAptOpen(true)}
                      className={`${className} bg-transparent border-0 cursor-pointer p-0`}
                    >
                      {inner}
                    </button>
                  );
                }
                return (
                  <a key={slug} href={serviceHref(slug)} className={className}>
                    {inner}
                  </a>
                );
              })}
            </div>
          </Reveal>
        </div>
        {/* Divider under the strip */}
        <div
          aria-hidden
          className="mx-auto max-w-7xl"
          style={{
            height: 1,
            background: "var(--border)",
            opacity: 0.6,
          }}
        />
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. CATEGORIES — Подберите свои идеальные очки (1:1 with screenshot)
         ───────────────────────────────────────────────────────────── */}
      <section
        style={{ background: "#FAF9F7", padding: "clamp(56px, 7vw, 96px) 0" }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Header row: eyebrow + H2 on left, "See all" link on right */}
          <Reveal className="flex items-end justify-between gap-4 mb-8 lg:mb-10">
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.22em] mb-3"
                style={{ color: "var(--brand)" }}
              >
                Категории
              </div>
              <h2
                className="font-serif text-foreground"
                style={{
                  fontSize: "clamp(28px, 3.6vw, 44px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                }}
              >
                Подберите свои идеальные очки
              </h2>
            </div>
            <Link
              to="/catalog_s/$category"
              params={{ category: "opravy" }}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--brand)" }}
            >
              Смотреть все категории <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          {/* Grid layout per screenshot: tall left + wide top-right + 2 bottom-right tiles */}
          <style>{`
            .o100-cat-grid{
              display:grid;
              gap:16px;
              grid-template-columns:1fr;
              grid-auto-rows:280px;
            }
            @media (min-width:1024px){
              .o100-cat-grid{
                grid-template-columns:1.15fr 0.95fr 0.95fr;
                grid-template-rows:repeat(2, 1fr);
                grid-template-areas:
                  "women  sun     sun"
                  "women  men     kids";
                grid-auto-rows:initial;
                min-height:600px;
              }
              .o100-cat-area-women{grid-area:women}
              .o100-cat-area-sun{grid-area:sun}
              .o100-cat-area-men{grid-area:men}
              .o100-cat-area-kids{grid-area:kids}
            }
          `}</style>
          <div className="o100-cat-grid">
            <Reveal className="o100-cat-area-women">
              <CategoryTile cell={CAT_CELLS[0]} />
            </Reveal>
            <Reveal delay={80} className="o100-cat-area-sun">
              <CategoryTile cell={CAT_CELLS[1]} />
            </Reveal>
            <Reveal delay={160} className="o100-cat-area-men">
              <CategoryTile cell={CAT_CELLS[2]} />
            </Reveal>
            <Reveal delay={240} className="o100-cat-area-kids">
              <CategoryTile cell={CAT_CELLS[3]} />
            </Reveal>
          </div>

          {/* Mobile "see all" link */}
          <div className="mt-6 sm:hidden">
            <Link
              to="/catalog_s/$category"
              params={{ category: "opravy" }}
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: "var(--brand)" }}
            >
              Смотреть все категории <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. POPULAR MODELS — Хиты продаж (cream bg, header w/ nav arrows)
         ───────────────────────────────────────────────────────────── */}
      <section
        style={{ background: "#FAF9F7", padding: "clamp(56px, 7vw, 96px) 0" }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <MainV2HitsCarousel products={hits} />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. WHY TRUST US — Почему нам доверяют (2-col: heading | 4 reasons)
         ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-cream"
        style={{ padding: "clamp(56px, 7vw, 96px) 0" }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div
            className="grid gap-10 lg:gap-14"
            style={{ gridTemplateColumns: "1fr" }}
          >
            <style>{`
              .o100-trust-grid{display:grid;gap:40px;grid-template-columns:1fr}
              @media (min-width:1024px){
                .o100-trust-grid{grid-template-columns:1fr 1.6fr;gap:64px;align-items:start}
              }
              .o100-trust-items{display:grid;gap:32px;grid-template-columns:1fr 1fr}
              @media (min-width:768px){
                .o100-trust-items{grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
              }
            `}</style>
            <div className="o100-trust-grid">
              {/* Left — heading */}
              <Reveal>
                <div
                  className="text-[11px] uppercase tracking-[0.22em] mb-4"
                  style={{ color: "var(--brand)" }}
                >
                  Почему нам доверяют
                </div>
                <h2
                  className="font-serif text-foreground"
                  style={{
                    fontSize: "clamp(28px, 3.4vw, 42px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Профессионализм.
                  <br />
                  Качество. Забота.
                </h2>
              </Reveal>

              {/* Right — 4 reasons */}
              <div className="o100-trust-items">
                {TRUST_REASONS.map(({ Icon, title, text }, i) => (
                  <Reveal key={title} delay={i * 90}>
                    <div className="flex flex-col">
                      <span
                        className="flex items-center justify-center rounded-full mb-4"
                        style={{
                          width: 48,
                          height: 48,
                          border: "1.5px solid var(--brand)",
                          color: "var(--brand)",
                        }}
                      >
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <div
                        className="font-medium text-foreground"
                        style={{ fontSize: 15, marginBottom: 8, lineHeight: 1.3 }}
                      >
                        {title}
                      </div>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: 13, lineHeight: 1.5 }}
                      >
                        {text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. PAIRED BANNERS — child myopia + virtual try-on promo
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Left — child myopia */}
          <Reveal>
            <div
              className="relative rounded-2xl overflow-hidden bg-cream grid h-full"
              style={{
                gridTemplateColumns: "1fr",
                minHeight: 340,
              }}
            >
              <div
                className="grid h-full"
                style={{ gridTemplateColumns: "1fr 1fr", minHeight: 340 }}
              >
                <div className="relative h-full min-h-[340px]">
                  <img
                    src="/main_bottom_child_banner.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center p-7">
                  <div
                    className="text-[11px] uppercase tracking-[0.2em] mb-3"
                    style={{ color: "var(--brand)" }}
                  >
                    Контроль миопии
                  </div>
                  <h3
                    className="font-serif"
                    style={{
                      fontSize: 24,
                      lineHeight: 1.15,
                      marginBottom: 12,
                    }}
                  >
                    Замедляем близорукость у детей
                  </h3>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 20 }}
                  >
                    Линзы Stellest и MiSight 1-Day, профильный кабинет
                    в&nbsp;нашей клинике.
                  </p>
                  <a
                    href={serviceHref("diagnostika")}
                    className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium self-start"
                    style={{
                      background: "var(--foreground)",
                      color: "var(--background)",
                    }}
                  >
                    Записаться на диагностику{" "}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right — red virtual try-on promo */}
          <Reveal delay={120}>
            <div
              className="relative rounded-2xl overflow-hidden flex flex-col justify-between h-full"
              style={{
                background: "var(--brand)",
                color: "var(--brand-foreground)",
                padding: 32,
                minHeight: 340,
              }}
            >
              <img
                src="/processed_glasses_example.png"
                alt=""
                className="absolute pointer-events-none"
                style={{
                  right: -20,
                  bottom: -20,
                  width: 220,
                  opacity: 0.22,
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  className="text-[11px] uppercase tracking-[0.2em] mb-3"
                  style={{ opacity: 0.85 }}
                >
                  Виртуальная примерка
                </div>
                <h3
                  className="font-serif"
                  style={{ fontSize: 24, lineHeight: 1.15, marginBottom: 16 }}
                >
                  Примерьте 11&nbsp;000 оправ онлайн
                </h3>
                <div className="flex items-baseline gap-3">
                  <span
                    style={{
                      fontSize: 64,
                      fontFamily: "var(--font-serif)",
                      lineHeight: 1,
                    }}
                  >
                    −50%
                  </span>
                  <span style={{ fontSize: 14, opacity: 0.9 }}>
                    при первой покупке через VTO
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVtoOpen(true)}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold self-start cursor-pointer"
                style={{
                  background: "var(--background)",
                  color: "var(--foreground)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Попробовать <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SERVICES — 4 photo cards
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <div
            className="text-[11px] uppercase tracking-[0.2em] mb-3"
            style={{ color: "var(--brand)" }}
          >
            Услуги клиники
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl">
            Комплексные услуги по подбору очков и линз
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_LIST.map((s, i) => {
            const img = SERVICE_IMAGES[i];
            const inner = (
              <>
                <div className="aspect-[4/3] overflow-hidden bg-cream">
                  <img
                    src={img}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <div className="font-serif text-lg">{s.title}</div>
                  <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-1 group-hover:text-foreground">
                    Подробнее <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </>
            );
            const className =
              "group block rounded-2xl overflow-hidden border border-border bg-background hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer";
            if (s.slug === "priem-vracha") {
              return (
                <Reveal key={s.slug} delay={i * 80}>
                  <button
                    type="button"
                    onClick={() => setAptOpen(true)}
                    className={`${className} text-left w-full`}
                  >
                    {inner}
                  </button>
                </Reveal>
              );
            }
            return (
              <Reveal key={s.slug} delay={i * 80}>
                <a href={serviceHref(s.slug)} className={className}>
                  {inner}
                </a>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. SALONS — Приходите к нам
         ───────────────────────────────────────────────────────────── */}
      <SalonsSection />

      {/* ─────────────────────────────────────────────────────────────
          8. JOURNAL — Полезные статьи
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
        <Reveal className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div
              className="text-[11px] uppercase tracking-[0.2em] mb-2"
              style={{ color: "var(--brand)" }}
            >
              Журнал
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl">Полезные статьи</h2>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-1 text-sm hover:text-brand"
          >
            Все статьи <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {recent.map((a, i) => (
            <Reveal key={a.slug} delay={i * 100}>
              <Link
                to="/blog/$category/$slug"
                params={{ category: a.categorySlug, slug: a.slug }}
                className="group block"
              >
                <div className="aspect-[4/3] bg-cream rounded-2xl overflow-hidden mb-4">
                  <img
                    src={a.cover}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="inline-block text-[11px] uppercase tracking-wider text-brand border border-brand/30 rounded-full px-2.5 py-0.5">
                  {a.category}
                </span>
                <h3 className="font-serif text-xl mt-3 group-hover:text-brand transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">{a.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <AppointmentModal open={aptOpen} onOpenChange={setAptOpen} />
      <VirtualTryOnModal
        open={vtoOpen}
        onClose={() => setVtoOpen(false)}
        vtoSku="rayban_aviator_or_vertFlash"
      />
    </div>
  );
}

/**
 * Local product card for main-v2. Differs from the shared `ProductCard`:
 *   – Heart icon (favorite) is always visible top-right, red outline.
 *   – No try-on badge overlay (the page surfaces VTO via the hero CTA / promo banner).
 *   – Simpler price + color-dots row, no brand caption.
 *   – White card with rounded corners that sit on the cream background.
 */
function MainV2ProductCard({ product }: { product: Product }) {
  const { toggleSaved, saved } = useCart();
  const isSaved = saved.includes(product.slug);
  const dots = product.colors?.slice(0, 4) ?? [];
  const extra = (product.colors?.length ?? 0) - dots.length;

  // Compose display name: prefer brand prefix when set (e.g. "Ray-Ban RX 7159"),
  // else fall back to product.name alone.
  const displayName =
    product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase())
      ? `${product.brand} ${product.name}`
      : product.name;

  return (
    <div className="group/card flex flex-col h-full">
      <Link
        to="/catalog_s/$category/$slug"
        params={{
          category: categoryToSegment[product.category],
          slug: product.slug,
        }}
        className="relative block aspect-square overflow-hidden"
        style={{
          background: "var(--background)",
          borderRadius: 16,
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -16px rgba(0,0,0,0.08)",
        }}
        aria-label={displayName}
      >
        <img
          src={product.images[0]}
          alt={displayName}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-contain p-7 transition-transform duration-500 group-hover/card:scale-[1.04]"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleSaved(product.slug);
          }}
          className="absolute top-3 right-3 flex items-center justify-center rounded-full transition-colors"
          style={{
            width: 36,
            height: 36,
            background: "transparent",
            color: "var(--brand)",
          }}
          aria-label="В избранное"
        >
          <Heart
            className="h-5 w-5"
            strokeWidth={1.75}
            fill={isSaved ? "var(--brand)" : "none"}
          />
        </button>
      </Link>

      <div className="mt-4 flex flex-col gap-2 px-1">
        <Link
          to="/catalog_s/$category/$slug"
          params={{
            category: categoryToSegment[product.category],
            slug: product.slug,
          }}
          className="text-sm text-foreground hover:text-brand transition-colors"
          style={{ lineHeight: 1.3 }}
        >
          {displayName}
        </Link>
        <div className="text-foreground" style={{ fontSize: 15, fontWeight: 600 }}>
          {formatPrice(product.price)}
        </div>
        {dots.length > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {dots.map((c) => (
              <span
                key={c.name}
                className="inline-block rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  background: c.hex,
                  border:
                    "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)",
                }}
                title={c.name}
              />
            ))}
            {extra > 0 && (
              <span
                className="text-muted-foreground"
                style={{ fontSize: 11, marginLeft: 2 }}
              >
                +{extra}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Carousel wrapper for main-v2 Popular Models. Header row places nav arrows
 * inline with the "Смотреть все" link, per the design screenshot.
 */
function MainV2HitsCarousel({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const navBtn =
    "flex items-center justify-center rounded-full border border-border bg-background hover:bg-cream hover:border-foreground transition-colors";

  return (
    <div>
      <Reveal className="flex items-end justify-between gap-4 mb-8 lg:mb-10">
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.22em] mb-3"
            style={{ color: "var(--brand)" }}
          >
            Хиты продаж
          </div>
          <h2
            className="font-serif text-foreground"
            style={{
              fontSize: "clamp(28px, 3.4vw, 42px)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            Популярные модели
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/catalog_s/$category"
            params={{ category: "opravy" }}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "var(--brand)" }}
          >
            Смотреть все <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Назад"
              className={navBtn}
              style={{ width: 40, height: 40 }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Вперёд"
              className={navBtn}
              style={{ width: 40, height: 40 }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <div
              key={p.slug}
              className="snap-start shrink-0 w-[70%] sm:w-[42%] md:w-[31%] lg:w-[23.5%]"
            >
              <MainV2ProductCard product={p} />
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

function CategoryTile({
  cell,
}: {
  cell: (typeof CAT_CELLS)[number];
}) {
  const isTop = cell.titlePos === "top";
  // Gradient direction depends on text position so the dark wash is
  // always behind the text (top-anchored vs bottom-anchored).
  const gradient = isTop
    ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0) 70%)"
    : "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)";
  return (
    <a
      href={cell.href}
      className="group relative block rounded-2xl overflow-hidden bg-cream hover:-translate-y-1 transition-transform duration-300 h-full w-full"
    >
      <img
        src={cell.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
      />
      <div
        className="absolute inset-0"
        style={{ background: gradient }}
      />
      <div
        className="absolute"
        style={{
          left: "clamp(20px, 2.4vw, 32px)",
          right: "clamp(20px, 2.4vw, 32px)",
          [isTop ? "top" : "bottom"]: "clamp(20px, 2.4vw, 32px)",
          color: "#fff",
        }}
      >
        <h3
          className="font-serif leading-tight"
          style={{
            fontSize: "clamp(22px, 2.4vw, 32px)",
            letterSpacing: "-0.005em",
            marginBottom: 6,
          }}
        >
          {cell.title}
        </h3>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.4,
            opacity: 0.88,
            marginBottom: 18,
          }}
        >
          {cell.subtitle}
        </p>
        <span
          className="inline-flex items-center gap-1.5 rounded-full text-sm font-medium transition-colors"
          style={{
            border: "1px solid rgba(255,255,255,0.85)",
            color: "#fff",
            padding: "8px 18px",
            background: "transparent",
          }}
        >
          Смотреть
        </span>
      </div>
    </a>
  );
}
