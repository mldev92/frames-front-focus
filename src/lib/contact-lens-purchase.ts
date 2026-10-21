import type { Product } from "@/data/types";
import type { EyePrescription, Prescription } from "@/lib/store/cart";

export const LENS_OPTION_FIELDS: Array<{
  key: Exclude<keyof NonNullable<Product["lensOptions"]>, "eyeModes" | "colors">;
  prescriptionKey: keyof EyePrescription;
}> = [
  { key: "sphere", prescriptionKey: "sphere" },
  { key: "cylinder", prescriptionKey: "cylinder" },
  { key: "axis", prescriptionKey: "axis" },
  { key: "addition", prescriptionKey: "addition" },
  { key: "curvatureRadius", prescriptionKey: "bc" },
  { key: "diameter", prescriptionKey: "diameter" },
];

export function lensPurchaseFields(product: Product) {
  return LENS_OPTION_FIELDS.filter(({ key }) => {
    const options = product.lensOptions?.[key]?.options;
    return Array.isArray(options) && options.length > 0;
  });
}

export function defaultLensEye(product: Product, current: EyePrescription = {}): EyePrescription {
  const next = { ...current };
  for (const { key, prescriptionKey } of lensPurchaseFields(product)) {
    if (!next[prescriptionKey]) {
      next[prescriptionKey] = product.lensOptions?.[key]?.options[0]?.label;
    }
  }
  return next;
}

export function defaultLensPrescription(
  product: Product,
  eyeMode: "same" | "different" = "same",
  current: Prescription = { right: {}, left: {} },
): Prescription {
  const right = defaultLensEye(product, current.right);
  const left = eyeMode === "same" ? { ...right } : defaultLensEye(product, current.left);
  return { right, left };
}

export function eyesEqual(a: EyePrescription, b: EyePrescription): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function lensPurchaseComplete(product: Product, value: Prescription): boolean {
  const optionFields = lensPurchaseFields(product);
  if (optionFields.length > 0) {
    return optionFields.every(({ prescriptionKey }) =>
      Boolean(value.right[prescriptionKey]) && Boolean(value.left[prescriptionKey]),
    );
  }

  const legacyFields = LENS_OPTION_FIELDS.filter(({ prescriptionKey }) =>
    (product[prescriptionKey]?.length ?? 0) > 0,
  );
  if (legacyFields.length > 0) {
    return legacyFields.every(({ prescriptionKey }) =>
      Boolean(value.right[prescriptionKey]) && Boolean(value.left[prescriptionKey]),
    );
  }

  // Облегчённый или действительно беспараметрический товар остаётся доступен
  // для покупки. Корзина сохранит сам товар, а отсутствующие параметры можно
  // уточнить позже; блокировка здесь не оставляет покупателю выхода.
  return true;
}
