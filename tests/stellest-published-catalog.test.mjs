import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import test from "node:test";
import { robotsAllows } from "../scripts/seo-inventory.mjs";
import {
  allowStellestCanonical,
  amendStellestMatches,
  loadStellestCatalog,
  stellestCanonical,
  stellestDataFile,
  stellestPage,
} from "../scripts/stellest-published-catalog.mjs";
import { appendStandaloneSitemap } from "../scripts/standalone-pages.mjs";

test("Офлайн-выпуск открывает канонический URL Prevencia, сохраняя остальные запреты", () => {
  const restriction = "Disallow: */as_stellest_crizal_prevencia/";
  const baseline = `User-agent: *\n${restriction}\nDisallow: /personal/\nUser-agent: Yandex\n${restriction}\n`;
  const robots = allowStellestCanonical(baseline);
  assert.equal(robotsAllows(robots, stellestCanonical), true);
  assert.equal(robotsAllows(robots, stellestCanonical.replace("/detskie", "")), false);
  assert.equal(robotsAllows(robots, "/personal/"), false);
  assert.equal(robots.replaceAll(`Allow: ${stellestCanonical}$\n`, ""), baseline);
  assert.throws(() => allowStellestCanonical(robots));
  const sitemap = appendStandaloneSitemap("<urlset>\n</urlset>\n", [], [stellestCanonical]);
  assert.match(sitemap, /<loc>https:\/\/optika100\.com\/catalog_s\/.*prevencia\/<\/loc>/);
});

test("Цены меняются только для проверенных карточек и только с ожидаемым backend", (t) => {
  const { backend } = JSON.parse(readFileSync(stellestDataFile));
  const prior = process.env.O100_STELLEST_CATALOG;
  process.env.O100_STELLEST_CATALOG = "1";
  t.after(() => {
    if (prior === undefined) delete process.env.O100_STELLEST_CATALOG;
    else process.env.O100_STELLEST_CATALOG = prior;
  });
  assert.throws(() => loadStellestCatalog("wrong"));
  const catalog = loadStellestCatalog(backend);
  const premium = catalog.products.get(65359);
  const current = {
    id: premium.id,
    slug: premium.slug,
    canonicalPath: premium.path,
    price: 22250,
    badges: ["В наличии"],
  };
  const other = { ...current, id: 999 };
  const section = [{ id: "/catalog_s/$", data: [current, other] }];
  amendStellestMatches(section, "/catalog_s/linzy_dlya_ochkov/detskie/", catalog);
  assert.equal(current.price, 16020);
  assert.equal(current.oldPrice, 17800);
  assert.equal(current.discountPercent, 10);
  assert.deepEqual(current.badges, ["В наличии", "Скидка"]);
  assert.equal(other.price, 22250);
  const contactLenses = [other];
  const landing = [{ id: stellestPage + "stellest-katalog-s-linzami", data: contactLenses }];
  amendStellestMatches(landing, stellestPage, catalog);
  assert.deepEqual(landing[0].data, { contactLenses, spectacleLenses: catalog.offers });
});

test("Проверка PHP принимает только согласованные изменения robots и sitemap", (t) => {
  const fixture = mkdtempSync(join(tmpdir(), "o100-stellest-verify-"));
  t.after(() => {
    assert.ok(resolve(fixture).startsWith(resolve(tmpdir()) + sep + "o100-stellest-verify-"));
    rmSync(fixture, { recursive: true, force: true });
  });
  const root = join(fixture, "public_html");
  const published = join(root, "o100_frontend_current");
  const stage = join(fixture, "candidate");
  const write = (file, data) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, data);
  };
  const digest = (data) => createHash("sha256").update(data).digest("hex");
  const file = stellestCanonical.slice(1) + "index.html";
  const product = `<link rel="canonical" href="https://optika100.com${stellestCanonical}"/><main data-catalog-product-id="56365"></main>`;
  const restriction = "Disallow: */as_stellest_crizal_prevencia/";
  const robots = `User-agent: *\n${restriction}\nUser-agent: Yandex\n${restriction}\n`;
  const sitemap = "<urlset>\n</urlset>\n";
  const parent = {
    frontendSha: "a".repeat(40),
    backendSha: "b".repeat(40),
    backendFiles: { "api/store/product.php": "c".repeat(64) },
    catalogFingerprint: "d".repeat(64),
    inventorySha256: "e".repeat(64),
    inventoryGeneratedAt: "2026-11-23",
    settings: {},
    retiredPaths: [],
    queryAcceptancePaths: [],
    routeCount: 1,
    acceptancePaths: [],
    files: { "robots.txt": digest(robots), "sitemap.xml": digest(sitemap), [file]: digest(product) },
  };
  const manifest = JSON.stringify(parent);
  write(join(fixture, ".o100-backend-release.json"), JSON.stringify({ sha: parent.backendSha, files: parent.backendFiles }));
  write(join(published, ".release-sha"), parent.frontendSha);
  write(join(published, "release-manifest.json"), manifest);
  write(join(published, file), product);
  write(join(published, "robots.txt"), robots);
  write(join(published, "sitemap.xml"), sitemap);
  const candidate = {
    ...parent,
    codeOnly: { parentSha: parent.frontendSha, parentManifestSha256: digest(manifest), stellestCatalog: true },
    files: {
      ...parent.files,
      "robots.txt": digest(allowStellestCanonical(robots)),
      "sitemap.xml": digest(appendStandaloneSitemap(sitemap, [], [stellestCanonical])),
    },
  };
  const verify = () => {
    write(join(stage, "release-manifest.json"), JSON.stringify(candidate));
    return spawnSync("php", ["-d", "display_errors=stderr", "deploy/verify-code-only.php", stage, root], { encoding: "utf8" });
  };
  const accepted = verify();
  assert.equal(accepted.status, 0, accepted.stderr);
  candidate.files["sitemap.xml"] = digest(appendStandaloneSitemap(sitemap, [], [stellestCanonical, "/unrelated/"]));
  const rejected = verify();
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /Unexpected published sitemap change/);
});
