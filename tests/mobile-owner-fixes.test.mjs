import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("appointment step shows no internal ANZ wording", async () => {
  const modal = await read("../src/components/AppointmentModal.tsx");
  assert.doesNotMatch(modal, /ANZ/i);
});

test("appointment step keeps Назад/Продолжить pinned and shows time as compact chips", async () => {
  const modal = await read("../src/components/AppointmentModal.tsx");
  assert.match(modal, /flex h-full min-h-0 w-full min-w-0 flex-col px-4 pb-4 pt-4/);
  assert.match(modal, /<Footer className="mt-3 shrink-0/);
  assert.match(modal, /grid grid-cols-3 gap-2/);
  // календарь остаётся на месте, пока грузится время выбранного дня
  assert.match(modal, /const hasAvailableDates = availableDateKeyList\.length > 0/);
});

test("calendar day cells do not clip the selected day in the last column", async () => {
  const calendar = await read("../src/components/ui/calendar.tsx");
  assert.doesNotMatch(calendar, /last-child\[data-selected=true\]/);
});

test("contact-lens product page puts the purchase card right after the photo on mobile", async () => {
  const page = await read("../src/routes/catalog_s.$category.$slug.tsx");
  assert.match(page, /max-lg:contents/);
  assert.match(page, /max-lg:order-1/);
  assert.match(page, /max-lg:order-2/);
  assert.match(page, /max-lg:order-3/);
  assert.match(page, /const showStickyBuyBar = !isLens/);
  assert.match(page, /\{showStickyBuyBar && \(/);
});

test("cart lines keep quantity and price on their own row so item text is readable", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  const prescription = await read("../src/components/CartPrescription.tsx");
  const drawer = await read("../src/components/layout/CartDrawer.tsx");
  assert.match(checkout, /alignItems: "flex-start"/);
  assert.doesNotMatch(checkout, /minWidth: "72px"/);
  assert.match(prescription, /sameForBoth/);
  assert.match(drawer, /<CartPrescription line=\{l\} \/>/);
  assert.doesNotMatch(drawer, /font-medium truncate/);
});
