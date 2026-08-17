import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

const routes = [
  ["linzy-spb", "Контактные линзы в Санкт-Петербурге", "https://optika100.com/linzy-spb/"],
  ["optika-spb", "Оптика в Санкт-Петербурге", "https://optika100.com/optika-spb/"],
  ["tsvetnye-linzy-s-dioptriyami", "Цветные линзы с диоптриями", "https://optika100.com/tsvetnye-linzy-s-dioptriyami/"],
  ["biometriya-glaza", "Биометрия глаза", "https://optika100.com/biometriya-glaza/"],
];

const approvedFaqQuestions = {
  "linzy-spb": [
    "Можно ли купить линзы в СПб с доставкой в тот же день?",
    "Какие линзы подойдут при астигматизме?",
    "Нужен ли рецепт для покупки контактных линз?",
    "Сколько стоят контактные линзы на месяц?",
    "Чем отличаются однодневные, двухнедельные и месячные линзы?",
  ],
  "optika-spb": [
    "Где находится салон в Санкт-Петербурге?",
    "Можно ли пройти проверку зрения бесплатно?",
    "Есть ли рассрочка на очки и линзы?",
    "Как записаться на диагностику зрения?",
    "Можно ли заказать очки по готовому рецепту?",
  ],
  "tsvetnye-linzy-s-dioptriyami": [
    "Бывают ли цветные линзы с диоптриями для дальнозоркости и близорукости?",
    "Отличаются ли цветные линзы с диоптриями по ощущениям от обычных цветных?",
    "Как подобрать нужный оттенок и диоптрии?",
    "Есть ли цветные линзы для астигматизма?",
  ],
  "biometriya-glaza": [
    "Больно ли делать биометрию глаза?",
    "Сколько времени занимает процедура?",
    "Нужна ли специальная подготовка перед биометрией?",
    "Сколько стоит биометрия глаза?",
    "Чем биометрия отличается от обычной проверки зрения?",
  ],
};

test("SEO landing routes declare approved H1 and absolute self-canonical", async () => {
  for (const [slug, h1, canonical] of routes) {
    const source = await read(`../src/routes/${slug}.tsx`);
    assert.match(source, new RegExp(`title=\\"${h1}\\"`));
    assert.ok(source.includes(`const canonical = "${canonical}"`));
    assert.ok(!source.includes("/landing/"));
    assert.ok(!source.includes("opti-sparkle-vision.lovable.app"));
  }
});

test("beta build publishes route-specific HTML for every SEO landing", async () => {
  const generator = await read("../scripts/generate-beta-index.mjs");
  for (const [slug, h1] of routes) {
    assert.ok(generator.includes(`writeRoutePage("/${slug}/"`));
    assert.ok(generator.includes(`"${h1}"`));
  }
});

test("SPb landing sources contain no Novokuznetsk store link", async () => {
  for (const [slug] of routes) {
    const source = await read(`../src/routes/${slug}.tsx`);
    assert.ok(!source.includes("/contacts/stores/56293/"));
  }
});

test("SEO landing FAQs cover the approved intents and feed the visible copy into FAQPage schema", async () => {
  for (const [slug, questions] of Object.entries(approvedFaqQuestions)) {
    const source = await read(`../src/routes/${slug}.tsx`);
    assert.ok(source.includes("faqSchema(faq)"));
    for (const question of questions) assert.ok(source.includes(`q: "${question}"`));
  }
});

test("commercial FAQ answers remain conditional and lenses expose an explicit purchase CTA", async () => {
  const lenses = await read("../src/routes/linzy-spb.tsx");
  const optics = await read("../src/routes/optika-spb.tsx");
  const biometry = await read("../src/routes/biometriya-glaza.tsx");
  assert.ok(lenses.includes('label: "Купить контактные линзы"'));
  assert.ok(lenses.includes("Возможность доставки в день заказа зависит"));
  assert.ok(lenses.includes("Актуальные цены загружаются из каталога"));
  assert.ok(optics.includes("Стоимость проверки зависит"));
  assert.ok(optics.includes("условия рассрочки зависят"));
  assert.ok(biometry.includes("Ориентировочное время лучше уточнить"));
  assert.ok(biometry.includes("Актуальную цену подтвердят при записи"));
  for (const source of [lenses, optics, biometry]) {
    assert.ok(!source.includes("гарантирован"));
    assert.ok(!source.includes("всегда в наличии"));
  }
});

