import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("contact-lens filters expose sections and every production parameter group", async () => {
  const listing = await read("../src/components/CatalogListing.tsx");
  const route = await read("../src/lib/catalog-route.ts");

  for (const label of [
    "Разделы линз",
    "Все контактные линзы",
    "Режим ношения",
    "Срок замены",
    "Оптическая сила (сфера)",
    "Оптическая сила цилиндра",
    "Ось",
    "Аддидация",
    "Радиус кривизны",
  ]) {
    assert.ok(listing.includes(label), `missing contact-lens filter: ${label}`);
  }

  for (const facet of ["wearingMode", "sphere", "cylinder", "axis", "addition", "bc"]) {
    assert.ok(route.includes(`"${facet}"`), `missing URL-backed facet: ${facet}`);
  }

  assert.ok(!listing.includes("LENS_SPHERE_DEFS"));
  assert.ok(!listing.includes('placeholder="например 90°"'));
});

test("frame filters and homepage cards use the approved live sections", async () => {
  const listing = await read("../src/components/CatalogListing.tsx");
  const homepage = await read("../src/routes/index.tsx");

  for (const facet of ["discount", "templeLength", "bridgeWidth", "rimWidth"]) {
    assert.ok(listing.includes(`renderServerFacetBlock("${facet}"`), `missing frame facet: ${facet}`);
  }

  for (const section of ["zhenskie", "muzhskie", "detskie"]) {
    assert.ok(homepage.includes(`/catalog_s/opravy/${section}/`), `homepage section link missing: ${section}`);
  }
});

test("catalog backend indexes each newly visible filter from Bitrix data", async () => {
  const product = await read("../../public_html/api/store/_product.php");
  const facets = await read("../../public_html/api/store/_facets.php");

  assert.ok(product.includes("PROPERTY_WEAR_MODE"));
  assert.ok(product.includes("discountPercent"));
  for (const field of ["templeLength", "bridgeWidth", "rimWidth"]) {
    assert.ok(product.includes(`['${field}']`), `product field missing: ${field}`);
    assert.ok(facets.includes(`'${field}' => [`), `facet definition missing: ${field}`);
  }
});
