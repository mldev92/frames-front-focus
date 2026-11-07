// Отсутствующая цена Bitrix не должна превращаться в бесплатный товар.
export function hasProductPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function formatProductPrice(value: unknown, quantity = 1): string {
  if (!hasProductPrice(value)) return "Цена по запросу";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency", currency: "RUB", maximumFractionDigits: 0,
  }).format(value * quantity);
}
