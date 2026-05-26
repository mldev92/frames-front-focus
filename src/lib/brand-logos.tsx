/** Brand name → logo image mapping. Normalized key = lowercase, no spaces. */
const BRAND_LOGOS: Record<string, string> = {
  "lionsheart": "/lionsheart.orig.webp",
  "odl": "/odl.orig.webp",
  "stepper": "/stepper.orig.svg",
  "st.louise": "/st_louise.orig.svg",
  "stlouise": "/st_louise.orig.svg",
  "silhouette": "/silhouette.orig.svg",
  "safilo": "/safilo.orig.svg",
  "polaroid": "/polaroid.orig.svg",
  "okula": "/okula.origin.webp",
  "juniorlook": "/juniorlook.origin.webp",
  "guess": "/guess.orig.svg",
  "furla": "/furla.orig.png",
  "fisher-price": "/fisher-price.orig.svg",
  "fisherprice": "/fisher-price.orig.svg",
};

/** The full list of brand names (display names) that have logo images. */
export const BRAND_NAMES = [
  "Lionsheart",
  "ODL",
  "Stepper",
  "St. Louise",
  "Silhouette",
  "Safilo",
  "Polaroid",
  "Okula",
  "Juniorlook",
  "Guess",
  "Furla",
  "Fisher-Price",
];

/** Return the brand logo <img> element, or null if no logo exists. */
export function brandLogoImg(brand: string, className = "h-4 w-auto"): JSX.Element | null {
  const key = brand.toLowerCase().replace(/\s+/g, "");
  const src = BRAND_LOGOS[key];
  if (!src) return null;
  return <img src={src} alt={brand} className={className} />;
}
