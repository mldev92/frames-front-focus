import { productHref, catalogHref } from "../data/categories.ts";
import type { Product, Category } from "../data/types";
import type { CityCode } from "./store/city";

export const SEARCH_ALIASES = [
  { name: "GUESS", aliases: ["гесс", "гэс", "гуесс"] },
  { name: "Stellest", aliases: ["стеллест", "стелест"] },
  {
    name: "LION`S HEART",
    aliases: ["лайонс харт", "лионс харт", "лайонсхарт", "lions heart", "lion’s heart"],
  },
  { name: "SILHOUETTE", aliases: ["силуэт", "силуэтт"] },
  { name: "STEPPER", aliases: ["степпер"] },
  { name: "CARRERA", aliases: ["каррера"] },
  { name: "HUGO BOSS", aliases: ["хуго босс", "хьюго босс"] },
  { name: "ANA HICKMANN", aliases: ["ана хикман", "анна хикман"] },
  { name: "FURLA", aliases: ["фурла"] },
];

export function normalizeSearchText(value: string) {
  return value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function canonicalSearchQuery(value: string) {
  const query = value.trim().replace(/\s+/g, " ").slice(0, 120);
  const normalized = normalizeSearchText(query);
  for (const entry of SEARCH_ALIASES) {
    for (const alias of entry.aliases) {
      const key = normalizeSearchText(alias);
      if (normalized === key || normalized.startsWith(`${key} `)) {
        return `${entry.name}${query.slice(key.length)}`.slice(0, 120);
      }
    }
  }
  if (normalized.length >= 3) {
    const matches = SEARCH_ALIASES.filter((entry) =>
      entry.aliases.some((alias) => normalizeSearchText(alias).startsWith(normalized)),
    );
    if (matches.length === 1) return matches[0].name;
  }
  return query;
}

export function matchesSearchBrand(name: string, query: string) {
  const compact = (text: string) => normalizeSearchText(text).replace(/[^\p{L}\p{N}]/gu, "");
  const term = compact(canonicalSearchQuery(query));
  return !term || compact(name).includes(term);
}

export interface SearchBrand {
  name: string;
  category: Category;
  searchOnly?: boolean;
}

export function searchBrandHref(brand: SearchBrand, city: CityCode) {
  if (brand.searchOnly) return fullSearchHref(brand.name, city);
  if (city === "spb" && brand.category === "opravy" && brand.name === "LION`S HEART")
    return "/catalog_s/opravy/lions-heart/";
  return `${catalogHref(brand.category, city)}?brand=${encodeURIComponent(brand.name)}`;
}

export function searchProductHref(product: Product, city: CityCode) {
  const prefix = city === "nvk" ? "/catalog_n/" : "/catalog_s/";
  const path = product.canonicalPath;
  if (
    path?.startsWith(prefix) &&
    !/[\\?#]/.test(path) &&
    !path.includes("//") &&
    !path.split("/").includes("..")
  )
    return path;
  return productHref(product.category, encodeURIComponent(product.slug), city);
}

export function fullSearchHref(query: string, city: CityCode) {
  return `/search/?${new URLSearchParams({ q: query.trim().slice(0, 120), city })}`;
}

export function lensSearchHref(query: string, city: CityCode) {
  return `${catalogHref("linzy-dlya-ochkov", city)}?${new URLSearchParams({ lensQuery: canonicalSearchQuery(query) })}`;
}
