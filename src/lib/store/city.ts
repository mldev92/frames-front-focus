import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CityCode = "spb" | "nvk";
export type RegionCode = CityCode | "all";

interface CityStore {
  city: CityCode;
  region: RegionCode;
  hydrated: boolean;
  setCity: (city: CityCode) => void;
  setRegion: (region: RegionCode) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      city: "spb",
      region: "spb",
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
      merge: (persisted, current) => {
        const saved = persisted as Partial<Pick<CityStore, "city" | "region">> | undefined;
        const city: CityCode = saved?.city === "nvk" ? "nvk" : "spb";
        const region: RegionCode =
          saved?.region === "all" || saved?.region === "nvk" || saved?.region === "spb"
            ? saved.region
            : city;
        return { ...current, city: region === "nvk" ? "nvk" : "spb", region };
      },
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
