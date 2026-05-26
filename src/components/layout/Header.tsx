import { Link } from "@tanstack/react-router";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Gem,
  Users,
  Tag,
  CalendarDays,
  CalendarClock,
  CalendarRange,
  Circle,
  Layers,
  Sun,
  Minus,
  ChevronRight,
  ShieldCheck,
  Link2,
  Grid2x2,
} from "lucide-react";
import { GenderIcon } from "@/components/ui/GenderIcon";
import { brandLogoImg, BRAND_NAMES } from "@/lib/brand-logos";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const CITIES = ["Санкт-Петербург", "Новокузнецк", "Россия"] as const;
type City = (typeof CITIES)[number];

const PROMOS = [
  { text: "ДО -40% НА СОЛНЦЕЗАЩИТНЫЕ ОЧКИ", href: "/catalog_s/opravy/vysota-oversize-crystal" },
  { text: "ПОДАРОК К ЛИНЗАМ STELLEST", href: "/catalog_s/opravy/vysota-oversize-crystal" },
  { text: "ОТЛИЧНЫЕ ЛИНЗЫ + КЭШБЭК 14%", href: "/catalog_s/opravy/vysota-oversize-crystal" },
  {
    text: "КУПИТЕ 2 УПАКОВКИ ЛИНЗ ULTRAFLEX PREMIER И ПОЛУЧИТЕ СКЛАДНУЮ СУМКУ В ПОДАРОК",
    href: "/catalog_s/opravy/vysota-oversize-crystal",
  },
  { text: "ДЕТСКАЯ МИОПИЯ ПОД КОНТРОЛЕМ", href: "/catalog_s/opravy/vysota-oversize-crystal" },
  {
    text: "КУПИТЕ 2 УПАКОВКИ ЛИНЗ MISIGHT 1 DAY 90 И ПОЛУЧИТЕ 20 ЛИНЗ В ПОДАРОК + СКИДКУ 1000 р",
    href: "/catalog_s/opravy/vysota-oversize-crystal",
  },
];

// ---------- Mega-menu types ----------
type LinkItem = { label: string; href: string; icon: ReactNode };
type ChipItem = { label: string; href: string };
type MegaCol =
  | { kind: "links"; title: string; items: LinkItem[]; cols?: 1 | 2; span?: number }
  | { kind: "chips"; title: string; items: ChipItem[]; span?: number };
type ConstructionType = "Ободковые" | "Полуободковые" | "Безободковые";
type ClassicMega = { kind: "classic"; cols: MegaCol[]; allHref: string; gridCols: 3 | 4 };
type ShowcaseMega = {
  kind: "showcase";
  allHref: string;
  shapeItems: LinkItem[];
  genderItems: LinkItem[];
  materialItems: LinkItem[];
  constructionItems: LinkItem[];
  brandItems: LinkItem[];
};
type Mega = ClassicMega | ShowcaseMega;

// ---------- Inline shape SVGs (currentColor stroke) ----------
const sw = 1.6;
const S = (children: ReactNode) => (
  <svg
    width="22"
    height="14"
    viewBox="0 0 44 22"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);
