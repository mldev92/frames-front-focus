import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalLensLineFacetValue,
  filterLensLines,
  lensLineFacetCount,
  lensLineFacetOptions,
  lensLineFacetSummary,
  sortLensLines,
} from "../../src/lib/lens-lines-filter.ts";

const card = (overrides = {}) => ({
  id: "base",
  title: "Base Clear",
  supplier: "essilor",
  order: 1,
  fromPriceRub: 5000,
  indexes: [1.5, 1.6],
  treatments: ["Прозрачные"],
  designs: ["single"],
  availability: "warehouse",
  filterData: {
    materials: ["plastic"],
    lensTypes: ["clear"],
    surfaces: ["spherical"],
    purposes: ["distance", "near"],
    tintCategories: ["clear"],
    availability: ["warehouse"],
    coatings: ["Crizal Easy Pro"],
    sphRanges: [{ min: -6, max: 4 }],
    cylMax: 2,
    individual: false,
  },
  ...overrides,
});

const photo = card({
  id: "photo",
  title: "ZEISS PhotoFusion X Grey",
  supplier: "zeiss",
  order: 2,
  fromPriceRub: 9000,
  indexes: [1.67],
  treatments: ["PhotoFusion X Grey"],
  availability: "order",
  filterData: {
    ...card().filterData,
    lensTypes: ["photochromic"],
    tintCategories: ["regular_photochromic"],
    availability: ["order"],
    sphRanges: [{ min: -10, max: 6 }],
    cylMax: 4,
  },
});

const cards = [card(), photo];

test("filters use AND across facets and OR inside one facet", () => {
  assert.deepEqual(
    filterLensLines(cards, { brand: ["ESSILOR", "HOYA"], purpose: ["Для дали"] }).map(
      (item) => item.id,
    ),
    ["base"],
  );
  assert.deepEqual(
    filterLensLines(cards, { brand: ["ESSILOR", "ZEISS"] }).map((item) => item.id),
    ["base", "photo"],
  );
});

test("legacy URL values remain compatible", () => {
  assert.equal(filterLensLines(cards, { thickness: ["1,5 базовая"] }).length, 1);
  assert.equal(filterLensLines(cards, { design: ["Сферические"] }).length, 2);
  assert.equal(filterLensLines(cards, { availability: ["warehouse"] }).length, 1);
  assert.equal(filterLensLines(cards, { brand: ["ZEISS (Германия)"] }).length, 1);
  assert.equal(filterLensLines(cards, { lensType: ["Монофокальный"] }).length, 2);
  assert.equal(
    canonicalLensLineFacetValue("purpose", "Для гаджетов"),
    "Для компьютера и гаджетов",
  );
});

test("prescription filters use imported manufacturable ranges", () => {
  assert.deepEqual(
    filterLensLines(cards, { sphere: ["-8.00"] }).map((item) => item.id),
    ["photo"],
  );
  assert.deepEqual(
    filterLensLines(cards, { cylinder: ["-3.00"] }).map((item) => item.id),
    ["photo"],
  );
});

test("facet counts exclude their own active facet but retain other filters", () => {
  const filters = { brand: ["ESSILOR"], lightTransmission: ["Фотохромная"] };
  assert.equal(lensLineFacetCount(cards, filters, "brand", "ZEISS"), 1);
  assert.equal(lensLineFacetCount(cards, filters, "lightTransmission", "Прозрачная"), 1);
});

test("options, pair-price filtering, and sorting cover the complete 74-card response shape", () => {
  assert.deepEqual(lensLineFacetOptions(cards, "brand"), ["ESSILOR", "ZEISS"]);
  assert.deepEqual(
    filterLensLines(cards, {}, 15000).map((item) => item.id),
    ["photo"],
  );
  assert.deepEqual(
    sortLensLines(cards, "price_desc").map((item) => item.id),
    ["photo", "base"],
  );
  assert.deepEqual(
    sortLensLines(cards, "name").map((item) => item.id),
    ["base", "photo"],
  );
});

test("header summary uses the same canonical facets as the lens-line grid", () => {
  const summary = lensLineFacetSummary(cards);
  assert.equal(summary.total, 2);
  assert.deepEqual(summary.facets.brand, { ESSILOR: 1, ZEISS: 1 });
  assert.equal(summary.facets.lensType?.["Однофокальные"], 2);
  assert.equal(summary.facets.lightTransmission?.["Фотохромная"], 1);
});
