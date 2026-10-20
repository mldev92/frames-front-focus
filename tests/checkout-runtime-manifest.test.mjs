import test from "node:test";
import assert from "node:assert/strict";
import { checkoutRuntimeFiles, verifyCheckoutRuntime } from "../scripts/checkout-runtime-manifest.mjs";
test("release rejects incomplete checkout runtime, including SDEK iframe", () => {
  const files = Object.fromEntries(checkoutRuntimeFiles.map(file => [`api/store/${file}`, "a".repeat(64)]));
  assert.doesNotThrow(() => verifyCheckoutRuntime(files));
  for (const file of checkoutRuntimeFiles) {
    const incomplete = { ...files };
    delete incomplete[`api/store/${file}`];
    assert.throws(() => verifyCheckoutRuntime(incomplete), /Checkout runtime dependency missing/);
  }
  assert.throws(() => verifyCheckoutRuntime({ ...files, "api/store/sdek_widget_frame.php": "unchecked" }));
});
