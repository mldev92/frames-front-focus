import {
  BookOpen,
  Car,
  CircleDollarSign,
  Eye,
  Feather,
  Glasses,
  Layers,
  Monitor,
  Phone,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PurposeId =
  | "distance"
  | "reading"
  | "computer"
  | "multifocal"
  | "driving"
  | "myopia-control"
  | "everyday";

export interface PurposeOption {
  id: PurposeId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  requiresAdd?: boolean;
}

export const PURPOSES: PurposeOption[] = [
  {
    id: "distance",
    title: "Для дали",
    subtitle: "Для повседневного зрения вдаль",
    icon: Eye,
  },
  {
    id: "reading",
    title: "Для чтения",
    subtitle: "Для работы вблизи и мелких деталей",
    icon: BookOpen,
  },
  {
    id: "computer",
    title: "Для компьютера и гаджетов",
    subtitle: "Для экранов и комфортной работы на близком и среднем расстоянии",
    icon: Monitor,
  },
  {
    id: "multifocal",
    title: "Для дали и близи",
    subtitle: "Одна пара очков для нескольких расстояний",
    icon: Layers,
    requiresAdd: true,
  },
  {
    id: "driving",
    title: "Для вождения",
    subtitle: "Приоритет контраста и защиты от бликов",
    icon: Car,
  },
  {
    id: "myopia-control",
    title: "Контроль миопии у ребёнка",
    subtitle: "Специальная ветка с обязательной проверкой рецепта и оправы",
    icon: Glasses,
  },
  {
    id: "everyday",
    title: "Универсальные на каждый день",
    subtitle: "Практичный вариант для постоянного ношения",
    icon: Sparkles,
  },
];

export const CONSULTATION = {
  title: "Заказать консультацию",
  subtitle: "Подобрать линзы вместе со специалистом",
  icon: Phone,
};

export type PriorityId =
  | "thinner"
  | "lighter"
  | "screens"
  | "driving"
  | "comfort"
  | "budget"
  | "premium";

export interface PriorityOption {
  id: PriorityId;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const PRIORITIES: PriorityOption[] = [
  {
    id: "thinner",
    title: "Хочу потоньше",
    description: "Учитывать рекомендуемый или более высокий индекс",
    icon: WandSparkles,
  },
  {
    id: "lighter",
    title: "Хочу легче",
    description: "Отдавать приоритет лёгким материалам",
    icon: Feather,
  },
  {
    id: "screens",
    title: "Часто работаю за экраном",
    description: "Учитывать цифровые дизайны и совместимую защиту",
    icon: Monitor,
  },
  {
    id: "driving",
    title: "Много вожу автомобиль",
    description: "Учитывать водительские дизайны и защиту от бликов",
    icon: Car,
  },
  {
    id: "comfort",
    title: "Максимальная прозрачность и комфорт",
    description: "Приоритет индивидуальных дизайнов и премиальных покрытий",
    icon: ShieldCheck,
  },
  {
    id: "budget",
    title: "Бюджетный вариант",
    description: "Сначала показывать доступные совместимые решения",
    icon: CircleDollarSign,
  },
  {
    id: "premium",
    title: "Премиум",
    description: "Приоритет верхних линеек и индивидуальных дизайнов",
    icon: Sparkles,
  },
];

export type LensFinishId = "clear" | "photochromic" | "tinted" | "polarized";

export interface LensFinishOption {
  id: LensFinishId;
  title: string;
  description: string;
}

export const LENS_FINISHES: LensFinishOption[] = [
  { id: "clear", title: "Прозрачные", description: "Без постоянного затемнения" },
  {
    id: "photochromic",
    title: "Фотохромные",
    description: "Темнеют на улице и светлеют в помещении",
  },
  { id: "tinted", title: "Тонированные", description: "С постоянным затемнением" },
  {
    id: "polarized",
    title: "Поляризационные",
    description: "Снижают отражённые блики при совместимом дизайне",
  },
];

export type PhotochromicColorId = "gray" | "brown" | "green";

export const PHOTOCHROMIC_COLORS: { id: PhotochromicColorId; title: string; swatch: string }[] = [
  { id: "gray", title: "Серый", swatch: "#6b7280" },
  { id: "brown", title: "Коричневый", swatch: "#795548" },
  { id: "green", title: "Зелёный", swatch: "#526b58" },
];

export type CoatingPackageId = "basic" | "comfort" | "premium";

export interface CoatingPackageOption {
  id: CoatingPackageId;
  title: string;
  description: string;
}

export const COATING_PACKAGES: CoatingPackageOption[] = [
  {
    id: "basic",
    title: "Базовое покрытие",
    description: "Практичная защита в рамках доступных вариантов бренда",
  },
  {
    id: "comfort",
    title: "Комфорт",
    description: "Улучшенная прозрачность и удобство ежедневного ухода",
  },
  {
    id: "premium",
    title: "Премиум",
    description: "Максимальная защита и характеристики среди совместимых покрытий",
  },
];

export type BrandId = "all" | "essilor" | "zeiss" | "hoya" | "synchrony";

export interface BrandOption {
  id: BrandId;
  title: string;
  description: string;
}

export const BRANDS: BrandOption[] = [
  {
    id: "all",
    title: "Все бренды",
    description: "Сравнить совместимые варианты всех четырёх брендов",
  },
  {
    id: "essilor",
    title: "Essilor",
    description: "Varilux, Eyezen, Stellest, Transitions и доступные покрытия Crizal",
  },
  {
    id: "zeiss",
    title: "ZEISS",
    description: "SmartLife, DriveSafe, MyoCare, PhotoFusion и покрытия DuraVision",
  },
  {
    id: "hoya",
    title: "HOYA",
    description: "HOYA и MAXXEE, включая MiYOSMART и доступные покрытия SKU",
  },
  {
    id: "synchrony",
    title: "Synchrony",
    description: "Single Vision, Progressive, Workplace, Bifocal и доступные покрытия",
  },
];
