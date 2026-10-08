import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const data = await readFile(
  new URL("../src/components/LensWizard/data.ts", import.meta.url),
  "utf8",
);
const wizard = await readFile(
  new URL("../src/components/LensWizard/LensWizard.tsx", import.meta.url),
  "utf8",
);

test("image purpose is no-prescription, 1.50-only, and spherical-only", () => {
  const imageRule = data.slice(data.indexOf("  image: {"), data.indexOf('  "sun-protection"'));
  assert.match(imageRule, /onlyWithoutPrescription: true/);
  assert.match(imageRule, /designs: \["spherical"\]/);
  for (const id of ["1.56", "trivex-153", "poly-159", "1.60", "1.67", "1.74", "mineral"]) {
    assert.ok(imageRule.includes(`"${id}"`));
  }
  assert.match(wizard, /setRxMode\(PURPOSE_RULES\[v\.id\]\.onlyWithoutPrescription \? "none" : null\)/);
});

test("myopia control keeps 1.59 as a recommendation while retaining customer selection", () => {
  assert.match(wizard, /purpose\?\.id === "myopia-control"/);
  assert.match(wizard, /option\.id === "poly-159"/);
  assert.match(wizard, /setThickness\(option\);\s+setThicknessTouched\(true\);/);
});
