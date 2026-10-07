export const LENS_LINE_FALLBACK_IMAGE = "/category_eyeglass_lenses_v3.webp";

export interface LensLineImageSource {
  name: string;
  brand: string;
  images: string[];
}

export interface ImageableLensLine {
  title: string;
  supplier: string;
}

const SUPPLIER_FALLBACKS: Record<string, RegExp> = {
  essilor: /^Orma Crizal Easy Pro UV$/i,
  hoya: /^Hilux Eyas/i,
  zeiss: /^ZEISS 1\.5 DV PLATINUM$/i,
};

const IGNORED_TOKENS = new Set([
  "as",
  "bct",
  "buc",
  "dv",
  "hmc",
  "lens",
  "rx",
  "single",
  "uv",
  "vision",
  "zeiss",
]);

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[хx]/g, "x")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .trim();
}

function supplierFromBrand(brand: string): string | null {
  const value = normalize(brand);
  if (value.includes("essilor") || value.includes("ессилор")) return "essilor";
  if (value.includes("hoya")) return "hoya";
  if (value.includes("zeiss")) return "zeiss";
  if (value.includes("synchrony")) return "synchrony";
  return null;
}

function meaningfulTokens(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !/^\d+$/.test(token) && !IGNORED_TOKENS.has(token));
}

function familyScore(title: string, productName: string): number {
  const cardTokens = meaningfulTokens(title);
  const productTokens = new Set(meaningfulTokens(productName));
  if (!cardTokens.length) return 0;

  let sharedWeight = 0;
  let totalWeight = 0;
  for (const token of cardTokens) {
    const weight = Math.max(2, token.length);
    totalWeight += weight;
    if (productTokens.has(token)) sharedWeight += weight;
  }

  let score = sharedWeight / totalWeight;
  if (cardTokens[0] && productTokens.has(cardTokens[0])) score += 0.35;
  const normalizedTitle = normalize(title);
  const normalizedProduct = normalize(productName);
  if (normalizedProduct.startsWith(normalizedTitle) || normalizedTitle.startsWith(normalizedProduct)) {
    score += 0.5;
  }
  return score;
}

function firstImage(source: LensLineImageSource | undefined): string | null {
  return source?.images.find(Boolean) ?? null;
}

export function lensLineImage(
  card: ImageableLensLine,
  sources: LensLineImageSource[],
): string {
  const sameSupplier = sources.filter((source) => supplierFromBrand(source.brand) === card.supplier);
  const ranked = sameSupplier
    .map((source) => ({ source, score: familyScore(card.title, source.name) }))
    .filter((item) => firstImage(item.source))
    .sort((left, right) => right.score - left.score);

  if (ranked[0]?.score >= 0.45) return firstImage(ranked[0].source) ?? LENS_LINE_FALLBACK_IMAGE;

  const fallbackPattern = SUPPLIER_FALLBACKS[card.supplier];
  const supplierFallback = fallbackPattern
    ? sameSupplier.find((source) => fallbackPattern.test(source.name))
    : undefined;
  return firstImage(supplierFallback) ?? LENS_LINE_FALLBACK_IMAGE;
}

export function attachLensLineImages<T extends ImageableLensLine>(
  cards: T[],
  sources: LensLineImageSource[],
): Array<T & { image: string }> {
  return cards.map((card) => ({ ...card, image: lensLineImage(card, sources) }));
}
