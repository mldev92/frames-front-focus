import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, HelpCircle, Info, X } from "lucide-react";
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
  type LensRecommendCard,
  type LensRecommendResponse,
} from "@/lib/api/lens-recommend";
import { LensRequestForm } from "./LensRequestForm";

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
    if (open) scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
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
        <div className="block px-4 pb-3 md:hidden">
          <div className="text-xs uppercase tracking-wider text-brand">{STEPS[step - 1].label}</div>
        </div>
      </header>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:px-8 lg:py-10">
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
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-surface/60 p-3 lg:hidden">
              <img
                src={previewImage ?? frame.images[0]}
                alt={frame.name}
                className="h-16 w-20 shrink-0 object-contain mix-blend-multiply"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {frame.brand} {frame.name}
                </div>
                {selectedColor && (
                  <div className="mt-1 text-xs text-muted-foreground">Цвет: {selectedColor}</div>
                )}
              </div>
            </div>

            <div className="mb-6 flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p>
                Подбор предварительный. Точную модель, совместимость и стоимость линз подтвердит
                менеджер перед оформлением заказа.
              </p>
            </div>

            {step > 1 && (
              <button
                onClick={goBack}
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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

      {/* Sticky footer */}
      <footer className="sticky bottom-0 z-10 border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 lg:px-8 lg:py-4">
          <div className="min-w-0 text-sm">
            <div className="text-xs text-muted-foreground">Оправа</div>
            <strong className="font-serif text-lg sm:text-xl">{formatPrice(frame.price)}</strong>
            <div className="hidden text-xs text-muted-foreground sm:block">
              Стоимость линз — после проверки подбора
            </div>
          </div>
          {step < LAST_STEP ? (
            <button
              onClick={goNext}
              disabled={!canProceed}
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

function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-2xl lg:text-3xl">{title}</h1>
      {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function OptionCard({
  active,
  title,
  description,
  warning,
  badge,
  icon,
  rightSlot,
  onClick,
}: {
  active: boolean;
  title: string;
  description?: string;
  warning?: string;
  badge?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex w-full items-start gap-4 rounded-xl border bg-background p-5 text-left transition-all",
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
        {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
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
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
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
      className="flex items-center gap-4 rounded-xl border border-border bg-background p-5 transition-colors hover:border-foreground/30"
    >
      <div className="flex-1">
        <h3 className="font-serif text-lg">{CONSULTATION.title}</h3>
        <p className="mt-1 text-sm text-brand">{CONSULTATION.subtitle}</p>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
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
      <StepHeader title="Для чего вы используете очки?" />
      <div className="space-y-3">
        {PURPOSES.map((p) => {
          const Icon = p.icon;
          return (
            <OptionCard
              key={p.id}
              active={value?.id === p.id}
              title={p.title}
              description={p.subtitle}
              icon={<Icon className="h-7 w-7" />}
              onClick={() => onChange(p)}
            />
          );
        })}
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
          <ConsultationCard />
        </div>
      </div>
    );
  }

  if (mode === "none") {
    return (
      <div>
        <StepHeader
          title="Подбор без рецепта"
          subtitle="Вы сможете пройти остальные шаги, но результат останется предварительным."
        />
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-5 text-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <div className="font-medium">Точную совместимость и итоговую цену определить нельзя</div>
            <p className="mt-1 text-muted-foreground">
              Для оформления заказа потребуется загрузить рецепт или передать его специалисту.
            </p>
          </div>
        </div>
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

      <div className="mt-6 space-y-4">
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
        subtitle="Прозрачные, фотохромные или солнцезащитные. Доступность проверяется по конкретной позиции прайса."
      />
      <div className="space-y-3">
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
          <div className="mt-4 space-y-3">
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
          <div className="mt-4 space-y-3">
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
  return (
    <div>
      <StepHeader
        title="Толщина и материал линз"
        subtitle="Чем выше индекс, тем тоньше и легче линза при том же рецепте."
      />
      {recommendation && recommendedThickness && (
        <div className="mb-5 flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <p>
            По вашему рецепту (сфероэквивалент до{" "}
            {recommendation.governingAbsSphericalEquivalent.toFixed(2).replace(".", ",")}) мы
            рекомендуем индекс {recommendation.index}. Вы можете выбрать другой вариант — специалист
            проверит совместимость.
          </p>
        </div>
      )}
      <div className="space-y-3">
        {THICKNESSES.map((option) => (
          <OptionCard
            key={option.id}
            active={value?.id === option.id}
            title={option.title}
            description={option.description}
            badge={
              recommendedThickness?.id === option.id ? "Рекомендуем по вашему рецепту" : undefined
            }
            onClick={() => onChange(option)}
          />
        ))}
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
        subtitle="Дизайн определяет, как распределены зоны чёткого зрения по поверхности линзы."
      />
      <div className="space-y-3">
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
        subtitle="Бренд применяется после проверки назначения, рецепта и выбранных условий."
      />
      <div className="space-y-3">
        {BRANDS.map((o) => (
          <OptionCard
            key={o.id}
            active={value?.id === o.id}
            title={o.title}
            description={o.description}
            onClick={() => onChange(o)}
          />
        ))}
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepResults({
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
  ];

  return (
    <div>
      <StepHeader
        title="Предварительный подбор сформирован"
        subtitle="Точные модели и ориентировочные цены появятся после подключения актуальных прайсов."
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
        rxMode={rxMode}
        od={od}
        os={os}
        lensType={lensType}
        photochromicTech={photochromicTech}
        sunVariant={sunVariant}
        thickness={thickness}
        brand={brand}
      />

      <div className="mt-6 flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          Рекомендуемый индекс рассчитывается по глазу с большей нагрузкой и применяется к обеим
          линзам. Итоговую модель и стоимость подтвердит специалист перед заказом.
        </p>
      </div>

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

const CARD_LABELS: { key: keyof LensRecommendResponse["cards"]; title: string; note: string }[] = [
  { key: "best_price", title: "Лучший по цене", note: "Минимальная цена среди совместимых позиций" },
  { key: "optimal", title: "Оптимальный выбор", note: "Средняя по цене совместимая позиция" },
  { key: "premium", title: "Премиум", note: "Верхние линейки и индивидуальные дизайны" },
];

function LensPriceCards({
  rxMode,
  od,
  os,
  lensType,
  photochromicTech,
  sunVariant,
  thickness,
  brand,
}: {
  rxMode: RxMode;
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

  const index = thicknessToIndex(thickness);
  const canQuery = rxMode === "has" && od.sph !== "" && od.cyl !== "" && os.sph !== "" && os.cyl !== "";

  useEffect(() => {
    if (!canQuery) return;
    const controller = new AbortController();
    setState({ kind: "loading" });
    fetchLensRecommendation(
      {
        odSph: od.sph,
        odCyl: od.cyl,
        osSph: os.sph,
        osCyl: os.cyl,
        index: index ?? undefined,
        lensType: lensType?.id,
        tint: tintKeyword(lensType, photochromicTech, sunVariant),
        brand: brand && brand.id !== "all" ? brand.id : undefined,
      },
      controller.signal,
    )
      .then((data) => setState({ kind: "loaded", data }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        console.error("[lens-recommend]", error);
        setState({ kind: "error" });
      });
    return () => controller.abort();
    // The wizard state is frozen while the results step is shown, so fetching
    // once per mount with the values captured here is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!canQuery) {
    return (
      <div className="mt-6 flex gap-3 rounded-xl border border-border bg-surface/60 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          Ориентировочные цены рассчитываются по рецепту. Без рецепта специалист подберёт модели и
          назовёт стоимость после консультации — отправьте заявку ниже.
        </p>
      </div>
    );
  }

  if (index === null) {
    return (
      <div className="mt-6 flex gap-3 rounded-xl border border-border bg-surface/60 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          Минеральные линзы рассчитываются специалистом по конкретному рецепту — отправьте заявку
          ниже, и мы назовём точную стоимость.
        </p>
      </div>
    );
  }

  if (state.kind === "loading" || state.kind === "idle") {
    return (
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {CARD_LABELS.map(({ key, title }) => (
          <article key={key} className="animate-pulse rounded-xl border border-border p-5">
            <h3 className="font-serif text-lg">{title}</h3>
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
      <div className="mt-6 flex gap-3 rounded-xl border border-border bg-surface/60 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          Не удалось получить ориентировочные цены. Отправьте заявку ниже — специалист рассчитает
          стоимость и свяжется с вами.
        </p>
      </div>
    );
  }

  const { data } = state;
  const shown = CARD_LABELS.map(({ key, title, note }) => ({
    key,
    title,
    note,
    card: data.cards[key],
  })).filter((entry): entry is typeof entry & { card: LensRecommendCard } => !!entry.card);

  if (shown.length === 0) {
    return (
      <div className="mt-6 flex gap-3 rounded-xl border border-border bg-surface/60 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          Под выбранные условия не нашлось готовых позиций прайса. Отправьте заявку ниже —
          специалист подберёт вариант вручную.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid gap-3 md:grid-cols-3">
        {shown.map(({ key, title, note, card }) => (
          <article key={key} className="flex flex-col rounded-xl border border-border p-5">
            <h3 className="font-serif text-lg">{title}</h3>
            <div className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {card.supplier}
            </div>
            <div className="mt-1 text-sm font-medium">{card.line}</div>
            {(card.coating || card.treatment) && (
              <div className="mt-1 text-xs text-muted-foreground">
                {[card.coating, card.treatment.replace(/\s+/g, " ")].filter(Boolean).join(" · ")}
              </div>
            )}
            <div className="mt-auto pt-4">
              {card.retailPriceRub !== null ? (
                <>
                  <div className="font-serif text-2xl">
                    {formatPrice(card.retailPriceRub)}
                  </div>
                  <div className="text-xs text-muted-foreground">за одну линзу</div>
                </>
              ) : (
                <div className="text-sm font-medium text-brand">Цена по запросу</div>
              )}
              {card.rxFit !== "yes" && (
                <div className="mt-2 text-xs text-amber-700">
                  Совместимость с рецептом проверит специалист
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{note}</p>
          </article>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Подобрано позиций: {data.matchCount.toLocaleString("ru-RU")}. Цены ориентировочные, за одну
        линзу; итоговую стоимость пары подтвердит специалист.
      </p>
    </div>
  );
}
