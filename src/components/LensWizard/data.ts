import {
  Baby,
  BookOpen,
  Car,
  Eye,
  Layers,
  Monitor,
  Phone,
  Sparkles,
  Sun,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Step structure and wording follow the customer's reference wizard
 * (masterglasses.ru lens quiz), which the owner chose over ТЗ §3 where the two
 * conflict — decision of 2026-08-22, recorded in LENS_SELECTOR_HANDOFF.md §1.
 */

export type PurposeId =
  | "distance"
  | "near"
  | "multifocal"
  | "driving"
  | "computer"
  | "image"
  | "sun-protection"
  | "myopia-control";

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
    subtitle: "Ежедневные очки для дали — вождение, прогулки, просмотр TV",
    icon: Eye,
  },
  {
    id: "near",
    title: "Для близи",
    subtitle: "Для чтения и работы вблизи",
    icon: BookOpen,
  },
  {
    id: "multifocal",
    title: "Мультифокальные",
    subtitle: "Одна пара очков для всех расстояний",
    icon: Layers,
    requiresAdd: true,
  },
  {
    id: "driving",
    title: "Для вождения",
    subtitle: "Улучшают контраст и защищают от бликов и засветов днём и ночью",
    icon: Car,
  },
  {
    id: "computer",
    title: "Компьютерные",
    subtitle: "Для работы с экранами и цифровыми устройствами",
    icon: Monitor,
  },
  {
    id: "image",
    title: "Имиджевые",
    subtitle: "Без диоптрий и рецепта — оправа как модный аксессуар",
    icon: Sparkles,
  },
  {
    id: "sun-protection",
    title: "Для защиты от солнца",
    subtitle: "Фотохромные или тонированные, с защитой от УФ-лучей",
    icon: Sun,
  },
  // ТЗ §3 lists this as its own step-1 task; the reference wizard does not
  // show it, but the owner asked for it directly (2026-09-01): "Нет варианта
  // линз для контроля миопии детей".
  {
    id: "myopia-control",
    title: "Контроль миопии у ребёнка",
    // Neutral customer-facing wording — no manufacturer line named on the
    // «Назначение» step (Ошибки 2.3, п.13). The concrete lens (MyoCare /
    // Stellest / MiYOSMART) is decided later, in the results.
    subtitle: "Замедляют прогрессирование близорукости у ребёнка",
    icon: Baby,
  },
];

export const CONSULTATION = {
  title: "Заказать консультацию",
  subtitle: "Подобрать линзы вместе со специалистом",
  icon: Phone,
};

export type LensTypeId = "clear" | "photochromic" | "sun";

export interface LensTypeOption {
  id: LensTypeId;
  title: string;
  description: string;
}

export const LENS_TYPES: LensTypeOption[] = [
  {
    id: "clear",
    title: "Прозрачные",
    description: "Линзы для повседневного использования",
  },
  {
    id: "photochromic",
    title: "Фотохромные",
    description: "Хамелеон. Прозрачные в помещении, тёмные на солнце",
  },
  {
    id: "sun",
    title: "Солнечные очки",
    description: "Тонированные, зеркальные или поляризованные",
  },
];

export type PhotochromicTechId =
  | "transitions-gen-s"
  | "transitions-xtractive-ng"
  | "xtractive-polarized"
  | "photofusion"
  | "photofusion-x";

export interface PhotochromicTechOption {
  id: PhotochromicTechId;
  title: string;
  description: string;
}

export const PHOTOCHROMIC_TECHS: PhotochromicTechOption[] = [
  {
    id: "transitions-gen-s",
    title: "Transitions Gen S",
    description: "Новое поколение Transitions: быстрое затемнение и осветление",
  },
  {
    id: "transitions-xtractive-ng",
    title: "Transitions XTRActive NG",
    description: "Максимальное затемнение, срабатывают и за рулём",
  },
  {
    id: "xtractive-polarized",
    title: "Transitions XTRActive Polarized",
    description: "Фотохром с поляризацией в затемнённом состоянии",
  },
  {
    id: "photofusion",
    title: "PhotoFusion",
    description: "Светоадаптивные линзы от ZEISS",
  },
  {
    id: "photofusion-x",
    title: "PhotoFusion X",
    description: "Флагманский фотохром ZEISS: быстрее темнеет и светлеет",
  },
];

export type SunVariantId = "tinted" | "mirrored" | "polarized";

export interface SunVariantOption {
  id: SunVariantId;
  title: string;
  description: string;
}

export const SUN_VARIANTS: SunVariantOption[] = [
  {
    id: "tinted",
    title: "Тонированные",
    description: "Постоянное затемнение выбранного цвета и плотности",
  },
  {
    id: "mirrored",
    title: "Зеркальные",
    description: "Зеркальное покрытие поверх тонировки",
  },
  {
    id: "polarized",
    title: "Поляризованные",
    description: "Убирают отражённые блики от воды, дороги и капота",
  },
];

