import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";
import { filterLensLines } from "../src/lib/lens-lines-filter.ts";
import * as progressiveLenses from "../src/lib/progressive-lenses.ts";

const require = createRequire(import.meta.url);
async function loadModule(path, mocks, env) {
  mocks = {
    "@/lib/frame-landing": { frameLanding: () => undefined, frameLandingQuery: (_path, query) => query },
    "@/lib/search-query": { canonicalSearchQuery: (query) => query.trim() },
    "@/lib/storefront-media": { storefrontUploadUrl: (value) => value },
    "@/lib/api/lens-recommend": {},
    "@/lib/lens-lines-filter": { filterLensLines },
    "@/lib/progressive-lenses": progressiveLenses,
    ...mocks,
  };
  const source = (await readFile(new URL(path, import.meta.url), "utf8"))
    .replaceAll("import.meta.env", JSON.stringify(env));
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  new Function("require", "exports", "module", outputText)(
    (name) => name in mocks ? mocks[name] : require(name), module.exports, module,
  );
  return module.exports;
}

class IndexNotReadyError extends Error {}
const unavailable = new Error("Bitrix API 503");
const failingApi = {
  IndexNotReadyError,
  getProduct: async () => { throw unavailable; },
  getRelated: async () => [],
  getCatalogPage: async () => { throw new IndexNotReadyError(); },
};

test("production prerender отклоняет недоступный индекс и сбой загрузки товара", async () => {
  const route = await loadModule("../src/lib/catalog-route.ts", { "@/lib/api/bitrix": failingApi },
    { SSR: true, VITE_PRERENDER_BUILD: "true" });
  await assert.rejects(route.loadCatalogPage("opravy", {}, "spb"), IndexNotReadyError);
  await assert.rejects(route.resolveCatalogRoute("opravy/model", {}, "spb"), unavailable);
});

test("браузер сохраняет сообщение о временно недоступном каталоге", async () => {
  const route = await loadModule("../src/lib/catalog-route.ts", { "@/lib/api/bitrix": failingApi },
    { SSR: false, VITE_PRERENDER_BUILD: "true" });
  assert.deepEqual(await route.loadCatalogPage("opravy", {}, "spb"), { state: "index_not_ready" });
});

test("посадочная прогрессивных линз получает данные для HTML только на сервере", async () => {
  const calls = [];
  const section = progressiveLenses.PROGRESSIVE_SECTION;
  const mocks = {
    "@/lib/api/bitrix": failingApi,
    "@/lib/api/lens-recommend": {
      fetchLensLines: async (signal, city) => {
        calls.push({ signal, city });
        return [
          { id: "progressive", designs: ["progressive"], filterData: {} },
          { id: "single", designs: ["single"], filterData: {} },
        ];
      },
    },
  };
  const signal = new AbortController().signal;
  const server = await loadModule("../src/lib/catalog-route.ts", mocks,
    { SSR: true, VITE_PRERENDER_BUILD: "true" });
  const page = await server.resolveCatalogRoute(section, {}, "spb", signal);
  assert.equal(page.kind, "catalog");
  assert.deepEqual(page.result.initialCards.map(({ id }) => id), ["progressive"]);
  assert.deepEqual(calls, [{ signal, city: "spb" }]);

  const browser = await loadModule("../src/lib/catalog-route.ts", mocks, { SSR: false });
  assert.deepEqual((await browser.resolveCatalogRoute(section, {}, "spb")).result, { state: "lens_lines" });
  assert.equal(calls.length, 1);
});

test("пустой существующий раздел сохраняется, отсутствующий товар не становится каталогом", async () => {
  const api = {
    getProduct: async () => null,
    getCatalogPage: async () => ({ total: 0, products: [] }),
    isKnownCatalogSection: async (section, city) => city === "nvk" && section === "solntsezashchitnye_ochki/detskie_1/dlya_malchikov_1",
  };
  const route = await loadModule("../src/lib/catalog-route.ts", { "@/lib/api/bitrix": api },
    { SSR: true, VITE_PRERENDER_BUILD: "true" });
  assert.equal((await route.resolveCatalogRoute("solntsezashchitnye_ochki/detskie_1/dlya_malchikov_1", {}, "nvk")).kind, "catalog");
  assert.equal(await route.resolveCatalogRoute("soputstvuyushchie_tovary/renu_multiplus_8_ml", {}, "nvk"), null);
  api.isKnownCatalogSection = async () => { throw unavailable; };
  await assert.rejects(route.resolveCatalogRoute("opravy/unknown", {}, "spb"), unavailable);
});

test("переход из списка загружает полное описание и не теряет его после повторного списка", async () => {
  const summary = { id: 1, slug: "stellest", name: "Stellest", images: [], description: "" };
  let detailRequests = 0;
  const api = await loadModule("../src/lib/api/bitrix.ts", {
    "@/lib/request-key": {},
    "@/data/products": {},
    "@/data/categories": {},
    "@/lib/api/security": {
      apiFetch: async (url) => {
        if (url.includes("/product.php?")) {
          detailRequests++;
          return Response.json({ ...summary, descriptionHtml: "<p>Полное описание Stellest</p>" });
        }
        return Response.json({ products: [summary], total: 1, page: 1, pages: 1 });
      },
    },
  }, { VITE_BITRIX_API: "https://example.test", SSR: false, DEV: false });
  await api.getProductsPage("linzy_dlya_ochkov");
  assert.equal((await api.getProduct("stellest")).descriptionHtml, "<p>Полное описание Stellest</p>");
  await api.getProductsPage("linzy_dlya_ochkov");
  assert.equal((await api.getProduct("stellest")).descriptionHtml, "<p>Полное описание Stellest</p>");
  assert.equal(detailRequests, 1);
  await api.getProduct("stellest", "nvk");
  assert.equal(detailRequests, 2);
  api.invalidateProductPrices();
  await api.getProduct("stellest");
  assert.equal(detailRequests, 3);
});
