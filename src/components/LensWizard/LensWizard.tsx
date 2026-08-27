import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  HelpCircle,
  Info,
  X,
} from "lucide-react";
import type { Product } from "@/data/types";
import { formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import {
  BRANDS,
  CONSULTATION,
  DESIGNS,
  LENS_TYPES,
  PHOTOCHROMIC_COLORS,
  PHOTOCHROMIC_TECHS,
  PURPOSES,
  SUN_VARIANTS,
  THICKNESSES,
  type BrandOption,
  type DesignOption,
  type LensTypeOption,
  type PhotochromicColorId,
  type PhotochromicTechOption,
  type PurposeOption,
  type SunVariantOption,
  type ThicknessOption,
} from "./data";
import { getRecommendedLensIndex, type LensIndexRecommendation } from "./logic";
import {
  fetchLensRecommendation,
  type LensListSort,
  type LensRecommendCard,
  type LensRecommendQuery,
  type LensRecommendResponse,
} from "@/lib/api/lens-recommend";
import { LensRequestForm } from "./LensRequestForm";
import { ScrollHorizon } from "./ScrollHorizon";

type Eye = { sph: string; cyl: string; axi: string; add: string };
const emptyEye: Eye = { sph: "", cyl: "", axi: "", add: "" };

/**
 * Step order mirrors the customer's reference wizard: Назначение → Рецепт →
 * Линзы → Толщина → Дизайн → Бренд → Результаты (handoff §1, 2026-08-22).
 */
type StepId = 1 | 2 | 3 | 4 | 5 | 6 | 7;
const LAST_STEP: StepId = 7;
const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: "Назначение" },
  { id: 2, label: "Рецепт" },
  { id: 3, label: "Линзы" },
  { id: 4, label: "Толщина" },
  { id: 5, label: "Дизайн" },
  { id: 6, label: "Бренд" },
  { id: 7, label: "Результаты" },
];

type RxMode = "has" | "none" | null;

const PRELIMINARY_NOTICE =
  "Подбор предварительный. Точную модель, совместимость и стоимость линз подтвердит менеджер перед оформлением заказа.";

/** Russian plural for «вариант». */
function pluralOptions(n: number) {
  const d10 = n % 10;
  const d100 = n % 100;
  if (d10 === 1 && d100 !== 11) return "вариант";
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return "варианта";
  return "вариантов";
}

/**
 * Плоскоязычное объяснение рекомендации. Ключи — единственные значения,
 * которые может вернуть getRecommendedLensIndex() (см. logic.ts; 1.74
 * исключён владельцем 2026-08-22 по наличию на складе).
 */
const RECOMMENDATION_REASON: Record<string, string> = {
  "1.50":
    "Рецепт небольшой — линзы и так получатся тонкими, переплачивать за высокий индекс не нужно.",
  "1.60": "Рецепт средней силы — эти линзы заметно тоньше базовых и при этом не самые дорогие.",
  "1.67":
    "Рецепт довольно сильный — такие линзы получаются заметно тоньше и легче, очки не будут выглядеть массивными.",
};

/**
 * «Лестница индексов» против «особых материалов». Считается по id, а НЕ по
 * полю `index`: у 1.74 его нет, но это всё равно индексная линза.
 */
const MATERIAL_IDS = new Set(["poly-159", "mineral"]);

