import type { CartLine } from "@/lib/store/cart";

export function CartPrescription({ line }: { line: CartLine }) {
  return <div className="mt-1 space-y-0.5 break-words text-xs text-muted-foreground">
    {line.legacyDescription && <p>Сохранённые параметры: {line.legacyDescription}</p>}
    {(["right", "left"] as const).map((eye) => {
      const values = line.parameters.prescription?.[eye];
      if (!values) return null;
      const text = [
        values.sphere && `SPH ${values.sphere}`, values.cylinder && `CYL ${values.cylinder}`,
        values.axis && `AX ${values.axis}`, values.addition && `ADD ${values.addition}`,
        values.bc && `BC ${values.bc}`, values.diameter && `DIA ${values.diameter}`,
      ].filter(Boolean).join(", ");
      return text ? <p key={eye}>{eye === "right" ? "OD" : "OS"}: {text}</p> : null;
    })}
  </div>;
}
