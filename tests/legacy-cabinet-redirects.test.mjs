import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("старые списки кабинета редиректятся на React-страницы до нативного правила", async () => {
  const rules = (await readFile("deploy/production.htaccess", "utf8")).replace(/\r\n/g, "\n");
  const native = rules.indexOf("RewriteRule ^personal/(order|payment|profile)(/|$) - [L]");
  assert.ok(native > 0, "нативное правило должно остаться");
  for (const rule of [
    "RewriteRule ^personal/order/make/?$ /checkout [R=301,L]",
    "RewriteRule ^personal/order/?$ /personal/orders [R=301,L]",
    "RewriteRule ^personal/profile/?$ /personal/private [R=301,L]",
  ]) {
    const at = rules.indexOf(rule);
    assert.ok(at > 0 && at < native, `${rule} должно стоять до нативного правила`);
  }
  // Только точные адреса: оплата и детали заказа остаются в Bitrix.
  assert.ok(!/RewriteRule \^personal\/\(?(order|payment|profile)[^\n]*R=301/.test(rules.replace(/\^personal\/(order\/make|order|profile)\/\?\$/g, "")));
});

test("неизвестные адреса /personal/ отдают 404 после React-правил", async () => {
  const rules = (await readFile("deploy/production.htaccess", "utf8")).replace(/\r\n/g, "\n");
  const rule = "RewriteRule ^personal/(?!orders/[^/]).+ - [R=404,END]";
  const at = rules.indexOf(rule);
  assert.ok(at > 0, "правило 404 для /personal/ должно быть");
  assert.ok(at > rules.indexOf("RewriteRule ^(.+?)/?$ /o100_frontend_current/$1/index.html [END]"), "после React-правил, иначе закроет /personal/orders");
  const re = new RegExp("^personal/(?!orders/[^/]).+");
  for (const hit of ["personal/mimi/", "personal/foo/bar"]) assert.ok(re.test(hit), hit);
  for (const miss of ["personal/orders/6473"]) assert.ok(!re.test(miss), miss);
});

test("мёртвые адреса auth/sale/subscribe/cart редиректятся до правила пропуска в Bitrix", async () => {
  const rules = (await readFile("deploy/production.htaccess", "utf8")).replace(/\r\n/g, "\n");
  const pass = rules.indexOf("RewriteRule ^(api|auth|bitrix|sale|upload|local|order)(/|$) - [L]");
  for (const rule of [
    "RewriteRule ^auth/(registration|register|login|forgot-password|change-password)/?$ /auth/ [R=301,L]",
    "RewriteRule ^sale/?$ / [R=301,L]",
  ]) {
    const at = rules.indexOf(rule);
    assert.ok(at > 0 && at < pass, `${rule} должно стоять до правила пропуска`);
  }
  assert.ok(rules.includes("RewriteRule ^personal/subscribe/?$ /personal [R=301,L]"));
  assert.ok(rules.includes("RewriteRule ^personal/cart/?$ /basket [R=301,L]"));
  // /sale/payment/ не затронут: редирект только для точного /sale/.
  assert.ok(!rules.includes("RewriteRule ^sale/"+"(.+)"));
});
