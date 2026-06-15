import type { Category } from "./types";
import type { CityCode } from "@/lib/store/city";

export interface CategoryInfo {
  slug: Category;
  title: string;
  short: string;
  href: string;
  image: string;
}

// Live optika100.com (Bitrix) URL segment <-> internal data category key.
// The catalog lives under /catalog_s/{segment}/ on the production site.
export const categoryToSegment: Record<Category, string> = {
  opravy: "opravy",
  solntsezashchitnye: "solntsezashchitnye_ochki",
  "kontaktnye-linzy": "kontaktnye_linzy_",
  "linzy-dlya-ochkov": "linzy_dlya_ochkov",
  aksessuary: "soputstvuyushchie_tovary",
};

export const segmentToCategory: Record<string, Category> = Object.fromEntries(
  Object.entries(categoryToSegment).map(([cat, seg]) => [seg, cat as Category]),
) as Record<string, Category>;

const sectionCategoryAliases: Record<string, Category> = {
  ochki: "opravy",
  muzhskie: "opravy",
  zhenskie: "opravy",
  detskie: "opravy",
  muzhskie_1: "solntsezashchitnye",
  zhenskie_1: "solntsezashchitnye",
  detskie_1: "solntsezashchitnye",
  kontaktnye_linzy: "kontaktnye-linzy",
  prozrachnye: "kontaktnye-linzy",
  toricheskie: "kontaktnye-linzy",
  tsvetnye: "kontaktnye-linzy",
  multifokalnye: "kontaktnye-linzy",
  dlya_kontrolya_miopii: "kontaktnye-linzy",
  futlyary: "aksessuary",
  aksessuary: "aksessuary",
  rastvory: "aksessuary",
  ochistiteli_i_kapli: "aksessuary",
};

const sectionTitles: Record<string, string> = {
  muzhskie: "Мужские оправы",
  zhenskie: "Женские оправы",
  detskie: "Детские оправы",
  muzhskie_1: "Мужские солнцезащитные очки",
  zhenskie_1: "Женские солнцезащитные очки",
  detskie_1: "Детские солнцезащитные очки",
  prozrachnye: "Прозрачные контактные линзы",
  toricheskie: "Торические контактные линзы",
  tsvetnye: "Цветные контактные линзы",
  multifokalnye: "Мультифокальные контактные линзы",
  dlya_kontrolya_miopii: "Линзы для контроля миопии",
};

export const catalogPrefix = (city: CityCode = "spb") =>
  city === "nvk" ? "/catalog_n" : "/catalog_s";

export const catalogHref = (category: Category, city: CityCode = "spb") =>
  `${catalogPrefix(city)}/${categoryToSegment[category]}/`;

export const productHref = (category: Category, slug: string, city: CityCode = "spb") =>
  `${catalogPrefix(city)}/${categoryToSegment[category]}/${slug}/`;

/** Rewrite catalog links to use the correct city prefix (/catalog_s vs /catalog_n). */
export const regionalCatalogHref = (href: string, city: CityCode = "spb") => {
  if (!href.startsWith("/catalog_s/") && !href.startsWith("/catalog_n/")) return href;
  const path = href.replace(/^\/catalog_[sn]\//, "/");
  return `${catalogPrefix(city)}${path}`;
};

export function categoryForCatalogPath(path: string): Category | undefined {
  const segments = path.split("/").filter(Boolean);
  for (const segment of segments) {
    const category = segmentToCategory[segment] ?? sectionCategoryAliases[segment];
    if (category) return category;
  }
  return undefined;
}

export function catalogSectionTitle(path: string, fallback: string): string {
  const segments = path.split("/").filter(Boolean);
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const title = sectionTitles[segments[index]];
    if (title) return title;
  }
  return fallback;
}

export const categories: CategoryInfo[] = [
  {
    slug: "opravy",
    title: "Оправы",
    short: "Современные модели для повседневной носки",
    href: catalogHref("opravy"),
    image: "/categ_frames_v4.webp",
  },
  {
    slug: "solntsezashchitnye",
    title: "Солнцезащитные очки",
    short: "Защита от UV и стиль на каждый день",
    href: catalogHref("solntsezashchitnye"),
    image: "/categ_sunglasses_v4.webp",
  },
  {
    slug: "kontaktnye-linzy",
    title: "Контактные линзы",
    short: "Однодневные, месячные, торические",
    href: catalogHref("kontaktnye-linzy"),
    image: "/categ_contact_lens_v4.webp",
  },
  {
    slug: "linzy-dlya-ochkov",
    title: "Линзы для очков",
    short: "ZEISS, Essilor, Hoya и другие",
    href: catalogHref("linzy-dlya-ochkov"),
    image: "/categ_glasses_lens_v4.webp",
  },
  {
    slug: "aksessuary",
    title: "Аксессуары",
    short: "Футляры, цепочки, средства ухода",
    href: catalogHref("aksessuary"),
    image: "/category_accessories_v3.png",
  },
];
