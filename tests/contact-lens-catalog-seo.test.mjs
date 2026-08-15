import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("contact-lens root category has approved metadata, H1, canonical, and scoped composition", async () => {
  const metadata = await read("../src/data/contact-lens-catalog-seo.ts");
  const route = await read("../src/routes/catalog_s.$category.index.tsx");
  const view = await read("../src/components/CatalogRouteView.tsx");

  const title = "Контактные линзы купить в СПб — подбор с офтальмологом | Оптика 100%";
  const description = "Контактные линзы Acuvue, Air Optix, Biofinity и Dailies в Санкт-Петербурге. Актуальные цены и наличие, подбор параметров, доставка и самовывоз на Кирочной, 17.";
  assert.equal(title.length, 68);
  assert.equal(description.length, 159);
  assert.ok(metadata.includes(title));
  assert.ok(metadata.includes(description));
  assert.ok(metadata.includes("https://optika100.com/catalog_s/kontaktnye_linzy_/"));
  assert.ok(route.includes('params.category === "kontaktnye_linzy_"'));
  assert.ok(route.includes("contactLensCatalogSchemas("));
  assert.ok(view.includes('normalizedSectionPath === "kontaktnye_linzy_"'));
  assert.ok(view.includes('city === "spb"'));
  assert.ok(view.includes('"Контактные линзы в Санкт-Петербурге"'));
  assert.ok(!view.includes("catalog_n"));
});

test("contact-lens category content contains required navigation, CTA, image, and section order", async () => {
  const metadata = await read("../src/data/contact-lens-catalog-seo.ts");
  const content = await read("../src/components/ContactLensCatalogSeo.tsx");
  for (const slug of ["prozrachnye", "tsvetnye", "toricheskie", "multifokalnye", "dlya_kontrolya_miopii"]) {
    assert.ok(metadata.includes(`/catalog_s/kontaktnye_linzy_/${slug}/`));
  }
  assert.ok(content.includes('href="#catalog-products"'));
  assert.ok(content.includes('id="catalog-products"') || (await read("../src/components/CatalogRouteView.tsx")).includes('catalogId={isContactLensRoot ? "catalog-products"'));
  assert.ok(content.includes('src="/podbor_linz.webp"'));
  assert.ok(content.includes('alt="Контактная линза крупным планом — Оптика 100%"'));

  const headings = [
    "Почему линзы выбирают у нас",
    "Технологии материалов: гидрогель и силикон-гидрогель",
    "Совет специалиста: линзы под образ жизни",
    "Как подобрать линзы правильно",
    "Однодневные и линзы плановой замены",
    "Красные флаги: когда линзы нужно немедленно снять",
    "Салон в Санкт-Петербурге",
    "Часто задаваемые вопросы",
  ];
  let previous = -1;
  for (const heading of headings) {
    const next = content.indexOf(heading);
    assert.ok(next > previous, `${heading} must appear in the approved order`);
    previous = next;
  }
});

test("catalog count is dynamic and commercial or medical guarantees are absent", async () => {
  const metadata = await read("../src/data/contact-lens-catalog-seo.ts");
  const content = await read("../src/components/ContactLensCatalogSeo.tsx");
  const combined = `${metadata}\n${content}`;
  assert.ok(content.includes("`${total} моделей`"));
  for (const forbidden of [
    "55 моделей",
    "56 моделей",
    "1–3 дня",
    "решают проблему полностью",
    "падает втрое",
    "до 90%",
    "8.4–8.8",
    "13.8–14.5",
    "0.5–1 мм",
    "удерживают влагу на линзе весь день",
    "всегда в наличии",
  ]) {
    assert.ok(!combined.includes(forbidden), `forbidden claim found: ${forbidden}`);
  }
});

test("visible FAQ and FAQPage schema share the approved five-question source", async () => {
  const metadata = await read("../src/data/contact-lens-catalog-seo.ts");
  const content = await read("../src/components/ContactLensCatalogSeo.tsx");
  const questions = [
    "Можно ли купить контактные линзы без рецепта?",
    "Чем отличаются однодневные, двухнедельные и месячные линзы?",
    "Как понять, что линзы мне подходят?",
    "Есть ли доставка контактных линз по Санкт-Петербургу?",
    "Что делать, если линза потерялась?",
  ];
  for (const question of questions) assert.ok(metadata.includes(`q: "${question}"`));
  assert.ok(content.includes("contactLensCatalogFaq.map"));
  assert.ok(metadata.includes("contactLensCatalogFaq.map"));
  assert.ok(metadata.includes('"@type": "FAQPage"'));
  assert.ok(metadata.includes('acceptedAnswer: { "@type": "Answer", text: item.a }'));
});

test("catalog structured data covers breadcrumbs, POS, and current-page products", async () => {
  const metadata = await read("../src/data/contact-lens-catalog-seo.ts");
  for (const type of ["BreadcrumbList", "Organization", "Optician", "ItemList", "Product", "Offer", "Brand"]) {
    assert.ok(metadata.includes(`\"@type\": \"${type}\"`));
  }
  for (const field of ["hasPOS", "priceCurrency", "availability", "canonicalPath", "product.images[0]"]) {
    assert.ok(metadata.includes(field));
  }
  assert.ok(metadata.includes("CONTACT.phone.label"));
  assert.ok(metadata.includes("CONTACT.email.label"));
  assert.ok(metadata.includes("PRIMARY_SALON.productionPath"));
});

test("beta and production builds include the contact-lens category prerender contract", async () => {
  const beta = await read("../scripts/generate-beta-index.mjs");
  const manifest = await read("../scripts/generate-production-manifest.mjs");
  const validator = await read("../scripts/validate-production-build.mjs");
  assert.ok(beta.includes('"catalog_s", "kontaktnye_linzy_", "index.html"'));
  assert.ok(beta.includes('renderPage("/catalog_s/kontaktnye_linzy_/"'));
  assert.ok(manifest.includes('["spb", "catalog_s", "kontaktnye_linzy_"]'));
  assert.ok(validator.includes("O100_PRERENDER_ROUTES"));
});
