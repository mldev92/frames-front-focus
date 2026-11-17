import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromeSession, pause, waitFor } from "./helpers/chrome.mjs";

// Только локальные фикстуры; заказ, платёж и изменения production не создаются.
const output = path.resolve(process.argv[2] || "../outputs/repeat_order_2026-11-17/browser");
await mkdir(output, { recursive: true });
const base = "http://127.0.0.1:4190";
const line = { lineId: "repeat:123:1", productId: 200, offerId: 201, slug: "test-lens", name: "Тестовые контактные линзы",
  brand: "TEST", category: "kontaktnye-linzy", catalogNamespace: "catalog_n", canonicalPath: "/catalog_n/kontaktnye_linzy/test-lens/",
  price: 3500, authoritativeBasePrice: 3500, qty: 2, image: "", parameters: { color: "Синий", lensEyeMode: "different",
    prescription: { right: { sphere: "-2", bc: "8.4" }, left: { sphere: "-3", bc: "8.6" } } } };
const existing = { ...line, lineId: "existing", productId: 100, offerId: null, name: "Товар в корзине", qty: 1 };
let scenario = "success", actions = [];
const requests = [];
const api = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", base);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-CSRF-Token");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.end(); return; }
  const endpoint = new URL(req.url, base).pathname.split("/").pop();
  requests.push({ endpoint, method: req.method });
  let data = {};
  if (endpoint === "me.php") data = { authorized: true, id: 7 };
  if (endpoint === "csrf.php") data = { csrfToken: "local-test-token" };
  if (endpoint === "basket_snapshot.php") data = { ok: true, lines: [], unmapped: [] };
  if (endpoint === "product.php") data = { id: new URL(req.url, base).searchParams.has("offerId") ? 200 : 100, price: 3500 };
  if (endpoint === "products.php") data = { total: 0, products: [], facets: {} };
  if (endpoint === "lens_lines.php") data = { lines: [] };
  if (endpoint === "orders.php") data = { orders: [{ id: "123", date: "17.11.2026", state: "done", stateLabel: "Выполнен",
    total: 2000, itemSummary: "1 товар", itemCount: 1, payment: null, shipment: null, canCancel: false,
    items: [{ name: line.name, qty: 2, price: 1000, slug: null, img: null }] }] };
  if (endpoint === "order_action.php") {
    let body = ""; for await (const chunk of req) body += chunk;
    actions.push({ body: JSON.parse(body), csrf: req.headers["x-csrf-token"] });
    await pause(300);
    if (scenario === "network") { req.socket.destroy(); return; }
    if (scenario === "unauthorized") { res.statusCode = 401; data = { error: "Войдите в личный кабинет" }; }
    else if (scenario === "empty") data = { ok: true, lines: [], unavailable: [] };
    else data = { ok: true, lines: scenario === "unavailable" ? [] : [line],
      unavailable: ["partial", "unavailable"].includes(scenario) ? [{ name: "Снятая с продажи оправа", reason: "Товар больше недоступен" }] : [] };
  }
  res.end(JSON.stringify(data));
});
await new Promise((resolve) => api.listen(4191, "127.0.0.1", resolve));
const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4190", "--strictPort"], {
  windowsHide: true, env: { ...process.env, VITE_BITRIX_API: "http://127.0.0.1:4191", VITE_PRIVATE_BETA: "false" }, stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
