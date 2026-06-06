import { Link } from "@tanstack/react-router";
import type { MouseEventHandler } from "react";
import { cn } from "@/lib/utils";

const LOGO = {
  alt: "ОПТИКА 100% ONLINE",
  height: 614,
  src: "/logo_2_parts.webp",
  width: 2111,
};

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  loading?: "eager" | "lazy";
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function SiteLogo({ className, imageClassName, loading = "eager", onClick }: SiteLogoProps) {
  return (
    <Link
      to="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label={LOGO.alt}
      onClick={onClick}
    >
      <img
        src={LOGO.src}
        alt={LOGO.alt}
        width={LOGO.width}
        height={LOGO.height}
        loading={loading}
        decoding="async"
        className={cn("block w-auto object-contain", imageClassName)}
      />
    </Link>
  );
}
