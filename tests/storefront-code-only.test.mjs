import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { matchesStandaloneRoute, publishedMatches, routeFile } from "../scripts/published-page.mjs";
import { releaseMode } from "../scripts/storefront-release-mode.mjs";
import { appendStandaloneSitemap, registry } from "../scripts/standalone-pages.mjs";
import { amendProgressiveMatches, progressivePage } from "../scripts/progressive-published-catalog.mjs";

test("published loader data is decoded as data, including aliases and missing values", () => {
  const payload =
    '$_TSR.router=($R=>$R[0]={matches:[$R[1]={i:"\\x00p",s:"success",l:{a:$R[2]=[!0,void 0],b:$R[2]}}]})($R["tsr"])';
  const [match] = publishedMatches(payload);
  assert.equal(match.id, "/p");
  assert.deepEqual(match.data.a, [true, undefined]);
  assert.equal(match.data.a, match.data.b);
  assert.throws(() => publishedMatches(payload.replace("!0", "unexpected()")), /Unsupported/);
  assert.throws(() => publishedMatches(payload.replace("success", "error")), /incomplete/);
  assert.equal(routeFile("/catalog_s/VX%20Start/"), "catalog_s/VX Start/index.html");
  assert.throws(() => routeFile("/%2e%2e/"));
});

test("офлайн-выпуск заменяет данные только опубликованного раздела прогрессивных линз", () => {
  const sectionPath = "linzy_dlya_ochkov/progressivnye";
  const matches = [
    { id: "__root__", data: undefined },
    { id: "catalog", data: { kind: "catalog", sectionPath, result: { state: "ok", data: {} } } },
    { id: "another", data: { kind: "catalog", sectionPath: "other", result: { state: "ok" } } },
  ];
  const cards = [{ id: "line" }];
  const original = structuredClone(matches);
  assert.deepEqual(amendProgressiveMatches(matches, progressivePage + "old-product/", cards), original);
  amendProgressiveMatches(matches, progressivePage, cards);
  assert.deepEqual(matches[1].data.result, { state: "lens_lines", initialCards: cards });
  assert.deepEqual([matches[0], matches[2]], [original[0], original[2]]);
  assert.throws(() => amendProgressiveMatches(matches, progressivePage, cards), /Unexpected published/);
});

