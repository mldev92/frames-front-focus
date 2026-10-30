import { decodeHTML } from 'entities';
import { productForPath, robotsAllows } from './seo-inventory.mjs';

export function validateSitemap(xml, routes, inventory, robots) {
  if (Buffer.byteLength(xml) > 50 * 1024 * 1024 || !xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) throw Error('Invalid sitemap size or namespace');
  const locations = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => decodeHTML(m[1]));
  if (!locations.length || locations.length > 50000 || new Set(locations).size !== locations.length) throw Error('Invalid sitemap count or duplicate URLs');
  const rendered = new Set(routes);
  const products = new Map(inventory.products.map(p => [p.city + ':' + p.canonicalPath.split('/').at(-2), p]));
  const paths = new Set();
  for (const location of locations) {
    const url = new URL(location);
    const path = decodeURI(url.pathname);
    if (url.origin !== 'https://optika100.com' || url.search || url.hash || location !== 'https://optika100.com' + encodeURI(path)) throw Error('Invalid sitemap URL: ' + location);
    if (!rendered.has(path) || !robotsAllows(robots, path)) throw Error('Unrendered or robots-blocked sitemap URL: ' + path);
    if (/^\/(?:basket|checkout|personal|search)(?:\/|$)/.test(path) || ['/politika-konfidentsialnosti/', '/requisites/'].includes(path)) throw Error('Private sitemap URL: ' + path);
    const product = productForPath(path, products);
    if (product && (!product.sectionActive || path !== product.canonicalPath)) throw Error('Noncanonical or hidden product in sitemap: ' + path);
    paths.add(path);
  }
  let eligible = 0;
  for (const product of inventory.products) {
    if (!product.sectionActive) continue;
    if (!rendered.has(product.canonicalPath)) throw Error('Active canonical not rendered: ' + product.canonicalPath);
    if (robotsAllows(robots, product.canonicalPath)) {
      eligible++;
      if (!paths.has(product.canonicalPath)) throw Error('Eligible product missing from sitemap: ' + product.canonicalPath);
    }
  }
  return { urlCount: locations.length, eligibleProducts: eligible };
}
