if (process.env.O100_PRERENDER_LIMIT || process.env.O100_PRERENDER_ROUTES) throw new Error("Production validation requires the complete manifest");
if (process.env.VITE_VIRTUAL_TRY_ON === "true" || process.env.VITE_ALLOW_FIXTURES === "true" || process.env.VITE_PRIVATE_BETA === "true") throw new Error("Unsafe production flags");
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(
  await readFile(new URL("../generated/production-routes.json", import.meta.url), "utf8"),
);
const routes = manifest.routes;
const clientDir = new URL("../dist/client/", import.meta.url);
const missing = routes.filter((route) => {
  const relative = route === "/" ? "index.html" : `${route.replace(/^\/|\/$/g, "")}/index.html`;
  return !existsSync(new URL(relative, clientDir));
});

for (const required of ["index.html", "_shell.html", "404.html", "sitemap.xml", "robots.txt"]) {
  if (!existsSync(new URL(required, clientDir))) missing.push(`release asset: ${required}`);
}

if (missing.length) {
  throw new Error(`Production build is missing ${missing.length} required outputs:\n${missing.join("\n")}`);
}

console.log(`Validated ${routes.length} prerendered production routes and release assets.`);

const home = await readFile(new URL("index.html", clientDir), "utf8");
const robots = await readFile(new URL("robots.txt", clientDir), "utf8");
if (/<meta[^>]+(?:noindex|nofollow)/i.test(home) || /Disallow:\s*\/\s*$/m.test(robots)) throw new Error("Production home or robots still blocks indexing");
if (/beta\.optika100\.com/.test(await readFile(new URL("sitemap.xml", clientDir), "utf8"))) throw new Error("Beta URLs in production sitemap");
