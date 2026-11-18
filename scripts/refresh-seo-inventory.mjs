import { execFileSync } from 'node:child_process';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { validateInventory } from './seo-inventory.mjs';

// SSH выполняет CLI-экспорт чтения под общим приватным lock; HTTP endpoint не создаётся.
const options = process.argv.slice(2);
const value = key => options[options.indexOf(key) + 1];
if (!options.includes('--host') || !options.includes('--identity')) throw Error('Usage: node scripts/refresh-seo-inventory.mjs --host user@host --identity /path/to/ssh-key');
const host = value('--host'), identity = value('--identity');
if (!/^[A-Za-z0-9_@.-]+$/.test(host) || host.startsWith('-') || !identity) throw Error('Invalid SSH arguments');
const source = await readFile(new URL('export-seo-inventory.php', import.meta.url));
const fingerprint = await readFile(new URL('catalog-content-fingerprint.php', import.meta.url), 'utf8');
const guard = await readFile(new URL('production-read-guard.php',import.meta.url),'utf8');
const authorization = await readFile(new URL('paused-read-authorization.php',import.meta.url),'utf8');
const approval = options.includes('--paused-read-approval') ? value('--paused-read-approval') : '';
if (approval && !/^[a-f0-9]{64}$/.test(approval)) throw Error('Invalid paused read approval');
const sha = execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const input = authorization + `\n$o100ApprovalHash='${approval}';$o100SourceSha='${sha}';\n` + guard.replace(/^<\?php/,'') + '\n' + fingerprint.replace(/^<\?php/,'') + '\n' + source.toString('utf8').replace(/^<\?php/, '')
  + "\no100_read_authorization($o100ReadHome,$o100ApprovalHash,$o100SourceSha,'inventory');";
const bytes = execFileSync('ssh', ['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-i',identity,host,'php8.1'], {input, maxBuffer:32*1024*1024, timeout:600000});
const inventory = validateInventory(JSON.parse(bytes.toString('utf8')));
const target = new URL('../deploy/seo-active-products.json.gz',import.meta.url);
const temporary = new URL('../deploy/seo-active-products.json.gz.tmp',import.meta.url);
await writeFile(temporary,gzipSync(JSON.stringify(inventory)+'\n'));
await rename(temporary,target);
console.log(`Refreshed ${inventory.products.length} active products at ${inventory.generatedAt}; commit the snapshot before preparing production.`);
