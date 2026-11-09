import { securePost } from "@/lib/api/security";
import { useCart, type CartLine } from "@/lib/store/cart";

interface LegacySnapshot {
  lines: CartLine[];
  unmapped: { name: string }[];
}

export interface LegacyRefresh extends LegacySnapshot {
  removed: CartLine[];
}

export async function refreshLegacyBasket(): Promise<LegacyRefresh> {
  const run = async (): Promise<LegacyRefresh> => {
    await useCart.persist.rehydrate();
    const snapshot = await securePost<LegacySnapshot>("basket_snapshot.php", {});
    const removed = useCart.getState().importLegacy(snapshot.lines);
    useCart.getState().setLegacySyncStatus("ready");
    return { ...snapshot, removed };
  };

  try {
    return navigator.locks
      ? await navigator.locks.request("optika-cart-import", run)
      : await run();
  } catch (error) {
    useCart.getState().setLegacySyncStatus("failed");
    throw error;
  }
}
