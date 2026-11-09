// Обязательные зависимости оформления, включая список пунктов СДЭК.
export const checkoutRuntimeFiles = ["_bootstrap.php", "_security.php", "_session.php", "_index.php", "_facets.php", "csrf.php", "order_pickup_points.php", "_checkout.php", "order_quote.php", "order_delivery.php", "order_create.php"];
export function verifyCheckoutRuntime(files) {
  for (const file of checkoutRuntimeFiles) {
    if (!/^[a-f0-9]{64}$/.test(files?.[`api/store/${file}`] ?? "")) throw new Error("Checkout runtime dependency missing: " + file);
  }
}
