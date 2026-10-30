import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DEFAULT_REGION, mergeSavedRegion, useCityStore } from "../../src/lib/store/city.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("a first-time visitor starts on «Вся Россия», which uses the St. Petersburg catalogue", () => {
  assert.equal(DEFAULT_REGION, "all");
  const { region, city } = useCityStore.getState();
  assert.equal(region, "all");
  assert.equal(city, "spb");
});

test("choosing a region still wins over the default", () => {
  useCityStore.getState().setRegion("nvk");
  assert.deepEqual([useCityStore.getState().region, useCityStore.getState().city], ["nvk", "nvk"]);
  useCityStore.getState().setRegion("spb");
  assert.deepEqual([useCityStore.getState().region, useCityStore.getState().city], ["spb", "spb"]);
  useCityStore.getState().setRegion("all");
  assert.deepEqual([useCityStore.getState().region, useCityStore.getState().city], ["all", "spb"]);
});

test("restoring the saved state: nothing saved keeps the default, a saved choice is kept", () => {
  const current = { city: "spb", region: "all", hydrated: false };
  const pick = (saved) => {
    const next = mergeSavedRegion(saved, current);
    return [next.region, next.city];
  };
  assert.deepEqual(pick(undefined), ["all", "spb"]);
  assert.deepEqual(pick({ city: "nvk", region: "nvk" }), ["nvk", "nvk"]);
  assert.deepEqual(pick({ city: "spb", region: "spb" }), ["spb", "spb"]);
  assert.deepEqual(pick({ city: "spb", region: "all" }), ["all", "spb"]);
  // Старый формат хранил только город: выбор посетителя сохраняется.
  assert.deepEqual(pick({ city: "nvk" }), ["nvk", "nvk"]);
  assert.deepEqual(pick({ city: "spb" }), ["spb", "spb"]);
});

test("pre-rendered pages load the data of the default region, so the first paint matches it", async () => {
  const home = await read("../../src/routes/index.tsx");
  const stellest = await read("../../src/routes/stellest-katalog-s-linzami.tsx");
  assert.match(home, /getHomepageData\("spb", DEFAULT_REGION\)/);
  assert.match(home, /initialData: region === DEFAULT_REGION \? initialHomepageData/);
  assert.match(stellest, /getStellestLensProducts\("spb", DEFAULT_REGION\)/);
  assert.match(stellest, /initialData: region === DEFAULT_REGION \? loaderLenses/);
});
