import { articleHref, articles } from "@/data/articles";

export interface SiteSearchEntry {
  title: string;
  description: string;
  href: string;
  type: "Страница" | "Услуга" | "Категория" | "Статья";
  keywords: string[];
  region?: "spb";
}

const pageEntries: SiteSearchEntry[] = [
  {
    title: "Контроль миопии у детей",
    description:
      "Причины и признаки детской близорукости, оценка риска, методы контроля миопии и запись на диагностику.",
    href: "/stellest-katalog-s-linzami/",
    type: "Страница",
    keywords: [
      "миопия у детей",
      "близорукость у детей",
      "детская миопия",
      "детская близорукость",
      "контроль миопии",
      "лечение миопии",
      "stellest",
      "misight",
    ],
  },
  {
    title: "Биометрия глаза",
    description: "Измерение параметров глаза, подготовка, проведение и запись в Санкт-Петербурге.",
    href: "/biometriya-glaza/",
    type: "Услуга",
    keywords: ["биометрия", "биометрия глаза", "измерение глаза", "длина глаза", "пзо", "lenstar"],
    region: "spb",
  },
  {
    title: "Диагностика зрения в Санкт-Петербурге",
    description: "Проверка зрения, подбор коррекции и диагностические исследования.",
    href: "/kabinet-diagnostiki-spb/",
    type: "Услуга",
    keywords: ["диагностика", "проверка зрения", "офтальмолог", "врач", "прием", "приём"],
    region: "spb",
  },
  {
    title: "Контактные линзы в Санкт-Петербурге",
    description: "Категории контактных линз, актуальные цены, подбор, доставка и самовывоз.",
    href: "/linzy-spb/",
    type: "Страница",
    keywords: ["линзы", "контактные линзы", "купить линзы", "линзы спб"],
    region: "spb",
  },
  {
    title: "Цветные линзы с диоптриями",
    description: "Цветные контактные линзы для коррекции зрения и помощь в подборе.",
    href: "/tsvetnye-linzy-s-dioptriyami/",
    type: "Страница",
    keywords: ["цветные линзы", "линзы с диоптриями", "цветные линзы с диоптриями"],
    region: "spb",
  },
  {
    title: "Оптика в Санкт-Петербурге",
    description: "Салон на Кирочной, 17: очки, контактные линзы, диагностика и биометрия.",
    href: "/optika-spb/",
    type: "Страница",
    keywords: ["оптика", "оптика спб", "салон оптики", "кирочная 17"],
    region: "spb",
  },
  {
    title: "Подбор очков",
    description: "Проверка параметров зрения и подбор очковой коррекции.",
    href: "/podbor-ochkov/",
    type: "Услуга",
    keywords: ["подбор очков", "очки по рецепту", "очки"],
  },
  {
    title: "Цветные контактные линзы",
    description: "Каталог цветных контактных линз.",
    href: "/catalog_s/kontaktnye_linzy_/tsvetnye/",
    type: "Категория",
    keywords: ["цветные линзы", "оттеночные линзы", "карнавальные линзы"],
  },
  {
    title: "Мультифокальные контактные линзы",
    description: "Каталог контактных линз для зрения на разных расстояниях.",
    href: "/catalog_s/kontaktnye_linzy_/multifokalnye/",
    type: "Категория",
    keywords: ["мультифокальные линзы", "пресбиопия", "линзы для близи"],
  },
];

const articleKeywords: Partial<Record<string, string[]>> = {
  "perifocal-perifokal": [
    "миопия у детей",
    "близорукость у детей",
    "детская миопия",
    "детская близорукость",
    "лечение миопии",
    "контроль миопии",
  ],
};

const articleEntries: SiteSearchEntry[] = articles.map((article) => ({
  title: article.title,
  description: article.excerpt,
  href: articleHref(article),
  type: "Статья",
  keywords: [article.category, ...(articleKeywords[article.slug] ?? [])],
}));

const entries = [...pageEntries, ...articleEntries];

function normalize(value: string) {
  return value.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").trim();
}

export function searchSiteContent(query: string, limit = 8): SiteSearchEntry[] {
  const term = normalize(query);
  if (term.length < 2) return [];

  return entries
    .map((entry) => {
      const title = normalize(entry.title);
      const haystack = normalize([entry.title, entry.description, ...entry.keywords].join(" "));
      const score =
        title === term
          ? 100
          : title.startsWith(term)
            ? 80
            : title.includes(term)
              ? 60
              : haystack.includes(term)
                ? 40
                : 0;
      return { entry, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, "ru"))
    .slice(0, limit)
    .map((item) => item.entry);
}
