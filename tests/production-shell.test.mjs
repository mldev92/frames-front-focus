import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

test("production prerender keeps the basket page and the SPA shell", async () => {
  const require = createRequire(import.meta.url);
  const core = path.dirname(require.resolve("@tanstack/start-plugin-core/package.json"));
  const { postBuild } = await import(pathToFileURL(path.join(core, "dist/esm/post-build.js")));
  const { prerender } = await import(pathToFileURL(path.join(core, "dist/esm/prerender.js")));
  const source = await readFile(new URL("../vite.config.production.ts", import.meta.url), "utf8");
  const maskPath = source.match(/maskPath:\s*"([^"]+)"/)?.[1];
  assert.ok(maskPath);
  const root = await mkdtemp(path.join(tmpdir(), "o100-shell-"));
  try {
    await postBuild({
      startConfig: {
        pages: [{ path: "/basket/" }], router: { basepath: "/" },
        spa: { enabled: true, maskPath, prerender: { outputPath: "/_shell" } },
        prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false, concurrency: 1, failOnError: true },
      },
      adapter: {
        getClientOutputDirectory: () => root,
        prerender: (startConfig) => prerender({ startConfig, handler: {
          getClientOutputDirectory: () => root,
          request: async (url) => new Response(url.includes("__o100_shell") ? "SHELL" : "BASKET", { headers: { "content-type": "text/html" } }),
        } }),
      },
    });
    assert.equal(await readFile(path.join(root, "basket/index.html"), "utf8"), "BASKET");
    assert.equal(await readFile(path.join(root, "_shell.html"), "utf8"), "SHELL");
  } finally {
    // Каталог создан этой проверкой; удаляется только её временный результат.
    assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep + "o100-shell-"));
    await rm(root, { recursive: true, force: true });
  }
});
