import {
  Mountain,
  BookOpen,
  Layers,
  Sun,
  Car,
  Monitor,
  Sparkles,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PurposeId =
  | "distance"
  | "near"
  | "progressive"
  | "sun"
  | "driving"
  | "computer"
  | "image";

export interface PurposeOption {
  id: PurposeId;
  title: string;
  subtitle: string;
  count: number;
  fromPrice: number;
  icon: LucideIcon;
  needsRx: boolean;
  requiresAdd?: boolean;
  note?: string;
}

export const PURPOSES: PurposeOption[] = [
  { id: "distance", title: "Для дали", subtitle: "Ежедневные очки для дали", count: 4209, fromPrice: 1520, icon: Mountain, needsRx: true },
  { id: "near", title: "Для близи", subtitle: "Для чтения и работы вблизи", count: 3981, fromPrice: 1520, icon: BookOpen, needsRx: true },
  { id: "progressive", title: "Прогрессивные", subtitle: "Для всех расстояний", count: 5997, fromPrice: 6796, icon: Layers, needsRx: true, requiresAdd: true },
  { id: "sun", title: "Для защиты от солнца", subtitle: "Фотохромные или тонированные", count: 7118, fromPrice: 2956, icon: Sun, needsRx: true },
  { id: "driving", title: "Очки для вождения", subtitle: "Улучшают контрастное восприятие и защищают от бликов днём и ночью", count: 1356, fromPrice: 7220, icon: Car, needsRx: true },
  { id: "computer", title: "Компьютерные", subtitle: "Для работы с экранами и цифровыми устройствами", count: 1747, fromPrice: 3040, icon: Monitor, needsRx: true },
  { id: "image", title: "Имиджевые", subtitle: "Без диоптрий и рецепта", count: 3757, fromPrice: 1520, icon: Sparkles, needsRx: false, note: "+0 sph, +0 cyl" },
];

export const CONSULTATION = {
  title: "Заказать консультацию",
  subtitle: "Бесплатный подбор линз специалистом",
  icon: Phone,
};

export interface LensTypeOption {
  id: string;
  title: string;
  description: string;
  count: number;
  fromPrice: number;
  badge?: string;
  warning?: string;
}

// step 3 options keyed by purpose
export const LENS_TYPES: Record<PurposeId, LensTypeOption[]> = {
  distance: [
    { id: "clear-distance", title: "Прозрачные для дали", description: "Универсальный вариант для повседневного ношения", count: 1820, fromPrice: 1520 },
    { id: "blueblock-distance", title: "С защитой от синего света", description: "Снижают усталость глаз от экранов", count: 410, fromPrice: 3040 },
  ],
  near: [
    { id: "clear-near", title: "Прозрачные для близи", description: "Для чтения и работы вблизи", count: 1610, fromPrice: 1520 },
    { id: "office", title: "Офисные", description: "Коррекция ближнего и среднего расстояний — до 1.5 м", count: 706, fromPrice: 6796, warning: "Не подходят для вождения" },
  ],
  progressive: [
    { id: "progressive", title: "Прогрессивные", description: "Эта линза обеспечивает плавное развитие всех полей зрения: ближнего, среднего и дальнего. Подходит для вождения", count: 4681, fromPrice: 9230 },
    { id: "office-progressive", title: "Офисные", description: "Только два поля зрения: ближнее и среднее (например, при чтении и работе с компьютером — до 1.5 м). Сюда не входит зрение вдаль.", count: 706, fromPrice: 6796, warning: "Не подходит для вождения" },
  ],
  sun: [
    { id: "transitions", title: "Transitions или фотохромные", description: "Хамелеон. Прозрачные в помещении, тёмные на солнце", count: 3370, fromPrice: 7600, badge: "Transitions" },
    { id: "sun-tinted", title: "Солнцезащитные", description: "Тонированные, зеркальные или поляризованные", count: 3925, fromPrice: 2956 },
  ],
  driving: [
    { id: "driving-clear", title: "Очки для вождения прозрачные", description: "Универсальный вариант на каждый день, обеспечивают чёткое и контрастное зрение в любое время суток, особенно в пасмурную погоду и вечером", count: 320, fromPrice: 7220 },
    { id: "drivesafe", title: "Тонированные Zeiss DriveSafe", description: "Специально разработаны для водителей, снижают блики и визуальную усталость, повышают комфорт и уверенность за рулём при ярком дневном свете", count: 32, fromPrice: 26084, badge: "Zeiss DriveSafe" },
    { id: "driving-photo", title: "Очки для вождения фотохромные", description: "Автоматически темнеют на солнце и светлеют в помещении или в тёмное время суток, обеспечивая комфортное зрение без необходимости менять очки", count: 802, fromPrice: 10584 },
  ],
  computer: [
    { id: "computer-clear", title: "Прозрачные компьютерные", description: "Для работы с экранами и цифровыми устройствами", count: 1500, fromPrice: 3040 },
    { id: "computer-blueblock", title: "С защитой от синего света", description: "Снижают нагрузку на глаза при долгой работе с экранами", count: 720, fromPrice: 4560 },
  ],
  image: [
    { id: "image-clear", title: "Имиджевые прозрачные", description: "Без диоптрий, без рецепта", count: 3757, fromPrice: 1520 },
  ],
};

export interface IndexOption {
  id: string;
  title: string;
  description: string;
  count: number;
  fromPrice: number;
  level: 1 | 2 | 3 | 4 | 5;
}

export const INDEX_OPTIONS: IndexOption[] = [
  { id: "1.5", title: "1.5 — Базовый пластик", description: "Стандартные полимерные линзы для слабой степени аметропии. Оптимальное сочетание цены и качества", count: 17, fromPrice: 7220, level: 1 },
  { id: "trivex", title: "Поликарбонат или Trivex", description: "Ударопрочные защитные линзы с индексом 1,59. Тоньше стандартного пластика до 22%, идеальны для активного образа жизни", count: 11, fromPrice: 27304, level: 2 },
  { id: "1.6", title: "1.6 — Утончённый пластик", description: "Облегчённые и утончённые линзы для средней и высокой степени аметропии. Комфортные в ношении", count: 20, fromPrice: 13300, level: 3 },
  { id: "1.67", title: "1.67 — Высокий индекс (для сильных рецептов)", description: "Ультратонкие и ультралёгкие линзы для сильных рецептов. Эстетичный внешний вид при высоких диоптриях", count: 19, fromPrice: 19380, level: 4 },
  { id: "1.74", title: "1.74 — Высокий индекс (для особо сильных рецептов)", description: "Самые тонкие и лёгкие линзы для очень высоких диоптрий. Максимальная эстетика, чуть более долгая адаптация", count: 2, fromPrice: 42134, level: 5 },
];

export interface DesignOption {
  id: string;
  title: string;
  description: string;
  count: number;
  fromPrice: number;
}

export const DESIGNS: DesignOption[] = [
  { id: "standard", title: "Стандартное покрытие", description: "Защита от царапин, антиблик, гидрофобное покрытие", count: 1240, fromPrice: 0 },
  { id: "premium", title: "Премиум покрытие", description: "Усиленная защита, олеофобное и антистатическое покрытие, лучшая прозрачность", count: 540, fromPrice: 3200 },
  { id: "blueblock", title: "С защитой от синего света", description: "Снижает усталость глаз при работе с цифровыми устройствами", count: 410, fromPrice: 2800 },
  { id: "aspheric", title: "Асферический дизайн", description: "Уменьшенные искажения по краям, более тонкий профиль линзы", count: 320, fromPrice: 4500 },
];

export interface BrandOption {
  id: string;
  title: string;
  description: string;
  count: number;
  fromPrice: number;
  highlight?: string;
}

export const BRANDS: BrandOption[] = [
  { id: "essilor", title: "Essilor", description: "Мировой лидер в производстве очковых линз. Технологии Crizal, Varilux, Eyezen", count: 1820, fromPrice: 4500, highlight: "Рекомендуем" },
  { id: "zeiss", title: "Zeiss", description: "Немецкое качество и точная оптика. Технологии DriveSafe, Photofusion, DuraVision", count: 1340, fromPrice: 5200 },
  { id: "hoya", title: "Hoya", description: "Японский производитель премиальных линз. Hi-Vision, Sensity, MiyoSmart", count: 980, fromPrice: 4800 },
  { id: "rodenstock", title: "Rodenstock", description: "Индивидуальный подход и биометрические измерения", count: 410, fromPrice: 6900 },
  { id: "optic-100", title: "Линзы ОПТИКА 100%", description: "Собственная линейка по выгодной цене с европейскими материалами", count: 720, fromPrice: 1520, highlight: "Выгодно" },
];
