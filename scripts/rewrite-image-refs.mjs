// Rewrites image references in src/ from .png/.jpg/.jpeg -> .webp,
// but ONLY when the corresponding public/<path>.webp file actually exists.
// Leaves any reference whose webp twin is missing untouched (safe).
import { readdir, stat, readFile, writeFile, access } from "node:fs/promises";
import { join, extname } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const SRC = join(ROOT, "src");
const PUBLIC = join(ROOT, "public");
const CODE = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".html", ".htm"]);
const REF = /(["'`(])(\/[A-Za-z0-9_./%-]+?)\.(png|jpe?g)(["'`)?#])/gi;

async function exists(p) { try { await access(p); return true; } catch { return false; } }
async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) out.push(...(await walk(p)));
    else if (CODE.has(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

let filesChanged = 0, refsChanged = 0, refsKept = 0;
for (const file of await walk(SRC)) {
  const text = await readFile(file, "utf8");
  let changed = false;
  const matches = [...text.matchAll(REF)];
  const replacements = [];
  for (const m of matches) {
    const [, , path] = m;
    const webpDisk = join(PUBLIC, decodeURI(path) + ".webp");
    if (await exists(webpDisk)) replacements.push(m);
    else refsKept++;
  }
  if (replacements.length) {
    // rebuild via single regex pass, replacing only confirmed ones
    let out = "";
    let last = 0;
    for (const m of replacements) {
      out += text.slice(last, m.index);
      out += `${m[1]}${m[2]}.webp${m[4]}`;
      last = m.index + m[0].length;
      refsChanged++;
    }
    out += text.slice(last);
    await writeFile(file, out);
    changed = true;
  }
  if (changed) filesChanged++;
}
console.log(`files changed=${filesChanged} refs->webp=${refsChanged} refs kept(no webp)=${refsKept}`);
