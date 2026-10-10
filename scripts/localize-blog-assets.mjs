import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ORIGIN = "https://optika100.com";
const SOURCE = new URL("../src/data/articles-content.json", import.meta.url);
const PUBLIC_DIR = new URL("../public/", import.meta.url);
const PUBLIC_PATH = fileURLToPath(PUBLIC_DIR);
const MIRRORED_ROOTS = ["images", "upload", "varilux", "eyezen", "essilor"];
const FETCH_TIMEOUT_MS = 20_000;
const FETCH_ATTEMPTS = 3;

const content = JSON.parse(await readFile(SOURCE, "utf8"));
const queue = [];
const queued = new Set();
const completed = new Set();

function isMirroredPath(pathname) {
  const clean = pathname.replace(/^\/+/, "");
  return MIRRORED_ROOTS.some((root) => clean === root || clean.startsWith(`${root}/`));
}

function toAbsoluteUrl(raw, base = ORIGIN) {
  try {
    const url = new URL(raw, base);
    if (url.origin !== ORIGIN || !isMirroredPath(url.pathname)) return null;
    return url;
  } catch {
    return null;
  }
}

function toPublicUrl(url) {
  return decodeURI(url.pathname);
}

function toDiskPath(url) {
  return path.join(PUBLIC_PATH, decodeURIComponent(url.pathname.replace(/^\/+/, "")));
}

function queueAsset(raw, base) {
  const url = toAbsoluteUrl(raw, base);
  if (!url) return null;
  const key = url.toString();
  if (!queued.has(key) && !completed.has(key)) {
    queued.add(key);
    queue.push(url);
  }
  return url;
}

function rewriteTagAttribute(tag, attribute) {
  const pattern = new RegExp(`(${attribute}\\s*=\\s*)(["'])([^"']+)\\2`, "i");
  const match = tag.match(pattern);
  if (!match) return tag;
  const [, prefix, quote, raw] = match;
  const url = queueAsset(raw, ORIGIN);
  if (!url) return tag;
  return tag.replace(pattern, `${prefix}${quote}${toPublicUrl(url)}${quote}`);
}

function rewriteHtml(html) {
  return html
    .replace(/<img\b[^>]*>/gi, (tag) => rewriteTagAttribute(tag, "src"))
    .replace(/<link\b[^>]*>/gi, (tag) => {
      if (!/\brel\s*=\s*(["'])stylesheet\1/i.test(tag)) return tag;
      return rewriteTagAttribute(tag, "href");
    });
}

function discoverCssAssets(cssText, baseUrl) {
  const refs = new Set();

  for (const match of cssText.matchAll(/@import\s+(?:url\()?["']?([^"')\s]+)["']?\)?/gi)) {
    refs.add(match[1]);
  }

  for (const match of cssText.matchAll(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi)) {
    refs.add(match[2]);
  }

  for (const ref of refs) {
    if (!ref || ref.startsWith("data:") || ref.startsWith("blob:")) continue;
    queueAsset(ref, baseUrl);
  }
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchProductionAsset(url) {
  let lastError;

  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Optika100 blog asset localizer" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < FETCH_ATTEMPTS) await delay(attempt * 750);
    }
  }

  throw new Error(`${url} failed after ${FETCH_ATTEMPTS} attempts`, { cause: lastError });
}

async function mirrorAsset(url) {
  const filePath = toDiskPath(url);
  let response;

  try {
    response = await fetchProductionAsset(url);
  } catch (error) {
    try {
      await access(filePath);
      if (url.pathname.endsWith(".css")) {
        discoverCssAssets(await readFile(filePath, "utf8"), url);
      }
      console.warn(`Keeping tracked mirror for ${url}: ${error.message}`);
      return;
    } catch {
      throw error;
    }
  }

  await mkdir(path.dirname(filePath), { recursive: true });

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/css") || url.pathname.endsWith(".css")) {
    let css = await response.text();
    css = css.replaceAll(`${ORIGIN}/`, "/");
    discoverCssAssets(css, url);
    await writeFile(filePath, css);
    return;
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(filePath, bytes);
}

for (const [slug, html] of Object.entries(content)) {
  content[slug] = rewriteHtml(html);
}

while (queue.length > 0) {
  const url = queue.shift();
  if (!url) continue;
  const key = url.toString();
  if (completed.has(key)) continue;
  await mirrorAsset(url);
  completed.add(key);
}

await writeFile(SOURCE, `${JSON.stringify(content, null, 2)}\n`);

console.log(`Localized ${completed.size} production blog assets.`);
