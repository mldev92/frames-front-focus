import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { publishedMatches, routeFile } from "../scripts/published-page.mjs";
import { releaseMode } from "../scripts/storefront-release-mode.mjs";

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
  for (const dir of ["src/routes", "src/lib", "src/components", "deploy"])
    mkdirSync(dir, { recursive: true });
  const route = "src/routes/product.tsx";
  const original =
    'import { get } from "@/lib/data"; export const Route=createFileRoute("/product")({loader:()=>get(),component:Page}); function Page(){return <p>old</p>}';
  writeFileSync(route, original);
  writeFileSync("src/lib/data.ts", 'export { get } from "./prices";');
  writeFileSync("src/lib/prices.ts", "export const get=()=>100;");
  const commit = () => {
    git("add", ".");
    git("-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "test");
    return git("rev-parse", "HEAD");
  };
  const parent = commit();
  writeFileSync(route, original.replace("old", "new"));
  writeFileSync("src/components/Button.tsx", "export const Button=()=>null;");
  assert.equal(releaseMode(parent, commit()).mode, "code-only");
  writeFileSync("src/lib/prices.ts", "export const get=()=>110;");
  assert.deepEqual(releaseMode(parent, commit()).reasons, ["src/lib/prices.ts"]);
  writeFileSync("src/lib/prices.ts", "export const get=()=>100;");
  writeFileSync(route, original.replace('"/product"', '"/other"'));
  assert.deepEqual(releaseMode(parent, commit()).reasons, [route]);
  writeFileSync(route, original);
  writeFileSync("deploy/seo-active-products.json.gz", "changed");
  assert.deepEqual(releaseMode(parent, commit()).reasons, ["deploy/seo-active-products.json.gz"]);
});
