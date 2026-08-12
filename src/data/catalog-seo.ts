export interface CatalogSeoEntry {
  metaTitle: string;
  metaDescription: string;
  content: "colored" | "multifocal";
}

const sectionSeo: Record<string, CatalogSeoEntry> = {
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
  return sectionSeo[normalized];
}
