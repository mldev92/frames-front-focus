import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { getStoreApiUrl, invalidateProductPrices } from "@/lib/api/bitrix";
import { apiFetch } from "@/lib/api/security";
import { useCart } from "@/lib/store/cart";
import type { CartPriceUpdate } from "@/lib/cart-prices";
import type { Product } from "@/data/types";

const REFRESH_MS = 60_000;

// Статический HTML нужен для первого показа; цены после гидратации берём из API.
export function StorefrontFreshness() {
  const router = useRouter();
  const lines = useCart((state) => state.lines);
  const isOpen = useCart((state) => state.isOpen);
  const lineKey = JSON.stringify(lines.map((line) => [line.lineId, line.productId, line.offerId]));
  const [cartError, setCartError] = useState(false);

  useEffect(() => {
    let pending = false;
    let lastRefresh = 0;
    const refresh = async () => {
      if (document.visibilityState === "hidden" || pending || Date.now() - lastRefresh < 1000) return;
      const path = router.state.location.pathname;
      if (path !== "/" && !/^\/catalog_[sn]\//.test(path)) return;
      pending = true;
      lastRefresh = Date.now();
      invalidateProductPrices();
      try { await router.invalidate(); }
      finally { pending = false; }
    };
    const trigger = () => { void refresh().catch(() => undefined); };
    trigger();
    const timer = window.setInterval(trigger, REFRESH_MS);
    window.addEventListener("focus", trigger);
    window.addEventListener("online", trigger);
    document.addEventListener("visibilitychange", trigger);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", trigger);
      window.removeEventListener("online", trigger);
      document.removeEventListener("visibilitychange", trigger);
    };
  }, [router]);

  useEffect(() => {
    let active = true;
    let pending = false;
    const controller = new AbortController();
    const refresh = async () => {
      if (document.visibilityState === "hidden" || pending) return;
      const current = useCart.getState().lines;
      if (!current.length) { setCartError(false); return; }
      pending = true;
      try {
        const updates: CartPriceUpdate[] = [];
        let failed = false;
        // Последовательно: длинная сохранённая корзина не создаёт всплеск запросов.
        for (const line of current) {
          if (!active) return;
          try {
            const city = line.catalogNamespace === "catalog_n" ? "nvk" : "spb";
            const query = new URLSearchParams({ slug: line.slug, city });
            const section = line.canonicalPath.split("/").filter(Boolean).at(-2);
            if (section) query.set("section", section);
            if (line.offerId) query.set("offerId", String(line.offerId));
            const response = await apiFetch(getStoreApiUrl(`product.php?${query}`), {
              cache: "no-store", signal: controller.signal,
            });
            if (!response.ok) throw new Error("Price unavailable");
            const product = await response.json() as Product;
            if (product.id !== line.productId || !Number.isFinite(product.price) || product.price <= 0) {
              throw new Error("Invalid product price");
            }
            updates.push({ ...line, price: product.price });
          } catch { failed = true; }
        }
        if (active) {
          useCart.getState().updatePrices(updates);
          setCartError(failed);
        }
      } finally { pending = false; }
    };
    const trigger = () => { void refresh().catch(() => { if (active) setCartError(true); }); };
    trigger();
    const timer = window.setInterval(trigger, REFRESH_MS);
    window.addEventListener("focus", trigger);
    window.addEventListener("online", trigger);
    document.addEventListener("visibilitychange", trigger);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", trigger);
      window.removeEventListener("online", trigger);
      document.removeEventListener("visibilitychange", trigger);
    };
  }, [lineKey, isOpen]);

  if (!cartError || !lines.length) return null;
  return <aside role="status" className="border-b bg-amber-50 px-4 py-3 text-sm">
    Не удалось обновить цены некоторых товаров в корзине. Итоговая стоимость будет проверена перед подтверждением заказа.
  </aside>;
}
