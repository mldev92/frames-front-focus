import { catalogSectionTitle } from "./categories.ts";
import type { CityCode } from "../lib/store/city";
import { frameBrandForPath } from "./frame-brand-landings.ts";
import { frameCategoryForPath } from "./frame-category-landings.ts";

export interface CatalogSeoEntry {
  metaTitle: string;
  metaDescription: string;
  content: "colored" | "multifocal" | "women-frames" | "brand-frames" | "frame-category";
}

const sectionSeo: Record<string, CatalogSeoEntry> = {
  "opravy/zhenskie": {
    metaTitle: "Женские оправы для очков в Санкт-Петербурге — Оптика 100%",
    metaDescription:
      "Женские оправы для очков в Санкт-Петербурге: кошачий глаз, бабочка, прямоугольные модели. Фильтры по бренду, форме, материалу и цене. Примерка на Кирочной, 17.",
    content: "women-frames",
  },
  "kontaktnye_linzy_/tsvetnye": {
    metaTitle: "Цветные контактные линзы — купить в Санкт-Петербурге | Оптика 100%",
    metaDescription:
      "Цветные контактные линзы в Санкт-Петербурге: оттеночные и непрозрачные модели. Цены и наличие в каталоге Оптика 100%, помощь специалиста в подборе.",
    content: "colored",
  },
  "kontaktnye_linzy_/multifokalnye": {
    metaTitle: "Мультифокальные контактные линзы — купить в СПб | Оптика 100%",
    metaDescription:
      "Мультифокальные контактные линзы для зрения вдаль и вблизи. Цены и наличие в Санкт-Петербурге, профессиональный подбор в Оптика 100%.",
    content: "multifocal",
  },
};

export function catalogSeoForSection(sectionPath: string) {
  const normalized = sectionPath.replace(/^\/+|\/+$/g, "");
  const brand = frameBrandForPath(normalized);
  if (brand)
    return {
      metaTitle: `Оправы ${brand.name} в Санкт-Петербурге — Оптика 100%`,
      metaDescription: brand.description,
      content: "brand-frames" as const,
    };
  const category = frameCategoryForPath(normalized);
  if (category)
    return {
      metaTitle: `${category.title}${category.path === "opravy" ? "" : " для очков"} в Санкт-Петербурге — Оптика 100%`,
      metaDescription: category.description,
      content: "frame-category" as const,
    };
  return sectionSeo[normalized];
}

// Редакционные SEO-тексты сохраняем; остальные разделы получают имя своей ветки.
export function catalogSectionMetadata(
  sectionPath: string,
  fallback: { title: string; metaTitle: string; metaDescription: string },
  city: CityCode = "spb",
) {
  const normalized = sectionPath.replace(/^\/+|\/+$/g, "");
  const editorial = city === "spb" ? catalogSeoForSection(normalized) : undefined;
  if (editorial)
    return { metaTitle: editorial.metaTitle, metaDescription: editorial.metaDescription };
  const title = catalogSectionTitle(normalized, fallback.title);
  if (!normalized.includes("/") && city === "spb") {
    return { metaTitle: fallback.metaTitle, metaDescription: fallback.metaDescription };
  }
  const location = city === "nvk" ? "Новокузнецке" : "Санкт-Петербурге";
  return {
    metaTitle: `${title} — каталог в ${location} · ОПТИКА 100%`,
    metaDescription: `${title} в ${location}. Модели, характеристики, цены и наличие в каталоге ОПТИКА 100%.`,
  };
}
