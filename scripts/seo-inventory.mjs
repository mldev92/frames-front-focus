import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';

// Снимок снимается через SSH перед подготовкой выпуска; старый/неполный снимок блокирует сборку.
export function validateInventory(data, now = Date.now()) {
  if (data.version !== 1 || data.origin !== 'https://optika100.com' || !Array.isArray(data.products)) throw Error('Invalid SEO inventory');
  if (data.content && (data.content.version !== 1 || !/^[a-f0-9]{64}$/.test(data.content.sha256))) throw Error('Invalid catalog content fingerprint');
  const age = now - Date.parse(data.generatedAt);
  if (!Number.isFinite(age) || age < -300000 || age > 48 * 3600000) throw Error('SEO inventory expired; refresh with scripts/export-seo-inventory.php');
  const ids = new Set(), paths = new Set(), identities = new Set();
  const counts = { spb: 0, nvk: 0 };
  for (const p of data.products) {
    const prefix = p.city === 'spb' ? '/catalog_s/' : p.city === 'nvk' ? '/catalog_n/' : null;
    if (!prefix || !Number.isSafeInteger(p.id) || p.id < 1 || typeof p.sectionActive !== 'boolean' || typeof p.available !== 'boolean') throw Error('Invalid inventory row');
    if (typeof p.canonicalPath !== 'string' || !p.canonicalPath.startsWith(prefix) || !/^\/catalog_[sn]\/(?:[A-Za-z0-9_-]+\/)+[^/?#%<>"\x00-\x1f]+\/$/.test(p.canonicalPath)) throw Error('Invalid canonical path: ' + p.canonicalPath);
    const slug = p.canonicalPath.split('/').at(-2), identity = p.city + ':' + slug;
    if (ids.has(p.id) || paths.has(p.canonicalPath) || identities.has(identity)) throw Error('Ambiguous product identity: ' + p.canonicalPath);
    ids.add(p.id); paths.add(p.canonicalPath); identities.add(identity); counts[p.city]++;
  }
  for (const city of ['spb','nvk']) if (!counts[city] || counts[city] !== data.counts?.[city]) throw Error('Incomplete SEO inventory for ' + city);
  return data;
}

export async function loadInventory(file = new URL('../deploy/seo-active-products.json.gz', import.meta.url)) {
  const bytes = await readFile(file);
  const data = validateInventory(JSON.parse(gunzipSync(bytes).toString('utf8')));
  return { ...data, sha256: createHash('sha256').update(bytes).digest('hex') };
}

// Для списка URL учитываем правила robots для общего поискового робота.
export function robotsAllows(text, path) {
  let applicable = false, best = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const agent = line.match(/^User-agent:\s*(.*)$/i);
    if (agent) { applicable = agent[1] === '*'; continue; }
    const match = line.match(/^(Allow|Disallow):\s*(.*)$/i);
    if (!applicable || !match || !match[2]) continue;
    const pattern = match[2], allow = match[1].toLowerCase() === 'allow';
    const anchored = pattern.endsWith('$');
    const source = (anchored ? pattern.slice(0,-1) : pattern).split('*').map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
    if (!new RegExp('^' + source + (anchored ? '$' : '')).test(path)) continue;
    const length = pattern.replaceAll('*','').length;
    if (!best || length > best.length || (length === best.length && allow)) best = { length, allow };
  }
  return best?.allow ?? true;
}

export function productForPath(path, inventory) {
  const parts = path.split('/').filter(Boolean);
  const city = parts[0] === 'catalog_n' ? 'nvk' : parts[0] === 'catalog_s' ? 'spb' : null;
  return city ? inventory.get(city + ':' + parts.at(-1)) : undefined;
}
