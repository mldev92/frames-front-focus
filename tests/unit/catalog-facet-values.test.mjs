import test from "node:test";
import assert from "node:assert/strict";
import { parseFacetValues, serializeFacetValues } from "../../src/lib/catalog-facet-values.ts";

test("filter names containing commas and percent signs survive a URL round trip", () => {
  for (const values of [["1,5 базовая"], ["1,5 базовая", "1,67 ультратонкая"], ["Для близи, для дали", "100%"], ["Low", "High"]]) {
    const query = new URLSearchParams({ thickness: serializeFacetValues(values) });
    assert.deepEqual(parseFacetValues(new URLSearchParams(query.toString()).get("thickness")), values);
  }
  assert.deepEqual(parseFacetValues("Low,High"), ["Low", "High"]);
});
