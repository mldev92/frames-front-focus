import assert from "node:assert/strict";
import test from "node:test";

import {
  attachLensLineImages,
  lensLineImage,
  LENS_LINE_FALLBACK_IMAGE,
} from "../../src/lib/lens-line-images.ts";

const sources = [
  {
    name: "Crizal Eyezen Orma Prevencia",
    brand: "Ессилор (Франция)",
    images: ["https://optika100.com/upload/eyezen.png"],
  },
  {
    name: "Orma Crizal Easy Pro UV",
    brand: "Ессилор (Франция)",
    images: ["https://optika100.com/upload/essilor.png"],
  },
  {
    name: "Hilux Eyas 1,6 SHV",
    brand: "Hoya (Япония)",
    images: ["https://optika100.com/upload/hoya.png"],
  },
  {
    name: "ZEISS 1.5 DV PLATINUM",
    brand: "ZEISS (Германия)",
    images: ["https://optika100.com/upload/zeiss.png"],
  },
];

test("restores the closest former product image within the same supplier", () => {
  assert.equal(
    lensLineImage({ title: "Crizal Eyezen Orma (0.4 add)", supplier: "essilor" }, sources),
    "https://optika100.com/upload/eyezen.png",
  );
});

test("uses a supplier image when the grouped line has no former exact product", () => {
  assert.equal(
    lensLineImage({ title: "KODAK", supplier: "essilor" }, sources),
    "https://optika100.com/upload/essilor.png",
  );
  assert.equal(
    lensLineImage({ title: "ZEISS MyoCare", supplier: "zeiss" }, sources),
    "https://optika100.com/upload/zeiss.png",
  );
});

test("never borrows an image from another supplier", () => {
  assert.equal(
    lensLineImage({ title: "Synchrony Single Vision AS", supplier: "synchrony" }, sources),
    LENS_LINE_FALLBACK_IMAGE,
  );
});

test("attaches an image to every curated card", () => {
  const cards = attachLensLineImages(
    [
      { title: "Hilux EYAS", supplier: "hoya" },
      { title: "Synchrony Single Vision AS", supplier: "synchrony" },
    ],
    sources,
  );
  assert.equal(cards[0].image, "https://optika100.com/upload/hoya.png");
  assert.equal(cards[1].image, LENS_LINE_FALLBACK_IMAGE);
});
