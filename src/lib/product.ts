import type { Product } from "@/data/types";

export function getProductDisplayBrand(product: Product): string {
  const explicitBrand = product.brand.trim();
  if (explicitBrand) return explicitBrand;

  const latinTokens = product.name.match(/\b[A-Z][A-Z0-9.-]{2,}\b/g);
  return latinTokens?.find((token) => !/^(FSV|UC|UV)$/i.test(token)) ?? "";
}
