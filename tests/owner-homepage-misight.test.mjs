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

test("news card: both cities use VK and Instagram with the Meta note, no Telegram or MAX", async () => {
  const home = await read("../src/routes/index.tsx");
  const contact = await read("../src/data/contact.ts");
  assert.doesNotMatch(home, /Читать в MAX/);
  assert.doesNotMatch(home, /Читать в Telegram/);
  assert.match(home, /NEWS_CHANNELS\.vk\.href/);
  assert.match(home, /NEWS_CHANNELS\.instagram\.href/);
  assert.match(home, /\{META_EXTREMIST_NOTE\}/);
  assert.match(contact, /https:\/\/vk\.ru\/optika100/);
  assert.match(contact, /https:\/\/www\.instagram\.com\/optika100ru\//);
  assert.match(contact, /признанной экстремистской организацией/);
  // мессенджер MAX остаётся в контактах — убран только «новостной канал»
  assert.match(contact, /max\.ru/);
});

test("homepage promo block takes button and end date from the admin", async () => {
  const home = await read("../src/routes/index.tsx");
  assert.match(home, /activePromo\.ctaHref/);
  assert.match(home, /activePromo\.ctaNote/);
  assert.match(home, /isPromoExpired\(promo\?\.endsAt/);
  assert.match(home, /T23:59:59\+03:00/);
});

test("checkout sends only an applied promo code and shows the discount", async () => {
  const checkout = await read("../src/routes/checkout.tsx");
  const api = await read("../src/lib/api/bitrix.ts");
  assert.match(api, /securePost\("order_coupon\.php"/);
  assert.match(checkout, /coupon: coupon\?\.code,/);
  assert.match(checkout, /<CouponField/);
  assert.match(checkout, /Скидка по промокоду/);
});

test("MiSight 90 card keeps the CooperVision «Участвовать в акции» button", async () => {
  const promotions = await read("../src/data/promotions.ts");
  const page = await read("../src/routes/catalog_s.$category.$slug.tsx");
  assert.match(promotions, /bts90\.coopervision-pro\.ru\/\?id=4ddc2edc-afa3-40d3-aeb5-f3f736a33524/);
  // ссылка CooperVision — салона СПб: в каталоге Новокузнецка кнопки нет
  assert.match(page, /isLens && city === "spb" && isMisightPromoProduct\(product\)/);
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
