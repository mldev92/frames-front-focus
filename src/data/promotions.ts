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

export const promoBanner: PromoBannerData = {
  tag: "Акция · до 31 мая",
  title: "Вторая пара очков −50%",
  description:
    "При покупке очков с диоптриями — вторые в подарок: солнцезащитные, для чтения или вторая пара ежедневных. Скидка 50% на оправу второй пары.",
  ctaLabel: "Забронировать",
  ctaHref: "/uslugi",
  endsAt: new Date("2025-05-31T23:59:59"),
};

export const promotions: Promotion[] = [
  {
    id: "rayban-40",
    badge: "Хит",
    badgeVariant: "brand",
    visual: "brand",
    pct: "−40%",
    image: "/promo_banner_1.png",
    title: "Скидка на солнцезащитные Ray-Ban",
    description:
      "На всю коллекцию 2025 года — солнцезащитные, поляризационные, с диоптриями.",
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "diagnostics-free",
    badge: "Акция",
    badgeVariant: "neutral",
    visual: "cream",
    image: "/promo_banner_2.png",
    title: "Бесплатная диагностика зрения",
    description:
      "Запишитесь к офтальмологу — полная проверка зрения и подбор линз бесплатно.",
    expiresAt: new Date("2025-06-15T23:59:59"),
  },
  {
    id: "student",
    badge: "Для студентов",
    badgeVariant: "neutral",
    visual: "dark",
    pct: "−15%",
    image: "/promo_banner_3.png",
    title: "Студенческая скидка 15%",
    description:
      "Предъявите студенческий билет в салоне и получите скидку 15% на любые оправы.",
  },
];
