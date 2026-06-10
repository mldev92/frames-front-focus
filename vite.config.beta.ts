// Gate A beta build (beta.optika100.com on Beget shared hosting):
//   - NO server runtime (Beget can't run Node/Bun) → cloudflare worker build off,
//     TanStack Start SPA mode on → static dist/client with a /_shell.html shell
//     that Apache serves as the catch-all (private beta only — see plan A3).
//   - API base comes from VITE_BITRIX_API at build time (https://optika100.com).
// Usage:  VITE_BITRIX_API=https://optika100.com vite build --config vite.config.beta.ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true },
    prerender: { enabled: false }, // private beta: no prerender, noindex
  },
});
