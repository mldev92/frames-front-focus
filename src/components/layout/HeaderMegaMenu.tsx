import type { ReactNode } from "react";
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
  Users,
} from "lucide-react";
import { GenderIcon } from "@/components/ui/GenderIcon";
import { catalogHref } from "@/data/categories";
import { cn } from "@/lib/utils";

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
  demographics: CardLink[];
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

type GlassesMegaMenu = {
  kind: "glasses";
  allHref: string;
  allLabel: string;
  lensTypes: CardLink[];
  manufacturers: CardLink[];
  indexValues: CountChip[];
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
  coatingValues: CountChip[];
  utilities: UtilityLink[];
};

export type HeaderMegaMenu = FramesMegaMenu | ContactMegaMenu | GlassesMegaMenu;

export interface HeaderNavItem {
  href: string;
  label: string;
  mega?: HeaderMegaMenu;
}

const menuHref = (category: Parameters<typeof catalogHref>[0], params?: Record<string, string>) => {
  const href = catalogHref(category);
  if (!params) return href;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }

  const query = search.toString();
  return query ? `${href}?${query}` : href;
};

const frameHref = (category: FrameCategory, params?: Record<string, string>) => menuHref(category, params);

const panelShellClass =
  "overflow-hidden rounded-b-[28px] border border-[#e7e2db] bg-white shadow-[0_12px_30px_rgba(33,24,18,0.08),0_28px_80px_rgba(33,24,18,0.10)]";
const surfaceCardClass =
  "rounded-[18px] border border-[#ece7df] bg-white shadow-[0_1px_2px_rgba(33,24,18,0.04),0_8px_24px_rgba(33,24,18,0.05)]";
const sectionNameClass =
  "font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground";
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

function sectionHeader(name: string, action: string) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-[#ece7df] pb-2">
      <span className={sectionNameClass}>{name}</span>
      <span className="text-[11.5px] text-muted-foreground transition-colors hover:text-brand">{action}</span>
    </div>
  );
}

