import assert from "node:assert/strict";
import test from "node:test";
import { storefrontUploadUrl } from "../../src/lib/storefront-media.ts";

test("cached legacy upload URLs use the current API origin and preserve the file path", () => {
  for (const host of ["optika.p2print.site", "optika-new.p2print.site", "beta.optika100.com"]) {
    assert.equal(
      storefrontUploadUrl(`https://${host}/upload/iblock/4c9/frame.jpeg?size=600#photo`, "https://optika100.com/"),
      "https://optika100.com/upload/iblock/4c9/frame.jpeg?size=600#photo",
    );
  }
});

test("unrelated hosts, assets and links retain their original URL", () => {
  for (const value of [
    "https://cdn.example.com/upload/frame.jpg",
    "https://optika.p2print.site.example.com/upload/frame.jpg",
    "https://optika.p2print.site/blog/photo.jpg",
    "https://optika100.com/upload/frame.jpg",
    "/category_frames.webp",
    "data:image/svg+xml,<svg/>",
  ]) assert.equal(storefrontUploadUrl(value, "https://optika100.com"), value);
});

test("an unset or unsupported API origin cannot create an invalid image URL", () => {
  const image = "https://optika.p2print.site/upload/frame.jpg";
  for (const base of ["", "/api", "javascript:alert(1)"]) {
    assert.equal(storefrontUploadUrl(image, base), image);
  }
});
