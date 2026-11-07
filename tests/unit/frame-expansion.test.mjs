import assert from "node:assert/strict";
import test from "node:test";
import { FRAME_BRAND_LANDINGS, frameBrandForPath } from "../../src/data/frame-brand-landings.ts";
import { FRAME_CATEGORY_LANDINGS } from "../../src/data/frame-category-landings.ts";
import { frameLandingQuery, frameBrandHref, frameApiSection } from "../../src/lib/frame-landing.ts";
import { catalogSectionMetadata } from "../../src/data/catalog-seo.ts";
import { canonicalSearchQuery, searchBrandHref } from "../../src/lib/search-query.ts";

test("каждая брендовая страница сохраняет свой ассортимент при подмене бренда и фильтрации", () => {
  for (const brand of FRAME_BRAND_LANDINGS) {
    const path=`opravy/${brand.slug}`;
    const original={page:2,priceMin:5000,sort:"price_asc",filters:{brand:["OTHER"],gender:["Женские"],material:["Титан"]}};
    const result=frameLandingQuery(path,original);
    assert.deepEqual(result,{...original,filters:{...original.filters,brand:[brand.brand]}});
    assert.deepEqual(original.filters.brand,["OTHER"]);
    assert.equal(frameBrandForPath(path+"/product"),undefined);
    assert.equal(frameApiSection(path),"opravy");
  }
});

test("новые посадочные связаны с правильным разделом и городом", () => {
  for(const brand of FRAME_BRAND_LANDINGS){
    const path=`/catalog_s/opravy/${brand.slug}/`;
    assert.equal(frameBrandHref(brand.brand),path);
    assert.equal(searchBrandHref({name:brand.brand,category:"opravy"},"spb"),path);
    const nvk=new URL(searchBrandHref({name:brand.brand,category:"opravy"},"nvk"),"https://optika100.com");
    assert.equal(nvk.pathname,"/catalog_n/opravy/");assert.equal(nvk.searchParams.get("brand"),brand.brand);
    const sun=new URL(searchBrandHref({name:brand.brand,category:"solntsezashchitnye"},"spb"),"https://optika100.com");
    assert.equal(sun.pathname,"/catalog_s/solntsezashchitnye_ochki/");
  }
  assert.equal(frameBrandHref("WAGNER+KUHNER","opravy/muzhskie"),"/catalog_s/opravy/muzhskie/?brand=WAGNER%2BKUHNER");
  for(const category of FRAME_CATEGORY_LANDINGS)assert.equal(frameApiSection(category.path),category.section);
});

test("HUGO не объединяет BOSS и прежнее обозначение HUGO BOSS", () => {
  assert.equal(frameBrandForPath("opravy/hugo").brand,"HUGO");
  for(const brand of ["BOSS","HUGO BOSS"]){
    const link=new URL(frameBrandHref(brand),"https://optika100.com");
    assert.equal(link.searchParams.get("brand"),brand);assert.equal(link.pathname,"/catalog_s/opravy/zhenskie/");
  }
  assert.equal(canonicalSearchQuery("хуго босс"),"HUGO BOSS");
  assert.equal(canonicalSearchQuery("хуго б"),"HUGO BOSS");
  assert.equal(canonicalSearchQuery("хуго 1436"),"HUGO 1436");
  assert.equal(canonicalSearchQuery("босс 1992"),"BOSS 1992");
});

test("интенты категорий и брендов имеют самостоятельные метаданные без переноса географии NvK", () => {
  const fallback={title:"Оправы",metaTitle:"Оправы",metaDescription:"Каталог"};
  const paths=["opravy/zhenskie",...FRAME_CATEGORY_LANDINGS.map(c=>c.path),...FRAME_BRAND_LANDINGS.map(b=>`opravy/${b.slug}`)];
  const titles=new Set(),descriptions=new Set();
  for(const path of paths){
    const spb=catalogSectionMetadata(path,fallback);titles.add(spb.metaTitle);descriptions.add(spb.metaDescription);
    assert.match(spb.metaTitle,/Санкт-Петербурге/);
    assert.doesNotMatch(catalogSectionMetadata(path,fallback,"nvk").metaDescription,/Санкт-Петербурге/);
  }
  assert.equal(titles.size,paths.length);assert.equal(descriptions.size,paths.length);
});
