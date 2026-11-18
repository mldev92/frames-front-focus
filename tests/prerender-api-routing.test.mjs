import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

async function client(env, fetcher) {
  const source=(await readFile(new URL('../src/lib/api/security.ts',import.meta.url),'utf8')).replaceAll('import.meta.env',JSON.stringify(env));
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
  const module={exports:{}};
  new Function('module','exports','fetch',outputText)(module,module.exports,fetcher);
  return module.exports;
}
test('только prerender направляет API в gateway; города и query сохраняются',async()=>{
  const calls=[];const env={SSR:true,VITE_PRERENDER_BUILD:'true',VITE_BITRIX_API:'https://optika100.com',VITE_PRERENDER_API:'http://127.0.0.1:12345'};
  const api=await client(env,async url=>{calls.push(String(url));return Response.json({id:1});});
  await api.apiFetch('https://optika100.com/api/store/product.php?city=nvk&slug=one&section=opravy');
  assert.deepEqual(calls,['http://127.0.0.1:12345/api/store/product.php?city=nvk&slug=one&section=opravy']);
});
test('ошибка gateway или приватный запрос не допускают live fallback',async()=>{
  let calls=0;
  const env={SSR:true,VITE_PRERENDER_BUILD:'true',VITE_BITRIX_API:'https://optika100.com'};
  const broken=await client(env,async()=>{calls++;return Response.json({});});
  await assert.rejects(broken.apiFetch('https://optika100.com/api/store/product.php'),/snapshot/);
  const api=await client({...env,VITE_PRERENDER_API:'http://127.0.0.1:12345'},async()=>{calls++;throw Error('gateway unavailable');});
  await assert.rejects(api.apiFetch('https://optika100.com/api/store/product.php',{method:'POST'}),/anonymous/);
  await assert.rejects(api.apiFetch('https://optika100.com/api/store/product.php',{headers:{Cookie:'secret'}}),/anonymous/);
  await assert.rejects(api.apiFetch('https://other.test/api/store/product.php'),/anonymous/);
  assert.equal(calls,0);
  await assert.rejects(api.apiFetch('https://optika100.com/api/store/product.php'),/gateway unavailable/);
  assert.equal(calls,1);
});
test('браузер и обычный SSR продолжают читать свежие ответы, без общего кеша цен',async()=>{
  for(const env of [{SSR:false,VITE_PRERENDER_BUILD:'true'},{SSR:true,VITE_PRERENDER_BUILD:'false'}]){
    const calls=[];
    const api=await client({...env,VITE_BITRIX_API:'https://optika100.com'},async url=>{calls.push(url);return Response.json({price:calls.length});});
    const url='https://optika100.com/api/store/product.php?slug=one';
    assert.deepEqual(await (await api.apiFetch(url)).json(),{price:1});
    assert.deepEqual(await (await api.apiFetch(url)).json(),{price:2});
    assert.deepEqual(calls,[url,url]);
  }
});
