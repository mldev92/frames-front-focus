import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { FRAME_BRAND_LANDINGS } from "../src/data/frame-brand-landings.ts";
import { FRAME_CATEGORY_LANDINGS } from "../src/data/frame-category-landings.ts";

test("full search always resolves to the query-aware shell before a static empty page", async () => {
  const config = await readFile(new URL("../deploy/production.htaccess", import.meta.url), "utf8");
  const rule = "RewriteRule ^search/?$ /o100_frontend_current/_shell.html [END]";
  assert.ok(config.includes(rule));
  assert.ok(config.indexOf(rule) < config.indexOf("RewriteCond %{DOCUMENT_ROOT}/o100_frontend_current/$1 -f"));
});

test("new global-search links use the shell only on the supported category roots", async () => {
  const config = await readFile(new URL("../deploy/production.htaccess", import.meta.url), "utf8");
  for (const [parameter, positive, negative] of [
    ["lensQuery", ["catalog_s/linzy_dlya_ochkov/", "catalog_n/linzy_dlya_ochkov"], ["catalog_s/opravy/", "catalog_s/linzy_dlya_ochkov/product/"]],
    ["brand", ["catalog_s/opravy/", "catalog_n/solntsezashchitnye_ochki/", "catalog_s/kontaktnye_linzy_/"], ["catalog_s/opravy/product/", "api/store/products.php"]],
  ]) {
    const rule = config.match(new RegExp(`RewriteCond %\\{QUERY_STRING\\} \\(\\^\\|&\\)${parameter}= \\[NC\\]\\r?\\nRewriteRule (.+) /o100_frontend_current/_shell\\.html \\[END\\]`));
    assert.ok(rule, parameter);
    const path = new RegExp(rule[1]);
    for (const value of positive) assert.ok(path.test(value), value);
    for (const value of negative) assert.ok(!path.test(value), value);
    assert.ok(rule.index < config.indexOf("RewriteCond %{DOCUMENT_ROOT}/o100_frontend_current/$1 -f"));
  }
});

test("filtered frame landings use the shell before static HTML resolution", async () => {
  const config = await readFile(new URL("../deploy/production.htaccess", import.meta.url), "utf8");
  const rule = config.match(/RewriteCond %\{QUERY_STRING\} (.+) \[NC\]\r?\nRewriteRule (.+) \/o100_frontend_current\/_shell\.html \[END\]/);
  assert.ok(rule);
  const query = new RegExp(rule[1], "i");
  const path = new RegExp(rule[2]);
  const usesShell = (url) => {
    const parsed = new URL(url, "https://optika100.com");
    return query.test(parsed.search.slice(1)) && path.test(parsed.pathname.slice(1));
  };
  for (const url of [
    ...FRAME_BRAND_LANDINGS.map(b=>`/catalog_s/opravy/${b.slug}/?page=2`),
    ...FRAME_CATEGORY_LANDINGS.map(c=>`/catalog_s/${c.path}/?priceMin=4000`),
    "/catalog_s/opravy/zhenskie/?brand=GUESS",
    "/catalog_s/opravy/lions-heart/?page=2",
    "/catalog_s/opravy/lions-heart/?utm_source=test&gender=Женские",
    "/catalog_s/opravy/zhenskie/?priceMin=4000",
  ]) assert.ok(usesShell(url), url);
  for (const url of [
    "/catalog_s/opravy/zhenskie/",
    "/catalog_s/opravy/lions-heart/?utm_source=test",
    "/catalog_s/opravy/lions-heart/product/?page=2",
    "/catalog_n/opravy/zhenskie/?brand=GUESS",
    "/catalog_s/opravy/unknown-brand/?page=2",
    "/api/store/products.php?brand=GUESS",
  ]) assert.ok(!usesShell(url), url);
  assert.ok(rule.index < config.indexOf("RewriteCond %{DOCUMENT_ROOT}/o100_frontend_current/$1/index.html -f"));
});
