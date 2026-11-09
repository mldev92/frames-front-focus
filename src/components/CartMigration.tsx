import { useEffect, useState } from "react";
import { refreshLegacyBasket } from "@/lib/cart-legacy-sync";

export function CartMigration() {
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [expired, setExpired] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const run = async () => {
      const result = await refreshLegacyBasket();
      if (!active) return;
      setUnmapped(result.unmapped.map((row) => row.name));
      setExpired(result.removed.map((row) => row.name));
    };
    void run().catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);
  if (!failed && !unmapped.length && !expired.length) return null;
  return <aside className="border-b bg-amber-50 px-4 py-3 text-sm" role="status">
    {failed ? "Не удалось проверить прежнюю корзину. " : null}
    {expired.length ? `Сеанс прежней корзины изменился. Проверьте товары и добавьте заново, если нужны: ${expired.join(", ")}. ` : null}
    {unmapped.length ? `В прежней корзине остались товары: ${unmapped.join(", ")}. ` : null}
    <a className="underline" href="/basket/?legacy=1">Открыть прежнюю корзину</a>
  </aside>;
}
