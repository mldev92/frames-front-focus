import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, appendFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const endpoints = new Set(['homepage.php', 'products.php', 'product.php', 'galleries.php', 'menu_counts.php', 'catalog_sections.php']);
export const digest = value => createHash('sha256').update(value).digest('hex');
const stable = value => JSON.stringify(value);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function apiKey(input, origin) {
  const url = new URL(input, origin);
  if (url.origin !== origin || url.username || url.password || url.hash) throw Error('Snapshot request is outside the approved API');
  if (/^\/sitemap(?:[-_.][A-Za-z0-9_.-]+)?\.xml$/.test(url.pathname) && !url.search) return url.pathname;
  if (!url.pathname.startsWith('/api/store/')) throw Error('Snapshot request is outside the approved API');
  if (!endpoints.has(url.pathname.slice('/api/store/'.length))) throw Error('Snapshot permits only public catalog reads');
  if (new Set(url.searchParams.keys()).size !== [...url.searchParams.keys()].length) throw Error('Duplicate API parameters are forbidden');
  url.searchParams.sort();
  return url.pathname + url.search;
}

async function atomicJson(file, value) {
  await writeFile(file + '.tmp', stable(value) + '\n', { mode: 0o600 });
  await rename(file + '.tmp', file);
}

export async function openSnapshot({ directory, binding, mode = 'replay', expectedSha256, now = () => Date.now() }) {
  if (!['capture', 'replay'].includes(mode)) throw Error('Invalid snapshot mode');
  const root = path.resolve(directory);
  const indexFile = path.join(root, 'index.json');
  let index;
  try {
    const bytes = await readFile(indexFile);
    if (mode === 'replay' && (!/^[a-f0-9]{64}$/.test(expectedSha256 || '') || digest(bytes) !== expectedSha256)) throw Error('Snapshot index checksum mismatch');
    index = JSON.parse(bytes);
  } catch (error) {
    if (error.code !== 'ENOENT' || mode !== 'capture') throw error;
    await mkdir(root, { recursive: true, mode: 0o700 });
    index = { version: 1, binding, startedAt: new Date(now()).toISOString(), complete: false, entries: {} };
    await atomicJson(indexFile, index);
  }
  if (index.version !== 1 || stable(index.binding) !== stable(binding)) throw Error('Snapshot does not match the API, inventory, backend and routing');
  const age = now() - Date.parse(index.startedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) throw Error('Snapshot is stale or has a future timestamp');
  if (mode === 'replay' && !index.complete) throw Error('Incomplete snapshot cannot build production');
  if (mode === 'capture' && index.complete) throw Error('Complete snapshots are immutable; use replay or a new directory');
  if (!index.complete) {
    // Журнал добавляется по одной записи: не переписываем растущий индекс после каждого GET.
    const journal = await readFile(path.join(root,'responses.jsonl'),'utf8').catch(error => { if(error.code === 'ENOENT') return ''; throw error; });
    for (const line of journal.split('\n').filter(Boolean)) {
      const item = JSON.parse(line);
      if (typeof item.key !== 'string' || typeof item.sha256 !== 'string') throw Error('Invalid snapshot journal');
      index.entries[item.key] = item.sha256;
    }
  }
  const records = new Map();
  for (const [key, checksum] of Object.entries(index.entries)) {
    if (apiKey(key, binding.origin) !== key || !/^[a-f0-9]{64}$/.test(checksum)) throw Error('Invalid snapshot entry');
    const bytes = await readFile(path.join(root, digest(key) + '.json'));
    if (digest(bytes) !== checksum) throw Error('Snapshot response checksum mismatch');
    const record = JSON.parse(bytes);
    if (record.key !== key || ![200, 404].includes(record.status) || !['application/json','application/xml'].includes(record.contentType) || (record.status === 404 && !key.startsWith('/api/store/product.php?'))) throw Error('Invalid snapshot response');
    records.set(key, checksum);
  }
  let writes = Promise.resolve();
  return {
    binding, mode, index, records,
    async readRecord(key) {
      const bytes = await readFile(path.join(root,digest(key)+'.json'));
      if (digest(bytes) !== records.get(key)) throw Error('Snapshot response changed during build');
      return JSON.parse(bytes);
    },
    fresh() {
      if (now() - Date.parse(index.startedAt) > MAX_AGE_MS) throw Error('Snapshot expired during the build');
    },
    async put(record) {
      if (mode !== 'capture' || index.complete) throw Error('Snapshot is read-only');
      writes = writes.then(async () => {
        const file = path.join(root, digest(record.key) + '.json');
        const bytes = Buffer.from(stable(record) + '\n');
        await writeFile(file + '.tmp', bytes, { mode: 0o600 });
        await rename(file + '.tmp', file);
        const checksum = digest(bytes);
        await appendFile(path.join(root,'responses.jsonl'),stable({key:record.key,sha256:checksum})+'\n',{mode:0o600});
        index.entries[record.key] = checksum;
        records.set(record.key, checksum);
      });
      await writes;
    },
    async seal() {
      await writes;
      this.fresh();
      if (mode !== 'capture' || records.size === 0) throw Error('Cannot seal this snapshot');
      index.complete = true;
      index.completedAt = new Date(now()).toISOString();
      await atomicJson(indexFile, index);
      return digest(await readFile(indexFile));
    },
  };
}

