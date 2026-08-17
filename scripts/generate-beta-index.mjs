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

async function writeRoutePage(pathname, expectedContent) {
  const routePath = path.join(clientDir, pathname.replace(/^\/+|\/+$/g, ""), "index.html");
  await mkdir(path.dirname(routePath), { recursive: true });
  await writeFile(routePath, await renderPage(pathname, expectedContent), "utf8");
}

await ensureShellStillExists();
const homepageHtml = await renderPage("/", ["Видеть мир", "Популярные модели"]);
await writeFile(indexPath, homepageHtml, "utf8");
await writeRoutePage("/catalog_s/kontaktnye_linzy_/", [
  "Контактные линзы в Санкт-Петербурге",
  "Почему линзы выбирают у нас",
  "FAQPage",
]);
await writeRoutePage("/catalog_n/kontaktnye_linzy_/", [
  "Контактные линзы",
  "Фильтры",
]);
await writeRoutePage("/linzy-spb/", [
  "Контактные линзы в Санкт-Петербурге",
  "Какие контактные линзы можно выбрать",
  "FAQPage",
]);
await writeRoutePage("/optika-spb/", [
  "Оптика в Санкт-Петербурге",
  "Проверка зрения и подбор коррекции",
  "FAQPage",
]);
await writeRoutePage("/tsvetnye-linzy-s-dioptriyami/", [
  "Цветные линзы с диоптриями",
  "Почему нужен отдельный подбор",
  "FAQPage",
]);
await writeRoutePage("/biometriya-glaza/", [
  "Биометрия глаза",
  "Как проходит биометрия",
  "FAQPage",
]);
console.log("Generated homepage, contact-lens category, and SEO landing HTML from SSR.");
