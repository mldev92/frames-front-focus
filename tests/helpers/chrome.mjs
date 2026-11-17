import { spawn } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function chromeSession(port = 9251) {
  const profile = await mkdtemp(path.join(tmpdir(), "o100-performance-"));
  const process = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
    "--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
  ], { stdio: "ignore", windowsHide: true });
  let ws;
  try {
    for (let n = 0; n < 100; n++) {
      try { if ((await fetch(`http://127.0.0.1:${port}/json/version`)).ok) break; } catch {}
      await pause(100);
    }
    const tab = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" }).then((response) => response.json());
    ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
    let id = 0;
    const pending = new Map(), events = [];
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const requestId = ++id;
      const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP timeout: ${method}`)); }, 30_000);
      pending.set(requestId, { resolve, reject, timer });
      ws.send(JSON.stringify({ id: requestId, method, params }));
    });
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id) { events.push(message); return; }
      const call = pending.get(message.id);
      if (!call) return;
      clearTimeout(call.timer); pending.delete(message.id);
      message.error ? call.reject(message.error) : call.resolve(message.result);
    });
    const evaluate = async (expression) => {
      const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    for (const domain of ["Page", "Runtime", "Network"]) await send(`${domain}.enable`);
    await send("Page.bringToFront");
    // Стенд использует только локальные POST. Аналитика и любые обращения записи
    // к production не нужны для лабораторных измерений.
    await send("Network.setBlockedURLs", { urls: ["*google-analytics.com/*", "*googletagmanager.com/*", "https://optika100.com/api/store/*"] });
    return { send, evaluate, events, close: () => { ws.close(); process.kill(); } };
  } catch (error) { ws?.close(); process.kill(); throw error; }
}

export async function waitFor(browser, expression, timeout = 20_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await browser.evaluate(expression).catch(() => false)) return;
    await pause(100);
  }
  throw new Error(`Timed out: ${expression}`);
}