const ShapeIco = {
  aviator: S(
    <>
      <path d="M3 8 Q3 17 11 17 Q19 17 19 9 L19 6 L3 6 Z" />
      <path d="M25 6 L41 6 L41 9 Q41 17 33 17 Q25 17 25 8 Z" />
      <path d="M19 8 L25 8" />
    </>,
  ),
  oversize: S(
    <>
      <rect x="3" y="4" width="16" height="14" rx="4" />
      <rect x="25" y="4" width="16" height="14" rx="4" />
      <path d="M19 11 L25 11" />
    </>,
  ),
  browliner: S(
    <>
      <path d="M3 5 L19 5 M3 5 Q3 17 11 17 Q19 17 19 5" strokeWidth="2.4" />
      <path d="M25 5 L41 5 M25 5 Q25 17 33 17 Q41 17 41 5" strokeWidth="2.4" />
      <path d="M19 9 L25 9" />
    </>,
  ),
  wayfarer: S(
    <>
      <path d="M3 6 L19 5 L18 16 Q11 18 5 16 Z" />
      <path d="M25 5 L41 6 L39 16 Q33 18 26 16 Z" />
      <path d="M19 9 L25 9" />
    </>,
  ),
  square: S(
    <>
      <rect x="3" y="6" width="16" height="11" />
      <rect x="25" y="6" width="16" height="11" />
      <path d="M19 11 L25 11" />
    </>,
  ),
  clipon: S(
    <>
      <circle cx="11" cy="11" r="7" />
      <circle cx="33" cy="11" r="7" />
      <path d="M18 11 L26 11" />
      <path d="M20 4 L24 4 L24 7 L20 7 Z" />
    </>,
  ),
  cateye: S(
    <>
      <path d="M3 8 Q4 4 12 4 Q20 4 19 10 Q18 16 11 16 Q3 16 3 8 Z" />
      <path d="M25 10 Q24 4 32 4 Q40 4 41 8 Q41 16 33 16 Q26 16 25 10 Z" />
      <path d="M19 9 L25 9" />
    </>,
  ),
  round: S(
    <>
      <circle cx="11" cy="11" r="7" />
      <circle cx="33" cy="11" r="7" />
      <path d="M18 11 L26 11" />
    </>,
  ),
  oval: S(
    <>
      <ellipse cx="11" cy="11" rx="8" ry="6" />
      <ellipse cx="33" cy="11" rx="8" ry="6" />
      <path d="M19 11 L25 11" />
    </>,
  ),
  rect: S(
    <>
      <rect x="3" y="7" width="16" height="9" rx="1.5" />
      <rect x="25" y="7" width="16" height="9" rx="1.5" />
      <path d="M19 11 L25 11" />
    </>,
  ),
  sport: S(
    <>
      <path d="M3 8 Q3 16 11 16 Q20 16 21 9 L22 7 L2 7 Z" />
      <path d="M22 7 L42 7 L41 9 Q40 16 33 16 Q23 16 22 8 Z" />
    </>,
  ),
  narrow: S(
    <>
      <ellipse cx="11" cy="11" rx="8" ry="3.5" />
      <ellipse cx="33" cy="11" rx="8" ry="3.5" />
      <path d="M19 11 L25 11" />
    </>,
  ),
  // construction
  rimless: S(
    <>
      <path d="M5 11 L17 11" />
      <path d="M27 11 L39 11" />
      <path d="M19 11 L25 11" />
    </>,
  ),
  fullrim: S(
    <>
      <circle cx="11" cy="11" r="7" />
      <circle cx="33" cy="11" r="7" />
      <path d="M18 11 L26 11" />
    </>,
  ),
  halfrim: S(
    <>
      <path d="M4 11 Q4 17 11 17 Q18 17 18 11" />
      <path d="M4 11 L18 11" strokeDasharray="2 2" />
      <path d="M26 11 Q26 17 33 17 Q40 17 40 11" />
      <path d="M26 11 L40 11" strokeDasharray="2 2" />
      <path d="M18 11 L26 11" />
    </>,
  ),
};

function FrameTypeSvgIcon({ kind, className }: { kind: ConstructionType; className?: string }) {
  const order = ["Ободковые", "Полуободковые", "Безободковые"] as const;
  const index = Math.max(order.indexOf(kind), 0);
  const shift = `${index * 33.333333}%`;

  return (
    <span className={cn("relative block overflow-hidden", className)} aria-hidden="true">
      <img
        src="/icon_frame_type.svg"
        alt=""
        className="absolute inset-0 h-full w-[300%] max-w-none"
        style={{
          transform: `translateX(-${shift})`,
          transformOrigin: "left center",
        }}
      />
    </span>
  );
}

