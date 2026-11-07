import type { CatalogPage } from "@/lib/api/bitrix";
import { frameLanding } from "@/lib/frame-landing";
import { breadcrumbSchema } from "@/lib/seo-schema";
import { productCardHref } from "@/data/categories";
import { frameBrandForPath } from "./frame-brand-landings";
import { frameLandingTitle } from "@/lib/frame-landing";

export function frameBreadcrumbs(path: string) {
  const kind = frameLanding(path);
  const brand = frameBrandForPath(path);
  const normalized = path.replace(/^\/+|\/+$/g, "");
  const parents = [
    { label: "Главная", href: "/" },
    { label: "Оправы", href: "/catalog_s/opravy/" },
  ];
  return normalized === "opravy"
    ? parents
    : [
        ...parents,
        {
          label: brand?.name ?? (kind === "women" ? "Женские оправы" : frameLandingTitle(path)),
          href: `/catalog_s/${normalized}/`,
        },
      ];
}

export function frameCatalogSchemas(path: string, data: CatalogPage) {
  const kind = frameLanding(path);
  if (!kind) return [];
  const productPath = kind === "brand" ? "opravy" : path.replace(/^\/+|\/+$/g, "");
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
