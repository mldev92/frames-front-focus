// TEMPORARY local QA harness config (memory: lens-wizard-local-browser-harness).
// Copy of vite.config.beta.ts (the default config's mcpPlugin dies on Windows
// paths) with the API base pointed at the local PHP router on 127.0.0.1:8787,
// which serves the working-tree lens endpoints and proxies the rest to prod.
// Delete after browser QA.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  vite: {
    define: {
      "import.meta.env.VITE_PRIVATE_BETA": JSON.stringify("true"),
      "import.meta.env.VITE_BITRIX_API": JSON.stringify("http://127.0.0.1:8787"),
    },
  },
  tanstackStart: {
    spa: { enabled: true },
    prerender: { enabled: false },
  },
});