// ---------- Builders ----------
function shapeMega(cat: string): Mega {
  const base = `/catalog_s/${cat}/`;
  const q = (k: string, v: string) => `${base}?${k}=${encodeURIComponent(v)}`;
  return {
    kind: "showcase",
    allHref: base,
    shapeItems: [
      {
        label: "Авиатор",
        href: q("shape", "Авиатор"),
        icon: <img src="/aviator.webp" alt="" className="h-4 w-auto object-contain" />,
      },
      {
        label: "Квадратные",
        href: q("shape", "Квадратные"),
        icon: <img src="/square.webp" alt="" className="h-4 w-auto object-contain" />,
      },
      {
        label: "Кошачий глаз",
        href: q("shape", "Кошачий глаз"),
        icon: <img src="/cat-eye.webp" alt="" className="h-4 w-auto object-contain" />,
      },
      {
        label: "Круглые",
        href: q("shape", "Круглые"),
        icon: <img src="/round.webp" alt="" className="h-4 w-auto object-contain" />,
      },
      {
        label: "Овальные",
        href: q("shape", "Овальные"),
        icon: <img src="/Anselm - Oval.webp" alt="" className="h-4 w-auto object-contain" />,
      },
      {
        label: "Прямоугольные",
        href: q("shape", "Прямоугольные"),
        icon: <img src="/rectangle.webp" alt="" className="h-4 w-auto object-contain" />,
      },
    ],
    genderItems: [
      {
        label: "Мужские",
        href: q("gender", "Мужские"),
        icon: <GenderIcon kind="male" className="h-4 w-4" />,
      },
      {
        label: "Женские",
        href: q("gender", "Женские"),
        icon: <GenderIcon kind="female" className="h-4 w-4" />,
      },
      {
        label: "Детские",
        href: q("gender", "Детские"),
        icon: <GenderIcon kind="boy" className="h-4 w-4" />,
      },
      {
        label: "Унисекс",
        href: q("gender", "Унисекс"),
        icon: <Users className="h-4 w-4 stroke-[1.8]" />,
      },
    ],
    materialItems: [
      {
        label: "Ацетат",
        href: q("material", "Ацетат"),
        icon: <Gem className="h-5 w-5 stroke-[1.7]" />,
      },
      {
        label: "Титан",
        href: q("material", "Титан"),
        icon: <ShieldCheck className="h-5 w-5 stroke-[1.7]" />,
      },
      {
        label: "Металл",
        href: q("material", "Металл"),
        icon: <Link2 className="h-5 w-5 stroke-[1.7]" />,
      },
    ],
    constructionItems: [
      {
        label: "Безободковые",
        href: q("construction", "Безободковые"),
        icon: <FrameTypeSvgIcon kind="Безободковые" className="h-3.5 w-6" />,
      },
      {
        label: "Ободковые",
        href: q("construction", "Ободковые"),
        icon: <FrameTypeSvgIcon kind="Ободковые" className="h-3.5 w-6" />,
      },
      {
        label: "Полуободковые",
        href: q("construction", "Полуободковые"),
        icon: <FrameTypeSvgIcon kind="Полуободковые" className="h-3.5 w-6" />,
      },
    ],
    brandItems: [
      "Lionsheart",
      "Stepper",
      "Silhouette",
      "Polaroid",
      "Juniorlook",
      "Furla",
      "St. Louise",
      "Safilo",
      "Okula",
      "Guess",
      "Fisher-Price",
    ].map((brand) => ({
      label: brand,
      href: q("brand", brand),
      icon: brandLogoImg(brand, "h-5 w-auto max-w-[78px] object-contain") ?? (
        <Tag className="h-3 w-3" />
      ),
    })),
  };
}

