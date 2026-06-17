import { Children, useCallback, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CatalogBanner } from "./CatalogBanner";
import { ProductCard } from "./ProductCard";
import { Slider } from "./ui/slider";
import { getCatalogBanners } from "@/data/catalog-banners";
import { CONTACT } from "@/data/contact";
import type { Category, Product } from "@/data/types";
import type { CatalogPage, CatalogQuery, FacetKey as ServerFacetKey } from "@/lib/api/bitrix";
import type { CityCode } from "@/lib/store/city";
import { cn } from "@/lib/utils";
import { GenderIcon, genderToIconKind } from "@/components/ui/GenderIcon";

type FacetKey =
  | "shape"
  | "material"
  | "gender"
  | "size"
  | "brand"
  | "wearMode"
  | "lensType"
  | "purpose";

/** State delta emitted to the route; the route serialises it into the URL. */
export interface CatalogStateChange {
  filters?: Partial<Record<ServerFacetKey, string[]>>;
  sort?: NonNullable<CatalogQuery["sort"]>;
  priceMin?: number;
  priceMax?: number;
  page?: number;
}

interface ListingProps {
  title: string;
  subtitle?: string;
  /** Server-driven catalog page: slice + totals + facet counts + priceBounds. */
  data: CatalogPage;
  facets?: FacetKey[];
  facetFilteringEnabled?: boolean;
  categoryKey?: Category;
  /**
   * Applied multi-select filters from the URL (e.g. header dropdown deep-link
   * `?gender=Мужские&shape=Прямоугольные`). Keys are server facet ids; values
   * the selected entries (matching FRAME_*_DEFS.key / server labels).
   */
  initialFilters?: Record<string, string[]>;
  appliedSort: NonNullable<CatalogQuery["sort"]>;
  appliedPriceMin?: number;
  appliedPriceMax?: number;
  page: number;
  loading?: boolean;
  productBasePath?: string;
  city?: CityCode;
  onStateChange: (next: CatalogStateChange) => void;
}

type AvailabilityKey = "salon" | "warehouse" | "preorder";
type AvailabilityFilter = "all" | AvailabilityKey;
type ClipOnFilter = "all" | "Да" | "Нет";
type GridCols = 2 | 3 | 4;

const CORPORATE_EMAIL = CONTACT.email.label;
const normalize = (v?: string) => (v ?? "").trim().toLowerCase();

/** 1 … (p-1) p (p+1) … N window for numbered pagination; null = ellipsis. */
function pageWindow(current: number, total: number): (number | null)[] {
  const out: (number | null)[] = [];
  const want = new Set<number>([1, 2, current - 1, current, current + 1, total - 1, total]);
  let prev = 0;
  for (let p = 1; p <= total; p++) {
    if (!want.has(p)) continue;
    if (prev && p - prev > 1) out.push(null);
    out.push(p);
    prev = p;
  }
  return out;
}

function getBannerCount(productCount: number, columns: GridCols) {
  let remainingProducts = productCount;
  let row = 1;
  let banners = 0;

  while (remainingProducts > 0) {
    const hasBanner = row % 2 === 0;
    if (hasBanner) banners += 1;
    remainingProducts -= columns - (hasBanner ? 1 : 0);
    row += 1;
  }

  return banners;
}

function getBannerColumn(category: Category | undefined, row: number, columns: GridCols) {
  const seed = category ?? "catalog";
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  hash ^= Math.imul(row, -1640531527);
  hash ^= Math.imul(columns, 668265263);
  hash = Math.imul(hash ^ (hash >>> 16), -2048144789);
  hash = Math.imul(hash ^ (hash >>> 13), -1028477387);
  hash ^= hash >>> 16;

  return ((hash >>> 0) % columns) + 1;
}

// ── Frame shape icons — 64×24 grid, stroke 1.5, round joins ─────────────────
const ShapeIcon = ({ d }: { d: string }) => (
  <svg
    viewBox="0 0 64 24"
    style={{ width: "100%", height: "auto", minHeight: "36px" }}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d === "rect" && (
      <>
        <rect x="2" y="4" width="24" height="16" rx="4" />
        <rect x="38" y="4" width="24" height="16" rx="4" />
        <path d="M26 9 Q32 7 38 9" />
      </>
    )}
    {d === "square" && (
      <>
        <rect x="2" y="3" width="24" height="18" rx="1.5" />
        <rect x="38" y="3" width="24" height="18" rx="1.5" />
        <path d="M26 9 Q32 7 38 9" />
      </>
    )}
    {d === "round" && (
      <>
        <circle cx="13" cy="12" r="10" />
        <circle cx="51" cy="12" r="10" />
        <path d="M23 11 Q32 8 41 11" />
      </>
    )}
    {d === "oval" && (
      <>
        <ellipse cx="14" cy="12" rx="12" ry="8" />
        <ellipse cx="50" cy="12" rx="12" ry="8" />
        <path d="M26 11 Q32 8 38 11" />
      </>
    )}
    {d === "aviator" && (
      <>
        <path d="M3 6 Q3 4 5 4 L24 4 Q27 4 26 8 L23 18 Q22 21 18 21 L10 21 Q5 21 4 17 Z" />
        <path d="M61 6 Q61 4 59 4 L40 4 Q37 4 38 8 L41 18 Q42 21 46 21 L54 21 Q59 21 60 17 Z" />
        <path d="M26 8 Q32 6 38 8" />
      </>
    )}
    {d === "cat" && (
      <>
        <path d="M2 14 Q4 4 14 4 Q22 4 25 8 L27 12 Q26 18 18 18 L8 18 Q3 18 2 14 Z" />
        <path d="M62 14 Q60 4 50 4 Q42 4 39 8 L37 12 Q38 18 46 18 L56 18 Q61 18 62 14 Z" />
        <path d="M27 10 Q32 8 37 10" />
      </>
    )}
    {d === "browline" && (
      <>
        <path d="M2 4 L26 4 L26 9 L2 9 Z" fill="currentColor" stroke="none" />
        <path d="M38 4 L62 4 L62 9 L38 9 Z" fill="currentColor" stroke="none" />
        <path d="M2 9 Q2 20 12 20 L18 20 Q26 20 26 9" />
        <path d="M38 9 Q38 20 48 20 L54 20 Q62 20 62 9" />
        <path d="M26 9 Q32 7 38 9" />
      </>
    )}
    {d === "wayfarer" && (
      <>
        <path d="M3 5 L27 5 L24 18 Q23 20 20 20 L10 20 Q6 20 5 18 Z" />
        <path d="M61 5 L37 5 L40 18 Q41 20 44 20 L54 20 Q58 20 59 18 Z" />
        <path d="M27 8 Q32 6 37 8" />
      </>
    )}
    {d === "big" && (
      <>
        <rect x="1" y="2" width="27" height="20" rx="5" />
        <rect x="36" y="2" width="27" height="20" rx="5" />
        <path d="M28 9 Q32 7 36 9" />
      </>
    )}
    {d === "narrow" && (
      <>
        <rect x="2" y="9" width="24" height="6" rx="2" />
        <rect x="38" y="9" width="24" height="6" rx="2" />
        <path d="M26 11 Q32 9 38 11" />
      </>
    )}
    {d === "sport" && (
      <>
        <path d="M2 8 Q2 4 8 4 L24 4 Q28 4 28 10 L26 14 Q24 18 18 18 L8 18 Q2 18 2 12 Z" />
        <path d="M62 8 Q62 4 56 4 L40 4 Q36 4 36 10 L38 14 Q40 18 46 18 L56 18 Q62 18 62 12 Z" />
        <path d="M28 10 Q32 8 36 10" />
      </>
    )}
    {d === "trapezoid" && (
      <>
        <path d="M4 7 L24 5 L22 19 L7 19 Q4 19 3 16 Z" />
        <path d="M60 7 L40 5 L42 19 L57 19 Q60 19 61 16 Z" />
        <path d="M24 9 Q32 7 40 9" />
      </>
    )}
    {d === "butterfly" && (
      <>
        <path d="M2 13 Q3 4 14 4 Q22 4 25 10 Q24 18 16 18 L7 18 Q3 18 2 13 Z" />
        <path d="M62 13 Q61 4 50 4 Q42 4 39 10 Q40 18 48 18 L57 18 Q61 18 62 13 Z" />
        <path d="M25 10 Q32 8 39 10" />
      </>
    )}
    {d === "lector" && (
      <>
        <rect x="2" y="6" width="24" height="12" rx="2.5" />
        <rect x="38" y="6" width="24" height="12" rx="2.5" />
        <path d="M26 10 Q32 7 38 10" />
      </>
    )}
    {d === "mono" && (
      <>
        <path d="M4 8 Q4 4 10 4 L54 4 Q60 4 60 8 L60 16 Q60 20 54 20 L10 20 Q4 20 4 16 Z" />
        <path d="M32 7 L32 17" strokeDasharray="1.5 2" opacity="0.5" />
      </>
    )}
    {d === "mask" && (
      <>
        <path d="M3 8 Q32 2 61 8 L61 16 Q32 22 3 16 Z" />
        <path d="M3 13 Q32 17 61 13" opacity="0.3" />
      </>
    )}
    {d === "clip" && (
      <>
        <path d="M5 6 L5 2 M9 6 L9 2 M55 6 L55 2 M59 6 L59 2" />
        <rect x="2" y="6" width="24" height="14" rx="3" />
        <rect x="38" y="6" width="24" height="14" rx="3" />
        <path d="M26 11 Q32 9 38 11" />
      </>
    )}
  </svg>
);

