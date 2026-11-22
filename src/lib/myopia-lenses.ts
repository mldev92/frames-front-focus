export const MYOPIA_PATH = "/linzy-dlya-kontrolya-miopii/";
export const MYOPIA_TITLE = "Линзы для контроля миопии";
export const MYOPIA_CONTACT_SECTION = "dlya_kontrolya_miopii";
const spectacleCatalog = "/catalog_s/linzy_dlya_ochkov/";
const modelQueryPrefix = "model:";
const contactCatalog = `/catalog_s/kontaktnye_linzy_/${MYOPIA_CONTACT_SECTION}/`;

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
  fitting: string;
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
      "Центральная зона корректирует близорукость, а окружающие её асферические микролинзы создают оптический сигнал для контроля прогрессирования миопии.",
    fitting: "Врач оценивает рецепт и подбирает вариант линз после обследования.",
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
      "Детские линзы для поддержки зрения вблизи. Дополнительная оптическая сила помогает при зрительной работе на близком расстоянии.",
    fitting:
      "Врач оценивает аккомодацию и совместную работу глаз. У Myopilux Plus собственный оптический дизайн и показания, которые врач учитывает при выборе линз.",
    catalogLineIds: ["myopiluxplusorma", "myopiluxplusormix"],
  },
  {
    kind: "spectacle",
    slug: "myocare",
    brand: "ZEISS",
    name: "MyoCare",
    design: "C.A.R.E.",
    description:
      "Очковые линзы с центральной зоной коррекции и кольцевыми оптическими элементами для контроля миопии у детей.",
    fitting:
      "На обследовании врач определяет параметры коррекции и оценивает, подходит ли ребёнку дизайн MyoCare.",
    catalogLineIds: ["zeissmyocare"],
  },
  {
    kind: "spectacle",
    slug: "miyosmart",
    brand: "Hoya",
    name: "MiYOSMART",
    design: "D.I.M.S.",
    description:
      "Центральная зона обеспечивает коррекцию зрения, а многочисленные сегменты вокруг неё формируют миопический дефокус.",
    fitting:
      "После обследования врач определяет параметры линз и обсуждает с родителями дальнейшее наблюдение.",
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
      "Мягкие однодневные контактные линзы с зонами коррекции зрения и зонами миопического дефокуса.",
    note: "Используйте новую пару каждый день. Нужны подбор и обучение у специалиста.",
    fitting:
      "На приёме специалист проверяет посадку линз и обучает ребёнка и родителей надеванию и снятию.",
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
      "Однодневные контактные линзы с расширенной глубиной фокуса. Возможность применения для конкретного ребёнка оценивает врач.",
    note: "После снятия линзы утилизируют. Хранение и очистка не требуются.",
    fitting: "Специалист определяет оптическую силу и проверяет посадку линз на глазах ребёнка.",
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
      "Мягкие бифокальные контактные линзы. Параметры, режим замены и применимость для контроля миопии уточняются при подборе.",
    note: "Ухаживайте за линзами и заменяйте их согласно инструкции к выбранной линзе.",
    fitting: "На приёме специалист проверяет посадку и объясняет, как ухаживать за линзами.",
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
    `${model.brand} ${model.name}`,
    model.description,
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
    : `${contactCatalog}${model.catalogSlug}/`;
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
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}
