import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

// Изолированный стенд использует только сохранённые ответы. Сетевого fallback нет.
const project = fileURLToPath(new URL("../", import.meta.url));
const cache = path.resolve(process.argv[2] || path.join(project, "../outputs/storefront_performance_2026-11-17/http-cache"));
await mkdir(cache, { recursive: true });
const pending = new Map();
const reads = new Set(["homepage.php", "products.php", "product.php", "galleries.php", "catalog_sections.php", "menu_counts.php", "lens_lines.php", "search.php", "lens_search.php", "lens_recommend.php"]);
const state = { requests: [], delay: 180, productDelay: 0, relatedDelay: 0, fail: "", price: null, legacyLines: [] };
const mime = { ".js": "application/javascript", ".css": "text/css", ".html": "text/html; charset=utf-8", ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".ico": "image/x-icon" };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function cachedRead(resource) {
  const normalized = new URL(resource, "https://optika100.com");
  normalized.searchParams.sort();
  const key = normalized.pathname + normalized.search;
  if (pending.has(key)) return pending.get(key);
  const task = (async () => {
    const file = path.join(cache, createHash("sha256").update(key).digest("hex") + ".json");
    try { return JSON.parse(await readFile(file, "utf8")); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
    throw new Error("OFFLINE_CACHE_MISS " + key);

  })();
  pending.set(key, task);
  try { return await task; } finally { pending.delete(key); }
}

function send(req, res, status, type, body, cacheControl = "no-store") {
  const headers = { "Content-Type": type, "Cache-Control": cacheControl, "Access-Control-Allow-Origin": req.headers.origin || "*", "Access-Control-Allow-Credentials": "true", "Timing-Allow-Origin": "*", "Vary": "Accept-Encoding", "Content-Security-Policy": "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://127.0.0.1:4198; img-src 'self' data: http://127.0.0.1:4198; font-src 'self' data:; frame-src 'none'" };
  let bytes = Buffer.isBuffer(body) ? body : Buffer.from(body);
  if (/text|javascript|json/.test(type) && /gzip/.test(req.headers["accept-encoding"] || "")) {
    bytes = gzipSync(bytes); headers["Content-Encoding"] = "gzip";
  }
  res.writeHead(status, { ...headers, "Content-Length": bytes.length });
  res.end(bytes);
}
const json = (req, res, value, status = 200) => send(req, res, status, "application/json", JSON.stringify(value));

async function api(req, res, url) {
  const endpoint = path.posix.basename(url.pathname);
  let body = {};
  if (req.method === "POST") { let raw = ""; for await (const chunk of req) raw += chunk; body = raw ? JSON.parse(raw) : {}; }
  state.requests.push({ endpoint, method: req.method, query: url.search, body, at: Date.now() });
  await sleep(state.delay + (endpoint === "product.php" ? state.productDelay : endpoint === "products.php" && url.searchParams.get("limit") === "8" ? state.relatedDelay : 0));
  if (state.fail && endpoint.includes(state.fail)) return json(req, res, { error: "Локальная проверка сбоя" }, 503);
  if (endpoint === "appointment_slots.php") return json(req, res, { status: "ok", availableDates: ["2026-11-19", "2026-11-20"], selectedDate: body.date || "2026-11-19", slots: [{ id: "local-slot-" + (body.date || "2026-11-19"), orderDate: body.date || "2026-11-19", timeBegin: (body.date || "2026-11-19") + "T10:00:00", timeEnd: (body.date || "2026-11-19") + "T10:30:00", doctorName: "Локальная проверка", clinicUid: body.clinicUid, serviceCode: body.serviceCode, servicePrice: 0 }] });
  if (endpoint === "csrf.php") return json(req, res, { csrfToken: "local-performance-csrf" });
  if (endpoint === "me.php") return json(req, res, { authenticated: false, user: null });
  if (endpoint === "basket_snapshot.php") return json(req, res, { lines: state.legacyLines, unmapped: [] });
  if (endpoint === "client_error.php") return json(req, res, { ok: true });
  if (endpoint === "location_search.php") return json(req, res, { ok: true, items: [{ code: "TEST-SPB", name: "Санкт-Петербург", label: "Санкт-Петербург, Россия" }, { code: "TEST-NVK", name: "Новокузнецк", label: "Новокузнецк, Россия" }] });
  if (endpoint === "order_delivery.php") return json(req, res, {
    ok: true, city: body.city, itemsTotal: (body.lines || []).reduce((sum, line) => sum + (state.price ?? line.price ?? 1000) * line.qty, 0),
    options: [
      { code: "salon_pickup_spb", label: "Самовывоз из салона", description: "Локальная проверка", price: 0, priceFormatted: "Бесплатно", requiresAddress: false, requiresPickupPoint: false, errors: [] },
      { code: "spb_courier", label: "Курьер по Санкт-Петербургу", description: "Локальная проверка", price: 300, priceFormatted: "300 ₽", requiresAddress: true, requiresPickupPoint: false, errors: [] },
      { code: "sdek_pickup", label: "СДЭК: пункт выдачи", description: "Локальная проверка", price: 350, priceFormatted: "350 ₽", requiresAddress: false, requiresPickupPoint: true, errors: [] },
      { code: "sdek_courier", label: "СДЭК: курьер", description: "Локальная проверка", price: 550, priceFormatted: "550 ₽", requiresAddress: true, requiresPickupPoint: false, errors: [] },
    ],
  });
  if (endpoint === "order_pickup_points.php") return json(req, res, { ok: true, city: body.city, points: [{ id: "LOCAL-1", name: "Тестовый пункт", address: "Тестовая улица, 1", workTime: "10:00–20:00", phone: "", note: "", lat: 59.93, lon: 30.31, cashless: true, cash: true, cod: true, dressingRoom: false }] });
  if (endpoint === "order_quote.php") {
    const lines = (body.lines || []).map((line) => ({ lineId: line.lineId, productId: line.productId, qty: line.qty, price: state.price ?? line.price ?? 1000 }));
    const itemsTotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
    return json(req, res, { ok: true, quoteId: "local-quote", expiresAt: Math.floor(Date.now() / 1000) + 600, lines, itemsTotal, deliveryPrice: 350, deliveryStatus: "priced", total: itemsTotal + 350 });
  }
  if (req.method !== "GET" || !reads.has(endpoint)) return json(req, res, { error: "Операция отключена в локальном стенде" }, 403);
  const entry = await cachedRead(url.pathname + url.search);
  let data = JSON.parse(Buffer.from(entry.body, "base64").toString());
  if (endpoint === "product.php" && state.price !== null) data = { ...data, price: state.price };
  const local = JSON.stringify(data).replaceAll("https://optika100.com/upload/", "http://127.0.0.1:4198/upload/");
  send(req, res, entry.status, "application/json", local);
}

async function handle(req, res, root) {
  const url = new URL(req.url, "http://127.0.0.1");
  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": req.headers.origin || "*", "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Headers": "Content-Type, X-CSRF-Token, X-Request-Key", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" }); return res.end();
  }
  if (url.pathname === "/__test/control" && req.method === "POST") {
    let raw = ""; for await (const chunk of req) raw += chunk;
    const next = JSON.parse(raw); for (const key of ["delay", "productDelay", "relatedDelay", "fail", "price", "legacyLines"]) if (key in next) state[key] = next[key];
    if (next.reset) state.requests = [];
    return json(req, res, { ok: true });
  }
  if (url.pathname === "/__test/requests") return json(req, res, state.requests);
  if (url.pathname === "/__test/blank") return send(req, res, 200, "text/html", "<!doctype html><html><head><title>Локальный стенд</title></head><body></body></html>");
  if (url.pathname.startsWith("/api/store/")) return api(req, res, url);
  if (url.pathname.startsWith("/upload/")) {
    const entry = await cachedRead(url.pathname + url.search);
    return send(req, res, entry.status, entry.type || "application/octet-stream", Buffer.from(entry.body, "base64"), "public, max-age=3600");
  }
  if (req.method !== "GET" && req.method !== "HEAD") return json(req, res, { error: "Method disabled" }, 405);
  const client = path.join(root, "dist-performance/client");
  let relative = decodeURIComponent(url.pathname).replace(/^\//, "");
  if (!path.extname(relative)) relative = relative.replace(/\/$/, "") + "/index.html";
  if (relative === "/index.html") relative = "index.html";
  if (url.pathname.startsWith("/search/")) relative = "_shell.html";
  if (/^\/catalog_[sn]\//.test(url.pathname) && [...url.searchParams.keys()].some((key) => ["brand", "gender", "material", "sort", "page", "priceMin", "priceMax", "lensQuery"].includes(key))) {
    try { await readFile(path.join(client, "_catalog-query", relative)); relative = "_catalog-query/" + relative; }
    catch { relative = "_shell.html"; }
  }
  const file = path.resolve(client, relative);
  if (!file.startsWith(path.resolve(client) + path.sep)) return json(req, res, { error: "Invalid path" }, 400);
  try {
    const bytes = await readFile(file);
    return send(req, res, 200, mime[path.extname(file)] || "application/octet-stream", bytes, /\.(js|css|webp|png|woff2)$/.test(file) ? "public, max-age=31536000, immutable" : "no-store");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    if (url.pathname.startsWith("/catalog_")) return send(req, res, 200, "text/html", await readFile(path.join(client, "_shell.html")));
    return json(req, res, { error: "Not found", path: url.pathname }, 404);
  }
}
for (const [port, root] of [[4197, project], [4198, project]]) {
  http.createServer((req, res) => void handle(req, res, root).catch((error) => {
    console.error(error.message); if (!res.headersSent) json(req, res, { error: "Local harness error" }, 500); else res.end();
  })).listen(port, "127.0.0.1", () => console.log(`Local performance harness: http://127.0.0.1:${port}`));
}
