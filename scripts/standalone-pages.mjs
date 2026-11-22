export const registry = "src/data/standalone-pages.json";

const reserved =
  /^(?:api|assets|auth|basket|bitrix|catalog|checkout|local|o100|order|payment|personal|robots|sale|search|sitemap|upload|verification)(?:-|$)/;

export function standalonePages(value) {
  if (
    !Array.isArray(value) ||
    value.some(
      (path) =>
        typeof path !== "string" ||
        !/^\/(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*\/)+$/.test(path) ||
        reserved.test(path.split("/")[1]),
    ) ||
    new Set(value).size !== value.length
  ) {
    throw Error("Invalid standalone page registry");
  }
  return [...value].sort();
}

export function appendStandaloneSitemap(sitemap, paths) {
  if (!paths.length) return sitemap;
  const end = sitemap.indexOf("</urlset>");
  if (end < 0 || !/^<\/urlset>\s*$/.test(sitemap.slice(end))) {
    throw Error("Published sitemap is not a URL set");
  }
  const entries = standalonePages(paths).map((path) => {
    const url = `https://optika100.com${path}`;
    if (
      sitemap.includes(`<loc>${url}</loc>`) ||
      sitemap.includes(`<loc>${url.slice(0, -1)}</loc>`)
    ) {
      throw Error("Standalone page already in published sitemap: " + path);
    }
    return `  <url><loc>${url}</loc></url>\n`;
  });
  return sitemap.slice(0, end) + entries.join("") + sitemap.slice(end);
}
