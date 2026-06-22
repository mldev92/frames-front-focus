import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, HelpCircle, X } from "lucide-react";
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
  { id: 4, label: "Толщина" },
  { id: 5, label: "Дизайн" },
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

  const total = useMemo(() => {
    return (
      frame.price +
      (lensType?.fromPrice ?? 0) +
      (indexOpt?.fromPrice ?? 0) +
      (design?.fromPrice ?? 0) +
      (brand?.fromPrice ?? 0)
    );
  }, [frame.price, lensType, indexOpt, design, brand]);

  if (!open) return null;

  const goNext = () => setStep((s) => (s < 6 ? ((s + 1) as StepId) : s));
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as StepId) : s));

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
    const summary = `${purpose.title} · ${lensType.title} · ${indexOpt.title} · ${brand.title}`;
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
    toast.success(`Комплект «${frame.name}» добавлен в корзину`);
    onClose();
    setStep(1);
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
            <span className="text-xs text-muted-foreground">
              Шаг {step}/6
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-full p-2 hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="block px-4 pb-3 md:hidden">
          <div className="text-xs uppercase tracking-wider text-brand">
            {STEPS[step - 1].label}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:px-8 lg:py-10">
          {/* LEFT: frame preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <button
              onClick={onClose}
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
                В быстром подборе линз мы предлагаем самые популярные бренды — Essilor,
                Zeiss и Hoya. Если Вам нужны линзы другого бренда, обратитесь к нашим
                консультантам.
              </p>
            </div>
          </aside>

          {/* RIGHT: step content */}
          <main className="min-w-0">
            {step > 1 && (
              <button
                onClick={goBack}
                className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" /> Назад
              </button>
            )}

            {step === 1 && (
              <StepPurpose value={purpose} onChange={(v) => { setPurpose(v); setLensType(null); }} />
            )}
            {step === 2 && (
              <StepRx
                purpose={purpose}
                od={od} setOd={setOd}
                os={os} setOs={setOs}
                pd={pd} setPd={setPd}
                pdNear={pdNear} setPdNear={setPdNear}
                twoPd={twoPd} setTwoPd={setTwoPd}
                onSkip={() => { setSkipRx(true); goNext(); }}
              />
            )}
            {step === 3 && purpose && (
              <StepLensType purposeId={purpose.id} value={lensType} onChange={setLensType} />
            )}
            {step === 4 && (
              <StepIndex value={indexOpt} onChange={setIndexOpt} />
            )}
            {step === 5 && (
              <StepDesign value={design} onChange={setDesign} />
            )}
            {step === 6 && (
              <StepBrand value={brand} onChange={setBrand} />
            )}
          </main>
        </div>
      </div>

      {/* Sticky footer */}
      <footer className="sticky bottom-0 z-10 border-t border-border bg-background">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="text-sm">
            <span className="text-muted-foreground">Цена: </span>
            {frame.oldPrice && (
              <span className="mr-2 text-muted-foreground line-through">
                {formatPrice(frame.oldPrice + (lensType?.fromPrice ?? 0))}
              </span>
            )}
            <strong className="font-serif text-xl">{formatPrice(total)}</strong>
          </div>
          {step < 6 ? (
            <button
              onClick={goNext}
              disabled={!canProceed}
              className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Далее
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed}
              className="rounded-full bg-brand px-8 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              В корзину
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
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
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
      href="tel:+78127777777"
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
              count={p.count}
              fromPrice={p.fromPrice}
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
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
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
  od, setOd,
  os, setOs,
  pd, setPd,
  pdNear, setPdNear,
  twoPd, setTwoPd,
  onSkip,
}: {
  purpose: PurposeOption | null;
  od: Eye; setOd: (v: Eye) => void;
  os: Eye; setOs: (v: Eye) => void;
  pd: string; setPd: (v: string) => void;
  pdNear: string; setPdNear: (v: string) => void;
  twoPd: boolean; setTwoPd: (v: boolean) => void;
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

  const hasCyl = (eye: Eye) => eye.cyl !== "" && eye.cyl !== "+0.00" && eye.cyl !== "-0.00";
  const showAdd = !!purpose?.requiresAdd;

  return (
    <div>
      <StepHeader
        title="Ваш рецепт"
        subtitle="Заполните ваш рецепт от врача-офтальмолога. Все параметры должны точно совпадать с рецептом."
      />

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface text-left">
              <th className="p-3 font-medium" />
              <th className="p-3 font-medium">Сфера (SPH)</th>
              <th className="p-3 font-medium">Цилиндр (CYL)</th>
              <th className="p-3 font-medium">Ось (AXI)</th>
              {showAdd && <th className="p-3 font-medium">Аддидация (ADD)</th>}
            </tr>
          </thead>
          <tbody>
            {(["right", "left"] as const).map((side) => {
              const eye = side === "right" ? od : os;
              const set = side === "right" ? setOd : setOs;
              const label = side === "right" ? "OD (Правый)" : "OS (Левый)";
              return (
                <tr key={side} className="border-t border-border">
                  <td className="p-3 font-medium">{label}</td>
                  <td className="p-3">
                    <RxSelect value={eye.sph} onChange={(v) => set({ ...eye, sph: v })} options={sphValues} />
                  </td>
                  <td className="p-3">
                    <RxSelect value={eye.cyl} onChange={(v) => set({ ...eye, cyl: v })} options={cylValues} />
                  </td>
                  <td className="p-3">
                    <RxSelect
                      value={eye.axi}
                      onChange={(v) => set({ ...eye, axi: v })}
                      options={axiValues}
                      disabled={!hasCyl(eye)}
                    />
                  </td>
                  {showAdd && (
                    <td className="p-3">
                      <RxSelect value={eye.add} onChange={(v) => set({ ...eye, add: v })} options={addValues} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={twoPd} onChange={(e) => setTwoPd(e.target.checked)} />
          У меня 2 значения PD
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <div className="mb-1 text-xs text-muted-foreground">PD</div>
            <RxSelect value={pd} onChange={setPd} options={pdValues} placeholder="—" />
          </div>
          {twoPd && showAdd && (
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Near PD</div>
              <RxSelect value={pdNear} onChange={setPdNear} options={pdValues} placeholder="Нет" />
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
            count={o.count}
            fromPrice={o.fromPrice}
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
      <StepHeader title="Индекс преломления" subtitle="Чем выше, тем толщина линз меньше" />
      <div className="space-y-3">
        {INDEX_OPTIONS.map((o) => (
          <OptionCard
            key={o.id}
            active={value?.id === o.id}
            title={o.title}
            description={o.description}
            count={o.count}
            fromPrice={o.fromPrice}
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
            count={o.count}
            fromPrice={o.fromPrice}
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
            count={o.count}
            fromPrice={o.fromPrice}
            badge={o.highlight}
            onClick={() => onChange(o)}
          />
        ))}
        <ConsultationCard />
      </div>
    </div>
  );
}