type ShapeDef = {
  key: string;
  label: string;
  icon: string;
  img?: string;
  imgScale?: number;
  matches?: string[];
};

const SHAPE_DEFS: ShapeDef[] = [
  { key: "Прямоугольные", label: "Прямоугольные", icon: "rect", img: "/rectangle.webp" },
  { key: "Квадратные", label: "Квадратные", icon: "square", img: "/square.webp" },
  { key: "Круглые", label: "Круглые", icon: "round", img: "/round.webp" },
  { key: "Овальные", label: "Овальные", icon: "oval", img: "/Anselm - Oval.webp" },
  { key: "Авиаторы", label: "Авиаторы", icon: "aviator", img: "/aviator.webp" },
  { key: "Кошачий глаз", label: "Кошачий глаз", icon: "cat", img: "/cat-eye.webp" },
  { key: "Геометрические", label: "Геометрические", icon: "rect", img: "/Geometric.webp" },
  { key: "Броулайнеры", label: "Броулайнеры", icon: "browline" },
  { key: "Вэйфэрер", label: "Вэйфэрер", icon: "wayfarer" },
  { key: "Большие", label: "Большие", icon: "big" },
  { key: "Узкие", label: "Узкие", icon: "narrow" },
  { key: "Спортивные", label: "Спортивные", icon: "sport" },
  { key: "Монолинза", label: "Монолинза", icon: "mono" },
  { key: "Горнолыжные маски", label: "Маски", icon: "mask" },
  { key: "Клипоны", label: "Клипоны", icon: "clip" },
];

// Aliases include every value Bitrix's STIL highload directory actually emits
// for this shape — verified against the live API. Without them the dropdown
// label would filter 0 products even though the section is full.
const FRAME_SHAPE_DEFS: ShapeDef[] = [
  { key: "Прямоугольные", label: "Прямоугольные", icon: "rect", img: "/rectangle.webp",
    matches: ["Прямоугольные", "Классические"] },
  { key: "Квадратные", label: "Квадратные", icon: "square", img: "/square.webp",
    matches: ["Квадратные", "Квадрат"] },
  {
    key: "Трапеция",
    label: "Трапеция",
    icon: "trapezoid",
    img: "/trapec_shape.webp",
    imgScale: 1.3,
    matches: ["Трапеция", "Вэйфэрер"],
  },
  { key: "Круглые", label: "Круглые", icon: "round", img: "/round.webp",
    matches: ["Круглые", "Круглая"] },
  { key: "Овальные", label: "Овальные", icon: "oval", img: "/Anselm - Oval.webp",
    matches: ["Овальные", "Овал", "Панто"] },
  {
    key: "Клабмастер",
    label: "Клабмастер",
    icon: "browline",
    img: "/clubman_shape.webp",
    imgScale: 1.3,
    matches: ["Клабмастер", "Clubmaster", "Броулайн", "Броулайнеры"],
  },
  { key: "Авиатор", label: "Авиатор", icon: "aviator", img: "/aviator.webp",
    matches: ["Авиатор", "Авиаторы", "Aviator"] },
  { key: "Геометрические", label: "Геометрические", icon: "rect", img: "/Geometric.webp",
    matches: ["Геометрические", "Гексагональные", "Многоугольник"] },
  {
    key: "Маска",
    label: "Маска",
    icon: "mask",
    img: "/mask_shape.webp",
    imgScale: 1.3,
    matches: ["Маска", "Монолинза", "Горнолыжные маски"],
  },
  {
    key: "Спорт",
    label: "Спорт",
    icon: "sport",
    img: "/sport_shape.webp",
    imgScale: 1.3,
    matches: ["Спорт", "Спортивные"],
  },
  {
    key: "Бабочка",
    label: "Бабочка",
    icon: "butterfly",
    img: "/buterfly_shape.webp",
    matches: ["Бабочка", "Кошачий глаз"],
  },
  {
    key: "Лектор",
    label: "Лектор",
    icon: "lector",
    img: "/lector_shape_.webp",
    matches: ["Лектор", "Оверсайз"],
  },
];

const FRAME_MATERIAL_DEFS = [
  "Пластик",
  "Ацетат",
  "Нейлон",
  "Титан",
  "TR-90",
  "Pebax",
  "Комбинированный",
] as const;

const FRAME_MATERIAL_MATCHES: Record<(typeof FRAME_MATERIAL_DEFS)[number], string[]> = {
  Пластик: ["Пластик", "Полимер"],
  Ацетат: ["Ацетат", "Гибкий ацетат", "Mazzucchelli"],
  Нейлон: ["Нейлон"],
  Титан: ["Титан", "Бета-титан"],
  "TR-90": ["TR-90", "TR90"],
  Pebax: ["Pebax"],
  Комбинированный: ["Комбинированный", "Комбинированные", "Ацетат + металл"],
};

// Maps the dropdown's construction label → KONSTRUKTSIYA directory name on
// Bitrix. Clip-on is intentionally absent: in Bitrix it's a STIL value, so the
// dropdown link for Clip-on points at ?shape=Clip, not ?construction=Clip-on.
const FRAME_CONSTRUCTION_DEFS: { key: string; matches: string[] }[] = [
  { key: "Ободковые",     matches: ["Ободок", "Ободковые"] },
  { key: "Полуободковые", matches: ["Полуободок/Леска", "Полуободковые"] },
  { key: "Безободковые",  matches: ["Втулки/винты", "Безободковые"] },
];

// Lens facet defs — sidebar checkbox blocks for contact / eyeglass lens
// categories. `key` is the URL value (= dropdown chip label = menu_counts key);
// `matches[]` aliases the URL value onto Bitrix raw values so the client
// re-filter and the count compare both hit (e.g. "Однодневные" → "1 день").
const LENS_DESIGN_DEFS: { key: string; matches: string[] }[] = [
  { key: "Сферические",   matches: ["Сферический", "Сферические"] },
  { key: "Асферические",  matches: ["Асферический", "Асферические"] },
  { key: "Торические",    matches: ["Торические"] },
  { key: "Индивидуальные", matches: ["Индивидуальный", "Индивидуальные"] },
];
const LENS_WEAR_MODE_DEFS: { key: string; matches: string[] }[] = [
  { key: "Однодневные",   matches: ["1 день", "Однодневные"] },
  { key: "Двухнедельные", matches: ["2 недели", "Двухнедельные"] },
  { key: "Месячные",      matches: ["1 месяц", "Месячные"] },
  { key: "Квартальные",   matches: ["3 месяца", "Квартальные"] },
];
const LENS_TYPE_DEFS: { key: string; matches: string[] }[] = [
  { key: "Однофокальные", matches: ["Однофокальные"] },
  { key: "Прогрессивные", matches: ["Прогрессивные"] },
  { key: "Офисные",       matches: ["Офисные"] },
  { key: "Бифокальные",   matches: ["Бифокальные"] },
  { key: "Фотохромные",   matches: ["Фотохромные"] },
  { key: "Perifocal",     matches: ["Perifocal"] },
];

// Prescription chip groups — values mirror the contact-lens header dropdown.
// These are presentation-only for now (no Bitrix data backs the per-value
// filter), so no per-chip count is shown. URL deep-links seed `active[k]` and
// the matching chip lights up; clicking a chip updates the URL.
const LENS_SPHERE_DEFS   = ["−6.00", "−4.00", "−2.00", "−1.00", "0", "+1.00", "+3.00"];
const LENS_CYLINDER_DEFS = ["−0.75", "−1.25", "−1.75", "−2.25"];
const LENS_ADDITION_DEFS = ["Low", "Med", "High"];
const LENS_BC_DEFS       = ["8.4", "8.6", "8.7", "9.0"];

// Loose equality for chip-group lookups. Header dropdown labels use the
// typographic minus U+2212 ("−"); URL bars and manual input use ASCII "-".
// Comparing strictly would fail half the lookups. Lowercase too so brand /
// addition chips match either case.
function eqLoose(a: string | undefined, b: string | undefined): boolean {
  const norm = (s: string | undefined) =>
    (s ?? "").toLowerCase().replace(/−/g, "-").trim();
  return norm(a) === norm(b);
}

