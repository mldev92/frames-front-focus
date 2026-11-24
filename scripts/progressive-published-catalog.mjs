import { readFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { filterLensLines } from "../src/lib/lens-lines-filter.ts";
import {
  PROGRESSIVE_CATALOG,
  PROGRESSIVE_LENS_TYPE,
  PROGRESSIVE_SECTION,
} from "../src/lib/progressive-lenses.ts";

export const progressiveDataFile = "deploy/progressive-published-catalog.json";
export const progressivePage = PROGRESSIVE_CATALOG;

export function loadProgressiveCatalog(backendSha, parentSha, enabled = process.env.O100_PROGRESSIVE_CATALOG === "1") {
  if (!enabled) return null;
  const { backend, parent, capturedAt, cards } = JSON.parse(readFileSync(progressiveDataFile, "utf8"));
  const age = Date.now() - Date.parse(capturedAt);
  if (backend !== backendSha || parent !== parentSha || !(age >= 0 && age < 24 * 3600000)
    || !Array.isArray(cards) || !cards.length
    || cards.some(({ id, designs }) => typeof id !== "string" || !id || !designs.includes("progressive"))
    || new Set(cards.map(({ id }) => id)).size !== cards.length
    || !isDeepStrictEqual(filterLensLines(cards, { lensType: [PROGRESSIVE_LENS_TYPE] }), cards)) {
    throw Error("Invalid reviewed progressive lens catalog data");
  }
  return cards;
}

export function amendProgressiveMatches(matches, route, cards) {
  if (!cards || route !== progressivePage) return matches;
  const catalogs = matches.filter(({ data }) =>
    data?.kind === "catalog" && data.sectionPath === PROGRESSIVE_SECTION);
  if (catalogs.length !== 1 || catalogs[0].data.result?.state !== "ok") {
    throw Error("Unexpected published progressive category loader data");
  }
  catalogs[0].data.result = { state: "lens_lines", initialCards: cards };
  return matches;
}
