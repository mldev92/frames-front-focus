import type { CartLine } from "./store/cart";

export type CartPriceUpdate = Pick<CartLine, "lineId" | "productId" | "offerId" | "catalogNamespace" | "price">;

// Ответ меняет только цену: удалённые позиции, количество и рецепт не восстанавливаются.
export function applyCartPrices(lines: CartLine[], updates: CartPriceUpdate[]): CartLine[] {
  let changed = false;
  const next = lines.map((line) => {
    const update = updates.find((item) => item.lineId === line.lineId
      && item.productId === line.productId && item.catalogNamespace === line.catalogNamespace
      && (item.offerId ?? null) === (line.offerId ?? null));
    if (!update || !Number.isFinite(update.price) || update.price <= 0
      || (line.price === update.price && line.authoritativeBasePrice === update.price)) return line;
    changed = true;
    return { ...line, price: update.price, authoritativeBasePrice: update.price };
  });
  return changed ? next : lines;
}
