import type { CartLine } from "@/lib/store/cart";

export function CartPrescription({ line }: { line: CartLine }) {
  const rows = (["right", "left"] as const).flatMap((eye) => {
    const values = line.parameters.prescription?.[eye];
    if (!values) return [];
    const text = [
      values.sphere && `SPH ${values.sphere}`, values.cylinder && `CYL ${values.cylinder}`,
      values.axis && `AX ${values.axis}`, values.addition && `ADD ${values.addition}`,
      values.bc && `BC ${values.bc}`, values.diameter && `DIA ${values.diameter}`,
    ].filter(Boolean).join(", ");
    return text ? [{ eye, text }] : [];
  });
  // Одинаковые параметры для обоих глаз — одной строкой, а не двумя одинаковыми.
  const sameForBoth = rows.length === 2 && rows[0].text === rows[1].text;

  return <div className="mt-1 space-y-0.5 break-words text-xs text-muted-foreground">
    {line.legacyDescription && <p>Сохранённые параметры: {line.legacyDescription}</p>}
    {sameForBoth
      ? <p>OD и OS: {rows[0].text}</p>
      : rows.map(({ eye, text }) => <p key={eye}>{eye === "right" ? "OD" : "OS"}: {text}</p>)}
  </div>;
}
