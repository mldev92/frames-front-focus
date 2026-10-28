import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CityCode = "spb" | "nvk";
export type RegionCode = CityCode | "all";

/**
 * Регион по умолчанию для нового посетителя — «Вся Россия» (каталог Санкт-Петербурга, свои списки
 * главной из админки). Страницы предзаполняются именно для него; сохранённый выбор посетителя главнее.
 */
export const DEFAULT_REGION: RegionCode = "all";

interface CityStore {
  city: CityCode;
  region: RegionCode;
  hydrated: boolean;
  setCity: (city: CityCode) => void;
  setRegion: (region: RegionCode) => void;
  setHydrated: (hydrated: boolean) => void;
}

/**
 * Восстановление сохранённого выбора. Ничего не сохранено — новый посетитель остаётся в регионе
 * по умолчанию, а не «в городе»; старый формат хранил только город, и этот выбор сохраняется.
 */
export function mergeSavedRegion<T extends Pick<CityStore, "city" | "region">>(persisted: unknown, current: T): T {
  const saved = persisted as Partial<Pick<CityStore, "city" | "region">> | undefined;
  if (!saved) return current;
  const city: CityCode = saved.city === "nvk" ? "nvk" : "spb";
  const region: RegionCode =
    saved.region === "all" || saved.region === "nvk" || saved.region === "spb" ? saved.region : city;
  return { ...current, city: region === "nvk" ? "nvk" : "spb", region };
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      city: "spb",
      region: DEFAULT_REGION,
      hydrated: false,
      setCity: (city) =>
        set((state) => ({
          city,
          region: state.region === "all" && city === "spb" ? "all" : city,
        })),
      setRegion: (region) => set({ region, city: region === "nvk" ? "nvk" : "spb" }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "o100-city-v2",
      skipHydration: true,
      partialize: (state) => ({ city: state.city, region: state.region }),
      merge: (persisted, current) => mergeSavedRegion(persisted, current),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export const CITY_LABELS: Record<CityCode, string> = {
  spb: "Санкт-Петербург",
  nvk: "Новокузнецк",
};

export const REGION_LABELS: Record<RegionCode, string> = {
  ...CITY_LABELS,
  all: "Вся Россия",
};
