import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  vite: {
    define: {
      "import.meta.env.VITE_PRIVATE_BETA": JSON.stringify("false"),
      "import.meta.env.VITE_ALLOW_FIXTURES": JSON.stringify("false"),
      "import.meta.env.VITE_VIRTUAL_TRY_ON": JSON.stringify("false"),
    },
    plugins: [
      {
        name: "published-storefront-loaders",
        enforce: "pre",
        transform(code, id, options) {
          if (!options?.ssr || !id.replaceAll("\\", "/").endsWith("/src/router.tsx")) return;
          const insertion = "return router;";
          if (code.split(insertion).length !== 2)
            throw Error("Cannot install published loaders in the SSR router");
          return code.replace(insertion, "globalThis.o100PublishedLoaders(router); return router;");
        },
      },
    ],
  },
  tanstackStart: {
    spa: {
      enabled: true,
      maskPath: "/basket/?__o100_shell=1",
      prerender: { outputPath: "/_shell" },
    },
    sitemap: { enabled: false },
    prerender: {
      enabled: false,
      autoStaticPathsDiscovery: false,
      crawlLinks: false,
      failOnError: true,
      retryCount: 0,
    },
  },
});
