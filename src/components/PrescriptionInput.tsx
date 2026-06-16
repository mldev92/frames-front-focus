import { ArrowRight, Eye } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { useState } from "react";
import type { Product } from "@/data/types";
import type { EyePrescription, Prescription } from "@/lib/store/cart";

const LABELS: Record<keyof EyePrescription, string> = {
  sphere: "SPH · сфера",
  cylinder: "CYL · цилиндр",
  axis: "AX · ось",
  addition: "ADD · аддидация",
  bc: "BC · кривизна",
  diameter: "DIA · диаметр",
};

const FIELDS = Object.keys(LABELS) as Array<keyof EyePrescription>;

export function requiredPrescriptionFields(product: Product): Array<keyof EyePrescription> {
  return FIELDS.filter((field) => (product[field]?.length ?? 0) > 0);
}

export function prescriptionComplete(product: Product, value: Prescription): boolean {
  const required = requiredPrescriptionFields(product);
  return required.length > 0 && required.every(
    (field) => Boolean(value.right[field]) && Boolean(value.left[field]),
  );
}

export function PrescriptionInput({
  product,
  value,
  onChange,
}: {
  product: Product;
  value: Prescription;
  onChange: (value: Prescription) => void;
}) {
  const [sameBoth, setSameBoth] = useState(true);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const fields = requiredPrescriptionFields(product);

  if (!fields.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Параметры этого товара не опубликованы в каталоге. Онлайн-покупка временно недоступна;
        оставьте запрос, и специалист уточнит рецепт и наличие.
      </div>
    );
  }

  const updateEye = (eye: "right" | "left", field: keyof EyePrescription, next: string) => {
    const updated = {
      ...value,
      [eye]: { ...value[eye], [field]: next },
    };
    if (eye === "right" && sameBoth) {
      updated.left = { ...updated.right };
    }
    onChange(updated);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-start gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Eye className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-semibold">Параметры контактных линз</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Доступны только значения, опубликованные для этого товара в Bitrix.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="overflow-x-auto rounded-xl border border-border">
            <div
              className="grid min-w-[520px] bg-surface text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              style={{ gridTemplateColumns: `92px repeat(${fields.length}, minmax(100px, 1fr))` }}
            >
              <div />
              {fields.map((field) => <div key={field} className="border-l border-border p-3">{LABELS[field]}</div>)}
            </div>
            {(["right", "left"] as const).map((eye) => (
              <div
                key={eye}
                className="grid min-w-[520px] border-t border-border"
                style={{ gridTemplateColumns: `92px repeat(${fields.length}, minmax(100px, 1fr))` }}
              >
                <div className="bg-surface p-3">
                  <strong className="font-serif">{eye === "right" ? "OD" : "OS"}</strong>
                  <span className="block text-[10px] text-muted-foreground">
                    {eye === "right" ? "правый" : "левый"}
                  </span>
                </div>
                {fields.map((field) => (
                  <label key={field} className="border-l border-border p-2">
                    <select
                      value={value[eye][field] ?? ""}
                      disabled={eye === "left" && sameBoth}
                      onChange={(event) => updateEye(eye, field, event.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-2 py-2 text-sm"
                    >
                      <option value="">—</option>
                      {product[field]?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            ))}
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={sameBoth}
              onChange={(event) => {
                setSameBoth(event.target.checked);
                if (event.target.checked) onChange({ ...value, left: { ...value.right } });
              }}
              className="h-4 w-4 accent-brand"
            />
            Параметры обоих глаз совпадают
          </label>
        </div>

        <div className="flex flex-col gap-2 border-t border-border bg-surface px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <span>Не уверены в параметрах?</span>
          <button
            type="button"
            onClick={() => setAppointmentOpen(true)}
            className="inline-flex items-center gap-2 text-left font-semibold text-brand"
          >
            Запросить проверку зрения
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </>
  );
}
