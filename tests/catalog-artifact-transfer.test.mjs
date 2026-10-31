import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { transferCatalogArtifacts, TRANSFER_TIMEOUT_MS, TRANSFER_KEEPALIVE_ARGS } from '../scripts/catalog-artifact-transfer.mjs';
import { digest, assertCandidateFresh, assertBaseline, assertStableCatalog } from '../scripts/catalog-refresh-policy.mjs';

function scenario(t, mode = 'success') {
  const directory = mkdtempSync(path.join(tmpdir(), 'o100-transfer-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const files = ['production-release.tgz', 'production-tools.tgz'].map((name, index) => {
    const bytes = Buffer.alloc(1024 + index, index + 3), file = path.join(directory, name);
    writeFileSync(file, bytes);
    return { path: file, bytes: bytes.length, sha256: digest(bytes) };
  });
  const worker = path.join(directory, 'worker.cjs');
  writeFileSync(worker, `const fs=require('fs'),path=require('path');const [dir,mode,...files]=process.argv.slice(2);fs.mkdirSync(path.join(dir,'remote'));for(const file of files){const b=fs.readFileSync(file);fs.writeFileSync(path.join(dir,'remote',path.basename(file)),mode==='corrupt'?b.subarray(0,10):b);if(mode==='timeout')Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,5000);if(mode==='disconnect')process.exit(9);}if(mode==='slow')Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,200);`);
  const started = Date.parse('2026-10-31T00:00:00Z');
  const state = { now: started, uploaded: false, ready: 0, calls: [], evidence: [], advanceAfterScp: 0, advanceAfterHash: 0 };
  const options = {
    job: { sha: 'a'.repeat(40), startedAt: new Date(started).toISOString() }, intervalHours: 6,
    files, host: 'user@example.test', sshArgs: ['-o', 'BatchMode=yes', '-o', 'StrictHostKeyChecking=yes'],
    now: () => state.now, markUploaded: () => { state.uploaded = true; },
    assertReady: () => { state.ready++; }, record: value => state.evidence.push(structuredClone(value)),
    run: (command, args, options) => {
      state.calls.push({ command, args, options });
      if (command === 'scp') {
        execFileSync(process.execPath, [worker, directory, mode, ...files.map(file => file.path)], { timeout: mode === 'timeout' ? 150 : 5000, stdio: 'pipe' });
        state.now += state.advanceAfterScp;
        return '';
      }
      const result = files.map(file => digest(readFileSync(path.join(directory, 'remote', path.basename(file.path)))) + '  ' + path.basename(file.path)).join('\n');
      state.now += state.advanceAfterHash;
      return result;
    },
  };
  return { state, options, directory };
}

test('slow complete transfer verifies remote bytes before accepting the candidate', t => {
  const { state, options } = scenario(t, 'slow');
  const result = transferCatalogArtifacts(options);
  assert.equal(result.status, 'verified');
  assert.equal(state.uploaded, true); assert.equal(state.ready, 1);
  assert.equal(state.calls[0].options.timeout, 45 * 60 * 1000);
  for (const call of state.calls) for (const arg of TRANSFER_KEEPALIVE_ARGS) assert.ok(call.args.includes(arg));
  assert.deepEqual(state.evidence.map(e => e.status), ['uploading', 'verifying', 'verified']);
  assert.ok(!JSON.stringify(result).includes(options.host));
});

for (const mode of ['timeout', 'disconnect', 'corrupt']) test(`${mode} leaves the candidate unaccepted without retrying`, t => {
  const { state, options, directory } = scenario(t, mode);
  assert.throws(() => transferCatalogArtifacts(options), mode === 'corrupt' ? /checksum mismatch/ : undefined);
  assert.equal(state.ready, 0); assert.equal(state.calls.filter(c => c.command === 'scp').length, 1);
  assert.equal(state.uploaded, mode === 'corrupt');
  assert.equal(state.evidence.at(-1).status, 'failed');
  assert.ok(existsSync(path.join(directory, 'remote', 'production-release.tgz')));
});

test('expired candidate cannot start a transfer', t => {
  const { state, options } = scenario(t); state.now += 6 * 3600000;
  assert.throws(() => transferCatalogArtifacts(options), { code: 'CANDIDATE_EXPIRED' });
  assert.equal(state.calls.length, 0); assert.equal(state.uploaded, false);
});

test('remaining freshness bounds the transfer timeout', t => {
  const { state, options } = scenario(t); state.now += 6 * 3600000 - 120000;
  transferCatalogArtifacts(options);
  assert.equal(state.calls[0].options.timeout, 120000);
  assert.ok(state.calls[0].options.timeout < TRANSFER_TIMEOUT_MS);
});

for (const checkpoint of ['advanceAfterScp', 'advanceAfterHash']) test(`expiry at ${checkpoint} cannot accept the upload`, t => {
  const { state, options } = scenario(t); state[checkpoint] = 6 * 3600000;
  assert.throws(() => transferCatalogArtifacts(options), { code: 'CANDIDATE_EXPIRED' });
  assert.equal(state.uploaded, true); assert.equal(state.ready, 0);
  assert.equal(state.evidence.at(-1).status, 'failed');
});

test('expiry during final live checks blocks acceptance', t => {
  const { state, options } = scenario(t);
  options.assertReady = () => { state.now += 6 * 3600000; };
  assert.throws(() => transferCatalogArtifacts(options), { code: 'CANDIDATE_EXPIRED' });
  assert.equal(state.evidence.at(-1).status, 'failed');
});

test('production drift and changed Bitrix still reject a checksum-verified upload', t => {
  const { state, options } = scenario(t);
  options.assertReady = () => assertBaseline({ frontendSha: 'replacement' }, { frontendSha: 'approved' });
  assert.throws(() => transferCatalogArtifacts(options), /Production changed/);
  assert.equal(state.evidence.at(-1).status, 'failed');
  const next = scenario(t);
  next.options.assertReady = () => assertStableCatalog({ products: [], content: { sha256: 'a'.repeat(64) } }, { products: [], content: { sha256: 'b'.repeat(64) } });
  assert.throws(() => transferCatalogArtifacts(next.options), { code: 'CATALOG_CHANGED' });
  assert.equal(next.state.evidence.at(-1).status, 'failed');
});

test('invalid freshness metadata is rejected instead of disabling the deadline', () => {
  for (const [startedAt, hours, now] of [['invalid', 6, 100], [new Date(101).toISOString(), 6, 100], [new Date(0).toISOString(), NaN, 100], [new Date(0).toISOString(), 0, 100]]) {
    assert.throws(() => assertCandidateFresh({ startedAt }, hours, now), /Invalid candidate/);
  }
});
