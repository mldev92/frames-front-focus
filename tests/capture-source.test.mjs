import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { captureVerificationPhp } from '../scripts/verify-capture-source.mjs';

test('составной PHP проверки backend/routing/fingerprint проходит CLI lint',async()=>{
  const source=await captureVerificationPhp({backendSha:'a'.repeat(40),routingSha256:'b'.repeat(64)});
  const result=spawnSync('php',['-l'],{input:source,encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,result.stderr || result.error?.message);
  await assert.rejects(captureVerificationPhp({backendSha:'invalid',routingSha256:'b'.repeat(64)}),/Invalid/);
});
