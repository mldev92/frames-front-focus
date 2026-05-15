import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/types";

export interface CartLine {
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  color?: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  saved: string[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, opts?: { color?: string; qty?: number; openDrawer?: boolean }) => void;
  remove: (slug: string, color?: string) => void;
  setQty: (slug: string, qty: number, color?: string) => void;
  clear: () => void;
  toggleSaved: (slug: string) => void;
  totals: () => { count: number; subtotal: number };
}

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
        const qty = opts?.qty ?? 1;
        const openDrawer = opts?.openDrawer ?? true;
        const existing = get().lines.find(
          (l) => l.slug === product.slug && l.color === color,
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
                price: product.price,
                image: product.images[0],
                color,
                qty,
              },
            ],
            isOpen: openDrawer,
          });
        }
      },
      remove: (slug, color) =>
        set({
          lines: get().lines.filter(
            (l) => !(l.slug === slug && l.color === color),
          ),
        }),
      setQty: (slug, qty, color) =>
        set({
          lines: get().lines.map((l) =>
            l.slug === slug && l.color === color ? { ...l, qty: Math.max(1, qty) } : l,
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
    { name: "optika-cart" },
  ),
);

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
