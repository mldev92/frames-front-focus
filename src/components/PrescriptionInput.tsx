import { useRef, useState, type DragEvent } from "react";
import { ArrowRight, BookmarkCheck, Check, Eye, FileText, Upload } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { cn } from "@/lib/utils";

type Mode = "upload" | "online" | "saved";
type PrescriptionVariant = "frames" | "contacts";

const SPH_VALUES = [
  "-6.00",
  "-5.00",
  "-4.00",
  "-3.50",
  "-3.00",
  "-2.50",
  "-2.00",
  "-1.75",
  "-1.50",
  "-1.25",
  "-1.00",
  "-0.75",
  "-0.50",
  "0.00",
  "+0.50",
  "+1.00",
  "+1.50",
  "+2.00",
];
const CYL_VALUES = ["0.00", "-0.25", "-0.50", "-0.75", "-1.00", "-1.25", "-1.50", "-1.75", "-2.00"];
const AXIS_VALUES = [
  "0°",
  "10°",
  "20°",
  "30°",
  "45°",
  "60°",
  "90°",
  "120°",
  "135°",
  "150°",
  "170°",
  "180°",
];
const PD_VALUES = ["56", "58", "60", "62", "64", "66", "68", "70", "72"];
const BC_VALUES = ["8.4", "8.5", "8.6", "8.7", "8.8"];
const DIA_VALUES = ["14.0", "14.2", "14.5"];

interface EyeRx {
  sph: string;
  second: string;
  third: string;
}

const emptyEye: EyeRx = { sph: "", second: "", third: "" };

