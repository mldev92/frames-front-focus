import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { FRAME_BRAND_LANDINGS } from "./src/data/frame-brand-landings";
import { FRAME_CATEGORY_LANDINGS } from "./src/data/frame-category-landings";

// Локальная проверка затронутых страниц; этот каталог не является release artifact.
const paths = [
  "/",
  "/search/",
  "/catalog_s/opravy/zhenskie/",
  "/catalog_s/kontaktnye_linzy_/",
  ...FRAME_BRAND_LANDINGS.map((b) => `/catalog_s/opravy/${b.slug}/`),
  ...FRAME_CATEGORY_LANDINGS.map((c) => `/catalog_s/${c.path}/`),
];

export default defineConfig({
  cloudflare: false,
  vite: {
    build: { outDir: "dist-seo-preview" },
    define: {
      "import.meta.env.VITE_PRERENDER_BUILD": JSON.stringify("true"),
      "import.meta.env.VITE_PRIVATE_BETA": JSON.stringify("false"),
      "import.meta.env.VITE_ALLOW_FIXTURES": JSON.stringify("false"),
      "import.meta.env.VITE_VIRTUAL_TRY_ON": JSON.stringify("false"),
    },
  },
  tanstackStart: {
    spa: {
      enabled: true,
      maskPath: "/basket/?__o100_shell=1",
      prerender: { outputPath: "/_shell" },
    },
    pages: paths.map((path) => ({ path })),
    sitemap: { enabled: false },
    prerender: {
      enabled: true,
      autoStaticPathsDiscovery: false,
      crawlLinks: false,
      concurrency: 2,
      failOnError: true,
      retryCount: 2,
    },
  },
});
