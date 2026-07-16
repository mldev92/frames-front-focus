import { useState, type ReactNode } from "react";
import { useCityStore, type CityCode } from "@/lib/store/city";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Car,
  Circle,
  Droplets,
  Eye,
  FileText,
  Glasses,
  Laptop,
  Layers,
  Palette,
  ShieldCheck,
  Sun,
  Truck,
  Upload,
} from "lucide-react";
import { catalogHref } from "@/data/categories";
import { EXPANDABLE_FACET_PARAMS } from "@/lib/catalog-route";
import { regionalSiteHref } from "@/lib/city-routing";
import { cn } from "@/lib/utils";
import { AppointmentModal } from "@/components/AppointmentModal";

type FrameCategory = "opravy" | "solntsezashchitnye";

type CountChip = {
  count?: string;
  href: string;
  label: string;
};

type ShapeTile = {
  count: string;
  href: string;
  icon: ReactNode;
  label: string;
};

type CardLink = {
  count?: string;
  href: string;
  icon?: ReactNode;
  label: string;
  meta?: string;
  tag?: string;
};

type DemographicCard = CardLink & {
  wide?: boolean;
};

type KidsCard = CardLink & {
  meta: string;
  tone: "boys" | "girls";
};

type UtilityLink = {
  href: string;
  icon: ReactNode;
  label: string;
};

type FramesMegaMenu = {
  kind: "frames";
  allHref: string;
  allLabel: string;
  brandStrip: CountChip[];
  brandStripHref: string;
  featured: {
    ctaHref: string;
    description: string;
    eyebrow: string;
    imageAlt: string;
    imageSrc: string;
    price: string;
    title: string;
  };
  materials: CountChip[];
  pricePresets: Array<{ href: string; label: string; price: string }>;
  shapes: ShapeTile[];
  summary: string;
  tags: CountChip[];
  title: string;
  titleEmphasis: string;
  construction: CardLink[];
  demographics: DemographicCard[];
  kidsGroup: {
    count: string;
    href: string;
    items: KidsCard[];
  };
};

type ContactMegaMenu = {
  kind: "contact";
  allHref: string;
  allLabel: string;
  brands: CardLink[];
  contactModes: CardLink[];
  cylinder: CountChip[];
  helper: {
    primaryHref: string;
    secondaryHref: string;
    text: string;
    title: string;
  };
  needs: CardLink[];
  sphereValues: CountChip[];
  summary: string;
  title: string;
  titleEmphasis: string;
  utilities: UtilityLink[];
  addition: CountChip[];
  bcValues: CountChip[];
};

type FeaturedAside = {
  ctaHref?: string;
  ctaLabel?: string;
  description: string;
  eyebrow: string;
  imageAlt: string;
  imageSrc: string;
  meta?: string;
  note?: string;
  price?: string;
  title: string;
};

type GlassesMegaMenu = {
  kind: "glasses";
  allHref: string;
  allLabel: string;
  lensTypes: CardLink[];
  manufacturers: CardLink[];
  lightTransmissionValues: CountChip[];
  materials: CountChip[];
  purposes: CardLink[];
  rxHelper: {
    ctaHref: string;
    fields: Array<{ label: string; value: string }>;
    title: string;
  };
  summary: string;
  technologies: CardLink[];
  title: string;
  titleEmphasis: string;
  utilities: UtilityLink[];
  featured: FeaturedAside;
};

type AccessoriesGroup = {
  title: string;
  allHref: string;
  items: CardLink[];
};

type AccessoriesMegaMenu = {
  kind: "accessories";
  allHref: string;
  allLabel: string;
  title: string;
  titleEmphasis: string;
  summary: string;
  groups: AccessoriesGroup[];
  utilities: UtilityLink[];
  featured: FeaturedAside;
  promoChips: CountChip[];
};


export type HeaderMegaMenu = FramesMegaMenu | ContactMegaMenu | GlassesMegaMenu | AccessoriesMegaMenu;

export interface HeaderNavItem {
  href: string;
  label: string;
  mega?: HeaderMegaMenu;
}

const menuHref = (category: Parameters<typeof catalogHref>[0], params?: Record<string, string>) => {
  const href = catalogHref(category);
  if (!params) return href;

  const search = new URLSearchParams();
  let expandedFacet: string | undefined;
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
    if (!expandedFacet && value && EXPANDABLE_FACET_PARAMS.includes(key as (typeof EXPANDABLE_FACET_PARAMS)[number])) {
      expandedFacet = key;
    }
  }
  if (expandedFacet) search.set("expand", expandedFacet);

  const query = search.toString();
  return query ? `${href}?${query}` : href;
};

const frameHref = (category: FrameCategory, params?: Record<string, string>) => menuHref(category, params);
const regionalMenuHref = (href: string, city: CityCode) => regionalSiteHref(href, city);
const formatSphereLabel = (value: string) => (value === "0" ? value : value.replace(/\.00$/, ""));
const expandHref = (href: string, facet: (typeof EXPANDABLE_FACET_PARAMS)[number]) => {
  const [path, query = ""] = href.split("?");
  const search = new URLSearchParams(query);
  search.set("expand", facet);
  return `${path}?${search.toString()}`;
};

const panelShellClass =
  "overflow-hidden rounded-b-[28px] border border-[#e7e2db] bg-white shadow-[0_12px_30px_rgba(33,24,18,0.08),0_28px_80px_rgba(33,24,18,0.10)]";
const surfaceCardClass =
  "rounded-[18px] border border-[#ece7df] bg-white shadow-[0_1px_2px_rgba(33,24,18,0.04),0_8px_24px_rgba(33,24,18,0.05)]";
const sectionNameClass =
  "font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground";
const sectionActionClass =
  "inline-flex shrink-0 items-center gap-1 rounded-full border border-[#e4dbcf] bg-white px-2.5 py-1 text-[11.5px] font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand";
const chipClass =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-[12.5px] text-foreground transition-colors hover:border-brand hover:text-brand";

const assetIcon = ({
  alt,
  boxClassName,
  className,
  scale = 1,
  src,
}: {
  alt: string;
  boxClassName?: string;
  className?: string;
  scale?: number;
  src: string;
}) => (
  <span className={cn("flex items-center justify-center", boxClassName)}>
    <img
      src={src}
      alt={alt}
      className={cn("object-contain", className)}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    />
  </span>
);

const frameShapeAssetIcon = (src: string, alt: string, scale?: number) =>
  assetIcon({
    alt,
    boxClassName: "w-full",
    className: "h-9 w-full",
    scale,
    src,
  });

const frameConstructionAssetIcon = (src: string, alt: string) =>
  assetIcon({
    alt,
    boxClassName: "h-4 w-10 shrink-0",
    className: "h-3.5 w-auto",
    src,
  });

const clipOnConstructionIcon = (
  <span className="inline-flex h-4 w-10 shrink-0 items-center justify-center">
    <span className="rounded-full border border-[#d8d1c8] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      Clip
    </span>
  </span>
);

const audienceIconBase =
  "h-[18px] w-[18px] shrink-0 text-muted-foreground transition-colors group-hover:text-brand";

