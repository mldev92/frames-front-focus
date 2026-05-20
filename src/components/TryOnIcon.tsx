import { cn } from "@/lib/utils";

export function TryOnIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-5 w-5", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* frame */}
      <rect x="2.5" y="5.5" width="27" height="21" rx="2" />
      {/* head */}
      <circle cx="16" cy="15" r="4" />
      {/* shoulders */}
      <path d="M9 24c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" />
      {/* glasses */}
      <circle cx="14" cy="14.5" r="1.6" />
      <circle cx="18" cy="14.5" r="1.6" />
      <path d="M15.6 14.5h0.8" />
    </svg>
  );
}

export function TryOnBadge({
  className,
  label = "Примерить онлайн",
  onClick,
  variant = "compact",
}: {
  className?: string;
  label?: string;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: "compact" | "pill";
}) {
  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group/tryon inline-flex items-center gap-2 bg-background/95 backdrop-blur-md rounded-full pl-1.5 pr-4 py-1.5 shadow-md border border-border/60 cursor-pointer hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
          className,
        )}
        title={label}
      >
        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-brand text-brand-foreground transition-transform duration-300 group-hover/tryon:scale-110">
          <TryOnIcon className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium tracking-tight">{label}</span>
      </button>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn(
        "group/tryon inline-flex items-center gap-1.5 bg-background/95 backdrop-blur rounded-full p-2 shadow-sm border border-border cursor-pointer",
        className,
      )}
      title={label}
    >
      <TryOnIcon className="h-4 w-4 text-foreground" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium text-foreground transition-all duration-300 group-hover/tryon:max-w-[160px] group-hover/tryon:pr-1.5 group-hover/card:max-w-[160px] group-hover/card:pr-1.5">
        {label}
      </span>
    </div>
  );
}
