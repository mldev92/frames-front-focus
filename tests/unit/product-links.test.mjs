import assert from "node:assert/strict";
import test from "node:test";
import { productCardHref, catalogHref, regionalCatalogHref } from "../../src/data/categories.ts";

const product = { category: "opravy", slug: "oprava_okula_ok_1190_f3" };
test("product cards prefer the product URL over the currently browsed category", () => {
  assert.equal(productCardHref({ ...product, canonicalPath: "/catalog_s/opravy/zhenskie/oprava_okula_ok_1190_f3/" }, "spb", "/catalog_s/opravy/"),
    "/catalog_s/opravy/zhenskie/oprava_okula_ok_1190_f3/");
});
test("cards without a catalog context preserve Novokuznetsk", () => {
  assert.equal(productCardHref(product, "nvk"), "/catalog_n/opravy/oprava_okula_ok_1190_f3/");
});
test("a canonical URL is not rewritten into a different city catalog", () => {
  assert.equal(productCardHref({ ...product, canonicalPath: "/catalog_s/opravy/oprava_okula_ok_1190_f3/" }, "spb", "/catalog_n/opravy/"),
    "/catalog_s/opravy/oprava_okula_ok_1190_f3/");
});
test("Novokuznetsk contact-lens categories use the actual regional section", () => {
  assert.equal(catalogHref("kontaktnye-linzy", "nvk"), "/catalog_n/kontaktnye_linzy/");
  assert.equal(regionalCatalogHref("/catalog_s/kontaktnye_linzy_/toricheskie/", "nvk"), "/catalog_n/kontaktnye_linzy/toricheskie/");
  assert.equal(productCardHref({ category: "kontaktnye-linzy", slug: "lens" }, "nvk"), "/catalog_n/kontaktnye_linzy/lens/");
});
test("the promotional product resolves to the actual Novokuznetsk SKU URL", () => {
  assert.equal(regionalCatalogHref("https://optika100.com/catalog_s/kontaktnye_linzy_/dlya_kontrolya_miopii/misight_1_day_90sht_/", "nvk"), "/catalog_n/kontaktnye_linzy/dlya_kontrolya_miopii/misight_1_day_90sht_8359/");
});
test("explicit editorial destination is shared by photo and title", () => {
  assert.equal(productCardHref(product, "spb", "/catalog_s/opravy/", "/catalog_s/special/product/"), "/catalog_s/special/product/");
});

test("colored lens landing cards keep the full native category tree", () => {
  const lens = {category:"kontaktnye-linzy",slug:"air_optix_colors",canonicalPath:"/catalog_s/kontaktnye_linzy_/tsvetnye/air_optix_colors/"};
  assert.equal(productCardHref(lens,"spb"),lens.canonicalPath);
});
