# Performance Audit — optika.p2print.site (2026-06-06)

Methodology: addyosmani/web-quality-skills (performance + core-web-vitals).
Measured against the live staging site behind the Cloudflare Tunnel.

## Verdict
The site was slow for three independent reasons, plus a slow catalog endpoint.
**All four are now fixed on the test env** (measurements below).
1. ~~Production served by the Vite *dev* server~~ ✅ FIXED — now the prod worker.
2. ~~Images raw PNG/JPEG, 1.5–2.6 MB each~~ ✅ FIXED — WebP, −96%.
3. ~~No caching/compression~~ ✅ FIXED by the prod build (hashed immutable assets);
   compression auto on the final server/CDN (see "final server" note).
4. ~~Catalog endpoint rebuilt 500 products per request~~ ✅ FIXED — server cache.

## Results (test env, warm, through the tunnel)
| Route / asset | Before | After |
|---|---|---|
| Homepage TTFB | 4.8 s cold / 0.5 s | **0.27 s** |
| Homepage image payload | ~15 MB | ~1 MB |
| `/personal`, `/basket`, `/contacts` | (dev) | **0.16–0.18 s** |
| Product detail page | slow | **0.49 s** |
| `products.php` | 2.75 s every call | **0.28 s** cached |
| Catalog `/catalog_s/opravy` | 8.3 s | **1.1 s** |
| Banner (new_main_banner) | 1,867 KB PNG | 63 KB WebP |

---

## Finding 1 — Production is served by `vite dev` ⚠️ #1 ROOT CAUSE
PM2 process `optika-frontend` runs:
```
/home/mimimi/.bun/bin/bun run dev -- --host --port 5173
```
The Vite **dev server** is serving real traffic. Consequences:
- No minification, no bundling — modules are compiled **on demand, per request**
  (the live HTML references source paths like `/src/styles.css`).
- Cold TTFB after each restart measured at **4.8 s**; warm ~0.5 s.
- The process has restarted **44 times** (unstable).
- Emits `Cache-Control: no-store` on everything (see Finding 3).
- No gzip/brotli.

A correct **production build already exists** in `dist/` (built today): minified,
code-split hashed chunks (`account-*.js`, `basket-*.js`, …), Cloudflare-Worker
format (`nodejs_compat`). `wrangler` 4.84.1 is installed on the server. The dev
server is being used even though the prod build is ready to serve.

**Fix:** stop running `vite dev`; serve the built output. Options in the cutover
decision below.

## Finding 2 — Oversized images ✅ FIXED & DEPLOYED
109+ referenced raster images, 28 of them >1 MB, photographic banners stored as
**PNG**. The homepage alone preloaded ~12 PNGs ≈ **15 MB**.

Fix shipped (commit `perf(images)…`):
- `scripts/optimize-images.mjs` (sharp): all `public/` raster → WebP, banners
  capped at 1600 px, q80, originals kept.
- `scripts/rewrite-image-refs.mjs`: 224 source refs rewritten `png/jpg → webp`
  (only where a webp twin exists).
- **Result: 124.4 MB → 5.2 MB total (−96%).** Homepage payload ~15 MB → ~1 MB.

| Asset | Before | After |
|---|---|---|
| new_main_banner | 1,867 KB | 63 KB |
| main_banner_3 | 1,844 KB | 76 KB |
| category_cont_lenses_v3 | 1,680 KB | 40 KB |
| t_icon_red (an icon!) | 897 KB | 9 KB |

## Finding 3 — No caching, no compression
Every response (HTML, JS, CSS, images) carried:
```
Cache-Control: no-store, no-cache, must-revalidate
```
Source: `vite.config.ts` → `server.headers`. So the browser and Cloudflare cache
**nothing** — each navigation re-downloads every asset. Combined with the dev
server recompiling, this is why page-to-page transitions feel slow.
Also: no `Content-Encoding` (gzip/brotli) on the 213 KB JS or the HTML.

**Fix:** belongs with the production-build cutover (Finding 1). A real build emits
content-hashed asset filenames that are safe to cache `immutable, max-age=1y`,
while the SSR HTML stays `no-store`. The dev server cannot express per-path cache
rules cleanly.

---

## Recommendation priority
1. **Cut over from `vite dev` to the production build** — fixes 1 + 3 together and
   is the single biggest win (4.8 s cold → sub-second, plus caching + compression).
2. Images — **done**.
3. After cutover: trim React's auto image-preloads to just the LCP banner; add a
   Cloudflare cache rule for `*.webp / *.js / *.css`.

## What was changed (test env)
- PM2 `optika-frontend` now runs `start-prod.sh` → `wrangler dev` of the built
  Cloudflare Worker on :5173 (was `bun run dev`). The Cloudflare Tunnel still
  routes `/api`, `/auth`, `/bitrix` to Bitrix by path, unchanged. Rebuild +
  `pm2 restart optika-frontend` to ship new code (no more on-the-fly compile).
- `public_html/api/store/products.php`: 300 s file cache of the built product
  set per section+sort (deployed into the `optika_php` container).
- Images converted to WebP via `scripts/optimize-images.mjs` (re-run after adding
  new images, then `scripts/rewrite-image-refs.mjs`).

## Final production server — checklist (host-agnostic)
The image + endpoint-cache + bundling wins carry to any host. Two things depend
on the final server and should be confirmed there:
1. **Compression.** The main JS entry is ~648 KB *uncompressed*. On Cloudflare
   (`wrangler deploy`) brotli is automatic (~150 KB). On a Node host, add gzip/
   brotli (e.g. compression middleware / nginx `gzip on; brotli on`).
2. **Immutable cache headers** for `/assets/*` (content-hashed): serve
   `Cache-Control: public, max-age=31536000, immutable`. Cloudflare's asset
   handler does this on deploy; set it explicitly behind nginx/Node.
3. Recommended final host: `wrangler deploy` to the Cloudflare edge — global CDN,
   auto brotli + edge cache, removes the laptop bottleneck. The worker already
   builds for it; the only change is `/api` must reach Bitrix (today the tunnel
   does path routing; on edge, point a Cloudflare route or proxy at Bitrix).

## Further (optional) wins
- Trim React's auto image-preloads to just the LCP banner (currently ~12).
- Inspect the 648 KB `index` chunk for accidentally-bundled mock data
  (`src/data/products.ts`) and lazy-load heavy modals.
