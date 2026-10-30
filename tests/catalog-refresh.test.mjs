import test from 'node:test';
import assert from 'node:assert/strict';
import { catalogFingerprint, assertBaseline, assertCatalogChange, assertStableCatalog, candidateAction, samePublishedContent } from '../scripts/catalog-refresh-policy.mjs';
const snapshot = () => ({generatedAt:'2026-10-30T00:00:00Z',content:{sha256:'a'.repeat(64)},products:[{id:1,city:'spb',sectionActive:true,canonicalPath:'/catalog_s/opravy/a/'},{id:2,city:'nvk',sectionActive:true,canonicalPath:'/catalog_n/opravy/a/'}]});
test('content edits trigger refresh even with identical URLs; generation time does not',()=>{
  const a=snapshot(), b=snapshot(); b.generatedAt='2026-10-31T00:00:00Z'; b.products.reverse();
  assert.equal(catalogFingerprint(a),catalogFingerprint(b));
  b.content.sha256='b'.repeat(64); assert.notEqual(catalogFingerprint(a),catalogFingerprint(b));
  assert.throws(()=>assertStableCatalog(a,b),{code:'CATALOG_CHANGED'});
  assert.throws(()=>catalogFingerprint({products:[]}),/fingerprint/);
});
test('unchanged rebuild skips deployment but content or deployment changes never do',()=>{
  const a={files:{'index.html':'a','robots.txt':'b','.release-sha':'old'},templateFiles:{'deploy/release.sh':'c'},backendSha:'d',settings:{fixtures:false},routeCount:2};
  const b=structuredClone(a); b.files['.release-sha']='new';
  assert.equal(samePublishedContent(a,b),true);
  for(const change of [m=>m.files['robots.txt']='blocked',m=>m.files['index.html']='new price',m=>delete m.files['index.html'],m=>m.templateFiles['deploy/release.sh']='new gate',m=>m.backendSha='new']) {const changed=structuredClone(b);change(changed);assert.equal(samePublishedContent(a,changed),false);}
});
test('catalog shrink guard applies to each city and section visibility',()=>{
  const a=snapshot(),b=snapshot(); b.products[0].sectionActive=false;
  assert.throws(()=>assertCatalogChange(a,b),/2%/);
  assertCatalogChange(a,a);
});
test('production drift and shadowing robots prevent autonomous deployment',()=>{
  const state={frontendSha:'a',backendSha:'b',routingSha256:'c'};
  const live={...state,frontendMismatches:[],backendMismatches:[],rootRobotsExists:false,status:'deployed'};
  assertBaseline(live,state);
  for(const patch of [{frontendSha:'new'},{backendSha:'new'},{routingSha256:'new'},{rootRobotsExists:true},{frontendMismatches:['index.html']},{backendMismatches:['api/store/product.php']},{status:'automatically-restored'}]) assert.throws(()=>assertBaseline({...live,...patch},state));
});
test('only successful full workflow at the exact candidate SHA can deploy',()=>{
  const run={headSha:'a',event:'workflow_dispatch',workflowName:'Prepare production candidate',status:'in_progress'};
  assert.equal(candidateAction(run,'a'),'wait');
  assert.equal(candidateAction({...run,status:'completed',conclusion:'success'},'a'),'deploy');
  for(const patch of [{headSha:'b'},{event:'pull_request'},{workflowName:'Quality'},{status:'completed',conclusion:'failure'},{status:'completed',conclusion:'cancelled'}]) assert.throws(()=>candidateAction({...run,...patch},'a'));
});
