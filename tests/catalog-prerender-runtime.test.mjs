import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function loadModule(path, mocks, env) {
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
});