vite.stdout.on("data", (data) => { serverLog += data; });
vite.stderr.on("data", (data) => { serverLog += data; });
let browser;
const results = [];
try {
  for (let n = 0; n < 100; n++) {
    try { if ((await fetch(base + "/personal/orders/", { signal: AbortSignal.timeout(5000) })).ok) break; } catch {}
    if (vite.exitCode !== null) throw new Error(serverLog);
    await pause(300);
  }
  browser = await chromeSession(9254);
  await browser.send("Page.addScriptToEvaluateOnNewDocument", { source: "window.__repeatDocument = crypto.randomUUID();" });
  const button = `[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Повторить заказ')`;
  const cart = () => browser.evaluate("JSON.parse(localStorage.getItem('optika-cart')).state.lines");
  const openOrders = async () => {
    const before = await browser.evaluate("window.__repeatDocument");
    await browser.send("Page.navigate", { url: base + "/personal/orders/" });
    await waitFor(browser, `window.__repeatDocument && window.__repeatDocument !== ${JSON.stringify(before)} && !!(${button}) && document.readyState === 'complete'`, 90000);
  };
  await openOrders();
  for (const [width, testCase] of [[375, "success"], [375, "partial"], [375, "unavailable"], [375, "network"],
    [375, "unauthorized"], [375, "empty"], [375, "limit"], [1440, "success"]]) {
    scenario = testCase; actions = [];
    const initial = testCase === "limit" ? [{ ...line, qty: 19 }] : [existing];
    await browser.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width === 375 });
    await openOrders();
    await pause(500);
    await browser.evaluate(`import('/src/lib/store/cart.ts').then(({useCart}) => useCart.setState({lines:${JSON.stringify(initial)},lensSelections:[],importedSources:[],consumedAttempts:[]}))`);
    assert.deepEqual(await cart(), initial);
    const errorStart = browser.events.length;
    await browser.evaluate(`(() => { const b=${button}; b.click(); b.click(); })()`);
    await waitFor(browser, "!!document.querySelector('[data-sonner-toast]')");
    await pause(600);
    // Chrome может повторить POST при разрыве сокета до получения ответа.
    if (testCase === "network") assert.ok(actions.length >= 1 && actions.length <= 3);
    else assert.equal(actions.length, 1, "двойной клик создаёт один запрос");
    for (const action of actions) assert.deepEqual(action, { body: { action: "repeat", id: "123" }, csrf: "local-test-token" });
    const succeeded = ["success", "partial"].includes(testCase);
    const pathname = await browser.evaluate("location.pathname");
    assert.equal(pathname.replace(/\/$/, ""), succeeded ? "/basket" : "/personal/orders");
    const lines = await cart();
    assert.deepEqual(lines, succeeded ? [existing, line] : initial);
    const toast = await browser.evaluate("document.querySelector('[data-sonner-toast]').textContent");
    if (["partial", "unavailable"].includes(testCase)) assert.match(toast, /Снятая с продажи оправа/);
    if (["network", "unauthorized", "limit"].includes(testCase)) assert.match(toast, /Не удалось повторить заказ/);
    if (testCase === "empty") assert.match(toast, /нет позиций/);
    if (!succeeded) assert.equal(await browser.evaluate(`(${button}).disabled`), false);
    const errors = browser.events.slice(errorStart).filter((event) => event.method === "Runtime.exceptionThrown");
    assert.deepEqual(errors, []);
    assert.equal(await browser.evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
    if (testCase === "success") {
      const { data } = await browser.send("Page.captureScreenshot", { format: "png" });
      await writeFile(path.join(output, `basket-${width}.png`), Buffer.from(data, "base64"));
    }
    results.push({ width, scenario: testCase, lines: lines.length, passed: true });
    console.log(JSON.stringify(results.at(-1)));
  }
} catch (error) {
  if (browser) {
    await writeFile(path.join(output, "failure.json"), JSON.stringify({
      error: String(error), requests,
      page: await browser.evaluate("({url:location.href,text:document.body.innerText})").catch(String),
      events: browser.events.filter((event) => ["Runtime.exceptionThrown", "Runtime.consoleAPICalled", "Network.loadingFailed"].includes(event.method)),
    }, null, 2));
  }
  throw error;
} finally {
  browser?.close(); vite.kill(); api.closeAllConnections(); api.close();
  await writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2));
  await writeFile(path.join(output, "vite.log"), serverLog);
}