export function PrescriptionInput({ variant = "frames" }: { variant?: PrescriptionVariant }) {
  const [mode, setMode] = useState<Mode>("online");
  const [file, setFile] = useState<File | null>(null);
  const [right, setRight] = useState<EyeRx>(emptyEye);
  const [left, setLeft] = useState<EyeRx>(emptyEye);
  const [sameBoth, setSameBoth] = useState(true);
  const [pd, setPd] = useState("");
  const [dragging, setDragging] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isFrames = variant === "frames";
  const complete = isFrames
    ? right.sph !== "" && left.sph !== "" && pd !== ""
    : right.sph !== "" && left.sph !== "";

  const tabs: { id: Mode; label: string; icon: typeof Upload }[] = [
    { id: "upload", label: "Загрузить файл", icon: Upload },
    { id: "online", label: "Заполнить онлайн", icon: FileText },
    { id: "saved", label: "Сохранённый рецепт", icon: BookmarkCheck },
  ];

  const acceptFile = (nextFile?: File) => {
    if (!nextFile) return;
    if (nextFile.size > 10 * 1024 * 1024) return;
    setFile(nextFile);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-start gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Eye className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-semibold">Введите ваш рецепт</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Возьмите данные из рецепта врача или загрузите его фото. Остальное сделаем мы.
            </p>
          </div>
        </div>

        <div className="mx-5 mt-5 flex gap-1 rounded-full bg-surface p-1 sm:mx-7">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-2 py-2.5 text-xs font-semibold transition",
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-7">
          {mode === "upload" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex w-full flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground transition sm:p-10",
                  dragging
                    ? "scale-[1.01] border-brand bg-brand/5"
                    : "border-border hover:border-brand hover:bg-brand/5",
                )}
              >
                <Upload className="h-6 w-6" />
                {file ? (
                  <strong className="font-semibold text-foreground">{file.name}</strong>
                ) : (
                  <span>
                    <strong className="font-semibold text-foreground">Выберите фото рецепта</strong>{" "}
                    или перетащите файл сюда
                  </span>
                )}
                <span className="text-xs">PNG, JPG, PDF · до 10 МБ</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(event) => acceptFile(event.target.files?.[0])}
              />
              {file && (
                <Confirmation>
                  Файл получен. Оптик проверит рецепт перед сборкой заказа.
                </Confirmation>
              )}
            </div>
          )}

          {mode === "online" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="overflow-x-auto rounded-xl border border-border">
                <div className="min-w-[540px]">
                  <div className="grid grid-cols-[92px_repeat(3,1fr)] bg-surface text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <div />
                    <div className="border-l border-border px-3 py-2.5">SPH · сфера</div>
                    <div className="border-l border-border px-3 py-2.5">
                      {isFrames ? "CYL · цилиндр" : "BC · кривизна"}
                    </div>
                    <div className="border-l border-border px-3 py-2.5">
                      {isFrames ? "AX · ось" : "DIA · диаметр"}
                    </div>
                  </div>
                  <EyeRow
                    eye="OD"
                    sub="правый"
                    value={right}
                    onChange={(value) => {
                      setRight(value);
                      if (sameBoth) setLeft(value);
                    }}
                    variant={variant}
                  />
                  <EyeRow
                    eye="OS"
                    sub="левый"
                    value={left}
                    onChange={setLeft}
                    variant={variant}
                    disabled={sameBoth}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={sameBoth}
                    onChange={(event) => {
                      setSameBoth(event.target.checked);
                      if (event.target.checked) setLeft(right);
                    }}
                    className="h-4 w-4 accent-brand"
                  />
                  Параметры обоих глаз совпадают
                </label>

                {isFrames && (
                  <label className="flex items-center gap-2 text-xs">
                    <span>PD · межзрачковое расстояние</span>
                    <select
                      value={pd}
                      onChange={(event) => setPd(event.target.value)}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition focus:border-brand"
                    >
                      <option value="">— мм</option>
                      {PD_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {value} мм
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {complete && (
                <Confirmation>
                  Рецепт заполнен. Мы учтём его при подборе линз и сборке очков.
                </Confirmation>
              )}
            </div>
          )}

          {mode === "saved" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-border bg-surface/50 p-6 text-center duration-300">
              <BookmarkCheck className="mx-auto h-6 w-6 text-brand" />
              <div className="mt-3 text-sm font-medium">Сохранённых рецептов пока нет</div>
              <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                Войдите в личный кабинет, чтобы сохранять рецепты и использовать их в следующих
                заказах.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-border bg-surface px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <span>Не знаете свой рецепт?</span>
          <button
            type="button"
            onClick={() => setAppointmentOpen(true)}
            className="inline-flex items-center gap-2 text-left font-semibold text-brand"
          >
            Бесплатная проверка зрения в салоне
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </>
  );
}

function EyeRow({
  eye,
  sub,
  value,
  onChange,
  variant,
  disabled = false,
}: {
  eye: string;
  sub: string;
  value: EyeRx;
  onChange: (v: EyeRx) => void;
  variant: PrescriptionVariant;
  disabled?: boolean;
}) {
  const isFrames = variant === "frames";
  return (
    <div className="grid grid-cols-[92px_repeat(3,1fr)] border-t border-border">
      <div className="flex flex-col justify-center bg-surface px-3 py-3">
        <strong className="font-serif text-base">{eye}</strong>
        <span className="text-[10px] text-muted-foreground">{sub}</span>
      </div>
      <RxSelect
        values={SPH_VALUES}
        value={value.sph}
        disabled={disabled}
        onChange={(next) => onChange({ ...value, sph: next })}
      />
      <RxSelect
        values={isFrames ? CYL_VALUES : BC_VALUES}
        value={value.second}
        disabled={disabled}
        onChange={(next) => onChange({ ...value, second: next })}
      />
      <RxSelect
        values={isFrames ? AXIS_VALUES : DIA_VALUES}
        value={value.third}
        disabled={disabled}
        onChange={(next) => onChange({ ...value, third: next })}
      />
    </div>
  );
}

function RxSelect({
  values,
  value,
  onChange,
  disabled,
}: {
  values: string[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <label className="border-l border-border p-2">
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm outline-none transition hover:bg-surface focus:border-brand focus:bg-card disabled:cursor-not-allowed disabled:opacity-55"
      >
        <option value="">—</option>
        {values.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Confirmation({ children }: { children: string }) {
  return (
    <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-medium text-green-800">
      <Check className="h-4 w-4 shrink-0" />
      {children}
    </div>
  );
}
