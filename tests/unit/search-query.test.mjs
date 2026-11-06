import assert from "node:assert/strict";
import test from "node:test";
import { canonicalSearchQuery, matchesSearchBrand, searchBrandHref, searchProductHref, fullSearchHref, lensSearchHref } from "../../src/lib/search-query.ts";

test("reviewed aliases work for complete names, prefixes and model numbers", () => {
  for (const [input, expected] of [[" ГЕСС  50245 ", "GUESS 50245"], ["стел", "Stellest"], ["стеллест", "Stellest"], ["Lion’s Heart", "LION`S HEART"], ["лайонс харт SN240988", "LION`S HEART SN240988"], ["Unknown 123", "Unknown 123"]]) {
    assert.equal(canonicalSearchQuery(input), expected);
  }
  assert.equal(canonicalSearchQuery("ст"), "ст");
  assert.equal(canonicalSearchQuery("a".repeat(200)).length, 120);
  assert.equal(canonicalSearchQuery("силуэт " + "a".repeat(200)).length, 120);
  assert.ok(matchesSearchBrand("GUESS", "гес"));
  assert.ok(matchesSearchBrand("GUESS", "ues"));
  assert.ok(!matchesSearchBrand("HUGO", "хуго босс"));
});

test("brand navigation respects category, city, punctuation and the approved landing", () => {
  const brand = { name: "LION`S HEART", category: "opravy" };
  assert.equal(searchBrandHref(brand, "spb"), "/catalog_s/opravy/lions-heart/");
  const nvk = new URL(searchBrandHref(brand, "nvk"), "https://optika100.com");
  assert.equal(nvk.pathname, "/catalog_n/opravy/");
  assert.equal(nvk.searchParams.get("brand"), brand.name);
  const fallback = new URL(searchBrandHref({ name: "GUESS", category: "opravy", searchOnly: true }, "nvk"), "https://optika100.com");
  assert.equal(fallback.pathname, "/search/");
  assert.equal(fallback.searchParams.get("q"), "GUESS");
  assert.equal(fallback.searchParams.get("city"), "nvk");
  const plus = new URL(searchBrandHref({ name: "WAGNER+KUHNER", category: "solntsezashchitnye" }, "spb"), "https://optika100.com");
  assert.equal(plus.searchParams.get("brand"), "WAGNER+KUHNER");
  assert.equal(plus.pathname, "/catalog_s/solntsezashchitnye_ochki/");
});

test("product links preserve canonical paths and reject external or wrong-city paths", () => {
  const product = { category: "opravy", slug: "model_123", canonicalPath: "/catalog_n/opravy/muzhskie/model_123/" };
  assert.equal(searchProductHref(product, "nvk"), product.canonicalPath);
  assert.equal(searchProductHref(product, "spb"), "/catalog_s/opravy/model_123/");
  for (const path of ["https://evil.example/", "//evil.example/", "javascript:alert(1)", "/catalog_s/../evil/", "/catalog_s/opravy/\\evil/"]) {
    assert.equal(searchProductHref({ ...product, canonicalPath: path }, "spb"), "/catalog_s/opravy/model_123/");
  }
});

test("full search encodes literal query values without losing the selected city", () => {
  const url = new URL(fullSearchHref(" GUESS & shape=other ", "nvk"), "https://optika100.com");
  assert.equal(url.searchParams.get("q"), "GUESS & shape=other");
  assert.equal(url.searchParams.get("city"), "nvk");
  assert.equal(url.searchParams.size, 2);
});

test("spectacle-lens matches open the current pricing catalogue with the alias resolved", () => {
  const url = new URL(lensSearchHref("стеллест", "nvk"), "https://optika100.com");
  assert.equal(url.pathname, "/catalog_n/linzy_dlya_ochkov/");
  assert.equal(url.searchParams.get("lensQuery"), "Stellest");
});
