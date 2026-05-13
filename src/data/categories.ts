import type { Category } from "./types";

const img = (name: string) => `/category_${name}_gemini.png`;

export interface CategoryInfo {
  slug: Category;
  title: string;
  short: string;
  href: string;
  image: string;
}

export const categories: CategoryInfo[] = [
  {
    slug: "opravy",
    title: "Оправы",
    short: "Современные модели для повседневной носки",
    href: "/opravy",
    image: img("frames"),
  },
  {
    slug: "solntsezashchitnye",
    title: "Солнцезащитные очки",
    short: "Защита от UV и стиль на каждый день",
    href: "/solntsezashchitnye",
    image: img("sunglasses"),
  },
  {
    slug: "kontaktnye-linzy",
    title: "Контактные линзы",
    short: "Однодневные, месячные, торические",
    href: "/kontaktnye-linzy",
    image: img("contact_lenses"),
  },
  {
    slug: "linzy-dlya-ochkov",
    title: "Линзы для очков",
    short: "ZEISS, Essilor, Hoya и другие",
    href: "/linzy-dlya-ochkov",
    image: img("spectacle_lenses"),
  },
  {
    slug: "aksessuary",
    title: "Аксессуары",
    short: "Футляры, цепочки, средства ухода",
    href: "/aksessuary",
    image: img("accessories"),
  },
];