const MEGA_LENSES_CONTACT: ClassicMega = {
  kind: "classic",
  gridCols: 3,
  allHref: "/catalog_s/kontaktnye_linzy_/",
  cols: [
    {
      kind: "links",
      title: "Бренд",
      items: ["Acuvue", "CooperVision", "Bausch+Lomb", "Alcon"].map((b) => ({
        label: b,
        href: `/catalog_s/kontaktnye_linzy_/?brand=${encodeURIComponent(b)}`,
        icon: <Tag className="h-4 w-4" />,
      })),
    },
    {
      kind: "links",
      title: "Замена через",
      items: [
        {
          label: "Однодневные",
          href: "/catalog_s/kontaktnye_linzy_/?wearMode=Однодневные",
          icon: <CalendarDays className="h-4 w-4" />,
        },
        {
          label: "Двухнедельные",
          href: "/catalog_s/kontaktnye_linzy_/?wearMode=Двухнедельные",
          icon: <CalendarClock className="h-4 w-4" />,
        },
        {
          label: "Месячные",
          href: "/catalog_s/kontaktnye_linzy_/?wearMode=Месячные",
          icon: <CalendarRange className="h-4 w-4" />,
        },
      ],
    },
    {
      kind: "chips",
      title: "Оптическая сила (сфера)",
      items: ["−6.00", "−3.00", "−1.00", "0", "+1.00", "+3.00"].map((s) => ({
        label: s,
        href: `/catalog_s/kontaktnye_linzy_/?sphere=${encodeURIComponent(s)}`,
      })),
    },
  ],
};

const MEGA_LENSES_GLASSES: ClassicMega = {
  kind: "classic",
  gridCols: 4,
  allHref: "/catalog_s/linzy_dlya_ochkov/",
  cols: [
    {
      kind: "links",
      title: "Производитель",
      items: ["ZEISS", "Essilor", "Hoya"].map((b) => ({
        label: b,
        href: `/catalog_s/linzy_dlya_ochkov/?brand=${encodeURIComponent(b)}`,
        icon: <Tag className="h-4 w-4" />,
      })),
    },
    {
      kind: "links",
      title: "Тип линзы",
      items: [
        {
          label: "Однофокусные",
          href: "/catalog_s/linzy_dlya_ochkov/?lensType=Однофокусные",
          icon: <Circle className="h-4 w-4" />,
        },
        {
          label: "Прогрессивные",
          href: "/catalog_s/linzy_dlya_ochkov/?lensType=Прогрессивные",
          icon: <Layers className="h-4 w-4" />,
        },
        {
          label: "Фотохромные",
          href: "/catalog_s/linzy_dlya_ochkov/?lensType=Фотохромные",
          icon: <Sun className="h-4 w-4" />,
        },
        {
          label: "Бифокальные",
          href: "/catalog_s/linzy_dlya_ochkov/?lensType=Бифокальные",
          icon: <Minus className="h-4 w-4" />,
        },
      ],
    },
    {
      kind: "chips",
      title: "Оптическая сила (сфера)",
      items: ["−6.00", "−3.00", "−1.00", "0", "+1.00", "+3.00"].map((s) => ({
        label: s,
        href: `/catalog_s/linzy_dlya_ochkov/?sphere=${encodeURIComponent(s)}`,
      })),
    },
    {
      kind: "chips",
      title: "Межзрачковое расстояние",
      items: ["58", "60", "62", "64", "66"].map((p) => ({
        label: `${p} мм`,
        href: `/catalog_s/linzy_dlya_ochkov/?pd=${p}`,
      })),
    },
  ],
};

const NAV: { label: string; href: string; mega?: Mega }[] = [
  { label: "Оправы", href: "/catalog_s/opravy/", mega: shapeMega("opravy") },
  {
    label: "Солнцезащитные",
    href: "/catalog_s/solntsezashchitnye_ochki/",
    mega: shapeMega("solntsezashchitnye_ochki"),
  },
  { label: "Контактные линзы", href: "/catalog_s/kontaktnye_linzy_/", mega: MEGA_LENSES_CONTACT },
  { label: "Линзы для очков", href: "/catalog_s/linzy_dlya_ochkov/", mega: MEGA_LENSES_GLASSES },
  { label: "Аксессуары", href: "/catalog_s/soputstvuyushchie_tovary/" },
  { label: "Салоны", href: "/contacts/" },
];

