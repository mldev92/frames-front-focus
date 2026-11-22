import type { ContactMyopiaModel, SpectacleMyopiaModel } from "@/data/myopia-lenses";
import type { Product } from "@/data/types";
import type { LensLineCard } from "@/lib/api/lens-recommend";

export function spectaclePairPrice(
  model: SpectacleMyopiaModel,
  lines: Pick<LensLineCard, "id" | "fromPriceRub">[],
): number | undefined {
  let lowest: number | undefined;
  for (const { id, fromPriceRub: price } of lines) {
    if (
      !model.catalogLineIds.includes(id) ||
      model.conditionalLineIds?.includes(id) ||
      price === null ||
      !Number.isFinite(price) ||
      price <= 0
    )
      continue;
    if (lowest === undefined || price < lowest) lowest = price;
  }
  return lowest === undefined ? undefined : lowest * 2;
}

export function contactPackPrice(
  model: ContactMyopiaModel,
  products: Pick<Product, "slug" | "name" | "price">[],
): number | undefined {
  const product = products.find(({ slug }) => slug === model.catalogSlug);
  const pack = product?.name.match(/(?:^|[^\d])(\d+)\s*шт\.?/iu);
  return product &&
    Number(pack?.[1]) === model.packSize &&
    Number.isFinite(product.price) &&
    product.price > 0
    ? product.price
    : undefined;
}
