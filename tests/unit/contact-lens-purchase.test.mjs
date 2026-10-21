import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultLensPrescription,
  lensPurchaseComplete,
  lensPurchaseFields,
} from "../../src/lib/contact-lens-purchase.ts";

const fullProduct = {
  category: "kontaktnye-linzy",
  lensOptions: {
    sphere: {
      code: "SEL_OPTIC_FORCE",
      label: "Оптическая сила (сфера)",
      options: [{ id: "484", label: "+3.75" }],
    },
    curvatureRadius: {
      code: "SEL_CURVATURE_RADIUS",
      label: "Радиус кривизны",
      options: [{ id: "557", label: "8.6" }],
    },
  },
};

test("Ultra Flex-style lens options are complete on the first render", () => {
  const prescription = defaultLensPrescription(fullProduct);
  assert.deepEqual(prescription, {
    right: { sphere: "+3.75", bc: "8.6" },
    left: { sphere: "+3.75", bc: "8.6" },
  });
  assert.deepEqual(lensPurchaseFields(fullProduct).map(({ prescriptionKey }) => prescriptionKey), ["sphere", "bc"]);
  assert.equal(lensPurchaseComplete(fullProduct, prescription), true);
});

test("explicit lens options still reject an incomplete prescription", () => {
  assert.equal(lensPurchaseComplete(fullProduct, {
    right: { sphere: "+3.75", bc: "8.6" },
    left: { sphere: "+3.75" },
  }), false);
});

test("a lightweight catalog product cannot dead-end the add-to-cart action", () => {
  assert.equal(lensPurchaseComplete({ category: "kontaktnye-linzy" }, { right: {}, left: {} }), true);
});
