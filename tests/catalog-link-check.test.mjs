import assert from "node:assert/strict";
import test from "node:test";
import { catalogLinks, redirectPaths } from "../scripts/catalog-link-check.mjs";

test("crawling actual card anchors catches the omitted short Okula URL", () => {
  const canonical = "/catalog_s/opravy/zhenskie/oprava_okula_ok_1190_f3/";
  const short = "/catalog_s/opravy/oprava_okula_ok_1190_f3/";
  const known = new Set([canonical]);
  const links = catalogLinks(`<a href="${short}?color=red&amp;sort=price">Фото</a><a href="${canonical}">Название</a>`);
  assert.deepEqual(links.filter((link) => !known.has(link)), [short]);
});
test("catalog link extraction keeps both regions and ignores external links", () => {
  assert.deepEqual(catalogLinks('<a href="/catalog_n/opravy/test">Товар</a><a href="https://example.com/catalog_s/x/">Внешняя</a>'),
    ["/catalog_n/opravy/test/"]);
  assert.ok(redirectPaths("RedirectMatch 301 ^/catalog_s/kontaktnye_linzy_/test/?$ https://optika100.com/catalog_s/prozrachnye/test/").has("/catalog_s/kontaktnye_linzy_/test/"));
});
