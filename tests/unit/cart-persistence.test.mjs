import assert from "node:assert/strict";
import test from "node:test";
import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";
import { mergePersistedCart } from "../../src/lib/cart-persistence.ts";

test("checkout rehydration retains pickup and quotation dependencies for unchanged cart", async () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
  const store = createStore(persist(() => ({ lines: [{ lineId: "nvk:42", qty: 1, parameters: { color: "brown" } }] }), { name: "cart", storage: createJSONStorage(() => storage), merge: mergePersistedCart }));
  store.setState({ lines: [...store.getState().lines] });
  const selectedLines = store.getState().lines;
  let invalidations = 0;
  store.subscribe((state, previous) => { if (state.lines !== previous.lines) invalidations++; });
  await store.persist.rehydrate();
  await store.persist.rehydrate();
  assert.equal(store.getState().lines, selectedLines);
  assert.equal(invalidations, 0);
  const fromOtherTab = JSON.parse(values.get("cart"));
  fromOtherTab.state.lines[0].qty = 2;
  values.set("cart", JSON.stringify(fromOtherTab));
  await store.persist.rehydrate();
  assert.equal(store.getState().lines[0].qty, 2);
  assert.equal(invalidations, 1);
});

test("changed prescriptions invalidate checkout, while absent storage preserves current cart", () => {
  const current = { lines: [{ qty: 1, parameters: { prescription: { right: { sphere: "-2" } } } }], consume: () => {} };
  assert.equal(mergePersistedCart(null, current), current);
  const next = mergePersistedCart({ lines: [{ qty: 1, parameters: { prescription: { right: { sphere: "-3" } } } }] }, current);
  assert.notEqual(next.lines, current.lines);
  assert.equal(next.consume, current.consume);
  assert.equal(next.lines[0].parameters.prescription.right.sphere, "-3");
});
