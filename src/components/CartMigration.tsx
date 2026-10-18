import { useEffect, useState } from "react";
import { securePost } from "@/lib/api/security";
import { useCart, type CartLine } from "@/lib/store/cart";

export function CartMigration() {
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!navigator.locks) { if (active) setFailed(true); return; }
      await navigator.locks.request("optika-cart-import", async () => {
        await useCart.persist.rehydrate();
        const result = await securePost<{ lines: CartLine[]; unmapped: { name: string }[] }>("basket_snapshot.php", {});
        useCart.getState().importLegacy(result.lines);
        if (active) setUnmapped(result.unmapped.map((row) => row.name));
      });
    };
    void run().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  if (!failed && !unmapped.length) return null;
  return <aside className="border-b bg-amber-50 px-4 py-3 text-sm" role="status">
    {failed ? "Не удалось проверить прежнюю корзину. " : `В прежней корзине остались товары: ${unmapped.join(", ")}. `}
    <a className="underline" href="/basket/?legacy=1">Открыть прежнюю корзину</a>
  </aside>;
}
