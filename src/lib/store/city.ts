import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CityCode = "spb" | "nvk";

interface CityStore {
  city: CityCode;
  setCity: (city: CityCode) => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      city: "spb",
      setCity: (city) => set({ city }),
    }),
    { name: "o100-city-v2" },
  ),
);

export const CITY_LABELS: Record<CityCode, string> = {
  spb: "Санкт-Петербург",
  nvk: "Новокузнецк",
};
