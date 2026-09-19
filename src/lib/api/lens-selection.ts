import { securePost, securePostForm } from "@/lib/api/security";

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
    /**
     * The price card the customer picked on the results step, flattened for the
     * salon email, e.g. "Оптимальный выбор — ZEISS SmartLife 1.67, 8 500 ₽ за линзу".
     * Absent when they sent the request without picking one.
     */
    chosenOffer?: string;
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

export interface LensSelectionRequestOptions {
  /** An optional prescription photo/PDF to attach (JPG/PNG/PDF, ≤8 MB). */
  file?: File | null;
  /** The customer chose «Загружу рецепт позже» rather than attaching now. */
  prescriptionLater?: boolean;
}

export function submitLensSelectionRequest(
  draft: LensSelectionRequestDraft,
  customer: LensSelectionCustomer,
  options: LensSelectionRequestOptions = {},
): Promise<LensSelectionRequestResponse> {
  const payload = {
    ...draft,
    customer,
    prescriptionLater: options.prescriptionLater ?? false,
    sourceUrl: typeof window === "undefined" ? "" : window.location.href,
  };
  // With a file the request goes multipart (payload JSON + the file); without
  // one it stays the plain JSON POST it has always been.
  if (options.file) {
    const form = new FormData();
    form.append("payload", JSON.stringify(payload));
    form.append("prescriptionFile", options.file);
    return securePostForm<LensSelectionRequestResponse>("lens_selection_request.php", form);
  }
  return securePost<LensSelectionRequestResponse>("lens_selection_request.php", payload);
}
