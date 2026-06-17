import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const manifest = JSON.parse(
  readFileSync(new URL("./generated/production-routes.json", import.meta.url), "utf8"),
) as { routes: string[] };
const requestedLimit = Number(process.env.O100_PRERENDER_LIMIT ?? 0);
const productionRoutes =
  Number.isFinite(requestedLimit) && requestedLimit > 0
    ? manifest.routes.slice(0, requestedLimit)
    : manifest.routes;

export default defineConfig({
  cloudflare: false,
  vite: {
    define: {
      "import.meta.env.VITE_PRIVATE_BETA": JSON.stringify("false"),
      "import.meta.env.VITE_ALLOW_FIXTURES": JSON.stringify("false"),
    },
  },
  tanstackStart: {
    spa: {
      enabled: true,
      maskPath: "/basket/",
      prerender: { outputPath: "/_shell" },
    },
    pages: productionRoutes.map((path) => ({ path })),
    sitemap: {
      enabled: true,
      host: "https://optika100.com",
      outputPath: "sitemap.xml",
    },
    prerender: {
      enabled: true,
      autoStaticPathsDiscovery: true,
      crawlLinks: false,
      concurrency: 4,
      failOnError: true,
      retryCount: 2,
    },
  },
});
