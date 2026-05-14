export type Category =
  | "opravy"
  | "solntsezashchitnye"
  | "kontaktnye-linzy"
  | "linzy-dlya-ochkov"
  | "aksessuary";

export type Badge = "Новинка" | "Хит" | "Скидка";

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface Product {
  slug: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  oldPrice?: number;
  images: string[];
  colors?: ProductColor[];
  shape?: string;
  material?: string;
  gender?: "Мужские" | "Женские" | "Унисекс" | "Детские";
  size?: "Узкие" | "Средние" | "Широкие";
  badges?: Badge[];
  description: string;
  specs: { label: string; value: string }[];
  hasTryOn?: boolean;
  // contact lens specific
  wearMode?: "Однодневные" | "Двухнедельные" | "Месячные";
  lensType?: string;
  // ophthalmic lens
  refractionIndex?: string;
  coatings?: string[];
  purpose?: string;
}

export interface Service {
  slug: string;
  title: string;
  short: string;
  description: string;
  price: string;
  duration: string;
  image: string;
  includes: string[];
  steps: { title: string; text: string }[];
}

export interface Salon {
  id: string;
  name: string;
  address: string;
  metro: string;
  phone: string;
  hours: string;
  image: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  date: string;
  author: string;
  category: string;
  content: string[];
}

export interface FaqItem {
  q: string;
  a: string;
}
