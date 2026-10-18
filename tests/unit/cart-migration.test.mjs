import assert from "node:assert/strict";
import test from "node:test";
import { mergeLegacy, consumeSubmitted, consumeAttemptOnce } from "../../src/lib/cart-migration.ts";
const line = (id, qty = 1, extra = {}) => ({ lineId: id, productId: 10, qty, parameters: {}, ...extra });
test("legacy rows import once even when the server repeats a row", () => {
  const old = line("old", 2, { legacySource: "source" });
  const first = mergeLegacy([line("new")], [], [old, old]);
  assert.equal(first.lines.length, 2);
  assert.deepEqual(mergeLegacy(first.lines, first.importedSources, [old]), first);
});
test("removed imported rows are not resurrected", () => {
  assert.equal(mergeLegacy([], ["source"], [line("old", 2, { legacySource: "source" })]).lines.length, 0);
});
test("different prescriptions and actual offer ids survive import", () => {
  const a = line("a", 2, { legacySource: "a", offerId: 42, parameters: { prescription: { right: { sphere: "-2" } } } });
  const b = line("b", 1, { legacySource: "b", offerId: 43, parameters: { prescription: { left: { sphere: "-3" } } } });
  assert.deepEqual(mergeLegacy([], [], [a,b]).lines, [a,b]);
});
test("order completion removes only submitted quantities", () => {
  assert.deepEqual(consumeSubmitted([line("a", 4),line("b", 2)], [line("a", 2)]), [line("a",2),line("b",2)]);
  assert.deepEqual(consumeSubmitted([line("a", 1)], [line("a", 2)]), []);
});

test("lost response after local cleanup never consumes newly added quantity twice", () => {
  const submitted = [{ lineId: "a", qty: 2 }];
  const first = consumeAttemptOnce([{ lineId: "a", qty: 5 }], [], submitted, "attempt");
  assert.equal(first.lines[0].qty, 3);
  const repeated = consumeAttemptOnce(first.lines, first.consumedAttempts, submitted, "attempt");
  assert.equal(repeated.lines[0].qty, 3);
  assert.deepEqual(repeated.consumedAttempts, ["attempt"]);
});
