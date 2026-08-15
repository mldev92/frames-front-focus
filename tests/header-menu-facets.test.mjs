import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

async function loadFacetHelpers() {
  const source = await readFile(
    new URL("../src/lib/header-menu-facets.ts", import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}

const summary = {
  total: 12,
  facets: {
    brand: { "Johnson & Johnson": 12, Empty: 0 },
    sphere: { "-6": 8, 1: 6 },
    addition: { Low: 3, Med: 2 },
    bc: { 8.7: 4 },
  },
};

test("safe header links remain available before facets load", async () => {
  const { isHeaderMenuHrefAvailable } = await loadFacetHelpers();
  assert.equal(isHeaderMenuHrefAvailable("/catalog_s/opravy/", undefined), true);
  assert.equal(isHeaderMenuHrefAvailable("/catalog_s/opravy/?priceMax=5000", undefined), true);
  assert.equal(isHeaderMenuHrefAvailable("/catalog_s/opravy/?expand=brand", undefined), true);
});

test("facet links stay hidden until the API confirms inventory", async () => {
  const { isHeaderMenuHrefAvailable } = await loadFacetHelpers();
  const brandHref = "/catalog_s/kontaktnye_linzy_/?brand=Johnson+%26+Johnson";
  assert.equal(isHeaderMenuHrefAvailable(brandHref, undefined), false);
  assert.equal(isHeaderMenuHrefAvailable(brandHref, summary), true);
  assert.equal(
    isHeaderMenuHrefAvailable("/catalog_s/kontaktnye_linzy_/?brand=Empty", summary),
    false,
  );
  assert.equal(
    isHeaderMenuHrefAvailable("/catalog_s/kontaktnye_linzy_/?brand=Missing", summary),
    false,
  );
});

test("numeric facets normalize unicode minus, plus signs, and trailing zeroes", async () => {
  const { isHeaderMenuHrefAvailable } = await loadFacetHelpers();
  assert.equal(
    isHeaderMenuHrefAvailable("/catalog_s/kontaktnye_linzy_/?sphere=%E2%88%926.00", summary),
    true,
  );
  assert.equal(
    isHeaderMenuHrefAvailable("/catalog_s/kontaktnye_linzy_/?sphere=%2B1.00", summary),
    true,
  );
  assert.equal(isHeaderMenuHrefAvailable("/catalog_s/kontaktnye_linzy_/?bc=8.70", summary), true);
});

test("multi-value facets use OR within a facet and AND across facets", async () => {
  const { isHeaderMenuHrefAvailable } = await loadFacetHelpers();
  assert.equal(
    isHeaderMenuHrefAvailable("/catalog_s/kontaktnye_linzy_/?addition=High%2CMed", summary),
    true,
  );
  assert.equal(
    isHeaderMenuHrefAvailable("/catalog_s/kontaktnye_linzy_/?addition=High&bc=8.7", summary),
    false,
  );
  assert.equal(
    isHeaderMenuHrefAvailable("/catalog_s/kontaktnye_linzy_/?addition=Med&bc=8.7", summary),
    true,
  );
});

test("unsupported query filters and zero-result items cannot render", async () => {
  const { availableHeaderMenuItems, isHeaderMenuHrefAvailable } = await loadFacetHelpers();
  assert.equal(isHeaderMenuHrefAvailable("/catalog_s/opravy/?tag=Новинки", summary), false);
  const visible = availableHeaderMenuItems(
    [
      { label: "Available", href: "/catalog_s/kontaktnye_linzy_/?brand=Johnson+%26+Johnson" },
      { label: "Empty", href: "/catalog_s/kontaktnye_linzy_/?brand=Empty" },
    ],
    summary,
  );
  assert.deepEqual(
    visible.map((item) => item.label),
    ["Available"],
  );
});

test("catalog segment extraction supports both city prefixes", async () => {
  const { catalogSegmentFromHref } = await loadFacetHelpers();
  assert.equal(catalogSegmentFromHref("/catalog_s/opravy/?shape=Панто"), "opravy");
  assert.equal(catalogSegmentFromHref("/catalog_n/kontaktnye_linzy_/"), "kontaktnye_linzy_");
  assert.equal(catalogSegmentFromHref("/contacts/"), undefined);
});

test("header menu uses canonical catalog values for repaired shortcuts", async () => {
  const source = await readFile(
    new URL("../src/components/layout/HeaderMegaMenu.tsx", import.meta.url),
    "utf8",
  );
  for (const expected of [
    'brand: "Johnson & Johnson"',
    'brand: "Cooper Vision"',
    'brand: "Bausch & Lomb"',
    'lensType: "Монофокальный"',
    'lensType: "Прогрессивный"',
    'lensType: "Поддержка аккомодации"',
    'purpose: "Для гаджетов"',
    'gender: "Детские"',
    'ctaHref: "/stellest-katalog-s-linzami/"',
  ])
    assert.ok(source.includes(expected), `missing ${expected}`);

  for (const stale of [
    'brand: "Acuvue"',
    'brand: "CooperVision"',
    'brand: "Bausch+Lomb"',
    'lensType: "Однофокальные"',
    'lensType: "Perifocal"',
    'purpose: "Для работы с гаджетами"',
    'technology: "STELLEST"',
    'addition: "Low,Med,High"',
    'tag: "Новинки"',
  ])
    assert.ok(!source.includes(stale), `stale mapping remains: ${stale}`);
});

test("desktop header keeps the approved compact navigation labels", async () => {
  const menu = await readFile(
    new URL("../src/components/layout/HeaderMegaMenu.tsx", import.meta.url),
    "utf8",
  );
  const header = await readFile(
    new URL("../src/components/layout/Header.tsx", import.meta.url),
    "utf8",
  );

  assert.ok(menu.includes('{ label: "Солнцезащитные очки", href: catalogHref("solntsezashchitnye")'));
  assert.ok(!menu.includes('{ label: "Солнцезащитные", href: catalogHref("solntsezashchitnye")'));
  assert.ok(!menu.includes('{ label: "Оптика СПб"'));
  assert.ok(header.includes("whitespace-nowrap"));
  assert.ok(header.includes('max-w-[1600px]'));
  assert.ok(header.includes('className="flex shrink-0 items-stretch"'));
  assert.ok(header.includes('px-1 text-sm'));
  assert.ok(header.includes('2xl:px-3 2xl:text-[15px]'));
});
