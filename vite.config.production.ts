import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const manifest = JSON.parse(
  readFileSync(new URL("./generated/production-routes.json", import.meta.url), "utf8"),
) as { routes: string[] };
if (process.env.O100_PRERENDER_LIMIT || process.env.O100_PRERENDER_ROUTES) throw new Error("Partial production prerender is forbidden");
const productionRoutes = manifest.routes;

export default defineConfig({
  cloudflare: false,
  vite: {
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
      // Уникальный URL исключает дедупликацию оболочки с полноценной страницей корзины.
      maskPath: "/basket/?__o100_shell=1",
      prerender: { outputPath: "/_shell" },
    },
    pages: productionRoutes.map((path) => ({ path })),
    sitemap: {
      enabled: false,
    },
    prerender: {
      enabled: true,
      autoStaticPathsDiscovery: false,
      crawlLinks: false,
      concurrency: 4,
      failOnError: true,
      retryCount: 2,
    },
  },
});
