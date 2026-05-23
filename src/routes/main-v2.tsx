import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Stethoscope,
  Eye,
  Glasses,
  Wrench,
  ShieldCheck,
  Truck,
  Award,
} from "lucide-react";
import { ProductCarousel } from "@/components/ProductCarousel";
import { SalonsSection } from "@/components/SalonsSection";
import { AppointmentModal } from "@/components/AppointmentModal";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { Reveal } from "@/components/Reveal";
import { catalogHref } from "@/data/categories";
import { bestsellers } from "@/data/products";
import { articles } from "@/data/articles";
import { serviceHref } from "@/data/services";

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
  { slug: "priem-vracha", title: "Запись к врачу", Icon: Stethoscope },
  { slug: "podbor-ochkov", title: "Подбор оправ", Icon: Glasses },
  { slug: "diagnostika", title: "Диагностика зрения", Icon: Eye },
  { slug: "remont", title: "Ремонт очков", Icon: Wrench },
] as const;

const HERO_STATS = [
  { value: "11 000+", label: "оправ от 120 брендов" },
  { value: "2 города", label: "СПб · Новокузнецк" },
  { value: "4.9 ★", label: "1 840 отзывов" },
];

const PROMISES = [
  {
    Icon: ShieldCheck,
    title: "Гарантия 2 года",
    text: "Бесплатная замена при заводском браке.",
  },
  {
    Icon: Truck,
    title: "Доставка по РФ",
    text: "Бесплатно по СПб от 5 000 ₽.",
  },
  {
    Icon: Award,
    title: "Сервис в подарок",
    text: "Подбор, подгонка и чистка — без доплат.",
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

// Asymmetric category grid cells. The red sunglasses promo spans both rows
// on desktop; everything else is a 1×1 image-overlay tile.
const CAT_CELLS = [
  {
    slug: "opravy-zhenskie",
    title: "Женские оправы",
    eyebrow: "Категория",
    image: "/categ_frames_v4.png",
    href: catalogHref("opravy"),
  },
  {
    slug: "opravy-muzhskie",
    title: "Мужские оправы",
    eyebrow: "Категория",
    image: "/category_frames_gemini.png",
    href: catalogHref("opravy"),
  },
  {
    slug: "detskie-opravy",
    title: "Детские оправы",
    eyebrow: "Категория",
    image: "/main_bottom_child_banner.png",
    href: catalogHref("opravy"),
  },
  {
    slug: "kontaktnye-linzy",
    title: "Контактные линзы",
    eyebrow: "Категория",
    image: "/categ_contact_lens_v4.png",
    href: catalogHref("kontaktnye-linzy"),
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
          1. HERO — cream, two-column, with inline service strip
         ───────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full bg-cream overflow-hidden"
        style={{
          padding:
            "clamp(48px, 8vw, 80px) clamp(24px, 5vw, 64px)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left — text */}
            <Reveal>
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
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold border border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                >
                  Виртуальная примерка
                </button>
              </div>

              <div
                className="mt-10 grid grid-cols-3 gap-6"
                style={{ maxWidth: 460 }}
              >
                {HERO_STATS.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <strong className="font-serif text-foreground" style={{ fontSize: 20 }}>
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
            </Reveal>

            {/* Right — portrait */}
            <Reveal delay={120}>
              <div
                className="relative aspect-[4/5] rounded-3xl overflow-hidden"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.10)" }}
              >
                <img
                  src="/new_main_banner.png"
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "right center" }}
                />
              </div>
            </Reveal>
          </div>

          {/* Service shortcut strip */}
          <Reveal delay={220}>
            <div className="mt-12 lg:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {HERO_SERVICES.map(({ slug, title, Icon }) => {
                const inner = (
                  <>
                    <span
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: 40,
                        height: 40,
                        background: "oklch(0.96 0.025 28)",
                        color: "var(--brand)",
                      }}
                    >
                      <Icon size={18} strokeWidth={1.75} />
                    </span>
                    <span className="text-sm font-medium text-foreground leading-tight">
                      {title}
                    </span>
                  </>
                );
                const className =
                  "flex items-center gap-3 rounded-2xl bg-background border border-border px-4 py-3 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-left w-full";
                if (slug === "priem-vracha") {
                  return (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => setAptOpen(true)}
                      className={`${className} cursor-pointer`}
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
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. CATEGORIES — asymmetric grid with red sunglasses promo
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <div
            className="text-[11px] uppercase tracking-[0.2em] mb-3"
            style={{ color: "var(--brand)" }}
          >
            Категории
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl">
            Подберите свои идеальные очки
          </h2>
        </Reveal>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
          }}
        >
          <div
            className="grid gap-4 lg:gap-4"
            style={{
              gridTemplateColumns: "1fr",
            }}
          />
          {/* Render two parallel column-tracks via CSS grid on desktop */}
          <style>{`
            .o100-cat-grid{display:grid;gap:16px;grid-template-columns:1fr}
            @media (min-width:1024px){
              .o100-cat-grid{
                grid-template-columns:repeat(3,minmax(0,1fr));
                grid-template-rows:repeat(2,1fr);
                grid-auto-flow:dense;
                min-height:520px;
              }
              .o100-cat-redcell{grid-column:3 / span 1;grid-row:1 / span 2}
            }
          `}</style>
        </div>

        <div className="o100-cat-grid">
          {/* Cell A — Женские оправы */}
          <Reveal>
            <CategoryTile cell={CAT_CELLS[0]} />
          </Reveal>

          {/* Cell B — Мужские оправы */}
          <Reveal delay={80}>
            <CategoryTile cell={CAT_CELLS[1]} />
          </Reveal>

          {/* Cell C — RED sunglasses promo (spans both rows on desktop) */}
          <Reveal delay={160} className="o100-cat-redcell">
            <a
              href={catalogHref("solntsezashchitnye")}
              className="group relative block h-full overflow-hidden rounded-2xl"
              style={{
                background: "var(--brand)",
                color: "var(--brand-foreground)",
                minHeight: 320,
              }}
            >
              <img
                src="/categ_sunglasses_v4.png"
                alt=""
                className="absolute pointer-events-none transition-transform duration-700 group-hover:scale-105"
                style={{
                  right: -30,
                  bottom: -20,
                  width: "70%",
                  opacity: 0.55,
                  filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.25))",
                }}
              />
              <div
                className="absolute"
                style={{
                  top: 28,
                  left: 28,
                  right: 28,
                  zIndex: 1,
                }}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.2em] mb-3"
                  style={{ opacity: 0.85 }}
                >
                  Хиты сезона
                </div>
                <h3
                  className="font-serif"
                  style={{
                    fontSize: "clamp(26px, 3vw, 38px)",
                    lineHeight: 1.05,
                    marginBottom: 12,
                  }}
                >
                  Солнцезащитные очки
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.9, maxWidth: 320 }}>
                  Защита от UV и стиль на каждый день — от 120 брендов.
                </p>
              </div>
              <span
                className="absolute inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
                style={{
                  left: 28,
                  bottom: 28,
                  background: "var(--background)",
                  color: "var(--foreground)",
                }}
              >
                Смотреть <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </Reveal>

          {/* Cell D — Детские оправы */}
          <Reveal delay={240}>
            <CategoryTile cell={CAT_CELLS[2]} />
          </Reveal>

          {/* Cell E — Контактные линзы */}
          <Reveal delay={320}>
            <CategoryTile cell={CAT_CELLS[3]} />
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. POPULAR MODELS — carousel
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20">
        <Reveal className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div
              className="text-[11px] uppercase tracking-[0.2em] mb-2"
              style={{ color: "var(--brand)" }}
            >
              Хиты сезона
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl">
              Популярные модели
            </h2>
          </div>
          <Link
            to="/catalog_s/$category"
            params={{ category: "opravy" }}
            className="hidden sm:inline-flex items-center gap-2 border border-border rounded-full px-4 py-2 text-sm hover:border-foreground bg-background"
          >
            Смотреть все <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <Reveal delay={120}>
          <ProductCarousel products={hits} />
        </Reveal>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. BRAND PROMISE — 3 flat benefit cards
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-14">
          <div className="grid sm:grid-cols-3 gap-5">
            {PROMISES.map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="flex items-start gap-4 rounded-2xl bg-background border border-border p-5 h-full">
                  <span
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      background: "oklch(0.96 0.025 28)",
                      color: "var(--brand)",
                    }}
                  >
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <div>
                    <div className="font-serif text-lg leading-tight">
                      {title}
                    </div>
                    <p
                      className="text-muted-foreground"
                      style={{ fontSize: 13.5, marginTop: 4, lineHeight: 1.5 }}
                    >
                      {text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
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

function CategoryTile({
  cell,
}: {
  cell: (typeof CAT_CELLS)[number];
}) {
  return (
    <a
      href={cell.href}
      className="group relative block rounded-2xl overflow-hidden bg-cream hover:-translate-y-1 transition-transform duration-300 h-full"
      style={{ minHeight: 240 }}
    >
      <img
        src={cell.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        className="absolute"
        style={{ left: 20, right: 20, bottom: 20, color: "#fff" }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.15em] mb-2"
          style={{ opacity: 0.9 }}
        >
          {cell.eyebrow}
        </div>
        <div className="font-serif text-xl leading-tight mb-3">{cell.title}</div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm group-hover:bg-brand group-hover:text-brand-foreground transition-colors"
          style={{ background: "var(--background)", color: "var(--foreground)" }}
        >
          Смотреть <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </a>
  );
}
