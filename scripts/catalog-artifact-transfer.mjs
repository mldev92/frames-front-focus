import path from 'node:path';
import { assertCandidateFresh } from './catalog-refresh-policy.mjs';

export const TRANSFER_TIMEOUT_MS = 45 * 60 * 1000;
export const TRANSFER_KEEPALIVE_ARGS = ['-o', 'ServerAliveInterval=30', '-o', 'ServerAliveCountMax=3'];

// Один ограниченный upload: частичный пакет никогда не возобновляется автоматически.
export function transferCatalogArtifacts({ job, intervalHours, files, host, sshArgs, run, markUploaded, assertReady, record, now = Date.now }) {
  if (!/^[a-f0-9]{40}$/.test(job.sha) || !/^[A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+$/.test(host)) throw Error('Invalid transfer destination');
  const names = ['production-release.tgz', 'production-tools.tgz'];
  if (files.length !== names.length || files.some((file, index) => path.basename(file.path) !== names[index] || !/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isSafeInteger(file.bytes) || file.bytes <= 0)) throw Error('Invalid transfer manifest');
  const remote = '/home/t/tretya9f/o100-upload-' + job.sha;
  const started = now();
  const timeoutMs = Math.min(TRANSFER_TIMEOUT_MS, assertCandidateFresh(job, intervalHours, started));
  const evidence = { candidate: job.sha, startedAt: new Date(started).toISOString(), timeoutMs, files: files.map((file, index) => ({ name: names[index], bytes: file.bytes, sha256: file.sha256 })), status: 'uploading' };
  record(evidence);
  try {
    run('scp', [...sshArgs, ...TRANSFER_KEEPALIVE_ARGS, ...files.map(file => file.path), host + ':' + remote + '/'], { timeout: timeoutMs });
    // После завершения scp любой отказ требует проверки оператором, даже до переключения.
    markUploaded();
    evidence.status = 'verifying'; record(evidence);
    const remaining = assertCandidateFresh(job, intervalHours, now());
    const output = run('ssh', [...sshArgs, ...TRANSFER_KEEPALIVE_ARGS, host, `cd '${remote}' && sha256sum ${names.join(' ')}`], { timeout: Math.min(15 * 60 * 1000, remaining) });
    const lines = output.trim().split(/\r?\n/);
    if (lines.length !== files.length || lines.some((line, index) => line !== files[index].sha256 + '  ' + names[index])) throw Error('Uploaded artifact checksum mismatch');
    assertCandidateFresh(job, intervalHours, now());
    assertReady();
    assertCandidateFresh(job, intervalHours, now());
    Object.assign(evidence, { status: 'verified', completedAt: new Date(now()).toISOString(), elapsedMs: now() - started });
    record(evidence);
    return evidence;
  } catch (error) {
    Object.assign(evidence, { status: 'failed', failedAt: new Date(now()).toISOString(), elapsedMs: now() - started, reason: error.code || error.message });
    record(evidence);
    throw error;
  }
}
