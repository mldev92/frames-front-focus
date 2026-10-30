import { readFile, writeFile } from 'node:fs/promises';
import { loadInventory, productForPath } from './seo-inventory.mjs';
const inventory = await loadInventory();
const byIdentity = new Map(inventory.products.map(p => [p.city + ':' + p.canonicalPath.split('/').at(-2), p]));
const file = new URL('../deploy/redirects.production.txt', import.meta.url);
const changes = [], conflicts = [], lines = [];
for (const line of (await readFile(file,'utf8')).split(/\r?\n/)) {
  if (!line.startsWith('RedirectMatch ')) { if(line) lines.push(line); continue; }
  const m = line.match(/^RedirectMatch 301 \^(\S+?)\/\?\$\s+(\S+)$/);
  if (!m) throw Error('Unknown redirect syntax');
  const source = m[1].replace(/\\x20/g,' ').replace(/\\([.\-])/g,'$1') + '/';
  const target = decodeURI(new URL(m[2]).pathname);
  const from = productForPath(source,byIdentity), to = productForPath(target,byIdentity);
  if (from && to && from.id !== to.id) { conflicts.push({source,target,fromId:from.id,toId:to.id}); continue; }
  if (from?.canonicalPath === source && from.sectionActive) { changes.push({source,target,action:'remove-canonical-redirect'}); continue; }
  const destination = to?.sectionActive ? to.canonicalPath : target;
  if (destination !== target) changes.push({source,target,action:'retarget',canonical:destination});
  lines.push(line.replace(m[2], 'https://optika100.com' + encodeURI(destination)));
}
console.log(JSON.stringify({changes:changes.length,removed:changes.filter(x=>x.action.startsWith('remove')).length,retargeted:changes.filter(x=>x.action==='retarget').length,conflicts},null,2));
if(conflicts.length) throw Error('Conflicting product redirects require review');
if(process.argv.includes('--write')) {
  await writeFile(file, lines.join('\n')+'\n');
  await writeFile(new URL('../generated/canonical-redirect-changes.json',import.meta.url),JSON.stringify(changes,null,2)+'\n');
}
