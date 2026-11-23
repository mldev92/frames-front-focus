import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { robotsAllows } from "../scripts/seo-inventory.mjs";
import {
  allowStellestCanonical,
  amendStellestMatches,
  loadStellestCatalog,
  stellestCanonical,
  stellestDataFile,
  stellestPage,
} from "../scripts/stellest-published-catalog.mjs";
import { appendStandaloneSitemap } from "../scripts/standalone-pages.mjs";

test("Офлайн-выпуск открывает канонический URL Prevencia, сохраняя остальные запреты", () => {
  const restriction = "Disallow: */as_stellest_crizal_prevencia/";
  const baseline = `User-agent: *\n${restriction}\nDisallow: /personal/\nUser-agent: Yandex\n${restriction}\n`;
  const robots = allowStellestCanonical(baseline);
  assert.equal(robotsAllows(robots, stellestCanonical), true);
  assert.equal(robotsAllows(robots, stellestCanonical.replace("/detskie", "")), false);
  assert.equal(robotsAllows(robots, "/personal/"), false);
  assert.equal(robots.replaceAll(`Allow: ${stellestCanonical}$\n`, ""), baseline);
  assert.throws(() => allowStellestCanonical(robots));
  const sitemap = appendStandaloneSitemap("<urlset>\n</urlset>\n", [], [stellestCanonical]);
  assert.match(sitemap, /<loc>https:\/\/optika100\.com\/catalog_s\/.*prevencia\/<\/loc>/);
});

test("Цены меняются только для проверенных карточек и только с ожидаемым backend", (t) => {
  const { backend } = JSON.parse(readFileSync(stellestDataFile));
  const prior = process.env.O100_STELLEST_CATALOG;
  process.env.O100_STELLEST_CATALOG = "1";
  t.after(() => {
    if (prior === undefined) delete process.env.O100_STELLEST_CATALOG;
    else process.env.O100_STELLEST_CATALOG = prior;
  });
  assert.throws(() => loadStellestCatalog("wrong"));
  const catalog = loadStellestCatalog(backend);
  const premium = catalog.products.get(65359);
  const current = {
    id: premium.id,
    slug: premium.slug,
    canonicalPath: premium.path,
    price: 22250,
    badges: ["В наличии"],
  };
  const other = { ...current, id: 999 };
  const section = [{ id: "/catalog_s/$", data: [current, other] }];
  amendStellestMatches(section, "/catalog_s/linzy_dlya_ochkov/detskie/", catalog);
  assert.equal(current.price, 16020);
  assert.equal(current.oldPrice, 17800);
  assert.equal(current.discountPercent, 10);
  assert.deepEqual(current.badges, ["В наличии", "Скидка"]);
  assert.equal(other.price, 22250);
  const contactLenses = [other];
  const landing = [{ id: stellestPage + "stellest-katalog-s-linzami", data: contactLenses }];
  amendStellestMatches(landing, stellestPage, catalog);
  assert.deepEqual(landing[0].data, { contactLenses, spectacleLenses: catalog.offers });
});
