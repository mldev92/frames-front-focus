import assert from 'node:assert/strict';
import test from 'node:test';
import { reconcileRetiredProducts } from '../scripts/reconcile-retired-products.mjs';

const path = '/catalog_s/opravy/retired_model/';
test('из manifest удаляется только повторно подтверждённый 404', async () => {
  const routes = new Set([path, '/catalog_s/opravy/']);
  assert.deepEqual(await reconcileRetiredProducts(routes, [path], 'https://example.test', async () => new Response('', { status: 404 })), [path]);
  assert.deepEqual([...routes], ['/catalog_s/opravy/']);
});
test('восстановленный товар, включая товар вне наличия, остаётся в manifest', async () => {
  const routes = new Set();
  const retired = await reconcileRetiredProducts(routes, [path], 'https://example.test', async () => Response.json({ id: 7, slug: 'retired_model', inStock: false }));
  assert.deepEqual(retired, []);
  assert.ok(routes.has(path));
});
test('снятый URL повторно проверяется даже после удаления из live sitemap', async () => {
  const routes = new Set();
  assert.deepEqual(await reconcileRetiredProducts(routes, [path], 'https://example.test', async () => new Response('', {status:404})), [path]);
});
test('сбой API и несовпадение идентичности не превращаются в удаление товара', async () => {
  for (const response of [new Response('', { status: 503 }), Response.json({ id: 8, slug: 'different_model' })]) {
    const routes = new Set([path]);
    await assert.rejects(reconcileRetiredProducts(routes, [path], 'https://example.test', async () => response));
    assert.ok(routes.has(path));
  }
});
