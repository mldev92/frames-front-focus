import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  GraduationCap,
  Microscope,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { SalonsSection } from "@/components/SalonsSection";
import { AppointmentModal } from "@/components/AppointmentModal";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";
import { Reveal } from "@/components/Reveal";
import { catalogHref, categoryToSegment } from "@/data/categories";
import { bestsellers } from "@/data/products";
import { articles } from "@/data/articles";
import { serviceHref } from "@/data/services";
import { Calendar, Users, MapPin, Award, Phone, Send } from "lucide-react";
import { promotions } from "@/data/promotions";
import { useCart, formatPrice } from "@/lib/store/cart";
import type { Product } from "@/data/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ОПТИКА 100% — оправы, очки и контактные линзы в Санкт-Петербурге" },
      {
        name: "description",
        content:
          "Интернет-магазин и салоны ОПТИКА 100%: оправы, солнцезащитные очки, контактные линзы Acuvue, CooperVision, Bausch+Lomb. Подбор и диагностика.",
      },
      {
        property: "og:title",
        content: "ОПТИКА 100% — оправы, очки и контактные линзы в Санкт-Петербурге",
      },
      {
        property: "og:description",
        content:
          "Большой выбор оправ и линз, услуги клиники зрения, салоны в центре Санкт-Петербурга.",
      },
      { property: "og:image", content: "/new_main_banner.png" },
    ],
  }),
  component: MainV2Page,
});

const HERO_STATS = [
  { value: "11 000+", label: "довольных клиентов", Icon: Users },
  { value: "2 города", label: "салоны оптики", Icon: MapPin },
  { value: "10+ лет", label: "заботы о вашем зрении", Icon: Award },
];

const TRUST_REASONS = [
  {
    Icon: GraduationCap,
    title: "10 лет в оптике",
    text: "Команда из 18 врачей и оптометристов. Принимаем по ОМС и ДМС.",
  },
  {
    Icon: Microscope,
    title: "Премиум-диагностика",
    text: "Авторефрактометр Topcon, аберрометр Tracey-VFA, биомикроскоп Zeiss.",
  },
  {
    Icon: ShieldCheck,
    title: "Гарантия 12 месяцев",
    text: "Только оригинальные линзы и оправы. Бесплатная замена при браке.",
  },
  {
    Icon: HeartHandshake,
    title: "Бесплатный сервис",
    text: "Подгонка, чистка, замена винтов — навсегда после покупки.",
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
    image: "/new_categories_4.png",
    href: catalogHref("opravy"),
    titlePos: "bottom" as const,
  },
  {
    slug: "detskie-ochki",
    title: "Детские очки",
    subtitle: "Для заботы о будущем",
    image: "/new_categories_3.png",
    href: catalogHref("opravy"),
    titlePos: "bottom" as const,
  },
];