export function LensWizard({
  open,
  onClose,
  frame,
  previewImage,
  selectedColor,
}: {
  open: boolean;
  onClose: () => void;
  frame: Product;
  previewImage?: string;
  selectedColor?: string;
}) {
  const [step, setStep] = useState<StepId>(1);
  const [purpose, setPurpose] = useState<PurposeOption | null>(null);
  const [od, setOd] = useState<Eye>(emptyEye);
  const [os, setOs] = useState<Eye>(emptyEye);
  const [pd, setPd] = useState("");
  const [pdNear, setPdNear] = useState("");
  const [twoPd, setTwoPd] = useState(false);
  const [rxMode, setRxMode] = useState<RxMode>(null);
  const [lensType, setLensType] = useState<LensTypeOption | null>(null);
  const [photochromicTech, setPhotochromicTech] = useState<PhotochromicTechOption | null>(null);
  const [photochromicColor, setPhotochromicColor] = useState<PhotochromicColorId | null>(null);
  const [sunVariant, setSunVariant] = useState<SunVariantOption | null>(null);
  const [thickness, setThickness] = useState<ThicknessOption | null>(null);
  // Whether the customer picked the thickness themselves. While false, the
  // recommendation from the prescription may keep (re)selecting the card.
  const [thicknessTouched, setThicknessTouched] = useState(false);
  const [design, setDesign] = useState<DesignOption | null>(null);
  const [brand, setBrand] = useState<BrandOption | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const indexRecommendation = useMemo(
    () => (rxMode === "has" ? getRecommendedLensIndex(od, os) : null),
    [rxMode, od, os],
  );
  const recommendedThickness = useMemo(
    () =>
      indexRecommendation
        ? THICKNESSES.find((option) => option.index === indexRecommendation.index) ?? null
        : null,
    [indexRecommendation],
  );

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    // "auto", not "smooth": smooth-scrolling a 1600px reset on every step
    // change is animation nobody asked for.
    if (open) scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [open, step]);

  if (!open) return null;

  const goNext = () =>
    setStep((s) => {
      const next = s < LAST_STEP ? ((s + 1) as StepId) : s;
      // Entering «Толщина»: preselect the computed index unless the customer
      // already made their own choice (handoff §1 — the recommendation is kept
      // as a preselection the customer may override).
      if (next === 4 && !thicknessTouched && recommendedThickness) {
        setThickness(recommendedThickness);
      }
      return next;
    });
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepId) : s));

  const resetWizard = () => {
    setStep(1);
    setPurpose(null);
    setOd(emptyEye);
    setOs(emptyEye);
    setPd("");
    setPdNear("");
    setTwoPd(false);
    setRxMode(null);
    setLensType(null);
    setPhotochromicTech(null);
    setPhotochromicColor(null);
    setSunVariant(null);
    setThickness(null);
    setThicknessTouched(false);
    setDesign(null);
    setBrand(null);
  };

  const closeWizard = () => {
    resetWizard();
    onClose();
  };

  const handleStepClick = (id: StepId) => {
    // allow navigating only to completed steps or current
    if (id <= step) setStep(id);
  };

  const canProceed = (() => {
    switch (step) {
      case 1:
        return !!purpose;
      case 2: {
        if (rxMode === "none") return true;
        if (rxMode !== "has") return false;
        const eyeIsComplete = (eye: Eye) => {
          const cylinderNeedsAxis = eye.cyl !== "" && Number(eye.cyl) !== 0;
          return eye.sph !== "" && eye.cyl !== "" && (!cylinderNeedsAxis || eye.axi !== "");
        };
        const pdIsComplete = twoPd ? pd !== "" && pdNear !== "" : pd !== "";
        const addIsComplete = !purpose?.requiresAdd || (od.add !== "" && os.add !== "");
        return eyeIsComplete(od) && eyeIsComplete(os) && pdIsComplete && addIsComplete;
      }
      case 3:
        return (
          !!lensType &&
          (lensType.id !== "photochromic" || !!photochromicTech) &&
          (lensType.id !== "sun" || !!sunVariant)
        );
      case 4:
        return !!thickness;
      case 5:
        return !!design;
      case 6:
        return !!brand;
      case 7:
        return true;
      default:
        return false;
    }
  })();

  // Why «Далее» is dead. Rendered in the footer as its own row so it never
  // competes with the frame name for space, and announced politely so screen
  // readers get it even in browse modes that skip disabled controls.
  const blockedReason: string | null = (() => {
    if (canProceed || step === LAST_STEP) return null;
    switch (step) {
      case 1:
        return "Выберите назначение очков";
      case 2:
        return rxMode === null
          ? "Выберите вариант — с рецептом или без"
          : "Заполните данные для обоих глаз и межзрачковое расстояние";
      case 3:
        if (!lensType) return "Выберите тип линз";
        if (lensType.id === "photochromic") return "Ниже — выберите технологию фотохрома";
        return "Ниже — выберите вариант затемнения";
      case 4:
        return "Выберите толщину линз";
      case 5:
        return "Выберите дизайн линз";
      case 6:
        return "Выберите бренд";
      default:
        return null;
    }
  })();

  return (
    // Tailwind v4's preflight dropped `cursor: pointer` on <button>, so every
    // card in the wizard was showing an arrow — a large part of why the option
    // and price cards did not read as clickable. Scoped to the wizard.
    <div className="fixed inset-0 z-[60] flex flex-col bg-background [&_button:not(:disabled)]:cursor-pointer">
      {/* Top stepper */}
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center gap-6 px-4 py-3 lg:px-8">
          <div className="font-serif text-lg tracking-tight">
            ОПТИКА<span className="text-brand">100%</span>
          </div>
          <nav className="hidden flex-1 items-center gap-1 overflow-x-auto md:flex">
            {STEPS.map((s) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStepClick(s.id)}
                  disabled={s.id > step}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors",
                    active && "text-brand",
                    done && "text-foreground",
                    !active && !done && "text-muted-foreground/60",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                      active && "bg-brand text-brand-foreground",
                      done && "bg-foreground text-background",
                      !active && !done && "border border-border",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" /> : s.id}
                  </span>
                  <span className="hidden lg:inline">{s.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3 md:hidden">
            <span className="text-xs text-muted-foreground">
              Шаг {step}/{LAST_STEP}
            </span>
          </div>
          <button
            onClick={closeWizard}
            aria-label="Закрыть"
            className="rounded-full p-2 hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 pb-3 md:hidden">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              aria-label={`Назад к шагу ${step - 1}: ${STEPS[step - 2].label}`}
              className="-my-1 -ml-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              style={{ transitionDuration: "var(--duration-snap)" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <div className="text-xs uppercase tracking-wider text-brand">{STEPS[step - 1].label}</div>
        </div>
      </header>

      {/* Body */}
      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} className="h-full overflow-y-auto overscroll-contain">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 pb-14 pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:px-8 lg:py-10">
          {/* LEFT: frame preview */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <button
              onClick={closeWizard}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к оправе
            </button>
            <div className="rounded-2xl bg-surface p-6">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={previewImage ?? frame.images[0]}
                  alt={frame.name}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
              <h2 className="mt-4 font-serif text-xl">
                {frame.brand} {frame.name}
              </h2>
              {selectedColor && (
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Цвет оправы: {selectedColor}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                В подборе представлены Essilor, ZEISS, HOYA с линейками MAXXEE и Synchrony.
                Окончательная совместимость проверяется по конкретной позиции прайса.
              </p>
            </div>
          </aside>

          {/* RIGHT: step content */}
          <main className="min-w-0">
            {/* Expectation-setter, shown where expectations are formed (step 1)
                and where they are acted on (step 7) — not on all seven steps in
                the alert costume that made it read as an alarm. */}
            {step === 1 && (
              <p className="mb-5 flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
                {PRELIMINARY_NOTICE}
              </p>
            )}

            {/* Mobile uses the chevron in the sticky step-label row instead. */}
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="mb-4 hidden items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
                style={{ transitionDuration: "var(--duration-snap)" }}
              >
                <ChevronLeft className="h-4 w-4" /> Назад
              </button>
            )}

            {step === 1 && (
              <StepPurpose
                value={purpose}
                onChange={(v) => {
                  setPurpose(v);
                  setRxMode(null);
                  setOd(emptyEye);
                  setOs(emptyEye);
                  setPd("");
                  setPdNear("");
                  setLensType(null);
                  setPhotochromicTech(null);
                  setPhotochromicColor(null);
                  setSunVariant(null);
                  setThickness(null);
                  setThicknessTouched(false);
                  setDesign(null);
                  setBrand(null);
                }}
              />
            )}
            {step === 2 && (
              <StepRx
                purpose={purpose}
                od={od}
                setOd={setOd}
                os={os}
                setOs={setOs}
                pd={pd}
                setPd={setPd}
                pdNear={pdNear}
                setPdNear={setPdNear}
                twoPd={twoPd}
                setTwoPd={setTwoPd}
                mode={rxMode}
                setMode={setRxMode}
              />
            )}
            {step === 3 && (
              <StepLensType
                lensType={lensType}
                setLensType={(option) => {
                  setLensType(option);
                  if (option.id !== "photochromic") {
                    setPhotochromicTech(null);
                    setPhotochromicColor(null);
                  }
                  if (option.id !== "sun") setSunVariant(null);
                }}
                photochromicTech={photochromicTech}
                setPhotochromicTech={setPhotochromicTech}
                photochromicColor={photochromicColor}
                setPhotochromicColor={setPhotochromicColor}
                sunVariant={sunVariant}
                setSunVariant={setSunVariant}
              />
            )}
            {step === 4 && (
              <StepThickness
                value={thickness}
                onChange={(option) => {
                  setThickness(option);
                  setThicknessTouched(true);
                }}
                recommendation={indexRecommendation}
                recommendedThickness={recommendedThickness}
              />
            )}
            {step === 5 && <StepDesign value={design} onChange={setDesign} purpose={purpose} />}
            {step === 6 && <StepBrand value={brand} onChange={setBrand} />}
            {step === 7 && (
              <StepResults
                onEditStep={setStep}
                frame={frame}
                selectedColor={selectedColor}
                purpose={purpose}
                rxMode={rxMode}
                od={od}
                os={os}
                pd={pd}
                pdNear={pdNear}
                twoPd={twoPd}
                lensType={lensType}
                photochromicTech={photochromicTech}
                photochromicColor={photochromicColor}
                sunVariant={sunVariant}
                thickness={thickness}
                recommendedThickness={recommendedThickness}
                design={design}
                brand={brand}
                indexRecommendation={indexRecommendation}
              />
            )}
          </main>
        </div>
        </div>
        <ScrollHorizon scrollRef={scrollRef} />
      </div>

      {/* Sticky footer */}
      <footer className="sticky bottom-0 z-10 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
        {blockedReason && (
          <div
            id="wizard-block-hint"
            role="status"
            aria-live="polite"
            className="border-b border-border/60 px-4 py-2 text-[12px] leading-tight text-foreground/70 lg:px-8"
          >
            {blockedReason}
          </div>
        )}
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={previewImage ?? frame.images[0]}
              alt=""
              aria-hidden
              className="h-10 w-12 shrink-0 object-contain mix-blend-multiply lg:hidden"
            />
            <div className="min-w-0 text-sm">
              <div className="truncate text-xs text-muted-foreground">
                {frame.brand} {frame.name}
                {selectedColor ? ` · ${selectedColor}` : ""}
              </div>
              <strong className="font-serif text-lg sm:text-xl">{formatPrice(frame.price)}</strong>
              <div className="hidden text-xs text-muted-foreground sm:block">
                Стоимость линз — после проверки подбора
              </div>
            </div>
          </div>
          {step < LAST_STEP ? (
            <button
              onClick={goNext}
              disabled={!canProceed}
              aria-describedby={blockedReason ? "wizard-block-hint" : undefined}
              className="shrink-0 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-40 sm:px-8"
            >
              Далее
            </button>
          ) : (
            <a
              href="#lens-request-form"
              className="shrink-0 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 sm:px-8"
            >
              Перейти к заявке
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

/* --------------------------- Step components --------------------------- */

function StepHeader({
  title,
  subtitle,
  count,
}: {
  title: string;
  subtitle?: string;
  /** How many options this step offers — the cheapest possible "there is more below". */
  count?: number;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="font-serif text-2xl lg:text-3xl">{title}</h1>
        {count != null && (
          <span className="shrink-0 text-[11px] uppercase tracking-[0.14em] tabular-nums text-muted-foreground">
            {count} {pluralOptions(count)}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/**
 * `bg-brand/5` + `border-brand` + `text-brand` is reserved for the customer's
 * own selection and the system's recommendation. Informational prose never
 * wears it — that reservation is what stopped step 4 reading as two alarms.
 */
function OptionCard({
  active,
  title,
  description,
  warning,
  badge,
  meta,
  icon,
  rightSlot,
  onClick,
}: {
  active: boolean;
  title: string;
  description?: string;
  warning?: string;
  badge?: string;
  meta?: React.ReactNode;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        transitionDuration: "var(--duration-snap)",
        transitionTimingFunction: "var(--ease-editorial)",
      }}
      className={cn(
        "group flex w-full scroll-mb-32 items-start gap-3 rounded-xl border bg-background p-4 text-left transition-colors lg:scroll-mb-8 lg:gap-4 lg:p-5",
        active ? "border-brand bg-brand/5 shadow-sm" : "border-border hover:border-foreground/30",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-lg">{title}</h3>
          {badge && (
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p
            className={cn(
              "mt-1.5 text-sm text-muted-foreground",
              // The card the customer chose is the one they can read in full.
              !active && "line-clamp-2 lg:line-clamp-none",
            )}
          >
            {description}
          </p>
        )}
        {meta && <p className="mt-1.5 text-xs text-muted-foreground">{meta}</p>}
        {warning && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700">
            <HelpCircle className="h-3 w-3" /> {warning}
          </p>
        )}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      {icon && (
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl lg:h-14 lg:w-14",
            active ? "bg-brand text-brand-foreground" : "bg-surface text-muted-foreground",
          )}
        >
          {icon}
        </div>
      )}
    </button>
  );
}

function ConsultationCard() {
  const Icon = CONSULTATION.icon;
  return (
    <a
      href="/contacts/"
      className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 transition-colors hover:border-foreground/30 lg:p-5"
    >
      <div className="flex-1">
        <h3 className="font-serif text-lg">{CONSULTATION.title}</h3>
        <p className="mt-1 text-sm text-brand">{CONSULTATION.subtitle}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand lg:h-14 lg:w-14">
        <Icon className="h-6 w-6" />
      </div>
    </a>
  );
}

function StepPurpose({
  value,
  onChange,
}: {
  value: PurposeOption | null;
  onChange: (v: PurposeOption) => void;
}) {
  return (
    <div>
      <StepHeader title="Для чего вы используете очки?" count={PURPOSES.length} />
      <div
        role="group"
        aria-label={`Назначение очков: ${PURPOSES.length} ${pluralOptions(PURPOSES.length)}`}
        className="space-y-3"
      >
        {PURPOSES.map((p) => {
          const Icon = p.icon;
          return (
            <OptionCard
              key={p.id}
              active={value?.id === p.id}
              title={p.title}
              description={p.subtitle}
              icon={<Icon className="h-6 w-6 lg:h-7 lg:w-7" />}
              onClick={() => onChange(p)}
            />
          );
        })}
      </div>
      <div className="mt-6">
        <ConsultationCard />
      </div>
    </div>
  );
}

function RxSelect({
  value,
  onChange,
  options,
  placeholder = "Нет",
  disabled,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-brand focus:outline-none",
        disabled && "cursor-not-allowed bg-surface text-muted-foreground",
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function StepRx({
  purpose,
  od,
  setOd,
  os,
  setOs,
  pd,
  setPd,
  pdNear,
  setPdNear,
  twoPd,
  setTwoPd,
  mode,
  setMode,
}: {
  purpose: PurposeOption | null;
  od: Eye;
  setOd: (v: Eye) => void;
  os: Eye;
  setOs: (v: Eye) => void;
  pd: string;
  setPd: (v: string) => void;
  pdNear: string;
  setPdNear: (v: string) => void;
  twoPd: boolean;
  setTwoPd: (v: boolean) => void;
  mode: RxMode;
  setMode: (v: RxMode) => void;
}) {
  const sphValues = useMemo(() => {
    const arr: string[] = [];
    for (let v = -12; v <= 12; v += 0.25) {
      const sign = v > 0 ? "+" : "";
      arr.push(`${sign}${v.toFixed(2)}`);
    }
    return arr;
  }, []);
  const cylValues = useMemo(() => {
    const arr: string[] = [];
    for (let v = -6; v <= 6; v += 0.25) {
      const sign = v > 0 ? "+" : "";
      arr.push(`${sign}${v.toFixed(2)}`);
    }
    return arr;
  }, []);
  const axiValues = useMemo(() => Array.from({ length: 181 }, (_, i) => String(i)), []);
  const addValues = useMemo(() => {
    const arr: string[] = [];
    for (let v = 0.5; v <= 3.5; v += 0.25) arr.push(`+${v.toFixed(2)}`);
    return arr;
  }, []);
  const pdValues = useMemo(() => {
    const arr: string[] = [];
    for (let v = 48; v <= 78; v += 0.5) arr.push(v.toFixed(1));
    return arr;
  }, []);
  const monocularPdValues = useMemo(() => {
    const arr: string[] = [];
    for (let v = 24; v <= 40; v += 0.5) arr.push(v.toFixed(1));
    return arr;
  }, []);

  const hasCyl = (eye: Eye) => eye.cyl !== "" && Number(eye.cyl) !== 0;
  const showAdd = !!purpose?.requiresAdd;

  if (mode === null) {
    return (
      <div>
        <StepHeader
          title="У вас есть рецепт?"
          subtitle="Рецепт позволяет проверить диапазоны конкретных линз и рассчитать параметры для каждого глаза."
        />
        <div className="space-y-3">
          <OptionCard
            active={false}
            title="У меня есть рецепт"
            description="Ввести SPH, CYL, AXIS, ADD и межзрачковое расстояние"
            onClick={() => setMode("has")}
          />
          <OptionCard
            active={false}
            title="Рецепта нет — подобрать по потребностям"
            description="Покажем только предварительный вариант без проверки по диоптриям"
            onClick={() => setMode("none")}
          />
        </div>
        <div className="mt-6">
          <ConsultationCard />
        </div>
      </div>
    );
  }

  if (mode === "none") {
    return (
      <div>
        <StepHeader title="Подбор без рецепта" />
        {/* This screen used to be a lone grey box headed «Точную совместимость и
            итоговую цену определить нельзя», which read as a dead end even
            though «Далее» was enabled. State the outcome instead: the choice is
            made, it is fine, and the caveat is a footnote — not the headline. */}
        <DecidedCard
          eyebrow="Можно продолжать"
          title="Подбираем без рецепта"
          reason="Пройдём оставшиеся шаги и покажем подходящие варианты линз. Нажмите «Далее», чтобы продолжить."
          note="Точную совместимость и итоговую стоимость подтвердит специалист: рецепт понадобится только при оформлении заказа, его можно передать позже."
        />
        <button
          type="button"
          onClick={() => setMode(null)}
          className="mt-4 text-sm font-medium text-brand hover:underline"
        >
          Изменить вариант
        </button>
        <div className="mt-8">
          <ConsultationCard />
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepHeader
        title="Ваш рецепт"
        subtitle="Заполните ваш рецепт от врача-офтальмолога. Все параметры должны точно совпадать с рецептом."
      />
      <button
        type="button"
        onClick={() => setMode(null)}
        className="mb-5 text-sm font-medium text-brand hover:underline"
      >
        Изменить вариант
      </button>

      <div className="grid gap-4 md:grid-cols-2">
        {(["right", "left"] as const).map((side) => {
          const eye = side === "right" ? od : os;
          const set = side === "right" ? setOd : setOs;
          const label = side === "right" ? "OD · Правый глаз" : "OS · Левый глаз";
          return (
            <section key={side} className="rounded-xl border border-border p-4">
              <h2 className="mb-4 font-medium">{label}</h2>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs text-muted-foreground">
                  Сфера (SPH) *
                  <div className="mt-1">
                    <RxSelect
                      ariaLabel={`${label}: сфера`}
                      value={eye.sph}
                      onChange={(v) => set({ ...eye, sph: v })}
                      options={sphValues}
                    />
                  </div>
                </label>
                <label className="text-xs text-muted-foreground">
                  Цилиндр (CYL) *
                  <div className="mt-1">
                    <RxSelect
                      ariaLabel={`${label}: цилиндр`}
                      value={eye.cyl}
                      onChange={(v) =>
                        set({ ...eye, cyl: v, axi: v !== "" && Number(v) !== 0 ? eye.axi : "" })
                      }
                      options={cylValues}
                    />
                  </div>
                </label>
                <label className="text-xs text-muted-foreground">
                  Ось (AXIS)
                  <div className="mt-1">
                    <RxSelect
                      ariaLabel={`${label}: ось`}
                      value={eye.axi}
                      onChange={(v) => set({ ...eye, axi: v })}
                      options={axiValues}
                      disabled={!hasCyl(eye)}
                    />
                  </div>
                </label>
                {showAdd && (
                  <label className="text-xs text-muted-foreground">
                    Аддидация (ADD) *
                    <div className="mt-1">
                      <RxSelect
                        ariaLabel={`${label}: аддидация`}
                        value={eye.add}
                        onChange={(v) => set({ ...eye, add: v })}
                        options={addValues}
                      />
                    </div>
                  </label>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-border p-4 lg:p-5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={twoPd}
            onChange={(e) => {
              setTwoPd(e.target.checked);
              setPd("");
              setPdNear("");
            }}
          />
          В рецепте отдельно указаны PD правого и левого глаза
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="mb-1 text-xs text-muted-foreground">
              {twoPd ? "PD правого глаза" : "PD · межзрачковое расстояние"}
            </div>
            <RxSelect
              value={pd}
              onChange={setPd}
              options={twoPd ? monocularPdValues : pdValues}
              placeholder="—"
            />
          </div>
          {twoPd && (
            <div>
              <div className="mb-1 text-xs text-muted-foreground">PD левого глаза</div>
              <RxSelect
                value={pdNear}
                onChange={setPdNear}
                options={monocularPdValues}
                placeholder="—"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepLensType({
  lensType,
  setLensType,
  photochromicTech,
  setPhotochromicTech,
  photochromicColor,
  setPhotochromicColor,
  sunVariant,
  setSunVariant,
}: {
  lensType: LensTypeOption | null;
  setLensType: (v: LensTypeOption) => void;
  photochromicTech: PhotochromicTechOption | null;
  setPhotochromicTech: (v: PhotochromicTechOption) => void;
  photochromicColor: PhotochromicColorId | null;
  setPhotochromicColor: (v: PhotochromicColorId) => void;
  sunVariant: SunVariantOption | null;
  setSunVariant: (v: SunVariantOption) => void;
}) {
  return (
    <div>
      <StepHeader
        title="Какие линзы вам нужны?"
        count={LENS_TYPES.length}
        subtitle="Прозрачные, фотохромные или солнцезащитные. Доступность проверяется по конкретной позиции прайса."
      />
      <div
        role="group"
        aria-label={`Тип линз: ${LENS_TYPES.length} ${pluralOptions(LENS_TYPES.length)}`}
        className="space-y-3"
      >
        {LENS_TYPES.map((option) => (
          <OptionCard
            key={option.id}
            active={lensType?.id === option.id}
            title={option.title}
            description={option.description}
            onClick={() => setLensType(option)}
          />
        ))}
      </div>

      {lensType?.id === "photochromic" && (
        <section className="mt-7 rounded-xl border border-border p-5">
          <h2 className="font-serif text-xl">Технология фотохрома</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Выберите семейство светоадаптивных линз.
          </p>
          <div
            role="group"
            aria-label={`Технология фотохрома: ${PHOTOCHROMIC_TECHS.length} ${pluralOptions(PHOTOCHROMIC_TECHS.length)}`}
            className="mt-4 space-y-3"
          >
            {PHOTOCHROMIC_TECHS.map((tech) => (
              <OptionCard
                key={tech.id}
                active={photochromicTech?.id === tech.id}
                title={tech.title}
                description={tech.description}
                onClick={() => setPhotochromicTech(tech)}
              />
            ))}
          </div>
          <h3 className="mt-6 font-medium">Цвет затемнения</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Необязательно — доступность цвета проверит специалист.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {PHOTOCHROMIC_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                aria-pressed={photochromicColor === color.id}
                onClick={() => setPhotochromicColor(color.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm",
                  photochromicColor === color.id
                    ? "border-brand bg-brand/5"
                    : "border-border hover:border-foreground/30",
                )}
              >
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color.swatch }} />
                {color.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {lensType?.id === "sun" && (
        <section className="mt-7 rounded-xl border border-border p-5">
          <h2 className="font-serif text-xl">Вариант затемнения</h2>
          <div
            role="group"
            aria-label={`Вариант затемнения: ${SUN_VARIANTS.length} ${pluralOptions(SUN_VARIANTS.length)}`}
            className="mt-4 space-y-3"
          >
            {SUN_VARIANTS.map((variant) => (
              <OptionCard
                key={variant.id}
                active={sunVariant?.id === variant.id}
                title={variant.title}
                description={variant.description}
                onClick={() => setSunVariant(variant)}
              />
            ))}
          </div>
        </section>
      )}

      <div className="mt-8">
        <ConsultationCard />
      </div>
    </div>
  );
}

/**
 * Карточка принятого решения. Не кнопка: нажатие ничего не переключает.
 *
 * The wizard's one way of saying «this is settled, and here is why» — used for
 * the prescription-derived thickness and for the no-prescription branch, both
 * of which previously announced themselves in alert-shaped boxes.
 */
function DecidedCard({
  eyebrow,
  title,
  reason,
  note,
  description,
}: {
  eyebrow: string;
  title: string;
  reason?: string;
  note?: string;
  description?: string;
}) {
  return (
    <div className="relative rounded-xl border border-brand bg-brand/5 p-4 shadow-sm lg:p-5">
      <span className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-brand">
        <Check className="h-3.5 w-3.5 text-brand-foreground" strokeWidth={3} />
      </span>
      <div className="pr-8 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand">
        {eyebrow}
      </div>
      <h3 className="mt-1.5 pr-8 font-serif text-lg">{title}</h3>
      {reason && <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/75">{reason}</p>}
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
      {description && <p className="mt-3 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

function StepThickness({
  value,
  onChange,
  recommendation,
  recommendedThickness,
}: {
  value: ThicknessOption | null;
  onChange: (v: ThicknessOption) => void;
  recommendation: LensIndexRecommendation | null;
  recommendedThickness: ThicknessOption | null;
}) {
  // Mount state, never reactive state: the list must never collapse under the
  // customer's finger. goNext() preselects recommendedThickness, so `value` is
  // normally already set when we arrive.
  const [showAll, setShowAll] = useState(!recommendedThickness);

  const featured = value ?? recommendedThickness;
  const isRecommended = !!featured && featured.id === recommendedThickness?.id;
  const se = recommendation
    ? recommendation.governingAbsSphericalEquivalent.toFixed(2).replace(".", ",")
    : null;

  // Порядок показа: сначала лестница индексов, затем особые материалы.
  // data.ts НЕ трогаем — разбиение только на отрисовке.
  const ladder = THICKNESSES.filter((o) => !MATERIAL_IDS.has(o.id));
  const materials = THICKNESSES.filter((o) => MATERIAL_IDS.has(o.id));

  const groupHeading =
    "mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";

  const renderCard = (option: ThicknessOption) => (
    <OptionCard
      key={option.id}
      active={value?.id === option.id}
      title={option.title}
      description={option.description}
      badge={recommendedThickness?.id === option.id ? "По вашему рецепту" : undefined}
      onClick={() => onChange(option)}
    />
  );

  // Свёрнутый вид — только на мобильных. На десктопе места хватает на все шесть.
  const collapsed = !showAll && !!featured;

  return (
    <div>
      {collapsed ? (
        <>
          <StepHeader title="Толщина и материал линз" />
          <div className="lg:hidden">
            <DecidedCard
              title={featured!.title}
              description={featured!.description}
              eyebrow={isRecommended ? "Подобрано по вашему рецепту" : "Ваш выбор"}
              reason={
                isRecommended && recommendation
                  ? RECOMMENDATION_REASON[recommendation.index]
                  : undefined
              }
              note={
                isRecommended && se
                  ? `Сфероэквивалент ${se} — считаем по глазу с большей нагрузкой.`
                  : undefined
              }
            />
            <button
              type="button"
              aria-expanded={false}
              aria-controls="thickness-options"
              onClick={() => setShowAll(true)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-medium text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground"
              style={{ transitionDuration: "var(--duration-snap)" }}
            >
              Другие варианты · {THICKNESSES.length - 1}
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <StepHeader
          title="Толщина и материал линз"
          count={THICKNESSES.length}
          subtitle="Чем выше индекс, тем тоньше и легче линза при том же рецепте."
        />
      )}

      {/* На десктопе список виден всегда; на мобильных — только когда развёрнут. */}
      <div className={collapsed ? "hidden lg:block" : undefined}>
        {recommendedThickness && showAll && (
          <button
            type="button"
            aria-expanded
            aria-controls="thickness-options"
            onClick={() => setShowAll(false)}
            className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground/60 transition-colors hover:text-foreground lg:hidden"
            style={{ transitionDuration: "var(--duration-snap)" }}
          >
            <ChevronUp className="h-4 w-4" /> Свернуть
          </button>
        )}

        <div
          id="thickness-options"
          role="group"
          aria-label={`Толщина и материал линз: ${THICKNESSES.length} ${pluralOptions(THICKNESSES.length)}`}
        >
          <div className={groupHeading}>По индексу</div>
          <div className="space-y-3">{ladder.map(renderCard)}</div>
          <div className={cn(groupHeading, "mt-6")}>Особые материалы</div>
          <div className="space-y-3">{materials.map(renderCard)}</div>
        </div>
      </div>

      <div className="mt-6">
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepDesign({
  value,
  onChange,
  purpose,
}: {
  value: DesignOption | null;
  onChange: (v: DesignOption) => void;
  purpose: PurposeOption | null;
}) {
  const multifocal = purpose?.id === "multifocal";
  return (
    <div>
      <StepHeader
        title="Дизайн линз"
        count={DESIGNS.length}
        subtitle="Дизайн определяет, как распределены зоны чёткого зрения по поверхности линзы."
      />
      <div
        role="group"
        aria-label={`Дизайн линз: ${DESIGNS.length} ${pluralOptions(DESIGNS.length)}`}
        className="space-y-3"
      >
        {DESIGNS.map((option) => (
          <OptionCard
            key={option.id}
            active={value?.id === option.id}
            title={option.title}
            description={option.description}
            warning={option.warning}
            badge={
              multifocal && (option.id === "progressive" || option.id === "office")
                ? "Для дали и близи"
                : undefined
            }
            onClick={() => onChange(option)}
          />
        ))}
      </div>
      <div className="mt-6">
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepBrand({
  value,
  onChange,
}: {
  value: BrandOption | null;
  onChange: (v: BrandOption) => void;
}) {
  return (
    <div>
      <StepHeader
        title="Выберите бренд"
        count={BRANDS.length}
        subtitle="Бренд применяется после проверки назначения, рецепта и выбранных условий."
      />
      <div
        role="group"
        aria-label={`Бренд: ${BRANDS.length} ${pluralOptions(BRANDS.length)}`}
        className="space-y-3"
      >
        {BRANDS.map((o) => (
          <OptionCard
            key={o.id}
            active={value?.id === o.id}
            title={o.title}
            description={o.description}
            onClick={() => onChange(o)}
          />
        ))}
      </div>
      <div className="mt-6">
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepResults({
  onEditStep,
  frame,
  selectedColor,
  purpose,
  rxMode,
  od,
  os,
  pd,
  pdNear,
  twoPd,
  lensType,
  photochromicTech,
  photochromicColor,
  sunVariant,
  thickness,
  recommendedThickness,
  design,
  brand,
  indexRecommendation,
}: {
  /** Jump back to a step, so a dead end can offer a way out of itself. */
  onEditStep: (step: StepId) => void;
  frame: Product;
  selectedColor?: string;
  purpose: PurposeOption | null;
  rxMode: RxMode;
  od: Eye;
  os: Eye;
  pd: string;
  pdNear: string;
  twoPd: boolean;
  lensType: LensTypeOption | null;
  photochromicTech: PhotochromicTechOption | null;
  photochromicColor: PhotochromicColorId | null;
  sunVariant: SunVariantOption | null;
  thickness: ThicknessOption | null;
  recommendedThickness: ThicknessOption | null;
  design: DesignOption | null;
  brand: BrandOption | null;
  indexRecommendation: LensIndexRecommendation | null;
}) {
  // The picked price card lives here, not in LensPriceCards, because it has to
  // reach requestDraft — the customer choosing «Премиум» is part of the request.
  const [chosenOffer, setChosenOffer] = useState<ChosenOffer | null>(null);
  const colorTitle = PHOTOCHROMIC_COLORS.find((color) => color.id === photochromicColor)?.title;
  const formatSphericalEquivalent = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;

  const lensTypeSummary = lensType
    ? [
        lensType.title,
        lensType.id === "photochromic" ? photochromicTech?.title : undefined,
        lensType.id === "photochromic" ? colorTitle : undefined,
        lensType.id === "sun" ? sunVariant?.title : undefined,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  const thicknessIsRecommended =
    !!thickness && !!recommendedThickness && thickness.id === recommendedThickness.id;

  const requestDraft = {
    frame: {
      id: frame.id,
      slug: frame.slug,
      name: frame.name,
      brand: frame.brand,
      color: selectedColor,
      price: frame.price,
    },
    selection: {
      purpose: purpose?.title ?? "",
      rxMode: rxMode === "has" ? ("has" as const) : ("none" as const),
      finish: lensTypeSummary,
      photochromicColor: colorTitle,
      thickness: thickness?.title ?? "",
      thicknessIsRecommended,
      design: design?.title ?? "",
      brand: brand?.title ?? "",
      chosenOffer: chosenOffer ? formatChosenOffer(chosenOffer) : undefined,
    },
    prescription:
      rxMode === "has" && indexRecommendation
        ? {
            od: {
              sph: od.sph,
              cyl: od.cyl,
              axis: od.axi,
              add: od.add,
              sphericalEquivalent: formatSphericalEquivalent(
                indexRecommendation.odSphericalEquivalent,
              ),
            },
            os: {
              sph: os.sph,
              cyl: os.cyl,
              axis: os.axi,
              add: os.add,
              sphericalEquivalent: formatSphericalEquivalent(
                indexRecommendation.osSphericalEquivalent,
              ),
            },
            pdMode: twoPd ? ("monocular" as const) : ("binocular" as const),
            pd: twoPd ? undefined : pd,
            pdOd: twoPd ? pd : undefined,
            pdOs: twoPd ? pdNear : undefined,
            recommendedIndex: indexRecommendation.index,
          }
        : null,
  };

  const rows = [
    // Makes the deleted mobile frame strip lossless: the frame is still named
    // on the step where the customer reviews what they are about to request.
    [
      "Оправа",
      `${frame.brand} ${frame.name}${selectedColor ? ` · ${selectedColor}` : ""}`,
    ],
    ["Назначение", purpose?.title],
    ["Рецепт", rxMode === "has" ? "Введён" : "Нет — предварительный подбор"],
    [
      "Сфероэквивалент",
      indexRecommendation
        ? `OD ${formatSphericalEquivalent(indexRecommendation.odSphericalEquivalent)} · OS ${formatSphericalEquivalent(indexRecommendation.osSphericalEquivalent)}`
        : null,
    ],
    ["Линзы", lensTypeSummary || null],
    [
      "Толщина",
      thickness
        ? thickness.title + (thicknessIsRecommended ? " — рекомендовано по рецепту" : "")
        : null,
    ],
    ["Дизайн", design?.title],
    ["Бренд", brand?.title],
    ["Выбранный вариант", chosenOffer ? formatChosenOffer(chosenOffer) : null],
  ];

  return (
    <div>
      <StepHeader
        title="Предварительный подбор сформирован"
        subtitle={
          rxMode === "has"
            ? "Ниже — подходящие линзы с ориентировочными ценами. Точную модель и совместимость подтвердит специалист."
            : "Ниже — линзы с выбранными параметрами и ориентировочными ценами. Точный расчёт специалист сделает по рецепту."
        }
      />

      <section className="rounded-xl border border-border bg-surface/50 p-5">
        <h2 className="font-serif text-xl">Ваши параметры</h2>
        <dl className="mt-4 space-y-3 text-sm">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="grid gap-1 sm:grid-cols-[150px_1fr] sm:gap-4">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
        </dl>
      </section>

      <LensPriceCards
        chosen={chosenOffer}
        onChoose={setChosenOffer}
        onEditStep={onEditStep}
        rxMode={rxMode}
        design={design}
        od={od}
        os={os}
        lensType={lensType}
        photochromicTech={photochromicTech}
        sunVariant={sunVariant}
        thickness={thickness}
        brand={brand}
      />

      <p className="mt-8 border-t border-border pt-4 text-[13px] leading-relaxed text-muted-foreground">
        {indexRecommendation
          ? "Рекомендуемый индекс рассчитан по глазу с большей нагрузкой и применён к обеим линзам. "
          : "Толщину вы выбрали сами — по рецепту мы бы посчитали её за вас, по глазу с большей нагрузкой. "}
        {PRELIMINARY_NOTICE}
      </p>

      <LensRequestForm draft={requestDraft} />
    </div>
  );
}

/* ----------------------------- Price cards ----------------------------- */

/** The «Толщина» card as the endpoint's index filter; null = cannot filter. */
function thicknessToIndex(thickness: ThicknessOption | null): string | null {
  switch (thickness?.id) {
    case "1.50":
      return "1.50";
    case "poly-159":
      return "1.59";
    case "1.60":
      return "1.60";
    case "1.67":
      return "1.67";
    case "1.74":
      return "1.74";
    default:
      return null; // минеральные: material, not an index — the manager quotes it
  }
}

/** Treatment keyword for the chosen photochromic tech / sun variant. */
function tintKeyword(
  lensType: LensTypeOption | null,
  tech: PhotochromicTechOption | null,
  sun: SunVariantOption | null,
): string | undefined {
  if (lensType?.id === "photochromic" && tech) {
    switch (tech.id) {
      case "transitions-gen-s":
        return "Gen S";
      case "transitions-xtractive-ng":
        return "XTRActive";
      // The supplier sheets spell it both "XTRActive" and "XRTActive", so match
      // on the Polarized half.
      case "xtractive-polarized":
        return "Pola";
      case "photofusion":
        return "PhotoFusion";
      case "photofusion-x":
        return "PhotoFusion X";
    }
  }
  if (lensType?.id === "sun" && sun) {
    switch (sun.id) {
      case "tinted":
        return "Окрашен|тониров|Tint";
      case "mirrored":
        return "Mirror|зеркал";
      case "polarized":
        return "Pola|Xperio|поляриз";
    }
  }
  return undefined;
}

/** The price card the customer picked, kept small enough to live in the request. */
type ChosenOffer = {
  /**
   * What was picked, so the same lens reads as chosen wherever it appears:
   * `tier:premium` from a card, `offer:<id>` from a row of the full list. A
   * row that is also one of the three cards carries both.
   */
  keys: string[];
  tier: string;
  supplier: string;
  line: string;
  coating?: string;
  treatment?: string;
  priceRub: number | null;
};

/** Is this card or row the one the customer picked? */
function offerIsChosen(chosen: ChosenOffer | null, keys: string[]): boolean {
  return !!chosen && chosen.keys.some((key) => keys.includes(key));
}

/** «ESSILOR» + «AS Stylis», without printing the brand twice. */
function offerProductName(supplier: string, line: string) {
  // `supplier` is a slug ("zeiss") and `line` usually already opens with the
  // brand ("ZEISS Single Vision…") — printing both gives "zeiss ZEISS …".
  const brand = supplier.toUpperCase();
  return line.toUpperCase().startsWith(brand) ? line : `${brand} ${line}`;
}

/** Coating and treatment as one line; the sheets wrap treatments over newlines. */
function offerSpecs(coating?: string, treatment?: string) {
  return [coating, treatment?.replace(/\s+/g, " ")].filter(Boolean).join(" · ");
}

/** Flattened for the salon email — the backend reads scalars out of `selection`. */
function formatChosenOffer(offer: ChosenOffer) {
  // Pair first, matching what the card leads with — it is what the customer pays.
  const price =
    offer.priceRub !== null
      ? `${formatPrice(offer.priceRub * 2)} за пару (${formatPrice(offer.priceRub)} за линзу)`
      : "цена по запросу";
  // The coating is what separates two otherwise identical rows of the full
  // list, so a pick made there is ambiguous in the salon's email without it.
  const specs = offerSpecs(offer.coating, offer.treatment);
  const product = offerProductName(offer.supplier, offer.line);
  return `${offer.tier} — ${product}${specs ? ` · ${specs}` : ""}, ${price}`;
}

/**
 * The three result tiers, after the customer's reference wizard
 * (masterglasses.ru): a named, colour-coded tier per card is what stops the
 * three offers reading as one block of grey text.
 *
 * The accents are equal-lightness OKLCH (L 0.52) so they read as one deliberate
 * ladder rather than three unrelated colours, and all clear 4.5:1 on
 * `--background`. They are deliberately not `--brand`: brand red stays reserved
 * for «this is your selection».
 */
const TIERS: {
  key: keyof LensRecommendResponse["cards"];
  title: string;
  note: string;
  accent: string;
}[] = [
  {
    key: "best_price",
    title: "Базовый вариант",
    note: "Минимальная цена среди совместимых позиций",
    accent: "oklch(0.52 0.12 255)",
  },
  {
    key: "optimal",
    title: "Улучшенный вариант",
    note: "Средняя по цене совместимая позиция",
    accent: "oklch(0.52 0.13 150)",
  },
  {
    key: "premium",
    title: "Премиум вариант",
    note: "Верхние линейки и индивидуальные дизайны",
    accent: "oklch(0.52 0.12 70)",
  },
];

/** How many rows one «Показать ещё» adds. The endpoint caps a page at 100. */
const LIST_PAGE_SIZE = 40;

/**
 * A result-step message that is not a list of offers.
 *
 * Every one of these used to be a grey box of prose ending in "отправьте
 * заявку ниже", which reads as a dead end however true it is. Each now names
 * what is actually missing and carries the steps that would change it, so the
 * customer has somewhere to go besides the form.
 */
function ResultNotice({
  title,
  children,
  actions,
}: {
  title: string;
  children: React.ReactNode;
  actions?: { label: string; onClick: () => void }[];
}) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-surface/60 p-4">
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <div className="mt-1 space-y-2 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
      {!!actions?.length && (
        <div className="mt-3 flex flex-wrap gap-2 sm:ml-7">
          {actions.map(({ label, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              style={{
                transitionDuration: "var(--duration-snap)",
                transitionTimingFunction: "var(--ease-editorial)",
              }}
              className={cn(
                "inline-flex min-h-10 items-center rounded-full border border-border bg-background",
                "px-4 text-xs font-medium transition-[border-color,background-color]",
                "hover:border-foreground/30 hover:bg-surface",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * The design read out of the product name, for the full list's rows.
 *
 * 'unknown' renders as nothing: about a quarter of the catalogue is a bare
 * material name ("PNX", "EYAS", "Orma") whose design the price lists simply do
 * not carry, and a row must not claim one we cannot read.
 */
const DESIGN_LABELS: Record<LensRecommendCard["design"], string> = {
  single: "однофокальные",
  progressive: "прогрессивные",
  office: "офисные",
  bifocal: "бифокальные",
  unknown: "",
};

/**
 * `availability` is salon|warehouse|order (see _lens.php). The reference shows
 * a manufacturing time here («Изготовление 3 дня»); we have no day counts in
 * the price lists, so state the stock position instead of inventing numbers.
 */
function availabilityBadge(availability: string): { label: string; good: boolean } {
  switch (availability) {
    case "salon":
      return { label: "Есть в салоне", good: true };
    case "warehouse":
      return { label: "На складе поставщика", good: true };
    default:
      return { label: "Под заказ — рецептурная", good: false };
  }
}

function LensPriceCards({
  chosen,
  onChoose,
  onEditStep,
  rxMode,
  design,
  od,
  os,
  lensType,
  photochromicTech,
  sunVariant,
  thickness,
  brand,
}: {
  chosen: ChosenOffer | null;
  onChoose: (offer: ChosenOffer | null) => void;
  onEditStep: (step: StepId) => void;
  rxMode: RxMode;
  design: DesignOption | null;
  od: Eye;
  os: Eye;
  lensType: LensTypeOption | null;
  photochromicTech: PhotochromicTechOption | null;
  sunVariant: SunVariantOption | null;
  thickness: ThicknessOption | null;
  brand: BrandOption | null;
}) {
  const [state, setState] = useState<
    | { kind: "idle" | "loading" | "error" }
    | { kind: "loaded"; data: LensRecommendResponse }
  >({ kind: "idle" });

  // «Посмотреть все варианты»: the rows accumulate page by page, so scrolling
  // back up after «Показать ещё» does not lose what was already fetched.
  const [list, setList] = useState<{
    open: boolean;
    rows: LensRecommendCard[];
    total: number;
    sort: LensListSort;
    loading: boolean;
    error: boolean;
  }>({ open: false, rows: [], total: 0, sort: "price_asc", loading: false, error: false });

  const index = thicknessToIndex(thickness);
  // «Рецепта нет» is not a reason to show nothing. That branch still collects
  // «Линзы», «Толщина», «Дизайн», «Бренд» and the tint — five real filters that
  // price perfectly well. What a prescription adds is the manufacturable-range
  // check, so its absence costs a caveat, not the whole result.
  const hasRx =
    rxMode === "has" && od.sph !== "" && od.cyl !== "" && os.sph !== "" && os.cyl !== "";
  // The index is the one thing the endpoint cannot do without: with no
  // prescription to compute it from, it is all there is to filter on.
  const canQuery = index !== null;

  // The wizard state is frozen on the results step, so the query is captured
  // once. Every later page then pages through exactly the criteria the three
  // cards were priced with, which re-reading the props could not guarantee.
  const queryRef = useRef<LensRecommendQuery | null>(null);
  if (queryRef.current === null) {
    queryRef.current = {
      ...(hasRx
        ? { odSph: od.sph, odCyl: od.cyl, osSph: os.sph, osCyl: os.cyl }
        : {}),
      index: index ?? undefined,
      lensType: lensType?.id,
      tint: tintKeyword(lensType, photochromicTech, sunVariant),
      brand: brand && brand.id !== "all" ? brand.id : undefined,
      design: design?.id,
    };
  }

  // One controller for the paging requests: a sort flipped twice quickly would
  // otherwise land out of order and show rows from the abandoned order.
  const pageFetch = useRef<AbortController | null>(null);
  useEffect(() => () => pageFetch.current?.abort(), []);

  const loadPage = (offset: number, sort: LensListSort, replace: boolean) => {
    if (!queryRef.current) return;
    pageFetch.current?.abort();
    const controller = new AbortController();
    pageFetch.current = controller;
    setList((prev) => ({ ...prev, loading: true, error: false }));
    fetchLensRecommendation(
      { ...queryRef.current, list: true, offset, limit: LIST_PAGE_SIZE, sort },
      controller.signal,
    )
      .then((data) =>
        setList((prev) => ({
          ...prev,
          loading: false,
          sort,
          total: data.listTotal ?? prev.total,
          rows: replace ? (data.matches ?? []) : [...prev.rows, ...(data.matches ?? [])],
        })),
      )
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("[lens-recommend:list]", error);
        setList((prev) => ({ ...prev, loading: false, error: true }));
      });
  };

  // Named, not inlined in the effect, so the error state can offer a retry.
  // A network blip used to end the wizard in a paragraph.
  const cardsFetch = useRef<AbortController | null>(null);
  const loadCards = () => {
    if (!queryRef.current) return;
    cardsFetch.current?.abort();
    const controller = new AbortController();
    cardsFetch.current = controller;
    setState({ kind: "loading" });
    // The first page comes back with the cards. It costs about 12 kB, and it
    // is what lets the button carry the real count and open without a wait.
    fetchLensRecommendation(
      { ...queryRef.current, list: true, limit: LIST_PAGE_SIZE, sort: "price_asc" },
      controller.signal,
    )
      .then((data) => {
        setState({ kind: "loaded", data });
        setList((prev) => ({
          ...prev,
          rows: data.matches ?? [],
          total: data.listTotal ?? 0,
        }));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("[lens-recommend]", error);
        setState({ kind: "error" });
      });
  };

  useEffect(() => {
    if (canQuery) loadCards();
    return () => cardsFetch.current?.abort();
    // The wizard state is frozen while the results step is shown, so fetching
    // once per mount with the values captured here is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The only genuine dead end left: минеральные линзы are not in the imported
  // price lists at all, so there is no number to show. Say that, and offer the
  // step that would change it instead of only pointing at the form.
  if (index === null) {
    return (
      <ResultNotice
        title="Минеральные линзы мы считаем вручную"
        actions={[{ label: "Выбрать другую толщину", onClick: () => onEditStep(4) }]}
      >
        <p>
          Минеральных (стеклянных) линз нет в онлайн-прайсе, поэтому цену здесь показать не
          получится — её называет специалист.
        </p>
        <p>
          Отправьте заявку ниже: мы посчитаем стоимость и свяжемся с вами. Либо вернитесь к шагу
          «Толщина» — для пластиковых линз цены видны сразу.
        </p>
      </ResultNotice>
    );
  }

  if (state.kind === "loading" || state.kind === "idle") {
    return (
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {TIERS.map(({ key, title, accent }) => (
          <article key={key} className="animate-pulse rounded-xl border border-border p-5">
            <h3 className="font-serif text-xl" style={{ color: accent }}>
              {title}
            </h3>
            <div className="mt-3 h-4 w-3/4 rounded bg-surface" />
            <div className="mt-2 h-4 w-1/2 rounded bg-surface" />
            <div className="mt-4 h-7 w-2/5 rounded bg-surface" />
          </article>
        ))}
      </div>
    );
  }

  if (state.kind !== "loaded") {
    return (
      <ResultNotice
        title="Цены не загрузились"
        actions={[{ label: "Попробовать снова", onClick: loadCards }]}
      >
        <p>
          Не дозвонились до прайса — обычно это связь, а не ваш подбор. Попробуйте ещё раз.
        </p>
        <p>
          Если не получится, отправьте заявку ниже: все выбранные параметры уже собраны, специалист
          рассчитает стоимость и свяжется с вами.
        </p>
      </ResultNotice>
    );
  }

  const { data } = state;
  const shown = TIERS.map(({ key, title, note, accent }) => ({
    key,
    title,
    note,
    accent,
    card: data.cards[key],
  })).filter((entry): entry is typeof entry & { card: LensRecommendCard } => !!entry.card);

  if (shown.length === 0) {
    return (
      <ResultNotice
        title="Под эти параметры готовых позиций в прайсе нет"
        actions={[
          { label: "Изменить бренд", onClick: () => onEditStep(6) },
          { label: "Изменить дизайн", onClick: () => onEditStep(5) },
          { label: "Изменить толщину", onClick: () => onEditStep(4) },
          { label: "Изменить тип линз", onClick: () => onEditStep(3) },
        ]}
      >
        <p>
          Чаще всего дело в сочетании: например, выбранный бренд не выпускает такой дизайн в этой
          толщине. Измените один шаг — обычно этого хватает.
        </p>
        <p>
          Или отправьте заявку ниже: специалист подберёт вариант вручную, в том числе из позиций,
          которых нет в онлайн-прайсе.
        </p>
      </ResultNotice>
    );
  }

  return (
    <div className="mt-8">
      {/* These were three identical grey boxes with no hover, no cursor and no
          selected state, so they read as one block of text rather than as three
          offers the customer can choose between. */}
      <h2 className="font-serif text-xl">Подходящие варианты линз</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Выберите вариант — он попадёт в заявку. Цены ориентировочные, указаны за пару.
      </p>

      {/* Named once, here, rather than as an amber badge on all forty rows: with
          no prescription EVERY position is unverified, so a per-row badge would
          carry no information and would drown the one it does carry — the stock
          position. Deliberately not `border-brand`: brand red is the customer's
          own selection, never informational prose. */}
      {data.prescription === null && (
        <div className="mt-4 rounded-xl border border-border bg-surface/60 p-4">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 text-sm leading-relaxed">
              <p className="font-medium">Расчёт без рецепта</p>
              <p className="mt-1 text-muted-foreground">
                Цены посчитаны по параметрам, которые вы выбрали выше. Не хватает только диоптрий:
                без них нельзя проверить, выпускается ли конкретная линза в вашей силе — это
                подтвердит специалист.
              </p>
              <p className="mt-2 text-muted-foreground">
                Если рецепт есть, добавьте его в заявку ниже — расчёт станет точным. Если нет,
                специалист предложит проверку зрения.
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        role="group"
        aria-label={`Варианты линз: ${shown.length} ${pluralOptions(shown.length)}`}
        // Seven named rows — header, «Линза», specs, price, badges, note, CTA —
        // that each card spans as a subgrid, so every one of those bands lines
        // up across all three cards no matter how long its product name runs.
        // The note row is 1fr, so the slack collects there and the CTAs sit on
        // one line. Mobile keeps the plain flex column: nothing to align when
        // the cards are stacked.
        className="mt-4 grid gap-4 md:grid-cols-3 md:grid-rows-[auto_auto_auto_auto_auto_1fr_auto]"
      >
        {shown.map(({ key, title, note, accent, card }) => {
          // Both identifiers, so picking this lens down in the full list lights
          // its tier card up too — they are the same offer, shown twice.
          const keys = [`tier:${key}`, `offer:${card.id}`];
          const selected = offerIsChosen(chosen, keys);
          const stock = availabilityBadge(card.availability);
          const product = offerProductName(card.supplier, card.line);
          return (
            <article
              key={key}
              style={{
                transitionDuration: "var(--duration-snap)",
                transitionTimingFunction: "var(--ease-editorial)",
              }}
              className={cn(
                "flex scroll-mb-32 flex-col rounded-xl border bg-background p-5",
                "md:row-span-7 md:grid md:grid-rows-subgrid md:gap-0",
                "transition-[border-color,background-color,box-shadow]",
                // Same hover as OptionCard on every earlier step. Without it the
                // last step is the only one whose cards are inert under the
                // cursor — and it is the step where there is actually a choice
                // to make. Not while selected: brand red already owns that card.
                selected
                  ? "border-brand bg-brand/5 shadow-sm"
                  : "border-border hover:border-foreground/30",
              )}
            >
              {/* 1 — header. Optional blocks below are rendered even when empty
                  so every card contributes the same seven rows to the subgrid. */}
              <div className="flex items-start justify-between gap-4">
                {/* The tier name, colour-coded — the reference's main device for
                    keeping three offers visually apart. */}
                <h3 className="font-serif text-xl leading-tight" style={{ color: accent }}>
                  {title}
                </h3>
                {/* Stands in for the reference's rendered product image. */}
                <div
                  aria-hidden
                  className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-lg text-white"
                  style={{ backgroundColor: accent }}
                >
                  <div className="text-center leading-none">
                    <div className="font-serif text-xl">{card.index ?? "—"}</div>
                    <div className="mt-1 text-[9px] uppercase tracking-wider opacity-80">индекс</div>
                  </div>
                </div>
              </div>

              {/* 2 — the product */}
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Линза
                </div>
                <div className="mt-1 text-sm font-medium leading-snug">{product}</div>
              </div>

              {/* 3 — coating and treatment */}
              <div className="mt-1 text-xs text-muted-foreground">
                {[card.coating, card.treatment.replace(/\s+/g, " ")].filter(Boolean).join(" · ")}
              </div>

              {/* 4 — price */}
              <div className="mt-4">
                {card.retailPriceRub !== null ? (
                  <>
                    {/* The reference leads with the price of the PAIR — which is
                        what the customer actually pays. Per-lens stays, smaller. */}
                    <div className="font-serif text-[28px] leading-none">
                      {formatPrice(card.retailPriceRub * 2)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      за пару линз · {formatPrice(card.retailPriceRub)} за одну
                    </div>
                  </>
                ) : (
                  <div className="text-sm font-medium text-brand">Цена по запросу</div>
                )}
              </div>

              {/* 5 — stock and fit */}
              <div className="mt-3 flex flex-wrap content-start gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    stock.good
                      ? "bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[oklch(0.45_0.13_150)]"
                      : "bg-amber-50 text-amber-800",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      stock.good ? "bg-[var(--success)]" : "bg-amber-500",
                    )}
                  />
                  {stock.label}
                </span>
                {data.prescription !== null && card.rxFit !== "yes" && (
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
                    Совместимость проверит специалист
                  </span>
                )}
              </div>

              {/* 6 — what the tier means. 1fr row: the slack collects here. */}
              <p className="mt-3 text-xs text-muted-foreground">{note}</p>

              {/* 7 — an explicit CTA, like the reference's «добавить эти линзы» —
                  a whole-card click target left the action ambiguous. */}
              <button
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChoose(
                    selected
                      ? null
                      : {
                          keys,
                          tier: title,
                          supplier: card.supplier,
                          line: card.line,
                          coating: card.coating,
                          treatment: card.treatment,
                          priceRub: card.retailPriceRub,
                        },
                  )
                }
                style={{
                  transitionDuration: "var(--duration-snap)",
                  transitionTimingFunction: "var(--ease-editorial)",
                }}
                className={cn(
                  "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold",
                  "transition-[background-color,color,box-shadow,transform]",
                  "hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  selected
                    ? "bg-brand text-brand-foreground"
                    : "bg-foreground text-background hover:opacity-90",
                )}
              >
                {selected ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={3} /> Эти линзы выбраны
                  </>
                ) : (
                  "Выбрать эти линзы"
                )}
              </button>
            </article>
          );
        })}
      </div>
      {list.total > shown.length && (
        <LensAllOffers
          list={list}
          cards={data.cards}
          chosen={chosen}
          onChoose={onChoose}
          onToggle={() => setList((prev) => ({ ...prev, open: !prev.open }))}
          onSort={(sort) => loadPage(0, sort, true)}
          onMore={() => loadPage(list.rows.length, list.sort, false)}
        />
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Цены ориентировочные; итоговую стоимость пары подтвердит специалист.
      </p>
    </div>
  );
}

/* --------------------------- The whole match list --------------------------- */

/**
 * «Посмотреть все варианты (N)» and what it opens.
 *
 * The reference site (masterglasses.ru) puts this under its three offers, and
 * it answers the obvious question the three cards raise: the customer has been
 * shown the cheapest, the median and the dearest, and nothing in between.
 *
 * Rows are deliberately denser than the tier cards — the same information, no
 * tier name, no colour block — so that scanning a few hundred of them stays
 * possible on a phone.
 */
function LensAllOffers({
  list,
  cards,
  chosen,
  onChoose,
  onToggle,
  onSort,
  onMore,
}: {
  list: {
    open: boolean;
    rows: LensRecommendCard[];
    total: number;
    sort: LensListSort;
    loading: boolean;
    error: boolean;
  };
  cards: LensRecommendResponse["cards"];
  chosen: ChosenOffer | null;
  onChoose: (offer: ChosenOffer | null) => void;
  onToggle: () => void;
  onSort: (sort: LensListSort) => void;
  onMore: () => void;
}) {
  // A row that is also one of the three cards says so, rather than looking
  // like a fourth, unexplained repeat of the same lens.
  const tierOfOffer = new Map<string, string>();
  for (const { key, title } of TIERS) {
    const card = cards[key];
    if (card) tierOfOffer.set(card.id, title);
  }

  const remaining = list.total - list.rows.length;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={list.open}
        aria-controls="lens-all-offers"
        style={{
          transitionDuration: "var(--duration-snap)",
          transitionTimingFunction: "var(--ease-editorial)",
        }}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-3",
          "text-sm font-semibold transition-[background-color,border-color]",
          "hover:border-foreground/30 hover:bg-surface/60",
        )}
      >
        {list.open ? "Свернуть список" : `Посмотреть все варианты · ${list.total.toLocaleString("ru-RU")}`}
        {list.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {list.open && (
        <div id="lens-all-offers" className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Показано {list.rows.length.toLocaleString("ru-RU")} из{" "}
              {list.total.toLocaleString("ru-RU")}
            </p>
            <div role="group" aria-label="Сортировка" className="flex gap-1">
              {(
                [
                  { id: "price_asc" as const, label: "Сначала дешевле", Icon: ArrowUpNarrowWide },
                  { id: "price_desc" as const, label: "Сначала дороже", Icon: ArrowDownWideNarrow },
                ]
              ).map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={list.sort === id}
                  disabled={list.loading}
                  onClick={() => list.sort !== id && onSort(id)}
                  style={{
                    transitionDuration: "var(--duration-snap)",
                    transitionTimingFunction: "var(--ease-editorial)",
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                    "transition-[background-color,border-color,color] disabled:opacity-60",
                    list.sort === id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {list.rows.map((offer) => (
              <LensOfferRow
                key={offer.id}
                offer={offer}
                tier={tierOfOffer.get(offer.id)}
                chosen={chosen}
                onChoose={onChoose}
              />
            ))}
          </ul>

          {list.error && (
            <p className="mt-3 flex gap-2 rounded-xl border border-border bg-surface/60 p-3 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              Не удалось загрузить остальные варианты. Отправьте заявку ниже — специалист подберёт
              вариант вручную.
            </p>
          )}

          {remaining > 0 && (
            <button
              type="button"
              onClick={onMore}
              disabled={list.loading}
              style={{
                transitionDuration: "var(--duration-snap)",
                transitionTimingFunction: "var(--ease-editorial)",
              }}
              className={cn(
                "mt-3 inline-flex w-full items-center justify-center rounded-full border border-border",
                "px-5 py-3 text-sm font-semibold transition-[background-color,border-color]",
                "hover:border-foreground/30 hover:bg-surface/60 disabled:opacity-60",
              )}
            >
              {list.loading
                ? "Загружаем…"
                : `Показать ещё ${Math.min(remaining, LIST_PAGE_SIZE)}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * One row of the full list.
 *
 * Stacked on a phone and a single line from `sm:` up. The price leads with the
 * pair, like the tier cards, so the two sets of numbers are comparable at a
 * glance rather than differing by a factor of two.
 */
function LensOfferRow({
  offer,
  tier,
  chosen,
  onChoose,
}: {
  offer: LensRecommendCard;
  tier?: string;
  chosen: ChosenOffer | null;
  onChoose: (offer: ChosenOffer | null) => void;
}) {
  const keys = tier ? [`offer:${offer.id}`, `tier:${tierKeyOf(tier)}`] : [`offer:${offer.id}`];
  const selected = offerIsChosen(chosen, keys);
  const stock = availabilityBadge(offer.availability);
  const specs = offerSpecs(offer.coating, offer.treatment);
  const designLabel = DESIGN_LABELS[offer.design] ?? "";
  const product = offerProductName(offer.supplier, offer.line);

  return (
    <li>
      <div
        style={{
          transitionDuration: "var(--duration-snap)",
          transitionTimingFunction: "var(--ease-editorial)",
        }}
        className={cn(
          "grid gap-3 rounded-xl border p-3 transition-[border-color,background-color]",
          "sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 sm:p-4",
          // Matches the tier cards and OptionCard; over a few hundred rows it is
          // also what tells you which one the cursor is on.
          selected ? "border-brand bg-brand/5" : "border-border hover:border-foreground/30",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {/* Some Essilor lines carry the fitting height inside the product
                name ("… Установочная высота: Regular – 22 мм, …"), which runs a
                row to three lines. Clamped, with the full text on hover and in
                the accessible name of the button below. */}
            <span className="line-clamp-2 text-sm font-medium leading-snug" title={product}>
              {product}
            </span>
            {tier && (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {tier}
              </span>
            )}
          </div>
          {specs && <p className="mt-1 truncate text-xs text-muted-foreground">{specs}</p>}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            {offer.index !== null && <span>индекс {offer.index}</span>}
            {designLabel && (
              <>
                <span aria-hidden>·</span>
                <span>{designLabel}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className={cn("inline-flex items-center gap-1", !stock.good && "text-amber-700")}>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  stock.good ? "bg-[var(--success)]" : "bg-amber-500",
                )}
              />
              {stock.label}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
          <div className="sm:text-right">
            {offer.retailPriceRub !== null ? (
              <>
                <div className="font-serif text-lg leading-none">
                  {formatPrice(offer.retailPriceRub * 2)}
                </div>
                <div className="mt-1 whitespace-nowrap text-[11px] text-muted-foreground">
                  за пару · {formatPrice(offer.retailPriceRub)} за одну
                </div>
              </>
            ) : (
              <div className="text-sm font-medium text-brand">Цена по запросу</div>
            )}
          </div>
          <button
            type="button"
            aria-pressed={selected}
            aria-label={`${selected ? "Отменить выбор" : "Выбрать"}: ${product}`}
            onClick={() =>
              onChoose(
                selected
                  ? null
                  : {
                      keys,
                      // A pick made here is not one of the three tiers unless
                      // it happens to be; say which, so the salon's email
                      // reads the same either way.
                      tier: tier ?? "Выбрано из полного списка",
                      supplier: offer.supplier,
                      line: offer.line,
                      coating: offer.coating,
                      treatment: offer.treatment,
                      priceRub: offer.retailPriceRub,
                    },
              )
            }
            style={{
              transitionDuration: "var(--duration-snap)",
              transitionTimingFunction: "var(--ease-editorial)",
            }}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-4",
              "sm:min-h-0 sm:py-2",
              "text-xs font-semibold transition-[background-color,color]",
              selected
                ? "bg-brand text-brand-foreground"
                : "bg-foreground text-background hover:opacity-90",
            )}
          >
            {selected ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={3} /> Выбрано
              </>
            ) : (
              "Выбрать"
            )}
          </button>
        </div>
      </div>
    </li>
  );
}

/** The TIERS key behind a tier title, so a row and its card share an identity. */
function tierKeyOf(title: string): string {
  return TIERS.find((tier) => tier.title === title)?.key ?? "";
}
