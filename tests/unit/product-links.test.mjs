import assert from "node:assert/strict";
import test from "node:test";
import { productCardHref } from "../../src/data/categories.ts";

const product = { category: "opravy", slug: "oprava_okula_ok_1190_f3" };
test("product cards prefer the product URL over the currently browsed category", () => {
  assert.equal(productCardHref({ ...product, canonicalPath: "/catalog_s/opravy/zhenskie/oprava_okula_ok_1190_f3/" }, "spb", "/catalog_s/opravy/"),
    "/catalog_s/opravy/zhenskie/oprava_okula_ok_1190_f3/");
});
test("cards without a catalog context preserve Novokuznetsk", () => {
  assert.equal(productCardHref(product, "nvk"), "/catalog_n/opravy/oprava_okula_ok_1190_f3/");
});
test("an explicit regional catalog overrides the default city", () => {
  assert.equal(productCardHref({ ...product, canonicalPath: "/catalog_s/opravy/oprava_okula_ok_1190_f3/" }, "spb", "/catalog_n/opravy/"),
    "/catalog_n/opravy/oprava_okula_ok_1190_f3/");
});
test("explicit editorial destination is shared by photo and title", () => {
  assert.equal(productCardHref(product, "spb", "/catalog_s/opravy/", "/catalog_s/special/product/"), "/catalog_s/special/product/");
});
