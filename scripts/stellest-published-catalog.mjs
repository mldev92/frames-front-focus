import { readFileSync } from "node:fs";

export const stellestDataFile = "deploy/stellest-published-catalog.json";
export const stellestPage = "/stellest-katalog-s-linzami/";
const directory = "/catalog_s/linzy_dlya_ochkov/detskie/";
const prevencia = [
  { id: 56365, slug: "as_stellest_crizal_prevencia", line: "AS Stellest Airwear" },
  { id: 65359, slug: "as_stellest_2_0_crizal_prevencia", line: "AS Stellest 2.0 Airwear" },
].map((item) => ({ ...item, path: directory + item.slug + "/" }));
export const stellestCanonical = prevencia[0].path;
const rockSlug = "as_stellest_crizal_rock";
export const stellestRock = { id: 56366, slug: rockSlug, path: directory + rockSlug + "/" };

export function allowStellestCanonical(robots, product = prevencia[0]) {
  const restriction = "Disallow: */" + product.slug + "/";
  const allow = "Allow: " + product.path + "$";
  const eol = robots.includes("\r\n") ? "\r\n" : "\n";
  const lines = robots.split(eol);
  if (lines.filter((line) => line === restriction).length !== 2 || lines.includes(allow)) {
    throw Error("Unexpected published Stellest robots rules");
  }
  return lines.flatMap((line) => line === restriction ? [allow, line] : [line]).join(eol);
}

export function loadStellestCatalog(backendSha) {
  if (process.env.O100_STELLEST_CATALOG !== "1") return null;
  const { backend, offers } = JSON.parse(readFileSync(stellestDataFile, "utf8"));
  if (backend !== backendSha || !Array.isArray(offers) || offers.length !== 7
    || offers.some((offer) => offer.supplier !== "essilor" || !offer.line.startsWith("AS Stellest")
      || offer.priceIsWholesale || !Number.isSafeInteger(offer.priceRub) || offer.priceRub <= 0)
    || new Set(offers.map(({ id }) => id)).size !== offers.length) {
    throw Error("Invalid reviewed Stellest catalog data");
  }
  const products = new Map(prevencia.map((item) => {
    const matches = offers.filter((offer) => offer.line === item.line && offer.coating === "Crizal Prevencia");
    if (matches.length !== 1) throw Error("Missing unique Prevencia offer for " + item.slug);
    const { priceRub, priceBeforeDiscountRub, discountPercent } = matches[0];
    return [item.id, { ...item, priceRub, priceBeforeDiscountRub, discountPercent }];
  }));
  return { offers, products };
}

function updatePrices(value, products) {
  if (Array.isArray(value)) {
    value.forEach((entry) => updatePrices(entry, products));
  } else if (value && typeof value === "object") {
    const product = products.get(value.id);
    if (product && value.slug === product.slug && value.canonicalPath === product.path) {
      value.price = product.priceRub;
      delete value.oldPrice;
      delete value.discountPercent;
      const badges = (value.badges ?? []).filter((badge) => badge !== "Скидка");
      if (product.priceBeforeDiscountRub > product.priceRub) {
        value.oldPrice = product.priceBeforeDiscountRub;
        value.discountPercent = Math.round(product.discountPercent);
        badges.push("Скидка");
      }
      if (badges.length || value.badges) value.badges = badges;
      return;
    }
    Object.values(value).forEach((entry) => updatePrices(entry, products));
  }
}

export function amendStellestMatches(matches, route, catalog) {
  if (!catalog) return matches;
  for (const match of matches) {
    updatePrices(match.data, catalog.products);
    if (route === stellestPage && match.id.startsWith(stellestPage)) {
      if (!Array.isArray(match.data)) throw Error("Unexpected published Stellest loader data");
      match.data = { contactLenses: match.data, spectacleLenses: catalog.offers };
    }
  }
  return matches;
}
