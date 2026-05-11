import type { Salon } from "./types";

const ph = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

export const salons: Salon[] = [
  {
    id: "kirochnaya",
    name: "ОПТИКА 100% на Кирочной",
    address: "Санкт-Петербург, ул. Кирочная, 17",
    metro: "Чернышевская",
    phone: "+7 (812) 000-00-00",
    hours: "Пн–Вс 10:00–21:00",
    image: ph("salon-kirochnaya"),
  },
  {
    id: "nevsky",
    name: "ОПТИКА 100% на Невском",
    address: "Санкт-Петербург, Невский пр., 88",
    metro: "Маяковская",
    phone: "+7 (812) 000-00-01",
    hours: "Пн–Вс 10:00–22:00",
    image: ph("salon-nevsky"),
  },
  {
    id: "vasileostrovskaya",
    name: "ОПТИКА 100% на В.О.",
    address: "Санкт-Петербург, 6-я линия В.О., 23",
    metro: "Василеостровская",
    phone: "+7 (812) 000-00-02",
    hours: "Пн–Сб 11:00–20:00",
    image: ph("salon-vo"),
  },
];