const FRAME_GENDER_DEFS = [
  { key: "Мужские", label: "Мужские", matches: ["Мужские"] },
  { key: "Женские", label: "Женские", matches: ["Женские"] },
  { key: "Унисекс", label: "Унисекс", matches: ["Унисекс"] },
  { key: "для мальчиков", label: "для мальчиков", matches: ["Мальчики"] },
  { key: "для девочек", label: "для девочек", matches: ["Девочки"] },
] as const;

const COLOR_SWATCHES: { name: string; hex: string }[] = [
  { name: "Чёрный", hex: "#1a1a1a" },
  { name: "Серый", hex: "#7a7a7a" },
  { name: "Белый", hex: "#f5f5f0" },
  { name: "Серебро", hex: "#c8c8d0" },
  { name: "Золото", hex: "#d4a44a" },
  { name: "Бронза", hex: "#9a6b3a" },
  { name: "Коричневый", hex: "#5a3a1a" },
  { name: "Бежевый", hex: "#d8b890" },
  { name: "Розовый", hex: "#e9a8b0" },
  { name: "Красный", hex: "#c83a32" },
  { name: "Бордовый", hex: "#6a1a28" },
  { name: "Оранжевый", hex: "#e07028" },
  { name: "Жёлтый", hex: "#e8c540" },
  { name: "Зелёный", hex: "#3a7a48" },
  { name: "Бирюзовый", hex: "#3aa0a8" },
  { name: "Голубой", hex: "#5aa8d8" },
  { name: "Синий", hex: "#28488a" },
  { name: "Фиолетовый", hex: "#6a3a8a" },
  { name: "Прозрачный", hex: "transparent" },
  { name: "Градиент", hex: "linear-gradient(135deg,#e8b8a0,#7a4a90)" },
];

const getProductMaterialValues = (p: Product): string[] => {
  const out = new Set<string>();
  if (p.material) out.add(p.material);
  for (const s of p.specs) {
    if (normalize(s.label).includes("материал")) out.add(s.value);
  }
  return [...out];
};

const hasClipOn = (p: Product): boolean => {
  const shape = normalize(p.shape);
  if (shape.includes("клип")) return true;
  return p.specs.some((s) => normalize(`${s.label} ${s.value}`).includes("клип"));
};

const getAvailabilityTags = (p: Product): Set<AvailabilityKey> => {
  const tags = new Set<AvailabilityKey>();
  const availabilityLine = p.specs.find((s) => {
    const key = normalize(s.label);
    return key.includes("налич") || key.includes("stock");
  });
  const raw = normalize(availabilityLine?.value);
  if (raw.includes("салон")) tags.add("salon");
  if (raw.includes("склад")) tags.add("warehouse");
  if (raw.includes("заказ")) tags.add("preorder");
  if (tags.size === 0) {
    tags.add("salon");
    tags.add("warehouse");
  }
  return tags;
};

// ── Per-category extra filter configs ───────────────────────────────────────
type ExtraBlock =
  | { kind: "checkbox"; key: string; title: string; options: string[] }
  | {
      kind: "range";
      key: string;
      title: string;
      min: number;
      max: number;
      step: number;
      unit?: string;
    }
  | { kind: "discount"; title?: string };

const CATEGORY_EXTRAS: Record<Category, ExtraBlock[]> = {
  opravy: [
    { kind: "discount" },
    {
      kind: "checkbox",
      key: "construction",
      title: "Конструкция",
      options: [
        "Безободковые",
        "Ободковые",
        "Полуободковые",
      ],
    },
    {
      kind: "range",
      key: "templeLength",
      title: "Длина заушника",
      min: 120,
      max: 160,
      step: 1,
      unit: "мм",
    },
    {
      kind: "range",
      key: "bridgeWidth",
      title: "Ширина переносицы",
      min: 12,
      max: 24,
      step: 1,
      unit: "мм",
    },
    {
      kind: "range",
      key: "rimWidth",
      title: "Ширина ободка",
      min: 40,
      max: 62,
      step: 1,
      unit: "мм",
    },
  ],
  solntsezashchitnye: [
    { kind: "discount" },
    {
      kind: "checkbox",
      key: "construction",
      title: "Конструкция",
      options: [
        "Безободковые",
        "Ободковые",
        "Полуободковые",
      ],
    },
    {
      kind: "range",
      key: "templeLength",
      title: "Длина заушника",
      min: 120,
      max: 160,
      step: 1,
      unit: "мм",
    },
    {
      kind: "range",
      key: "bridgeWidth",
      title: "Ширина переносицы",
      min: 12,
      max: 24,
      step: 1,
      unit: "мм",
    },
    {
      kind: "range",
      key: "rimWidth",
      title: "Ширина ободка",
      min: 40,
      max: 62,
      step: 1,
      unit: "мм",
    },
  ],
  "kontaktnye-linzy": [
    { kind: "discount" },
    // All prescription facets (Сфера / Цилиндр / Ось / Аддидация / BC) are
    // rendered by the active-wired chip-group lens block below — see
    // lensBlocks in the FilterContent. Old range sliders / checkbox here had
    // (a) the wrong key for BC (was 'baseCurve', URL is 'bc'),
    // (b) labels that didn't match the dropdown chips ('Low (+0.75…+1.25)'
    //      vs 'Low'),
    // (c) UX that couldn't show a single picked URL value as "selected".
    // Same dedup pattern as design / wearMode / replacement.
  ],
  "linzy-dlya-ochkov": [
    { kind: "discount" },
    // Тип линзы + Дизайн live in the active-wired lens-facet blocks. Stale
    // duplicates dropped: 'lensClass' / 'lensDesign'. 'lensTypeBrand' is a
    // tech / brand split with no Bitrix mapping yet — also removed.
    {
      kind: "checkbox",
      key: "material",
      title: "Материал",
      options: ["Полимер", "Поликарбонат", "Trivex", "Стекло"],
    },
    {
      kind: "checkbox",
      key: "thickness",
      title: "Толщина линзы",
      options: ["1.50", "1.56", "1.60", "1.67", "1.74"],
    },
    {
      kind: "range",
      key: "lightTransmission",
      title: "Светопропускание",
      min: 0,
      max: 100,
      step: 5,
      unit: "%",
    },
    {
      kind: "checkbox",
      key: "photochromicColor",
      title: "Цвет фотохрома",
      options: ["Серый", "Коричневый", "Зелёный"],
    },
    {
      kind: "range",
      key: "sphere",
      title: "Оптическая сила (сфера)",
      min: -20,
      max: 15,
      step: 0.25,
      unit: "D",
    },
    { kind: "checkbox", key: "astigmatic", title: "Астигматическая", options: ["Да", "Нет"] },
    { kind: "range", key: "cylinder", title: "Цилиндр", min: -6, max: 0, step: 0.25, unit: "D" },
    { kind: "range", key: "prism", title: "Призма", min: 0, max: 10, step: 0.5, unit: "Δ" },
    {
      kind: "range",
      key: "pd",
      title: "Межзрачковое расстояние / PD",
      min: 50,
      max: 80,
      step: 1,
      unit: "мм",
    },
    {
      kind: "checkbox",
      key: "purpose",
      title: "Назначение",
      options: ["Детские линзы", "Для вождения", "Для работы за ПК", "Для чтения", "Универсальные"],
    },
    { kind: "checkbox", key: "sunLens", title: "Солнцезащитная линза", options: ["Да", "Нет"] },
  ],
  aksessuary: [],
};

const CATEGORY_VISIBILITY: Record<
  Category,
  {
    shape: boolean;
    color: boolean;
    material: boolean;
    gender: boolean;
    style: boolean;
    availability: boolean;
    brand: boolean;
  }
> = {
  opravy: {
    shape: true,
    color: true,
    material: true,
    gender: true,
    style: true,
    availability: true,
    brand: true,
  },
  solntsezashchitnye: {
    shape: true,
    color: true,
    material: true,
    gender: true,
    style: true,
    availability: true,
    brand: true,
  },
  "kontaktnye-linzy": {
    shape: false,
    color: false,
    material: false,
    gender: false,
    style: false,
    availability: true,
    brand: true,
  },
  "linzy-dlya-ochkov": {
    shape: false,
    color: false,
    material: false,
    gender: false,
    style: false,
    availability: true,
    brand: true,
  },
  aksessuary: {
    shape: false,
    color: false,
    material: false,
    gender: false,
    style: false,
    availability: false,
    brand: true,
  },
};

