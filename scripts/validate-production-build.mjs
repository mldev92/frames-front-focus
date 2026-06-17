import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(
  await readFile(new URL("../generated/production-routes.json", import.meta.url), "utf8"),
);
const requestedLimit = Number(process.env.O100_PRERENDER_LIMIT ?? 0);
const routes =
  Number.isFinite(requestedLimit) && requestedLimit > 0
    ? manifest.routes.slice(0, requestedLimit)
    : manifest.routes;
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
