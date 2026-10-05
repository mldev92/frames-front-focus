export interface LensLineFilterData {
  materials: string[];
  lensTypes: string[];
  surfaces: string[];
  purposes: string[];
  tintCategories: string[];
  availability: string[];
  coatings: string[];
  sphRanges: Array<{ min: number; max: number }>;
  cylMax: number | null;
  individual: boolean;
}

export interface FilterableLensLine {
  id: string;
  title: string;
  supplier: string;
  order: number;
  fromPriceRub: number | null;
  indexes: number[];
  treatments: string[];
  designs: string[];
  availability: "warehouse" | "order";
  filterData: LensLineFilterData;
}

export type LensLineFilters = Partial<Record<string, string[]>>;

export const LENS_LINE_FACET_ORDER = [
  "brand",
  "availability",
  "material",
  "lensType",
  "design",
  "technology",
  "purpose",
  "thickness",
  "lightTransmission",
  "photochromicColor",
  "sphere",
  "astigmatic",
  "cylinder",
  "sunLens",
] as const;

export type LensLineFacet = (typeof LENS_LINE_FACET_ORDER)[number];

export const LENS_LINE_FACET_TITLES: Record<LensLineFacet, string> = {
  brand: "Бренд",
  availability: "Наличие",
  material: "Материал",
  lensType: "Тип линзы",
  design: "Дизайн линзы",
  technology: "Технология",
  purpose: "Назначение",
  thickness: "Индекс / толщина",
  lightTransmission: "Светопропускание",
  photochromicColor: "Цвет фотохрома",
  sphere: "Оптическая сила (сфера)",
  astigmatic: "Астигматическая",
  cylinder: "Цилиндр",
  sunLens: "Солнцезащитная линза",
};

const BRAND_LABELS: Record<string, string> = {
  essilor: "ESSILOR",
  hoya: "HOYA",
  zeiss: "ZEISS",
  synchrony: "Synchrony",
};

const DESIGN_LABELS: Record<string, string> = {
  single: "Однофокальные",
  progressive: "Прогрессивные",
  office: "Офисные",
  bifocal: "Бифокальные",
  myopia_control: "Контроль миопии",
};

const SURFACE_LABELS: Record<string, string> = {
  spherical: "Сферический",
  aspheric: "Асферический",
};

const PURPOSE_LABELS: Record<string, string> = {
  distance: "Для дали",
  near: "Для чтения",
  computer: "Для компьютера и гаджетов",
  driving: "Для вождения",
  multifocal: "Для разных расстояний",
  "sun-protection": "Для защиты от солнца",
  "myopia-control": "Контроль миопии у детей",
  image: "Имиджевые",
};

const TECHNOLOGIES = [
  "Crizal",
  "Stellest",
  "Varilux",
  "Eyezen",
  "Transitions",
  "Sensity",
  "DriveSafe",
  "MiYOSMART",
  "BlueGuard",
] as const;

const VALUE_ORDER: Partial<Record<LensLineFacet, string[]>> = {
  brand: ["ESSILOR", "HOYA", "ZEISS", "Synchrony"],
  availability: ["В наличии", "Под заказ"],
  material: ["Полимер", "Trivex", "Поликарбонат", "Минеральные"],
  lensType: ["Однофокальные", "Прогрессивные", "Офисные", "Бифокальные", "Контроль миопии"],
  design: ["Сферический", "Асферический", "Индивидуальный", "FreeForm"],
  lightTransmission: ["Прозрачная", "Фотохромная", "Тонированная", "Поляризованная", "Зеркальная"],
  photochromicColor: ["Серый", "Коричневый", "Зелёный"],
  astigmatic: ["С цилиндром"],
  sunLens: ["Да"],
};

const SPHERE_OPTIONS = [
  "-12.00",
  "-10.00",
  "-8.00",
  "-6.00",
  "-4.00",
  "-2.00",
  "0.00",
  "+2.00",
  "+4.00",
  "+6.00",
  "+8.00",
];
const CYLINDER_OPTIONS = [
  "-0.75",
  "-1.00",
  "-1.25",
  "-1.50",
  "-1.75",
  "-2.00",
  "-2.25",
  "-3.00",
  "-4.00",
  "-6.00",
];

function normalizedText(card: FilterableLensLine): string {
  return [card.title, ...card.treatments, ...card.filterData.coatings]
    .join(" ")
    .toLocaleLowerCase("ru");
}

