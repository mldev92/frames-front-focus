import type { Category } from "./types";

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

export const catalogHref = (category: Category) => `/catalog_s/${categoryToSegment[category]}/`;

export const productHref = (category: Category, slug: string) =>
  `/catalog_s/${categoryToSegment[category]}/${slug}/`;

export const categories: CategoryInfo[] = [
  {
    slug: "opravy",
    title: "Оправы",
    short: "Современные модели для повседневной носки",
    href: catalogHref("opravy"),
    image: "/categ_frames_v4.png",
  },
  {
    slug: "solntsezashchitnye",
    title: "Солнцезащитные очки",
    short: "Защита от UV и стиль на каждый день",
    href: catalogHref("solntsezashchitnye"),
    image: "/categ_sunglasses_v4.png",
  },
  {
    slug: "kontaktnye-linzy",
    title: "Контактные линзы",
    short: "Однодневные, месячные, торические",
    href: catalogHref("kontaktnye-linzy"),
    image: "/categ_contact_lens_v4.png",
  },
  {
    slug: "linzy-dlya-ochkov",
    title: "Линзы для очков",
    short: "ZEISS, Essilor, Hoya и другие",
    href: catalogHref("linzy-dlya-ochkov"),
    image: "/categ_glasses_lens_v4.png",
  },
  {
    slug: "aksessuary",
    title: "Аксессуары",
    short: "Футляры, цепочки, средства ухода",
    href: catalogHref("aksessuary"),
    image: "/category_accessories_v3.png",
  },
];
