import { writeFile } from "node:fs/promises";

const category = "linzy-dlya-ochkov";
const expectedMissing = new Set(["miopiya-prichiny-oslozhneniya-korrektsiya"]);
const slugs = [
  "vidy-ochkovykh-linz",
  "asfericheskie-linzy-dlya-ochkov",
  "ofisnye-linzy",
  "individualnye-linzy-dlya-ochkov-s-tekhnologiey-free-form",
  "komu-nuzhny-linzy-dlya-ochkov-s-podderzhkoy-akkomodatsii-razgruzochnye-linzy",
  "progressivnye-linzy",
  "kak-vybrat-progressivnye-linzy",
  "skolko-stoyat-progressivnye-ochki163",
  "polyarizatsionnye-linzy-dlya-ochkov",
  "perifocal-perifokal",
  "miopiya-prichiny-oslozhneniya-korrektsiya",
  "fotokhromnye-ochkovye-linzy",
  "progressivnye-linzy-dlya-ochkov-varilux",
  "linzy-dlya-ochkov-crizal-eyezen-zashchita-i-komfort-glaz-pri-rabote-s-ekranami",
  "essilor-experts-eksperty-sredi-optik",
];

function extractContent(html) {
  const marker = '<div class="bloginneritem">';
  const container = html.indexOf(marker);
  const start = html.indexOf('<div class="content">', container);
  if (container < 0 || start < 0) throw new Error("article content marker not found");
  const bodyStart = start + '<div class="content">'.length;
  const tag = /<div\b[^>]*>|<\/div\s*>/gi;
  tag.lastIndex = bodyStart;
  let depth = 1;
  let match;
  while ((match = tag.exec(html))) {
    if (/^<div\b/i.test(match[0])) depth += 1;
    else depth -= 1;
    if (depth === 0) return html.slice(bodyStart, match.index);
  }
  throw new Error("article content container did not close");
}

function sanitize(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<(form|iframe|object)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "")
    .replace(/<h1\b[\s\S]*?<\/h1>/i, "")
    .replace(/\s(?:width|height|border|align|style)=("[^"]*"|'[^']*')/gi, "")
    .replace(/\b(src|href)=("|')\/(?!\/)/gi, '$1=$2https://optika100.com/')
    .trim();
}

const content = {};
for (const slug of slugs) {
  const url = `https://optika100.com/blog/${category}/${slug}/`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Optika100 content migration" },
  });
  if (response.status === 404 && expectedMissing.has(slug)) {
    console.log(`Skipped removed production URL: ${slug}`);
    continue;
  }
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  const article = sanitize(extractContent(await response.text()));
  if (article.length < 500) throw new Error(`${slug} content is unexpectedly short`);
  content[slug] = article;
  console.log(`Imported ${slug}: ${article.length} chars`);
}

await writeFile(
  new URL("../src/data/articles-content.json", import.meta.url),
  `${JSON.stringify(content, null, 2)}\n`,
);
