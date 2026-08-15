import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Novokuznetsk routing replaces every SPb-only SEO destination", async () => {
  const source = await read("../src/lib/city-routing.ts");
  const store = await read("../src/lib/store/city.ts");
  const root = await read("../src/routes/__root.tsx");
  const expectedMappings = [
    '["/optika-spb/", "/contacts/"]',
    '["/linzy-spb/", "/catalog_n/kontaktnye_linzy_/"]',
    '["/tsvetnye-linzy-s-dioptriyami/", "/catalog_n/kontaktnye_linzy_/tsvetnye/"]',
    '["/biometriya-glaza/", "/kabinet-diagnostiki-nk/"]',
  ];

  for (const mapping of expectedMappings) assert.ok(source.includes(mapping));
  assert.match(source, /city === "nvk"/);
  assert.match(source, /NVK_ROUTE_FALLBACKS\.get\(href\)/);
  assert.match(store, /skipHydration: true/);
  assert.match(root, /useCityStore\.persist\.rehydrate\(\)/);
});

test("shared navigation suppresses SPb-only links and contacts for Novokuznetsk", async () => {
  const footer = await read("../src/components/layout/Footer.tsx");
  const header = await read("../src/components/layout/Header.tsx");
  const megaMenu = await read("../src/components/layout/HeaderMegaMenu.tsx");

  for (const href of ["/linzy-spb/", "/biometriya-glaza/", "/optika-spb/"]) {
    assert.ok(footer.includes(href));
  }
  assert.match(footer, /city === "spb" \|\| !\[/);
  assert.match(footer, /city === "spb" \?/);
  assert.match(header, /cityCode === "nvk" \? NK_SALONS\[0\] : PRIMARY_SALON/);
  assert.match(header, /if \(!mounted \|\| !cityHydrated\) return/);
  assert.match(megaMenu, /Контактные линзы в Новокузнецке/);
  assert.match(megaMenu, /Доставка и самовывоз/);
});

test("shared pages derive regional text and links from the selected city", async () => {
  const homepage = await read("../src/routes/index.tsx");
  const repair = await read("../src/components/pages/RepairPage.tsx");
  const productInfo = await read("../src/components/ProductInfoSections.tsx");
  const appointment = await read("../src/components/AppointmentModal.tsx");
  const checkout = await read("../src/routes/checkout.tsx");

  assert.match(homepage, /Салоны в Новокузнецке/);
  assert.match(homepage, /catalogHref\("opravy", city\)/);
  assert.match(repair, /city === "nvk" \? NK_SALONS\[0\] : SPB_SALONS\[0\]/);
  assert.match(productInfo, /serviceHref\("diagnostika", city\)/);
  assert.match(productInfo, /Доставка по Новокузнецку/);
  assert.match(appointment, /salon\.city === "nk"/);
  assert.match(appointment, /availableSalons\.map/);
  assert.match(checkout, /regionalCity === "nvk" \? "Новокузнецк" : "Санкт-Петербург"/);
});

test("Novokuznetsk search filters SPb-only pages and regionalizes result links", async () => {
  const index = await read("../src/data/site-search.ts");
  const route = await read("../src/routes/search.tsx");

  assert.match(index, /region\?: "spb"/);
  assert.match(route, /city === "spb" \|\| page\.region !== "spb"/);
  assert.match(route, /regionalSiteHref\(page\.href, city\)/);
  assert.match(route, /product=\{p\} city=\{city\}/);
});

test("shared route metadata stays city-neutral", async () => {
  for (const path of [
    "../src/routes/index.tsx",
    "../src/routes/main-v2.tsx",
    "../src/routes/remont-ochkov.tsx",
    "../src/routes/uslugi.tsx",
  ]) {
    const source = await read(path);
    const headBlock = source.slice(source.indexOf("head:"), source.indexOf("component:"));
    assert.doesNotMatch(headBlock, /Санкт-Петербург|Петербург|СПб/);
  }
});
