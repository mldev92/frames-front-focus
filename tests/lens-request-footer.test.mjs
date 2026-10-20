import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const wizard = await readFile(
  new URL("../src/components/LensWizard/LensWizard.tsx", import.meta.url),
  "utf8",
);

test("successful lens request replaces the footer link with a saved status", () => {
  assert.match(wizard, /<LensRequestForm draft=\{requestDraft\} onSent=\{onRequestSaved\} \/>/);
  const savedState = wizard.indexOf("requestSaved ? (");
  const savedLabel = wizard.indexOf("Заявка сохранена", savedState);
  const requestLink = wizard.indexOf('href="#lens-request-form"', savedLabel);
  assert.ok(savedState >= 0 && savedLabel > savedState && requestLink > savedLabel);
  assert.match(wizard, /if \(step !== LAST_STEP\) setRequestSaved\(false\)/);
});
