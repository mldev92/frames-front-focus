import type { Service } from "./types";

const ph = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

export const services: Service[] = [
  {
    slug: "priem-vracha",
    title: "Онлайн-запись к врачу",
    short: "Консультация офтальмолога с подбором коррекции",
    description:
      "Запишитесь на приём к врачу-офтальмологу нашей клиники. Полный осмотр, проверка остроты зрения, подбор очков или контактных линз.",
    price: "от 1 500 ₽",
    duration: "30–45 минут",
    image: ph("doctor"),
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
    title: "Диагностика зрения",
    short: "Полное обследование на современном оборудовании",
    description:
      "Комплексная диагностика зрения с использованием авторефрактометра, тонометра и щелевой лампы.",
    price: "от 2 800 ₽",
    duration: "60 минут",
    image: "https://optika100.com/images/proverka-zreniya/izmenenie_davleniya.jpg",
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
    short: "Очки, которые идеально подойдут вашему лицу",
    description:
      "Опытные оптики помогут выбрать форму, цвет и материал оправы с учётом черт лица и образа жизни.",
    price: "Бесплатно при покупке",
    duration: "30 минут",
    image: ph("podbor"),
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
    image: ph("remont"),
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

export const serviceHref = (slug: string) => serviceLiveHref[slug] ?? `/uslugi/${slug}`;