test("release mode follows published route and loader dependencies across commits", (t) => {
  const previous = process.cwd();
  const repo = mkdtempSync(path.join(os.tmpdir(), "o100-release-policy-"));
  t.after(() => {
    process.chdir(previous);
    rmSync(repo, { recursive: true, force: true });
  });
  process.chdir(repo);
  const git = (...args) =>
    execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  git("init");
  for (const dir of [
    "src/routes",
    "src/lib",
    "src/components",
    "src/content",
    "src/data",
    "deploy",
    "public",
  ])
    mkdirSync(dir, { recursive: true });
  const route = "src/routes/product.tsx";
  const original =
    'import { get } from "@/lib/data"; export const Route=createFileRoute("/product")({loader:()=>get(),component:Page}); function Page(){return <p>old</p>}';
  writeFileSync(route, original);
  writeFileSync("src/lib/data.ts", 'export { get } from "./prices";');
  writeFileSync("src/lib/prices.ts", "export const get=()=>100;");
  const searchIndex = "src/data/site-search.ts";
  const searchCode =
    'const pageEntries=[{title:"Eye exams",keywords:["exams"]}]; export const search=()=>pageEntries;';
  writeFileSync(searchIndex, searchCode);
  writeFileSync(
    "src/routes/search.tsx",
    'import { search } from "@/data/site-search"; export const Route=createFileRoute("/search")({loader:()=>search(),component:Page});',
  );
  const commit = () => {
    git("add", ".");
    git("-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "test");
    return git("rev-parse", "HEAD");
  };
  const apache = "deploy/production.htaccess";
  const apacheBaseline = "# BEGIN O100 FRONTEND\nRewriteEngine On\n";
  const redirect = String.raw`RewriteRule ^catalog_s/linzy_dlea\x20ochkov/?$ https://optika100.com/catalog_s/linzy_dlya_ochkov/ [R=301,END]`;
  writeFileSync(apache, apacheBaseline);
  const redirects = "deploy/redirects.production.txt";
  const legacyPrefix = String.raw`RedirectMatch 301 ^/ochkovye\-linzy/dizayn/progressivnye\.php/?$ https://optika100.com`;
  const legacyOriginal = legacyPrefix + "/blog/linzy-dlya-ochkov/progressivnye-linzy/";
  const legacyRetarget = legacyPrefix + "/catalog_s/linzy_dlya_ochkov/progressivnye/";
  writeFileSync(redirects, legacyOriginal + "\n");
  const rawPath = "src/content/stellest-katalog-s-linzami.html";
  const contentRoute = "src/routes/stellest-katalog-s-linzami.tsx";
  const templateRoute =
    'import { createFileRoute } from "@tanstack/react-router"; import html from "@/content/stellest-katalog-s-linzami.html?raw"; export const Route = createFileRoute("/stellest-katalog-s-linzami")({component: () => html});';
  writeFileSync(rawPath, "<h1>Было</h1>");
  writeFileSync(contentRoute, templateRoute);
  const parent = commit();
  writeFileSync(redirects, legacyRetarget + "\n");
  assert.deepEqual(releaseMode(parent, commit()), {
    mode: "code-only", reasons: [], standalonePaths: [], routingRedirects: [legacyRetarget],
  });
  writeFileSync(redirects, legacyRetarget + "\n# unrelated change\n");
  assert.deepEqual(releaseMode(parent, commit()).reasons, [redirects]);
  writeFileSync(redirects, legacyOriginal + "\n");
  writeFileSync(rawPath, "<h1>Стало</h1>");
  assert.equal(releaseMode(parent, commit()).mode, "code-only");
  writeFileSync(
    contentRoute,
    templateRoute.replace("component: () => html", "loader: () => html, component: () => null"),
  );
  assert.ok(releaseMode(parent, commit()).reasons.includes(rawPath));
  writeFileSync(contentRoute, templateRoute);
  writeFileSync(rawPath, "<h1>Было</h1>");
  writeFileSync(route, original.replace("old", "new"));
  writeFileSync("src/components/Button.tsx", "export const Button=()=>null;");
  writeFileSync("public/storefront-content-defaults.json", '{"intro":{"text":"Оптика"}}');
  assert.equal(releaseMode(parent, commit()).mode, "code-only");
  writeFileSync("src/lib/prices.ts", "export const get=()=>110;");
  assert.deepEqual(releaseMode(parent, commit()).reasons, ["src/lib/prices.ts"]);
  writeFileSync("src/lib/prices.ts", "export const get=()=>100;");
  writeFileSync(
    searchIndex,
    searchCode.replace("}]", '},{title:"Pediatric eye exams",keywords:["children"]}]'),
  );
  assert.equal(releaseMode(parent, commit()).mode, "code-only");
  writeFileSync(searchIndex, searchCode.replace('"Eye exams"', "getTitle()"));
  assert.deepEqual(releaseMode(parent, commit()).reasons, [searchIndex]);
  writeFileSync(searchIndex, searchCode.replace("()=>pageEntries", "()=>pageEntries.slice(0,1)"));
  assert.deepEqual(releaseMode(parent, commit()).reasons, [searchIndex]);
  writeFileSync(searchIndex, searchCode);
  const promotions = "src/data/promotions.ts";
  writeFileSync(promotions, 'export const href="/sale/";');
  assert.equal(releaseMode(parent, commit()).mode, "code-only");
  writeFileSync("src/lib/data.ts", 'export { href as get } from "@/data/promotions";');
  const promotionLoader = commit();
  writeFileSync(promotions, 'export const href="/offers/";');
  assert.deepEqual(releaseMode(promotionLoader, commit()).reasons, [promotions]);
  writeFileSync("src/lib/data.ts", 'export { get } from "./prices";');
  writeFileSync(route, original.replace('"/product"', '"/other"'));
  assert.deepEqual(releaseMode(parent, commit()).reasons, [route]);
  writeFileSync(route, original);
  const landing = "src/routes/eye-exams.tsx";
  const staticRoute = `import { createFileRoute } from "@tanstack/react-router";
    export const Route = createFileRoute("/eye-exams")({component: Page});
    function Page() { return <p>Eye exams</p>; }`;
  writeFileSync(landing, staticRoute);
  const unregistered = commit();
  assert.deepEqual(releaseMode(parent, unregistered).reasons, [landing]);
  writeFileSync(registry, '["/eye-exams/"]');
  writeFileSync("src/routeTree.gen.ts", "// generated\n");
  const registered = commit();
  assert.deepEqual(releaseMode(parent, registered), {
    mode: "code-only",
    reasons: [],
    standalonePaths: ["/eye-exams/"],
  });
  mkdirSync("src/routes/eye-exams");
  const detail = "src/routes/eye-exams/child.tsx";
  writeFileSync(detail, staticRoute.replace('"/eye-exams"', '"/eye-exams/child"'));
  writeFileSync(registry, '["/eye-exams/","/eye-exams/child/"]');
  writeFileSync(apache, apacheBaseline + redirect + "\n");
  assert.deepEqual(releaseMode(parent, commit()), {
    mode: "code-only",
    reasons: [],
    standalonePaths: ["/eye-exams/", "/eye-exams/child/"],
    routingRedirects: [redirect],
  });
  writeFileSync(apache, apacheBaseline + redirect.replace("[R=301,END]", "[R=302,L]") + "\n");
  assert.deepEqual(releaseMode(parent, commit()).reasons, [apache]);
  writeFileSync(apache, apacheBaseline);
  writeFileSync(registry, '["/eye-exams/child/"]');
  assert.equal(releaseMode(parent, commit()).mode, "full");
  rmSync(detail);
  writeFileSync(registry, '["/eye-exams/"]');
  writeFileSync(
    landing,
    staticRoute.replace("component: Page", "loader: () => {}, component: Page"),
  );
  assert.equal(releaseMode(parent, commit()).mode, "full");
  writeFileSync(landing, staticRoute);
  writeFileSync(registry, "[]");
  assert.equal(releaseMode(registered, commit()).mode, "full");
  rmSync(landing);
  rmSync(registry);
  rmSync("src/routeTree.gen.ts");
  writeFileSync("deploy/seo-active-products.json.gz", "changed");
  assert.deepEqual(releaseMode(parent, commit()).reasons, ["deploy/seo-active-products.json.gz"]);
});

test("standalone routes verify both TanStack index and leaf match IDs", () => {
  const root = { id: "__root__/", data: undefined };
  const index = { id: "/eye-exams//eye-exams/", data: undefined };
  const leaf = { id: "/eye-exams/child/eye-exams/child", data: undefined };
  assert.ok(matchesStandaloneRoute([root, index], "/eye-exams/"));
  assert.ok(matchesStandaloneRoute([root, leaf], "/eye-exams/child/"));
  assert.ok(!matchesStandaloneRoute([root, index], "/eye-exams/child/"));
  assert.ok(!matchesStandaloneRoute([root, { ...leaf, data: true }], "/eye-exams/child/"));
});

test("the offline sitemap only gains the approved standalone URLs", () => {
  const original =
    "<urlset>\n  <url><loc>https://optika100.com/catalog_s/product/</loc></url>\n</urlset>\n";
  const updated = appendStandaloneSitemap(original, ["/eye-exams/"]);
  assert.equal(
    updated.replace("  <url><loc>https://optika100.com/eye-exams/</loc></url>\n", ""),
    original,
  );
  assert.throws(() => appendStandaloneSitemap(updated, ["/eye-exams/"]), /already in/);
  assert.throws(() => appendStandaloneSitemap(original, ["/bitrix/"]), /Invalid standalone/);
  assert.throws(() => appendStandaloneSitemap("<sitemapindex/>", ["/eye-exams/"]), /not a URL set/);
});
