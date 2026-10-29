import assert from "node:assert/strict";
import test from "node:test";
import { catalogHtmlProblems } from "../scripts/catalog-html-validation.mjs";

test("каталог с метаданными, H1 и содержимым проходит приёмку", () => {
  assert.deepEqual(catalogHtmlProblems('<head><meta name="description" content="Модель оправы"></head><main><h1>Оправа</h1><p>Характеристики</p></main>'), []);
});
test("оболочка с title и canonical не считается полноценной карточкой", () => {
  assert.match(catalogHtmlProblems('<title>Оправа</title><link rel="canonical" href="https://optika100.com/catalog_s/opravy/model/"><main></main>').join(" "), /H1 missing/);
});
test("ошибки загрузки и пустые описания останавливают приёмку", () => {
  assert.match(catalogHtmlProblems('<meta name="description" content=""><main><h1>Каталог</h1>Не удалось загрузить каталог</main>').join(" "), /unavailable state/);
  assert.match(catalogHtmlProblems('<meta content="  " name="description"><main><h1>Каталог</h1></main>').join(" "), /description empty/);
});
