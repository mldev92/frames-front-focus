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

  let index: LensIndexRecommendation["index"];
  if (governingAbsSphericalEquivalent <= 1.75) index = "1.50";
  else if (governingAbsSphericalEquivalent < 4) index = "1.60";
  else if (governingAbsSphericalEquivalent < 8) index = "1.67";
  else index = "1.74";

  return {
    odSphericalEquivalent,
    osSphericalEquivalent,
    governingAbsSphericalEquivalent,
    index,
  };
}
