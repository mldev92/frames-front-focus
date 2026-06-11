import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CityCode = "spb" | "nvk";

interface CityStore {
  city: CityCode;
  hydrated: boolean;
  setCity: (city: CityCode) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      city: "spb",
      hydrated: false,
      setCity: (city) => set({ city }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "o100-city-v2",
      partialize: (state) => ({ city: state.city }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export const CITY_LABELS: Record<CityCode, string> = {
  spb: "Санкт-Петербург",
  nvk: "Новокузнецк",
};
