import { useState } from "react";
import { X, HelpCircle, Mountain, BookOpen, Layers, Sun, Car, Monitor, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  title: string;
  desc: string;
  count: string;
  from: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hasHint?: boolean;
}

const OPTIONS: Option[] = [
  { id: "distance", title: "Для дали", desc: "Ежедневные очки для дали", count: "4209 линз", from: "от 1520 ₽", icon: Mountain, hasHint: true },
  { id: "near", title: "Для близи", desc: "Для чтения и работы вблизи", count: "3981 линз", from: "от 1520 ₽", icon: BookOpen, hasHint: true },
  { id: "progressive", title: "Прогрессивные", desc: "Для всех расстояний", count: "5997 линз", from: "от 6796 ₽", icon: Layers, hasHint: true },
  { id: "sun", title: "Для защиты от солнца", desc: "Фотохромные или тонированные", count: "7118 линз", from: "от 2956 ₽", icon: Sun, hasHint: true },
  { id: "driving", title: "Очки для вождения", desc: "Улучшают контрастное восприятие и защищают от бликов и засветов днём и ночью", count: "1356 линз", from: "от 7220 ₽", icon: Car },
  { id: "computer", title: "Компьютерные", desc: "Для работы с экранами и цифровыми устройствами", count: "1747 линз", from: "от 3040 ₽", icon: Monitor, hasHint: true },
  { id: "image", title: "Имиджевые", desc: "Без диоптрий и рецепта", count: "3757 линз", from: "от 1520 ₽", icon: Sparkles },
  { id: "consult", title: "Заказать консультацию", desc: "Бесплатный подбор линз специалистом", count: "", from: "", icon: UserRound },
];

export function LensPurposeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<string>("sun");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full sm:max-w-2xl max-h-[90vh] overflow-hidden rounded-t-lg sm:rounded-sm shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-serif text-xl">Для чего вы используете очки?</h2>
          <button onClick={onClose} aria-label="Закрыть" className="p-1 hover:bg-surface rounded-sm">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-3 sm:p-4 space-y-2">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = selected === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  "w-full text-left flex items-center gap-4 px-4 sm:px-5 py-4 border rounded-sm transition-colors",
                  active
                    ? "border-foreground bg-background"
                    : "border-border hover:border-foreground/40 bg-surface/40",
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium">{opt.title}</span>
                    {opt.hasHint && (
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {opt.desc}
                  </div>
                </div>

                {(opt.count || opt.from) && (
                  <div className="hidden sm:flex flex-col items-end gap-1 text-[11px] shrink-0">
                    {opt.count && (
                      <span className="bg-surface px-2.5 py-1 rounded-sm text-muted-foreground">
                        {opt.count}
                      </span>
                    )}
                    {opt.from && (
                      <span className="bg-surface px-2.5 py-1 rounded-sm text-muted-foreground">
                        {opt.from}
                      </span>
                    )}
                  </div>
                )}

                <div
                  className={cn(
                    "h-12 w-12 shrink-0 flex items-center justify-center rounded-sm",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-7 w-7" strokeWidth={1.25} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3 bg-surface/30">
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Отмена
          </button>
          <button
            onClick={onClose}
            className="bg-ink text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90 text-sm font-medium"
          >
            Подобрать линзы
          </button>
        </div>
      </div>
    </div>
  );
}
