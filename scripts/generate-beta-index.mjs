import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "..", "dist");
const clientDir = path.join(distDir, "client");
const serverEntryUrl = pathToFileURL(path.join(distDir, "server", "server.js")).href;
const indexPath = path.join(clientDir, "index.html");
const shellPath = path.join(clientDir, "_shell.html");

async function renderHomepage() {
  const serverModule = await import(serverEntryUrl);
  const server = serverModule.default;
  if (!server || typeof server.fetch !== "function") {
    throw new Error("Beta server bundle did not expose a fetch handler.");
  }

  const response = await server.fetch(new Request("http://beta.optika100.com/"));
  if (!response.ok) {
    throw new Error(`Homepage SSR returned ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    throw new Error(`Homepage SSR returned unexpected content type: ${contentType}`);
  }

  const html = await response.text();
  if (!html.includes("Видеть мир") || !html.includes("Популярные модели")) {
    throw new Error("Homepage SSR did not render the expected homepage content.");
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
const homepageHtml = await renderHomepage();
await writeFile(indexPath, homepageHtml, "utf8");
console.log("Generated dist/client/index.html from homepage SSR.");