function SectionTitle({ title, suffix }: { title: string; suffix?: ReactNode }) {
  return (
    <div className="mb-2.5">
      <div className="flex items-end gap-1">
        <h3 className="text-[20px] leading-none uppercase tracking-tight text-foreground max-[1399px]:text-[17px] max-[1199px]:text-base">
          {title}
        </h3>
        {suffix && (
          <span className="mb-0.5 text-xs text-muted-foreground max-[1399px]:text-[10px] max-[1199px]:text-[9px]">
            {suffix}
          </span>
        )}
      </div>
      <div className="mt-1 h-px w-5 bg-brand" />
    </div>
  );
}

function ShowcaseMegaPanel({ mega }: { mega: ShowcaseMega }) {
  return (
    <div className="bg-[#f4f2ef] border-b border-[#e7e4de]">
      <div className="mx-auto max-w-screen-2xl px-3 pb-3.5 pt-3.5">
        <div className="grid gap-2.5 lg:grid-cols-2 xl:grid-cols-[1.2fr_0.88fr_1.08fr]">
          <section className="rounded-xl border border-[#ece9e4] bg-white p-3 shadow-[0_4px_16px_rgba(33,24,18,0.04)]">
            <SectionTitle title="Форма" />
            <div className="grid grid-cols-2 gap-2">
              {mega.shapeItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-[42px] items-center gap-2 rounded-xl border border-[#efece8] bg-white px-2 py-1.5 transition-colors hover:border-brand/40"
                >
                  <span className="flex w-[49px] shrink-0 items-center justify-center text-foreground">
                    {item.icon}
                  </span>
                  <span className="text-[15px] leading-tight text-foreground transition-colors group-hover:text-brand max-[1399px]:text-xs max-[1199px]:text-[11px]">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#ece9e4] bg-white p-3 shadow-[0_4px_16px_rgba(33,24,18,0.04)]">
            <SectionTitle title="Пол" />
            <div className="grid grid-cols-2 gap-2">
              {mega.genderItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-16 flex-col items-center justify-center rounded-xl border border-[#efece8] bg-white px-2 py-2 text-center transition-colors hover:border-brand/40"
                >
                  <span className="mb-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4f0ed] text-foreground transition-colors group-hover:text-brand">
                    {item.icon}
                  </span>
                  <span className="text-[17px] leading-tight text-foreground transition-colors group-hover:text-brand max-[1399px]:text-xs max-[1199px]:text-[11px]">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#ece9e4] bg-white p-3 shadow-[0_4px_16px_rgba(33,24,18,0.04)] lg:col-span-2 xl:col-span-1">
            <SectionTitle title="Материал" />
            <div className="grid grid-cols-3 gap-2">
              {mega.materialItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-20 flex-col items-center justify-center gap-2.5 rounded-xl px-1.5 text-center transition-colors hover:bg-[#faf8f6]"
                >
                  <span className="text-foreground transition-colors group-hover:text-brand">
                    {item.icon}
                  </span>
                  <span className="text-lg leading-tight text-foreground transition-colors group-hover:text-brand max-[1399px]:text-[13px] max-[1199px]:text-xs">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[0.92fr_2.5fr]">
          <section className="rounded-xl border border-[#ece9e4] bg-white p-3 shadow-[0_4px_16px_rgba(33,24,18,0.04)]">
            <SectionTitle title="Конструкция" />
            <div className="divide-y divide-[#eeeae5]">
              {mega.constructionItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-[46px] items-center gap-2 py-2 first:pt-1 last:pb-1"
                >
                  <span className="inline-flex h-4 w-6 shrink-0 items-center justify-center text-foreground transition-colors group-hover:text-brand">
                    {item.icon}
                  </span>
                  <span className="text-[17px] leading-tight text-foreground transition-colors group-hover:text-brand max-[1399px]:text-xs max-[1199px]:text-[11px]">
                    {item.label}
                  </span>
                  <ChevronRight className="ml-auto h-3 w-3 shrink-0 text-foreground/90 transition-colors group-hover:text-brand" />
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#ece9e4] bg-white p-3 shadow-[0_4px_16px_rgba(33,24,18,0.04)]">
            <SectionTitle title="Бренды" suffix="(включая O.D.L.)" />
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              {mega.brandItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-[51px] flex-col items-center justify-center rounded-xl border border-[#efece8] bg-white px-1.5 py-2 text-center transition-colors hover:border-brand/35"
                >
                  <span className="mb-0.5 flex h-5 items-center justify-center text-foreground transition-colors group-hover:text-brand">
                    {item.icon}
                  </span>
                  <span className="text-[15px] leading-tight text-foreground transition-colors group-hover:text-brand max-[1399px]:text-[11px] max-[1199px]:text-[10px]">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-3.5 border-t border-[#e8e4dd] pt-2.5">
          <div className="flex justify-center">
            <a
              href={mega.allHref}
              className="inline-flex min-w-[202px] items-center justify-center gap-2 rounded-full border border-brand bg-white px-5 py-2 text-[20px] uppercase tracking-[0.02em] text-brand transition-colors hover:bg-brand hover:text-brand-foreground max-[1399px]:text-[15px] max-[1199px]:min-w-40 max-[1199px]:text-xs"
            >
              <Grid2x2 className="h-4 w-4 shrink-0 stroke-[1.8]" />
              СМОТРЕТЬ ВСЁ
              <span
                aria-hidden
                className="text-[23px] leading-none max-[1399px]:text-[17px] max-[1199px]:text-sm"
              >
                →
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassicMegaPanel({ mega }: { mega: ClassicMega }) {
  const gridClass = mega.gridCols === 4 ? "grid-cols-4" : "grid-cols-3";
  return (
    <div className="mx-auto max-w-7xl px-8 py-8">
      <div className={cn("grid gap-10", gridClass)}>
        {mega.cols.map((col) => (
          <div key={col.title} style={col.span ? { gridColumn: `span ${col.span}` } : undefined}>
            <div className="font-serif text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {col.title}
            </div>
            {col.kind === "links" ? (
              <ul
                className={cn(
                  "gap-x-4",
                  col.cols === 2 ? "grid grid-cols-2 gap-y-1.5" : "flex flex-col gap-1.5",
                )}
              >
                {col.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={it.href}
                      className="group flex items-center gap-2 text-sm hover:text-brand transition-colors py-0.5"
                    >
                      <span className="text-muted-foreground group-hover:text-brand shrink-0 inline-flex items-center justify-center min-w-5">
                        {it.icon}
                      </span>
                      <span>{it.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {col.items.map((it) => (
                  <a
                    key={it.label}
                    href={it.href}
                    className="px-2.5 py-1 text-xs rounded-full border border-border hover:border-brand hover:text-brand transition-colors inline-flex items-center gap-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/45" />
                    {it.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-5 border-t border-border flex justify-end">
        <a
          href={mega.allHref}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider px-4 py-2 rounded-full bg-brand text-brand-foreground hover:opacity-90 transition-opacity"
        >
          Смотреть всё →
        </a>
      </div>
    </div>
  );
}

function MegaPanel({ mega }: { mega: Mega }) {
  if (mega.kind === "showcase") return <ShowcaseMegaPanel mega={mega} />;
  return <ClassicMegaPanel mega={mega} />;
}

export function Header() {
  const { totals, open: openCart, saved } = useCart();
  const { count } = totals();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Guard localStorage-derived state from SSR — prevents hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [hovered, setHovered] = useState<string | null>(null);

  const [city, setCity] = useState<City>("Санкт-Петербург");
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("o100-city") as City | null;
    if (stored && (CITIES as readonly string[]).includes(stored)) setCity(stored);
  }, []);

  useEffect(() => {
    if (!cityOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [cityOpen]);

  function selectCity(c: City) {
    setCity(c);
    localStorage.setItem("o100-city", c);
    setCityOpen(false);
  }

  const [promoIdx, setPromoIdx] = useState(0);
  const [promoVisible, setPromoVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setPromoVisible(false);
      setTimeout(() => {
        setPromoIdx((i) => (i + 1) % PROMOS.length);
        setPromoVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Utility bar */}
      <div className="bg-ink text-primary-foreground text-xs py-2 px-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* City selector */}
            <div className="relative" ref={cityRef}>
              <button
                onClick={() => setCityOpen((v) => !v)}
                className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-7.6 8-13a8 8 0 1 0-16 0c0 5.4 8 13 8 13z" />
                  <circle cx="12" cy="9" r="3" />
                </svg>
                {city}
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: cityOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {cityOpen && (
                <div
                  className="absolute left-0 bg-ink border border-white/15 rounded shadow-xl z-50"
                  style={{ top: "calc(100% + 6px)", minWidth: "180px" }}
                >
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => selectCity(c)}
                      className={cn(
                        "w-full text-left flex items-center gap-2 text-xs transition-colors hover:bg-white/10",
                        c === city ? "opacity-100" : "opacity-55",
                      )}
                      style={{ padding: "8px 12px" }}
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: c === city ? 1 : 0, flexShrink: 0 }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="opacity-40">·</span>
            <a
              href={PROMOS[promoIdx].href}
              className="uppercase tracking-wide hover:opacity-100 transition-colors truncate"
              style={{
                opacity: promoVisible ? 0.75 : 0,
                transition: "opacity 0.3s ease",
                maxWidth: "420px",
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {PROMOS[promoIdx].text}
            </a>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => document.dispatchEvent(new CustomEvent("open-callback"))}
              className="opacity-70 hover:opacity-100 transition-opacity border-b border-dotted border-white/30 hover:border-white/70 pb-px"
            >
              Заказать звонок
            </button>
            <a
              href="tel:+78121000000"
              className="flex items-center gap-2 font-semibold text-[13px] px-3.5 py-1 rounded-full bg-white/10 border border-transparent hover:bg-white/15 hover:border-white/20 transition-all no-underline text-primary-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_0_0_oklch(0.75_0.18_150/0.6)] animate-[pulse-ring_2s_infinite]" />
              +7 (812) 100-00-00
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.37 1.88.72 2.78a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.83.59 2.78.72A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Меню"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 shrink-0">
              <span className="bg-brand text-brand-foreground font-bold px-2 py-1 text-sm tracking-tight rounded-sm">
                100%
              </span>
              <span className="font-serif text-lg tracking-tight">ОПТИКА</span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex items-center gap-6 text-sm flex-1 justify-center"
              onMouseLeave={() => setHovered(null)}
            >
              {NAV.map((item) => (
                <div key={item.href} onMouseEnter={() => setHovered(item.href)} className="py-5">
                  <a href={item.href} className="hover:text-brand transition-colors">
                    {item.label}
                  </a>
                </div>
              ))}

              {/* Mega-menu */}
              {NAV.map(
                (item) =>
                  item.mega &&
                  hovered === item.href && (
                    <div
                      key={`mega-${item.href}`}
                      className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg"
                      onMouseEnter={() => setHovered(item.href)}
                    >
                      <MegaPanel mega={item.mega} />
                    </div>
                  ),
              )}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/search"
                search={{ q: "" }}
                className="p-2 hover:text-brand"
                aria-label="Поиск"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link to="/personal" className="p-2 hover:text-brand" aria-label="Кабинет">
                <User className="h-5 w-5" />
              </Link>
              <button className="p-2 hover:text-brand relative" aria-label="Отложенные">
                <Heart className="h-5 w-5" />
                {mounted && saved.length > 0 && (
                  <span className="absolute top-0 right-0 bg-brand text-brand-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {saved.length}
                  </span>
                )}
              </button>
              <button
                onClick={openCart}
                className="p-2 hover:text-brand relative"
                aria-label="Корзина"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && count > 0 && (
                  <span className="absolute top-0 right-0 bg-brand text-brand-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/40" onClick={() => setMobileOpen(false)}>
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background p-6 overflow-y-auto",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-1">
                <span className="bg-brand text-brand-foreground font-bold px-2 py-1 text-sm rounded-sm">
                  100%
                </span>
                <span className="font-serif text-lg">ОПТИКА</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-lg border-b border-border"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
              <p>ул. Кирочная, 17 · м. Чернышевская</p>
              <a href="mailto:sale-spb@optika100.com" className="block">
                sale-spb@optika100.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
