import assert from "node:assert/strict";
import test from "node:test";
import {
  frameLanding,
  frameLandingQuery,
  frameBrandHref,
  frameFacetEntries,
  framePriceRange,
  matchesFrameBrand,
} from "../../src/lib/frame-landing.ts";

test("brand landing enforces its brand while preserving user filters and pagination", () => {
  const query = { page: 2, priceMin: 4000, filters: { brand: ["GUESS"], gender: ["Женские"] } };
  const actual = frameLandingQuery("/opravy/lions-heart/", query);
  assert.deepEqual(actual, { ...query, filters: { brand: ["LION`S HEART"], gender: ["Женские"] } });
  assert.deepEqual(query.filters.brand, ["GUESS"]);
  assert.equal(frameLanding("opravy/lions-heart/product"), undefined);
  assert.equal(frameLanding("opravy/zhenskie"), "women");
});

test("brand search accepts reviewed Cyrillic aliases, punctuation, and Latin substrings", () => {
  for (const [brand, term] of [
    ["GUESS", "гесс"],
    ["Guess", "uEs"],
    ["LION`S HEART", "Lion’s Heart"],
    ["LION`S HEART", "лайонс харт"],
    ["SILHOUETTE", "силуэт"],
    ["STEPPER", "степпер"],
  ]) {
    assert.ok(matchesFrameBrand(brand, term), `${brand}: ${term}`);
  }
  assert.ok(!matchesFrameBrand("GUESS", "каррера"));
  assert.ok(matchesFrameBrand("GUESS", ""));
});

test("brand links encode punctuation and preserve the women's filter scope", () => {
  const url = new URL(frameBrandHref("WAGNER+KUHNER"), "https://optika100.com");
  assert.equal(url.searchParams.get("brand"), "WAGNER+KUHNER");
  assert.equal(url.pathname, "/catalog_s/opravy/zhenskie/");
  assert.equal(frameBrandHref("LION`S HEART"), "/catalog_s/opravy/lions-heart/");
});

test("statistics use full server totals and price bounds instead of the displayed product slice", () => {
  const data = {
    total: 790,
    products: [{ price: 9000 }],
    priceBounds: { min: 1900, max: 35870 },
    facets: { brand: { GUESS: 36, ZERO: 0, LION: 41 } },
  };
  assert.deepEqual(frameFacetEntries(data, "brand"), [
    ["LION", 41],
    ["GUESS", 36],
  ]);
  assert.match(framePriceRange(data), /1\D900/);
  assert.match(framePriceRange(data), /35\D870/);
  assert.equal(framePriceRange({ ...data, total: 0 }), undefined);
  assert.equal(framePriceRange({ ...data, priceBounds: { min: 0, max: 35870 } }), undefined);
});
