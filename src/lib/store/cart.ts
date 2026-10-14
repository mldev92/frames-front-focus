import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/types";
import type { CityCode } from "@/lib/store/city";
import type { LensRecommendCard } from "@/lib/api/lens-recommend";

export interface LensCartSelection {
  id: string;
  name: string;
  brand: string;
  index: number | null;
  coating: string;
  treatment: string;
  pricePerLens: number | null;
  priceBeforeDiscountPerLens?: number | null;
  discountPercent?: number | null;
  qty: number;
}

export interface EyePrescription {
  sphere?: string;
  cylinder?: string;
  axis?: string;
  addition?: string;
  bc?: string;
  diameter?: string;
}

export interface Prescription {
  right: EyePrescription;
  left: EyePrescription;
}

export interface CartLine {
  lineId: string;
  productId: number;
  slug: string;
  name: string;
  brand: string;
  category: Product["category"];
  catalogNamespace: "catalog_s" | "catalog_n";
  canonicalPath: string;
  authoritativeBasePrice: number;
  price: number;
  image: string;
  parameters: {
    color?: string;
    prescription?: Prescription;
    purpose?: string;
    lensEyeMode?: "same" | "different";
  };
  qty: number;
}

interface CartState {
  lines: CartLine[];
  lensSelections: LensCartSelection[];
  saved: string[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (
    product: Product,
    opts?: {
      color?: string;
      prescription?: Prescription;
      purpose?: string;
      lensEyeMode?: "same" | "different";
      city?: CityCode;
      qty?: number;
      openDrawer?: boolean;
      image?: string;
    },
  ) => void;
  addLens: (offer: LensRecommendCard) => void;
  removeLens: (id: string) => void;
  clearLens: () => void;
  remove: (lineId: string) => void;
  setQty: (lineId: string, qty: number) => void;
  clear: () => void;
  toggleSaved: (slug: string) => void;
  totals: () => { count: number; subtotal: number };
}

function lineIdentity(
  product: Product,
  city: CityCode,
  parameters: CartLine["parameters"],
): string {
  return [
    city,
    product.id,
    parameters.color ?? "",
    parameters.purpose ?? "",
    parameters.lensEyeMode ?? "",
    JSON.stringify(parameters.prescription ?? null),
  ].join(":");
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      lensSelections: [],
      saved: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (product, opts) => {
        if (!Number.isInteger(product.id) || (product.id ?? 0) <= 0) {
          throw new Error("Товар не содержит Bitrix ID");
        }
        const productId = product.id as number;
        const city = opts?.city ?? "spb";
        const parameters = {
          color: opts?.color,
          prescription: opts?.prescription,
          purpose: opts?.purpose,
          lensEyeMode: opts?.lensEyeMode,
        };
        const lineId = lineIdentity({ ...product, id: productId }, city, parameters);
        const qty = opts?.qty ?? 1;
        const openDrawer = opts?.openDrawer ?? true;
        const existing = get().lines.find((line) => line.lineId === lineId);
        if (existing) {
          set({
            lines: get().lines.map((line) =>
              line.lineId === lineId ? { ...line, qty: line.qty + qty } : line,
            ),
            isOpen: openDrawer,
          });
          return;
        }
        const namespace = city === "nvk" ? "catalog_n" : "catalog_s";
        set({
          lines: [
            ...get().lines,
            {
              lineId,
              productId,
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              category: product.category,
              catalogNamespace: namespace,
              canonicalPath: (
                product.canonicalPath ??
                `/${namespace}/${product.category}/${product.slug}/`
              ).replace(/^\/catalog_[sn]/, `/${namespace}`),
              authoritativeBasePrice: product.price,
              price: product.price,
              image: opts?.image ?? product.images[0] ?? "",
              parameters,
              qty,
            },
          ],
          isOpen: openDrawer,
        });
      },
      addLens: (offer) => set((state) => {
        const existing = state.lensSelections.find((item) => item.id === offer.id);
        return {
          lensSelections: existing
            ? state.lensSelections.map((item) => item.id === offer.id ? { ...item, qty: item.qty + 1 } : item)
            : [...state.lensSelections, {
                id: offer.id,
                name: offer.line,
                brand: offer.supplier.toUpperCase(),
                index: offer.index,
                coating: offer.coating,
                treatment: offer.treatment,
                pricePerLens: offer.priceRub,
                priceBeforeDiscountPerLens: offer.priceBeforeDiscountRub,
                discountPercent: offer.discountPercent,
                qty: 1,
              }],
          isOpen: true,
        };
      }),
      removeLens: (id) => set((state) => ({ lensSelections: state.lensSelections.filter((item) => item.id !== id) })),
      clearLens: () => set({ lensSelections: [] }),
      remove: (lineId) =>
        set({ lines: get().lines.filter((line) => line.lineId !== lineId) }),
      setQty: (lineId, qty) =>
        set({
          lines: get().lines.map((line) =>
            line.lineId === lineId ? { ...line, qty: Math.max(1, Math.min(20, qty)) } : line,
          ),
        }),
      clear: () => set({ lines: [] }),
      toggleSaved: (slug) =>
        set({
          saved: get().saved.includes(slug)
            ? get().saved.filter((savedSlug) => savedSlug !== slug)
            : [...get().saved, slug],
        }),
      totals: () => {
        const lines = get().lines;
        const lensSelections = get().lensSelections;
        return {
          count: lines.reduce((sum, line) => sum + line.qty, 0) + lensSelections.reduce((sum, item) => sum + item.qty, 0),
          subtotal: lines.reduce((sum, line) => sum + line.qty * line.price, 0),
        };
      },
    }),
    {
      name: "optika-cart",
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<CartState>;
        return {
          ...state,
          lines: Array.isArray(state.lines)
            ? state.lines.filter(
                (line): line is CartLine =>
                  typeof line === "object" &&
                  line !== null &&
                  Number.isInteger((line as CartLine).productId) &&
                  typeof (line as CartLine).lineId === "string",
              )
            : [],
        } as CartState;
      },
    },
  ),
);

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