function MainV2Page() {
  const hits = bestsellers();
  const recent = articles.slice(0, 2);
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
        {/* Hero light/brightness animation — inline styles only, mirrors `_light` on `/`.
            No prefers-reduced-motion check on purpose: the home page (index.tsx) doesn't
            check either, and turning it off here masks the effect on systems where the
            OS toggle is on. */}
        <style>{`
          @keyframes _heroImgPulseV2 {
            0%, 100% { filter: brightness(0.96) contrast(1.00) saturate(1.00); transform: scale(1.00); }
            50%      { filter: brightness(1.06) contrast(1.03) saturate(1.04); transform: scale(1.012); }
          }
          @keyframes _heroLightV2 {
            0%, 100% { opacity: 1.00; background-position:   0% 50%; }
            50%      { opacity: 0.92; background-position: 100% 50%; }
          }
          @keyframes _heroSheenV2 {
            0%   { transform: translateX(-60%) skewX(-14deg); opacity: 0; }
            15%  { opacity: 0.35; }
            55%  { opacity: 0.35; }
            100% { transform: translateX(260%) skewX(-14deg); opacity: 0; }
          }
          @keyframes _heroSunV2 {
            0%, 100% { opacity: 0.45; transform: translate(0,0) scale(1.00); }
            50%      { opacity: 0.70; transform: translate(-12px, 10px) scale(1.06); }
          }
          @keyframes _bannerFadeA {
            0%, 43%  { opacity: 1; }
            50%, 93% { opacity: 0; }
            100%     { opacity: 1; }
          }
          @keyframes _bannerFadeB {
            0%, 43%  { opacity: 0; }
            50%, 93% { opacity: 1; }
            100%     { opacity: 0; }
          }
        `}</style>

        {/* Banner A — new_main_banner.png */}
        <img
          src="/new_main_banner.png"
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
            zIndex: 0,
            animation: "_heroImgPulseV2 6s ease-in-out infinite, _bannerFadeA 14s ease-in-out infinite",
            willChange: "filter, transform, opacity",
          }}
        />
        {/* Banner B — 100_full_reconstruction_v3_image_1.png */}
        <img
          src="/2nd_banner.png"
          alt=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
            zIndex: 0,
            animation: "_heroImgPulseV2 6s ease-in-out infinite, _bannerFadeB 14s ease-in-out infinite",
            willChange: "filter, transform, opacity",
          }}
        />
        {/* Warm "sun" glow on the right — pulsing light source */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            zIndex: 1,
            top: "5%",
            right: "5%",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,225,170,0.95) 0%, rgba(255,195,130,0.55) 35%, rgba(255,170,110,0) 72%)",
            mixBlendMode: "screen",
            filter: "blur(48px)",
            pointerEvents: "none",
            animation: "_heroSunV2 7s ease-in-out infinite",
          }}
        />
        {/* Soft left-side wash so text stays legible (pulsing intensity, drifts laterally) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(90deg, rgba(245,239,231,0.95) 0%, rgba(245,239,231,0.78) 30%, rgba(245,239,231,0.35) 55%, rgba(245,239,231,0) 75%)",
            backgroundSize: "220% 100%",
            zIndex: 2,
            animation: "_heroLightV2 8s ease-in-out infinite",
          }}
        />
        {/* Diagonal sheen — bright light sweep across visible photo area */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "20%",
            width: "45%",
            zIndex: 3,
            background:
              "linear-gradient(100deg, transparent 0%, rgba(255,240,210,0) 20%, rgba(255,240,210,0.55) 50%, rgba(255,240,210,0) 80%, transparent 100%)",
            pointerEvents: "none",
            animation: "_heroSheenV2 9s ease-in-out infinite",
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
                Современные очки, профессиональный подбор и&nbsp;забота
                о&nbsp;вашем зрении.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setAptOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ background: "var(--brand)" }}
                >
                  Записаться на проверку
                </button>
                <Link
                  to="/catalog_s/$category"
                  params={{ category: "opravy" }}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold border border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M2.402 2.652a.25.25 0 0 0-.25.25v2a.75.75 0 1 1-1.5 0v-2c0-.966.784-1.75 1.75-1.75h2a.75.75 0 1 1 0 1.5h-2Zm11.146.25a.25.25 0 0 0-.25-.25h-2a.75.75 0 0 1 0-1.5h2c.967 0 1.75.784 1.75 1.75v2a.75.75 0 0 1-1.5 0v-2ZM2.402 14.048a.25.25 0 0 1-.25-.25v-2a.75.75 0 1 0-1.5 0v2c0 .966.784 1.75 1.75 1.75h2a.75.75 0 0 0 0-1.5h-2Zm10.896 0a.25.25 0 0 0 .25-.25v-2a.75.75 0 0 1 1.5 0v2a1.75 1.75 0 0 1-1.75 1.75h-2a.75.75 0 0 1 0-1.5h2ZM8 7.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-3.75 4.5a3.75 3.75 0 1 1 7.5 0h-1.5a2.25 2.25 0 1 0-4.5 0h-1.5Z"
                      fill="currentColor"
                    />
                  </svg>
                  Примерить онлайн
                </Link>
              </div>

              <div
                className="mt-10 grid grid-cols-3 gap-6"
                style={{ maxWidth: 460 }}
              >
                {HERO_STATS.map((s) => (
                  <div key={s.label} className="flex items-start gap-2.5">
                    <span
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{
                        width: 32,
                        height: 32,
                        background: "color-mix(in oklab, var(--brand) 12%, transparent)",
                        color: "var(--brand)",
                      }}
                    >
                      <s.Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="flex flex-col">
                      <strong
                        className="font-serif text-foreground"
                        style={{ fontSize: 18, lineHeight: 1.1 }}
                      >
                        {s.value}
                      </strong>
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: 12, lineHeight: 1.35, marginTop: 2 }}
                      >
                        {s.label}
                      </span>
                    </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex items-start space-x-4 md:px-6 pt-6 md:pt-0 group">
              <div className="w-12 h-12 rounded-full bg-[#fbf9f6] flex items-center justify-center flex-shrink-0 text-[#c83b3b] group-hover:bg-[#c83b3b] group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                </svg>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">01 — ДИАГНОСТИКА</div>
                <h3 className="font-semibold text-gray-900 mb-1">Проверка зрения</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Современная диагностика за 30 минут</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 md:px-6 pt-6 md:pt-0 group">
              <div className="w-12 h-12 rounded-full bg-[#fbf9f6] flex items-center justify-center flex-shrink-0 text-[#c83b3b] group-hover:bg-[#c83b3b] group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                </svg>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">02 — ПОДБОР</div>
                <h3 className="font-semibold text-gray-900 mb-1">Подбор очков</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Индивидуальный подбор оправ и линз</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 md:px-6 pt-6 md:pt-0 group">
              <div className="w-12 h-12 rounded-full bg-[#fbf9f6] flex items-center justify-center flex-shrink-0 text-[#c83b3b] group-hover:bg-[#c83b3b] group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                </svg>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">03 — ЗАБОТА</div>
                <h3 className="font-semibold text-gray-900 mb-1">Контроль миопии</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Программы для детей и подростков</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 md:px-6 pt-6 md:pt-0 group">
              <div className="w-12 h-12 rounded-full bg-[#fbf9f6] flex items-center justify-center flex-shrink-0 text-[#c83b3b] group-hover:bg-[#c83b3b] group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                </svg>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">04 — СЕРВИС</div>
                <h3 className="font-semibold text-gray-900 mb-1">Ремонт очков</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Быстрый и качественный ремонт</p>
              </div>
            </div>

            </div>
          </Reveal>
          </div>
        
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. CATEGORIES — Подберите свои идеальные очки (1:1 with screenshot)
         ───────────────────────────────────────────────────────────── */}
      <section
        style={{ background: "var(--cream)", padding: "clamp(56px, 7vw, 96px) 0" }}
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
        style={{ background: "var(--cream)", padding: "clamp(56px, 7vw, 96px) 0" }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <MainV2HitsCarousel products={hits} />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. WHY TRUST US — Почему нам доверяют (2-col: heading | 4 reasons)
         ───────────────────────────────────────────────────────────── */}
      <section
        style={{ background: "var(--cream)", padding: "clamp(56px, 7vw, 96px) 0" }}
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div
            className="grid gap-10 lg:gap-14"
            style={{ gridTemplateColumns: "1fr" }}
          >
            <style>{`
              .o100-trust-grid{display:grid;gap:40px;grid-template-columns:1fr}
              @media (min-width:1024px){
                .o100-trust-grid{grid-template-columns:1fr 1.6fr;gap:72px;align-items:start}
              }
              .o100-trust-items{display:grid;gap:28px;grid-template-columns:1fr 1fr}
              @media (min-width:768px){
                .o100-trust-items{grid-template-columns:repeat(4,minmax(0,1fr));gap:24px}
              }
              .o100-trust-cell .o100-trust-icon{
                transition: background-color 200ms ease, transform 200ms ease;
              }
              .o100-trust-cell:hover .o100-trust-icon{
                background: color-mix(in oklab, var(--brand) 18%, transparent);
                transform: translateY(-1px);
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
                    lineHeight: 1.05,
                    letterSpacing: "-0.015em",
                    marginBottom: 18,
                  }}
                >
                  Профессионализм.
                  <br />
                  Качество. <em style={{ fontStyle: "italic", fontWeight: 400 }}>Забота.</em>
                </h2>
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: 15,
                    lineHeight: 1.55,
                    maxWidth: 380,
                  }}
                >
                  Мы открыли первую оптику в&nbsp;2014&nbsp;году. С&nbsp;тех пор подобрали
                  очки 47&nbsp;000+ человек.
                </p>
              </Reveal>

              {/* Right — 4 reasons */}
              <div className="o100-trust-items">
                {TRUST_REASONS.map(({ Icon, title, text }, i) => (
                  <Reveal key={title} delay={i * 90}>
                    <div className="o100-trust-cell flex flex-col">
                      <span
                        className="o100-trust-icon flex items-center justify-center rounded-full mb-5"
                        style={{
                          width: 52,
                          height: 52,
                          background: "color-mix(in oklab, var(--brand) 10%, transparent)",
                          color: "var(--brand)",
                        }}
                      >
                        <Icon size={22} strokeWidth={1.5} />
                      </span>
                      <div
                        className="font-serif text-foreground"
                        style={{
                          fontSize: 17,
                          marginBottom: 8,
                          lineHeight: 1.2,
                          letterSpacing: "-0.005em",
                          fontWeight: 500,
                        }}
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
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20" style={{ background: "var(--background)" }}>
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Left — child myopia */}
          <Reveal>
            <div
              className="relative rounded-2xl overflow-hidden h-full"
              style={{ minHeight: 380 }}
            >
              <img
                src="/main_bottom_child_banner.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(245,239,231,0.92) 0%, rgba(245,239,231,0.55) 40%, rgba(245,239,231,0) 70%)",
                }}
              />
              <div className="relative h-full flex flex-col justify-start p-8 lg:p-10" style={{ maxWidth: 420 }}>
                <div
                  className="text-[11px] uppercase tracking-[0.2em] mb-3"
                  style={{ color: "var(--brand)" }}
                >
                  Забота о зрении
                </div>
                <h3
                  className="font-serif text-foreground"
                  style={{ fontSize: 28, lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.01em" }}
                >
                  Контроль миопии<br />у детей и подростков
                </h3>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 24 }}
                >
                  Эффективные методики замедления прогрессирования близорукости и сохранения здоровья глаз.
                </p>
                <a
                  href={serviceHref("diagnostika")}
                  className="inline-flex items-center gap-1.5 rounded-full px-6 py-3 text-sm font-semibold text-white self-start hover:opacity-90 transition-opacity"
                  style={{ background: "var(--brand)" }}
                >
                  Узнать больше
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right — promotions block */}
          <Reveal delay={120}>
            <MainV2PromoBlock />
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. SERVICES — 4 photo cards
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20" style={{ background: "var(--background)" }}>
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
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20" style={{ background: "var(--background)" }}>
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
        <div className="grid md:grid-cols-2 gap-8">
          {recent.map((a, i) => (
            <Reveal key={a.slug} delay={i * 100}>
              <Link
                to="/blog/$category/$slug"
                params={{ category: a.categorySlug, slug: a.slug }}
                className="group block md:flex md:items-stretch md:gap-6 rounded-2xl overflow-hidden bg-cream"
              >
                <div className="md:w-2/5 shrink-0 aspect-[4/3] md:aspect-auto overflow-hidden">
                  <img
                    src={a.cover}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 p-5 md:p-6 flex flex-col">
                  <h3 className="font-serif text-xl group-hover:text-brand transition-colors">
                    {a.title}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-2">{a.category}</span>
                  <p className="text-sm text-muted-foreground mt-3 flex-1">{a.excerpt}</p>
                  <span
                    className="inline-flex items-center gap-1 mt-4 text-sm font-medium"
                    style={{ color: "var(--brand)" }}
                  >
                    Читать статью <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. BOTTOM CTA STRIP — appointment / contact / newsletter
         ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--cream)", padding: "clamp(40px, 6vw, 72px) 0" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-5">
            {/* 1. Appointment */}
            <div
              className="rounded-2xl bg-background p-6 flex items-start justify-between gap-4"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -16px rgba(0,0,0,0.08)" }}
            >
              <div className="flex-1">
                <div className="font-serif text-lg" style={{ lineHeight: 1.2, marginBottom: 8 }}>
                  Запишитесь на проверку зрения
                </div>
                <p className="text-sm text-muted-foreground" style={{ marginBottom: 18 }}>
                  Выберите удобное время и приходите в ближайший салон.
                </p>
                <button
                  type="button"
                  onClick={() => setAptOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ background: "var(--brand)" }}
                >
                  Записаться
                </button>
              </div>
              <span
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  background: "color-mix(in oklab, var(--brand) 10%, transparent)",
                  color: "var(--brand)",
                }}
              >
                <Calendar size={24} strokeWidth={1.5} />
              </span>
            </div>

            {/* 2. Contact */}
            <div
              className="rounded-2xl bg-background p-6 flex flex-col"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -16px rgba(0,0,0,0.08)" }}
            >
              <div className="font-serif text-lg" style={{ lineHeight: 1.2, marginBottom: 8 }}>
                Свяжитесь с нами
              </div>
              <a
                href="tel:+78121000000"
                className="text-lg font-semibold text-foreground hover:text-brand transition-colors"
              >
                +7 (812) 100-00-00
              </a>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Ежедневно с 10:00 до 21:00</p>
              <div className="flex items-center gap-2 mt-auto">
                {[
                  { name: "WhatsApp", href: "https://wa.me/78121000000" },
                  { name: "Telegram", href: "https://t.me/optika100" },
                  { name: "Viber", href: "viber://chat?number=78121000000" },
                ].map((m) => (
                  <a
                    key={m.name}
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium border border-border px-3 py-1.5 hover:border-brand hover:text-brand transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    {m.name}
                  </a>
                ))}
              </div>
            </div>

            {/* 3. Newsletter */}
            <div
              className="rounded-2xl bg-background p-6 flex flex-col"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -16px rgba(0,0,0,0.08)" }}
            >
              <div className="font-serif text-lg" style={{ lineHeight: 1.2, marginBottom: 8 }}>
                Будьте в курсе
              </div>
              <p className="text-sm text-muted-foreground" style={{ marginBottom: 18 }}>
                Подпишитесь на новости и акции — раз в месяц, без спама.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center gap-2 mt-auto rounded-full border border-border pl-4 pr-1.5 py-1.5"
              >
                <input
                  type="email"
                  placeholder="Ваш e-mail"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="flex items-center justify-center rounded-full text-white hover:opacity-90 transition-opacity cursor-pointer"
                  style={{ width: 36, height: 36, background: "var(--brand)" }}
                  aria-label="Подписаться"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
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
 *   – "Примерить" overlay action in the top-right of the photo.
 *   – Heart icon (favorite) is always visible top-left, red outline.
 *   – Simpler price + color-dots row, no brand caption.
 *   – White card with rounded corners that sit on the cream background.
 */
function MainV2ProductCard({ product }: { product: Product }) {
  const { toggleSaved, saved } = useCart();
  const navigate = useNavigate();
  const isSaved = saved.includes(product.slug);
  const hasHoverImage = product.images.length > 1;
  const dots = product.colors?.slice(0, 4) ?? [];
  const extra = (product.colors?.length ?? 0) - dots.length;
  const productRouteParams = {
    category: categoryToSegment[product.category],
    slug: product.slug,
  };

  // Compose display name: prefer brand prefix when set (e.g. "Ray-Ban RX 7159"),
  // else fall back to product.name alone.
  const displayName =
    product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase())
      ? `${product.brand} ${product.name}`
      : product.name;

  return (
    <div
      className="group/card flex flex-col h-full overflow-hidden"
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -16px rgba(0,0,0,0.08)",
      }}
    >
      <div className="relative block aspect-square">
        <Link
          to="/catalog_s/$category/$slug"
          params={productRouteParams}
          className="relative block h-full w-full"
          aria-label={displayName}
        >
          <img
            src={product.images[0]}
            alt={displayName}
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-contain p-7 transition-opacity duration-500 ${
              hasHoverImage ? "opacity-100 group-hover/card:opacity-0" : "opacity-100"
            }`}
          />
          {hasHoverImage && (
            <img
              src={product.images[1]}
              alt={displayName}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-7 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
            />
          )}
        </Link>
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/catalog_s/$category/$slug",
              params: productRouteParams,
            })
          }
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:text-brand active:translate-y-0 active:scale-[0.98]"
          style={{
            borderColor: "color-mix(in oklch, var(--foreground) 14%, transparent)",
            background: "color-mix(in oklch, white 92%, transparent)",
            color: "var(--foreground)",
          }}
          aria-label="Примерить"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M2.402 2.652a.25.25 0 0 0-.25.25v2a.75.75 0 1 1-1.5 0v-2c0-.966.784-1.75 1.75-1.75h2a.75.75 0 1 1 0 1.5h-2Zm11.146.25a.25.25 0 0 0-.25-.25h-2a.75.75 0 0 1 0-1.5h2c.967 0 1.75.784 1.75 1.75v2a.75.75 0 0 1-1.5 0v-2ZM2.402 14.048a.25.25 0 0 1-.25-.25v-2a.75.75 0 1 0-1.5 0v2c0 .966.784 1.75 1.75 1.75h2a.75.75 0 0 0 0-1.5h-2Zm10.896 0a.25.25 0 0 0 .25-.25v-2a.75.75 0 0 1 1.5 0v2a1.75 1.75 0 0 1-1.75 1.75h-2a.75.75 0 0 1 0-1.5h2ZM8 7.25a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm-3.75 4.5a3.75 3.75 0 1 1 7.5 0h-1.5a2.25 2.25 0 1 0-4.5 0h-1.5Z"
              fill="currentColor"
            />
          </svg>
          <span>Примерить</span>
        </button>
        <button
          type="button"
          onClick={() => toggleSaved(product.slug)}
          className="absolute top-3 left-3 z-10 flex items-center justify-center rounded-full transition-colors"
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
      </div>

      <div
        className="flex flex-col gap-2"
        style={{ padding: "18px 20px 22px" }}
      >
        <Link
          to="/catalog_s/$category/$slug"
          params={productRouteParams}
          className="text-sm text-foreground hover:text-brand transition-colors"
          style={{ lineHeight: 1.3 }}
        >
          {displayName}
        </Link>
        <div
          className="text-foreground"
          style={{ fontSize: 15, fontWeight: 600 }}
        >
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
    "flex items-center justify-center rounded-full bg-background transition-colors hover:bg-foreground hover:text-background";
  const navBtnStyle = {
    width: 40,
    height: 40,
    border: "1px solid var(--border)",
    color: "var(--foreground)",
  } as const;

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
              style={navBtnStyle}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Вперёд"
              className={navBtn}
              style={navBtnStyle}
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

