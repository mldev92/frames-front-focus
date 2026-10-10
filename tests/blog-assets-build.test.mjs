import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const script = await readFile(
  new URL("../scripts/localize-blog-assets.mjs", import.meta.url),
  "utf8",
);

test("production asset mirroring is bounded and preserves tracked fallbacks", () => {
  assert.ok(script.includes("AbortSignal.timeout(FETCH_TIMEOUT_MS)"));
  assert.ok(script.includes("FETCH_ATTEMPTS = 3"));
  assert.ok(script.includes("Keeping tracked mirror"));
  assert.ok(!script.includes("await rm("));
});
