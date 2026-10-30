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