export type PhotochromicColorId = "gray" | "brown" | "green";

export const PHOTOCHROMIC_COLORS: { id: PhotochromicColorId; title: string; swatch: string }[] = [
  { id: "gray", title: "Серый", swatch: "#6b7280" },
  { id: "brown", title: "Коричневый", swatch: "#795548" },
  { id: "green", title: "Зелёный", swatch: "#526b58" },
];

export type ThicknessId = "1.50" | "1.56" | "poly-159" | "1.60" | "1.67" | "1.74" | "mineral";

export interface ThicknessOption {
  id: ThicknessId;
  title: string;
  description: string;
  /** The recommendation scale value this card corresponds to, if any. */
  index?: "1.50" | "1.56" | "1.60" | "1.67";
}

export const THICKNESSES: ThicknessOption[] = [
  {
    id: "1.50",
    title: "1.5 — Базовый пластик",
    description:
      "Стандартные полимерные линзы для слабой степени аметропии. Оптимальное сочетание цены и качества",
    index: "1.50",
  },
  {
    // Added on the owner's answer to question 13 (2026-09-13): the price
    // lists hold real 1.56 stock (Essilor Organic Middle, FSV, Eyezen lite;
    // Synchrony AS 1.56) that no selectable thickness could reach, and her
    // frame rules already speak of 1.56 as a thickness that exists.
    id: "1.56",
    title: "1.56 — Утончённый бюджетный",
    description:
      "Заметно тоньше базового 1.5 при небольшой доплате. Складские позиции для слабой и средней степени аметропии",
    index: "1.56",
  },
  {
    id: "poly-159",
    title: "Поликарбонат или Trivex (1.59)",
    description:
      "Ударопрочные защитные линзы. Тоньше стандартного пластика до 22%, идеальны для активного образа жизни",
  },
  {
    id: "1.60",
    title: "1.6 — Утончённый пластик",
    description:
      "Облегчённые и утончённые линзы для средней и высокой степени аметропии. Комфортны в ношении",
    index: "1.60",
  },
  {
    id: "1.67",
    title: "1.67 — Высокий индекс",
    description:
      "Ультратонкие и ультралёгкие линзы для сильных рецептов. Эстетичный внешний вид при высоких диоптриях",
    index: "1.67",
  },
  {
    id: "1.74",
    title: "1.74 — Высокий индекс",
    description:
      "Самые тонкие и лёгкие линзы для очень высоких диоптрий. Максимальная эстетика, чуть более долгая адаптация",
  },
  {
    id: "mineral",
    title: "Минеральные линзы",
    description:
      "Стеклянные линзы с отличными оптическими свойствами и устойчивостью к царапинам. Тяжелее пластика, для ободковых оправ",
  },
];

/**
 * "myopia_control" is not a customer-facing choice — DESIGNS below never
 * includes it, so StepDesign's own .map() never renders it as a pickable
 * card. It exists only so «Контроль миопии у ребёнка» has a real DesignId to
 * auto-set (see MYOPIA_CONTROL_DESIGN) and the backend has a matching value
 * to filter internally by — see o_lens_design_of() / o_lens_design_conflicts().
 */
export type DesignId = "spherical" | "aspheric" | "progressive" | "office" | "myopia_control";

export interface DesignOption {
  id: DesignId;
  title: string;
  description: string;
  warning?: string;
}

export const DESIGNS: DesignOption[] = [
  {
    id: "spherical",
    title: "Сферические",
    description:
      "Одинаковый радиус кривизны по всей поверхности. Чёткое изображение в центре линзы",
  },
  {
    id: "aspheric",
    title: "Асферические",
    description:
      "Переменный радиус кривизны: чёткое зрение по всему полю, тоньше и легче, не искажают пропорции глаз",
  },
  {
    id: "progressive",
    title: "Прогрессивные",
    description:
      "Плавный переход между ближним, средним и дальним полем зрения. Подходят для вождения",
  },
  {
    id: "office",
    title: "Офисные",
    description:
      "Для близи и средних дистанций — чтение и работа за компьютером (60 см – 4 метра)",
    warning: "Не подходят для вождения",
  },
];

/**
 * Which «Дизайн» and «Толщина» options each purpose is allowed to show.
 *
 * This MIRRORS the engine's own allowed-set table (the `purpose` block in
 * public_html/api/store/_lens_rules_data.php, functions o_lens_purpose_conflicts
 * / o_lens_design_conflicts). The server already drops the excluded
 * combinations, so offering them here only ever produces a dead-end empty
 * result — exactly the customer's «не показывать варианты, после которых
 * ничего не находится» (Ошибки 2.3, п.17, and п.2/3/5 for the specific cases).
 *
 * `designs` — the only design cards to render (undefined ⇒ all four).
 *   The engine's single-vision bucket covers BOTH surfaces, so a purpose that
 *   allows «single» lists spherical + aspheric here.
 * `hideThicknesses` — «Толщина» ids to drop (undefined ⇒ none). The rx-based
 *   recommendation only ever yields 1.50 / 1.60 / 1.67, so hiding 1.56 / 1.74 /
 *   mineral never collides with a preselected card.
 */
