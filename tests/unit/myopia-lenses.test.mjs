import test from "node:test";
import assert from "node:assert/strict";
import {
  contactMyopiaModels,
  getSpectacleMyopiaModel,
  getSpectacleMyopiaModelFromQuery,
  myopiaCatalogPath,
  myopiaDetailsPath,
  spectacleMyopiaModels,
} from "../../src/lib/myopia-lenses.ts";
import { contactPackPrice, spectaclePairPrice } from "../../src/lib/myopia-prices.ts";

test("myopia models have distinct details and model-specific catalog destinations", () => {
  const models = [...spectacleMyopiaModels, ...contactMyopiaModels];
  assert.equal(models.length, 7);
  assert.equal(new Set(models.map(myopiaDetailsPath)).size, 7);
  assert.equal(new Set(models.map(myopiaCatalogPath)).size, 7);
  for (const model of spectacleMyopiaModels) {
    const path = new URL(myopiaCatalogPath(model), "https://optika100.com");
    assert.equal(
      getSpectacleMyopiaModelFromQuery(path.searchParams.get("lensQuery")).slug,
      model.slug,
    );
  }
});

test("spectacle pricing selects the lowest valid single-lens price and doubles it", () => {
  const stellest = getSpectacleMyopiaModel("stellest");
  const prices = [
    { id: "asstellestairwear", fromPriceRub: 8760 },
    { id: "asstellestairweartint", fromPriceRub: 1095 },
    { id: "myopiluxplusorma", fromPriceRub: 3000 },
    { id: "zeissmyocares", fromPriceRub: 3000 },
    { id: "zeissmyocare", fromPriceRub: 8400 },
  ];

  assert.equal(spectaclePairPrice(stellest, prices), 17520);
  assert.equal(spectaclePairPrice(stellest, prices.slice(1)), undefined);
  assert.equal(spectaclePairPrice(getSpectacleMyopiaModel("myocare"), prices), 16800);
  assert.equal(
    spectaclePairPrice(getSpectacleMyopiaModel("myopilux-plus"), [
      { id: "myopiluxplusorma", fromPriceRub: null },
      { id: "myopiluxplusormix", fromPriceRub: 0 },
    ]),
    undefined,
  );
});

test("contact pricing requires the matching catalog SKU and pack size", () => {
  const [misight] = contactMyopiaModels;
  const otherPack = { slug: "misight_1_day_90sht_", name: "MiSight 1 day (90шт.)", price: 9800 };
  const pack = { slug: misight.catalogSlug, name: "MiSight 1 day (30 шт.)", price: 3800 };

  assert.equal(contactPackPrice(misight, [otherPack, pack]), 3800);
  assert.equal(contactPackPrice(misight, [otherPack]), undefined);
  assert.equal(contactPackPrice(misight, [{ ...pack, name: otherPack.name }]), undefined);
  assert.equal(contactPackPrice(misight, [{ ...pack, price: 0 }]), undefined);
});
