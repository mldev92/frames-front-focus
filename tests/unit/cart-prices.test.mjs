import assert from "node:assert/strict";
import test from "node:test";
import { applyCartPrices } from "../../src/lib/cart-prices.ts";

const line = { lineId: "spb:12", productId: 12, catalogNamespace: "catalog_s", price: 2400,
  authoritativeBasePrice: 2400, qty: 2, parameters: { prescription: { right: { sphere: "-2" } } } };

test("сохранённая корзина принимает новую цену и сохраняет количество и рецепт", () => {
  const result = applyCartPrices([line], [{ ...line, price: 2520 }]);
  assert.equal(result[0].price, 2520);
  assert.equal(result[0].authoritativeBasePrice, 2520);
  assert.equal(result[0].qty, 2);
  assert.equal(result[0].parameters, line.parameters);
});
test("поздний ответ не восстанавливает удалённую строку и не теряет новое количество", () => {
  assert.deepEqual(applyCartPrices([], [{ ...line, price: 2520 }]), []);
  assert.equal(applyCartPrices([{ ...line, qty: 5 }], [{ ...line, price: 2520 }])[0].qty, 5);
});
test("чужой город, товар или предложение не меняет цену строки", () => {
  for (const extra of [{catalogNamespace:"catalog_n"},{productId:13},{offerId:99}]) {
    const lines=[line];
    assert.equal(applyCartPrices(lines,[{...line,...extra,price:2520}]),lines);
  }
});
test("невалидная либо неизменная цена не сбрасывает состояние оформления", () => {
  for (const price of [NaN,Infinity,0,-1,2400]) {
    const lines=[line];
    assert.equal(applyCartPrices(lines,[{...line,price}]),lines);
  }
});