export async function startGateway({ snapshot, fetchImpl = fetch, assertLease = () => { throw Error('Production read lease is missing'); }, leaseSignal, intervalMs = 1000, maxRequests = 35000, timeoutMs = 15000, maxBytes = 8 * 1024 * 1024, testClock = false }) {
  if ((!testClock && intervalMs < 1000) || !Number.isSafeInteger(maxRequests) || maxRequests < 1 || maxRequests > 35000) throw Error('Unsafe capture limits');
  const stats = { requests: 0, hits: 0, upstreamRequests: 0, failures: 0, mode: snapshot.mode };
  const pending = new Map();
  const shutdown = new AbortController();
  let queue = Promise.resolve(), lastStarted = 0, stopped;
  const fail = error => { stopped ??= error; stats.failures++; return error; };
  const read = key => {
    snapshot.fresh();
    if (stopped) throw stopped;
    if (snapshot.records.has(key)) { stats.hits++; return snapshot.readRecord(key); }
    if (snapshot.mode !== 'capture') throw fail(Error('Snapshot miss; production access is forbidden: ' + key));
    if (pending.has(key)) return pending.get(key);
    const work = queue.then(async () => {
      if (stopped) throw stopped;
      assertLease();
      if (stats.upstreamRequests >= maxRequests) throw Error('Snapshot capture request budget exhausted');
      await sleep(Math.max(0, intervalMs - (Date.now() - lastStarted)));
      if (stopped) throw stopped;
      assertLease();
      snapshot.fresh();
      lastStarted = Date.now(); stats.upstreamRequests++;
      // Ни cookie, ни Authorization, ни произвольные заголовки клиента не передаются.
      const response = await fetchImpl(snapshot.binding.origin + key, {
        headers: { accept: 'application/json', 'user-agent': 'Optika100 bounded snapshot capture' },
        redirect: 'error', signal: AbortSignal.any([shutdown.signal, ...(leaseSignal ? [leaseSignal] : []), AbortSignal.timeout(timeoutMs)]),
      });
      if (response.status !== 200 && !(response.status === 404 && key.startsWith('/api/store/product.php?'))) throw Error('Snapshot upstream failed: ' + response.status);
      const xml = key.startsWith('/sitemap');
      if (!xml && !response.headers.get('content-type')?.includes('application/json')) throw Error('Snapshot upstream did not return JSON');
      const chunks = []; let size = 0;
      for await (const chunk of response.body) {
        size += chunk.byteLength;
        if (size > maxBytes) throw Error('Snapshot response is too large');
        chunks.push(chunk);
      }
      const text = Buffer.concat(chunks).toString('utf8');
      if (xml && !/^\s*(?:<\?xml|<sitemapindex\b|<urlset\b)/.test(text)) throw Error('Snapshot upstream did not return a sitemap');
      const body = xml ? text : JSON.parse(text);
      if (response.status === 200 && body && typeof body === 'object' && 'error' in body) throw Error('Snapshot upstream returned an API error');
      assertLease();
      const record = { key, status: response.status, contentType: xml ? 'application/xml' : 'application/json', body };
      await snapshot.put(record);
      return record;
    }).catch(error => { throw fail(error); }).finally(()=>pending.delete(key));
    pending.set(key, work);
    queue = work.catch(() => {});
    return work;
  };
  const server = createServer(async (request, response) => {
    try {
      stats.requests++;
      if (request.method !== 'GET' || request.headers.authorization || request.headers.cookie) throw Error('Snapshot allows anonymous GET only');
      const key = apiKey(request.url, snapshot.binding.origin);
      const record = await read(key);
      response.writeHead(record.status, { 'content-type': record.contentType, 'cache-control': 'no-store' });
      response.end(record.contentType === 'application/json' ? stable(record.body) : record.body);
    } catch (error) {
      fail(error);
      response.writeHead(503, { 'content-type': 'application/json' });
      response.end(stable({ error: 'Build snapshot unavailable' }));
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return {
    url: 'http://127.0.0.1:' + server.address().port, stats,
    assertHealthy() { snapshot.fresh(); if (stopped) throw stopped; },
    async close() {
      stopped ??= Error('Snapshot gateway closed');
      shutdown.abort(stopped);
      server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await queue;
    },
  };
}