/**
 * Promotions block on the main-v2 page.
 * One large brand-red feature card on the left, two compact cards stacked on the right.
 * Pulls copy from the existing `promotions` array.
 */
function MainV2PromoBlock() {
  const compact = promotions.slice(1, 3);
  return (
    <div className="h-full flex flex-col" style={{ minHeight: 380 }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.2em] mb-2"
            style={{ color: "var(--brand)" }}
          >
            Акции и предложения
          </div>
          <h3
            className="font-serif text-foreground"
            style={{ fontSize: 26, lineHeight: 1.15, letterSpacing: "-0.01em" }}
          >
            Выгодные предложения
          </h3>
        </div>
        <Link
          to="/uslugi"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium shrink-0"
          style={{ color: "var(--brand)" }}
        >
          Смотреть все <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 flex-1">
        {/* Feature card */}
        <a
          href="/uslugi"
          className="sm:col-span-3 relative rounded-2xl overflow-hidden p-7 flex flex-col justify-between text-white hover:opacity-95 transition-opacity"
          style={{
            background:
              "linear-gradient(140deg, var(--brand) 0%, color-mix(in oklab, var(--brand) 78%, black) 100%)",
            minHeight: 240,
          }}
        >
          <div>
            <h4
              className="font-serif"
              style={{ fontSize: 28, lineHeight: 1.15, letterSpacing: "-0.01em", marginBottom: 10 }}
            >
              Вторая пара очков
              <br />
              <span style={{ fontSize: 56, lineHeight: 1 }}>−50%</span>
            </h4>
            <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.92 }}>
              Подберите любые две пары очков и получите скидку 50% на вторую.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold self-start"
            style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)" }}
          >
            Подробнее <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </a>

        {/* Stacked compact cards */}
        <div className="sm:col-span-2 grid grid-rows-2 gap-3">
          {compact.map((p) => (
            <a
              key={p.id}
              href="/uslugi"
              className="relative rounded-2xl overflow-hidden bg-cream p-4 pr-3 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex-1 min-w-0">
                <div
                  className="font-serif"
                  style={{ fontSize: 14.5, lineHeight: 1.2, color: "var(--foreground)" }}
                >
                  {p.title}
                </div>
                <span
                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium"
                  style={{ color: "var(--brand)" }}
                >
                  Подробнее <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              {p.image ? (
                <img
                  src={p.image}
                  alt=""
                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                />
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
