import test from 'node:test';
import assert from 'node:assert/strict';
import { productCanonicalUrl, stellestProductScripts, stellestRockProductPath } from '../../src/lib/product-seo.ts';

test('product canonical uses the authoritative regional path instead of the requested alias', () => {
  assert.equal(productCanonicalUrl({canonicalPath:'/catalog_n/linzy_dlya_ochkov/ofisnye/VX Start/'},'/catalog_n/linzy_dlya_ochkov/VX Start/'), 'https://optika100.com/catalog_n/linzy_dlya_ochkov/ofisnye/VX%20Start/');
  assert.equal(productCanonicalUrl({},'/catalog_s/opravy/frame/'),'https://optika100.com/catalog_s/opravy/frame/');
  assert.equal(productCanonicalUrl({canonicalPath:'https://elsewhere.invalid/frame/'},'/catalog_s/opravy/frame/'),'https://optika100.com/catalog_s/opravy/frame/');
});

test('Prevencia offer markup uses the visible unit price and clean canonical URL', () => {
  const product = {
    slug: 'as_stellest_2_0_crizal_prevencia',
    name: 'AS Stellest 2.0 Crizal Prevencia',
    category: 'linzy-dlya-ochkov',
    price: 16020,
    oldPrice: 17800,
    inStock: true,
    description: 'Описание </script>',
    images: ['/upload/stellest.webp'],
  };
  const url = 'https://optika100.com/catalog_s/linzy_dlya_ochkov/detskie/as_stellest_2_0_crizal_prevencia/';
  const [script] = stellestProductScripts(product, url);
  assert.doesNotMatch(script.children, /<\/script>/);
  const schema = JSON.parse(script.children);
  assert.equal(schema['@type'], 'Product');
  assert.deepEqual(schema.offers, {
    '@type': 'Offer',
    url,
    price: 16020,
    priceCurrency: 'RUB',
    availability: 'https://schema.org/InStock',
  });
  assert.deepEqual(stellestProductScripts({ ...product, price: 0 }, url), []);
  assert.deepEqual(stellestProductScripts({ ...product, slug: 'as_stellest_crizal_rock' }, url), []);
});

test('Rock offer uses the confirmed Saint Petersburg price and expiration', () => {
  const product = {
    id: 56366,
    slug: 'as_stellest_crizal_rock',
    canonicalPath: stellestRockProductPath,
    name: 'AS Stellest Crizal Rock',
    category: 'linzy-dlya-ochkov',
    price: 8760,
    inStock: true,
    images: ['/upload/stellest.webp'],
  };
  const url = 'https://optika100.com' + stellestRockProductPath;
  const offer = (record) => JSON.parse(stellestProductScripts(record, url)[0].children).offers;
  assert.equal(offer(product).price, 8760);
  assert.equal(offer(product).priceValidUntil, '2027-12-31');
  assert.equal(offer({ ...product, price: 10000 }).priceValidUntil, undefined);
  assert.deepEqual(stellestProductScripts(product, url.replace('catalog_s', 'catalog_n')), []);
  assert.deepEqual(stellestProductScripts({ ...product, id: 999 }, url), []);
});
