import assert from "node:assert/strict";
import test from "node:test";

import { PURPOSE_RULES } from "../../src/components/LensWizard/data.ts";

test("защита от солнца предлагает фотохромные и солнцезащитные линзы, но не прозрачные", () => {
  assert.deepEqual(PURPOSE_RULES["sun-protection"].allowedLensTypes, ["photochromic", "sun"]);
});
