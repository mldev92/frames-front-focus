import type { Category } from "./types";

const ph = (seed: string) => `https://picsum.photos/seed/${seed}/800/1000`;

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
    image: ph("cat-opravy"),
  },
  {
    slug: "solntsezashchitnye",
    title: "Солнцезащитные очки",
    short: "Защита от UV и стиль на каждый день",
    href: "/solntsezashchitnye",
    image: ph("cat-sunglasses"),
  },
  {
    slug: "kontaktnye-linzy",
    title: "Контактные линзы",
    short: "Однодневные, месячные, торические",
    href: "/kontaktnye-linzy",
    image: ph("cat-contacts"),
  },
  {
    slug: "linzy-dlya-ochkov",
    title: "Линзы для очков",
    short: "ZEISS, Essilor, Hoya и другие",
    href: "/linzy-dlya-ochkov",
    image: ph("cat-lenses"),
  },
  {
    slug: "aksessuary",
    title: "Аксессуары",
    short: "Футляры, цепочки, средства ухода",
    href: "/aksessuary",
    image: ph("cat-accessories"),
  },
];
