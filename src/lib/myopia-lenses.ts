export const MYOPIA_PATH = "/linzy-dlya-kontrolya-miopii/";
export const MYOPIA_TITLE = "Линзы для контроля миопии";
export const MYOPIA_CONTACT_SECTION = "dlya_kontrolya_miopii";
export const MYOPIA_HERO_IMAGE = "/myopia/hero-myopia.jpg";
const spectacleCatalog = "/catalog_s/linzy_dlya_ochkov/";
const modelQueryPrefix = "model:";
export const MYOPIA_SPECTACLE_CATALOG = `${spectacleCatalog}?lensType=${encodeURIComponent("Контроль миопии")}&expand=lensType`;
export const MYOPIA_CONTACT_CATALOG = `/catalog_s/kontaktnye_linzy_/${MYOPIA_CONTACT_SECTION}/`;

export const spectacleNotice =
  "Подходящий дизайн линз определяет врач после обследования. Линзы не излечивают миопию; результат индивидуален.";
export const contactNotice =
  "Контактные линзы подбираются после обследования. Не спите в дневных линзах, не используйте однодневную пару повторно и не допускайте контакта линз с водой. Линзы не излечивают миопию и не гарантируют остановку её прогрессирования.";

interface ModelCopy {
  slug: string;
  brand: string;
  name: string;
  design: string;
  description: string;
  fitting: {
    heading: string;
    text: string;
    source?: { label: string; href: string };
  };
}

export interface SpectacleMyopiaModel extends ModelCopy {
  kind: "spectacle";
  catalogLineIds: readonly string[];
  conditionalLineIds?: readonly string[];
  detailsPath?: string;
}

export interface ContactMyopiaModel extends ModelCopy {
  kind: "contact";
  note: string;
  packSize: number;
  catalogSlug: string;
}

export type MyopiaModel = SpectacleMyopiaModel | ContactMyopiaModel;

export const spectacleMyopiaModels: readonly SpectacleMyopiaModel[] = [
  {
    kind: "spectacle",
    slug: "stellest",
    brand: "Essilor",
    name: "Stellest",
    design: "H.A.L.T.",
    description:
      "Через центральную зону линзы ребёнок чётко видит вдаль. Микролинзы вокруг неё помогают замедлить прогрессирование близорукости.",
    fitting: {
      heading: "Как подбирают Stellest",
      text: "Врач оценивает рецепт и подбирает вариант линз после обследования.",
    },
    catalogLineIds: ["asstellestairwear", "asstellestairweartint"],
    conditionalLineIds: ["asstellestairweartint"],
    detailsPath: "/stellest-katalog-s-linzami/",
  },
  {
    kind: "spectacle",
    slug: "myopilux-plus",
    brand: "Essilor",
    name: "Myopilux Plus",
    design: "Дополнительная оптическая сила для близи",
    description:
      "Детские очковые линзы, которые корректируют близорукость и имеют отдельную зону для чтения и других занятий вблизи.",
    fitting: {
      heading: "Зачем проверяют зрение вблизи",
      text: "При переходе от взгляда вдаль к чтению ребёнок смотрит через зону линзы с дополнительной оптической силой. На приёме врач оценивает, как глаза фокусируются вблизи и работают вместе. По результатам обследования он решает, подходит ли ребёнку такой дизайн.",
      source: {
        label: "Myopilux Plus в каталоге «Эссилор — Луйс-Оптика» (PDF, раздел для детей)",
        href: "https://st.volga-linza.ru/9/2914/447/Multi-brand_katalog_ELO_2023-10-16.pdf",
      },
    },
    catalogLineIds: ["myopiluxplusorma", "myopiluxplusormix"],
  },
  {
    kind: "spectacle",
    slug: "myocare",
    brand: "ZEISS",
    name: "MyoCare",
    design: "C.A.R.E.",
    description:
      "Детские очковые линзы. Центр помогает чётко видеть вдаль, а кольцевые элементы вокруг него помогают замедлить прогрессирование близорукости.",
    fitting: {
      heading: "Что означает C.A.R.E.",
      text: "C.A.R.E. — технология ZEISS, при которой участки для коррекции зрения чередуются с тонкими кольцевыми элементами для контроля миопии. При заказе очков уточните название модели и параметры по рецепту ребёнка.",
      source: {
        label: "О линзах MyoCare на русскоязычном сайте ZEISS",
        href: "https://www.zeiss.com/vision-care/ru/need-new-lenses/myopia-management-lenses.html",
      },
    },
    catalogLineIds: ["zeissmyocare"],
  },
  {
    kind: "spectacle",
    slug: "miyosmart",
    brand: "Hoya",
    name: "MiYOSMART",
    design: "D.I.M.S.",
    description:
      "Детские очковые линзы с центральной зоной для чёткого зрения вдаль и мелкими сегментами вокруг неё, которые помогают замедлить прогрессирование близорукости.",
    fitting: {
      heading: "Как устроены линзы MiYOSMART",
      text: "В технологии D.I.M.S. мелкие сегменты расположены вокруг центра линзы в форме сот. Они фокусируют часть света перед сетчаткой. Такой оптический эффект называют миопическим дефокусом. После обследования уточните, какие прозрачные, фотохромные или поляризационные варианты доступны по рецепту.",
      source: {
        label: "О линзах MiYOSMART для родителей на сайте HOYA",
        href: "https://www.hoyavision.com/ru/for-spectacle-wearers/miyosmart/",
      },
    },
    catalogLineIds: [
      "miyosmartck-a-ec-bet-e",
      "pe-e-typ-e-miyosmart-ec-bet-e",
      "pe-e-typ-e-miyosmart-otoxpom-echameleon-o-p-a-o-esunbird",
    ],
  },
];

