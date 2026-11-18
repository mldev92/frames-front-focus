import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyApiBuildReceipt } from '../scripts/api-build-receipt.mjs';
const now=Date.parse('2026-11-18T00:00:00Z');
const expected={frontendSha:'a'.repeat(40),backendSha:'b'.repeat(40),routingSha256:'c'.repeat(64),inventorySha256:'d'.repeat(64)};
const receipt=()=>({version:1,mode:'replay',upstreamRequests:0,failures:0,requests:100,frontendSha:expected.frontendSha,binding:{...expected,origin:'https://optika100.com'},snapshotSha256:'e'.repeat(64),snapshotStartedAt:new Date(now-3600000).toISOString(),finishedAt:new Date(now-1000).toISOString()});
test('упаковка принимает свежую offline-сборку и отклоняет capture, live GET, ошибку, дрейф и просрочку',()=>{
  verifyApiBuildReceipt(receipt(),expected,now);
  for(const change of [r=>r.mode='capture',r=>r.upstreamRequests=1,r=>r.failures=1,r=>r.requests=0,r=>r.frontendSha='f'.repeat(40),r=>r.binding.backendSha='f'.repeat(40),r=>r.binding.inventorySha256='f'.repeat(64),r=>r.binding.routingSha256='f'.repeat(64),r=>r.snapshotStartedAt=new Date(now-25*3600000).toISOString(),r=>r.finishedAt=new Date(now+1000).toISOString(),r=>r.snapshotSha256='bad']){
    const value=receipt();change(value);assert.throws(()=>verifyApiBuildReceipt(value,expected,now));
  }
});
