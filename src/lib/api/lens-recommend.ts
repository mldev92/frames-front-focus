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
   * The «Покрытие» step. Since the 2026-09 rework a PREFERENCE, not a filter:
   * the engine ranks offers by distance to this class and never drops one for
   * having a different (or unclassified) coating — the owner's own ruling.
   */
  coatingTier?: "basic" | "comfort" | "premium";
  /**
   * «Минеральные линзы» on the «Толщина» step. A material, not an index —
   * ZEISS prices its glass from 1.5 to 1.9 against the same index field as
   * its plastic — so it REPLACES `index`, and the endpoint accepts it as the
   * sole narrowing filter in the «рецепта нет» branch.
   */
  material?: "mineral";
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
  /**
   * spherical | aspheric | freeform | unknown. 'freeform' is an individually
   * computed single-vision design — ZEISS ClearView, HOYA iDentity, Essilor
   * f-360 — which is neither of the two words the «Дизайн» step offers, so the
   * server never puts one on a card for a customer who picked a surface.
   */
  surface: "spherical" | "aspheric" | "freeform" | "unknown";
  /**
   * Which catalogue the offer comes from: 'sklad' (stock) or 'rx'
   * (prescription), null for MyoCare, which is neither. Distinct from
   * `availability`, which is where the stock physically sits — half the stock
   * rows say 'order' because the supplier left the warehouse cell blank, and
   * captioning those «рецептурная» was wrong on 105 of 208 rows.
   */
  channel: "sklad" | "rx" | null;
  availability: string;
  /** basic | comfort | premium | unknown — the coating's purchase class. */
  coatingTier: string;
  retailPriceRub: number | null;
  priceRub: number | null;
  priceIsWholesale: boolean;
  rxFit: "yes" | "no" | "unknown";
  needsManagerCheck: boolean;
  /**
   * What this card gives over the cheaper card below it, as tags the wizard
   * renders into Russian. Empty on the base card. A card above the base cannot
   * exist without at least one — that is what stopped «Премиум» from meaning
   * "the most expensive row that survived the filters".
   */
  advantagesOver: LensAdvantage[];
  /**
   * The owner's own copy from «Правила подборщика», shown verbatim — empty
   * string until she fills the row (see o_lens_coating_text_of /
   * o_lens_line_description_of). `customerText` describes the coating
   * («Что писать клиенту»), `lineDescription` the lens line («Описание для
   * клиента»). Render nothing when empty; never a placeholder.
   */
  customerText: string;
  lineDescription: string;
  /**
   * The owner's per-line «За что доплата» and per-treatment «Что писать
   * клиенту» from «Правила подборщика» — verbatim, '' until she fills the row.
   * Shown in the detail dialog; the card keeps its comparative advantage tags.
   */
  lineAdvantage: string;
  treatmentText: string;
}

/** @see o_lens_advantages_over() in _lens_recommend.php */
export type LensAdvantage =
  | "coating_tier"
  | "chosen_tier"
  | "feature_blue"
  | "feature_driving"
  | "surface"
  | "stock";

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
  if (query.material) params.set("material", query.material);
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
