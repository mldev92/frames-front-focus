import type { Category } from "./types";

export type CatalogBannerVariant = "category" | "service" | "guide" | "promo";

export interface CatalogBannerData {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  description?: string;
  cta?: string;
  href?: string;
  variant: CatalogBannerVariant;
  badge?: string;
  note?: string;
  meta?: string;
}

export const catalogBanners: CatalogBannerData[] = [
  {
    id: "sun",
    image: "/categ_sunglasses_v4.webp",
    eyebrow: "КАТЕГОРИЯ · ОЧКИ",
    title: "Солнцезащитные очки",
    description: "100% UV-защита и поляризация",
    cta: "Смотреть коллекцию",
    href: "/catalog_s/solntsezashchitnye_ochki/",
    variant: "category",
  },
  {
    id: "contacts",
    image: "/categ_contact_lens_v4.webp",
    eyebrow: "КАТЕГОРИЯ · ЛИНЗЫ",
    title: "Контактные линзы",
    description: "Однодневные, месячные, торические",
    cta: "Подобрать линзы",
    href: "/catalog_s/kontaktnye_linzy_/",
    variant: "category",
  },
  {
    id: "kids",
    image: "/categ_frames_v4.webp",
    eyebrow: "КАТЕГОРИЯ · ДЕТЯМ",
    title: "Детская оптика",
    description: "Лёгкие гибкие оправы для детей",
    cta: "Выбрать оправу",
    href: "/catalog_s/opravy/?gender=Детские",
    variant: "category",
  },
  {
    id: "diag",
    image: "/konsultaciya_oftalmologa.webp",
    eyebrow: "УСЛУГА",
    title: "Бесплатная проверка зрения",
    description: "Приём врача-оптометриста в салоне",
    cta: "Записаться",
    href: "/kabinet-diagnostiki-spb",
    variant: "service",
  },
  {
    id: "guide",
    image: "/article-pokrytiya-linz/combined-coatings.webp",
    eyebrow: "ЖУРНАЛ · ГАЙД",
    title: "Какое покрытие линз выбрать",
    description: "Антиблик, фотохром и защита от синего света",
    cta: "Читать в журнале",
    href: "/blog/linzy-dlya-ochkov/pokrytiya-linz-dlya-ochkov/",
    variant: "guide",
  },
  {
    id: "promo",
    image: "/2_banner.webp",
    eyebrow: "АКЦИЯ",
    title: "−20% на вторую пару",
    description: "Для Вас и Ваших близких",
    variant: "promo",
    badge: "−20%",
    meta: "Реферальная программа · 6 месяцев",
    note: "Скидка действует на повторный заказ очков по номеру вашего заказа для вас или ваших близких.",
  },
];

const excludedBannerByCategory: Partial<Record<Category, string>> = {
  opravy: "kids",
  solntsezashchitnye: "sun",
  "kontaktnye-linzy": "contacts",
};

export function getCatalogBanners(category?: Category) {
  const excludedId = category ? excludedBannerByCategory[category] : undefined;
  return excludedId ? catalogBanners.filter((banner) => banner.id !== excludedId) : catalogBanners;
}
