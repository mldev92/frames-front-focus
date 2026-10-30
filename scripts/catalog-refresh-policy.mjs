import { createHash } from 'node:crypto';

export const digest = value => createHash('sha256').update(value).digest('hex');
export function catalogFingerprint(inventory) {
  if (!/^[a-f0-9]{64}$/.test(inventory.content?.sha256 ?? '')) throw Error('Complete content fingerprint required');
  return digest(JSON.stringify({products: [...inventory.products].sort((a,b)=>a.id-b.id), content:inventory.content.sha256}));
}
export function assertBaseline(live, state) {
  if (live.frontendSha !== state.frontendSha || live.routingSha256 !== state.routingSha256 || live.backendSha !== state.backendSha) throw Error('Production changed outside this automation; review and rebase required');
  if (live.frontendMismatches.length || live.backendMismatches.length) throw Error('Production file drift');
  if (live.rootRobotsExists) throw Error('Physical root robots.txt overrides the release');
  if (live.status !== 'deployed') throw Error('Production transaction is not deployed');
}
export function assertCatalogChange(previous, next) {
  for (const city of ['spb','nvk']) {
    const before = previous.products.filter(p=>p.city===city && p.sectionActive).length;
    const after = next.products.filter(p=>p.city===city && p.sectionActive).length;
    if (before && after < before * 0.98) throw Error(`More than 2% of ${city} active-section products disappeared; review required`);
  }
}
export function assertStableCatalog(before, after) {
  if (catalogFingerprint(before) !== catalogFingerprint(after)) {
    const error=Error('Bitrix changed while preparing the release; discard candidate and retry later');
    error.code='CATALOG_CHANGED'; throw error;
  }
}
export function candidateAction(run, expectedSha) {
  if (run.headSha !== expectedSha || run.event !== 'workflow_dispatch' || run.workflowName !== 'Prepare production candidate') throw Error('Untrusted candidate workflow');
  if (run.status !== 'completed') return 'wait';
  if (run.conclusion !== 'success') throw Error('Candidate validation failed; production unchanged');
  return 'deploy';
}
export function samePublishedContent(previous, next) {
  const normalized=m=>JSON.stringify({files:Object.entries(m.files).filter(([name])=>name!=='.release-sha').sort(([a],[b])=>a.localeCompare(b)),tools:Object.entries(m.templateFiles).sort(([a],[b])=>a.localeCompare(b)),backendSha:m.backendSha,backendFiles:Object.entries(m.backendFiles??{}).sort(([a],[b])=>a.localeCompare(b)),settings:m.settings,routeCount:m.routeCount});
  return normalized(previous)===normalized(next);
}
