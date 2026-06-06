/**
 * Cabinet (per-user) API client.
 *
 * Talks to the session-aware endpoints under `/api/store/` (me.php, orders.php,
 * profile_save.php, order_action.php). Unlike the catalog client, every call is
 * credentialed (`credentials: "include"`) so the Bitrix session cookie set by
 * `/auth/` is sent. Base URL comes from `VITE_BITRIX_API`; in production it is
 * the same origin as the app, so cookies flow automatically.
 *
 * Auth is never thrown as an error: `getMe()` resolves to `{ authorized:false }`
 * when logged out, and route loaders redirect to the native `/auth/` page.
 */
const BASE = (import.meta.env.VITE_BITRIX_API as string | undefined)?.replace(/\/$/, "") ?? "";
const url = (path: string) => `${BASE}/api/store/${path}`;

export interface Me {
  authorized: boolean;
  id?: number;
  login?: string;
  firstName?: string;
  lastName?: string;
  secondName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  bonus?: number;
}

export interface CabinetOrderItem {
  name: string;
  qty: number;
  price: number;
  slug: string | null;
  brand?: string;
  img: string | null;
}

export interface CabinetPayment {
  title: string;
  paid: boolean;
  paySystem: string;
  sum: number;
  accountNumber: string;
  date: string | null;
  receiptUrl: string | null;
}

export interface CabinetShipment {
  title: string;
  shipped: boolean;
  delivery: string;
  price: number;
  statusChip: string;
  deliveryLine: string;
  tracking: string | null;
}

export interface CabinetOrder {
  id: string;
  date: string;
  state: "progress" | "done" | "canceled";
  stateLabel: string;
  total: number;
  itemCount: number;
  itemSummary: string;
  payment: CabinetPayment | null;
  shipment: CabinetShipment | null;
  items: CabinetOrderItem[];
  canCancel: boolean;
}

export type OrderFilterParam = "current" | "history" | "all";

/** Current logged-in user, or `{ authorized:false }`. Only throws on network errors. */
export async function getMe(): Promise<Me> {
  if (!BASE) return { authorized: false };
  const res = await fetch(url("me.php"), { credentials: "include" });
  // 401 carries a valid {authorized:false} body — read it, don't throw.
  return (await res.json()) as Me;
}

/** The user's orders for the given bucket. Returns [] on any failure. */
export async function getOrders(filter: OrderFilterParam = "all"): Promise<CabinetOrder[]> {
  if (!BASE) return [];
  try {
    const res = await fetch(url(`orders.php?filter=${filter}`), { credentials: "include" });
    if (!res.ok) return [];
    const data = (await res.json()) as { orders?: CabinetOrder[] };
    return data.orders ?? [];
  } catch (e) {
    console.error("[account] getOrders:", e);
    return [];
  }
}

export interface SaveProfileInput {
  firstName: string;
  lastName: string;
  secondName: string;
  email: string;
  phone: string;
}

export async function saveProfile(
  input: SaveProfileInput,
): Promise<{ ok: boolean; user?: Me; error?: string }> {
  if (!BASE) return { ok: false, error: "API не настроен" };
  try {
    const res = await fetch(url("profile_save.php"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return (await res.json()) as { ok: boolean; user?: Me; error?: string };
  } catch (e) {
    console.error("[account] saveProfile:", e);
    return { ok: false, error: "Ошибка сети" };
  }
}

/** Cancel an order by its ACCOUNT_NUMBER (ownership enforced server-side). */
export async function cancelOrder(
  id: string,
): Promise<{ ok: boolean; error?: string; alreadyCanceled?: boolean }> {
  if (!BASE) return { ok: false, error: "API не настроен" };
  try {
    const res = await fetch(url("order_action.php"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", id }),
    });
    return (await res.json()) as { ok: boolean; error?: string; alreadyCanceled?: boolean };
  } catch (e) {
    console.error("[account] cancelOrder:", e);
    return { ok: false, error: "Ошибка сети" };
  }
}
