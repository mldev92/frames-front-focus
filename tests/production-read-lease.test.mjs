import assert from 'node:assert/strict';
import test from 'node:test';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { leasePhp } from '../scripts/production-read-lease.mjs';

async function setup(t) {
  const root=await mkdtemp(path.join(tmpdir(),'o100-read-lease-'));
  t.after(async()=>{assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir())+path.sep+'o100-read-lease-'));await rm(root,{recursive:true,force:true});});
  const children=[];
  t.after(()=>{for(const child of children)child.kill();});
  const launch=()=>{
    const php=leasePhp.replace("'/home/t/tretya9f/wpoptik'",JSON.stringify(root.replaceAll('\\','/')));
    const child=spawn('php',['-r',php],{windowsHide:true});children.push(child);
    child.stdin.on('error',()=>{});
    const keepalive=setInterval(()=>{if(!child.stdin.destroyed&&!child.stdin.writableEnded)child.stdin.write('\n');},500);
    child.once('exit',()=>clearInterval(keepalive));
    let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
    const exited=new Promise((resolve,reject)=>{child.once('exit',code=>resolve(code));child.once('error',reject);});
    const ready=async()=>{
      const deadline=Date.now()+5000;
      while(!stdout.includes('LEASE_ALIVE')){
        if(child.exitCode!==null)throw Error('Lease failed: '+stderr);
        if(Date.now()>deadline)throw Error('Lease heartbeat missing: '+stderr);
        await new Promise(resolve=>setTimeout(resolve,25));
      }
    };
    return {child,exited,ready};
  };
  return {root,launch};
}
test('пауза 1С и диагностическое разрешение запрещают lease',async t=>{
  for(const name of ['.o100-1c-catalog-paused','.o100-1c-diagnostic-permit.json']){
    const {root,launch}=await setup(t);await writeFile(path.join(root,name),'{}');
    assert.equal(await launch().exited,4);
  }
});
test('flock исключает вторую машину, появление паузы прекращает первую', {timeout:12000},async t=>{
  const {root,launch}=await setup(t);const first=launch();await first.ready();
  assert.equal(await launch().exited,3);
  await writeFile(path.join(root,'.o100-1c-catalog-paused'),'paused');
  assert.equal(await first.exited,4);
});
test('закрытие управляющего stdin освобождает lease', {timeout:12000},async t=>{
  const {launch}=await setup(t);const first=launch();await first.ready();first.child.stdin.end();
  await first.exited;
  const second=launch();await second.ready();second.child.stdin.end();await second.exited;
});
