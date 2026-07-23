import type { Service } from "./types";
import type { CityCode } from "@/lib/store/city";

export const services: Service[] = [
  {
    slug: "priem-vracha",
    title: "Онлайн запись к врачу (бесплатно при заказе очков)",
    short: "Консультация офтальмолога с подбором коррекции",
    description:
      "Запишитесь на приём к врачу-офтальмологу нашей клиники. Полный осмотр, проверка остроты зрения, подбор очков или контактных линз.",
    price: "от 1 500 ₽",
    duration: "30–45 минут",
    image: "/services1_online_appointment_doctor.webp",
    includes: [
      "Сбор анамнеза и жалоб",
      "Проверка остроты зрения",
      "Авторефрактометрия",
      "Подбор коррекции",
      "Рекомендации врача",
    ],
    steps: [
      { title: "Запись", text: "Выберите удобную дату и время онлайн." },
      { title: "Приём", text: "Полный осмотр у врача занимает 30–45 минут." },
      { title: "Рецепт", text: "Получите рецепт на очки или контактные линзы." },
    ],
  },
  {
    slug: "diagnostika",
    title: "Диагностика зрения детям",
    short: "Полное обследование на современном оборудовании",
    description:
      "Комплексная диагностика зрения с использованием авторефрактометра, тонометра и щелевой лампы.",
    price: "2 300 ₽",
    duration: "60 минут",
    image: "/services3_selection_of_glasses.webp",
    includes: [
      "Авторефрактометрия",
      "Измерение внутриглазного давления",
      "Биомикроскопия переднего отрезка глаза",
      "Осмотр глазного дна",
      "Тест на цветовосприятие",
    ],
    steps: [
      { title: "Подготовка", text: "Приходите за 10 минут до приёма." },
      { title: "Обследование", text: "Несколько коротких процедур без боли." },
      { title: "Заключение", text: "Подробный отчёт и рекомендации." },
    ],
  },
  {
    slug: "podbor-ochkov",
    title: "Подбор очков",
    short: "Очки, которые точно подойдут вашему лицу",
    description:
      "Опытные оптики помогут выбрать форму, цвет и материал оправы с учётом черт лица и образа жизни.",
    price: "Бесплатно при покупке",
    duration: "30 минут",
    image: "/services3_selection_of_glasses_new.webp",
    includes: [
      "Анализ формы лица",
      "Подбор формы и цвета оправы",
      "Снятие межзрачкового расстояния",
      "Примерка нескольких моделей",
    ],
    steps: [
      { title: "Консультация", text: "Расскажите о своих предпочтениях." },
      { title: "Примерка", text: "Подбираем 5–7 подходящих моделей." },
      { title: "Заказ", text: "Оформляем изготовление с нужными линзами." },
    ],
  },
  {
    slug: "remont",
    title: "Ремонт очков",
    short: "Возвращаем очки к жизни в нашей мастерской",
    description:
      "Замена винтиков, дужек, носоупоров, ультразвуковая чистка, правка геометрии оправы.",
    price: "от 300 ₽",
    duration: "от 15 минут",
    image: "/services4_glasses_repair.webp",
    includes: [
      "Замена винтов и носоупоров",
      "Пайка металлических оправ",
      "Правка геометрии",
      "Ультразвуковая чистка",
      "Замена линз",
    ],
    steps: [
      { title: "Диагностика", text: "Бесплатная оценка состояния." },
      { title: "Ремонт", text: "Большинство работ — при вас." },
      { title: "Проверка", text: "Тестируем посадку и удобство." },
    ],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);

// Live optika100.com service pages live at the top level (not under /uslugi/).
// Services without a live counterpart fall back to /uslugi/{slug} (new pages).
const serviceLiveHref: Record<string, string> = {
  remont: "/remont-ochkov/",
  "podbor-ochkov": "/podbor-ochkov/",
  diagnostika: "/kabinet-diagnostiki-spb/",
};

export const diagnosticsHref = (city: CityCode = "spb") =>
  city === "nvk" ? "/kabinet-diagnostiki-nk/" : "/kabinet-diagnostiki-spb/";

export const serviceHref = (slug: string, city: CityCode = "spb") => {
  if (slug === "diagnostika") return diagnosticsHref(city);
  return serviceLiveHref[slug] ?? `/uslugi/${slug}`;
};
