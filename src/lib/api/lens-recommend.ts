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
  /**
   * The «Дизайн» step. The endpoint drops only designs that plainly contradict
   * this — the price lists carry no design column, so a quarter of the
   * catalogue is unclassifiable and must not be filtered away.
   */
  design?: "spherical" | "aspheric" | "progressive" | "office";
  /**
   * Ask for one page of the whole match list — what «Посмотреть все варианты»
   * opens — alongside the three cards. Off by default: the endpoint's response
   * is unchanged without it.
   */
  list?: boolean;
  offset?: number;
  /** Server caps this at 100. */
  limit?: number;
  sort?: LensListSort;
}

export type LensListSort = "price_asc" | "price_desc";

export interface LensRecommendCard {
  /**
   * Identifies the OFFER, not the catalogue row: the supplier sheets price the
   * same product in several prescription bands, and the id ignores the band.
   * The three cards carry the same ids as the list rows, so a row can tell it
   * is one of them.
   */
  id: string;
  supplier: string;
  line: string;
  index: number | null;
  coating: string;
  treatment: string;
  /**
   * progressive | office | bifocal | single | unknown, read out of the product
   * name. 'unknown' for the ~24 % of the catalogue that is a bare material
   * name — show nothing there rather than guessing.
   */
  design: "progressive" | "office" | "bifocal" | "single" | "unknown";
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
  /**
   * Present only when the query asked for `list`. `listTotal` is smaller than
   * `matchCount`: the latter counts catalogue positions, this counts what a
   * customer can actually tell apart.
   */
  matches?: LensRecommendCard[];
  listTotal?: number;
  listOffset?: number;
  listLimit?: number;
  listSort?: LensListSort;
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
  if (query.design) params.set("design", query.design);
  if (query.list) {
    params.set("list", "1");
    if (query.offset) params.set("offset", String(query.offset));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.sort) params.set("sort", query.sort);
  }

  const res = await apiFetch(getStoreApiUrl(`lens_recommend.php?${params.toString()}`), {
    signal,
  });
  if (!res.ok) throw new Error(`lens_recommend ${res.status}`);
  return (await res.json()) as LensRecommendResponse;
}
