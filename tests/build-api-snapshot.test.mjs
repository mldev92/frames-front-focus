import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { openSnapshot, startGateway, apiKey, digest } from '../scripts/build-api-snapshot.mjs';

const binding = { origin:'https://optika100.com',inventorySha256:'a'.repeat(64),backendSha:'b'.repeat(40),routingSha256:'c'.repeat(64) };
const key = '/api/store/product.php?city=spb&section=opravy&slug=one';
async function directory(t) {
  const root = await mkdtemp(path.join(tmpdir(),'o100-api-snapshot-'));
  t.after(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir()) + path.sep + 'o100-api-snapshot-'));
    await rm(root,{recursive:true,force:true});
  });
  return root;
}
async function gateway(t, options = {}) {
  const root = await directory(t);
  const snapshot = await openSnapshot({directory:root,binding,mode:'capture'});
  const server = await startGateway({snapshot,assertLease:()=>{},intervalMs:0,testClock:true,...options});
  t.after(()=>server.close());
  return {root,snapshot,server};
}
const record = (keyValue=key) => ({key:keyValue,status:200,contentType:'application/json',body:{id:1,price:100}});
const worker = (url, environment) => new Promise((resolve,reject) => {
  const child = spawn(process.execPath,['--import',new URL('../scripts/build-network-guard.mjs',import.meta.url).href,'--input-type=module','-e',`const r=await fetch(${JSON.stringify(url)}); console.log(r.status+':'+await r.text());`],{env:{...process.env,...environment},windowsHide:true});
  let out='',err='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b);
  child.once('error',reject);child.once('exit',code=>code===0?resolve(out):reject(Error(err)));
});

test('разные города, разделы и варианты не смешиваются; приватные и внешние URL запрещены',()=>{
  assert.equal(apiKey('/api/store/product.php?slug=one&city=spb&section=opravy',binding.origin),key);
  assert.notEqual(apiKey(key.replace('spb','nvk'),binding.origin),key);
  assert.notEqual(apiKey(key.replace('opravy','other'),binding.origin),key);
  for(const value of ['/api/store/orders.php','/api/store/product.php?slug=a&slug=b','https://other.test/api/store/product.php','/bitrix/admin/1c_exchange.php','/upload/private.xml','/sitemap.xml?token=x']) assert.throws(()=>apiKey(value,binding.origin));
  assert.equal(apiKey('/sitemap-iblock-1.xml',binding.origin),'/sitemap-iblock-1.xml');
});

test('общая очередь нескольких Node-процессов: один запрос на ключ, не чаще 1/сек; replay без upstream',async t=>{
  const root=await directory(t),starts=[];let active=0,maxActive=0;
  const upstream=createServer(async(request,response)=>{
    starts.push(Date.now());maxActive=Math.max(maxActive,++active);
    await new Promise(resolve=>setTimeout(resolve,30));
    active--;response.writeHead(200,{'content-type':'application/json'});response.end(JSON.stringify({path:request.url}));
  });
  await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>upstream.close(resolve)));
  const origin='http://127.0.0.1:'+upstream.address().port;
  const snapshot=await openSnapshot({directory:root,binding,mode:'capture'});
  const capture=await startGateway({snapshot,assertLease:()=>{},fetchImpl:(url,init)=>fetch(origin+new URL(url).pathname+new URL(url).search,init)});
  const env={O100_BUILD_MODE:'capture',O100_BUILD_ORIGIN:binding.origin,O100_BUILD_GATEWAY:capture.url};
  try {
    const inputs=[key,key,key.replace('spb','nvk'),key.replace('opravy','other'),key];
    const values=await Promise.all(inputs.map(k=>worker(binding.origin+k,env)));
    assert.ok(values.every(v=>v.startsWith('200:')));
    assert.equal(starts.length,3);assert.equal(maxActive,1);
    assert.ok(starts[1]-starts[0]>=950);assert.ok(starts[2]-starts[1]>=950);
    capture.assertHealthy();
  } finally {await capture.close();}
  const sha=await snapshot.seal();
  const replayStore=await openSnapshot({directory:root,binding,expectedSha256:sha});
  const replay=await startGateway({snapshot:replayStore,fetchImpl:()=>{throw Error('must never access upstream');}});
  try {
    const output=await worker(binding.origin+key,{...env,O100_BUILD_MODE:'replay',O100_BUILD_GATEWAY:replay.url});
    assert.match(output,/200:/);assert.equal(replay.stats.upstreamRequests,0);assert.equal(starts.length,3);
    assert.equal((await fetch(replay.url+key.replace('one','missing'))).status,503);
    assert.throws(()=>replay.assertHealthy(),/miss/);assert.equal(starts.length,3);
  } finally {await replay.close();}
});

