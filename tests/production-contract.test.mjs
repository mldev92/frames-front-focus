import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("production routing preserves backend-owned prefixes", async () => {
  const htaccess = await readFile(new URL("../deploy/production.htaccess", import.meta.url), "utf8");
  assert.match(htaccess, /\^\(api\|auth\|bitrix\|sale\|upload\|local\|order\)/);
});

test("checkout uses the native order endpoint and correct privacy route", async () => {
  const checkout = await readFile(new URL("../src/routes/checkout.tsx", import.meta.url), "utf8");
  assert.match(checkout, /createOrder\(/);
  assert.match(checkout, /politika-konfidentsialnosti/);
  assert.doesNotMatch(checkout, /toast\.success\("Заказ оформлен/);
});

test("cart lines retain authoritative product identity", async () => {
  const cart = await readFile(new URL("../src/lib/store/cart.ts", import.meta.url), "utf8");
  for (const field of ["productId", "category", "catalogNamespace", "canonicalPath", "authoritativeBasePrice"]) {
    assert.match(cart, new RegExp(field));
  }
});

test("production builds use the checked-in article snapshot", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const articles = JSON.parse(
    await readFile(new URL("../src/data/articles-content.json", import.meta.url), "utf8"),
  );
  assert.doesNotMatch(pkg.scripts["build:production"], /content:production/);
  assert.ok(Object.keys(articles).length >= 10);
});