test("corrective colored products require a non-zero sphere and use final product paths", async () => {
  const source = await read("../src/routes/tsvetnye-linzy-s-dioptriyami.tsx");
  assert.match(source, /parsed !== 0/);
  assert.match(source, /productHref=\{`\/catalog_s\/tsvetnye\/\$\{product\.slug\}\/`\}/);
});

test("catalog SEO content is limited to the two approved SPb section paths", async () => {
  const source = await read("../src/data/catalog-seo.ts");
  assert.match(source, /kontaktnye_linzy_\/tsvetnye/);
  assert.match(source, /kontaktnye_linzy_\/multifokalnye/);
  assert.ok(!source.includes("catalog_n"));
});

test("production sitemap policy contains only the four approved landing entries", async () => {
  const source = await read("../scripts/generate-production-manifest.mjs");
  for (const [slug] of routes) assert.ok(source.includes(`["/${slug}/"`));
  for (const excluded of ["/kupit-linzy-spb/", "/kontaktnye_lynzy_/", "/tsvetnye-linzy/", "/multifokalnye-linzy/"]) {
    assert.ok(!source.includes(`["${excluded}"`));
  }
});

test("future production redirect policy keeps only the two approved SEO consolidations", async () => {
  const source = await read("../deploy/redirects.production.txt");
  assert.ok(source.includes("RedirectMatch 301 ^/kontaktnye_lynzy_/?$ /catalog_s/kontaktnye_linzy_/"));
  assert.ok(source.includes("RedirectMatch 301 ^/kupit-linzy-spb/?$ /linzy-spb/"));
  assert.ok(!source.includes("^/tsvetnye-linzy/?$"));
  assert.ok(!source.includes("^/multifokalnye-linzy/?$"));
});

test("diagnostics route preserves the protected manual Description", async () => {
  const source = await read("../src/routes/kabinet-diagnostiki-spb.tsx");
  assert.ok(source.includes("Диагностика и проверка зрения в Санкт‑Петербурге"));
  assert.ok(source.includes("href=\"/biometriya-glaza/\""));
});

test("site search can discover the biometry landing page", async () => {
  const searchRoute = await read("../src/routes/search.tsx");
  const searchIndex = await read("../src/data/site-search.ts");
  assert.match(searchRoute, /searchSiteContent/);
  assert.match(searchRoute, /Страницы, услуги и категории/);
  assert.match(searchIndex, /title: "Биометрия глаза"/);
  assert.match(searchIndex, /href: "\/biometriya-glaza\/"/);
  assert.match(searchIndex, /"биометрия глаза"/);
});

test("owner-approved informational topics were not reduced to the initial short draft", async () => {
  const biometry = await read("../src/routes/biometriya-glaza.tsx");
  const lenses = await read("../src/routes/linzy-spb.tsx");
  const colored = await read("../src/routes/tsvetnye-linzy-s-dioptriyami.tsx");
  const catalog = await read("../src/components/CatalogSeoContent.tsx");
  for (const heading of ["Что измеряет биометрия", "Оптическая и ультразвуковая биометрия", "Расшифровка результатов"]) {
    assert.ok(biometry.includes(heading));
  }
  for (const heading of ["Материалы контактных линз", "Как читать параметры перед онлайн-заказом", "Когда линзы нужно снять"]) {
    assert.ok(lenses.includes(heading));
  }
  assert.ok(colored.includes("Кому подходят цветные линзы с коррекцией"));
  assert.ok(catalog.includes("Дизайны центр-близь, центр-даль и EDOF"));
});
