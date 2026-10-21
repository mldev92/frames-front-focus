import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../src/lib/api/bitrix.ts", import.meta.url), "utf8");

test("lightweight catalog cards never populate the product-detail cache", () => {
  assert.doesNotMatch(source, /function cacheProducts\s*\(/);
  assert.equal(source.match(/productDetailCache\.set\(/g)?.length, 1);
  assert.match(source, /apiFetch\(url\(`product\.php[\s\S]+?productDetailCache\.set\(/);
});
