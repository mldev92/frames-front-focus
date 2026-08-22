export interface PrescriptionEyeInput {
  sph: string;
  cyl: string;
}

export interface LensIndexRecommendation {
  odSphericalEquivalent: number;
  osSphericalEquivalent: number;
  governingAbsSphericalEquivalent: number;
  index: "1.50" | "1.60" | "1.67" | "1.74";
}

function parsePrescriptionValue(value: string): number | null {
  if (value.trim() === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function calculateSphericalEquivalent(eye: PrescriptionEyeInput): number | null {
  const sph = parsePrescriptionValue(eye.sph);
  const cyl = parsePrescriptionValue(eye.cyl);

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

  // TZ 2.1 scale: 0.00-1.75 -> 1.50; 2.00-3.75 -> 1.60; 4.00-7.50 -> 1.67; >=8.00 -> 1.74.
  // The spec patches its own gaps upward: 1.76-1.99 -> 1.60 and 3.76-3.99 -> 1.67.
  // 7.51-7.99 is left undefined by the spec; kept at 1.67 pending the owner's answer.
  let index: LensIndexRecommendation["index"];
  if (governingAbsSphericalEquivalent <= 1.75) index = "1.50";
  else if (governingAbsSphericalEquivalent <= 3.75) index = "1.60";
  else if (governingAbsSphericalEquivalent < 8) index = "1.67";
  else index = "1.74";

  return {
    odSphericalEquivalent,
    osSphericalEquivalent,
    governingAbsSphericalEquivalent,
    index,
  };
}
