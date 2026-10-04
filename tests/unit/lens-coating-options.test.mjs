import assert from "node:assert/strict";
import test from "node:test";
import { availableCoatingIds } from "../../src/components/LensWizard/logic.ts";

test("фиксированные финиши сохраняются рядом с классами HOYA", () => {
  assert.deepEqual(availableCoatingIds({ basic: 3, comfort: 1, native: 14 }),
    ["basic", "comfort", "native"]);
});
test("только фиксированные финиши: доступен проход без фильтра", () => {
  assert.deepEqual(availableCoatingIds({ native: 13 }), ["native"]);
});
test("пустая выдача не создаёт фиктивный вариант", () => {
  assert.deepEqual(availableCoatingIds({}), []);
  assert.deepEqual(availableCoatingIds({ native: 0, basic: 0 }), []);
});
test("обычные классы и загрузка сохраняют прежнее поведение", () => {
  assert.deepEqual(availableCoatingIds({ basic: 5, premium: 1 }), ["basic", "premium"]);
  assert.deepEqual(availableCoatingIds(null), ["basic", "comfort", "premium"]);
});