function buildFrameMega(category: FrameCategory, copy: {
  allLabel: string;
  brandHrefLabel: string;
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
        count: "214",
        href: frameHref(category, { shape: "Прямоугольные" }),
        icon: frameShapeAssetIcon("/rectangle.webp", "Прямоугольные"),
      },
      {
        label: "Квадратные",
        count: "186",
        href: frameHref(category, { shape: "Квадратные" }),
        icon: frameShapeAssetIcon("/square.webp", "Квадратные"),
      },
      {
        label: "Овальные",
        count: "142",
        href: frameHref(category, { shape: "Овальные" }),
        icon: frameShapeAssetIcon("/Anselm - Oval.webp", "Овальные"),
      },
      {
        label: "Круглые",
        count: "98",
        href: frameHref(category, { shape: "Круглые" }),
        icon: frameShapeAssetIcon("/round.webp", "Круглые"),
      },
      {
        label: "Авиаторы",
        count: "76",
        href: frameHref(category, { shape: "Авиаторы" }),
        icon: frameShapeAssetIcon("/aviator.webp", "Авиаторы"),
      },
      {
        label: "Клабмастер",
        count: "64",
        href: frameHref(category, { shape: "Клабмастер" }),
        icon: frameShapeAssetIcon("/clubman_shape.webp", "Клабмастер", 1.3),
      },
      {
        label: "Бабочка",
        count: "52",
        href: frameHref(category, { shape: "Бабочка" }),
        icon: frameShapeAssetIcon("/buterfly_shape.webp", "Бабочка"),
      },
      {
        label: "Геометрия",
        count: "48",
        href: frameHref(category, { shape: "Геометрические" }),
        icon: frameShapeAssetIcon("/Geometric.webp", "Геометрические"),
      },
      {
        label: "Маска",
        count: "36",
        href: frameHref(category, { shape: "Маска" }),
        icon: frameShapeAssetIcon("/mask_shape.webp", "Маска", 1.3),
      },
      {
        label: "Спорт",
        count: "29",
        href: frameHref(category, { shape: "Спорт" }),
        icon: frameShapeAssetIcon("/sport_shape.webp", "Спорт", 1.3),
      },
      {
        label: "Трапеция",
        count: "22",
        href: frameHref(category, { shape: "Трапеция" }),
        icon: frameShapeAssetIcon("/trapec_shape.webp", "Трапеция", 1.3),
      },
      {
        label: "Лектор",
        count: "18",
        href: frameHref(category, { shape: "Лектор" }),
        icon: frameShapeAssetIcon("/lector_shape_.webp", "Лектор"),
      },
    ],
    demographics: [
      {
        label: "Мужские",
        count: "412",
        href: frameHref(category, { gender: "Мужские" }),
        icon: <GenderIcon kind="male" className="h-4 w-4" />,
      },
      {
        label: "Женские",
        count: "488",
        href: frameHref(category, { gender: "Женские" }),
        icon: <GenderIcon kind="female" className="h-4 w-4" />,
      },
      {
        label: "Унисекс",
        count: "204",
        href: frameHref(category, { gender: "Унисекс" }),
        icon: <Users className="h-4 w-4 stroke-[1.8]" />,
      },
      {
        label: "Детские",
        count: "180",
        href: frameHref(category, { gender: "Детские" }),
        icon: <GenderIcon kind="boy" className="h-4 w-4" />,
      },
    ],
    construction: [
      {
        label: "Ободковые",
        count: "684",
        href: frameHref(category, { construction: "Ободковые" }),
        icon: frameConstructionAssetIcon("/obodkovaea.png", "Ободковые"),
      },
      {
        label: "Безободковые",
        count: "142",
        href: frameHref(category, { construction: "Безободковые" }),
        icon: frameConstructionAssetIcon("/bezobodkovaea.png", "Безободковые"),
      },
      {
        label: "Полуободковые",
        count: "96",
        href: frameHref(category, { construction: "Полуободковые" }),
        icon: frameConstructionAssetIcon("/poluobodkovaea.png", "Полуободковые"),
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
      { label: "Пластик", count: "196", href: frameHref(category, { material: "Пластик" }) },
      { label: "TR-90", count: "142", href: frameHref(category, { material: "TR-90" }) },
      { label: "Нейлон", count: "88", href: frameHref(category, { material: "Нейлон" }) },
      { label: "Pebax", count: "42", href: frameHref(category, { material: "Pebax" }) },
      { label: "Комбинированный", count: "186", href: frameHref(category, { material: "Комбинированный" }) },
    ],
    pricePresets: [
      { label: "Доступные", price: "до 5 000 ₽", href: frameHref(category, { priceTo: "5000" }) },
      { label: "Средний", price: "5 000 — 12 000 ₽", href: frameHref(category, { priceFrom: "5000", priceTo: "12000" }) },
      { label: "Премиум", price: "12 000 — 25 000 ₽", href: frameHref(category, { priceFrom: "12000", priceTo: "25000" }) },
      { label: "Дизайнерские", price: "от 25 000 ₽", href: frameHref(category, { priceFrom: "25000" }) },
    ],
    tags: [
      { label: "Новинки", href: frameHref(category, { tag: "Новинки" }) },
      { label: "Хит сезона", href: frameHref(category, { tag: "Хит сезона" }) },
      { label: "Скидка", href: frameHref(category, { tag: "Скидка" }) },
      { label: "Винтаж", href: frameHref(category, { tag: "Винтаж" }) },
    ],
    featured: copy.featured,
    brandStrip: [
      { label: "O.D.L.", href: frameHref(category, { brand: "O.D.L." }) },
      { label: "Lionsheart", href: frameHref(category, { brand: "Lionsheart" }) },
      { label: "Stepper", href: frameHref(category, { brand: "Stepper" }) },
      { label: "Silhouette", href: frameHref(category, { brand: "Silhouette" }) },
      { label: "Polaroid", href: frameHref(category, { brand: "Polaroid" }) },
      { label: "Furla", href: frameHref(category, { brand: "Furla" }) },
      { label: "Guess", href: frameHref(category, { brand: "Guess" }) },
      { label: "Safilo", href: frameHref(category, { brand: "Safilo" }) },
      { label: "Okula", href: frameHref(category, { brand: "Okula" }) },
      { label: "Juniorlook", href: frameHref(category, { brand: "Juniorlook" }) },
      { label: "Fisher-Price", href: frameHref(category, { brand: "Fisher-Price" }) },
    ],
    brandStripHref: frameHref(category, { brandGroup: copy.brandHrefLabel }),
  };
}

