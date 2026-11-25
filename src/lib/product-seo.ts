import { decodeHTML } from "entities";
import type { Product } from "../data/types";

// Канонический URL задаёт дерево товара в API, а не адрес открытого alias.
export function productCanonicalUrl(product: Pick<Product, "canonicalPath">, fallback: string): string {
  const path = product.canonicalPath;
  if (path && /^\/catalog_[sn]\//.test(path) && !/[?#<>]/.test(path) && [...path].every(char => char.charCodeAt(0) >= 32)) {
    return new URL(path, "https://optika100.com").href;
  }
  return new URL(fallback, "https://optika100.com").href;
}

// Только текст для React metadata; результат нельзя вставлять как HTML.
export function descriptionTextFromHtml(html: string): string {
  return decodeHTML(html
    .replace(/<!--[^]*?-->/g, " ")
    .replace(/<(script|style|noscript|template)\b[^>]*>[^]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function productMetaDescription(
  product: Pick<Product, "description" | "descriptionHtml" | "name">,
): string {
  const description = product.description?.trim();
  if (description) return description;
  const text = descriptionTextFromHtml(product.descriptionHtml ?? "");
  if (!text) return `${product.name.trim()} — информация о товаре в ОПТИКА 100%.`;
  if (text.length <= 180) return text;
  const prefix = text.slice(0, 177);
  const lastSpace = prefix.lastIndexOf(" ");
  return `${lastSpace > 120 ? prefix.slice(0, lastSpace) : prefix}…`;
}

export function isStellestPrevenciaProduct(product: Pick<Product, "category" | "slug">): boolean {
  return product.category === "linzy-dlya-ochkov"
    && /^as_stellest_(?:2_0_)?crizal_prevencia$/.test(product.slug);
}

export const stellestRockProductPath = "/catalog_s/linzy_dlya_ochkov/detskie/as_stellest_crizal_rock/";

export function stellestProductScripts(product: Product, canonical: string) {
  const rock = product.id === 56366
    && canonical === "https://optika100.com" + stellestRockProductPath;
  if ((!rock && !isStellestPrevenciaProduct(product)) || !Number.isFinite(product.price) || product.price <= 0) {
    return [];
  }
  const availability = product.inStock === undefined
    ? undefined
    : `https://schema.org/${product.inStock ? "InStock" : "OutOfStock"}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: canonical,
    image: product.images[0] ? new URL(product.images[0], canonical).href : undefined,
    description: productMetaDescription(product),
    brand: { "@type": "Brand", name: "Essilor" },
    sku: product.slug,
    offers: {
      "@type": "Offer",
      url: canonical,
      price: product.price,
      priceCurrency: "RUB",
      priceValidUntil: rock && product.price === 8760 ? "2027-12-31" : undefined,
      availability,
    },
  };
  return [{ type: "application/ld+json", children: JSON.stringify(schema).replace(/</g, "\\u003c") }];
}
