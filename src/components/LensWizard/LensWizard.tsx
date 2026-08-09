import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, HelpCircle, Info, X } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/types";
import { useCart, formatPrice } from "@/lib/store/cart";
import { useCityStore } from "@/lib/store/city";
import { cn } from "@/lib/utils";
import {
  BRANDS,
  CONSULTATION,
  DESIGNS,
  INDEX_OPTIONS,
  LENS_TYPES,
  PURPOSES,
  type BrandOption,
  type DesignOption,
  type IndexOption,
  type LensTypeOption,
  type PurposeId,
  type PurposeOption,
} from "./data";

type Eye = { sph: string; cyl: string; axi: string; add: string };
const emptyEye: Eye = { sph: "", cyl: "", axi: "", add: "" };

type StepId = 1 | 2 | 3 | 4 | 5 | 6;
const STEPS: { id: StepId; label: string; sub?: string }[] = [
  { id: 1, label: "Назначение" },
  { id: 2, label: "Рецепт" },
  { id: 3, label: "Линзы" },
  { id: 4, label: "Материал и индекс" },
  { id: 5, label: "Дизайн и покрытие" },
  { id: 6, label: "Бренд" },
];

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
  const [skipRx, setSkipRx] = useState(false);
  const [lensType, setLensType] = useState<LensTypeOption | null>(null);
  const [indexOpt, setIndexOpt] = useState<IndexOption | null>(null);
  const [design, setDesign] = useState<DesignOption | null>(null);
  const [brand, setBrand] = useState<BrandOption | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { add } = useCart();
  const city = useCityStore((s) => s.city);

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

  const goNext = () => {
    if (step === 2 && od.sph && os.sph) setSkipRx(false);
    setStep((s) => (s < 6 ? ((s + 1) as StepId) : s));
  };
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepId) : s));

  const resetWizard = () => {
    setStep(1);
    setPurpose(null);
    setOd(emptyEye);
    setOs(emptyEye);
    setPd("");
    setPdNear("");
    setTwoPd(false);
    setSkipRx(false);
    setLensType(null);
    setIndexOpt(null);
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
      case 2:
        if (skipRx || (purpose && !purpose.needsRx)) return true;
        return od.sph !== "" && os.sph !== "";
      case 3:
        return !!lensType;
      case 4:
        return !!indexOpt;
      case 5:
        return !!design;
      case 6:
        return !!brand;
      default:
        return false;
    }
  })();

  const handleFinish = () => {
    if (!purpose || !lensType || !indexOpt || !design || !brand) return;
    const summary = `${purpose.title} · ${lensType.title} · ${indexOpt.title} · ${design.title} · ${brand.title}`;
    add(frame, {
      color: selectedColor,
      image: previewImage,
      purpose: summary,
      city,
      prescription:
        skipRx || !purpose.needsRx
          ? undefined
          : {
              right: { sphere: od.sph, cylinder: od.cyl, axis: od.axi, addition: od.add },
              left: { sphere: os.sph, cylinder: os.cyl, axis: os.axi, addition: os.add },
            },
    });
    toast.success(`Оправа и параметры линз добавлены в корзину`);
    closeWizard();
  };

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
                В подборе представлены Essilor, Zeiss с линейками Synchrony и Hoya с линейками
                MAXXEE. Другие варианты поможет подобрать консультант.
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
                  setLensType(null);
                  setIndexOpt(null);
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
                onSkip={() => {
                  setSkipRx(true);
                  goNext();
                }}
              />
            )}
            {step === 3 && purpose && (
              <StepLensType purposeId={purpose.id} value={lensType} onChange={setLensType} />
            )}
            {step === 4 && <StepIndex value={indexOpt} onChange={setIndexOpt} />}
            {step === 5 && <StepDesign value={design} onChange={setDesign} />}
            {step === 6 && (
              <>
                <StepBrand value={brand} onChange={setBrand} />
                <SelectionReview
                  purpose={purpose}
                  lensType={lensType}
                  indexOpt={indexOpt}
                  design={design}
                  brand={brand}
                  hasRx={!skipRx && !!purpose?.needsRx}
                />
              </>
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
            <button
              onClick={handleFinish}
              disabled={!canProceed}
              className="shrink-0 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-40 sm:px-8"
            >
              Добавить комплект
            </button>
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
  onSkip,
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
  onSkip: () => void;
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

  const hasCyl = (eye: Eye) => eye.cyl !== "" && eye.cyl !== "+0.00" && eye.cyl !== "-0.00";
  const showAdd = !!purpose?.requiresAdd;

  if (purpose && !purpose.needsRx) {
    return (
      <div>
        <StepHeader
          title="Рецепт не требуется"
          subtitle="Для имиджевых линз без диоптрий можно сразу перейти к следующему шагу."
        />
        <div className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-5 text-sm">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <div className="font-medium">Будут использованы линзы без коррекции зрения</div>
            <p className="mt-1 text-muted-foreground">SPH 0.00, CYL 0.00</p>
          </div>
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
                  Цилиндр (CYL)
                  <div className="mt-1">
                    <RxSelect
                      ariaLabel={`${label}: цилиндр`}
                      value={eye.cyl}
                      onChange={(v) => set({ ...eye, cyl: v, axi: v ? eye.axi : "" })}
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
                    Аддидация (ADD)
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
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          >
            Продолжить без рецепта
          </button>
        </div>
      </div>

      <div className="mt-8">
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepLensType({
  purposeId,
  value,
  onChange,
}: {
  purposeId: PurposeId;
  value: LensTypeOption | null;
  onChange: (v: LensTypeOption) => void;
}) {
  const options = LENS_TYPES[purposeId] ?? [];
  return (
    <div>
      <StepHeader title="Выберите тип линз" />
      <div className="space-y-3">
        {options.map((o) => (
          <OptionCard
            key={o.id}
            active={value?.id === o.id}
            title={o.title}
            description={o.description}
            warning={o.warning}
            badge={o.badge}
            onClick={() => onChange(o)}
          />
        ))}
        <ConsultationCard />
      </div>
    </div>
  );
}

function StepIndex({
  value,
  onChange,
}: {
  value: IndexOption | null;
  onChange: (v: IndexOption) => void;
}) {
  return (
    <div>
      <StepHeader
        title="Материал и индекс линз"
        subtitle="Чем выше индекс, тем тоньше может быть линза"
      />
      <div className="space-y-3">
        {INDEX_OPTIONS.map((o) => (
          <OptionCard
            key={o.id}
            active={value?.id === o.id}
            title={o.title}
            description={o.description}
            onClick={() => onChange(o)}
            rightSlot={<ThicknessIndicator level={o.level} />}
          />
        ))}
        <ConsultationCard />
      </div>
    </div>
  );
}

function ThicknessIndicator({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="hidden items-end gap-1 sm:flex">
      {[5, 4, 3, 2, 1].map((bar) => (
        <span
          key={bar}
          className={cn(
            "w-2 rounded-full transition-colors",
            bar <= level ? "bg-brand" : "bg-surface",
          )}
          style={{ height: `${bar * 6 + 8}px` }}
        />
      ))}
    </div>
  );
}

function StepDesign({
  value,
  onChange,
}: {
  value: DesignOption | null;
  onChange: (v: DesignOption) => void;
}) {
  return (
    <div>
      <StepHeader title="Дизайн и покрытия" subtitle="Выберите подходящее покрытие линз" />
      <div className="space-y-3">
        {DESIGNS.map((o) => (
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

function StepBrand({
  value,
  onChange,
}: {
  value: BrandOption | null;
  onChange: (v: BrandOption) => void;
}) {
  return (
    <div>
      <StepHeader title="Выберите бренд линз" subtitle="Финальный шаг — производитель линз" />
      <div className="space-y-3">
        {BRANDS.map((o) => (
          <OptionCard
            key={o.id}
            active={value?.id === o.id}
            title={o.title}
            description={o.description}
            badge={o.highlight}
            onClick={() => onChange(o)}
          />
        ))}
        <ConsultationCard />
      </div>
    </div>
  );
}

function SelectionReview({
  purpose,
  lensType,
  indexOpt,
  design,
  brand,
  hasRx,
}: {
  purpose: PurposeOption | null;
  lensType: LensTypeOption | null;
  indexOpt: IndexOption | null;
  design: DesignOption | null;
  brand: BrandOption | null;
  hasRx: boolean;
}) {
  const rows = [
    ["Назначение", purpose?.title],
    ["Тип линз", lensType?.title],
    ["Материал и индекс", indexOpt?.title],
    ["Дизайн и покрытие", design?.title],
    ["Бренд", brand?.title],
    ["Рецепт", hasRx ? "Заполнен" : "Без рецепта"],
  ];

  return (
    <section className="mt-6 rounded-xl border border-border bg-surface/50 p-5">
      <h2 className="font-serif text-xl">Ваш выбор</h2>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-4">
            <dt className="w-36 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value ?? "Не выбрано"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Менеджер проверит совместимость выбранных параметров, наличие и итоговую стоимость линз
        перед подтверждением заказа.
      </p>
    </section>
  );
}
