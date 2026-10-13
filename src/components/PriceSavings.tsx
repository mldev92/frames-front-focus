import { formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

interface PriceSavingsProps {
  oldPrice?: number | null;
  price?: number | null;
  discountPercent?: number | null;
  quantity?: number;
  className?: string;
}

export function PriceSavings({
  oldPrice,
  price,
  discountPercent,
  quantity = 1,
  className,
}: PriceSavingsProps) {
  if (oldPrice == null || price == null || oldPrice <= price || quantity <= 0) return null;
  const percent = discountPercent && discountPercent > 0
    ? Math.round(discountPercent)
    : Math.round(((oldPrice - price) / oldPrice) * 100);
  const savings = (oldPrice - price) * quantity;

  return (
    <span className={cn("block text-xs font-medium text-brand", className)}>
      Скидка −{percent}% · Экономия {formatPrice(savings)}
    </span>
  );
}
