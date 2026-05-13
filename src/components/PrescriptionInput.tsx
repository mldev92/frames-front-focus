import { useState, useRef } from "react";
import { Upload, FileText, BookmarkCheck, Eye, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "upload" | "online" | "saved";

const SPH_VALUES = [
  "-6.00", "-5.00", "-4.00", "-3.50", "-3.00", "-2.50",
  "-2.00", "-1.75", "-1.50", "-1.25", "-1.00", "-0.75", "-0.50",
];
const BC_VALUES = ["8.4", "8.5", "8.6", "8.7", "8.8"];
const DIA_VALUES = ["14.0", "14.2", "14.5"];

interface EyeRx {
  sph: string;
  bc: string;
  dia: string;
}

const emptyEye: EyeRx = { sph: "", bc: "", dia: "" };

export function PrescriptionInput() {
  const [mode, setMode] = useState<Mode>("online");
  const [file, setFile] = useState<File | null>(null);
  const [right, setRight] = useState<EyeRx>(emptyEye);
  const [left, setLeft] = useState<EyeRx>(emptyEye);
  const [sameBoth, setSameBoth] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const tabs: { id: Mode; label: string; icon: typeof Upload }[] = [
    { id: "upload", label: "Загрузить файл", icon: Upload },
    { id: "online", label: "Заполнить онлайн", icon: FileText },
    { id: "saved", label: "Сохранённый рецепт", icon: BookmarkCheck },
  ];

  return (
    <div className="rounded-sm border border-border bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Eye className="h-4 w-4 text-brand" />
        <h3 className="text-sm font-medium">Введите ваш рецепт</h3>
      </div>

      <div className="grid grid-cols-3 gap-px bg-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = mode === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-3 text-xs font-medium uppercase tracking-wider transition-colors",
                active
                  ? "bg-background text-foreground"
                  : "bg-surface text-muted-foreground hover:text-foreground hover:bg-background/60",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5 bg-background">
        {mode === "upload" && (
          <div>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border border-dashed border-border hover:border-brand hover:bg-surface/50 rounded-sm p-8 flex flex-col items-center gap-2 transition-colors"
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <div className="text-sm">
                {file ? (
                  <span className="text-foreground">{file.name}</span>
                ) : (
                  <>
                    <span className="text-foreground">Выберите фото рецепта</span>
                    <span className="text-muted-foreground"> или перетащите файл</span>
                  </>
                )}
              </div>
              <span className="text-xs text-muted-foreground">PNG, JPG, PDF · до 10 МБ</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        {mode === "online" && (
          <div className="space-y-5">
            <EyeRow
              label="Правый глаз (OD)"
              value={right}
              onChange={(v) => {
                setRight(v);
                if (sameBoth) setLeft(v);
              }}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={sameBoth}
                onChange={(e) => {
                  setSameBoth(e.target.checked);
                  if (e.target.checked) setLeft(right);
                }}
                className="accent-brand"
              />
              Параметры обоих глаз совпадают
            </label>
            {!sameBoth && (
              <EyeRow label="Левый глаз (OS)" value={left} onChange={setLeft} />
            )}
          </div>
        )}

        {mode === "saved" && (
          <div className="space-y-2">
            {[1, 2].length === 0 ? null : (
              <>
                <SavedRx label="Рецепт от 12.03.2025" detail="OD −2.00 · OS −2.25 · BC 8.6" />
                <SavedRx label="Рецепт от 04.11.2024" detail="OD −1.75 · OS −1.75 · BC 8.6" />
              </>
            )}
            <p className="text-xs text-muted-foreground pt-2">
              Войдите в личный кабинет, чтобы сохранять рецепты для быстрых заказов.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EyeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: EyeRx;
  onChange: (v: EyeRx) => void;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <RxSelect
          label="SPH"
          values={SPH_VALUES}
          value={value.sph}
          onChange={(v) => onChange({ ...value, sph: v })}
        />
        <RxSelect
          label="BC"
          values={BC_VALUES}
          value={value.bc}
          onChange={(v) => onChange({ ...value, bc: v })}
        />
        <RxSelect
          label="DIA"
          values={DIA_VALUES}
          value={value.dia}
          onChange={(v) => onChange({ ...value, dia: v })}
        />
      </div>
    </div>
  );
}

function RxSelect({
  label,
  values,
  value,
  onChange,
}: {
  label: string;
  values: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-background border border-border rounded-sm px-2.5 py-2 text-sm focus:border-brand focus:outline-none transition-colors"
      >
        <option value="">—</option>
        {values.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
}

function SavedRx({ label, detail }: { label: string; detail: string }) {
  return (
    <button className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 border border-border rounded-sm hover:border-brand hover:bg-surface/50 transition-colors group">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{detail}</div>
      </div>
      <Check className="h-4 w-4 text-muted-foreground group-hover:text-brand" />
    </button>
  );
}
