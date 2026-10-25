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

/** Диоптрии (сила и цилиндр) в списке идут по возрастанию: от больших минусов к плюсам. */
const DIOPTER_FIELDS = new Set<string>(["sphere", "cylinder"]);

/** «+3.75», «-4,50», «−0.25» → число; не число — null. */
export function parseDiopter(label: string): number | null {
  const value = Number.parseFloat(label.replace(/\u2212/g, "-").replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

/** Варианты параметра в порядке показа: диоптрии упорядочены по значению, остальные — как пришли. */
export function orderedLensOptions<T extends { label: string }>(key: string, options: T[]): T[] {
  if (!DIOPTER_FIELDS.has(key)) return options;
  const parsed = options.map((option) => ({ option, value: parseDiopter(option.label) }));
  if (parsed.some((item) => item.value === null)) return options;
  return parsed.sort((a, b) => (a.value as number) - (b.value as number)).map((item) => item.option);
}

/**
 * Вариант по умолчанию: для диоптрий — наименьший минус (−0,25 или −0,5), а если минусов нет —
 * наименьший плюс; для остальных параметров — первый вариант.
 */
export function defaultLensOption<T extends { label: string }>(key: string, options: T[]): T | undefined {
  const ordered = orderedLensOptions(key, options);
  if (!DIOPTER_FIELDS.has(key)) return ordered[0];
  const values = ordered.map((option) => parseDiopter(option.label));
  let best = -1;
  values.forEach((value, index) => {
    if (value !== null && value < 0 && (best < 0 || value > (values[best] as number))) best = index;
  });
  return ordered[best >= 0 ? best : 0];
}

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
      next[prescriptionKey] = defaultLensOption(key, product.lensOptions?.[key]?.options ?? [])?.label;
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
