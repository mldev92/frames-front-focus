import { readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { publishedMatches, routeFile } from "./published-page.mjs";
import { amendStellestMatches, loadStellestCatalog } from "./stellest-published-catalog.mjs";
import { amendProgressiveMatches, loadProgressiveCatalog } from "./progressive-published-catalog.mjs";

const parent = process.env.O100_PUBLISHED_DIR;
const manifest = JSON.parse(readFileSync(path.join(parent, "release-manifest.json")));
const cache = new Map();
const stellest = loadStellestCatalog(process.env.O100_BACKEND_SHA);
const progressive = loadProgressiveCatalog(process.env.O100_BACKEND_SHA, manifest.frontendSha);
function page(pathname) {
  if (cache.has(pathname)) return cache.get(pathname);
  const file = routeFile(pathname);
  const bytes = readFileSync(path.join(parent, file));
  if (createHash("sha256").update(bytes).digest("hex") !== manifest.files[file])
    throw Error("Published page changed: " + file);
  const matches = amendProgressiveMatches(
    amendStellestMatches(publishedMatches(bytes.toString("utf8")), pathname, stellest),
    pathname,
    progressive,
  );
  if (cache.size >= 32) cache.delete(cache.keys().next().value);
  cache.set(pathname, matches);
  return matches;
}

globalThis.o100PublishedLoaders = (router) => {
  for (const route of Object.values(router.looseRoutesById)) {
    if (!route.options.loader) continue;
    route.options.loader = ({ location }) => {
      const id = router
        .matchRoutes(location.pathname, location.search)
        .find((m) => m.routeId === route.id)?.id;
      const match = page(location.pathname).find((m) => m.id === id);
      if (!match) throw Error("No published loader for " + location.pathname + " " + route.id);
      return match.data;
    };
  }
};