const AudienceIcons = {
  male: (
    <svg viewBox="0 0 24 24" className={audienceIconBase} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="4" />
      <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
    </svg>
  ),
  female: (
    <svg viewBox="0 0 24 24" className={audienceIconBase} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M12 12v8" />
      <path d="M9 17h6" />
    </svg>
  ),
  unisex: (
    <svg viewBox="0 0 24 24" className={audienceIconBase} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M4 20c0-3 2-5 5-5s5 2 5 5" />
      <path d="M11 20c0-3 2-5 5-5s5 2 5 5" />
    </svg>
  ),
  kidsTitle: (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" />
      <path d="M7 21c0-3 2-5 5-5s5 2 5 5" />
      <path d="M9 4l3-2 3 2" />
    </svg>
  ),
  boys: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[oklch(0.50_0.13_240)]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M7 21v-5a5 5 0 0 1 10 0v5" />
      <path d="M9 4.5l3-2 3 2" />
    </svg>
  ),
  girls: (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M8 21l2-9h4l2 9" />
      <path d="M10 5.5q2-2 4 0" />
    </svg>
  ),
};

const LensTypeIcon = ({ kind }: { kind: "single" | "progressive" | "bifocal" | "office" | "photo" | "kids" }) => {
  const base = "h-[18px] w-6 shrink-0 text-muted-foreground transition-colors group-hover:text-brand";

  if (kind === "progressive") {
    return (
      <svg viewBox="0 0 30 22" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15" cy="11" r="8" />
        <path d="M15 3v16" />
        <path d="M7 11h16" />
      </svg>
    );
  }

  if (kind === "bifocal") {
    return (
      <svg viewBox="0 0 30 22" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15" cy="11" r="8" />
        <path d="M7 13h16" />
      </svg>
    );
  }

  if (kind === "office") {
    return (
      <svg viewBox="0 0 30 22" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15" cy="11" r="8" />
        <circle cx="15" cy="11" r="4" />
      </svg>
    );
  }

  if (kind === "photo") {
    return (
      <svg viewBox="0 0 30 22" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15" cy="11" r="8" />
        <path d="M15 3v3M15 16v3M3 11h3M24 11h3M6.5 4.5l2 2M21.5 17.5l2 2M19.5 6.5l2-2M8.5 17.5l-2 2" />
      </svg>
    );
  }

  if (kind === "kids") {
    return (
      <svg viewBox="0 0 30 22" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="15" cy="11" r="8" />
        <circle cx="15" cy="11" r="2" />
        <path d="M11 7l8 8M19 7l-8 8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 30 22" className={base} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="15" cy="11" r="8" />
    </svg>
  );
};

function sectionHeader(name: string, action: string, href?: string) {
  const actionLabel = action.replace(/\s*→\s*$/, "");
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[#ece7df] pb-2">
      <span className={sectionNameClass}>{name}</span>
      {href ? (
        <a href={href} className={sectionActionClass}>
          {actionLabel}
          <ArrowRight className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-[11.5px] text-muted-foreground">{actionLabel}</span>
      )}
    </div>
  );
}

function buildFrameMega(category: FrameCategory, copy: {
  allLabel: string;
  brandHrefLabel: string;
  brandStrip: string[];
  featured: FramesMegaMenu["featured"];
  summary: string;
  title: string;
  titleEmphasis: string;
}): FramesMegaMenu {
  return {
    kind: "frames",
    allHref: catalogHref(category),
    allLabel: copy.allLabel,
    summary: copy.summary,
    title: copy.title,
    titleEmphasis: copy.titleEmphasis,
    shapes: [
      {
        label: "Прямоугольные",
        count: "389",
        href: frameHref(category, { shape: "Прямоугольные" }),
        icon: frameShapeAssetIcon("/rectangle.webp", "Прямоугольные", 1.15),
      },
      {
        label: "Квадратные",
        count: "35",
        href: frameHref(category, { shape: "Квадратные" }),
        icon: frameShapeAssetIcon("/square.webp", "Квадратные"),
      },
      {
        label: "Трапеция",
        count: "1",
        href: frameHref(category, { shape: "Трапеция" }),
        icon: frameShapeAssetIcon("/wayfarer.webp", "Трапеция", 1.02),
      },
      {
        label: "Овальные",
        count: "49",
        href: frameHref(category, { shape: "Овальные" }),
        icon: frameShapeAssetIcon("/Anselm - Oval2.webp", "Овальные", 1.15),
      },
      {
        label: "Панто",
        count: "64",
        href: frameHref(category, { shape: "Панто" }),
        icon: frameShapeAssetIcon("/panto.webp", "Панто", 1.15),
      },
      {
        label: "Круглые",
        count: "109",
        href: frameHref(category, { shape: "Круглые" }),
        icon: frameShapeAssetIcon("/round.webp", "Круглые"),
      },
      {
        label: "Авиаторы",
        count: "14",
        href: frameHref(category, { shape: "Авиатор" }),
        icon: frameShapeAssetIcon("/aviator.webp", "Авиаторы"),
      },
      {
        label: "Клабмастер",
        count: "6",
        href: frameHref(category, { shape: "Клабмастер" }),
        icon: frameShapeAssetIcon("/clubman_shape.webp", "Клабмастер", 1.275),
      },
      {
        label: "Бабочка",
        count: "77",
        href: frameHref(category, { shape: "Бабочка" }),
        icon: frameShapeAssetIcon("/buterfly_shape22.webp", "Бабочка", 1.3),
      },
      {
        label: "Кошачий глаз",
        count: "115",
        href: frameHref(category, { shape: "Кошачий глаз" }),
        icon: frameShapeAssetIcon("/cat_eye.webp", "Кошачий глаз", 1.04),
      },
      {
        label: "Геометрия",
        count: "59",
        href: frameHref(category, { shape: "Геометрические" }),
        icon: frameShapeAssetIcon("/Geometric22.webp", "Геометрические", 1.5),
      },
      {
        label: "Маска",
        count: "2",
        href: frameHref(category, { shape: "Маска" }),
        icon: frameShapeAssetIcon("/mask_shape.webp", "Маска", 1.3),
      },
      {
        label: "Спорт",
        count: "14",
        href: frameHref(category, { shape: "Спорт" }),
        icon: frameShapeAssetIcon("/sport_shape.webp", "Спорт", 0.99),
      },
      {
        label: "Лектор",
        count: "14",
        href: frameHref(category, { shape: "Лектор" }),
        icon: frameShapeAssetIcon("/lector_shape2.webp", "Лектор"),
      },
      {
        label: "Clip",
        count: "12",
        href: frameHref(category, { shape: "Clip" }),
        icon: frameShapeAssetIcon("/clip.webp", "Clip"),
      },
    ],
    demographics: [
      {
        label: "Мужские",
        count: "412",
        href: frameHref(category, { gender: "Мужские" }),
        icon: AudienceIcons.male,
      },
      {
        label: "Женские",
        count: "488",
        href: frameHref(category, { gender: "Женские" }),
        icon: AudienceIcons.female,
      },
      {
        label: "Унисекс",
        count: "204",
        href: frameHref(category, { gender: "Унисекс" }),
        icon: AudienceIcons.unisex,
        wide: true,
      },
    ],
    kidsGroup: {
      count: "180",
      href: frameHref(category, { gender: "Детские" }),
      items: [
        {
          label: "Для мальчиков",
          meta: "от 6 мес.",
          count: "96",
          href: frameHref(category, { gender: "для мальчиков" }),
          icon: AudienceIcons.boys,
          tone: "boys",
        },
        {
          label: "Для девочек",
          meta: "от 6 мес.",
          count: "84",
          href: frameHref(category, { gender: "для девочек" }),
          icon: AudienceIcons.girls,
          tone: "girls",
        },
      ],
    },
    construction: [
      {
        label: "Ободковые",
        count: "684",
        href: frameHref(category, { construction: "Ободковые" }),
        icon: frameConstructionAssetIcon("/obodkovaea.webp", "Ободковые"),
      },
      {
        label: "Безободковые",
        count: "142",
        href: frameHref(category, { construction: "Безободковые" }),
        icon: frameConstructionAssetIcon("/bezobodkovaea.webp", "Безободковые"),
      },
      {
        label: "Полуободковые",
        count: "96",
        href: frameHref(category, { construction: "Полуободковые" }),
        icon: frameConstructionAssetIcon("/poluobodkovaea.webp", "Полуободковые"),
      },
      {
        label: "Clip-on",
        count: "28",
        href: frameHref(category, { construction: "Clip-on" }),
        icon: clipOnConstructionIcon,
      },
    ],
    materials: [
      { label: "Ацетат", count: "412", href: frameHref(category, { material: "Ацетат" }) },
      { label: "Титан", count: "218", href: frameHref(category, { material: "Титан" }) },
      { label: "Металл", count: "199", href: frameHref(category, { material: "Металл" }) },
      { label: "Пластик", count: "196", href: frameHref(category, { material: "Пластик" }) },
      { label: "TR-90", count: "142", href: frameHref(category, { material: "TR-90" }) },
      { label: "Нейлон", count: "88", href: frameHref(category, { material: "Нейлон" }) },
      { label: "Pebax", count: "42", href: frameHref(category, { material: "Pebax" }) },
      { label: "Комбинированный", count: "186", href: frameHref(category, { material: "Комбинированный" }) },
    ],
    pricePresets: [
      { label: "Доступные", price: "до 5 000 ₽", href: frameHref(category, { priceMax: "5000" }) },
      { label: "Средний", price: "5 000 — 12 000 ₽", href: frameHref(category, { priceMin: "5000", priceMax: "12000" }) },
      { label: "Премиум", price: "12 000 — 25 000 ₽", href: frameHref(category, { priceMin: "12000", priceMax: "25000" }) },
      { label: "Премиум+", price: "от 25 000 ₽", href: frameHref(category, { priceMin: "25000" }) },
    ],
    tags: [
      { label: "Новинки", href: frameHref(category, { tag: "Новинки" }) },
      { label: "Хит сезона", href: frameHref(category, { tag: "Хит сезона" }) },
      { label: "Скидка", href: frameHref(category, { tag: "Скидка" }) },
      { label: "Винтаж", href: frameHref(category, { tag: "Винтаж" }) },
    ],
    featured: copy.featured,
    brandStrip: copy.brandStrip.map((brand) => ({
      label: brand,
      href: frameHref(category, { brand }),
    })),
    brandStripHref: menuHref(category, { expand: "brand" }),
  };
}

const FRAMES_MENU = buildFrameMega("opravy", {
  titleEmphasis: "Оправы.",
  title: "Выберите по форме, размеру и материалу",
  summary: "Формы, размеры и материалы",
  allLabel: "Смотреть все оправы",
  brandHrefLabel: "Оправы",
  brandStrip: [
    "O.D.L",
    "STEPPER",
    "SILHOUETTE",
    "POLAROID",
    "FURLA",
  ],
  featured: {
    eyebrow: "Сентябрьская подборка",
    title: "O.D.L. — собственный дизайн",
    description:
      "Ацетатные оправы, отточенный овал и мягкая посадка. Собираем коллекцию вокруг форм, которые выглядят дорого без лишнего шума.",
    imageSrc: "/Anselm - Oval.webp",
    imageAlt: "O.D.L. Anselm Oval",
    price: "от 8 900 ₽",
    ctaHref: "/catalog_s/opravy/odl-minimal/",
  },
});

const SUNGLASSES_MENU = buildFrameMega("solntsezashchitnye", {
  titleEmphasis: "Солнцезащитные.",
  title: "Форма, поляризация и летние коллекции",
  summary: "UV-защита и поляризация",
  allLabel: "Смотреть все солнцезащитные",
  brandHrefLabel: "Солнцезащитные",
  brandStrip: [
    "POLAROID",
    "RAY-BAN",
    "VOGUE",
    "GUESS",
    "DACKOR",
  ],
  featured: {
    eyebrow: "Редакция Optika 100%",
    title: "Лёгкие и прочные оправы",
    description:
      "Популярные модели из лёгких и надёжных материалов — для комфортной посадки каждый день. Не утяжеляют образ и хорошо подходят для активного ритма жизни.",
    imageSrc: "/categ_frames_v4.webp",
    imageAlt: "Подборка оправ",
    price: "от 5 500 ₽",
    ctaHref: "/catalog_s/opravy/?color=Черный",
  },
});

const CONTACT_MENU: ContactMegaMenu = {
  kind: "contact",
  allHref: catalogHref("kontaktnye-linzy"),
  allLabel: "Все линзы",
  titleEmphasis: "Контактные линзы.",
  title: "По режиму ношения, дизайну и силе",
  summary: "",
  contactModes: [
    {
      label: "Однодневные",
      meta: "Новые на каждый день",
      count: "142",
      href: menuHref("kontaktnye-linzy", { wearMode: "Однодневные" }),
      icon: <CalendarDays className="h-4 w-4" />,
    },
    {
      label: "Двухнедельные",
      meta: "Гибкий или дневной режим",
      count: "68",
      href: menuHref("kontaktnye-linzy", { wearMode: "Двухнедельные" }),
      icon: <CalendarClock className="h-4 w-4" />,
    },
    {
      label: "Месячные",
      meta: "Дневной режим с уходом",
      count: "96",
      href: menuHref("kontaktnye-linzy", { wearMode: "Месячные" }),
      icon: <CalendarRange className="h-4 w-4" />,
    },
    {
      label: "Квартальные",
      meta: "Долгий цикл, MPS-уход",
      count: "36",
      href: menuHref("kontaktnye-linzy", { wearMode: "Квартальные" }),
      icon: <CalendarRange className="h-4 w-4" />,
    },
  ],
  sphereValues: [
    { label: "−6.00", href: menuHref("kontaktnye-linzy", { sphere: "−6.00" }) },
    { label: "−4.00", href: menuHref("kontaktnye-linzy", { sphere: "−4.00" }) },
    { label: "−2.00", href: menuHref("kontaktnye-linzy", { sphere: "−2.00" }) },
    { label: "−1.00", href: menuHref("kontaktnye-linzy", { sphere: "−1.00" }) },
    { label: "0", href: menuHref("kontaktnye-linzy", { sphere: "0" }) },
    { label: "+1.00", href: menuHref("kontaktnye-linzy", { sphere: "+1.00" }) },
    { label: "+3.00", href: menuHref("kontaktnye-linzy", { sphere: "+3.00" }) },
  ],
  cylinder: [
    // Numeric values are cylinder dioptre — go in ?cylinder=. The free-text
    // "Своя ось" intentionally stays on ?axis= because that's the axis angle.
    { label: "−0.75", href: menuHref("kontaktnye-linzy", { cylinder: "−0.75" }) },
    { label: "−1.25", href: menuHref("kontaktnye-linzy", { cylinder: "−1.25" }) },
    { label: "−1.75", href: menuHref("kontaktnye-linzy", { cylinder: "−1.75" }) },
    { label: "−2.25", href: menuHref("kontaktnye-linzy", { cylinder: "−2.25" }) },
    { label: "Своя ось °", href: menuHref("kontaktnye-linzy", { axis: "custom" }) },
  ],
  addition: [
    { label: "Low", href: menuHref("kontaktnye-linzy", { addition: "Low" }) },
    { label: "Med", href: menuHref("kontaktnye-linzy", { addition: "Med" }) },
    { label: "High", href: menuHref("kontaktnye-linzy", { addition: "High" }) },
  ],
  bcValues: [
    { label: "8.4", href: menuHref("kontaktnye-linzy", { bc: "8.4", addition: "Low,Med,High" }) },
    { label: "8.6", href: menuHref("kontaktnye-linzy", { bc: "8.6", addition: "Low,Med,High" }) },
    { label: "8.7", href: menuHref("kontaktnye-linzy", { bc: "8.7", addition: "Low,Med,High" }) },
    { label: "9.0", href: menuHref("kontaktnye-linzy", { bc: "9.0", addition: "Low,Med,High" }) },
  ],
  // Дизайн — the only contact-lens "type" facet that actually maps to a
  // Bitrix property (DESIGN). The previous 6 chips (Для сухих глаз, UV-
  // защита, Гибридные, …) didn't correspond to any stored data.
  needs: [
    {
      label: "Сферические",
      count: "0",
      href: menuHref("kontaktnye-linzy", { design: "Сферические" }),
      icon: <Circle className="h-4 w-4" />,
    },
    {
      label: "Асферические",
      count: "0",
      href: menuHref("kontaktnye-linzy", { design: "Асферические" }),
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: "Торические",
      count: "0",
      href: menuHref("kontaktnye-linzy", { design: "Торические" }),
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ],
  brands: [
    { label: "Acuvue", count: "142 SKU", href: menuHref("kontaktnye-linzy", { brand: "Acuvue" }) },
    { label: "CooperVision", count: "96 SKU", href: menuHref("kontaktnye-linzy", { brand: "CooperVision" }) },
    { label: "Bausch+Lomb", count: "62 SKU", href: menuHref("kontaktnye-linzy", { brand: "Bausch+Lomb" }) },
    { label: "Alcon", count: "42 SKU", href: menuHref("kontaktnye-linzy", { brand: "Alcon" }) },
  ],
  helper: {
    title: "Подбор линз с офтальмологом",
    text: "Бесплатная примерка и подбор в салоне за 20 минут. Можно прийти с рецептом или пройти диагностику на месте.",
    primaryHref: "/kabinet-diagnostiki-spb",
    secondaryHref: "/contacts/",
  },
  utilities: [
    { label: "Подписка на линзы −15%", href: catalogHref("kontaktnye-linzy"), icon: <CalendarRange className="h-4 w-4" /> },
    { label: "Все растворы и уход", href: catalogHref("aksessuary"), icon: <Droplets className="h-4 w-4" /> },
    { label: "Доставка ко вторнику", href: "/payment/", icon: <Truck className="h-4 w-4" /> },
    { label: "Гид по подбору", href: "/podbor-ochkov/", icon: <BookOpen className="h-4 w-4" /> },
  ],
};

const GLASSES_MENU: GlassesMegaMenu = {
  kind: "glasses",
  allHref: catalogHref("linzy-dlya-ochkov"),
  allLabel: "Все линзы",
  titleEmphasis: "Линзы для очков.",
  title: "Тип, производитель, технологии",
  summary: "Производители и технологии",
  lensTypes: [
    {
      label: "Однофокальные",
      meta: "Одна оптическая зона",
      count: "41",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Однофокальные" }),
      icon: <LensTypeIcon kind="single" />,
    },
    {
      label: "Прогрессивные",
      meta: "Плавный переход даль↔близь",
      count: "15",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Прогрессивные" }),
      icon: <LensTypeIcon kind="progressive" />,
    },
    {
      label: "Офисные",
      meta: "До 4 м, для работы",
      count: "6",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Офисные" }),
      icon: <LensTypeIcon kind="office" />,
    },
    {
      label: "Perifocal",
      meta: "Контроль периферического дефокуса",
      count: "4",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Perifocal" }),
      icon: <LensTypeIcon kind="kids" />,
    },
  ],
  manufacturers: [
    { label: "ZEISS", meta: "Германия", tag: "Premium", href: menuHref("linzy-dlya-ochkov", { brand: "ZEISS (Германия)" }) },
    { label: "Essilor", meta: "Франция", tag: "Топ", href: menuHref("linzy-dlya-ochkov", { brand: "Ессилор (Франция)" }) },
    { label: "Hoya", meta: "Япония", tag: "Премиум", href: menuHref("linzy-dlya-ochkov", { brand: "Hoya (Япония)" }) },
  ],
  lightTransmissionValues: [
    { label: "Прозрачная", href: menuHref("linzy-dlya-ochkov", { lightTransmission: "Прозрачная" }) },
    { label: "Фотохромная", href: menuHref("linzy-dlya-ochkov", { lightTransmission: "Фотохромная" }) },
    { label: "Тонированная", href: menuHref("linzy-dlya-ochkov", { lightTransmission: "Тонированная" }) },
    { label: "Поляризованная", href: menuHref("linzy-dlya-ochkov", { lightTransmission: "Поляризованная" }) },
  ],
  materials: [],
  technologies: [
    { label: "FreeForm", href: menuHref("linzy-dlya-ochkov", { design: "FreeForm" }) },
    { label: "Асферический", href: menuHref("linzy-dlya-ochkov", { design: "Асферический" }) },
    { label: "Бифокальный", href: menuHref("linzy-dlya-ochkov", { design: "Бифокальный" }) },
    { label: "Индивидуальный", href: menuHref("linzy-dlya-ochkov", { design: "Индивидуальный" }) },
    { label: "Прогрессивный", href: menuHref("linzy-dlya-ochkov", { design: "Прогрессивный" }) },
    { label: "Сферический", href: menuHref("linzy-dlya-ochkov", { design: "Сферический" }) },
  ],
  purposes: [
    { label: "Для работы за ПК", count: "21", href: menuHref("linzy-dlya-ochkov", { purpose: "Для работы с гаджетами" }), icon: <Laptop className="h-4 w-4" /> },
    { label: "Для вождения", count: "3", href: menuHref("linzy-dlya-ochkov", { purpose: "Для вождения" }), icon: <Car className="h-4 w-4" /> },
    { label: "Для чтения и офиса", count: "6", href: menuHref("linzy-dlya-ochkov", { purpose: "Для чтения и работы на среднем расстоянии (компьютер)" }), icon: <BookOpen className="h-4 w-4" /> },
    { label: "Детские", count: "10", href: menuHref("linzy-dlya-ochkov", { purpose: "Детские линзы" }), icon: <Eye className="h-4 w-4" /> },
  ],
  rxHelper: {
    title: "Введите свой рецепт",
    ctaHref: "/podbor-ochkov/",
    fields: [
      { label: "Sph R", value: "−2.50" },
      { label: "Sph L", value: "−2.75" },
      { label: "Cyl R", value: "−0.75" },
      { label: "Cyl L", value: "—" },
    ],
  },
  utilities: [
    { label: "Установка линз в свою оправу", href: catalogHref("linzy-dlya-ochkov"), icon: <Glasses className="h-4 w-4" /> },
    { label: "Гид: индекс vs толщина", href: "/blog/linzy-dlya-ochkov/vidy-ochkovykh-linz", icon: <FileText className="h-4 w-4" /> },
    { label: "Срок изготовления 3–5 дней", href: "/payment/", icon: <Truck className="h-4 w-4" /> },
    { label: "Кабинет диагностики", href: "/kabinet-diagnostiki-spb", icon: <BookOpen className="h-4 w-4" /> },
  ],
  featured: {
    eyebrow: "Stellest · контроль миопии",
    title: "Линзы Essilor® Stellest®",
    description:
      "Замедляют прогрессирование миопии у детей на 67%. Технология H.A.L.T. с 1021 микролинзой.",
    imageSrc: "/stellest/hero-child-stellest.webp",
    imageAlt: "Линзы Stellest для контроля миопии",
    price: "от 21 900 ₽",
    ctaHref: menuHref("linzy-dlya-ochkov", { technology: "STELLEST" }),
    ctaLabel: "Подробнее",
  },
};


// Canonical Bitrix section paths (1:1 URL parity with optika100.com):
//   soputstvuyushchie_tovary/aksessuary/   → "Для контактных линз" group
//   soputstvuyushchie_tovary/dlya_ochkov/  → "Для очков" group
const ACC = "/catalog_s/soputstvuyushchie_tovary";
const accSection = (parent: string, code: string) => `${ACC}/${parent}/${code}/`;

const ACCESSORIES_MENU: AccessoriesMegaMenu = {
  kind: "accessories",
  allHref: catalogHref("aksessuary"),
  allLabel: "Все аксессуары",
  titleEmphasis: "Аксессуары.",
  title: "Уход, хранение и ремонт",
  summary: "Растворы, салфетки, цепочки",
  groups: [
    {
      title: "Для контактных линз",
      allHref: `${ACC}/aksessuary/`,
      items: [
        { label: "Для контактных линз — все", href: `${ACC}/aksessuary/`, icon: <Eye className="h-4 w-4" /> },
        { label: "Очистители и капли", href: accSection("aksessuary", "ochistiteli_i_kapli"), icon: <Droplets className="h-4 w-4" /> },
        { label: "Растворы", href: accSection("aksessuary", "rastvory"), icon: <Droplets className="h-4 w-4" /> },
      ],
    },
    {
      title: "Для очков",
      allHref: `${ACC}/dlya_ochkov/`,
      items: [
        { label: "Для очков — все", href: `${ACC}/dlya_ochkov/`, icon: <Glasses className="h-4 w-4" /> },
        { label: "Окклюдеры", href: accSection("dlya_ochkov", "okkllyudery"), icon: <ShieldCheck className="h-4 w-4" /> },
        { label: "Салфетки", href: accSection("dlya_ochkov", "salfetki"), icon: <Layers className="h-4 w-4" /> },
        { label: "Стопперы", href: accSection("dlya_ochkov", "stoper"), icon: <Circle className="h-4 w-4" /> },
        { label: "Цепочки/шнурки", href: accSection("dlya_ochkov", "tsepochki"), icon: <Palette className="h-4 w-4" /> },
      ],
    },
  ],
  utilities: [
    { label: "Все средства ухода", href: catalogHref("aksessuary"), icon: <Droplets className="h-4 w-4" /> },
    { label: "Ремонт очков", href: "/remont-ochkov/", icon: <Glasses className="h-4 w-4" /> },
    { label: "Доставка по СПб от 1 дня", href: "/payment/", icon: <Truck className="h-4 w-4" /> },
    { label: "Гид по уходу за линзами", href: "/blog/kontaktnye-linzy/", icon: <BookOpen className="h-4 w-4" /> },
  ],
  promoChips: [
    { label: "Растворы от 290 ₽", href: accSection("aksessuary", "rastvory") },
    { label: "Салфетки от 90 ₽", href: accSection("dlya_ochkov", "salfetki") },
    { label: "Цепочки от 450 ₽", href: accSection("dlya_ochkov", "tsepochki") },
    { label: "Окклюдеры", href: accSection("dlya_ochkov", "okkllyudery") },
  ],
  featured: {
    eyebrow: "Акция · −20%",
    title: "−20% на вторую пару",
    description: "Для Вас и Ваших близких",
    imageSrc: "/2_banner.webp",
    imageAlt: "Акция: −20% на вторую пару",
    meta: "Реферальная программа · 6 месяцев",
    note: "Скидка на повторный заказ очков по номеру вашего заказа доступна для вас или ваших близких.",
  },
};


export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { label: "Оправы", href: catalogHref("opravy"), mega: FRAMES_MENU },
  { label: "Солнцезащитные", href: catalogHref("solntsezashchitnye"), mega: SUNGLASSES_MENU },
  { label: "Контактные линзы", href: catalogHref("kontaktnye-linzy"), mega: CONTACT_MENU },
  { label: "Линзы для очков", href: catalogHref("linzy-dlya-ochkov"), mega: GLASSES_MENU },
  { label: "Аксессуары", href: catalogHref("aksessuary"), mega: ACCESSORIES_MENU },
  { label: "Услуги", href: "/#services" },
  { label: "Салоны", href: "/contacts/" },
];

export function isMegaNavItem(item: HeaderNavItem): item is HeaderNavItem & { mega: HeaderMegaMenu } {
  return Boolean(item.mega);
}

function FramesMegaPanel({ menu }: { menu: FramesMegaMenu }) {
  const city = useCityStore((state) => state.city);

  return (
    <div className={panelShellClass}>
      <div className="bg-white">
        <div className="px-5 py-6 lg:px-6 xl:px-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#ece7df] pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-end gap-3">
                <h2 className="font-serif text-[26px] leading-none tracking-[-0.02em] text-foreground xl:text-[30px]">
                  <span className="mr-1 text-brand">{menu.titleEmphasis}</span>
                  {menu.title}
                </h2>
                <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  {menu.summary}
                </span>
              </div>
            </div>

            <a
              href={regionalMenuHref(menu.allHref, city)}
              className="inline-flex items-center gap-2 self-start rounded-full border border-foreground px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {menu.allLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.38fr_1fr_1fr_0.92fr]">
            <section>
              {sectionHeader("Форма", "Все формы", regionalMenuHref(expandHref(menu.allHref, "shape"), city))}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {menu.shapes.map((item) => (
                  <a
                    key={item.label}
                    href={regionalMenuHref(item.href, city)}
                    className="group relative flex aspect-[1/0.82] flex-col items-center justify-between rounded-[14px] border border-[#ece7df] bg-white px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand"
                  >
                    <span className="mt-2 flex w-full items-center justify-center">{item.icon}</span>
                    <span className="text-[11.5px] font-medium leading-tight text-foreground transition-colors group-hover:text-brand">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section>
              {sectionHeader("Пол / возраст", "Все", regionalMenuHref(expandHref(menu.allHref, "gender"), city))}
              <div className="grid grid-cols-2 gap-1.5">
                {menu.demographics.map((item) => (
                  <a
                    key={item.label}
                    href={regionalMenuHref(item.href, city)}
                    className={cn(
                      "group flex items-center gap-2 rounded-[14px] border border-[#ece7df] bg-white px-2.5 py-[9px] text-[12.5px] transition-colors hover:border-brand hover:text-brand",
                      item.wide && "col-span-2",
                    )}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
              </div>

              <div className="mt-3 border-t border-dashed border-border pt-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    {AudienceIcons.kidsTitle}
                    Детские
                  </span>
                  <a
                    href={regionalMenuHref(menu.kidsGroup.href, city)}
                    className={sectionActionClass}
                  >
                    Все
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex flex-col gap-1.5">
                  {menu.kidsGroup.items.map((item) => (
                    <a
                      key={item.label}
                      href={regionalMenuHref(item.href, city)}
                      className="group grid grid-cols-[32px_1fr_auto] items-center gap-2.5 rounded-[14px] border border-[#ece7df] bg-white px-3 py-2 transition-colors hover:border-brand hover:bg-brand-50"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ece7df] bg-[var(--cream)]">
                        {item.icon}
                      </span>
                      <span className="min-w-0 leading-[1.15]">
                        <span className="block text-[12.5px] font-medium text-foreground">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[10.5px] text-muted-foreground">
                          {item.meta}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-dashed border-border pt-4">
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Конструкция
                </div>
                <div className="space-y-1">
                  {menu.construction.map((item) => (
                    <a
                      key={item.label}
                      href={regionalMenuHref(item.href, city)}
                      className="group flex items-center gap-3 rounded-[12px] px-1 py-2 text-[13.5px] text-foreground transition-colors hover:text-brand"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-brand" />
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section>
              {sectionHeader("Материал", "Все", regionalMenuHref(expandHref(menu.allHref, "material"), city))}
              <div className="flex flex-wrap gap-2">
                {menu.materials.map((item) => (
                  <a key={item.label} href={regionalMenuHref(item.href, city)} className={chipClass}>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>

              <div className="mt-5 border-t border-dashed border-border pt-4">
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Цена
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {menu.pricePresets.map((preset) => (
                    <a
                      key={preset.label}
                      href={regionalMenuHref(preset.href, city)}
                      className="rounded-[12px] border border-[#ece7df] bg-white px-3 py-2 text-left transition-colors hover:border-brand hover:bg-brand-50"
                    >
                      <strong className="block text-[12px] font-semibold text-foreground">{preset.label}</strong>
                      <span className="mt-1 block font-mono text-[11px] text-muted-foreground">{preset.price}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-dashed border-border pt-4">
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Тег коллекции
                </div>
                <div className="flex flex-wrap gap-2">
                  {menu.tags.map((item) => (
                    <a key={item.label} href={regionalMenuHref(item.href, city)} className={chipClass}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <aside
              className={cn(
                surfaceCardClass,
                "flex flex-col gap-4 bg-[var(--cream)] p-4 lg:col-span-2 xl:col-span-1 xl:h-full",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                {menu.featured.eyebrow}
              </span>
              <h3 className="font-serif text-[20px] leading-tight text-foreground">{menu.featured.title}</h3>
              <div className="overflow-hidden rounded-[14px] border border-[#e8dfd4] bg-white">
                <img
                  src={menu.featured.imageSrc}
                  alt={menu.featured.imageAlt}
                  className="h-44 w-full object-cover"
                />
              </div>
              <p className="text-[12.5px] leading-6 text-muted-foreground">{menu.featured.description}</p>
              <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3">
                <span className="font-serif text-[22px] leading-none text-foreground">{menu.featured.price}</span>
                <a
                  href={regionalMenuHref(menu.featured.ctaHref, city)}
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand transition-colors hover:text-brand/80"
                >
                  К коллекции
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </aside>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[#ece7df] pt-5 lg:flex-row lg:items-center">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              Бренды
            </span>
            <div className="flex flex-1 flex-wrap gap-2">
              {menu.brandStrip.map((item, index) => (
                <a
                  key={item.label}
                  href={regionalMenuHref(item.href, city)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-[12.5px] transition-colors",
                    index === 0
                      ? "border-ink bg-ink text-white hover:opacity-90"
                      : "border-[#ece7df] bg-white text-foreground hover:border-brand hover:text-brand",
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <a href={regionalMenuHref(menu.brandStripHref, city)} className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-brand">
              Все бренды →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactMegaPanel({ menu }: { menu: ContactMegaMenu }) {
  const city = useCityStore((state) => state.city);
  const [appointmentOpen, setAppointmentOpen] = useState(false);

  return (
    <div className={panelShellClass}>
      <div className="bg-white">
        <div className="px-5 py-6 lg:px-6 xl:px-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#ece7df] pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <h2 className="font-serif text-[26px] leading-none tracking-[-0.02em] text-foreground xl:text-[30px]">
                <span className="mr-1 text-brand">{menu.titleEmphasis}</span>
                {menu.title}
              </h2>
              <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {menu.summary}
              </span>
            </div>

            <a
              href={regionalMenuHref(menu.allHref, city)}
              className="inline-flex items-center gap-2 self-start rounded-full border border-foreground px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {menu.allLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.16fr_1.04fr_1fr_0.9fr]">
            <section>
              {sectionHeader("Режим / замена", "Все", regionalMenuHref(expandHref(menu.allHref, "wearMode"), city))}
              <div className="space-y-2">
                {menu.contactModes.map((item) => (
                  <a
                    key={item.label}
                    href={regionalMenuHref(item.href, city)}
                    className="group flex items-center gap-3 rounded-[16px] border border-[#ece7df] bg-white px-3 py-3 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8dfd4] bg-[var(--cream)] text-brand">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium text-foreground">{item.label}</span>
                      <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{item.meta}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section>
              {sectionHeader("Параметры", "Все параметры", regionalMenuHref(expandHref(menu.allHref, "sphere"), city))}
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className={sectionNameClass}>Сфера</span>
                    <span className="text-[11px] text-muted-foreground">D, диоптрии</span>
                  </div>
                  <div className="overflow-hidden rounded-[12px] border border-[#ece7df]">
                    <div className="grid grid-cols-7">
                      {menu.sphereValues.map((item, index) => (
                        <a
                          key={item.label}
                          href={regionalMenuHref(item.href, city)}
                          className={cn(
                            "border-r border-[#ece7df] px-2 py-2 text-center font-mono text-[11.5px] text-foreground transition-colors hover:bg-brand-50 hover:text-brand",
                            index === menu.sphereValues.length - 1 && "border-r-0",
                            item.label === "0" && "text-muted-foreground",
                          )}
                        >
                          {formatSphereLabel(item.label)}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className={sectionNameClass}>Цилиндр / ось</span>
                    <span className="text-[11px] text-muted-foreground">для астигматизма</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {menu.cylinder.map((item) => (
                      <a key={item.label} href={regionalMenuHref(item.href, city)} className={chipClass}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <span className={sectionNameClass}>Аддидация</span>
                    <span className="text-[11px] text-muted-foreground">мультифокальные</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {menu.addition.map((item) => (
                      <a key={item.label} href={regionalMenuHref(item.href, city)} className={chipClass}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2">
                    <span className={sectionNameClass}>Радиус кривизны (BC)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {menu.bcValues.map((item) => (
                      <a key={item.label} href={regionalMenuHref(item.href, city)} className={chipClass}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              {sectionHeader("Дизайн", "Все", regionalMenuHref(expandHref(menu.allHref, "design"), city))}
              <div className="grid grid-cols-2 gap-2">
                {menu.needs.map((item) => (
                  <a
                    key={item.label}
                    href={regionalMenuHref(item.href, city)}
                    className="group rounded-[14px] border border-[#ece7df] bg-white p-3 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-brand">{item.icon}</span>
                    </div>
                    <span className="text-[12.5px] font-medium leading-tight text-foreground transition-colors group-hover:text-brand">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-5 border-t border-dashed border-border pt-4">
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Бренд
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {menu.brands.map((item) => (
                    <a
                      key={item.label}
                      href={regionalMenuHref(item.href, city)}
                      className="rounded-[14px] border border-[#ece7df] bg-white px-3 py-3 transition-colors hover:border-brand hover:bg-brand-50"
                    >
                      <span className="block text-[13px] font-semibold text-foreground">{item.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <aside className="rounded-[20px] bg-ink p-4 text-white shadow-[0_8px_24px_rgba(18,18,18,0.2)] lg:col-span-2 xl:col-span-1">
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90">
                Не знаете параметры?
              </span>
              <h3 className="mt-4 font-serif text-[22px] leading-tight text-white">{menu.helper.title}</h3>
              <p className="mt-3 text-[13px] leading-6 text-white/70">{menu.helper.text}</p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => setAppointmentOpen(true)}
                  className="inline-flex w-full items-center justify-between rounded-full bg-brand px-4 py-3 text-[12.5px] font-semibold text-brand-foreground transition-opacity hover:opacity-90"
                >
                  Записаться в салон
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href={regionalMenuHref(menu.helper.secondaryHref, city)}
                  className="inline-flex w-full items-center justify-between rounded-full border border-white/20 px-4 py-3 text-[12.5px] font-medium text-white transition-colors hover:bg-white/10"
                >
                  Загрузить рецепт
                  <Upload className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </div>

          <div className="mt-6 grid gap-3 border-t border-[#ece7df] pt-4 md:grid-cols-2 xl:grid-cols-4">
            {menu.utilities.map((item) => (
              <a
                key={item.label}
                href={regionalMenuHref(item.href, city)}
                className="inline-flex items-center gap-2 rounded-[14px] border border-[#ece7df] bg-[#fbfaf7] px-3 py-3 text-[12.5px] text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </div>
  );
}

function GlassesMegaPanel({ menu }: { menu: GlassesMegaMenu }) {
  const city = useCityStore((state) => state.city);

  return (
    <div className={panelShellClass}>
      <div className="bg-white">
        <div className="px-5 py-6 lg:px-6 xl:px-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#ece7df] pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <h2 className="font-serif text-[26px] leading-none tracking-[-0.02em] text-foreground xl:text-[30px]">
                <span className="mr-1 text-brand">{menu.titleEmphasis}</span>
                {menu.title}
              </h2>
              <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {menu.summary}
              </span>
            </div>

            <a
              href={regionalMenuHref(menu.allHref, city)}
              className="inline-flex items-center gap-2 self-start rounded-full border border-foreground px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {menu.allLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1fr_0.95fr_1fr_0.95fr_0.85fr]">
            <section>
              {sectionHeader("Тип линзы", "Все", regionalMenuHref(expandHref(menu.allHref, "lensType"), city))}
              <div className="space-y-1">
                {menu.lensTypes.map((item) => (
                  <a
                    key={item.label}
                    href={regionalMenuHref(item.href, city)}
                    className="group flex items-center gap-3 rounded-[14px] px-2 py-2 transition-colors hover:bg-brand-50"
                  >
                    {item.icon}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium text-foreground group-hover:text-brand">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{item.meta}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section>
              {sectionHeader("Производитель", "Все", regionalMenuHref(expandHref(menu.allHref, "brand"), city))}
              <div className="space-y-2">
                {menu.manufacturers.map((item) => (
                  <a
                    key={item.label}
                    href={regionalMenuHref(item.href, city)}
                    className="flex items-center justify-between rounded-[14px] border border-[#ece7df] bg-white px-3 py-3 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <span>
                      <span className="block text-[13px] font-semibold text-foreground">{item.label}</span>
                      <span className="mt-1 block text-[11px] text-muted-foreground">{item.meta}</span>
                    </span>
                    {item.tag && (
                      <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
                        {item.tag}
                      </span>
                    )}
                  </a>
                ))}
              </div>

              <div className="mt-5 border-t border-dashed border-border pt-4">
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Светопропускание
                </div>
                <div className="flex flex-wrap gap-2">
                  {menu.lightTransmissionValues.map((item) => (
                    <a key={item.label} href={regionalMenuHref(item.href, city)} className={chipClass}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              {menu.materials.length > 0 && (
                <div className="mt-5 border-t border-dashed border-border pt-4">
                  <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                    Материал
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {menu.materials.map((item) => (
                      <a key={item.label} href={regionalMenuHref(item.href, city)} className={chipClass}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section>
              {sectionHeader("Дизайн линзы", "Все", regionalMenuHref(expandHref(menu.allHref, "design"), city))}
              <div className="grid grid-cols-2 gap-2">
                {menu.technologies.map((item) => (
                  <a
                    key={item.label}
                    href={regionalMenuHref(item.href, city)}
                    className="group flex min-h-12 items-center rounded-[14px] border border-[#ece7df] bg-white px-3 py-2.5 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <span className="block max-w-full break-words text-[12px] font-medium leading-snug text-foreground transition-colors group-hover:text-brand">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>

            </section>

            <section>
              {sectionHeader("Назначение", "Все", regionalMenuHref(expandHref(menu.allHref, "purpose"), city))}
              <div className="space-y-2">
                {menu.purposes.map((item) => (
                  <a
                    key={item.label}
                    href={regionalMenuHref(item.href, city)}
                    className="group flex items-center gap-3 rounded-[14px] border border-[#ece7df] bg-white px-3 py-3 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <span className="text-brand">{item.icon}</span>
                    <span className="flex-1 text-[12.5px] font-medium text-foreground transition-colors group-hover:text-brand">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>

              <div className={cn(surfaceCardClass, "mt-5 p-4")}>
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
                  Подбор по рецепту
                </span>
                <h3 className="mt-2 font-serif text-[17px] leading-tight text-foreground">{menu.rxHelper.title}</h3>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {menu.rxHelper.fields.map((field) => (
                    <div key={field.label} className="rounded-[12px] border border-[#ece7df] bg-[#fbfaf7] px-3 py-2">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {field.label}
                      </span>
                      <span className="mt-1 block text-[13px] font-medium text-foreground">{field.value}</span>
                    </div>
                  ))}
                </div>
                <a
                  href={regionalMenuHref(menu.rxHelper.ctaHref, city)}
                  className="mt-4 inline-flex w-full items-center justify-between rounded-full bg-brand px-4 py-3 text-[12.5px] font-semibold text-brand-foreground transition-opacity hover:opacity-90"
                >
                  Подобрать линзы
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </section>

            <aside
              className={cn(
                surfaceCardClass,
                "flex flex-col gap-4 bg-[var(--cream)] p-4 lg:col-span-2 xl:col-span-1 xl:h-full",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                {menu.featured.eyebrow}
              </span>
              <h3 className="font-serif text-[20px] leading-tight text-foreground">{menu.featured.title}</h3>
              <div className="overflow-hidden rounded-[14px] border border-[#e8dfd4] bg-white">
                <img
                  src={menu.featured.imageSrc}
                  alt={menu.featured.imageAlt}
                  className="h-44 w-full object-cover"
                />
              </div>
              <p className="text-[12.5px] leading-6 text-muted-foreground">{menu.featured.description}</p>
              {menu.featured.meta && (
                <span className="inline-flex max-w-full rounded-full border border-[#e4dbcf] bg-white px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand">
                  {menu.featured.meta}
                </span>
              )}
              {menu.featured.note && (
                <p className="text-[12px] leading-5 text-muted-foreground">{menu.featured.note}</p>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3">
                {menu.featured.price && (
                  <span className="font-serif text-[20px] leading-none text-foreground">
                    {menu.featured.price}
                  </span>
                )}
                {menu.featured.ctaHref && (
                  <a
                    href={regionalMenuHref(menu.featured.ctaHref, city)}
                    className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-brand transition-colors hover:text-brand/80"
                  >
                    {menu.featured.ctaLabel ?? "Перейти"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </aside>
          </div>


          <div className="mt-6 grid gap-3 border-t border-[#ece7df] pt-4 md:grid-cols-2 xl:grid-cols-4">
            {menu.utilities.map((item) => (
              <a
                key={item.label}
                href={regionalMenuHref(item.href, city)}
                className="inline-flex items-center gap-2 rounded-[14px] border border-[#ece7df] bg-[#fbfaf7] px-3 py-3 text-[12.5px] text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessoriesMegaPanel({ menu }: { menu: AccessoriesMegaMenu }) {
  const city = useCityStore((state) => state.city);

  return (
    <div className={panelShellClass}>
      <div className="bg-white">
        <div className="px-5 py-6 lg:px-6 xl:px-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#ece7df] pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-wrap items-end gap-3">
              <h2 className="font-serif text-[26px] leading-none tracking-[-0.02em] text-foreground xl:text-[30px]">
                <span className="mr-1 text-brand">{menu.titleEmphasis}</span>
                {menu.title}
              </h2>
              <span className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {menu.summary}
              </span>
            </div>

            <a
              href={regionalMenuHref(menu.allHref, city)}
              className="inline-flex items-center gap-2 self-start rounded-full border border-foreground px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {menu.allLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr]">
            {menu.groups.map((group) => (
              <section key={group.title}>
                {sectionHeader(group.title, "Все", regionalMenuHref(group.allHref, city))}
                <div className="space-y-1.5">
                  {group.items.map((item) => (
                    <a
                      key={item.label}
                      href={regionalMenuHref(item.href, city)}
                      className="group grid grid-cols-[32px_1fr_auto] items-center gap-2.5 rounded-[12px] border border-[#ece7df] bg-white px-3 py-2.5 text-[13.5px] text-foreground transition-colors hover:border-brand hover:bg-brand-50"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ece7df] bg-[var(--cream)] text-brand">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.label}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-brand" />
                    </a>
                  ))}
                </div>

                {group.title === "Для очков" && menu.promoChips.length > 0 && (
                  <div className="mt-5 border-t border-dashed border-border pt-4">
                    <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      Популярное
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {menu.promoChips.map((chip) => (
                        <a key={chip.label} href={regionalMenuHref(chip.href, city)} className={chipClass}>
                          {chip.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}

            <aside
              className={cn(
                surfaceCardClass,
                "flex flex-col gap-4 bg-[var(--cream)] p-4 lg:col-span-2 xl:col-span-1",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
                {menu.featured.eyebrow}
              </span>
              <h3 className="font-serif text-[20px] leading-tight text-foreground">{menu.featured.title}</h3>
              <div className="overflow-hidden rounded-[14px] border border-[#e8dfd4] bg-white">
                <img
                  src={menu.featured.imageSrc}
                  alt={menu.featured.imageAlt}
                  className="h-40 w-full object-cover"
                />
              </div>
              <p className="text-[12.5px] leading-6 text-muted-foreground">{menu.featured.description}</p>
              {menu.featured.meta && (
                <span className="inline-flex max-w-full rounded-full border border-[#e4dbcf] bg-white px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand">
                  {menu.featured.meta}
                </span>
              )}
              {menu.featured.note && (
                <p className="text-[12px] leading-5 text-muted-foreground">{menu.featured.note}</p>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-3">
                {menu.featured.price && (
                  <span className="font-serif text-[20px] leading-none text-foreground">
                    {menu.featured.price}
                  </span>
                )}
                {menu.featured.ctaHref && (
                  <a
                    href={regionalMenuHref(menu.featured.ctaHref, city)}
                    className="ml-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-brand transition-colors hover:text-brand/80"
                  >
                    {menu.featured.ctaLabel ?? "Перейти"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </aside>
          </div>


          <div className="mt-6 grid gap-3 border-t border-[#ece7df] pt-4 md:grid-cols-2 xl:grid-cols-4">
            {menu.utilities.map((item) => (
              <a
                key={item.label}
                href={regionalMenuHref(item.href, city)}
                className="inline-flex items-center gap-2 rounded-[14px] border border-[#ece7df] bg-[#fbfaf7] px-3 py-3 text-[12.5px] text-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderMegaPanel({ menu }: { menu: HeaderMegaMenu }) {
  if (menu.kind === "frames") return <FramesMegaPanel menu={menu} />;
  if (menu.kind === "contact") return <ContactMegaPanel menu={menu} />;
  if (menu.kind === "accessories") return <AccessoriesMegaPanel menu={menu} />;
  return <GlassesMegaPanel menu={menu} />;
}
