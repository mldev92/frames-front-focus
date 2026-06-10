export const CONTACT = {
  phone: {
    label: "8-800-700-0214",
    href: "tel:88007000214",
  },
  email: {
    label: "sale-spb@optika100.com",
    href: "mailto:sale-spb@optika100.com",
  },
  telegram: {
    label: "@optica100_spb",
    href: "tg://resolve?domain=optica100_spb",
  },
  max: {
    label: "MAX",
    href: "https://max.ru/u/f9LHodD0cOI_EAJSmZrDRX2jCU-Utq7h8zwAFsU9joaV_FY1vzI0MufrfVg",
  },
} as const;

export type SalonCity = "spb" | "nk";

export interface VerifiedSalon {
  id: string;
  city: SalonCity;
  cityLabel: string;
  name: string;
  address: string;
  routeQuery: string;
  hours: string;
  closesAt: string;
  metro?: string;
  imageSrc?: string;
  imageLabel: string;
  productionPath: string;
}

export const SALONS: VerifiedSalon[] = [
  {
    id: "kirochnaya",
    city: "spb",
    cityLabel: "Санкт-Петербург",
    name: "Салон оптики в Санкт-Петербурге",
    address: "Салон оптики в Санкт-Петербурге, ул. Кирочная, 17",
    routeQuery: "Санкт-Петербург, ул. Кирочная, 17",
    hours: "Ежедневно с 10:00 до 20:00",
    closesAt: "20:00",
    metro: "Чернышевская",
    imageSrc: "/salon_kirochnaya.webp",
    imageLabel: "фото салона СПб",
    productionPath: "/contacts/stores/10867/",
  },
  {
    id: "toreza",
    city: "nk",
    cityLabel: "Новокузнецк",
    name: "Заводской район",
    address: "Заводской район, ул. Тореза, 32 (ост. Рынок)",
    routeQuery: "Новокузнецк, ул. Тореза, 32",
    hours: "Ежедневно с 9:30 до 19:30",
    closesAt: "19:30",
    imageSrc: "/salon_toreza.webp",
    imageLabel: "фото · ул. Тореза",
    productionPath: "/contacts/stores/10869/",
  },
  {
    id: "shahterov",
    city: "nk",
    cityLabel: "Новокузнецк",
    name: "Новобайдаевский район",
    address: "Новобайдаевский район — Салон Оптика100% в Новокузнецке, пр. Шахтеров, 12",
    routeQuery: "Новокузнецк, пр. Шахтеров, 12",
    hours: "Ежедневно с 9:30 до 19:00",
    closesAt: "19:00",
    imageSrc: "/salon_shahterov.webp",
    imageLabel: "фото · пр. Шахтеров",
    productionPath: "/contacts/stores/56293/",
  },
  {
    id: "bardina",
    city: "nk",
    cityLabel: "Новокузнецк",
    name: "Центральный район",
    address: "Центральный район, пр. Бардина, 42 (Дом Быта), отдельный вход с левого торца.",
    routeQuery: "Новокузнецк, пр. Бардина, 42",
    hours: "Ежедневно с 9:30 до 19:30",
    closesAt: "19:30",
    imageSrc: "/salon_bardina.webp",
    imageLabel: "фото · пр. Бардина",
    productionPath: "/contacts/stores/10868/",
  },
  {
    id: "zapsibovtsev",
    city: "nk",
    cityLabel: "Новокузнецк",
    name: "Новоильинский район",
    address: "Новоильинский район, пр. Запсибовцев, 37 (ост. Роддом)",
    routeQuery: "Новокузнецк, пр. Запсибовцев, 37",
    hours: "Ежедневно с 9:30 до 19:30",
    closesAt: "19:30",
    imageSrc: "/salon_zabsibov.webp",
    imageLabel: "фото · пр. Запсибовцев",
    productionPath: "/contacts/stores/10870/",
  },
];

export const PRIMARY_SALON = SALONS[0];
export const SPB_SALONS = SALONS.filter((salon) => salon.city === "spb");
export const NK_SALONS = SALONS.filter((salon) => salon.city === "nk");

export const LEGAL_DETAILS = {
  name: "Индивидуальный предприниматель Левочкина Елена Анатольевна",
  inn: "422106058696",
  ogrnip: "306421714600010",
  address: "191123, Санкт-Петербург, ул. Кирочная улица, 17",
} as const;
