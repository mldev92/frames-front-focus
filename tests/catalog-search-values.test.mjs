import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { z } from "zod";
import { defaultParseSearch } from "@tanstack/react-router";

test("numeric lens-index URLs remain valid after router parsing", async () => {
  const source = await readFile(new URL("../src/lib/catalog-route.ts", import.meta.url), "utf8");
  const schemaSource = source.slice(source.indexOf("const numOrStr"), source.indexOf("type CatalogSearchWithLegacyPrice"));
  const compiled = ts.transpileModule(schemaSource, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText.replace(/export /g, "");
  const schema = new Function("z", `${compiled}; return catalogSearchSchema;`)(z);
  for (const value of ["1.50", "1.53", "1.59", "1.60", "1.67", "1.74"]) {
    const parsed = defaultParseSearch(`?thickness=${value}`);
    assert.equal(schema.parse(parsed).thickness, String(Number(value)));
    assert.equal(schema.parse(defaultParseSearch(`?thickness=${encodeURIComponent(JSON.stringify(value))}`)).thickness, value);
  }
  assert.equal(schema.parse(defaultParseSearch("?thickness=1.50%2C1.67")).thickness, "1.50,1.67");
});
