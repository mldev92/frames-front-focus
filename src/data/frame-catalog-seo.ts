import type { CatalogPage } from "@/lib/api/bitrix";
import { frameLanding, WOMENS_FRAMES_PATH, LIONS_HEART_PATH } from "@/lib/frame-landing";
import { breadcrumbSchema } from "@/lib/seo-schema";
import { productCardHref } from "@/data/categories";

export function frameBreadcrumbs(path: string) {
  const kind = frameLanding(path);
  return [
    { label: "Главная", href: "/" },
    { label: "Оправы", href: "/catalog_s/opravy/" },
    {
      label: kind === "brand" ? "LION’S HEART" : "Женские оправы",
      href: `/catalog_s/${kind === "brand" ? LIONS_HEART_PATH : WOMENS_FRAMES_PATH}/`,
    },
  ];
}

export function frameCatalogSchemas(path: string, data: CatalogPage) {
  const kind = frameLanding(path);
  if (!kind) return [];
  const productPath = kind === "brand" ? "opravy" : WOMENS_FRAMES_PATH;
  return [
    breadcrumbSchema(frameBreadcrumbs(path)),
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: data.products.map((product, index) => ({
          "@type": "ListItem",
          position: (data.page - 1) * data.pageSize + index + 1,
          name: `${product.brand} ${product.name}`.trim(),
          url: `https://optika100.com${productCardHref(product, "spb", `/catalog_s/${productPath}`)}`,
        })),
      }).replace(/</g, "\\u003c"),
    },
  ];
}