export interface PurposeRule {
  designs?: DesignId[];
  hideThicknesses?: ThicknessId[];
}

export const PURPOSE_RULES: Record<PurposeId, PurposeRule> = {
  // single-vision only
  distance: { designs: ["spherical", "aspheric"] },
  // single-vision + office, никаких прогрессивных (Ошибки 2.3, п.3; SS «для близи»)
  near: { designs: ["spherical", "aspheric", "office"] },
  // прогрессивные/офисные/бифокальные; ни сферических/асферических, ни 1.56 (п.2)
  multifocal: { designs: ["progressive", "office"], hideThicknesses: ["1.56"] },
  // single-vision + прогрессивные, без офисных (п.5)
  driving: { designs: ["spherical", "aspheric", "progressive"] },
  computer: { designs: ["spherical", "aspheric", "office"] },
  image: {},
  "sun-protection": {},
  // MyoCare/Stellest/MiYOSMART не выпускаются в 1.56/1.74/минерале (п.16).
  // Приоритет поликарбоната (п.15) — отдельная задача (Block 6, таблица приоритетов).
  "myopia-control": { hideThicknesses: ["1.56", "1.74", "mineral"] },
};

/**
 * Auto-set the instant «Контроль миопии у ребёнка» is chosen as Назначение
 * (never through StepDesign — deliberately excluded from DESIGNS above), so
 * that step renders a DecidedCard instead of an option list and «Ваши
 * параметры» has a real title to show. LensPriceCards must not forward this
 * id to the backend query — the purpose itself already does the filtering.
 */
export const MYOPIA_CONTROL_DESIGN: DesignOption = {
  id: "myopia_control",
  title: "Определяется производителем",
  description:
    "Линзы ZEISS MyoCare рассчитаны на контроль близорукости у ребёнка — их дизайн не выбирается отдельно.",
};

/**
 * Coating PURCHASE tier, not the coating itself — every offer still shows its
 * real coating name; this only groups it. Wording follows the owner's own
 * client-facing copy for HOYA and ZEISS (podbor_linz/-HOYA-покрытия- 2.xlsx,
 * -ZEISS-покрытия-.xlsx); Essilor and Synchrony have no owner mapping yet, so
 * this description stays brand-agnostic rather than naming a specific line.
 */
/**
 * "myopia-managed" is not a customer-facing choice, same reasoning as
 * DesignId's "myopia_control" above — see MYOPIA_COATING_TIER.
 */
export type CoatingTierId = "basic" | "comfort" | "premium" | "myopia-managed";

export interface CoatingTierOption {
  id: CoatingTierId;
  title: string;
  description: string;
}

export const COATING_TIERS: CoatingTierOption[] = [
  {
    id: "basic",
    title: "Базовое",
    description: "Антибликовое покрытие и защита от УФ — доступный вариант на каждый день",
  },
  {
    id: "comfort",
    title: "Комфорт",
    description:
      "Усиленная защита от УФ, легче в уходе — оптимальный выбор для большинства",
  },
  {
    id: "premium",
    title: "Премиум",
    description:
      "Максимальная прозрачность и стойкость к царапинам — топовые линейки покрытий",
  },
];

/**
 * Auto-set alongside MYOPIA_CONTROL_DESIGN — none of basic/comfort/premium
 * correctly describes MyoCare's fixed DV Kids/Platinum/BlueProtect UV
 * coatings (o_lens_coating_tier_of() deliberately returns 'unknown' for
 * every MyoCare record, to avoid DV Platinum UV colliding with the ordinary
 * ZEISS premium anchor of the same name). LensPriceCards must not forward
 * this id to the backend query, same as MYOPIA_CONTROL_DESIGN.
 */
export const MYOPIA_COATING_TIER: CoatingTierOption = {
  id: "myopia-managed",
  title: "Подбирается по параметрам ребёнка",
  description: "Не входит в общую линейку покрытий — только для линз ZEISS MyoCare.",
};

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
    description: "Varilux, Eyezen, Stellest, Transitions, KODAK, ELEMENTS и MEKK",
  },
  {
    id: "zeiss",
    title: "ZEISS",
    description: "SmartLife, MyoCare, PhotoFusion",
  },
  {
    id: "hoya",
    title: "HOYA",
    description: "HOYA и MAXXEE, включая MiYOSMART",
  },
  {
    id: "synchrony",
    title: "Synchrony",
    description: "Вторая линейка ZEISS: Single Vision, Progressive, Workplace, Bifocal",
  },
];
