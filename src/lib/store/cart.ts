import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { Product } from "@/data/types";

export interface CartLine {
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  color?: string;
  lensLabel?: string;
  lensPrice?: number;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  saved: string[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (
    product: Product,
    opts?: {
      color?: string;
      qty?: number;
      openDrawer?: boolean;
      image?: string;
      lensLabel?: string;
      lensPrice?: number;
    },
  ) => void;
  remove: (slug: string, color?: string, lensLabel?: string) => void;
  setQty: (slug: string, qty: number, color?: string, lensLabel?: string) => void;
  clear: () => void;
  toggleSaved: (slug: string) => void;
  totals: () => { count: number; subtotal: number };
}

const memoryStorage = new Map<string, string>();
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function readCartCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function writeCartCookie(name: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${CART_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function removeCartCookie(name: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
}

const cartStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") {
      return memoryStorage.get(name) ?? null;
    }

    try {
      return window.localStorage.getItem(name) ?? readCartCookie(name);
    } catch {
      return readCartCookie(name) ?? memoryStorage.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") {
      memoryStorage.set(name, value);
      return;
    }

    try {
      window.localStorage.setItem(name, value);
    } catch {}

    writeCartCookie(name, value);
    memoryStorage.set(name, value);
  },
  removeItem: (name) => {
    if (typeof window === "undefined") {
      memoryStorage.delete(name);
      return;
    }

    try {
      window.localStorage.removeItem(name);
    } catch {}

    removeCartCookie(name);
    memoryStorage.delete(name);
  },
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      saved: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (product, opts) => {
        const color = opts?.color;
        const lensLabel = opts?.lensLabel;
        const lensPrice = opts?.lensPrice ?? 0;
        const qty = opts?.qty ?? 1;
        const openDrawer = opts?.openDrawer ?? true;
        const existing = get().lines.find(
          (l) => l.slug === product.slug && l.color === color && l.lensLabel === lensLabel,
        );
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l === existing ? { ...l, qty: l.qty + qty } : l,
            ),
            isOpen: openDrawer,
          });
        } else {
          set({
            lines: [
              ...get().lines,
              {
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                price: product.price + lensPrice,
                image: opts?.image ?? product.images[0],
                color,
                lensLabel,
                lensPrice: opts?.lensPrice,
                qty,
              },
            ],
            isOpen: openDrawer,
          });
        }
      },
      remove: (slug, color, lensLabel) =>
        set({
          lines: get().lines.filter(
            (l) => !(l.slug === slug && l.color === color && l.lensLabel === lensLabel),
          ),
        }),
      setQty: (slug, qty, color, lensLabel) =>
        set({
          lines: get().lines.map((l) =>
            l.slug === slug && l.color === color && l.lensLabel === lensLabel
              ? { ...l, qty: Math.max(1, qty) }
              : l,
          ),
        }),
      clear: () => set({ lines: [] }),
      toggleSaved: (slug) =>
        set({
          saved: get().saved.includes(slug)
            ? get().saved.filter((s) => s !== slug)
            : [...get().saved, slug],
        }),
      totals: () => {
        const lines = get().lines;
        return {
          count: lines.reduce((s, l) => s + l.qty, 0),
          subtotal: lines.reduce((s, l) => s + l.qty * l.price, 0),
        };
      },
    }),
    {
      name: "optika-cart",
      storage: createJSONStorage(() => cartStorage),
    },
  ),
);

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
