import type { Salon } from "./types";
import { CONTACT, SALONS } from "./contact";

// Compatibility export for older components. Verified source data lives in contact.ts.
export const salons: Salon[] = SALONS.map((salon) => ({
  id: salon.id,
  name: salon.name,
  address: salon.address,
  metro: salon.metro ?? salon.cityLabel,
  phone: CONTACT.phone.label,
  hours: salon.hours,
  image: salon.imageSrc ?? "",
}));