const FRAMES_MENU = buildFrameMega("opravy", {
  titleEmphasis: "Оправы.",
  title: "Выберите по форме, размеру и материалу",
  summary: "1284 модели · 11 брендов",
  allLabel: "Смотреть все оправы",
  brandHrefLabel: "Оправы",
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
  summary: "846 моделей · UV-защита · 9 брендов",
  allLabel: "Смотреть все солнцезащитные",
  brandHrefLabel: "Солнцезащитные",
  featured: {
    eyebrow: "Редакция Optika 100%",
    title: "Лёгкие формы на каждый день",
    description:
      "Поляризация, мягкие линзы и универсальные формы для города, отпуска и вождения. Сборка подборки без перегруженных логотипов.",
    imageSrc: "/categ_sunglasses_v4.png",
    imageAlt: "Подборка солнцезащитных очков",
    price: "от 6 900 ₽",
    ctaHref: "/catalog_s/solntsezashchitnye_ochki/",
  },
});

const CONTACT_MENU: ContactMegaMenu = {
  kind: "contact",
  allHref: catalogHref("kontaktnye-linzy"),
  allLabel: "Все линзы",
  titleEmphasis: "Контактные линзы.",
  title: "По режиму ношения, силе и особенностям",
  summary: "342 SKU · 4 бренда",
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
    { label: "−0.75", href: menuHref("kontaktnye-linzy", { axis: "−0.75" }) },
    { label: "−1.25", href: menuHref("kontaktnye-linzy", { axis: "−1.25" }) },
    { label: "−1.75", href: menuHref("kontaktnye-linzy", { axis: "−1.75" }) },
    { label: "−2.25", href: menuHref("kontaktnye-linzy", { axis: "−2.25" }) },
    { label: "Своя ось °", href: menuHref("kontaktnye-linzy", { axis: "custom" }) },
  ],
  addition: [
    { label: "Low", href: menuHref("kontaktnye-linzy", { addition: "Low" }) },
    { label: "Med", href: menuHref("kontaktnye-linzy", { addition: "Med" }) },
    { label: "High", href: menuHref("kontaktnye-linzy", { addition: "High" }) },
  ],
  bcValues: [
    { label: "8.4", href: menuHref("kontaktnye-linzy", { bc: "8.4" }) },
    { label: "8.6", href: menuHref("kontaktnye-linzy", { bc: "8.6" }) },
    { label: "8.7", href: menuHref("kontaktnye-linzy", { bc: "8.7" }) },
    { label: "9.0", href: menuHref("kontaktnye-linzy", { bc: "9.0" }) },
  ],
  needs: [
    {
      label: "Для сухих глаз",
      count: "38",
      href: menuHref("kontaktnye-linzy", { lensType: "Для сухих глаз" }),
      icon: <Droplets className="h-4 w-4" />,
    },
    {
      label: "Торические",
      count: "52",
      href: menuHref("kontaktnye-linzy", { lensType: "Торические" }),
      icon: <Circle className="h-4 w-4" />,
    },
    {
      label: "Мультифокальные",
      count: "24",
      href: menuHref("kontaktnye-linzy", { lensType: "Мультифокальные" }),
      icon: <Layers className="h-4 w-4" />,
    },
    {
      label: "Цветные",
      count: "18",
      href: menuHref("kontaktnye-linzy", { lensType: "Цветные" }),
      icon: <Palette className="h-4 w-4" />,
    },
    {
      label: "UV-защита",
      count: "12",
      href: menuHref("kontaktnye-linzy", { lensType: "UV-защита" }),
      icon: <Sun className="h-4 w-4" />,
    },
    {
      label: "Гибридные",
      count: "6",
      href: menuHref("kontaktnye-linzy", { lensType: "Гибридные" }),
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
  summary: "186 моделей · 3 производителя",
  lensTypes: [
    {
      label: "Однофокальные",
      meta: "Одна оптическая зона",
      count: "82",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Однофокальные" }),
      icon: <LensTypeIcon kind="single" />,
    },
    {
      label: "Прогрессивные",
      meta: "Плавный переход даль↔близь",
      count: "42",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Прогрессивные" }),
      icon: <LensTypeIcon kind="progressive" />,
    },
    {
      label: "Бифокальные",
      meta: "Две зоны с границей",
      count: "14",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Бифокальные" }),
      icon: <LensTypeIcon kind="bifocal" />,
    },
    {
      label: "Офисные",
      meta: "До 4 м, для работы",
      count: "18",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Офисные" }),
      icon: <LensTypeIcon kind="office" />,
    },
    {
      label: "Фотохромные",
      meta: "Темнеют на солнце",
      count: "22",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Фотохромные" }),
      icon: <LensTypeIcon kind="photo" />,
    },
    {
      label: "Детские",
      meta: "MiyoSmart, Stellest",
      count: "8",
      href: menuHref("linzy-dlya-ochkov", { lensType: "Детские" }),
      icon: <LensTypeIcon kind="kids" />,
    },
  ],
  manufacturers: [
    { label: "ZEISS", meta: "Германия · 68 моделей", tag: "Premium", href: menuHref("linzy-dlya-ochkov", { brand: "ZEISS" }) },
    { label: "Essilor", meta: "Франция · 82 модели", tag: "Топ", href: menuHref("linzy-dlya-ochkov", { brand: "Essilor" }) },
    { label: "Hoya", meta: "Япония · 36 моделей", tag: "Премиум", href: menuHref("linzy-dlya-ochkov", { brand: "Hoya" }) },
  ],
  indexValues: [
    { label: "1.50", href: menuHref("linzy-dlya-ochkov", { index: "1.50" }) },
    { label: "1.56", href: menuHref("linzy-dlya-ochkov", { index: "1.56" }) },
    { label: "1.60", href: menuHref("linzy-dlya-ochkov", { index: "1.60" }) },
    { label: "1.67", href: menuHref("linzy-dlya-ochkov", { index: "1.67" }) },
    { label: "1.74", href: menuHref("linzy-dlya-ochkov", { index: "1.74" }) },
  ],
  materials: [
    { label: "Полимер", href: menuHref("linzy-dlya-ochkov", { material: "Полимер" }) },
    { label: "Поликарбонат", href: menuHref("linzy-dlya-ochkov", { material: "Поликарбонат" }) },
    { label: "Trivex", href: menuHref("linzy-dlya-ochkov", { material: "Trivex" }) },
    { label: "Стекло", href: menuHref("linzy-dlya-ochkov", { material: "Стекло" }) },
  ],
  technologies: [
    { label: "Антибликовое", count: "42", meta: "CRIZAL", href: menuHref("linzy-dlya-ochkov", { technology: "CRIZAL" }) },
    { label: "Для гаджетов", count: "26", meta: "EYEZEN", href: menuHref("linzy-dlya-ochkov", { technology: "EYEZEN" }) },
    { label: "Контроль миопии", count: "8", meta: "STELLEST", href: menuHref("linzy-dlya-ochkov", { technology: "STELLEST" }) },
    { label: "Прогрессивы", count: "22", meta: "VARILUX", href: menuHref("linzy-dlya-ochkov", { technology: "VARILUX" }) },
    { label: "Для детей", count: "6", meta: "MIYOSMART", href: menuHref("linzy-dlya-ochkov", { technology: "MIYOSMART" }) },
    { label: "УФ-защита", count: "62", meta: "UV-PRO", href: menuHref("linzy-dlya-ochkov", { technology: "UV-PRO" }) },
  ],
  coatingValues: [
    { label: "Антиблик", href: menuHref("linzy-dlya-ochkov", { coating: "Антиблик" }) },
    { label: "Hard-coat", href: menuHref("linzy-dlya-ochkov", { coating: "Hard-coat" }) },
    { label: "Гидрофоб", href: menuHref("linzy-dlya-ochkov", { coating: "Гидрофоб" }) },
    { label: "Blue-cut", href: menuHref("linzy-dlya-ochkov", { coating: "Blue-cut" }) },
    { label: "Hi-Vision", href: menuHref("linzy-dlya-ochkov", { coating: "Hi-Vision" }) },
  ],
  purposes: [
    { label: "Для работы за ПК", count: "38", href: menuHref("linzy-dlya-ochkov", { purpose: "Для работы за ПК" }), icon: <Laptop className="h-4 w-4" /> },
    { label: "Для вождения", count: "24", href: menuHref("linzy-dlya-ochkov", { purpose: "Для вождения" }), icon: <Car className="h-4 w-4" /> },
    { label: "Для чтения", count: "42", href: menuHref("linzy-dlya-ochkov", { purpose: "Для чтения" }), icon: <BookOpen className="h-4 w-4" /> },
    { label: "Универсальные", count: "62", href: menuHref("linzy-dlya-ochkov", { purpose: "Универсальные" }), icon: <Glasses className="h-4 w-4" /> },
    { label: "Детские", count: "14", href: menuHref("linzy-dlya-ochkov", { purpose: "Детские" }), icon: <Eye className="h-4 w-4" /> },
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
};

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { label: "Оправы", href: catalogHref("opravy"), mega: FRAMES_MENU },
  { label: "Солнцезащитные", href: catalogHref("solntsezashchitnye"), mega: SUNGLASSES_MENU },
  { label: "Контактные линзы", href: catalogHref("kontaktnye-linzy"), mega: CONTACT_MENU },
  { label: "Линзы для очков", href: catalogHref("linzy-dlya-ochkov"), mega: GLASSES_MENU },
  { label: "Аксессуары", href: catalogHref("aksessuary") },
  { label: "Услуги", href: "/#services" },
  { label: "Салоны", href: "/contacts/" },
];

export function isMegaNavItem(item: HeaderNavItem): item is HeaderNavItem & { mega: HeaderMegaMenu } {
  return Boolean(item.mega);
}

function FramesMegaPanel({ menu }: { menu: FramesMegaMenu }) {
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
              href={menu.allHref}
              className="inline-flex items-center gap-2 self-start rounded-full border border-foreground px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {menu.allLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.38fr_1fr_1fr_0.92fr]">
            <section>
              {sectionHeader("Форма", "12 форм →")}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {menu.shapes.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group relative flex aspect-[1/0.82] flex-col items-center justify-between rounded-[14px] border border-[#ece7df] bg-white px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand-50"
                  >
                    <span className="absolute right-3 top-2 font-mono text-[9.5px] text-muted-foreground">
                      {item.count}
                    </span>
                    <span className="mt-2 flex w-full items-center justify-center">{item.icon}</span>
                    <span className="text-[11.5px] font-medium leading-tight text-foreground transition-colors group-hover:text-brand">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section>
              {sectionHeader("Пол / возраст", "Все →")}
              <div className="grid grid-cols-2 gap-2">
                {menu.demographics.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-2 rounded-[14px] border border-[#ece7df] bg-white px-3 py-3 text-[12.5px] transition-colors hover:border-brand hover:text-brand"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f4efeb] text-foreground transition-colors group-hover:text-brand">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">{item.count}</span>
                  </a>
                ))}
              </div>

              <div className="mt-5 border-t border-dashed border-border pt-4">
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Конструкция
                </div>
                <div className="space-y-1">
                  {menu.construction.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-[12px] px-1 py-2 text-[13.5px] text-foreground transition-colors hover:text-brand"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      <span className="ml-auto font-mono text-[11px] text-muted-foreground">{item.count}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-brand" />
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section>
              {sectionHeader("Материал", "Все →")}
              <div className="flex flex-wrap gap-2">
                {menu.materials.map((item) => (
                  <a key={item.label} href={item.href} className={chipClass}>
                    <span>{item.label}</span>
                    {item.count && <span className="font-mono text-[10px] text-muted-foreground">{item.count}</span>}
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
                      href={preset.href}
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
                    <a key={item.label} href={item.href} className={chipClass}>
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
                  href={menu.featured.ctaHref}
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
            <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
              {menu.brandStrip.map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
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
            <a href={menu.brandStripHref} className="shrink-0 text-sm text-muted-foreground transition-colors hover:text-brand">
              Все 11 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactMegaPanel({ menu }: { menu: ContactMegaMenu }) {
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
              href={menu.allHref}
              className="inline-flex items-center gap-2 self-start rounded-full border border-foreground px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {menu.allLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.16fr_1.04fr_1fr_0.9fr]">
            <section>
              {sectionHeader("Режим / замена", "Все →")}
              <div className="space-y-2">
                {menu.contactModes.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-[16px] border border-[#ece7df] bg-white px-3 py-3 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8dfd4] bg-[var(--cream)] text-brand">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium text-foreground">{item.label}</span>
                      <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{item.meta}</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{item.count}</span>
                  </a>
                ))}
              </div>
            </section>

            <section>
              {sectionHeader("Параметры", "Полный калькулятор →")}
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
                          href={item.href}
                          className={cn(
                            "border-r border-[#ece7df] px-2 py-2 text-center font-mono text-[11.5px] text-foreground transition-colors hover:bg-brand-50 hover:text-brand",
                            index === menu.sphereValues.length - 1 && "border-r-0",
                            item.label === "0" && "text-muted-foreground",
                          )}
                        >
                          {item.label}
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
                      <a key={item.label} href={item.href} className={chipClass}>
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
                      <a key={item.label} href={item.href} className={chipClass}>
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
                      <a key={item.label} href={item.href} className={chipClass}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              {sectionHeader("Особенности", "Все →")}
              <div className="grid grid-cols-2 gap-2">
                {menu.needs.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group rounded-[14px] border border-[#ece7df] bg-white p-3 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-brand">{item.icon}</span>
                      <span className="font-mono text-[10.5px] text-muted-foreground">{item.count}</span>
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
                      href={item.href}
                      className="rounded-[14px] border border-[#ece7df] bg-white px-3 py-3 transition-colors hover:border-brand hover:bg-brand-50"
                    >
                      <span className="block text-[13px] font-semibold text-foreground">{item.label}</span>
                      <span className="mt-1 block font-mono text-[10.5px] text-muted-foreground">{item.count}</span>
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
                <a
                  href={menu.helper.primaryHref}
                  className="inline-flex w-full items-center justify-between rounded-full bg-brand px-4 py-3 text-[12.5px] font-semibold text-brand-foreground transition-opacity hover:opacity-90"
                >
                  Записаться в салон
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={menu.helper.secondaryHref}
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
                href={item.href}
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

function GlassesMegaPanel({ menu }: { menu: GlassesMegaMenu }) {
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
              href={menu.allHref}
              className="inline-flex items-center gap-2 self-start rounded-full border border-foreground px-4 py-2 text-[13px] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {menu.allLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[1.03fr_0.93fr_1fr_0.95fr]">
            <section>
              {sectionHeader("Тип линзы", "Все →")}
              <div className="space-y-1">
                {menu.lensTypes.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-[14px] px-2 py-2 transition-colors hover:bg-brand-50"
                  >
                    {item.icon}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-medium text-foreground group-hover:text-brand">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{item.meta}</span>
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">{item.count}</span>
                  </a>
                ))}
              </div>
            </section>

            <section>
              {sectionHeader("Производитель", "Все →")}
              <div className="space-y-2">
                {menu.manufacturers.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
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
                  Индекс преломления
                </div>
                <div className="flex flex-wrap gap-2">
                  {menu.indexValues.map((item) => (
                    <a key={item.label} href={item.href} className={chipClass}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-dashed border-border pt-4">
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Материал
                </div>
                <div className="flex flex-wrap gap-2">
                  {menu.materials.map((item) => (
                    <a key={item.label} href={item.href} className={chipClass}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section>
              {sectionHeader("Технологии", "Все →")}
              <div className="grid grid-cols-2 gap-2">
                {menu.technologies.map((item) => (
                  <a
                    key={item.meta}
                    href={item.href}
                    className="group rounded-[14px] border border-[#ece7df] bg-white p-3 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand">{item.meta}</span>
                      <span className="font-mono text-[10.5px] text-muted-foreground">{item.count}</span>
                    </div>
                    <span className="text-[12.5px] font-medium text-foreground transition-colors group-hover:text-brand">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-5 border-t border-dashed border-border pt-4">
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  Покрытия
                </div>
                <div className="flex flex-wrap gap-2">
                  {menu.coatingValues.map((item) => (
                    <a key={item.label} href={item.href} className={chipClass}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </section>

            <section>
              {sectionHeader("Назначение", "Все →")}
              <div className="space-y-2">
                {menu.purposes.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-[14px] border border-[#ece7df] bg-white px-3 py-3 transition-colors hover:border-brand hover:bg-brand-50"
                  >
                    <span className="text-brand">{item.icon}</span>
                    <span className="flex-1 text-[12.5px] font-medium text-foreground transition-colors group-hover:text-brand">
                      {item.label}
                    </span>
                    <span className="font-mono text-[10.5px] text-muted-foreground">{item.count}</span>
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
                  href={menu.rxHelper.ctaHref}
                  className="mt-4 inline-flex w-full items-center justify-between rounded-full bg-brand px-4 py-3 text-[12.5px] font-semibold text-brand-foreground transition-opacity hover:opacity-90"
                >
                  Подобрать линзы
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </section>
          </div>

          <div className="mt-6 grid gap-3 border-t border-[#ece7df] pt-4 md:grid-cols-2 xl:grid-cols-4">
            {menu.utilities.map((item) => (
              <a
                key={item.label}
                href={item.href}
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
  return <GlassesMegaPanel menu={menu} />;
}
