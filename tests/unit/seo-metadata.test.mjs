import assert from "node:assert/strict";
import test from "node:test";
import { productMetaDescription, descriptionTextFromHtml } from "../../src/lib/product-seo.ts";
import { catalogSectionTitle } from "../../src/data/categories.ts";
import { catalogSectionMetadata } from "../../src/data/catalog-seo.ts";

test("описание карточки сохраняет редакционный текст и использует HTML только при пустом поле", () => {
  const product = { name: "MiYOSMART", description: "Редакционный текст", descriptionHtml: "<p>Другой текст</p>" };
  assert.equal(productMetaDescription(product), "Редакционный текст");
  assert.equal(productMetaDescription({ ...product, description: "  " }), "Другой текст");
  assert.equal(productMetaDescription({ name: "Модель", description: "", descriptionHtml: "<p>&nbsp;</p>" }),
    "Модель — информация о товаре в ОПТИКА 100%.");
});

test("HTML-описание превращается в текст без скриптов, разметки и кодов сущностей", () => {
  assert.equal(descriptionTextFromHtml('<style>.x{}</style><p>Hoya&nbsp;MiYOSMART &amp; &#x41;</p><p>Для детей</p><script>alert(1)</script>'),
    "Hoya MiYOSMART & A Для детей");
  const result = productMetaDescription({ name: "Товар", description: "", descriptionHtml: `<p>${"Описание товара. ".repeat(40)}</p>` });
  assert.ok(result.length <= 180);
  assert.ok(result.endsWith("…"));
});

test("одинаковые коды детских разделов сохраняют тип товара и вложенную аудиторию", () => {
  for (const [path, expected] of [
    ["opravy/detskie_1", "Детские оправы"],
    ["opravy/detskie_1/dlya_malchikov", "Оправы для мальчиков"],
    ["opravy/detskie_1/dlya_devochek", "Оправы для девочек"],
    ["linzy_dlya_ochkov/detskie", "Детские линзы для очков"],
    ["linzy_dlya_ochkov/bifokalnye", "Бифокальные линзы для очков"],
    ["solntsezashchitnye_ochki/detskie_", "Детские солнцезащитные очки"],
    ["solntsezashchitnye_ochki/zhenskie_", "Женские солнцезащитные очки"],
  ]) assert.equal(catalogSectionTitle(path, "Каталог"), expected);
});

test("метаданные подраздела описывают раздел и его город, сохраняя редакционные SEO-тексты", () => {
  const fallback = { title: "Оправы", metaTitle: "Оправы — каталог", metaDescription: "Оправы в Санкт-Петербурге" };
  const women = catalogSectionMetadata("opravy/zhenskie", fallback);
  assert.match(women.metaTitle, /^Женские оправы/);
  assert.match(women.metaDescription, /Женские оправы/);
  const nvk = catalogSectionMetadata("opravy", fallback, "nvk");
  assert.match(nvk.metaDescription, /Новокузнецке/);
  assert.doesNotMatch(nvk.metaDescription, /Санкт-Петербурге/);
  assert.equal(catalogSectionMetadata("opravy", fallback).metaDescription, fallback.metaDescription);
  assert.match(catalogSectionMetadata("kontaktnye_linzy_/tsvetnye", fallback).metaDescription, /оттеночные и непрозрачные/);
});
