import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Car,
  Check,
  HelpCircle,
  Layers,
  Monitor,
  Mountain,
  Sparkles,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import type { Product } from "@/data/types";
import { formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface Purpose {
  id: string;
  title: string;
  desc: string;
  from: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hasHint?: boolean;
}

interface LensPackage {
  id: string;
  title: string;
  desc: string;
  price: number;
  includes: string[];
}

interface SelectedLens {
  lensLabel: string;
  lensPrice: number;
}

const PURPOSES: Purpose[] = [
  {
    id: "distance",
    title: "Для дали",
    desc: "Ежедневные очки для улицы и вождения",
    from: 1520,
    icon: Mountain,
    hasHint: true,
  },
  {
    id: "near",
    title: "Для близи",
    desc: "Чтение, документы, работа за столом",
    from: 1520,
    icon: BookOpen,
    hasHint: true,
  },
  {
    id: "progressive",
    title: "Прогрессивные",
    desc: "Одна пара для всех расстояний",
    from: 6796,
    icon: Layers,
    hasHint: true,
  },
  {
    id: "sun",
    title: "Для защиты от солнца",
    desc: "Фотохромные или тонированные линзы",
    from: 2956,
    icon: Sun,
    hasHint: true,
  },
  {
    id: "driving",
    title: "Очки для вождения",
    desc: "Контраст и защита от бликов",
    from: 7220,
    icon: Car,
  },
  {
    id: "computer",
    title: "Компьютерные",
    desc: "Для экранов и цифровых устройств",
    from: 3040,
    icon: Monitor,
    hasHint: true,
  },
  {
    id: "image",
    title: "Имиджевые",
    desc: "Без диоптрий и рецепта",
    from: 1520,
    icon: Sparkles,
  },
  {
    id: "consult",
    title: "Заказать консультацию",
    desc: "Бесплатный подбор линз специалистом",
    from: 0,
    icon: UserRound,
  },
];

const LENS_PACKAGES: LensPackage[] = [
  {
    id: "standard",
    title: "Базовые линзы",
    desc: "Тонкие полимерные линзы для повседневной пары",
    price: 1520,
    includes: ["УФ-защита", "Антицарапающее покрытие"],
  },
  {
    id: "comfort",
    title: "Комфорт",
    desc: "Оптимальный выбор для ежедневной носки и работы",
    price: 3950,
    includes: ["Антиблик", "Лёгкая очистка", "Защита от царапин"],
  },
  {
    id: "premium",
    title: "Премиум",
    desc: "Максимально тонкие линзы с расширенной защитой",
    price: 7220,
    includes: ["Тонкий индекс", "Антиблик Pro", "UV + Blue Control"],
  },
];

export function LensPurposeModal({
  open,
  onClose,
  product,
  selectedColor,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  product: Product;
  selectedColor?: string;
  onComplete: (selection: SelectedLens) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [purposeId, setPurposeId] = useState("sun");
  const [packageId, setPackageId] = useState("comfort");

  if (!open) return null;

  const purpose = PURPOSES.find((item) => item.id === purposeId) ?? PURPOSES[0];
  const lensPackage =
    purpose.id === "consult"
      ? {
          id: "consult",
          title: "Консультация специалиста",
          desc: "Оптик уточнит рецепт, сценарий носки и предложит точные линзы",
          price: 0,
          includes: ["Подбор по рецепту", "Расчёт стоимости в салоне"],
        }
      : (LENS_PACKAGES.find((item) => item.id === packageId) ?? LENS_PACKAGES[0]);
  const total = product.price + lensPackage.price;
  const lensLabel =
    purpose.id === "consult"
      ? lensPackage.title
      : `${purpose.title} · ${lensPackage.title}`;

  function closeAndReset() {
    onClose();
    setTimeout(() => {
      setStep(1);
      setPurposeId("sun");
      setPackageId("comfort");
    }, 250);
  }

  function goNext() {
    if (step === 1 && purpose.id === "consult") {
      setStep(3);
      return;
    }
    setStep((value) => Math.min(3, value + 1) as 1 | 2 | 3);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={closeAndReset} />
      <div className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-lg bg-background shadow-xl sm:max-w-3xl sm:rounded-sm">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand">
              Шаг {step} из 3
            </div>
            <h2 className="mt-1 font-serif text-xl leading-tight sm:text-2xl">
              Подбор линз к оправе
            </h2>
          </div>
          <button
            onClick={closeAndReset}
            aria-label="Закрыть"
            className="rounded-sm p-1 hover:bg-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 border-b border-border text-[11px] font-medium">
          {["Назначение", "Линзы", "Итог"].map((label, index) => {
            const active = step === index + 1;
            const done = step > index + 1;
            return (
              <div
                key={label}
                className={cn(
                  "flex items-center justify-center gap-2 px-2 py-3 text-muted-foreground",
                  active && "text-foreground",
                  done && "text-brand",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border text-[10px]",
                    active && "border-foreground",
                    done && "border-brand bg-brand text-brand-foreground",
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            );
          })}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {PURPOSES.map((item) => {
                const Icon = item.icon;
                const active = item.id === purposeId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPurposeId(item.id)}
                    className={cn(
                      "flex items-center gap-4 rounded-sm border p-4 text-left transition-colors",
                      active
                        ? "border-foreground bg-background"
                        : "border-border bg-surface/40 hover:border-foreground/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-background",
                        active ? "text-brand" : "text-muted-foreground",
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={1.35} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        {item.title}
                        {item.hasHint && (
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {item.desc}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-sm bg-surface px-2.5 py-1 text-[11px] text-muted-foreground">
                      {item.from ? `от ${formatPrice(item.from)}` : "0 ₽"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-3">
              {LENS_PACKAGES.map((item) => {
                const active = item.id === packageId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPackageId(item.id)}
                    className={cn(
                      "grid gap-3 rounded-sm border p-4 text-left transition-colors sm:grid-cols-[1fr_auto]",
                      active
                        ? "border-foreground bg-background"
                        : "border-border bg-surface/40 hover:border-foreground/40",
                    )}
                  >
                    <span>
                      <span className="font-medium">{item.title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{item.desc}</span>
                      <span className="mt-3 flex flex-wrap gap-2">
                        {item.includes.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-sm bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
                          >
                            {feature}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="font-serif text-xl">{formatPrice(item.price)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-5 sm:grid-cols-[1fr_300px]">
              <div className="rounded-sm border border-border bg-surface/40 p-5">
                <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Комплект
                </div>
                <h3 className="mt-2 font-serif text-2xl">
                  {product.brand} {product.name}
                </h3>
                <div className="mt-2 text-sm text-muted-foreground">
                  {selectedColor ? `Цвет: ${selectedColor}` : "Цвет будет уточнён при заказе"}
                </div>
                <div className="mt-4 rounded-sm bg-background p-4">
                  <div className="font-medium">{lensLabel}</div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {lensPackage.desc}
                  </p>
                </div>
              </div>

              <div className="rounded-sm border border-border bg-background p-5 shadow-sm">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Оправа</span>
                    <span>{formatPrice(product.price)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Линзы</span>
                    <span>{lensPackage.price ? formatPrice(lensPackage.price) : "0 ₽"}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-medium">Итого</span>
                      <span className="font-serif text-2xl">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface/30 px-5 py-4 sm:px-6">
          <button
            onClick={() => {
              if (step === 1) closeAndReset();
              else setStep((value) => Math.max(1, value - 1) as 1 | 2 | 3);
            }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {step === 1 ? "Отмена" : <><ArrowLeft className="h-4 w-4" /> Назад</>}
          </button>

          {step < 3 ? (
            <button
              onClick={goNext}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Продолжить <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onComplete({ lensLabel, lensPrice: lensPackage.price });
                closeAndReset();
              }}
              className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90"
            >
              Добавить комплект
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
