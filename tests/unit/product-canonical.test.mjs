import test from 'node:test';
import assert from 'node:assert/strict';
import { productCanonicalUrl } from '../../src/lib/product-seo.ts';

test('product canonical uses the authoritative regional path instead of the requested alias', () => {
  assert.equal(productCanonicalUrl({canonicalPath:'/catalog_n/linzy_dlya_ochkov/ofisnye/VX Start/'},'/catalog_n/linzy_dlya_ochkov/VX Start/'), 'https://optika100.com/catalog_n/linzy_dlya_ochkov/ofisnye/VX%20Start/');
  assert.equal(productCanonicalUrl({},'/catalog_s/opravy/frame/'),'https://optika100.com/catalog_s/opravy/frame/');
  assert.equal(productCanonicalUrl({canonicalPath:'https://elsewhere.invalid/frame/'},'/catalog_s/opravy/frame/'),'https://optika100.com/catalog_s/opravy/frame/');
});