test('частичный снимок возобновляется, но не публикуется; checksum, binding и свежесть обязательны',async t=>{
  const root=await directory(t);
  const partial=await openSnapshot({directory:root,binding,mode:'capture'});await partial.put(record());
  const partialHash=digest(await readFile(path.join(root,'index.json')));
  await assert.rejects(openSnapshot({directory:root,binding,expectedSha256:partialHash}),/Incomplete/);
  const resumed=await openSnapshot({directory:root,binding,mode:'capture'});assert.equal(resumed.records.size,1);
  const sha=await resumed.seal();
  await assert.rejects(openSnapshot({directory:root,binding,mode:'capture'}),/immutable/);
  await assert.rejects(openSnapshot({directory:root,binding,expectedSha256:'0'.repeat(64)}),/checksum/);
  await assert.rejects(openSnapshot({directory:root,binding:{...binding,backendSha:'d'.repeat(40)},expectedSha256:sha}),/match/);
  await assert.rejects(openSnapshot({directory:root,binding,expectedSha256:sha,now:()=>Date.now()+25*3600000}),/stale/);
  await assert.rejects(openSnapshot({directory:root,binding,expectedSha256:sha,now:()=>Date.now()-3600000}),/future/);
  await writeFile(path.join(root,digest(key)+'.json'),'{}');
  await assert.rejects(openSnapshot({directory:root,binding,expectedSha256:sha}),/checksum/);
});

test('один отказ upstream останавливает очередь без повторов',async t=>{
  let calls=0;const {server}=await gateway(t,{fetchImpl:async()=>{calls++;return Response.json({error:'unavailable'},{status:503});}});
  const results=await Promise.all([key,key.replace('one','two'),key.replace('one','three')].map(k=>fetch(server.url+k)));
  assert.ok(results.every(r=>r.status===503));assert.equal(calls,1);assert.throws(()=>server.assertHealthy(),/503/);
});

test('закрытая lease и исчерпанный бюджет запрещают следующие production-запросы',async t=>{
  let calls=0;
  const first=await gateway(t,{assertLease:()=>{throw Error('paused');},fetchImpl:async()=>{calls++;return Response.json({id:1});}});
  assert.equal((await fetch(first.server.url+key)).status,503);assert.equal(calls,0);
  const second=await gateway(t,{maxRequests:1,fetchImpl:async()=>{calls++;return Response.json({id:1});}});
  assert.equal((await fetch(second.server.url+key)).status,200);
  assert.equal((await fetch(second.server.url+key.replace('one','two'))).status,503);assert.equal(calls,1);
});

test('потеря lease прерывает уже начатый запрос',async t=>{
  const abort=new AbortController();let entered;
  const started=new Promise(resolve=>entered=resolve);
  const {server}=await gateway(t,{leaseSignal:abort.signal,fetchImpl:async(_url,init)=>new Promise((_resolve,reject)=>{entered();init.signal.addEventListener('abort',()=>reject(init.signal.reason));})});
  const pending=fetch(server.url+key);await started;abort.abort(Error('SSH disconnected'));
  assert.equal((await pending).status,503);assert.throws(()=>server.assertHealthy(),/SSH disconnected/);
});

test('закрытие gateway прекращает активный запрос и не выпускает очередь в upstream',async t=>{
  let entered, calls=0;
  const started=new Promise(resolve=>entered=resolve);
  const {server}=await gateway(t,{fetchImpl:async(_url,init)=>new Promise((_resolve,reject)=>{calls++;entered();init.signal.addEventListener('abort',()=>reject(init.signal.reason));})});
  const first=fetch(server.url+key).catch(()=>null);
  await started;
  const second=fetch(server.url+key.replace('one','two')).catch(()=>null);
  await server.close();
  await Promise.all([first,second]);
  assert.equal(calls,1);
});

test('POST, cookie и непубличный endpoint не пересылаются',async t=>{
  for(const [target,init] of [[key,{method:'POST'}],[key,{headers:{cookie:'session=private'}}],['/api/store/orders.php',{}]]){
    let calls=0;const {server}=await gateway(t,{fetchImpl:async()=>{calls++;return Response.json({});}});
    assert.equal((await fetch(server.url+target,init)).status,503);assert.equal(calls,0);
  }
});

test('HTML ошибки, слишком большой ответ и JSON error не попадают в снимок',async t=>{
  for(const reply of [()=>new Response('<html>failure</html>'),()=>Response.json({error:'DB unavailable'}),()=>Response.json({data:'x'.repeat(100)})]){
    const {server,snapshot}=await gateway(t,{maxBytes:50,fetchImpl:async()=>reply()});
    assert.equal((await fetch(server.url+key)).status,503);assert.equal(snapshot.records.size,0);
  }
});

test('sitemap и 404 товара сохраняют тип и семантику',async t=>{
  const {server,snapshot}=await gateway(t,{fetchImpl:async url=>url.includes('/sitemap')?new Response('<urlset></urlset>',{headers:{'content-type':'application/xml'}}):Response.json({error:'not found'},{status:404})});
  const xml=await fetch(server.url+'/sitemap.xml');assert.equal(await xml.text(),'<urlset></urlset>');
  assert.equal((await fetch(server.url+key)).status,404);assert.equal(snapshot.records.size,2);
  server.assertHealthy();
});

test('предзагрузка отклоняет прямой запуск и другой внешний origin до сети',async()=>{
  await assert.rejects(worker(binding.origin+key,{O100_BUILD_MODE:'',O100_BUILD_GATEWAY:'',O100_BUILD_ORIGIN:''}),/snapshot runner/);
  await assert.rejects(worker('https://example.invalid/',{O100_BUILD_MODE:'replay',O100_BUILD_GATEWAY:'http://127.0.0.1:1',O100_BUILD_ORIGIN:binding.origin}),/External network is forbidden/);
});
