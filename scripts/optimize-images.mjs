// One-shot image optimizer: converts every raster image under public/ to WebP.
// - Large images (banners) are capped at MAX_W width; icons keep their size.
// - Originals are kept on disk so nothing breaks if a reference is missed.
// - Prints a savings manifest. Run: node scripts/optimize-images.mjs
import { readdir, stat, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import sharp from "sharp";

const PUBLIC = new URL("../public/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const MAX_W = 1600;        // cap banner width — nothing on the site renders wider
const QUALITY = 80;        // webp quality
const RASTER = new Set([".png", ".jpg", ".jpeg"]);

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) out.push(...(await walk(p)));
    else if (RASTER.has(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

const files = await walk(PUBLIC);
let before = 0, after = 0, converted = 0, skipped = 0;
const rows = [];

for (const src of files) {
  const webp = src.replace(/\.(png|jpe?g)$/i, ".webp");
  try {
    const buf = await readFile(src);
    before += buf.length;
    const img = sharp(buf, { failOn: "none" });
    const meta = await img.metadata();
    let pipe = img;
    if (meta.width && meta.width > MAX_W) pipe = pipe.resize({ width: MAX_W, withoutEnlargement: true });
    const outBuf = await pipe.webp({ quality: QUALITY, effort: 5 }).toBuffer();
    // Only keep webp if it actually wins (it always should for these).
    if (outBuf.length < buf.length) {
      await writeFile(webp, outBuf);
      after += outBuf.length;
      converted++;
      rows.push([buf.length, outBuf.length, src.slice(PUBLIC.length)]);
    } else {
      after += buf.length;
      skipped++;
    }
  } catch (e) {
    console.error("FAIL", src.slice(PUBLIC.length), e.message);
    skipped++;
  }
}

rows.sort((a, b) => (b[0] - b[1]) - (a[0] - a[1]));
for (const [b, a, name] of rows.slice(0, 30)) {
  console.log(`${(b / 1024).toFixed(0).padStart(6)}KB -> ${(a / 1024).toFixed(0).padStart(5)}KB  ${name}`);
}
console.log("----");
console.log(`converted=${converted} skipped=${skipped}`);
console.log(`total raster: ${(before / 1048576).toFixed(1)}MB -> webp: ${(after / 1048576).toFixed(1)}MB  (saved ${((before - after) / 1048576).toFixed(1)}MB, ${(100 * (before - after) / before).toFixed(0)}%)`);
