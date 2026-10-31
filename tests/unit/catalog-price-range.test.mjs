import assert from "node:assert/strict";
import test from "node:test";

import { normalizePriceRangeDraft } from "../../src/lib/catalog-price-range.ts";

const bounds = { min: 850, max: 20_000 };

test("blank price fields restore the corresponding catalog boundary", () => {
  assert.deepEqual(normalizePriceRangeDraft(["", ""], bounds, [1_000, 10_000]), [850, 20_000]);
  assert.deepEqual(
    normalizePriceRangeDraft(["1000", ""], bounds, [1_000, 10_000]),
    [1_000, 20_000],
  );
});

test("price drafts clamp to catalog boundaries and reject inverted ranges", () => {
  assert.deepEqual(
    normalizePriceRangeDraft(["100", "25000"], bounds, [1_000, 10_000]),
    [850, 20_000],
  );
  assert.deepEqual(
    normalizePriceRangeDraft(["9000", "3000"], bounds, [1_000, 10_000]),
    [1_000, 10_000],
  );
});