export const contactMyopiaModels: readonly ContactMyopiaModel[] = [
  {
    kind: "contact",
    slug: "misight",
    brand: "Cooper Vision",
    name: "MiSight 1 day",
    design: "Двухфокусный дизайн",
    description:
      "Мягкие однодневные контактные линзы для детей. Одни зоны помогают чётко видеть вдаль, другие помогают замедлить прогрессирование близорукости.",
    note: "Используйте новую пару каждый день. Нужны подбор и обучение у специалиста.",
    fitting: {
      heading: "Что происходит на первой примерке MiSight",
      text: "На российском сайте CooperVision эти линзы рекомендованы детям с близорукостью от 8 до 17 лет. Специалист проверяет зрение и посадку пробных линз, затем показывает ребёнку, как надевать и снимать их, а родителям — как ему помочь.",
      source: {
        label: "О линзах MiSight 1 day на русскоязычном сайте CooperVision",
        href: "https://www.coopervisionmisight.ru/",
      },
    },
    packSize: 30,
    catalogSlug: "misight_1_day_30sht_",
  },
  {
    kind: "contact",
    slug: "seed-1-day-pure-edof",
    brand: "Seed",
    name: "SEED 1 DAY Pure EDOF",
    design: "EDOF — расширенная глубина фокуса",
    description:
      "Мягкие однодневные контактные линзы с расширенной глубиной фокуса. Вариант Mid изучался для контроля близорукости у детей.",
    note: "После снятия линзы утилизируют. Хранение и очистка не требуются.",
    fitting: {
      heading: "Что известно о SEED EDOF при детской близорукости",
      text: "Оптика EDOF расширяет диапазон расстояний, на которых изображение остаётся в фокусе. В годичном исследовании у детей в линзах Mid (+1,50 дптр) близорукость прогрессировала медленнее, а глаза удлинялись меньше, чем в обычных однофокальных очках. Врач сверит показания к выбранному варианту по инструкции и проверит посадку линзы на глазу.",
      source: {
        label: "Гид My Kids Vision для родителей о SEED EDOF (на английском)",
        href: "https://www.mykidsvision.org/knowledge-centre/seed-1daypure-parents-guide",
      },
    },
    packSize: 32,
    catalogSlug: "seed_1_day_pure_edof_32sht_1",
  },
  {
    kind: "contact",
    slug: "prima-bio-bi-focal",
    brand: "OKVision",
    name: "Prima Bio Bi-focal",
    design: "Бифокальный дизайн",
    description:
      "Мягкие бифокальные контактные линзы. Центральная зона помогает чётко видеть вдаль, а оптика вокруг неё предназначена для контроля близорукости.",
    note: "В каталоге представлена модель ежемесячной замены.",
    fitting: {
      heading: "Как пользоваться линзами Prima Bio Bi-focal",
      text: "Линзы ежемесячной замены снимают перед сном, очищают и хранят в растворе для контактных линз. На приёме специалист покажет ребёнку и родителям, как надевать, снимать и очищать линзы.",
      source: {
        label: "Памятка OKVision по использованию Prima Bio Bi-focal (PDF)",
        href: "https://okvision.ru/upload/instruktsii/pamyatka-po-ispolzovaniyu-prima-bio-bi-focal.pdf",
      },
    },
    packSize: 6,
    catalogSlug: "prima_bio_bi_focal_6sht_",
  },
];

export function getSpectacleMyopiaModel(slug?: string) {
  return spectacleMyopiaModels.find((model) => model.slug === slug);
}

export function getSpectacleMyopiaModelFromQuery(query?: string) {
  if (!query?.startsWith(modelQueryPrefix)) return undefined;
  return getSpectacleMyopiaModel(query.slice(modelQueryPrefix.length));
}

export function getMyopiaDetailModel(slug: string) {
  const model = [...spectacleMyopiaModels, ...contactMyopiaModels].find(
    (item) => item.slug === slug,
  );
  if (!model || (model.kind === "spectacle" && model.detailsPath)) {
    throw new Error(`No local myopia detail page for ${slug}`);
  }
  return model;
}

export function myopiaDetailHead(model: MyopiaModel) {
  return myopiaPageHead(
    `${model.brand} ${model.name} — линзы и подбор в СПб`,
    `${model.description} Цены и запись к детскому врачу на Кирочной, 17.`,
    myopiaDetailsPath(model),
  );
}

export function myopiaDetailsPath(model: MyopiaModel) {
  return (
    (model.kind === "spectacle" ? model.detailsPath : undefined) ?? `${MYOPIA_PATH}${model.slug}/`
  );
}

export function myopiaCatalogPath(model: MyopiaModel) {
  return model.kind === "spectacle"
    ? `${spectacleCatalog}?lensQuery=${encodeURIComponent(modelQueryPrefix + model.slug)}`
    : `${MYOPIA_CONTACT_CATALOG}${model.catalogSlug}/`;
}

export function myopiaPageHead(title: string, description: string, path: string) {
  const pageTitle = `${title} · ОПТИКА 100%`;
  const canonical = `https://optika100.com${path}`;
  return {
    meta: [
      { title: pageTitle },
      { name: "description", content: description },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:type", content: "website" },
      ...(path === MYOPIA_PATH
        ? [
            { property: "og:image", content: `https://optika100.com${MYOPIA_HERO_IMAGE}` },
            { name: "twitter:card", content: "summary_large_image" },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
