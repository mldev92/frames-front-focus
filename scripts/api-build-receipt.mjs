// Принимается только завершённая offline-сборка текущего исходника и каталога.
export function verifyApiBuildReceipt(receipt, expected, now = Date.now()) {
  const started = Date.parse(receipt.snapshotStartedAt), finished = Date.parse(receipt.finishedAt);
  if (!Number.isFinite(started) || !Number.isFinite(finished) || started > finished || finished > now || now - started > 24 * 3600000) throw Error('API snapshot expired or has invalid build timestamps');
  if (receipt.version !== 1 || receipt.mode !== 'replay' || receipt.upstreamRequests !== 0 || receipt.failures !== 0 || !Number.isSafeInteger(receipt.requests) || receipt.requests < 1 || receipt.frontendSha !== expected.frontendSha || receipt.binding?.backendSha !== expected.backendSha || receipt.binding?.routingSha256 !== expected.routingSha256 || receipt.binding?.inventorySha256 !== expected.inventorySha256 || receipt.binding?.origin !== 'https://optika100.com' || !/^[a-f0-9]{64}$/.test(receipt.snapshotSha256 || '')) throw Error('A verified offline API snapshot build is required for packaging');
}
