import { Phone, Route } from "lucide-react";

interface ContactActionButtonsProps {
  routeHref: string;
  phoneHref: string;
  phoneLabel: string;
  className?: string;
}

export const yandexMapsSearchHref = (address: string) =>
  `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;

export function ContactActionButtons({
  routeHref,
  phoneHref,
  phoneLabel,
  className = "",
}: ContactActionButtonsProps) {
  const wrapperClass = `flex flex-wrap gap-3 ${className}`.trim();

  return (
    <div className={wrapperClass}>
      <a
        href={routeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground no-underline transition-opacity hover:opacity-90"
        aria-label="Построить маршрут в Яндекс Картах"
      >
        <Route className="h-4 w-4" strokeWidth={1.75} />
        Построить маршрут
      </a>
      <a
        href={phoneHref}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground no-underline transition-colors hover:border-foreground hover:bg-foreground hover:text-primary-foreground"
        aria-label={`Позвонить ${phoneLabel}`}
      >
        <Phone className="h-4 w-4" strokeWidth={1.75} />
        Позвонить
      </a>
    </div>
  );
}