export function CatalogListing({
  title,
  subtitle,
  data,
  facets = [],
  facetFilteringEnabled = true,
  categoryKey,
  initialFilters,
  appliedSort,
  appliedPriceMin,
  appliedPriceMax,
  page,
  loading,
  productBasePath,
  city = "spb",
  onStateChange,
}: ListingProps) {
  // The current page slice — the SERVER already applied every filter; this
  // component never re-filters it. Totals/counts/bounds also come from `data`.
  const products = data.products;
  const serverFacets = data.facets;

  const seedActive = useCallback((): Record<string, Set<string>> => {
    if (!initialFilters) return {};
    const out: Record<string, Set<string>> = {};
    for (const [k, vals] of Object.entries(initialFilters)) {
      if (vals && vals.length) out[k] = new Set(vals);
    }
    return out;
  }, [initialFilters]);
  const [active, setActive] = useState<Record<string, Set<string>>>(seedActive);
  // Re-seed when the URL search params change (dropdown → catalog navigation
  // keeps the same route component, so useState alone wouldn't pick it up).
  const initialKey = JSON.stringify(initialFilters ?? {});
  useEffect(() => {
    setActive(seedActive());
  }, [initialKey, seedActive]);

  /** Serialise an active-filter map for the URL and emit it (resets to page 1). */
  const emitFilters = (next: Record<string, Set<string>>) => {
    const filters: Partial<Record<ServerFacetKey, string[]>> = {};
    for (const [k, set] of Object.entries(next)) {
      if (set && set.size) filters[k as ServerFacetKey] = [...set];
    }
    onStateChange({ filters });
  };

  const sort = appliedSort;
  const [mobileFilters, setMobileFilters] = useState(false);
  const [gridCols, setGridCols] = useState<GridCols>(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const priceBounds = data.priceBounds;
  const [price, setPrice] = useState<[number, number]>([
    appliedPriceMin ?? priceBounds.min,
    appliedPriceMax ?? priceBounds.max,
  ]);
  // Track the applied range from the URL (slider edits stay local until commit).
  useEffect(() => {
    setPrice([appliedPriceMin ?? priceBounds.min, appliedPriceMax ?? priceBounds.max]);
  }, [appliedPriceMin, appliedPriceMax, priceBounds.min, priceBounds.max]);
  const commitPrice = (v: [number, number]) => {
    onStateChange({
      priceMin: v[0] > priceBounds.min ? v[0] : undefined,
      priceMax: v[1] < priceBounds.max ? v[1] : undefined,
    });
  };

  // Width/temple ranges, free-text search, try-on, clip-on and style tags are
  // HIDDEN for now: the server has no backing filter for them yet, and a
  // client-side version would only filter the current page slice (wrong).
  // Availability (salon/warehouse) is a real server facet driven via `active`.
  const availability: AvailabilityFilter =
    (active.availability && [...active.availability][0] as AvailabilityKey) || "all";
  const setAvailability = (v: AvailabilityFilter) => {
    const next = { ...active };
    if (v === "all") delete next.availability;
    else next.availability = new Set([v]);
    setActive(next);
    emitFilters(next);
  };
  const [preorderOpen, setPreorderOpen] = useState(false);
  const [preorderSent, setPreorderSent] = useState(false);
  const [preorderForm, setPreorderForm] = useState({ fullName: "", phone: "", email: "" });
  // Both opravy and sunglasses share the same Bitrix iblock structure
  // (gender from sections, STIL/MATERIAL_OPRAVY directories), so they both
  // use the FRAME_* defs for filter aliasing, facet rendering and counts.
  const isFramesCategory = categoryKey === "opravy" || categoryKey === "solntsezashchitnye";

  // ── Extra filter state (category-specific) ────────────────────────────────
  // Only extras with a REAL server facet behind them are shown; everything
  // else (discount, mm-ranges, lens material/thickness/photochrome/prescription
  // sliders, …) is hidden until the backend supports it — a client-side version
  // would only filter the current page slice.
  const SUPPORTED_EXTRA_KEYS = new Set(["construction"]);
  const extras = (categoryKey ? CATEGORY_EXTRAS[categoryKey] : []).filter(
    (b) => b.kind === "checkbox" && SUPPORTED_EXTRA_KEYS.has(b.key),
  );
  const vis = categoryKey
    ? CATEGORY_VISIBILITY[categoryKey]
    : {
        shape: true,
        color: true,
        material: true,
        gender: true,
        style: true,
        availability: true,
        brand: true,
      };

  const [discount, setDiscount] = useState<number>(0);
  const [ranges, setRanges] = useState<Record<string, [number, number]>>({});
  const [extraChecks, setExtraChecks] = useState<Record<string, Set<string>>>({});

  const getRange = (key: string, min: number, max: number): [number, number] =>
    ranges[key] ?? [min, max];
  const setRange = (key: string, value: [number, number]) =>
    setRanges((p) => ({ ...p, [key]: value }));
  // Visible extras map 1:1 onto server facets (construction, …) — same path
  // as every other facet: update `active`, emit, server re-filters.
  const toggleExtra = (key: string, val: string) => toggle(key, val);

  // ── ALL counts come from the SERVER facet response (drill-down semantics:
  //    own facet excluded, other active filters applied). Never recomputed
  //    from the current page slice. Server keys already match the def keys.
  const facetCounts = serverFacets as Record<string, Record<string, number>>;
  const availabilityCounts: Record<AvailabilityKey, number> = {
    salon: serverFacets.availability?.["salon"] ?? 0,
    warehouse: serverFacets.availability?.["warehouse"] ?? 0,
    preorder: 0, // no orderability rule on the backend yet — option hidden
  };
  const frameShapeCounts = serverFacets.shape ?? {};
  const frameMaterialCounts = serverFacets.material ?? {};
  const frameGenderCounts = serverFacets.gender ?? {};

  // The SERVER filters and sorts — `filtered` is just the current page slice.
  // (Filtering / aliasing / sorting all moved behind products.php?v2=1&facets=1;
  // the alias maps live in one place on the server, _facets.php.)
  const filtered = products;

  // Toggle a facet value: optimistic local update for instant chip feedback,
  // then emit — the URL round-trip re-seeds state and refetches the page.
  const toggle = (facet: string, value: string) => {
    if (!facetFilteringEnabled) return;
    const next = { ...active };
    const set = new Set(next[facet] ?? []);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    if (set.size) next[facet] = set; else delete next[facet];
    setActive(next);
    emitFilters(next);
  };

  // Color uses the same active map (server facet "color").
  const selectedColors = active.color ?? new Set<string>();
  const toggleColor = (name: string) => toggle("color", name);

  const clearAll = () => {
    setActive({});
    setPrice([priceBounds.min, priceBounds.max]);
    setPreorderOpen(false);
    setPreorderSent(false);
    setPreorderForm({ fullName: "", phone: "", email: "" });
    setDiscount(0);
    setRanges({});
    setExtraChecks({});
    onStateChange({ filters: {}, sort: "default", priceMin: undefined, priceMax: undefined });
  };

  const activeChips: { facet: string; value: string }[] = [];
  for (const [k, set] of Object.entries(active)) {
    for (const v of set) activeChips.push({ facet: k, value: v });
  }

  const catalogCells = useMemo(() => {
    const columns = 2;
    const banners = getCatalogBanners(categoryKey);
    const desktopBannerCount = getBannerCount(filtered.length, gridCols);
    const cells: React.ReactNode[] = [];
    let productIndex = 0;
    let bannerIndex = 0;
    let row = 1;

    while (productIndex < filtered.length) {
      const hasBanner = row % 2 === 0 && banners.length > 0;

      if (hasBanner) {
        const banner = banners[bannerIndex % banners.length];
        const mobileColumn = getBannerColumn(categoryKey, row, 2);
        const desktopColumn = getBannerColumn(categoryKey, row, gridCols);
        cells.push(
          <CatalogBanner
            key={`catalog-banner-${row}-${banner.id}`}
            banner={banner}
            className={cn(
              bannerIndex >= desktopBannerCount && "md:hidden",
              mobileColumn === 1 && "col-start-1",
              mobileColumn === 2 && "col-start-2",
              desktopColumn === 1 && "md:col-start-1",
              desktopColumn === 2 && "md:col-start-2",
              desktopColumn === 3 && "md:col-start-3",
              desktopColumn === 4 && "md:col-start-4",
            )}
            style={{ gridRow: row }}
          />,
        );
        bannerIndex += 1;
      }

      const productSlots = columns - (hasBanner ? 1 : 0);
      for (let slot = 0; slot < productSlots && productIndex < filtered.length; slot += 1) {
        const product = filtered[productIndex];
        cells.push(
          <ProductCard
            key={product.slug}
            product={product}
            compactLensPreview={categoryKey === "kontaktnye-linzy"}
            catalogPath={productBasePath}
            city={city}
          />,
        );
        productIndex += 1;
      }

      row += 1;
    }

    return cells;
  }, [categoryKey, city, filtered, gridCols, productBasePath]);

  const hasFacet = (k: FacetKey) => facets.includes(k);
  const handlePreorderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      "Заявка на товар под заказ",
      "",
      `Категория: ${title}`,
      `ФИО: ${preorderForm.fullName}`,
      `Телефон: ${preorderForm.phone}`,
      `Email: ${preorderForm.email}`,
      "",
      "Источник: фильтр Наличие (Под заказ)",
    ].join("\n");
    const href = `mailto:${CORPORATE_EMAIL}?subject=${encodeURIComponent(
      "Заявка на товар под заказ",
    )}&body=${encodeURIComponent(body)}`;
    if (typeof window !== "undefined") {
      window.location.href = href;
    }
    setPreorderSent(true);
  };
  const shapeDefsForRender = isFramesCategory
    ? FRAME_SHAPE_DEFS
    : SHAPE_DEFS.filter((s) => facetCounts.shape?.[s.key]);

  const FilterContent = (
    <div className="text-sm">
      {/* Sticky head — Header + Search + Sort stay pinned to the top of the
          sidebar scroll viewport so reset/search/sort are always reachable. */}
      <div
        className="sticky z-20 bg-background pt-1 pb-3"
        style={{
          top: 0,
          marginLeft: "-12px",
          marginRight: "-12px",
          paddingLeft: "12px",
          paddingRight: "12px",
          boxShadow: "0 8px 8px -8px rgba(33,24,18,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-end justify-between pb-4 border-b border-border/70">
          <div className="flex items-baseline gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-foreground/60" />
            <span className="font-serif text-[20px] leading-none font-normal text-foreground">
              Фильтры
            </span>
          </div>
          <button
            onClick={clearAll}
            className="group/reset inline-flex items-center gap-1 text-[11px] uppercase font-sans font-medium text-muted-foreground hover:text-foreground transition-colors"
            style={{ letterSpacing: "0.08em" }}
          >
            <X
              className="h-3 w-3 transition-transform group-hover/reset:rotate-90"
              style={{ transitionDuration: "var(--duration-snap)" }}
            />
            <span>Сбросить</span>
          </button>
        </div>


        {/* Catalog text search is hidden until it talks to the real search
            endpoint — a client-side version would only filter this page. */}

        {/* Sort by — server-side (sort param in the URL) */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-sm font-medium shrink-0">Сортировать</span>
          <div className="relative flex-1">
            <select
              value={sort}
              onChange={(e) => onStateChange({ sort: e.target.value as typeof sort })}
              className="w-full appearance-none bg-card border border-border rounded-full pl-3 pr-8 py-2 text-sm cursor-pointer outline-none focus:border-ink/50"
            >
              <option value="default">Популярные</option>
              <option value="price_asc">Сначала дешёвые</option>
              <option value="price_desc">Сначала дорогие</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Frame shape — tile grid */}
      {vis.shape && hasFacet("shape") && (
        <FilterSection key="shape" title="Форма">
          <CollapsibleList initialCount={6} className="grid grid-cols-2 gap-2">
            {shapeDefsForRender.map((s) => {
              const value = s.key;
              const checked = active.shape?.has(value) ?? false;
              const count = isFramesCategory ? (frameShapeCounts[s.key] ?? 0) : (facetCounts.shape?.[s.key] ?? 0);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggle("shape", value)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2.5 rounded-xl border px-2 py-5 text-center transition-all hover:border-ink hover:-translate-y-0.5 hover:shadow-sm",
                    checked ? "border-ink bg-cream shadow-xs" : "border-border bg-card",
                  )}
                  style={{
                    transitionDuration: "var(--duration-snap)",
                    transitionTimingFunction: "var(--ease-editorial)",
                    opacity: !checked && count === 0 ? 0.45 : 1,
                  }}
                >
                  {s.img ? (
                    <img
                      src={s.img}
                      alt={s.label}
                      style={{
                        width: "100%",
                        height: 36,
                        objectFit: "contain",
                        transform: `scale(${s.imgScale ?? 1})`,
                        transformOrigin: "center center",
                      }}
                    />
                  ) : (
                    <ShapeIcon d={s.icon} />
                  )}
                  <span className="text-[11px] leading-tight text-foreground/70 font-medium">
                    {s.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">({count})</span>
                </button>
              );
            })}
          </CollapsibleList>
        </FilterSection>
      )}

      {/* Price */}
      <FilterSection key="price" title="Цена">
        <div className="flex items-center gap-2 mb-3">
          <label className="flex-1 flex items-center gap-1 border border-border bg-background rounded-full px-3 py-2">
            <span className="text-muted-foreground text-xs">₽</span>
            <input
              type="number"
              value={price[0]}
              onChange={(e) => setPrice([Number(e.target.value) || 0, price[1]])}
              onBlur={() => commitPrice(price)}
              className="w-full bg-transparent outline-none text-sm"
            />
          </label>
          <label className="flex-1 flex items-center gap-1 border border-border bg-background rounded-full px-3 py-2">
            <span className="text-muted-foreground text-xs">₽</span>
            <input
              type="number"
              value={price[1]}
              onChange={(e) => setPrice([price[0], Number(e.target.value) || 0])}
              onBlur={() => commitPrice(price)}
              className="w-full bg-transparent outline-none text-sm"
            />
          </label>
        </div>
        <Slider
          min={priceBounds.min}
          max={priceBounds.max}
          step={100}
          value={price}
          onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
          onValueCommit={(v) => commitPrice([v[0], v[1]] as [number, number])}
          className="mx-2 [&_[role=slider]]:border-ink [&_[role=slider]]:bg-background [&>span:first-child]:bg-ink/10 [&_[data-slot=slider-range]]:bg-ink"
        />
      </FilterSection>

      {/* Color — compact swatch grid */}
      {vis.color && (
        <FilterSection key="color" title="Цвет">
          <CollapsibleList initialCount={4} className="grid grid-cols-1 gap-2 py-1">
            {COLOR_SWATCHES.map((c) => {
              const sel = selectedColors.has(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleColor(c.name)}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all",
                    sel ? "border-ink bg-cream" : "border-border bg-card hover:border-foreground/40",
                  )}
                  style={{ transitionDuration: "var(--duration-snap)" }}
                >
                  <span
                    className="inline-flex h-5 w-5 shrink-0 rounded-full border border-border"
                    style={{
                      background: c.hex,
                      backgroundImage:
                        c.hex === "transparent"
                          ? "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%)"
                          : c.hex.includes("gradient")
                            ? c.hex
                            : undefined,
                      backgroundSize: c.hex === "transparent" ? "8px 8px" : undefined,
                    }}
                  />
                  <span className="flex-1 text-sm">{c.name}</span>
                  {sel && <Check className="h-3.5 w-3.5 text-foreground" strokeWidth={3} />}
                </button>
              );
            })}
          </CollapsibleList>
        </FilterSection>
      )}

      {/* Material — checkbox list */}
      {vis.material && hasFacet("material") && (
        <FilterSection key="material" title="Материал">
          <CollapsibleList initialCount={4} className="space-y-2">
            {(isFramesCategory
              ? FRAME_MATERIAL_DEFS.map((m) => [m, frameMaterialCounts[m] ?? 0] as const)
              : Object.entries(facetCounts.material ?? {})
            ).map(([m, c]) => {
              const checked = active.material?.has(m) ?? false;
              return (
                <button
                  key={m}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={(e) => {
                    e.preventDefault();
                    toggle("material", m);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-full flex items-center gap-2.5 cursor-pointer group py-0.5 hover:bg-surface/50 transition-colors text-left"
                  style={{
                    borderRadius: "4px",
                    padding: "2px 4px",
                    margin: "0 -4px",
                    background: "none",
                    border: "none",
                  }}
                >
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                      checked
                        ? "border-ink bg-ink text-primary-foreground"
                        : "border-border bg-card group-hover:border-foreground/40",
                    )}
                  >
                    {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 text-sm">{m}</span>
                  <span className="text-xs text-muted-foreground">({c})</span>
                </button>
              );
            })}
          </CollapsibleList>
        </FilterSection>
      )}

      {/* Clip-On filter is hidden: yes/no needs a negation the server doesn't
          have; clip-on frames remain reachable via construction="Clip-on". */}

      {/* Availability — radios (server facet; preorder hidden until an
          orderability rule exists on the backend). Hidden entirely when the
          server response carries no availability facet for this category. */}
      {vis.availability && serverFacets.availability && (
        <FilterSection key="availability" title="Наличие">
          <div className="space-y-2" role="radiogroup" aria-label="Наличие">
            {(
              [
                ["salon", "В наличии в салоне", availabilityCounts.salon],
                ["warehouse", "В наличии на складе", availabilityCounts.warehouse],
              ] as const
            ).map(([val, label, count]) => {
              const checked = availability === val;
              return (
                <button
                  key={val}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={(e) => {
                    e.preventDefault();
                    setAvailability(availability === val ? "all" : val);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="w-full flex items-center gap-2.5 cursor-pointer group py-0.5 hover:bg-surface/50 transition-colors text-left"
                  style={{
                    borderRadius: "4px",
                    padding: "2px 4px",
                    margin: "0 -4px",
                    background: "none",
                    border: "none",
                  }}
                >
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      checked ? "border-ink" : "border-border group-hover:border-foreground/40",
                    )}
                  >
                    {checked && <span className="h-2 w-2 rounded-full bg-ink" />}
                  </span>
                  <span className="flex-1 text-sm">{label}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </button>
              );
            })}
          </div>
          {availability === "preorder" && (
            <div className="mt-3 space-y-3 rounded-xl border border-border bg-card p-3">
              <button
                type="button"
                onClick={() => setPreorderOpen((v) => !v)}
                className={cn(
                  "w-full rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
                  preorderOpen
                    ? "bg-ink text-primary-foreground"
                    : "border border-border hover:border-foreground/40",
                )}
              >
                {preorderOpen ? "Скрыть форму заявки" : "Оставить заявку на под заказ"}
              </button>
              {preorderOpen && (
                <>
                  {preorderSent ? (
                    <p className="text-sm text-muted-foreground">
                      Черновик письма открыт. Отправьте его, чтобы заявка ушла на {CORPORATE_EMAIL}.
                    </p>
                  ) : (
                    <form onSubmit={handlePreorderSubmit} className="space-y-2.5">
                      <input
                        type="text"
                        required
                        placeholder="ФИО"
                        value={preorderForm.fullName}
                        onChange={(e) =>
                          setPreorderForm((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        className="w-full rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ink/50"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Телефон"
                        value={preorderForm.phone}
                        onChange={(e) =>
                          setPreorderForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="w-full rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ink/50"
                      />
                      <input
                        type="email"
                        required
                        placeholder="E-mail"
                        value={preorderForm.email}
                        onChange={(e) =>
                          setPreorderForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="w-full rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ink/50"
                      />
                      <button
                        type="submit"
                        className="w-full rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground hover:opacity-90 transition-opacity"
                      >
                        Отправить заявку
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          )}
        </FilterSection>
      )}

      {/* Gender pills (kept) */}
      {vis.gender && hasFacet("gender") && (
        <FilterSection key="gender" title="Пол">
          {isFramesCategory ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {FRAME_GENDER_DEFS.slice(0, 3).map((g) => {
                  const checked = active.gender?.has(g.key) ?? false;
                  const ik = genderToIconKind(g.label);
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => toggle("gender", g.key)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all",
                        checked
                          ? "border-ink bg-ink text-primary-foreground"
                          : "border-border bg-card hover:border-foreground/50 hover:bg-surface/50 hover:shadow-xs",
                      )}
                      style={{
                        transitionDuration: "var(--duration-snap)",
                        transitionTimingFunction: "var(--ease-editorial)",
                      }}
                    >
                      {ik && <GenderIcon kind={ik} className="h-3.5 w-3.5" />}
                      <span>{g.label}</span>
                      <span
                        className={cn(
                          "text-[10px]",
                          checked ? "opacity-80" : "text-muted-foreground",
                        )}
                      >
                        ({frameGenderCounts[g.key] ?? 0})
                      </span>
                    </button>
                  );
                })}
              </div>
              <div>
                <div className="text-[11px] uppercase font-semibold tracking-[0.08em] text-foreground/70 mb-2">
                  Детские
                </div>
                <div className="flex flex-wrap gap-2">
                  {FRAME_GENDER_DEFS.slice(3).map((g) => {
                    const checked = active.gender?.has(g.key) ?? false;
                    return (
                      <button
                        key={g.key}
                        type="button"
                        onClick={() => toggle("gender", g.key)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all",
                          checked
                            ? "border-ink bg-ink text-primary-foreground"
                            : "border-border bg-card hover:border-foreground/50 hover:bg-surface/50 hover:shadow-xs",
                        )}
                        style={{
                          transitionDuration: "var(--duration-snap)",
                          transitionTimingFunction: "var(--ease-editorial)",
                        }}
                      >
                        <span>{g.label}</span>
                        <span
                          className={cn(
                            "text-[10px]",
                            checked ? "opacity-80" : "text-muted-foreground",
                          )}
                        >
                          ({frameGenderCounts[g.key] ?? 0})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(facetCounts.gender ?? {}).map(([g, c]) => {
                const checked = active.gender?.has(g) ?? false;
                const ik = genderToIconKind(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggle("gender", g)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all",
                      checked
                        ? "border-ink bg-ink text-primary-foreground"
                        : "border-border bg-card hover:border-foreground/50 hover:bg-surface/50 hover:shadow-xs",
                    )}
                    style={{
                      transitionDuration: "var(--duration-snap)",
                      transitionTimingFunction: "var(--ease-editorial)",
                    }}
                  >
                    {ik && <GenderIcon kind={ik} className="h-3.5 w-3.5" />}
                    <span className="first-letter:uppercase">{g.toLowerCase()}</span>
                    <span
                      className={cn(
                        "text-[10px]",
                        checked ? "opacity-80" : "text-muted-foreground",
                      )}
                    >
                      ({c})
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </FilterSection>
      )}

      {/* Style pills (marketing tags) are hidden: no `tag` filter exists on
          the backend yet, and pills that silently do nothing mislead. */}

      {/* Brands */}
      {vis.brand && hasFacet("brand") && (
        <FilterSection key="brand" title="Бренды">
          <CollapsibleList initialCount={4} className="space-y-2">
            {Object.entries(facetCounts.brand ?? {})
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([b, c]) => {
                const checked = active.brand?.has(b) ?? false;
                return (
                  <button
                    key={b}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={(e) => {
                      e.preventDefault();
                      toggle("brand", b);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full flex items-center gap-2.5 cursor-pointer group py-0.5 hover:bg-surface/50 transition-colors text-left"
                    style={{
                      borderRadius: "4px",
                      padding: "2px 4px",
                      margin: "0 -4px",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                        checked
                          ? "border-ink bg-ink text-primary-foreground"
                          : "border-border bg-card group-hover:border-foreground/40",
                      )}
                    >
                      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 text-sm">{b}</span>
                    <span className="text-xs text-muted-foreground">({c})</span>
                  </button>
                );
              })}
          </CollapsibleList>
        </FilterSection>
      )}

      {/* Category-specific extra filters */}
      {extras.map((block) => {
        if (block.kind === "discount") {
          return (
            <FilterSection key="discount" title="Скидка, %">
              <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                <span>от {discount}%</span>
                <span>до 100%</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[discount]}
                onValueChange={(v) => setDiscount(v[0] ?? 0)}
                className="mx-2 [&_[role=slider]]:border-ink [&_[role=slider]]:bg-background [&>span:first-child]:bg-ink/10 [&_[data-slot=slider-range]]:bg-ink"
              />
            </FilterSection>
          );
        }
        if (block.kind === "range") {
          const v = getRange(block.key, block.min, block.max);
          return (
            <FilterSection key={block.key} title={block.title}>
              <div className="flex items-center gap-2 mb-3">
                <label className="flex-1 flex items-center gap-1 border border-border bg-background rounded-full px-3 py-2">
                  <input
                    type="number"
                    step={block.step}
                    value={v[0]}
                    onChange={(e) => setRange(block.key, [Number(e.target.value), v[1]])}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                  {block.unit && (
                    <span className="text-muted-foreground text-xs">{block.unit}</span>
                  )}
                </label>
                <label className="flex-1 flex items-center gap-1 border border-border bg-background rounded-full px-3 py-2">
                  <input
                    type="number"
                    step={block.step}
                    value={v[1]}
                    onChange={(e) => setRange(block.key, [v[0], Number(e.target.value)])}
                    className="w-full bg-transparent outline-none text-sm"
                  />
                  {block.unit && (
                    <span className="text-muted-foreground text-xs">{block.unit}</span>
                  )}
                </label>
              </div>
              <Slider
                min={block.min}
                max={block.max}
                step={block.step}
                value={v}
                onValueChange={(vv) => setRange(block.key, [vv[0], vv[1]] as [number, number])}
                className="mx-2 [&_[role=slider]]:border-ink [&_[role=slider]]:bg-background [&>span:first-child]:bg-ink/10 [&_[data-slot=slider-range]]:bg-ink"
              />
            </FilterSection>
          );
        }
        // checkbox
        return (
          <FilterSection key={block.key} title={block.title}>
            <div className="space-y-2">
              {block.options.map((opt) => {
                const isConstruction = block.key === "construction";
                // Construction is wired into the main `active` filter set (not
                // extraChecks), so the dropdown URL ?construction=Ободковые
                // both seeds this checkbox AND actually filters the products.
                const checked = isConstruction
                  ? active.construction?.has(opt) ?? false
                  : extraChecks[block.key]?.has(opt) ?? false;
                const constructionLower = opt.toLowerCase();
                const constructionIcon = isConstruction
                  ? constructionLower.includes("безобод")
                    ? "/bezobodkovaea.webp"
                    : constructionLower.includes("полуобод")
                    ? "/poluobodkovaea.webp"
                    : constructionLower.includes("обод")
                        ? "/obodkovaea.webp"
                        : null
                  : null;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={(e) => {
                      e.preventDefault();
                      if (isConstruction) toggle("construction", opt);
                      else toggleExtra(block.key, opt);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full flex items-center gap-2.5 cursor-pointer group py-0.5 hover:bg-surface/50 transition-colors text-left"
                    style={{
                      borderRadius: "4px",
                      padding: "2px 4px",
                      margin: "0 -4px",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                        checked
                          ? "border-ink bg-ink text-primary-foreground"
                          : "border-border bg-card group-hover:border-foreground/40",
                      )}
                    >
                      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {constructionIcon && (
                      <span className="inline-flex h-4 w-7 shrink-0 items-center justify-center">
                        <img src={constructionIcon} alt="" className="h-4 w-auto object-contain" />
                      </span>
                    )}
                    <span className="flex-1 text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>
        );
      })}

      {/* Lens-category facet checkboxes (wired into `active`, not extraChecks,
          so URL ?design=Торические seeds the checkbox AND filters the grid,
          mirroring the Конструкция pattern). */}
      {(() => {
        const lensBlocks: { facet: "design" | "wearMode" | "lensType"; title: string; defs: typeof LENS_DESIGN_DEFS }[] = [];
        const isContacts     = categoryKey === "kontaktnye-linzy";
        const isGlassesLens  = categoryKey === "linzy-dlya-ochkov";
        if (isContacts || isGlassesLens) lensBlocks.push({ facet: "design", title: "Дизайн", defs: LENS_DESIGN_DEFS });
        if (isContacts)                  lensBlocks.push({ facet: "wearMode", title: "Срок замены", defs: LENS_WEAR_MODE_DEFS });
        if (isGlassesLens)               lensBlocks.push({ facet: "lensType", title: "Тип линзы", defs: LENS_TYPE_DEFS });

        // SERVER counts — the page slice (24 items) must never drive counts.
        // Server facet keys are the canonical chip labels (same def.key set).
        const countFor = (facet: string, def: { key: string; matches: string[] }) => {
          const bucket = (serverFacets as Record<string, Record<string, number> | undefined>)[facet];
          if (!bucket) return 0;
          if (def.key in bucket) return bucket[def.key];
          for (const m of def.matches) if (m in bucket) return bucket[m];
          return 0;
        };

        return lensBlocks.map(({ facet, title, defs }) => (
          <FilterSection key={facet} title={title}>
            <div className="space-y-2">
              {defs.map((def) => {
                const checked = active[facet]?.has(def.key) ?? false;
                const c = countFor(facet, def);
                return (
                  <button
                    key={def.key}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={(e) => { e.preventDefault(); toggle(facet, def.key); }}
                    onMouseDown={(e) => e.preventDefault()}
                    className="w-full flex items-center gap-2.5 cursor-pointer group py-0.5 hover:bg-surface/50 transition-colors text-left"
                    style={{ borderRadius: "4px", padding: "2px 4px", margin: "0 -4px", background: "none", border: "none" }}
                  >
                    <span
                      className={cn(
                        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                        checked
                          ? "border-ink bg-ink text-primary-foreground"
                          : "border-border bg-card group-hover:border-foreground/40",
                      )}
                    >
                      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 text-sm">{def.key}</span>
                    <span className="text-xs text-muted-foreground">({c})</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>
        ));
      })()}

      {/* Prescription chip-groups (contact lenses only). Single discrete
          value per facet — chips light up when the URL deep-links them. */}
      {categoryKey === "kontaktnye-linzy" && (() => {
        const rxBlocks: { facet: string; title: string; defs: readonly string[] }[] = [
          { facet: "sphere",   title: "Сфера",                defs: LENS_SPHERE_DEFS },
          { facet: "cylinder", title: "Цилиндр",              defs: LENS_CYLINDER_DEFS },
          { facet: "addition", title: "Аддидация",            defs: LENS_ADDITION_DEFS },
          { facet: "bc",       title: "Радиус кривизны (BC)", defs: LENS_BC_DEFS },
        ];
        return rxBlocks.map(({ facet, title, defs }) => (
          <FilterSection key={facet} title={title}>
            <div className="flex flex-wrap gap-2">
              {defs.map((value) => {
                const checked =
                  [...(active[facet] ?? [])].some((picked) => eqLoose(picked, value));
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggle(facet, value)}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition-all",
                      checked
                        ? "border-ink bg-ink text-primary-foreground"
                        : "border-border bg-card hover:border-foreground/50 hover:bg-surface/50 hover:shadow-xs",
                    )}
                    style={{
                      transitionDuration: "var(--duration-snap)",
                      transitionTimingFunction: "var(--ease-editorial)",
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        ));
      })()}

      {/* Ось — free numeric input, COMMITTED to the URL/API on blur or Enter
          (the SEL_AXIS enum is 10…180; the server matches numerically). The
          dropdown's "Своя ось °" chip lands here as ?axis=custom, which the
          backend ignores — shown as an empty input. */}
      {categoryKey === "kontaktnye-linzy" && (
        <FilterSection key="axis" title="Ось">
          <input
            type="text"
            inputMode="numeric"
            placeholder="например 90°"
            value={[...(active.axis ?? [])].find((v) => v !== "custom") ?? ""}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d]/g, "").trim();
              setActive((prev) => {
                const next = { ...prev };
                if (v) next.axis = new Set([v]); else delete next.axis;
                return next;
              });
            }}
            onBlur={() => {
              const next = { ...active };
              const v = [...(next.axis ?? [])].find((x) => x !== "custom");
              if (v) next.axis = new Set([v]); else delete next.axis;
              emitFilters(next);
            }}
            onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            className="w-full bg-background border border-border rounded-full px-3 py-2 text-sm outline-none focus:border-ink/50 transition-all"
          />
        </FilterSection>
      )}

      {/* Bottom spacer so the last section is never clipped by sticky Apply on mobile */}
      <div aria-hidden className="h-20 lg:h-4" />

      {/* Apply button — mobile only (desktop sidebar has no sticky CTA) */}
      <div className="lg:hidden sticky bottom-0 -mx-3 mt-4 bg-gradient-to-t from-background via-background to-transparent px-3 pb-2 pt-4">
        <button
          type="button"
          onClick={() => setMobileFilters(false)}
          className="w-full bg-ink text-primary-foreground rounded-full py-3 text-sm font-medium hover:-translate-y-0.5 hover:shadow-md transition-all"
          style={{ transitionDuration: "var(--duration-snap)" }}
        >
          Применить фильтры ({data.total})
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full py-10" style={{ paddingLeft: "24px", paddingRight: "24px" }}>
      <div className="mb-8">
        <h1 className="font-serif text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>

      <div className="lg:flex lg:items-start" style={{ minHeight: "80vh" }}>
        {facets.length > 0 && (
          <div
            className="hidden lg:block shrink-0 sticky top-4 self-start overflow-hidden transition-[width,margin-right] duration-300 ease-in-out"
            style={{
              width: sidebarOpen ? "300px" : "0",
              marginRight: sidebarOpen ? "2.5rem" : "0",
            }}
          >
            <div
              className="h-[calc(100vh-6rem)] overflow-y-auto px-3"
              style={{ width: "300px", scrollbarGutter: "stable", paddingRight: "24px" }}
            >
              {FilterContent}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Filter toggle — always left */}
            {facets.length > 0 && (
              <>
                <button
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="group/toggle hidden lg:inline-flex items-center gap-2 h-9 rounded-full border border-border bg-background pl-3 pr-4 text-[12px] font-medium tracking-wide text-foreground hover:border-ink hover:bg-ink hover:text-primary-foreground transition-all shrink-0"
                  style={{
                    transitionDuration: "var(--duration-snap)",
                    transitionTimingFunction: "var(--ease-editorial)",
                  }}
                >
                  {sidebarOpen ? (
                    <>
                      <span
                        className="inline-block transition-transform group-hover/toggle:-translate-x-0.5"
                        style={{ transitionDuration: "var(--duration-snap)" }}
                      >
                        ←
                      </span>
                      <span>Скрыть фильтры</span>
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>Показать фильтры</span>
                      <span
                        className="inline-block transition-transform group-hover/toggle:translate-x-0.5"
                        style={{ transitionDuration: "var(--duration-snap)" }}
                      >
                        →
                      </span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setMobileFilters(true)}
                  className="lg:hidden inline-flex items-center gap-2 h-9 rounded-full border border-border bg-background px-4 text-[12px] font-medium tracking-wide hover:border-ink hover:bg-ink hover:text-primary-foreground transition-all"
                  style={{ transitionDuration: "var(--duration-snap)" }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" /> Фильтры
                </button>
              </>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <div className="hidden lg:block text-sm text-muted-foreground shrink-0">
                {/* SERVER total — the honest catalog size, not this page's length */}
                {data.total}{" "}
                {data.total % 10 === 1 && data.total % 100 !== 11
                  ? "модель"
                  : data.total % 10 >= 2 &&
                      data.total % 10 <= 4 &&
                      !(data.total % 100 >= 12 && data.total % 100 <= 14)
                    ? "модели"
                    : "моделей"}
              </div>
              <div className="hidden md:flex items-center border border-border rounded-sm overflow-hidden">
                <button
                  onClick={() => setGridCols(2)}
                  className={cn(
                    "px-2.5 py-1.5 transition-colors",
                    gridCols === 2 ? "bg-foreground text-background" : "hover:bg-surface",
                  )}
                  aria-label="2 колонки"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={cn(
                    "px-2.5 py-1.5 border-l border-border transition-colors",
                    gridCols === 3 ? "bg-foreground text-background" : "hover:bg-surface",
                  )}
                  aria-label="3 колонки"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                    <rect x="0.5" y="1" width="4" height="6" rx="1" />
                    <rect x="6" y="1" width="4" height="6" rx="1" />
                    <rect x="11.5" y="1" width="4" height="6" rx="1" />
                    <rect x="0.5" y="9" width="4" height="6" rx="1" />
                    <rect x="6" y="9" width="4" height="6" rx="1" />
                    <rect x="11.5" y="9" width="4" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={cn(
                    "px-2.5 py-1.5 border-l border-border transition-colors",
                    gridCols === 4 ? "bg-foreground text-background" : "hover:bg-surface",
                  )}
                  aria-label="4 колонки"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                    <rect x="0.5" y="1" width="2.75" height="6" rx="0.75" />
                    <rect x="4.75" y="1" width="2.75" height="6" rx="0.75" />
                    <rect x="9" y="1" width="2.75" height="6" rx="0.75" />
                    <rect x="13.25" y="1" width="2.25" height="6" rx="0.75" />
                    <rect x="0.5" y="9" width="2.75" height="6" rx="0.75" />
                    <rect x="4.75" y="9" width="2.75" height="6" rx="0.75" />
                    <rect x="9" y="9" width="2.75" height="6" rx="0.75" />
                    <rect x="13.25" y="9" width="2.25" height="6" rx="0.75" />
                  </svg>
                </button>
              </div>
              <div className="relative group/sort">
                <span className="pointer-events-none hidden md:inline absolute left-3 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  Сортировать
                </span>
                <select
                  value={sort}
                  onChange={(e) => onStateChange({ sort: e.target.value as typeof sort })}
                  className="w-[140px] md:w-[236px] appearance-none bg-background border border-border rounded-full h-9 pl-3 md:pl-[112px] pr-9 text-[12px] font-medium tracking-wide cursor-pointer focus:outline-none hover:border-ink focus:border-ink transition-colors"
                  style={{ transitionDuration: "var(--duration-snap)" }}
                >
                  <option value="default">Популярные</option>
                  <option value="price_asc">Цена ↑</option>
                  <option value="price_desc">Цена ↓</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/60 transition-transform group-hover/sort:text-foreground" />
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeChips.map(({ facet, value }) => (
                <button
                  key={facet + value}
                  onClick={() => toggle(facet, value)}
                  className="inline-flex items-center gap-1 bg-cream border border-ink/20 text-xs px-3 py-1 rounded-full hover:border-ink hover:bg-ink hover:text-primary-foreground transition-all"
                  style={{
                    transitionDuration: "var(--duration-snap)",
                    transitionTimingFunction: "var(--ease-editorial)",
                  }}
                >
                  {value} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          {data.total === 0 ? (
            <div className="py-20 text-center">
              {activeChips.length > 0 || appliedPriceMin !== undefined || appliedPriceMax !== undefined ? (
                <>
                  <div className="font-serif text-2xl text-foreground/60 mb-3">Ничего не найдено</div>
                  <p className="text-sm text-muted-foreground mb-6">Попробуйте изменить параметры фильтрации</p>
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center gap-2 border border-border rounded-full px-5 py-2.5 text-sm hover:border-ink hover:bg-surface transition-all"
                    style={{ transitionDuration: "var(--duration-snap)" }}
                  >
                    Сбросить все фильтры
                  </button>
                </>
              ) : (
                <>
                  <div className="font-serif text-2xl text-foreground/60 mb-3">Раздел недоступен</div>
                  <p className="text-sm text-muted-foreground">Этот раздел пока недоступен для выбранного города</p>
                </>
              )}
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-x-5 gap-y-10",
                gridCols === 2 && "grid-cols-2",
                gridCols === 3 && "grid-cols-2 md:grid-cols-3",
                gridCols === 4 && "grid-cols-2 md:grid-cols-4",
              )}
              style={loading ? { opacity: 0.55, pointerEvents: "none", transition: "opacity 0.2s" } : undefined}
            >
              {catalogCells}
            </div>
          )}

          {/* Numbered pagination — server pages (24/page). */}
          {data.pages > 1 && (
            <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Страницы">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onStateChange({ page: page - 1 })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border disabled:opacity-30 hover:border-ink transition-colors"
                aria-label="Предыдущая страница"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageWindow(page, data.pages).map((p, i) =>
                p === null ? (
                  <span key={`gap-${i}`} className="px-1 text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onStateChange({ page: p })}
                    aria-current={p === page ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm transition-colors",
                      p === page
                        ? "border-ink bg-ink text-primary-foreground"
                        : "border-border hover:border-ink",
                    )}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={page >= data.pages}
                onClick={() => onStateChange({ page: page + 1 })}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border disabled:opacity-30 hover:border-ink transition-colors"
                aria-label="Следующая страница"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setMobileFilters(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-lg max-h-[85vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl">Фильтры</h3>
              <button onClick={() => setMobileFilters(false)} aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterContent}
            <div className="sticky bottom-0 bg-background pt-4 flex gap-3">
              <button
                onClick={clearAll}
                className="flex-1 border border-border py-3 rounded-full text-sm hover:border-ink hover:bg-surface transition-all"
                style={{ transitionDuration: "var(--duration-snap)" }}
              >
                Сбросить
              </button>
              <button
                onClick={() => setMobileFilters(false)}
                className="flex-1 bg-ink text-primary-foreground py-3 rounded-full text-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                style={{ transitionDuration: "var(--duration-snap)" }}
              >
                Показать ({data.total})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Renders the first `initialCount` children, with a "Показать ещё (N)" toggle
// underneath to reveal the rest. Used to keep long filter lists (color, brand,
// shape grid, …) compact by default while still keeping every section open.
function CollapsibleList({
  children,
  initialCount,
  className,
}: {
  children: React.ReactNode;
  initialCount: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = Children.toArray(children);
  const visible = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - initialCount;
  return (
    <>
      <div className={className}>{visible}</div>
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] font-medium text-foreground/60 hover:text-foreground transition-colors"
          style={{ transitionDuration: "var(--duration-snap)" }}
        >
          {expanded ? "Свернуть" : `Показать ещё (${hiddenCount})`}
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")}
          />
        </button>
      )}
    </>
  );
}

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  titleClass?: string;
  noBorder?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // After the open transition finishes we drop overflow:hidden so popovers,
  // sliders, and tooltips inside the section are not clipped.
  const [overflowVisible, setOverflowVisible] = useState(defaultOpen);

  return (
    <div
      style={{
        paddingTop: "20px",
        paddingBottom: "20px",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (!next) setOverflowVisible(false);
            return next;
          });
        }}
        className="w-full flex items-center justify-between text-left group"
      >
        <span
          className="text-[11px] uppercase font-sans font-semibold text-foreground/80 group-hover:text-foreground transition-colors"
          style={{ letterSpacing: "0.1em" }}
        >
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground/50 group-hover:text-foreground transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transition:
            "grid-template-rows 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease-out",
        }}
        onTransitionEnd={(e) => {
          if (e.propertyName === "grid-template-rows" && open) setOverflowVisible(true);
        }}
      >
        <div style={{ overflow: open && overflowVisible ? "visible" : "hidden", minHeight: 0 }}>
          <div style={{ paddingTop: "16px" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
