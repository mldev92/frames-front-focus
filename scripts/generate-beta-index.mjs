import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
const clientDir = path.join(distDir, "client");
const serverEntryUrl = pathToFileURL(path.join(distDir, "server", "server.js")).href;
const indexPath = path.join(clientDir, "index.html");
const shellPath = path.join(clientDir, "_shell.html");

async function renderPage(pathname, expectedContent) {
  const serverModule = await import(serverEntryUrl);
  const server = serverModule.default;
  if (!server || typeof server.fetch !== "function") {
    throw new Error("Beta server bundle did not expose a fetch handler.");
  }

  const response = await server.fetch(new Request(`http://beta.optika100.com${pathname}`));
  if (!response.ok) {
    throw new Error(`${pathname} SSR returned ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error(`${pathname} SSR returned unexpected content type: ${contentType}`);
  }

  const html = await response.text();
  for (const expected of expectedContent) {
    if (!html.includes(expected)) throw new Error(`${pathname} SSR is missing: ${expected}`);
  }
  return html;
}

async function ensureShellStillExists() {
  const shellHtml = await readFile(shellPath, "utf8");
  if (!shellHtml.includes('id="$tsr-stream-barrier"')) {
    throw new Error("SPA shell is missing the TanStack bootstrap barrier.");
  }
}

await ensureShellStillExists();
const homepageHtml = await renderPage("/", ["Видеть мир", "Популярные модели"]);
await writeFile(indexPath, homepageHtml, "utf8");
const contactLensPath = path.join(clientDir, "catalog_s", "kontaktnye_linzy_", "index.html");
await mkdir(path.dirname(contactLensPath), { recursive: true });
const contactLensHtml = await renderPage("/catalog_s/kontaktnye_linzy_/", [
  "Контактные линзы в Санкт-Петербурге",
  "Почему линзы выбирают у нас",
  "FAQPage",
]);
await writeFile(contactLensPath, contactLensHtml, "utf8");
console.log("Generated homepage and contact-lens category HTML from SSR.");
