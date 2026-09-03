import { getStoreApiUrl } from "@/lib/api/bitrix";
import { apiFetch } from "@/lib/api/security";

/**
 * GET /api/store/lens_recommend.php — the three result cards for the wizard's
 * «Результаты» step, priced with the owner's markup scheme on the backend.
 */

export interface LensRecommendQuery {
  /**
   * The prescription — **all four or none**. The endpoint refuses a half-filled
   * one rather than quietly quoting against a filter the customer cannot see.
   *
   * Omitting it is the wizard's «рецепта нет» branch: the answers still price,
   * but nothing can be checked against a manufacturable range, so every result
   * comes back with `rxFit: "unknown"` and `managerCheckRequired`.
   */
  odSph?: string;
  odCyl?: string;
  osSph?: string;
  osCyl?: string;
  /**
   * The «Толщина» pick, e.g. "1.67". Optional with a prescription (the index is
   * computed from it), **required without one** — it is then the only thing
   * left to filter on.
   */
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
   * The «Покрытие» step — a closed positive filter, unlike `design` above: an
   * offer whose coating tier is unreadable is excluded, not passed through,
   * because this is a purchase choice, not a search narrowing.
   */
  coatingTier?: "basic" | "comfort" | "premium";
  /**
   * The «Назначение» step (ТЗ section 3's allowed-design-category table).
   * Same negative-filter shape as `design`, and stacked with it.
   */
  purpose?:
    | "distance"
    | "near"
    | "multifocal"
    | "driving"
    | "computer"
    | "image"
    | "sun-protection"
    | "myopia-control";
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
   * progressive | office | bifocal | single | myopia_control | unknown, read
   * out of the product name (myopia_control by supplier group instead — see
   * o_lens_design_of()). 'unknown' for the ~24 % of the catalogue that is a
   * bare material name — show nothing there rather than guessing.
   */
  design: "progressive" | "office" | "bifocal" | "single" | "myopia_control" | "unknown";
  availability: string;
  retailPriceRub: number | null;
  priceRub: number | null;
  priceIsWholesale: boolean;
  rxFit: "yes" | "no" | "unknown";
  needsManagerCheck: boolean;
}

export interface LensRecommendResponse {
  /** null when the query carried no prescription — nothing was computed. */
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
  const params = new URLSearchParams();
  // All four or none, matching what the endpoint accepts.
  if (query.odSph && query.odCyl && query.osSph && query.osCyl) {
    params.set("odSph", query.odSph);
    params.set("odCyl", query.odCyl);
    params.set("osSph", query.osSph);
    params.set("osCyl", query.osCyl);
  }
  if (query.index) params.set("index", query.index);
  if (query.lensType) params.set("lensType", query.lensType);
  if (query.tint) params.set("tint", query.tint);
  if (query.brand) params.set("brand", query.brand);
  if (query.design) params.set("design", query.design);
  if (query.coatingTier) params.set("coatingTier", query.coatingTier);
  if (query.purpose) params.set("purpose", query.purpose);
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
