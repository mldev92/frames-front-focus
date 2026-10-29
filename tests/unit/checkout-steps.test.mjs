import assert from "node:assert/strict";
import test from "node:test";
import { firstProblemStep, stepProblem } from "../../src/lib/checkout-steps.ts";

const ready = {
  hasLocation: true,
  hasDelivery: true,
  deliveryLoading: false,
  deliveryRequiresPickupPoint: false,
  deliveryRequiresAddress: false,
  hasPickupPoint: false,
  address: "",
  hasPayment: true,
  fullName: "Иванов Иван",
  email: "ivan@example.com",
  phoneComplete: true,
  hasLines: true,
};

test("a complete checkout has no problem in any step", () => {
  assert.equal(firstProblemStep(ready), null);
});

test("region step needs a chosen city", () => {
  assert.match(stepProblem("region", { ...ready, hasLocation: false }), /город/);
});

test("delivery step waits for the quote, a pickup point or an address", () => {
  assert.match(stepProblem("delivery", { ...ready, deliveryLoading: true }), /Считаем/);
  assert.match(stepProblem("delivery", { ...ready, deliveryRequiresPickupPoint: true }), /пункт/);
  assert.equal(stepProblem("delivery", { ...ready, deliveryRequiresPickupPoint: true, hasPickupPoint: true }), null);
  assert.match(stepProblem("delivery", { ...ready, deliveryRequiresAddress: true, address: "  " }), /адрес/);
  assert.equal(stepProblem("delivery", { ...ready, deliveryRequiresAddress: true, address: "ул. Ленина, 1" }), null);
});

test("delivery is never preselected: the step asks the buyer to choose one", () => {
  assert.match(stepProblem("delivery", { ...ready, hasDelivery: false }), /способ доставки/);
  assert.equal(firstProblemStep({ ...ready, hasDelivery: false }), "delivery");
});

test("buyer step validates name, e-mail and the full phone", () => {
  assert.match(stepProblem("buyer", { ...ready, fullName: "" }), /Ф\.И\.О/);
  assert.match(stepProblem("buyer", { ...ready, email: "nope" }), /e-mail/);
  assert.match(stepProblem("buyer", { ...ready, phoneComplete: false }), /телефон/);
});

test("firstProblemStep returns the earliest broken step", () => {
  assert.equal(firstProblemStep({ ...ready, fullName: "", hasLocation: false }), "region");
  assert.equal(firstProblemStep({ ...ready, fullName: "" }), "buyer");
});
