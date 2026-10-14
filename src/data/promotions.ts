export type PromoVisual = "brand" | "cream" | "dark" | "neutral";

export interface Promotion {
  id: string;
  badge?: string;
  badgeVariant?: "brand" | "neutral";
  visual: PromoVisual;
  pct?: string;
  image?: string;
  title: string;
  description: string;
  href: string;
  ctaLabel?: string;
  expiresAt?: Date;
  location?: string;
}

export interface PromoBannerData {
  tag: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  endsAt: Date;
}

export const promotions: Promotion[] = [
  {
    id: "progressive-spb",
    badge: "Санкт-Петербург",
    badgeVariant: "brand",
    visual: "brand",
    pct: "−25%",
    title: "25% на прогрессивные линзы Varilux",
    description:
      "ESSILOR VARILUX COMFORT MAX\nESSILOR VARILUX COMFORT MAX F-360\nESSILOR VARILUX LIBERTY 3.0 BCT",
    href: "/catalog_s/linzy_dlya_ochkov/?brand=ESSILOR&lensType=%D0%9F%D1%80%D0%BE%D0%B3%D1%80%D0%B5%D1%81%D1%81%D0%B8%D0%B2%D0%BD%D1%8B%D0%B5",
    location: "spb",
  },
  {
    id: "stellest-spb",
    badge: "Санкт-Петербург",
    badgeVariant: "brand",
    visual: "cream",
    pct: "−50%",
    title: "До 50% на линзы Stellest",
    description:
      "50% — Stellest Airwear Crizal Prevencia Plano\n20% — Stellest Airwear Crizal Rock\n50% — Stellest Airwear Tint и Stellest 2.0 Airwear Tint при покупке прозрачных линз Stellest",
    href: "/stellest-katalog-s-linzami/",
    location: "spb",
  },
  {
    id: "sunglasses-spb",
    badge: "Санкт-Петербург",
    badgeVariant: "neutral",
    visual: "dark",
    pct: "−30%",
    title: "От 30% на солнцезащитные очки",
    description: "Скидка от 30% на солнцезащитные очки в Санкт-Петербурге. На некоторые модели скидка выше.",
    href: "/catalog_s/solntsezashchitnye_ochki/",
    location: "spb",
  },
  {
    id: "frames-spb",
    badge: "Санкт-Петербург",
    visual: "neutral",
    pct: "−15%",
    title: "До 15% на оправы",
    description: "Актуальные скидки уже указаны в карточках оправ.",
    href: "/catalog_s/opravy/",
    location: "spb",
  },
  {
    id: "misight-spb",
    badge: "Санкт-Петербург",
    visual: "cream",
    title: "MiSight 1 Day 90: подарок и скидка",
    description: "При покупке двух упаковок MiSight 1 Day 90 — 20 линз в подарок и скидка 1 000 ₽.",
    href: "https://optika100.com/catalog_s/kontaktnye_linzy_/dlya_kontrolya_miopii/misight_1_day_90sht_/",
    ctaLabel: "Участвовать в акции",
    location: "spb",
  },
];
