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
    title: "До 25% на прогрессивные линзы",
    description:
      "25% на ESSILOR VARILUX COMFORT MAX, COMFORT MAX F-360 и LIBERTY 3.0 BCT. На остальные прогрессивные линзы: 15% при цене пары от 20 000 ₽, 10% при 15 000–19 999 ₽, 5% при цене до 14 999 ₽.",
    href: "/catalog_s/linzy_dlya_ochkov/",
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
      "50% на Stellest Airwear Tint и Stellest 2.0 Airwear Tint при покупке прозрачных линз Stellest. 20% на Stellest Airwear Crizal Rock; 50% на Stellest Airwear Plano Crizal Prevencia (Sph 0,0 / Cyl 0,0).",
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
    title: "MiSight 1 Day 90 + 20 линз в подарок",
    description: "При покупке двух упаковок MiSight 1 Day 90 — ещё 20 линз в подарок.",
    href: "/catalog_s/kontaktnye_linzy_/",
    location: "spb",
  },
];
