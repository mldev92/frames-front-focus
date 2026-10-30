import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pluginRoot = path.dirname(require.resolve('@tanstack/start-plugin-core/package.json'));
const { prerender } = await import(pathToFileURL(path.join(pluginRoot, 'dist/esm/prerender.js')));

async function run(t, request) {
  const directory = await mkdtemp(path.join(tmpdir(), 'o100-prerender-'));
  t.after(async () => {
    assert.equal(path.dirname(directory), path.resolve(tmpdir()));
    await rm(directory, { recursive: true, force: true });
  });
  let closed = false;
  const execute = () => prerender({
    startConfig: {
      router: { basepath: '/' },
      pages: [{ path: '/retry/' }, { path: '/healthy/' }],
      prerender: { enabled: true, autoStaticPathsDiscovery: false, crawlLinks: false,
        concurrency: 2, retryCount: 2, retryDelay: 1, failOnError: true },
    },
    handler: { getClientOutputDirectory: () => directory, request,
      close: async () => { closed = true; } },
  });
  return { execute, directory, closed: () => closed };
}

for (const failure of ['http', 'socket']) {
  test(`prerender повторяет ${failure} и сохраняет обе страницы`, async (t) => {
    const attempts = new Map();
    const fixture = await run(t, async (url) => {
      attempts.set(url, (attempts.get(url) ?? 0) + 1);
      if (url === '/retry/' && attempts.get(url) === 1) {
        if (failure === 'socket') throw new TypeError('fetch failed');
        return new Response('temporary', { status: 503 });
      }
      return new Response(`<h1>${url}</h1>`, { headers: { 'Content-Type': 'text/html' } });
    });
    await fixture.execute();
    assert.equal(attempts.get('/retry/'), 2);
    assert.equal(attempts.get('/healthy/'), 1);
    assert.equal(await readFile(path.join(fixture.directory, 'retry/index.html'), 'utf8'), '<h1>/retry/</h1>');
    assert.equal(fixture.closed(), true);
  });
}

test('prerender прекращает сборку после исчерпания повторных попыток', async (t) => {
  let attempts = 0;
  const fixture = await run(t, async (url) => {
    if (url === '/retry/') { attempts++; return new Response('failed', { status: 503 }); }
    return new Response('<h1>Healthy</h1>', { headers: { 'Content-Type': 'text/html' } });
  });
  await assert.rejects(fixture.execute(), AggregateError);
  assert.equal(attempts, 3);
  assert.equal(fixture.closed(), true);
});