function indexValue(index: number): string {
  return index.toFixed(2);
}

export function facetValues(card: FilterableLensLine, facet: LensLineFacet): string[] {
  const values = new Set<string>();
  const data = card.filterData;

  if (facet === "brand") values.add(BRAND_LABELS[card.supplier] ?? card.supplier);
  if (facet === "availability") {
    for (const value of data.availability) {
      if (value === "warehouse") values.add("В наличии");
      else if (value === "order") values.add("Под заказ");
    }
  }
  if (facet === "material") {
    if (data.materials.includes("mineral")) values.add("Минеральные");
    if (data.materials.some((value) => value !== "mineral")) values.add("Полимер");
    if (card.indexes.some((value) => Math.abs(value - 1.53) < 0.005)) values.add("Trivex");
    if (card.indexes.some((value) => Math.abs(value - 1.59) < 0.005)) values.add("Поликарбонат");
  }
  if (facet === "lensType") {
    for (const value of card.designs) if (DESIGN_LABELS[value]) values.add(DESIGN_LABELS[value]);
  }
  if (facet === "design") {
    for (const value of data.surfaces) if (SURFACE_LABELS[value]) values.add(SURFACE_LABELS[value]);
    if (card.designs.includes("progressive")) values.add("Прогрессивный");
    if (card.designs.includes("bifocal")) values.add("Бифокальный");
    if (data.individual) {
      values.add("Индивидуальный");
      values.add("FreeForm");
    }
  }
  if (facet === "technology") {
    const text = normalizedText(card);
    for (const value of TECHNOLOGIES) if (text.includes(value.toLowerCase())) values.add(value);
  }
  if (facet === "purpose") {
    for (const value of data.purposes) if (PURPOSE_LABELS[value]) values.add(PURPOSE_LABELS[value]);
  }
  if (facet === "thickness") for (const value of card.indexes) values.add(indexValue(value));
  if (facet === "lightTransmission") {
    if (data.lensTypes.includes("clear") || data.tintCategories.includes("clear"))
      values.add("Прозрачная");
    if (data.lensTypes.includes("photochromic")) values.add("Фотохромная");
    if (data.tintCategories.includes("tinted")) values.add("Тонированная");
    if (data.tintCategories.includes("polarized")) values.add("Поляризованная");
    if (data.tintCategories.includes("mirrored")) values.add("Зеркальная");
  }
  if (facet === "photochromicColor") {
    const text = normalizedText(card);
    if (/grey|gray|серый|серая/u.test(text)) values.add("Серый");
    if (/brown|коричнев/u.test(text)) values.add("Коричневый");
    if (/green|зелен|зелён|pioneer/u.test(text)) values.add("Зелёный");
  }
  if (facet === "sphere") for (const value of SPHERE_OPTIONS) values.add(value);
  if (facet === "astigmatic" && data.cylMax !== null && data.cylMax > 0) values.add("С цилиндром");
  if (facet === "cylinder") for (const value of CYLINDER_OPTIONS) values.add(value);
  if (facet === "sunLens" && data.lensTypes.includes("sun")) values.add("Да");
  return [...values];
}

