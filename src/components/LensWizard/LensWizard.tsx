import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, HelpCircle, Info, X } from "lucide-react";
import type { Product } from "@/data/types";
import { formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import {
  BRANDS,
  COATING_PACKAGES,
  CONSULTATION,
  LENS_FINISHES,
  PHOTOCHROMIC_COLORS,
  PRIORITIES,
  PURPOSES,
  type BrandOption,
  type CoatingPackageOption,
  type LensFinishOption,
  type PhotochromicColorId,
  type PriorityOption,
  type PurposeOption,
} from "./data";
import { getRecommendedLensIndex } from "./logic";
import { LensRequestForm } from "./LensRequestForm";

type Eye = { sph: string; cyl: string; axi: string; add: string };
const emptyEye: Eye = { sph: "", cyl: "", axi: "", add: "" };

type StepId = 1 | 2 | 3 | 4 | 5 | 6;
const STEPS: { id: StepId; label: string; sub?: string }[] = [
  { id: 1, label: "Назначение" },
  { id: 2, label: "Рецепт" },
  { id: 3, label: "Что важнее" },
  { id: 4, label: "Затемнение и защита" },
  { id: 5, label: "Бренд" },
  { id: 6, label: "Результаты" },
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
  const [priorities, setPriorities] = useState<PriorityOption[]>([]);
  const [lensFinish, setLensFinish] = useState<LensFinishOption | null>(null);
  const [photochromicColor, setPhotochromicColor] = useState<PhotochromicColorId | null>(null);
  const [coatingPackage, setCoatingPackage] = useState<CoatingPackageOption | null>(null);
  const [brand, setBrand] = useState<BrandOption | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const goNext = () => setStep((s) => (s < 6 ? ((s + 1) as StepId) : s));
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
    setPriorities([]);
    setLensFinish(null);
    setPhotochromicColor(null);
    setCoatingPackage(null);
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
        return priorities.length > 0;
      case 4:
        return (
          !!lensFinish &&
          !!coatingPackage &&
          (lensFinish.id !== "photochromic" || !!photochromicColor)
        );
      case 5:
        return !!brand;
      case 6:
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
            <span className="text-xs text-muted-foreground">Шаг {step}/6</span>
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
                  setPriorities([]);
                  setLensFinish(null);
                  setPhotochromicColor(null);
                  setCoatingPackage(null);
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
              <StepPriorities
                value={priorities}
                onChange={(option) =>
                  setPriorities((current) =>
                    current.some((item) => item.id === option.id)
                      ? current.filter((item) => item.id !== option.id)
                      : [...current, option],
                  )
                }
              />
            )}
            {step === 4 && (
              <StepProtection
                finish={lensFinish}
                setFinish={(option) => {
                  setLensFinish(option);
                  if (option.id !== "photochromic") setPhotochromicColor(null);
                }}
                photochromicColor={photochromicColor}
                setPhotochromicColor={setPhotochromicColor}
                coatingPackage={coatingPackage}
                setCoatingPackage={setCoatingPackage}
              />
            )}
            {step === 5 && <StepBrand value={brand} onChange={setBrand} />}
            {step === 6 && (
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
                priorities={priorities}
                lensFinish={lensFinish}
                photochromicColor={photochromicColor}
                coatingPackage={coatingPackage}
                brand={brand}
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
          {step < 6 ? (
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
  count,
  fromPrice,
  warning,
  badge,
  icon,
  rightSlot,
  onClick,
}: {
  active: boolean;
  title: string;
  description?: string;
  count?: number;
  fromPrice?: number;
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
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-lg">{title}</h3>
          {badge && (
            <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">
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
      {(count !== undefined || fromPrice !== undefined) && (
        <div className="hidden shrink-0 flex-col items-end gap-1.5 text-right sm:flex">
          {count !== undefined && (
            <span className="rounded-md bg-surface px-2.5 py-1 text-xs text-muted-foreground">
              {count.toLocaleString("ru-RU")} линз
            </span>
          )}
          {fromPrice !== undefined && fromPrice > 0 && (
            <span className="rounded-md bg-surface px-2.5 py-1 text-xs text-muted-foreground">
              от {fromPrice.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
      )}
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
        {purpose?.id === "myopia-control" && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            Для ZEISS MyoCare/MyoCare S потребуются именно монокулярные PD и дополнительные
            параметры посадки оправы.
          </p>
        )}
      </div>

      <div className="mt-8">
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepPriorities({
  value,
  onChange,
}: {
  value: PriorityOption[];
  onChange: (v: PriorityOption) => void;
}) {
  return (
    <div>
      <StepHeader
        title="Что для вас важнее?"
        subtitle="Можно выбрать несколько приоритетов. Они будут использоваться для сортировки совместимых линз."
      />
      <div className="space-y-3">
        {PRIORITIES.map((option) => {
          const active = value.some((item) => item.id === option.id);
          const Icon = option.icon;
          return (
            <OptionCard
              key={option.id}
              active={active}
              title={option.title}
              description={option.description}
              icon={<Icon className="h-7 w-7" />}
              rightSlot={
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border",
                    active ? "border-brand bg-brand text-brand-foreground" : "border-border",
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
              }
              onClick={() => onChange(option)}
            />
          );
        })}
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepProtection({
  finish,
  setFinish,
  photochromicColor,
  setPhotochromicColor,
  coatingPackage,
  setCoatingPackage,
}: {
  finish: LensFinishOption | null;
  setFinish: (v: LensFinishOption) => void;
  photochromicColor: PhotochromicColorId | null;
  setPhotochromicColor: (v: PhotochromicColorId) => void;
  coatingPackage: CoatingPackageOption | null;
  setCoatingPackage: (v: CoatingPackageOption) => void;
}) {
  return (
    <div>
      <StepHeader
        title="Затемнение и защита"
        subtitle="Покажем только сочетания, доступные для конкретной линзы и бренда."
      />

      <h2 className="mb-3 font-serif text-xl">Тип линзы</h2>
      <div className="space-y-3">
        {LENS_FINISHES.map((option) => (
          <OptionCard
            key={option.id}
            active={finish?.id === option.id}
            title={option.title}
            description={option.description}
            onClick={() => setFinish(option)}
          />
        ))}
      </div>

      {finish?.id === "photochromic" && (
        <section className="mt-7 rounded-xl border border-border p-5">
          <h2 className="font-serif text-xl">Цвет фотохрома</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Доступность цвета будет проверяться по конкретной позиции прайса.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
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

      <h2 className="mb-3 mt-8 font-serif text-xl">Пакет покрытия</h2>
      <div className="space-y-3">
        {COATING_PACKAGES.map((option) => (
          <OptionCard
            key={option.id}
            active={coatingPackage?.id === option.id}
            title={option.title}
            description={option.description}
            onClick={() => setCoatingPackage(option)}
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
  priorities,
  lensFinish,
  photochromicColor,
  coatingPackage,
  brand,
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
  priorities: PriorityOption[];
  lensFinish: LensFinishOption | null;
  photochromicColor: PhotochromicColorId | null;
  coatingPackage: CoatingPackageOption | null;
  brand: BrandOption | null;
}) {
  const colorTitle = PHOTOCHROMIC_COLORS.find((color) => color.id === photochromicColor)?.title;
  const indexRecommendation =
    rxMode === "has" ? getRecommendedLensIndex(od, os) : null;
  const formatSphericalEquivalent = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
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
      priorities: priorities.map((item) => item.title),
      finish: lensFinish?.title ?? "",
      photochromicColor: colorTitle,
      coating: coatingPackage?.title ?? "",
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
    [
      "Индекс для обеих линз",
      indexRecommendation
        ? `${indexRecommendation.index} — по глазу с большей нагрузкой`
        : null,
    ],
    ["Приоритеты", priorities.map((item) => item.title).join(", ")],
    ["Тип линзы", lensFinish?.title],
    ["Цвет фотохрома", colorTitle],
    ["Покрытие", coatingPackage?.title],
    ["Бренд", brand?.title],
  ];

  return (
    <div>
      <StepHeader
        title="Предварительный подбор сформирован"
        subtitle="Рекомендуемый индекс рассчитан по рецепту. Точные модели и ориентировочные цены появятся после подключения актуальных прайсов."
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

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          ["Лучший по цене", "Минимальная цена среди совместимых позиций"],
          ["Оптимальный выбор", "Баланс ваших приоритетов, цены и покрытия"],
          ["Премиум", "Верхние линейки и индивидуальные дизайны"],
        ].map(([title, description]) => (
          <article key={title} className="rounded-xl border border-dashed border-border p-5">
            <h3 className="font-serif text-lg">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-4 text-xs font-medium uppercase tracking-wider text-brand">
              Требуется актуальный прайс
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p>
          Индекс для пары рассчитывается по большему значению OD/OS и применяется к обеим линзам.
          Будущая цена будет ориентировочной: она зависит от актуального курса ЦБ + 2% и настроенной
          наценки. Специалист подтвердит итоговую стоимость перед заказом.
        </p>
      </div>

      <LensRequestForm draft={requestDraft} />
    </div>
  );
}
