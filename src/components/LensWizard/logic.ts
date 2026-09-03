export interface PrescriptionEyeInput {
  sph: string;
  cyl: string;
}

export interface LensIndexRecommendation {
  odSphericalEquivalent: number;
  osSphericalEquivalent: number;
  governingAbsSphericalEquivalent: number;
  index: "1.50" | "1.60" | "1.67";
}

function parsePrescriptionValue(value: string): number | null {
  if (value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function calculateSphericalEquivalent(eye: PrescriptionEyeInput): number | null {
  const sph = parsePrescriptionValue(eye.sph);
  // A blank CYL means "no cylinder" (TZ §2.1 already allows 0.00 here), not
  // "unknown" — owner report, 2026-09-01: customers left it blank because they
  // did not think to type 0, and got stuck unable to proceed. A CYL the
  // customer did type but that is not a number still blocks the calculation.
  const cyl = eye.cyl.trim() === "" ? 0 : parsePrescriptionValue(eye.cyl);

  if (sph === null || cyl === null) return null;
  return sph + cyl / 2;
}

export function getRecommendedLensIndex(
  od: PrescriptionEyeInput,
  os: PrescriptionEyeInput,
): LensIndexRecommendation | null {
  const odSphericalEquivalent = calculateSphericalEquivalent(od);
  const osSphericalEquivalent = calculateSphericalEquivalent(os);

  if (odSphericalEquivalent === null || osSphericalEquivalent === null) return null;

  const governingAbsSphericalEquivalent = Math.max(
    Math.abs(odSphericalEquivalent),
    Math.abs(osSphericalEquivalent),
  );

  // TZ 2.1 publishes: 0.00-1.75 -> 1.50; 2.00-3.75 -> 1.60; 4.00-7.50 -> 1.67;
  // >=8.00 -> 1.74, patching its own gaps upward (1.76-1.99, 3.76-3.99).
  //
  // Owner decision 2026-08-22: 1.74 is stocked in only some lens categories, so
  // it is excluded from recommendations entirely -- everything from 3.76 upward
  // recommends 1.67. This also settles the 7.51-7.99 band the TZ left undefined.
  let index: LensIndexRecommendation["index"];
  if (governingAbsSphericalEquivalent <= 1.75) index = "1.50";
  else if (governingAbsSphericalEquivalent <= 3.75) index = "1.60";
  else index = "1.67";

  return {
    odSphericalEquivalent,
    osSphericalEquivalent,
    governingAbsSphericalEquivalent,
    index,
  };
}
