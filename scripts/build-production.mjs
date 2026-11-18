import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { openSnapshot, startGateway, digest } from './build-api-snapshot.mjs';
import { acquireProductionReadLease } from './production-read-lease.mjs';
import { verifyCaptureSource } from './verify-capture-source.mjs';
import { loadInventory } from './seo-inventory.mjs';
import { catalogFingerprint } from './catalog-refresh-policy.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const receiptFile = path.join(root,'generated/api-snapshot-build.json');
await mkdir(path.dirname(receiptFile),{recursive:true});
await unlink(receiptFile).catch(error => { if(error.code !== 'ENOENT') throw error; });
const args = process.argv.slice(2);
const value = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const mode = args.includes('--capture') ? 'capture' : 'replay';
const directory = value('--snapshot') || process.env.O100_API_SNAPSHOT;
const expectedSha256 = value('--sha256') || process.env.O100_API_SNAPSHOT_SHA256;
const origin = (process.env.VITE_BITRIX_API || 'https://optika100.com').replace(/\/$/, '');
if (!directory) throw Error('A reviewed API snapshot is required: --snapshot DIR --sha256 HASH. No live fallback.');
// Эти два файла — выход manifest; повторный запуск всегда создаёт их заново.
if (execFileSync('git',['status','--porcelain','--','.',':!public/sitemap.xml',':!public/robots.txt'],{cwd:root,encoding:'utf8'}).trim()) throw Error('Commit and review the build source before using production data');
if (origin !== 'https://optika100.com') throw Error('Production origin must be https://optika100.com');
if (!/^[a-f0-9]{40}$/.test(process.env.O100_BACKEND_SHA || '') || !/^[a-f0-9]{64}$/.test(process.env.O100_ROUTING_SHA256 || '')) throw Error('Inspected backend SHA and routing SHA256 are required');
const inventory = await loadInventory();
const binding = {
  origin,
  inventorySha256: digest(await readFile(path.join(root,'deploy/seo-active-products.json.gz'))),
  catalogFingerprint: catalogFingerprint(inventory),
  backendSha: process.env.O100_BACKEND_SHA,
  routingSha256: process.env.O100_ROUTING_SHA256,
};
let lease, gateway, child;
const controller = new AbortController();
const interrupted = () => controller.abort(Error('Build interrupted'));
process.once('SIGINT', interrupted); process.once('SIGTERM', interrupted);
const run = (file, argv, env) => new Promise((resolve,reject) => {
  child = spawn(process.execPath,[file,...argv],{cwd:root,env,stdio:'inherit',windowsHide:true,signal:controller.signal});
  child.once('error',reject);
  child.once('exit',code => code === 0 ? resolve() : reject(Error(path.basename(file)+' exited '+code)));
});
try {
  if (mode === 'capture') lease = await acquireProductionReadLease({host:value('--host'),identity:value('--identity'),
    approvalSha256:value('--paused-read-approval'),sourceSha:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim()});
  lease?.signal.addEventListener('abort',() => controller.abort(lease.signal.reason),{once:true});
  lease?.assertAlive();
  const snapshot = await openSnapshot({directory,binding,mode,expectedSha256});
  const verifySource = () => verifyCaptureSource({host:value('--host'),identity:value('--identity'),binding,signal:controller.signal});
  if (mode === 'capture') await verifySource();
  gateway = await startGateway({snapshot,assertLease:() => lease.assertAlive(),leaseSignal:lease?.signal});
  const guard = new URL('./build-network-guard.mjs',import.meta.url).href;
  const frontendSha = execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  const env = {...process.env,VITE_RELEASE_SHA:frontendSha,VITE_BITRIX_API:origin,O100_BUILD_ORIGIN:origin,O100_BUILD_GATEWAY:gateway.url,O100_BUILD_MODE:mode,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --import=${guard}`.trim()};
  // Оба этапа используют один gateway: лимит общий для manifest, SSR и повторов маршрутов.
  await run('scripts/localize-blog-assets.mjs',['--offline'],env);
  await run('scripts/generate-production-manifest.mjs',[],env);
  await run('node_modules/vite/bin/vite.js',['build','--config','vite.config.production.ts'],env);
  await run('scripts/validate-production-build.mjs',[],env);
  gateway.assertHealthy();
  if (mode === 'capture') {
    lease.assertAlive();
    await verifySource();
    lease.assertAlive();
    const sha256 = await snapshot.seal();
    console.log(JSON.stringify({status:'snapshot_complete',directory,sha256,...gateway.stats}));
    console.log('Capture output cannot be released. Run build:production with this snapshot and checksum.');
  } else {
    if (gateway.stats.upstreamRequests !== 0) throw Error('Replay unexpectedly accessed production');
    const receipt = {version:1,frontendSha,binding,snapshotSha256:expectedSha256,snapshotStartedAt:snapshot.index.startedAt,finishedAt:new Date().toISOString(),...gateway.stats};
    await writeFile(receiptFile,JSON.stringify(receipt,null,2)+'\n');
    console.log(JSON.stringify({status:'offline_build_complete',...receipt}));
  }
} finally {
  if (child?.exitCode === null) child.kill();
  await gateway?.close();
  lease?.close();
  process.removeListener('SIGINT',interrupted); process.removeListener('SIGTERM',interrupted);
}
