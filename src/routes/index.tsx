import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
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
import { bestsellers, products } from "@/data/products";
import { articles } from "@/data/articles";
import { serviceHref } from "@/data/services";
import { Calendar, Users, Award, Phone, Send } from "lucide-react";
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

const SERVICE_STRIP_ITEMS = [
  {
    eyebrow: "01 — ДИАГНОСТИКА",
    title: "Проверка зрения",
    text: "Современная диагностика за 30 минут",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    eyebrow: "02 — ПОДБОР",
    title: "Подбор очков",
    text: "Индивидуальный подбор оправ и линз",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    eyebrow: "03 — ЗАБОТА",
    title: "Контроль миопии",
    text: "Программы для детей и подростков",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    eyebrow: "04 — СЕРВИС",
    title: "Ремонт очков",
    text: "Быстрый и качественный ремонт",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    eyebrow: "05 — ЛИНЗЫ",
    title: "Контактные линзы",
    text: "Подбор и подписка с доставкой",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <circle
          cx="12"
          cy="12"
          r="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M12 9.5a2.5 2.5 0 00-2.5 2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

const CONTACT_LENS_HOMEPAGE_SLUGS = [
  "acuvue-oasys-1day",
  "biofinity",
  "misight-1day-90",
  "air-optix-toric",
] as const;

const CONTACT_LENS_HOMEPAGE_PRODUCTS = CONTACT_LENS_HOMEPAGE_SLUGS.map((slug) =>
  products.find((product) => product.slug === slug),
).filter((product): product is Product => Boolean(product));

const SUBSCRIPTION_POINTS = [
  "Оформите один раз — пополнение приходит автоматически",
  "Подписка всегда дешевле обычной цены",
  "Количество и интервал — под ваш ритм",
  "Бесплатная доставка на дом",
  "Можно отменить или поставить на паузу в любой момент",
] as const;

const LENS_PROMO_PILL_BY_SLUG: Record<string, string> = {
  "acuvue-oasys-1day": "для сухих глаз",
  biofinity: "комфорт 14ч",
  "misight-1day-90": "контроль миопии",
  "air-optix-toric": "для астигматизма",
};

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
    title: "Детские оправы",
    subtitle: "Для заботы о будущем",
    image: "/new_categories_3.png",
    href: catalogHref("opravy"),
    titlePos: "bottom" as const,
  },
];

