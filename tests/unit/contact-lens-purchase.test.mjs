import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultLensOption,
  defaultLensPrescription,
  lensPurchaseComplete,
  lensPurchaseFields,
  orderedLensOptions,
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

const labels = (labelsList) => labelsList.map((label, id) => ({ id: String(id), label }));

test("diopters are ordered from big minus to plus, other parameters keep their order", () => {
  const sphere = labels(["+3.75", "+1.75", "-4.50", "-0.25", "+5.50", "-12.00", "0.00"]);
  assert.deepEqual(
    orderedLensOptions("sphere", sphere).map((option) => option.label),
    ["-12.00", "-4.50", "-0.25", "0.00", "+1.75", "+3.75", "+5.50"],
  );
  const radius = labels(["8.8", "8.4", "8.6"]);
  assert.equal(orderedLensOptions("curvatureRadius", radius), radius);
});

test("the default diopter is the smallest minus, or the smallest plus when there is no minus", () => {
  assert.equal(defaultLensOption("sphere", labels(["+3.75", "-0.50", "-4.50", "-1.00"]))?.label, "-0.50");
  assert.equal(defaultLensOption("sphere", labels(["-0.25", "-0.50", "+1.00"]))?.label, "-0.25");
  assert.equal(defaultLensOption("sphere", labels(["+6.00", "+1.25", "+3.75"]))?.label, "+1.25");
  assert.equal(defaultLensOption("curvatureRadius", labels(["8.8", "8.4"]))?.label, "8.8");
});

test("the typographic minus sign and decimal commas are read as numbers", () => {
  const options = labels(["+1,25", String.fromCharCode(0x2212) + "0,50", "-3,00"]);
  assert.deepEqual(
    orderedLensOptions("sphere", options).map((option) => option.label),
    ["-3,00", String.fromCharCode(0x2212) + "0,50", "+1,25"],
  );
});