function numeric(value: string): number | null {
  const match = value
    .replace("−", "-")
    .replace(",", ".")
    .match(/[+-]?\d+(?:\.\d+)?/);
  const parsed = Number(match?.[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

const FACET_ALIASES: Partial<Record<LensLineFacet, Record<string, string>>> = {
  availability: {
    warehouse: "В наличии",
    salon: "В наличии",
    preorder: "Под заказ",
    order: "Под заказ",
  },
  material: {
    стекло: "Минеральные",
    "минеральные линзы": "Минеральные",
  },
  design: {
    сферические: "Сферический",
    асферические: "Асферический",
    прогрессивные: "Прогрессивный",
    бифокальные: "Бифокальный",
    индивидуальные: "Индивидуальный",
  },
  purpose: {
    "детские линзы": "Контроль миопии у детей",
    "для работы с гаджетами": "Для компьютера и гаджетов",
    "для чтения и работы на среднем расстоянии (компьютер)": "Для компьютера и гаджетов",
  },
  lightTransmission: {
    поляризованные: "Поляризованная",
    прозрачные: "Прозрачная",
    тонированные: "Тонированная",
    фотохромные: "Фотохромная",
  },
  photochromicColor: {
    зеленый: "Зелёный",
  },
};

export function canonicalLensLineFacetValue(facet: LensLineFacet, value: string): string {
  if (facet === "thickness") {
    const parsed = numeric(value);
    return parsed === null ? value : parsed.toFixed(2);
  }
  const normalized = value.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");
  const direct = FACET_ALIASES[facet]?.[normalized];
  if (direct) return direct;
  const option = VALUE_ORDER[facet]?.find(
    (candidate) => candidate.toLocaleLowerCase("ru").replaceAll("ё", "е") === normalized,
  );
  return option ?? value.trim();
}

function matchesNumericFacet(
  card: FilterableLensLine,
  facet: "sphere" | "cylinder",
  selected: string[],
): boolean {
  return selected.some((raw) => {
    const value = numeric(raw);
    if (value === null) return false;
    if (facet === "sphere") {
      return card.filterData.sphRanges.some((range) => value >= range.min && value <= range.max);
    }
    return card.filterData.cylMax !== null && Math.abs(value) <= card.filterData.cylMax + 0.001;
  });
}

export function lensLineMatches(
  card: FilterableLensLine,
  filters: LensLineFilters,
  priceMin?: number,
  priceMax?: number,
  omitFacet?: string,
): boolean {
  const pairPrice = card.fromPriceRub === null ? null : card.fromPriceRub * 2;
  if (priceMin !== undefined && (pairPrice === null || pairPrice < priceMin)) return false;
  if (priceMax !== undefined && (pairPrice === null || pairPrice > priceMax)) return false;

  for (const facet of LENS_LINE_FACET_ORDER) {
    if (facet === omitFacet) continue;
    const selected = (filters[facet]?.filter(Boolean) ?? []).map((value) =>
      canonicalLensLineFacetValue(facet, value),
    );
    if (!selected.length) continue;
    if (facet === "sphere" || facet === "cylinder") {
      if (!matchesNumericFacet(card, facet, selected)) return false;
      continue;
    }
    const values = facetValues(card, facet);
    if (!selected.some((value) => values.includes(value))) return false;
  }
  return true;
}

export function filterLensLines(
  cards: FilterableLensLine[],
  filters: LensLineFilters,
  priceMin?: number,
  priceMax?: number,
): FilterableLensLine[] {
  return cards.filter((card) => lensLineMatches(card, filters, priceMin, priceMax));
}

export function lensLineFacetOptions(cards: FilterableLensLine[], facet: LensLineFacet): string[] {
  const values = new Set(cards.flatMap((card) => facetValues(card, facet)));
  const preferred = VALUE_ORDER[facet] ?? [];
  return [...values].sort((a, b) => {
    if (facet === "thickness") return (numeric(a) ?? 0) - (numeric(b) ?? 0);
    if (facet === "sphere" || facet === "cylinder") return (numeric(a) ?? 0) - (numeric(b) ?? 0);
    const ai = preferred.indexOf(a);
    const bi = preferred.indexOf(b);
    if (ai >= 0 || bi >= 0) return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
    return a.localeCompare(b, "ru");
  });
}

export function lensLineFacetCount(
  cards: FilterableLensLine[],
  filters: LensLineFilters,
  facet: LensLineFacet,
  value: string,
  priceMin?: number,
  priceMax?: number,
): number {
  const withoutOwn = cards.filter((card) =>
    lensLineMatches(card, filters, priceMin, priceMax, facet),
  );
  if (facet === "sphere" || facet === "cylinder") {
    return withoutOwn.filter((card) => matchesNumericFacet(card, facet, [value])).length;
  }
  return withoutOwn.filter((card) => facetValues(card, facet).includes(value)).length;
}

export function sortLensLines<T extends FilterableLensLine>(
  cards: T[],
  sort: "default" | "price_asc" | "price_desc" | "name",
): T[] {
  const out = [...cards];
  if (sort === "default") return out.sort((a, b) => a.order - b.order);
  if (sort === "name") return out.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  const direction = sort === "price_desc" ? -1 : 1;
  return out.sort((a, b) => {
    if (a.fromPriceRub === null) return 1;
    if (b.fromPriceRub === null) return -1;
    return direction * (a.fromPriceRub - b.fromPriceRub) || a.order - b.order;
  });
}
