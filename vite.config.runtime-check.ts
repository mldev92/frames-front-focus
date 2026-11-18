import { mkdirSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Лабораторная сборка. Не используется для выпуска и не ослабляет production-проверки.
const paths = [
  "/", "/basket/", "/checkout/", "/search/",
  "/catalog_s/opravy/", "/catalog_n/opravy/",
  "/catalog_s/opravy/zhenskie/oprava_yalea_vya012_0991_f/",
  "/catalog_n/opravy/muzhskie/oprava_t_charge_6197t_g21/",
  "/catalog_s/kontaktnye_linzy_/dlya_kontrolya_miopii/misight_1_day_90sht_/",
  "/blog/", "/blog/linzy-dlya-ochkov/vidy-ochkovykh-linz/",
];

export default defineConfig({
  cloudflare: false,
  vite: {
    build: { outDir: "dist-performance", manifest: true },
    define: {
      "import.meta.env.VITE_RELEASE_SHA": JSON.stringify("runtime-local-review"),
      "import.meta.env.VITE_PRERENDER_BUILD": JSON.stringify("true"),
      "import.meta.env.VITE_PRIVATE_BETA": JSON.stringify("false"),
      "import.meta.env.VITE_ALLOW_FIXTURES": JSON.stringify("false"),
      "import.meta.env.VITE_VIRTUAL_TRY_ON": JSON.stringify("false"),
      "import.meta.env.VITE_PRERENDER_API": JSON.stringify("http://127.0.0.1:4198"),
      "import.meta.env.VITE_BITRIX_API": JSON.stringify("http://127.0.0.1:4198"),
    },
    plugins: [{
      name: "o100-performance-bundle",
      generateBundle(_options, bundle) {
        if (this.environment.name !== "client") return;
        if (!Object.values(bundle).some((item) => item.type === "chunk" && item.fileName.startsWith("assets/"))) return;
        mkdirSync("generated", { recursive: true });
        writeFileSync("generated/performance-bundle.json", JSON.stringify(Object.values(bundle).filter((item) => item.type === "chunk").map((item) => ({
          name: item.fileName, bytes: item.code.length, gzip: gzipSync(item.code).length,
          imports: item.imports, entry: item.isEntry,
          modules: Object.entries(item.modules).map(([id, value]) => ({ id, bytes: value.renderedLength })).sort((a, b) => b.bytes - a.bytes),
        })), null, 2));
      },
    }],
  },
  tanstackStart: {
    spa: { enabled: true, maskPath: "/basket/?__o100_shell=1", prerender: { outputPath: "/_shell" } },
    pages: paths.map((path) => ({ path })),
    sitemap: { enabled: false },
    prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false, concurrency: 2, failOnError: true, retryCount: 2 },
  },
});
