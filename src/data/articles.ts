import type { Article } from "./types";

// Blog categories as published on optika100.com. The live site currently has a
// single rubric — "Линзы для очков" at /blog/linzy-dlya-ochkov/.
export const blogCategories: { slug: string; title: string }[] = [
  { slug: "linzy-dlya-ochkov", title: "Линзы для очков" },
];

const CATEGORY_SLUG = "linzy-dlya-ochkov";
const CATEGORY_TITLE = "Линзы для очков";
const MIGRATED_ARTICLE_SLUGS = new Set(["pokrytiya-linz-dlya-ochkov"]);
const JOURNAL_FALLBACK_COVERS = [
  "/article-pokrytiya-linz/pokrytie_hero.webp",
  "/blog_vidy_linz.webp",
  "/blog_asphericheskie.webp",
  "/main_journal_1.webp",
  "/main_journal_2.webp",
  "/main_journal_3.webp",
] as const;

// slug / title / excerpt — slugs mirror the live optika100.com article URLs 1:1.
const RAW: [string, string, string][] = [
  [
    "pokrytiya-linz-dlya-ochkov",
    "Покрытия линз для очков",
    "Какие покрытия делают очковые линзы комфортнее, защищают от бликов, царапин и помогают выбрать линзы под ваш образ жизни.",
  ],
  ["vidy-ochkovykh-linz", "Виды линз для очков", "Однофокальные, прогрессивные, офисные — как разобраться."],
  ["asfericheskie-linzy-dlya-ochkov", "Асферические линзы для очков", "Тоньше, легче и с меньшими искажениями по краям."],
  ["ofisnye-linzy", "Офисные линзы", "Комфорт зрения на средних и близких дистанциях в течение дня."],
  ["individualnye-linzy-dlya-ochkov-s-tekhnologiey-free-form", "Индивидуальные линзы с технологией Free Form", "Линзы, рассчитанные под параметры конкретного человека."],
  ["komu-nuzhny-linzy-dlya-ochkov-s-podderzhkoy-akkomodatsii-razgruzochnye-linzy", "Разгрузочные линзы с поддержкой аккомодации", "Кому подходят линзы, снижающие нагрузку на глаза."],
  ["progressivnye-linzy", "Прогрессивные линзы", "Одни очки для дали, средней дистанции и чтения."],
  ["kak-vybrat-progressivnye-linzy", "Как выбрать прогрессивные линзы", "На что обратить внимание при подборе прогрессивов."],
  ["skolko-stoyat-progressivnye-ochki163", "Сколько стоят прогрессивные очки", "Из чего складывается цена мультифокальных очков."],
  ["polyarizatsionnye-linzy-dlya-ochkov", "Поляризационные линзы для очков", "Защита от бликов для вождения и активного отдыха."],
  ["perifocal-perifokal", "Перифокальные линзы (Perifocal)", "Линзы для контроля прогрессирования близорукости."],
  ["linzy-dlya-ochkov-stellest", "Линзы для очков Stellest", "Технология замедления роста миопии у детей."],
  ["miopiya-prichiny-oslozhneniya-korrektsiya", "Миопия: причины, осложнения, коррекция", "Почему развивается близорукость и как её корректируют."],
  ["fotokhromnye-ochkovye-linzy", "Фотохромные очковые линзы", "Линзы, темнеющие на солнце и светлеющие в помещении."],
  ["progressivnye-linzy-dlya-ochkov-varilux", "Прогрессивные линзы Varilux", "Флагманские прогрессивы Essilor для естественного зрения."],
  ["linzy-dlya-ochkov-crizal-eyezen-zashchita-i-komfort-glaz-pri-rabote-s-ekranami", "Crizal Eyezen — комфорт при работе с экранами", "Линзы для тех, кто много времени проводит у монитора."],
  ["essilor-experts-eksperty-sredi-optik", "Essilor Experts — эксперты среди оптик", "Что означает статус Essilor Experts для покупателя."],
];

export const articles: Article[] = RAW.map(([slug, title, excerpt], i) => ({
  slug,
  title,
  excerpt,
  cover: JOURNAL_FALLBACK_COVERS[i % JOURNAL_FALLBACK_COVERS.length],
  date: slug === "pokrytiya-linz-dlya-ochkov" ? "2026-06-10" : undefined,
  author: slug === "pokrytiya-linz-dlya-ochkov" ? "Редакция ОПТИКА 100%" : undefined,
  category: CATEGORY_TITLE,
  categorySlug: CATEGORY_SLUG,
  content: slug === "pokrytiya-linz-dlya-ochkov"
    ? [
        `${title}. Материал из журнала ОПТИКА 100%.`,
        "Полный текст статьи перенесен в отдельную редакционную страницу.",
      ]
    : [],
  productionUrl: `https://optika100.com/blog/${CATEGORY_SLUG}/${slug}/`,
  isMigrated: MIGRATED_ARTICLE_SLUGS.has(slug),
}));

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug);

export const getArticlesByCategory = (categorySlug: string) =>
  articles.filter((a) => a.categorySlug === categorySlug);

export const getBlogCategory = (slug: string) =>
  blogCategories.find((c) => c.slug === slug);

export const articleHref = (a: Pick<Article, "slug" | "categorySlug">) =>
  `/blog/${a.categorySlug}/${a.slug}/`;
