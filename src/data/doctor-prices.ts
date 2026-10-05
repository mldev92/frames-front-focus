import type { CityCode } from "@/lib/store/city";

/** Источник: «Услуги врача.xlsx», листы «СПБ» и «Новокузнецк». */
const prices = {
  biometry: { spb: 1800 },
  eyePressure: { spb: 900 },
  adultConsultation: { spb: 2300, nvk: 1000 },
  eyelidMassage: { spb: 600 },
  contactLensHandling: { spb: 300, nvk: 300 },
  contactLensTraining: { spb: 600, nvk: 600 },
  contactLensSelection: { spb: 1500, nvk: 1200 },
  pediatricInitial: { spb: 2300, nvk: 1800 },
  pediatricFollowUp: { spb: 1300, nvk: 1300 },
  pediatricScreening: { spb: 800, nvk: 800 },
} as const;

export const doctorPrices: { name: string; prices: Partial<Record<CityCode, number>> }[] = [
  { name: "Биометрия Lenstar LS 900 (Швейцария)", prices: prices.biometry },
  { name: "Измерение ВГД аппаратом I-CARE (Финляндия)", prices: prices.eyePressure },
  { name: "Консультация врача-офтальмолога (от 18 лет)", prices: prices.adultConsultation },
  { name: "Массаж век медицинский", prices: prices.eyelidMassage },
  { name: "Надевание / снятие МКЛ", prices: prices.contactLensHandling },
  { name: "Обучение и примерка МКЛ", prices: prices.contactLensTraining },
  { name: "Подбор МКЛ", prices: prices.contactLensSelection },
  { name: "Приём детского врача первичный", prices: prices.pediatricInitial },
  { name: "Приём детского врача повторный", prices: prices.pediatricFollowUp },
  { name: "Профосмотр для детей", prices: prices.pediatricScreening },
];

export const spbBiometryPrice = prices.biometry.spb;

export const doctorPricesFor = (city: CityCode) =>
  doctorPrices.flatMap((row) => {
    const price = row.prices[city];
    return price === undefined ? [] : [{ name: row.name, price }];
  });

export const doctorServicePrice = (slug: string, city: CityCode) => {
  if (slug === "priem-vracha") return prices.adultConsultation[city];
  if (slug === "diagnostika") return prices.pediatricInitial[city];
  return undefined;
};
