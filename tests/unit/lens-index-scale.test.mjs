import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateSphericalEquivalent,
  getRecommendedLensIndex,
} from "../../src/components/LensWizard/logic.ts";

const eye = (sph, cyl) => ({ sph: String(sph), cyl: String(cyl) });
const indexFor = (absSe) => getRecommendedLensIndex(eye(-absSe, 0), eye(0, 0)).index;

test("SE is SPH + CYL/2, computed per eye (ТЗ §2.1)", () => {
  assert.equal(calculateSphericalEquivalent(eye(-2.0, -1.0)), -2.5);
  assert.equal(calculateSphericalEquivalent(eye("+3.00", "-0.50")), 2.75);
  assert.equal(calculateSphericalEquivalent(eye(0, 0)), 0);
  assert.equal(calculateSphericalEquivalent(eye("", "0")), null);
  assert.equal(calculateSphericalEquivalent(eye("abc", "0")), null);
});

test("a blank CYL means no cylinder, not an incomplete prescription (owner report, 2026-09-01)", () => {
  assert.equal(calculateSphericalEquivalent(eye(-2.0, "")), -2.0);
  assert.equal(calculateSphericalEquivalent({ sph: "-2.0", cyl: "  " }), -2.0);
  // SPH is still required — CYL cannot stand in for it.
  assert.equal(calculateSphericalEquivalent(eye("", "")), null);
  // A CYL the customer actually typed, but that is not a number, still blocks.
  assert.equal(calculateSphericalEquivalent(eye(-2.0, "abc")), null);
});

test("the governing value is the larger |SE| of the two eyes", () => {
  const r = getRecommendedLensIndex(eye("+8.00", 0), eye("+1.00", 0));
  assert.equal(r.governingAbsSphericalEquivalent, 8);
  assert.equal(r.index, "1.67");

  // Sign must not matter — only magnitude.
  assert.equal(getRecommendedLensIndex(eye(-8, 0), eye(-1, 0)).index, "1.67");
});

test("ТЗ §2.1 published bands map to the correct index", () => {
  for (const se of [0, 0.25, 1.0, 1.75]) assert.equal(indexFor(se), "1.50", `ABS_SE ${se}`);
  for (const se of [2.0, 2.5, 3.5, 3.75]) assert.equal(indexFor(se), "1.60", `ABS_SE ${se}`);
  // Owner decision 2026-08-22: the scale is capped at 1.67; 1.74 is never
  // recommended because it is stocked in only some lens categories.
  for (const se of [4.0, 5.0, 7.0, 7.5]) assert.equal(indexFor(se), "1.67", `ABS_SE ${se}`);
  for (const se of [8.0, 9.0, 12.0, 20.0]) assert.equal(indexFor(se), "1.67", `ABS_SE ${se}`);
});

test("ТЗ §2.1 gap bands resolve upward, not downward", () => {
  // 1.76–1.99 → 1.60
  for (const se of [1.76, 1.9, 1.99]) assert.equal(indexFor(se), "1.60", `ABS_SE ${se}`);

  // 3.76–3.99 → 1.67. Regression guard: this band previously returned 1.60
  // because the boundary was written as `< 4` instead of `<= 3.75`.
  for (const se of [3.76, 3.9, 3.99]) assert.equal(indexFor(se), "1.67", `ABS_SE ${se}`);
});

test("band edges are exact", () => {
  assert.equal(indexFor(1.75), "1.50");
  assert.equal(indexFor(1.76), "1.60");
  assert.equal(indexFor(3.75), "1.60");
  assert.equal(indexFor(3.76), "1.67");
  assert.equal(indexFor(7.99), "1.67");
  assert.equal(indexFor(8.0), "1.67");
});

test("beta acceptance examples, as revised by the owner's 1.74 exclusion", () => {
  // OD +8.00 / OS +1.00 previously gave 1.74. The owner excluded 1.74 from
  // recommendations on 2026-08-22, so this case now resolves to 1.67.
  assert.equal(getRecommendedLensIndex(eye("+8.00", "0"), eye("+1.00", "0")).index, "1.67");
  // OD +7.75 / OS +1.00 → 1.67 for both eyes (unchanged)
  assert.equal(getRecommendedLensIndex(eye("+7.75", "0"), eye("+1.00", "0")).index, "1.67");
});

test("7.51–7.99, left undefined by the ТЗ, is settled by the 1.67 cap", () => {
  // The ТЗ table jumps from "4.00–7.50" to "от 8.00" without covering this band.
  // The owner's 2026-08-22 cap resolves it: everything from 3.76 up is 1.67.
  assert.equal(indexFor(7.51), "1.67");
  assert.equal(indexFor(7.99), "1.67");
});

test("incomplete prescriptions yield no recommendation", () => {
  assert.equal(getRecommendedLensIndex(eye("", ""), eye("-2", "0")), null);
  // A blank SPH still blocks — only CYL is optional.
  assert.equal(getRecommendedLensIndex(eye("-2", "0"), eye("", "0")), null);
});

test("a blank CYL on either eye still yields a recommendation", () => {
  const r = getRecommendedLensIndex(eye("-2", "0"), eye("-2", ""));
  assert.notEqual(r, null);
  assert.equal(r.osSphericalEquivalent, -2);
  assert.equal(r.index, "1.60");
});
