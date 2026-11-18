import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('разрешение чтения требует закрытый 1С, точный исходник, срок и неизменный baseline; давление закрывает capture', t => {
  const root=mkdtempSync(path.join(tmpdir(),'o100-paused-read-'));
  t.after(()=>{assert.ok(path.resolve(root).startsWith(path.resolve(tmpdir())+path.sep+'o100-paused-read-'));rmSync(root,{recursive:true,force:true});});
  const result=execFileSync('php',[fileURLToPath(new URL('./fixtures/paused-read-authorization.php',import.meta.url)),root,fileURLToPath(new URL('../scripts/paused-read-authorization.php',import.meta.url))],{encoding:'utf8'});
  assert.match(result,/PASS: paused read authorization and pressure boundaries/);
});
