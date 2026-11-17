import assert from "node:assert/strict";
import test from "node:test";
import { mergeRepeatedOrder } from "../../src/lib/order-repeat.ts";

const line = { lineId: "repeat:100:1", productId: 12, offerId: 15, slug: "lens", name: "Линзы",
  category: "kontaktnye-linzy", catalogNamespace: "catalog_n", canonicalPath: "/catalog_n/kontaktnye_linzy/lens/",
  price: 2500, authoritativeBasePrice: 2500, qty: 2,
  parameters: { color: "Синий", prescription: { right: { sphere: "-2" }, left: { sphere: "-3" } }, lensEyeMode: "different" } };

test("повтор сохраняет Bitrix ID, предложение, город, количество и рецепт", () => {
  const existing = { ...line, lineId: "unrelated", qty: 1 };
  const result = mergeRepeatedOrder([existing], [line]);
  assert.deepEqual(result, [existing, line]);
  assert.equal(result[0], existing);
  assert.equal(result[1].parameters, line.parameters);
});
test("повтор той же позиции увеличивает количество и обновляет цену", () => {
  const result = mergeRepeatedOrder([{ ...line, price: 1000, authoritativeBasePrice: 1000 }], [line]);
  assert.equal(result.length, 1);
  assert.equal(result[0].qty, 4);
  assert.equal(result[0].price, 2500);
  assert.equal(result[0].authoritativeBasePrice, 2500);
});
test("разные строки одного товара не теряют разные рецепты и варианты", () => {
  const other = { ...line, lineId: "repeat:100:2", offerId: 16, parameters: { prescription: { right: { sphere: "-4" } } } };
  assert.deepEqual(mergeRepeatedOrder([], [line, other]), [line, other]);
});
test("неполная старая карточка заказа отвергается без частичного изменения корзины", () => {
  const current = [{ ...line, lineId: "existing" }];
  const before = structuredClone(current);
  assert.throws(() => mergeRepeatedOrder(current, [line, { slug: "lens", name: "Линзы", price: 1000, qty: 1 }]));
  assert.deepEqual(current, before);
});
test("ошибка количества и невалидная цена не меняют существующую корзину", () => {
  for (const change of [{ qty: 0 }, { qty: 1.5 }, { qty: 21 }, { price: 0 }, { price: NaN }, { productId: 0 }]) {
    assert.throws(() => mergeRepeatedOrder([], [{ ...line, ...change }]));
  }
  const current = [{ ...line, qty: 19 }];
  assert.throws(() => mergeRepeatedOrder(current, [line]), /20/);
  assert.equal(current[0].qty, 19);
});
