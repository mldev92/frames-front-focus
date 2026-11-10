import assert from "node:assert/strict";
import test from "node:test";
import { addressAfterDeliveryChange, orderDestination } from "../../src/lib/checkout-destination.ts";

const point = { id: "MSK1071", address: "Москва, ул. Авиаконструктора Петлякова, 5" };

test("switching from pickup to courier does not reuse the pickup address", () => {
  const address = addressAfterDeliveryChange(point.address, point, false);
  assert.equal(address, "");
  assert.deepEqual(orderDestination({ requiresAddress: true }, address, null), {
    address: undefined,
    pickupPoint: undefined,
  });
});

test("a previously typed courier address survives a temporary pickup selection", () => {
  const courierAddress = "Москва, ул. Примерная, 7";
  assert.equal(addressAfterDeliveryChange(courierAddress, point, false), courierAddress);
  assert.deepEqual(orderDestination({ requiresAddress: true }, courierAddress, point), {
    address: courierAddress,
    pickupPoint: undefined,
  });
});

test("the order destination uses the selected pickup point only for pickup", () => {
  assert.deepEqual(orderDestination({ requiresPickupPoint: true }, "Москва, ул. Примерная, 7", point), {
    address: point.address,
    pickupPoint: { id: point.id, address: point.address },
  });
  assert.deepEqual(orderDestination({}, "Москва, ул. Примерная, 7", point), {
    address: undefined,
    pickupPoint: undefined,
  });
});
