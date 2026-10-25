import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("checkout is a step-by-step flow with Далее and Назад, not independent accordions", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  assert.match(checkout, /CHECKOUT_STEPS/);
  assert.match(checkout, />\s*Далее\s*</);
  assert.match(checkout, />\s*Назад\s*</);
  assert.match(checkout, /ProgressSteps current=\{PROGRESS_INDEX\[step\]\}/);
  assert.doesNotMatch(checkout, /const toggle = /);
});

test("city is searched through the location endpoint, not a dead input", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  const autocomplete = await read("../src/components/CityAutocomplete.tsx");
  assert.match(checkout, /<CityAutocomplete/);
  assert.match(autocomplete, /searchLocations\(/);
  assert.doesNotMatch(checkout, /setCitySearch/);
});

test("delivery shows the calculated period only, never an invented one", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  assert.doesNotMatch(checkout, /7-8 дней/);
  assert.match(checkout, /Promise\.allSettled/);
});

test("the CDEK track number field is gone", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  const api = await read("../src/lib/api/bitrix.ts");
  assert.doesNotMatch(checkout, /Трек-номер|trackNumber/);
  assert.doesNotMatch(api, /trackNumber/);
});

test("phone input keeps the +7 prefix through the shared mask", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  assert.match(checkout, /formatPhone\(value\)/);
});

test("the cart toast no longer covers the drawer button and the messenger hides behind the cart", async () => {
  const product = await read("../src/routes/catalog_s.$category.$slug.tsx");
  const messenger = await read("../src/components/MessengerFAB.tsx");
  assert.doesNotMatch(product, /toast\.success\(`«\$\{product\.name\}» добавлен в корзину`\)/);
  assert.match(messenger, /useCart\(\(state\) => state\.isOpen\)/);
});

test("the city search starts empty and delivery is not preselected", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  assert.match(checkout, /selectedLabel=\{location\?\.code \? location\.label : ""\}/);
  assert.match(checkout, /useState<DeliveryCode \| null>\(null\)/);
  assert.match(checkout, /Не выбрана/);
});

test("the delivery price shows the VAT that is already included", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  assert.match(checkout, /включён в доставку/);
  assert.match(checkout, /\(price \* rate\) \/ \(100 \+ rate\)/);
});
