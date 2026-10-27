import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("homepage lens block shows only catalogue prices, no invented −10%", async () => {
  const home = await read("../src/routes/index.tsx");
  assert.doesNotMatch(home, /−10% на контактные линзы/);
  assert.doesNotMatch(home, /discountPercent: 10/);
  // цена карточки — цена товара, а не «цена минус процент акции»
  assert.match(home, /formatPrice\(product\.price\)/);
  assert.doesNotMatch(home, /strike \* \(1 - /);
});

test("news card links to Telegram in every city, MAX is gone from it", async () => {
  const home = await read("../src/routes/index.tsx");
  assert.doesNotMatch(home, /Читать в MAX/);
  assert.match(home, /Читать в Telegram/);
});

test("MiSight 90 card keeps the CooperVision «Участвовать в акции» button", async () => {
  const promotions = await read("../src/data/promotions.ts");
  const page = await read("../src/routes/catalog_s.$category.$slug.tsx");
  assert.match(promotions, /bts90\.coopervision-pro\.ru\/\?id=4ddc2edc-afa3-40d3-aeb5-f3f736a33524/);
  assert.match(page, /isMisightPromoProduct\(product\)/);
  assert.match(page, /MISIGHT_PROMO\.ctaHref/);

  const { isMisightPromoProduct } = await import("../src/data/promotions.ts").catch(() => ({}));
  if (!isMisightPromoProduct) return; // node без strip-types — достаточно проверок по тексту
  assert.equal(isMisightPromoProduct({ slug: "misight_1_day_90sht_", name: "MiSight 1 day (90шт.)" }), true);
  assert.equal(isMisightPromoProduct({ slug: "misight_1_day_90sht_8359", name: "MiSight 1 day (90шт.)" }), true);
  assert.equal(isMisightPromoProduct({ slug: "misight_1_day_30sht_670", name: "MiSight 1 day (30шт.)" }), false);
  assert.equal(isMisightPromoProduct({ slug: "ultra_flex_premier_3_sht_", name: "Ultra Flex (90шт.)" }), false);
});

test("header heart opens the favorites page and the route ships to production", async () => {
  const header = await read("../src/components/layout/Header.tsx");
  const manifest = await read("../scripts/generate-production-manifest.mjs");
  const cart = await read("../src/lib/store/cart.ts");
  assert.match(header, /to="\/personal\/favorites"/);
  assert.match(manifest, /"\/personal\/favorites\/"/);
  // отложенный товар помнит город каталога
  assert.match(cart, /savedCities: \{ \.\.\.savedCities, \[slug\]: useCityStore\.getState\(\)\.city \}/);
});
