export type PriceRange = readonly [number, number];
export type PriceRangeDraft = readonly [string, string];

export function normalizePriceRangeDraft(
  draft: PriceRangeDraft,
  bounds: { min: number; max: number },
  fallback: PriceRange,
): [number, number] {
  const parse = (raw: string, blankValue: number) => {
    if (raw.trim() === "") return blankValue;
    const value = Number(raw);
    return Number.isFinite(value) ? value : Number.NaN;
  };
  const clamp = (value: number) => Math.min(bounds.max, Math.max(bounds.min, value));
  const min = clamp(parse(draft[0], bounds.min));
  const max = clamp(parse(draft[1], bounds.max));

  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
    return [fallback[0], fallback[1]];
  }
  return [min, max];
}
