import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { validateInventory, robotsAllows } from '../scripts/seo-inventory.mjs';
import { validateSitemap } from '../scripts/sitemap-validation.mjs';

const now = Date.parse('2026-10-30T12:00:00Z');
const fixture = () => ({ version: 1, origin: 'https://optika100.com', generatedAt: new Date(now).toISOString(), counts: {spb: 2, nvk: 1}, products: [
  {id: 1, city: 'spb', canonicalPath: '/catalog_s/opravy/frame/', available: false, sectionActive: true},
  {id: 2, city: 'nvk', canonicalPath: '/catalog_n/opravy/frame/', available: true, sectionActive: true},
  {id: 3, city: 'spb', canonicalPath: '/catalog_s/hidden/frame2/', available: true, sectionActive: false},
] });
const xml = paths => '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + paths.map(p=>`<url><loc>https://optika100.com${encodeURI(p)}</loc></url>`).join('')+'</urlset>';

test('full inventory retains out-of-stock products and rejects incomplete, stale or ambiguous data', () => {
  assert.equal(validateInventory(fixture(),now).products.length,3);
  for (const mutate of [d=>d.products.pop(), d=>d.products[1].id=1, d=>d.products[1].city='spb', d=>d.products[2].canonicalPath=d.products[0].canonicalPath, d=>d.products[2].canonicalPath='/catalog_s/other/frame/', d=>d.generatedAt='2026-10-27T00:00:00Z', d=>d.products[0].canonicalPath='/catalog_s/opravy/frame/?x=1']) {
    const data=fixture(); mutate(data); assert.throws(()=>validateInventory(data,now));
  }
});

test('robots matching respects specificity, wildcard, endpoint and equal-length allow rules', () => {
  const robots='User-agent: *\nDisallow: /catalog_n/*\nAllow: /catalog_n/open/\nDisallow: /catalog_s/$\nDisallow: */private/\nDisallow: /tie\nAllow: /tie\nUser-agent: Yandex\nDisallow: /';
  assert.equal(robotsAllows(robots,'/catalog_n/opravy/frame/'),false);
  assert.equal(robotsAllows(robots,'/catalog_n/open/frame/'),true);
  assert.equal(robotsAllows(robots,'/catalog_s/'),false);
  assert.equal(robotsAllows(robots,'/catalog_s/opravy/'),true);
  assert.equal(robotsAllows(robots,'/catalog_s/private/'),false);
  assert.equal(robotsAllows(robots,'/tie/'),true);
});

test('sitemap covers eligible canonicals independent of stock, and excludes blocked/hidden/alias URLs', () => {
  const data=fixture(), paths=data.products.slice(0,2).map(p=>p.canonicalPath);
  assert.deepEqual(validateSitemap(xml(paths),paths,data,''),{urlCount:2,eligibleProducts:2});
  assert.throws(()=>validateSitemap(xml(paths.slice(1)),paths,data,''),/missing/);
  assert.throws(()=>validateSitemap(xml([...paths,paths[0]]),paths,data,''),/duplicate/);
  assert.throws(()=>validateSitemap(xml(paths),paths,data,'User-agent: *\nDisallow: /catalog_n/'),/robots-blocked/);
  assert.equal(validateSitemap(xml(paths.slice(0,1)),paths,data,'User-agent: *\nDisallow: /catalog_n/').eligibleProducts,1);
  for(const extra of ['/catalog_s/other/frame/', data.products[2].canonicalPath]) {
    assert.throws(()=>validateSitemap(xml([...paths,extra]),[...paths,extra],data,''),/Noncanonical or hidden/);
  }
});

test('reviewed robots opens Novokuznetsk while preserving product-specific restrictions', async () => {
  const robots=await readFile(new URL('../deploy/robots.production.txt',import.meta.url),'utf8');
  assert.equal(robotsAllows(robots,'/catalog_n/opravy/frame/'),true);
  assert.equal(robotsAllows(robots,'/catalog_n/linzy_dlya_ochkov/as_stellest_crizal_rock/'),false);
  assert.doesNotMatch(robots,/Disallow: \/catalog_n\/\*/);
});

test('reviewed redirects never replace an active canonical or target a different product', async () => {
  const inventory=JSON.parse(gunzipSync(await readFile(new URL('../deploy/seo-active-products.json.gz',import.meta.url))));
  validateInventory(inventory,Date.parse(inventory.generatedAt));
  const products=new Map(inventory.products.map(p=>[p.canonicalPath,p]));
  const identities=new Map(inventory.products.map(p=>[p.city+':'+p.canonicalPath.split('/').at(-2),p]));
  const identify=path=>identities.get((path.startsWith('/catalog_n/')?'nvk':'spb')+':'+path.split('/').at(-2));
  const text=await readFile(new URL('../deploy/redirects.production.txt',import.meta.url),'utf8');
  for(const line of text.split(/\r?\n/).filter(l=>l.startsWith('RedirectMatch '))) {
    const m=line.match(/^RedirectMatch 301 \^(\S+?)\/\?\$\s+(\S+)$/);
    assert.ok(m,line);
    const source=m[1].replace(/\\x20/g,' ').replace(/\\([.\-])/g,'$1')+'/';
    const target=decodeURI(new URL(m[2]).pathname), from=identify(source), to=identify(target);
    assert.ok(!products.get(source)?.sectionActive,source);
    if(to?.sectionActive) assert.equal(target,to.canonicalPath);
    if(from&&to) assert.equal(from.id,to.id);
  }
});
