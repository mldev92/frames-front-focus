export const STELLEST_TINT_CONDITION = "Скидка действует при покупке прозрачных линз Stellest";

export function stellestTintCondition(line: string, discountPercent: number | null | undefined): string | null {
  return /stellest.*tint/i.test(line) && discountPercent === 50
    ? STELLEST_TINT_CONDITION
    : null;
}
