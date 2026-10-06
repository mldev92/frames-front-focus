import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const wizard = await readFile(
  new URL("../src/components/LensWizard/LensWizard.tsx", import.meta.url),
  "utf8",
);

test("both warehouse subtypes use one customer-facing availability label", () => {
  const matches = wizard.match(/label: "В наличии в России"/g) ?? [];
  assert.equal(matches.length, 2);
  assert.ok(!wizard.includes('label: "На складе в Москве"'));
  assert.ok(!wizard.includes('label: "Складская позиция — со склада поставщика"'));
});
