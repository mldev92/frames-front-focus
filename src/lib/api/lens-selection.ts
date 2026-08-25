import { securePost } from "@/lib/api/security";

export interface LensSelectionRequestDraft {
  frame: {
    id?: number;
    slug: string;
    name: string;
    brand: string;
    color?: string;
    price: number;
  };
  selection: {
    purpose: string;
    rxMode: "has" | "none";
    /** The «Линзы» step: type plus its variant, e.g. "Фотохромные · Transitions Gen S". */
    finish: string;
    photochromicColor?: string;
    /** The «Толщина» step card title. */
    thickness: string;
    /** True when the customer kept the index computed from the prescription. */
    thicknessIsRecommended: boolean;
    /** The «Дизайн» step card title. */
    design: string;
    brand: string;
  };
  prescription: {
    od: { sph: string; cyl: string; axis: string; add: string; sphericalEquivalent: string };
    os: { sph: string; cyl: string; axis: string; add: string; sphericalEquivalent: string };
    pdMode: "binocular" | "monocular";
    pd?: string;
    pdOd?: string;
    pdOs?: string;
    recommendedIndex: string;
  } | null;
}

export interface LensSelectionCustomer {
  name: string;
  phone: string;
  email?: string;
  comment?: string;
  consent: boolean;
  website?: string;
}

interface LensSelectionRequestResponse {
  status: "ok";
  requestId: string;
}

export function submitLensSelectionRequest(
  draft: LensSelectionRequestDraft,
  customer: LensSelectionCustomer,
): Promise<LensSelectionRequestResponse> {
  return securePost<LensSelectionRequestResponse>("lens_selection_request.php", {
    ...draft,
    customer,
    sourceUrl: typeof window === "undefined" ? "" : window.location.href,
  });
}