function MainV2Page() {
  const hits = bestsellers();
  const recent = articles.slice(0, 2);
  const contactLensProducts = CONTACT_LENS_HOMEPAGE_PRODUCTS;
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
            animation:
              "_heroImgPulseV2 6s ease-in-out infinite, _bannerFadeA 14s ease-in-out infinite",
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
            animation:
              "_heroImgPulseV2 6s ease-in-out infinite, _bannerFadeB 14s ease-in-out infinite",
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
            padding: "clamp(48px, 8vw, 96px) clamp(24px, 5vw, 64px)",
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
                на <span style={{ color: "var(--brand)" }}>100%</span>
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
                Современные очки, профессиональный подбор и&nbsp;забота о&nbsp;вашем зрении.
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
                className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
                style={{ maxWidth: 680 }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Users size={16} strokeWidth={1.75} />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <strong className="font-serif text-[18px] leading-[1.1] text-foreground">
                      11 000+
                    </strong>
                    <span className="mt-0.5 text-[12px] leading-[1.35] text-muted-foreground">
                      довольных клиентов
                    </span>
                  </div>
                </div>

                <Link
                  to="/tinkoff"
                  aria-label="Рассрочка 0‑0‑3 от Т‑Банка, без переплат"
                  className="group flex items-start gap-2.5 text-inherit no-underline transition-transform duration-200 hover:-translate-y-px"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand/10 text-brand transition-colors duration-200 group-hover:bg-brand/15">
                    <img src="/t_icon_red.png" alt="" loading="lazy" className="h-5 w-4 object-contain" />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <strong className="border-b border-dashed border-transparent font-serif text-[18px] leading-[1.1] text-foreground transition-colors group-hover:border-brand/40">
                      0‑0‑3
                    </strong>
                    <span className="mt-0.5 text-[12px] leading-[1.35] text-muted-foreground">
                      рассрочка от Т‑Банка
                    </span>
                  </div>
                </Link>

                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Award size={16} strokeWidth={1.75} />
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <strong className="font-serif text-[18px] leading-[1.1] text-foreground">
                      20+ лет
                    </strong>
                    <span className="mt-0.5 text-[12px] leading-[1.35] text-muted-foreground">
                      заботы о вашем зрении
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H15" />
                      <circle cx="17" cy="18" r="2" />
                      <circle cx="7" cy="18" r="2" />
                    </svg>
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <strong className="font-serif text-[18px] leading-[1.1] text-foreground">
                      Доставка
                    </strong>
                    <span className="mt-0.5 text-[12px] leading-[1.35] text-muted-foreground">
                      по всей России
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          1b. SERVICE STRIP — separate white section, 5 icon cards
         ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full" style={{ background: "var(--background)" }}>
        <style>{`
          .o100-service-strip-grid{
            display:grid;
            grid-template-columns:1fr;
            gap:24px;
          }
          @media (min-width:768px){
            .o100-service-strip-grid{
              grid-template-columns:repeat(2, minmax(0, 1fr));
              gap:32px 24px;
            }
          }
          @media (min-width:1024px){
            .o100-service-strip-grid{
              grid-template-columns:repeat(5, minmax(0, 1fr));
              gap:0;
            }
          }
          .o100-service-strip-cell{
            display:flex;
            align-items:flex-start;
            gap:16px;
            min-width:0;
          }
          @media (min-width:1024px){
            .o100-service-strip-cell{
              padding:0 24px;
              border-left:1px solid color-mix(in oklab, var(--foreground) 10%, transparent);
            }
            .o100-service-strip-cell:first-child{
              padding-left:0;
              border-left:0;
            }
          }
          .o100-service-strip-icon{
            width:48px;
            height:48px;
            border-radius:999px;
            flex-shrink:0;
            display:flex;
            align-items:center;
            justify-content:center;
            background:color-mix(in oklab, var(--cream) 92%, white);
            color:var(--brand);
            transition:background-color 260ms ease, color 260ms ease, transform 260ms ease;
          }
          .o100-service-strip-cell:hover .o100-service-strip-icon{
            background:var(--brand);
            color:#fff;
            transform:translateY(-1px);
          }
          .o100-service-strip-eyebrow{
            margin-bottom:4px;
            font-size:10px;
            font-weight:700;
            letter-spacing:0.16em;
            text-transform:uppercase;
            color:color-mix(in oklab, var(--foreground) 42%, white);
          }
        `}</style>
        <div
          className="mx-auto"
          style={{
            maxWidth: "min(1536px, 96vw)",
            padding: "clamp(28px, 4vw, 48px) clamp(20px, 3.5vw, 56px)",
          }}
        >
          <Reveal>
            <div className="o100-service-strip-grid">
              {SERVICE_STRIP_ITEMS.map(({ eyebrow, title, text, icon }) => (
                <div key={title} className="o100-service-strip-cell">
                  <div className="o100-service-strip-icon">{icon}</div>
                  <div>
                    <div className="o100-service-strip-eyebrow">{eyebrow}</div>
                    <h3
                      className="text-foreground"
                      style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}
                    >
                      {title}
                    </h3>
                    <p
                      className="text-muted-foreground"
                      style={{ fontSize: 12.5, lineHeight: 1.5 }}
                    >
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. CATEGORIES — Подберите свои идеальные очки (1:1 with screenshot)
         ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--cream)", padding: "clamp(56px, 7vw, 96px) 0" }}>
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
            .o100-cat-btn{transition:background-color 0.25s,color 0.25s,border-color 0.25s}
            .o100-cat-tile:hover .o100-cat-btn{background:white!important;color:var(--foreground)!important;border-color:white!important}
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
          6b. BUY TOGETHER & SAVE — full-bleed banner, family promo
         ───────────────────────────────────────────────────────────── */}
      <MainV2BuyTogetherBanner />

      {/* ─────────────────────────────────────────────────────────────
          3. POPULAR MODELS — Хиты продаж (cream bg, header w/ nav arrows)
         ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--cream)", padding: "clamp(56px, 7vw, 96px) 0" }}>
        <style>{`
          .o100-fav-btn{transition:transform 0.2s,background-color 0.2s}
          .o100-fav-btn:hover{transform:scale(1.18);background:rgba(200,59,59,0.12)!important}
          .o100-color-dot{transition:transform 0.18s;cursor:pointer}
          .o100-color-dot:hover{transform:scale(1.35)}
          .o100-nav-btn{transition:background-color 0.2s,color 0.2s,border-color 0.2s}
          .o100-nav-btn:hover{background:var(--brand)!important;color:#fff!important;border-color:var(--brand)!important}
          .o100-podrobnee:hover{color:var(--foreground)!important}
          .group:hover .o100-podrobnee{color:var(--foreground)!important}
        `}</style>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <MainV2HitsCarousel products={hits} />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. WHY TRUST US — Почему нам доверяют (2-col: heading | 4 reasons)
         ───────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--cream)", padding: "clamp(56px, 7vw, 96px) 0" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:gap-14" style={{ gridTemplateColumns: "1fr" }}>
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
                  открыли первую оптику в&nbsp;2006&nbsp;году
                  <br />
                  подобрали 100&nbsp;000+ человек
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
          6. SERVICES — 4 photo cards
         ───────────────────────────────────────────────────────────── */}
      <section
        id="services"
        className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20"
        style={{ background: "var(--background)" }}
      >
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
                  <div className="o100-podrobnee mt-3 text-sm text-muted-foreground inline-flex items-center gap-1 transition-colors">
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
          6a. CONTACT LENS CAROUSEL — real products from catalog data
         ───────────────────────────────────────────────────────────── */}
      {contactLensProducts.length > 0 && (
        <section style={{ background: "var(--cream)", padding: "clamp(56px, 7vw, 96px) 0" }}>
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <MainV2ContactLensCarousel products={contactLensProducts} />
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. SUBSCRIPTION — Подписка на линзы и средства ухода
         ───────────────────────────────────────────────────────────── */}
      <MainV2SubscriptionBlock />

      {/* ─────────────────────────────────────────────────────────────
          6c. PAIRED BANNERS — child myopia + virtual try-on promo
         ───────────────────────────────────────────────────────────── */}
      <section
        className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20"
        style={{ background: "var(--background)" }}
      >
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Left — child myopia */}
          <Reveal>
            <div
              className="group relative rounded-2xl overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ minHeight: 380 }}
            >
              <img
                src="/main_bottom_child_banner.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(245,239,231,0.92) 0%, rgba(245,239,231,0.55) 40%, rgba(245,239,231,0) 70%)",
                }}
              />
              <div
                className="relative h-full flex flex-col justify-start p-8 lg:p-10"
                style={{ maxWidth: 420 }}
              >
                <div
                  className="text-[11px] uppercase tracking-[0.2em] mb-3"
                  style={{ color: "var(--brand)" }}
                >
                  Забота о зрении
                </div>
                <h3
                  className="font-serif text-foreground"
                  style={{
                    fontSize: 28,
                    lineHeight: 1.15,
                    marginBottom: 14,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Контроль миопии
                  <br />у детей и подростков
                </h3>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: 14, lineHeight: 1.55, marginBottom: 24 }}
                >
                  Эффективные методики замедления прогрессирования близорукости и сохранения
                  здоровья глаз.
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
          7. SALONS — Приходите к нам
         ───────────────────────────────────────────────────────────── */}
      <SalonsSection />

      {/* ─────────────────────────────────────────────────────────────
          8. JOURNAL — Полезные статьи
         ───────────────────────────────────────────────────────────── */}
      <section
        className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-20"
        style={{ background: "var(--background)" }}
      >
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

