import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToString } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(relative, mocks = {}) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } });
  const module = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(name => name in mocks ? mocks[name] : require(name), module.exports, module);
  return module.exports;
}

test('сохранённая корзина не меняет первый SSR-снимок и восстанавливается после mount', async () => {
  const line = { lineId: 'spb:42', productId: 42, qty: 2, price: 1000 };
  const values = new Map([['optika-cart', JSON.stringify({ version: 3, state: { lines: [line], lensSelections: [{ qty: 2 }] } })]]);
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  globalThis.window = { localStorage: globalThis.localStorage };
  try {
    const { cartTotals } = load('../src/lib/cart-totals.ts');
    const { useCart } = load('../src/lib/store/cart.ts', {
      '@/lib/cart-migration': {}, '@/lib/cart-persistence': load('../src/lib/cart-persistence.ts'),
      '@/lib/order-repeat': {}, '@/lib/cart-totals': { cartTotals }, '@/lib/cart-prices': {},
      '@/lib/product-price': {}, '@/data/categories': {}, '@/lib/store/city': {},
    });
    function Totals() {
      const lines = useCart(state => state.lines);
      const lenses = useCart(state => state.lensSelections);
      return React.createElement('span', null, JSON.stringify(cartTotals(lines, lenses)));
    }
    assert.equal(useCart.persist.hasHydrated(), false);
    assert.deepEqual(useCart.getState().lines, []);
    const initialHtml = renderToString(React.createElement(Totals));
    await useCart.persist.rehydrate();
    assert.deepEqual(useCart.getState().lines, [line]);
    assert.deepEqual(useCart.getState().totals(), { count: 4, subtotal: 2000 });
    assert.equal(renderToString(React.createElement(Totals)), initialHtml, 'SSR читает начальный снимок, независимо от текущего состояния');
    assert.equal(typeof useCart.getState().repeatOrder, 'function');
    await useCart.persist.rehydrate();
    assert.deepEqual(useCart.getState().totals(), { count: 4, subtotal: 2000 });
  } finally { delete globalThis.localStorage; delete globalThis.window; }
});

test('обновление витрины не перезапускает активный loader и сохраняет refresh после перехода', async () => {
  const effects = [], events = new Map();
  let invalidations = 0, priceResets = 0;
  const router = { state: { isLoading: true, location: { pathname: '/catalog_n/opravy/' } }, invalidate: async () => { invalidations++; } };
  globalThis.window = { setInterval: () => 1, clearInterval: () => {}, addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) };
  globalThis.document = { visibilityState: 'visible', addEventListener: () => {}, removeEventListener: () => {} };
  try {
    const { StorefrontFreshness } = load('../src/components/StorefrontFreshness.tsx', {
      react: { useEffect: effect => effects.push(effect), useState: () => [false, () => {}] },
      '@tanstack/react-router': { useRouter: () => router },
      '@/lib/api/bitrix': { invalidateProductPrices: () => { priceResets++; } },
      '@/lib/api/security': {}, '@/lib/store/cart': { useCart: select => select({ lines: [], isOpen: false }) },
    });
    StorefrontFreshness();
    const cleanup = effects[0]();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(invalidations, 0);
    assert.equal(priceResets, 0);
    router.state.isLoading = false;
    events.get('focus')();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(invalidations, 1);
    assert.equal(priceResets, 1);
    events.get('focus')();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(invalidations, 1, 'Частые события фокуса объединяются');
    cleanup();
    assert.equal(events.size, 0);
  } finally { delete globalThis.window; delete globalThis.document; }
});
