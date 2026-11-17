import type { CartLine } from "./store/cart";

export interface RepeatOrderResult {
  ok: boolean;
  lines: CartLine[];
  unavailable: { name: string; reason: string }[];
  error?: string;
}

/** Применяем повтор целиком: ошибка не должна оставлять половину заказа в корзине. */
export function mergeRepeatedOrder(current: CartLine[], incoming: CartLine[]): CartLine[] {
  const next = [...current];
  for (const line of incoming) {
    if (!Number.isInteger(line.productId) || line.productId <= 0 || !line.lineId || !line.slug ||
      !Number.isFinite(line.price) || line.price <= 0 || !Number.isInteger(line.qty) || line.qty < 1 || line.qty > 20) {
      throw new Error("Не удалось подготовить товары для повтора заказа");
    }
    const index = next.findIndex((entry) => entry.lineId === line.lineId);
    const qty = line.qty + (index < 0 ? 0 : next[index].qty);
    if (qty > 20) throw new Error(`В корзине уже есть «${line.name}». Максимум — 20 шт. одного товара.`);
    const added = { ...line, qty };
    if (index < 0) next.push(added);
    else next[index] = added;
  }
  return next;
}