function MainV2BuyTogetherBanner() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "var(--cream)", minHeight: "clamp(440px, 56vw, 620px)" }}
    >
      <style>{`
        @keyframes _btsImgPulse {
          0%, 100% { filter: brightness(0.96) contrast(1.00) saturate(1.00); transform: scale(1.00); }
          50%      { filter: brightness(1.06) contrast(1.03) saturate(1.04); transform: scale(1.012); }
        }
        @keyframes _btsLight {
          0%, 100% { opacity: 1.00; background-position:   0% 50%; }
          50%      { opacity: 0.92; background-position: 100% 50%; }
        }
        @keyframes _btsSheen {
          0%   { transform: translateX(-60%) skewX(-14deg); opacity: 0; }
          15%  { opacity: 0.35; }
          55%  { opacity: 0.35; }
          100% { transform: translateX(260%) skewX(-14deg); opacity: 0; }
        }
        @keyframes _btsSun {
          0%, 100% { opacity: 0.45; transform: translate(0,0) scale(1.00); }
          50%      { opacity: 0.70; transform: translate(-12px, 10px) scale(1.06); }
        }
        .o100-bts-img{
          animation:_btsImgPulse 6s ease-in-out infinite;
          will-change:filter, transform;
        }
        .o100-bts-wash{
          background:linear-gradient(
            90deg,
            rgba(246, 240, 233, 0.90) 0%,
            rgba(246, 240, 233, 0.74) 28%,
            rgba(246, 240, 233, 0.36) 52%,
            rgba(246, 240, 233, 0.00) 74%
          );
          background-size:220% 100%;
          animation:_btsLight 8s ease-in-out infinite;
        }
        @media (max-width:767px){
          .o100-bts-wash{
            background:linear-gradient(
              180deg,
              rgba(246, 240, 233, 0.86) 0%,
              rgba(246, 240, 233, 0.66) 38%,
              rgba(246, 240, 233, 0.26) 72%,
              rgba(246, 240, 233, 0.08) 100%
            );
          }
        }
        .o100-bts-sun{
          position:absolute;
          z-index:1;
          top:6%;
          right:6%;
          width:460px;
          height:460px;
          border-radius:50%;
          background:radial-gradient(circle, rgba(255,225,170,0.90) 0%, rgba(255,195,130,0.52) 35%, rgba(255,170,110,0) 72%);
          mix-blend-mode:screen;
          filter:blur(48px);
          pointer-events:none;
          animation:_btsSun 7s ease-in-out infinite;
        }
        .o100-bts-sheen{
          position:absolute;
          top:0;
          bottom:0;
          left:20%;
          width:45%;
          z-index:3;
          background:linear-gradient(100deg, transparent 0%, rgba(255,240,210,0) 20%, rgba(255,240,210,0.55) 50%, rgba(255,240,210,0) 80%, transparent 100%);
          pointer-events:none;
          animation:_btsSheen 9s ease-in-out infinite;
        }
        .o100-bts-btn{
          display:inline-flex;
          align-items:center;
          gap:8px;
          border-radius:999px;
          padding:14px 26px;
          font-family:var(--font-sans);
          font-size:14px;
          font-weight:600;
          transition:transform 200ms ease, opacity 200ms ease, background-color 200ms ease, color 200ms ease, border-color 200ms ease;
          border:1px solid transparent;
        }
        .o100-bts-btn:hover{
          transform:translateY(-1px);
        }
        .o100-bts-btn-primary{
          background:var(--brand)!important;
          color:#fff!important;
        }
        .o100-bts-btn-primary:hover{
          opacity:0.9;
        }
        .o100-bts-btn-secondary{
          background:transparent!important;
          color:var(--foreground)!important;
          border-color:var(--foreground)!important;
        }
        .o100-bts-btn-secondary:hover{
          background:var(--foreground)!important;
          color:var(--background)!important;
        }
        .o100-bts-quiz-link{
          border-bottom:1px solid transparent;
          transition:border-color 200ms ease;
        }
        .o100-bts-quiz-link:hover{
          border-bottom-color:var(--brand);
        }
      `}</style>
      <div
        aria-hidden
        className="o100-bts-img absolute inset-0"
        style={{
          backgroundImage: "url(/main_banner_v2.png)",
          backgroundPosition: "right center",
          backgroundSize: "cover",
          zIndex: 0,
        }}
      />
      <div aria-hidden className="o100-bts-sun" />
      <div aria-hidden className="o100-bts-wash absolute inset-0" style={{ zIndex: 2 }} />
      <div aria-hidden className="o100-bts-sheen" />
      <div
        className="relative mx-auto max-w-7xl px-4 lg:px-8"
        style={{
          zIndex: 4,
          paddingTop: "clamp(72px, 9vw, 108px)",
          paddingBottom: "clamp(72px, 9vw, 112px)",
        }}
      >
        <Reveal>
          <div style={{ maxWidth: 520 }}>
            <div
              className="text-[11px] uppercase tracking-[0.22em] mb-3"
              style={{ color: "var(--brand)", fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Семейная выгода
            </div>
            <h2
              className="font-serif text-foreground"
              style={{
                fontSize: "clamp(36px, 4.4vw, 56px)",
                lineHeight: 1.04,
                letterSpacing: "-0.02em",
                marginBottom: 18,
                fontWeight: 500,
              }}
            >
              Покупайте вместе{" "}
              <em
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "var(--brand)",
                }}
              >
                и&nbsp;экономьте
              </em>
            </h2>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 17,
                lineHeight: 1.55,
                maxWidth: 440,
                marginBottom: 22,
              }}
            >
              Купите одну пару — и&nbsp;получите −20% на&nbsp;каждую следующую. Включая детские
              оправы и&nbsp;солнцезащитные очки.
            </p>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                letterSpacing: "0.02em",
                marginBottom: 28,
              }}
            >
              Действуют ограничения. Подробности у&nbsp;консультанта в&nbsp;салоне.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a href={catalogHref("opravy")} className="o100-bts-btn o100-bts-btn-primary">
                Купить очки
              </a>
              <a
                href={catalogHref("solntsezashchitnye")}
                className="o100-bts-btn o100-bts-btn-secondary"
              >
                Солнцезащитные
              </a>
            </div>
            <div
              className="flex flex-wrap items-center gap-2"
              style={{
                marginTop: 22,
                fontFamily: "var(--font-sans)",
                fontSize: 13.5,
                color: "var(--foreground)",
              }}
            >
              <span>Не знаете, с&nbsp;чего начать?</span>
              <a
                href={serviceHref("podbor-ochkov")}
                className="o100-bts-quiz-link"
                style={{ color: "var(--brand)", fontWeight: 600 }}
              >
                Пройдите подбор за&nbsp;2&nbsp;минуты <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
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
        boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -16px rgba(0,0,0,0.08)",
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
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-brand active:translate-y-0 active:scale-[0.98]"
          style={{
            borderColor: "color-mix(in oklch, var(--foreground) 14%, transparent)",
            background: "color-mix(in oklch, white 92%, transparent)",
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
          className="o100-fav-btn absolute top-3 left-3 z-10 flex items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            background: "transparent",
            color: "var(--brand)",
          }}
          aria-label="В избранное"
        >
          <Heart className="h-5 w-5" strokeWidth={1.75} fill={isSaved ? "var(--brand)" : "none"} />
        </button>
      </div>

      <div className="flex flex-col gap-2" style={{ padding: "18px 20px 22px" }}>
        <Link
          to="/catalog_s/$category/$slug"
          params={productRouteParams}
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
                className="o100-color-dot inline-block rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  background: c.hex,
                  border: "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)",
                }}
                title={c.name}
              />
            ))}
            {extra > 0 && (
              <span className="text-muted-foreground" style={{ fontSize: 11, marginLeft: 2 }}>
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
  const navBtn = "o100-nav-btn flex items-center justify-center rounded-full bg-background";
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

function MainV2ContactLensCarousel({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div>
      <style>{`
        .o100-lens-nav-btn{
          transition:background-color 200ms ease, color 200ms ease, border-color 200ms ease;
        }
        .o100-lens-nav-btn:hover{
          background:var(--brand)!important;
          color:#fff!important;
          border-color:var(--brand)!important;
        }
        .o100-lens-fav-btn{
          transition:transform 200ms ease, background-color 200ms ease;
        }
        .o100-lens-fav-btn:hover{
          transform:scale(1.14);
          background:rgba(255,255,255,0.95)!important;
        }
        .o100-lens-all-link{
          border-bottom:1px solid transparent;
          transition:border-color 200ms ease;
        }
        .o100-lens-all-link:hover{
          border-bottom-color:var(--brand);
        }
        .o100-lens-card-shell{
          transition:transform 220ms ease, box-shadow 220ms ease;
        }
        .o100-lens-card-shell:hover{
          transform:translateY(-2px);
          box-shadow:0 4px 10px rgba(0,0,0,0.06), 0 18px 40px rgba(0,0,0,0.09)!important;
        }
      `}</style>
      <Reveal className="flex items-end justify-between gap-4 mb-8 lg:mb-10">
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.22em] mb-3"
            style={{ color: "var(--brand)" }}
          >
            Акция · сентябрь
          </div>
          <h2
            className="font-serif text-foreground"
            style={{
              fontSize: "clamp(28px, 3.4vw, 42px)",
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            <span
              style={{
                color: "var(--brand)",
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              −10%
            </span>{" "}
            на&nbsp;контактные линзы
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={catalogHref("kontaktnye-linzy")}
            className="o100-lens-all-link hidden sm:inline-flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "var(--brand)" }}
          >
            Все линзы <ArrowRight className="h-4 w-4" />
          </a>
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Назад"
              className="o100-lens-nav-btn flex items-center justify-center rounded-full bg-background"
              style={{
                width: 40,
                height: 40,
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Вперед"
              className="o100-lens-nav-btn flex items-center justify-center rounded-full bg-background"
              style={{
                width: 40,
                height: 40,
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-8 -mb-6 -mx-4 px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.slug}
              className="snap-start shrink-0 w-[72%] first:ml-2 last:mr-2 sm:w-[44%] md:w-[31%] lg:w-[23.5%] lg:first:ml-6 lg:last:mr-6"
            >
              <MainV2ContactLensCard product={product} />
            </div>
          ))}
        </div>
      </Reveal>
      <div className="mt-6 sm:hidden">
        <a
          href={catalogHref("kontaktnye-linzy")}
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: "var(--brand)" }}
        >
          Все линзы <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function MainV2ContactLensCard({ product }: { product: Product }) {
  const { toggleSaved, saved } = useCart();
  const isSaved = saved.includes(product.slug);
  const productRouteParams = {
    category: categoryToSegment[product.category],
    slug: product.slug,
  };
  const packSize = product.specs.find((spec) => spec.label === "Упаковка")?.value;
  const lensMeta = [product.wearMode, packSize].filter(Boolean).join(" · ");
  const isGeneratedPlaceholder = product.images[0]?.includes("picsum.photos");
  const displayName =
    product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase())
      ? `${product.brand} ${product.name}`
      : product.name;
  const fallbackPill =
    product.lensType === "Для контроля миопии"
      ? "Контроль миопии"
      : product.lensType === "Торические"
        ? "Для астигматизма"
        : (product.wearMode ?? "Контактные линзы");
  const pillLabel = LENS_PROMO_PILL_BY_SLUG[product.slug] ?? fallbackPill;
  const strike = product.oldPrice ?? product.price;
  const discounted = Math.round(strike * 0.9);

  return (
    <div
      className="o100-lens-card-shell group/card flex h-full flex-col overflow-hidden"
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.02), 0 8px 24px -16px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="relative aspect-square overflow-hidden"
        style={{
          background: "#fff",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link
          to="/catalog_s/$category/$slug"
          params={productRouteParams}
          className="absolute inset-0 block"
          aria-label={displayName}
        >
          {isGeneratedPlaceholder ? (
            <div className="flex h-full w-full items-center justify-center p-6">
              <div
                className="flex h-full w-full max-h-[220px] max-w-[220px] flex-col justify-between rounded-[14px] border p-4"
                style={{
                  borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)",
                  background:
                    "repeating-linear-gradient(135deg, oklch(0.96 0.006 80) 0 6px, oklch(0.985 0.004 80) 6px 12px)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--brand)",
                    fontWeight: 700,
                  }}
                >
                  {product.wearMode ?? "Контактные линзы"}
                </div>
                <div>
                  <div
                    className="font-serif text-foreground"
                    style={{ fontSize: 22, lineHeight: 1.05, marginBottom: 6 }}
                  >
                    {product.brand}
                  </div>
                  <div
                    className="text-muted-foreground"
                    style={{ fontSize: 12.5, lineHeight: 1.45 }}
                  >
                    {packSize ?? "Подбор контактных линз"}
                  </div>
                </div>
                <div
                  style={{
                    height: 8,
                    width: "100%",
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg, color-mix(in oklab, var(--brand) 16%, white), color-mix(in oklab, var(--brand) 36%, white))",
                  }}
                />
              </div>
            </div>
          ) : (
            <img
              src={product.images[0]}
              alt={displayName}
              loading="lazy"
              className="h-full w-full object-contain p-7 transition-transform duration-500 group-hover/card:scale-[1.03]"
            />
          )}
        </Link>
        <span
          className="absolute left-3 top-3 inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-medium"
          style={{
            background: "rgba(255,255,255,0.92)",
            borderColor: "color-mix(in oklab, var(--foreground) 8%, transparent)",
            color: "var(--foreground)",
            backdropFilter: "blur(4px)",
          }}
        >
          {pillLabel}
        </span>
        <button
          type="button"
          onClick={() => toggleSaved(product.slug)}
          className="o100-lens-fav-btn absolute right-3 top-3 z-10 flex items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            background: "rgba(255,255,255,0.8)",
            color: "var(--brand)",
          }}
          aria-label="В избранное"
        >
          <Heart className="h-5 w-5" strokeWidth={1.75} fill={isSaved ? "var(--brand)" : "none"} />
        </button>
      </div>

      <div className="flex flex-col gap-2" style={{ padding: "18px 20px 22px" }}>
        <Link
          to="/catalog_s/$category/$slug"
          params={productRouteParams}
          className="font-serif text-foreground transition-colors hover:text-brand"
          style={{ fontSize: 18, lineHeight: 1.25 }}
        >
          {displayName}
        </Link>
        <div className="text-muted-foreground" style={{ fontSize: 12.5, lineHeight: 1.45 }}>
          {lensMeta || "Контактные линзы"}
        </div>
        <div className="flex items-baseline gap-2.5" style={{ marginTop: 8 }}>
          <span className="text-foreground" style={{ fontSize: 18, fontWeight: 600 }}>
            {formatPrice(discounted)}
          </span>
          <span
            className="text-muted-foreground"
            style={{ fontSize: 13, textDecoration: "line-through" }}
          >
            {formatPrice(strike)}
          </span>
        </div>
        <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
          <span
            style={{
              background: "var(--brand)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 9px",
              borderRadius: 4,
              letterSpacing: "0.04em",
            }}
          >
            −10%
          </span>
          <span
            style={{
              color: "var(--brand)",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 9px",
              border: "1px solid var(--brand)",
              borderRadius: 4,
              letterSpacing: "0.04em",
            }}
          >
            Sale
          </span>
        </div>
      </div>
    </div>
  );
}

function MainV2SubscriptionBlock() {
  return (
    <section style={{ background: "var(--background)", padding: "clamp(56px, 7vw, 96px) 0" }}>
      <style>{`
        .o100-sub-grid{
          display:grid;
          grid-template-columns:1fr;
          gap:28px;
          align-items:stretch;
        }
        @media (min-width:1024px){
          .o100-sub-grid{
            grid-template-columns:1.05fr 1fr;
            gap:48px;
          }
        }
        .o100-sub-grid > *{
          display:flex;
          min-height:0;
        }
        .o100-sub-grid > * > *{
          flex:1 1 auto;
          width:100%;
        }
        .o100-sub-photo{
          position:relative;
          overflow:hidden;
          border-radius:20px;
          min-height:460px;
          background:var(--cream);
        }
        .o100-sub-photo img{
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
          transition:transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .o100-sub-photo:hover img{
          transform:scale(1.03);
        }
        .o100-sub-copy{
          display:flex;
          flex-direction:column;
          justify-content:center;
          padding:12px 0;
          font-family:var(--font-sans);
        }
        .o100-sub-btn{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          min-height:48px;
          padding:0 26px;
          border-radius:999px;
          font-family:var(--font-sans);
          font-size:14px;
          font-weight:600;
          transition:transform 200ms ease, opacity 200ms ease, background-color 200ms ease, color 200ms ease, border-color 200ms ease;
          border:1px solid transparent;
        }
        .o100-sub-btn:hover{
          transform:translateY(-1px);
        }
        .o100-sub-btn-primary{
          background:var(--brand)!important;
          color:#fff!important;
        }
        .o100-sub-btn-primary:hover{
          opacity:0.9;
        }
        .o100-sub-btn-secondary{
          background:transparent!important;
          color:var(--foreground)!important;
          border-color:var(--foreground)!important;
        }
        .o100-sub-btn-secondary:hover{
          background:var(--foreground)!important;
          color:var(--background)!important;
        }
        .o100-sub-saveline{
          font-family:var(--font-serif);
          font-size:22px;
          line-height:1.2;
          color:var(--brand);
          font-style:italic;
          font-weight:500;
          margin-bottom:22px;
        }
        .o100-sub-savings{
          transition:border-color 200ms ease, background-color 200ms ease;
        }
        .o100-sub-savings:hover{
          border-color:var(--brand);
        }
      `}</style>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="o100-sub-grid">
          <Reveal>
            <div className="o100-sub-photo">
              <img src="/category_cont_lenses_v3.png" alt="" />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, rgba(0,0,0,0.02) 24%, rgba(0,0,0,0.6) 100%)",
                }}
              />
              <span
                className="absolute left-6 top-6 inline-flex rounded-full px-4 py-2 text-[11px] font-bold uppercase"
                style={{
                  letterSpacing: "0.12em",
                  background: "var(--brand)",
                  color: "#fff",
                }}
              >
                Подписка
              </span>
              <div
                className="absolute bottom-8 left-8 right-8"
                style={{ color: "#fff", maxWidth: 360 }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    opacity: 0.78,
                    marginBottom: 8,
                  }}
                >
                  Автоматическое пополнение
                </div>
                <h3
                  className="font-serif"
                  style={{ fontSize: "clamp(24px, 2.4vw, 32px)", lineHeight: 1.15 }}
                >
                  Линзы приходят сами,
                  <br />
                  пока вы&nbsp;живёте
                </h3>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="o100-sub-copy">
              <div
                className="text-[11px] uppercase tracking-[0.22em] mb-3"
                style={{ color: "var(--brand)", fontFamily: "var(--font-sans)", fontWeight: 600 }}
              >
                Сервис
              </div>
              <h2
                className="font-serif text-foreground"
                style={{
                  fontSize: "clamp(34px, 4vw, 52px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  marginBottom: 14,
                  fontWeight: 500,
                }}
              >
                Подписка на&nbsp;линзы и&nbsp;средства ухода
              </h2>
              <div className="o100-sub-saveline">Экономьте с&nbsp;первой доставки</div>

              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {SUBSCRIPTION_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span
                      className="inline-flex items-center justify-center rounded-full"
                      style={{
                        width: 22,
                        height: 22,
                        marginTop: 2,
                        flexShrink: 0,
                        background: "color-mix(in oklab, var(--brand) 12%, transparent)",
                        color: "var(--brand)",
                      }}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.3} />
                    </span>
                    <span
                      className="text-foreground"
                      style={{ fontSize: 15, lineHeight: 1.55, fontFamily: "var(--font-sans)" }}
                    >
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3" style={{ marginTop: 28 }}>
                <a
                  href={catalogHref("kontaktnye-linzy")}
                  className="o100-sub-btn o100-sub-btn-primary"
                >
                  Все товары по&nbsp;подписке
                </a>
                <a href="#" className="o100-sub-btn o100-sub-btn-secondary">
                  Как это работает
                </a>
              </div>

              <div
                className="o100-sub-savings flex items-center gap-4"
                style={{
                  marginTop: 28,
                  padding: "16px 18px",
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  background: "var(--cream)",
                }}
              >
                <div
                  className="font-serif"
                  style={{ fontSize: 36, lineHeight: 1, color: "var(--brand)", fontWeight: 600 }}
                >
                  −15%
                </div>
                <div className="text-muted-foreground" style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--foreground)" }}>Средняя экономия</strong>
                  &nbsp;по подписке против разовых покупок за&nbsp;год.
                  <br />
                  Точная скидка зависит от&nbsp;бренда и&nbsp;режима ношения.
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CategoryTile({ cell }: { cell: (typeof CAT_CELLS)[number] }) {
  const isTop = cell.titlePos === "top";
  // Gradient direction depends on text position so the dark wash is
  // always behind the text (top-anchored vs bottom-anchored).
  const gradient = isTop
    ? "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0) 70%)"
    : "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)";
  return (
    <a
      href={cell.href}
      className="o100-cat-tile group relative block rounded-2xl overflow-hidden bg-cream hover:-translate-y-1 transition-transform duration-300 h-full w-full"
    >
      <img
        src={cell.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
      />
      <div className="absolute inset-0" style={{ background: gradient }} />
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
          className="o100-cat-btn inline-flex items-center gap-1.5 rounded-full text-sm font-medium"
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
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium shrink-0 hover:opacity-70 transition-opacity"
          style={{ color: "var(--brand)" }}
        >
          Смотреть все <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 flex-1">
        {/* Feature card */}
        <a
          href="/uslugi"
          className="sm:col-span-3 relative rounded-2xl overflow-hidden p-7 flex flex-col justify-between text-white hover:opacity-95 hover:-translate-y-1 transition-all duration-300"
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
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold self-start hover:bg-white/30 transition-colors"
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
              className="relative rounded-2xl overflow-hidden bg-cream p-4 pr-3 flex items-center gap-3 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex-1 min-w-0">
                <div
                  className="font-serif"
                  style={{ fontSize: 14.5, lineHeight: 1.2, color: "var(--foreground)" }}
                >
                  {p.title}
                </div>
                <span
                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium hover:opacity-70 transition-opacity"
                  style={{ color: "var(--brand)" }}
                >
                  Подробнее <ArrowRight className="h-3 w-3" />
                </span>
              </div>
              {p.image ? (
                <img src={p.image} alt="" className="w-16 h-16 object-cover rounded-xl shrink-0" />
              ) : null}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
