import assert from "node:assert/strict";
import test from "node:test";
import { formatProductPrice, hasProductPrice } from "../../src/lib/product-price.ts";
test("отсутствующая цена не отображается как ноль и не разрешает покупку", () => {
  for (const value of [null,undefined,NaN,Infinity,0,-1,"2520"]) {
    assert.equal(hasProductPrice(value),false);
    assert.equal(formatProductPrice(value,2),"Цена по запросу");
  }
});
test("цена двух упаковок рассчитывается только по действительной цене", () => {
  assert.equal(hasProductPrice(2520),true);
  assert.equal(formatProductPrice(2520,2).replace(/\s/g,""),"5040₽");
});
