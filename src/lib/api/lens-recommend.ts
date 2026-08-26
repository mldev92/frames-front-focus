import { getStoreApiUrl } from "@/lib/api/bitrix";
import { apiFetch } from "@/lib/api/security";

/**
 * GET /api/store/lens_recommend.php — the three result cards for the wizard's
 * «Результаты» step, priced with the owner's markup scheme on the backend.
 */

export interface LensRecommendQuery {
  odSph: string;
  odCyl: string;
  osSph: string;
  osCyl: string;
  /** The «Толщина» pick, e.g. "1.67"; omit to use the computed index. */
  index?: string;
  /** The «Линзы» step. */
  lensType?: "clear" | "photochromic" | "sun";
  /** Treatment keyword filter; accepts "|"-alternation (e.g. "Pola|Xperio"). */
  tint?: string;
  /** Supplier slug: essilor / zeiss / hoya / synchrony. Omit for all. */
  brand?: string;
}

export interface LensRecommendCard {
  supplier: string;
  line: string;
  index: number | null;
  coating: string;
  treatment: string;
  availability: string;
  retailPriceRub: number | null;
  priceRub: number | null;
  priceIsWholesale: boolean;
  rxFit: "yes" | "no" | "unknown";
  needsManagerCheck: boolean;
}

export interface LensRecommendResponse {
  prescription: {
    odSphericalEquivalent: number;
    osSphericalEquivalent: number;
    governingAbsSphericalEquivalent: number;
    index: string;
  } | null;
  appliedIndex: string | null;
  indexIsOverride: boolean;
  matchCount: number;
  rejectedCount: number;
  unpricedCount: number;
  cards: {
    best_price?: LensRecommendCard;
    optimal?: LensRecommendCard;
    premium?: LensRecommendCard;
  };
  pricesIncludeWholesale: boolean;
  managerCheckRequired: boolean;
  catalogueSize: number;
  disclaimer: string;
}

export async function fetchLensRecommendation(
  query: LensRecommendQuery,
  signal?: AbortSignal,
): Promise<LensRecommendResponse> {
  const params = new URLSearchParams({
    odSph: query.odSph,
    odCyl: query.odCyl,
    osSph: query.osSph,
    osCyl: query.osCyl,
  });
  if (query.index) params.set("index", query.index);
  if (query.lensType) params.set("lensType", query.lensType);
  if (query.tint) params.set("tint", query.tint);
  if (query.brand) params.set("brand", query.brand);

  const res = await apiFetch(getStoreApiUrl(`lens_recommend.php?${params.toString()}`), {
    signal,
  });
  if (!res.ok) throw new Error(`lens_recommend ${res.status}`);
  return (await res.json()) as LensRecommendResponse;
}
