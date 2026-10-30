import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';
import { validateInventory } from './seo-inventory.mjs';
import { digest, catalogFingerprint, assertBaseline, assertCatalogChange, assertStableCatalog, candidateAction } from './catalog-refresh-policy.mjs';

// Планировщик вызывает один короткий шаг; сборка продолжается в GitHub без SSH-ключа.
const args=process.argv.slice(2), configFile=args[args.indexOf('--config')+1];
if (!args.includes('--config')) throw Error('Usage: node scripts/run-catalog-refresh.mjs --config private-config.json [--execute]');
const config=JSON.parse(readFileSync(configFile,'utf8'));
const execute=args.includes('--execute');
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root='/home/t/tretya9f/wpoptik/public_html';
if (!/^[a-f0-9]{40}$/.test(config.sourceSha) || !/^[A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+$/.test(config.host)) throw Error('Invalid approved configuration');
const base=path.resolve(config.stateDirectory); mkdirSync(base,{recursive:true});
const stateFile=path.join(base,'state.json'), lock=path.join(base,'controller.lock');
const json=file=>JSON.parse(readFileSync(file,'utf8'));
const save=(file,data)=>{writeFileSync(file+'.tmp',JSON.stringify(data,null,2)+'\n');renameSync(file+'.tmp',file);};
const run=(command,argv,options={})=>execFileSync(command,argv,{encoding:'utf8',maxBuffer:64*1024*1024,timeout:600000,windowsHide:true,...options}).trim();
const git=(cwd,...argv)=>run('git',argv,{cwd});
const gh=(...argv)=>run('gh',argv);
const sshArgs=['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=15','-i',config.identity];
const ssh=(command,input)=>run('ssh',[...sshArgs,config.host,command],{input,timeout:900000});
let readOnlyRetries=0;
const readOnlySsh=input=>{
  for(let attempt=0;attempt<3;attempt++) {
    try {return ssh('php8.1',input);} catch(error) {
      if(attempt===2 || !/Connection reset|Connection timed out|Connection closed|ETIMEDOUT|Broken pipe/i.test(String(error.stderr||'')+' '+error.message)) throw error;
      readOnlyRetries++; console.error('Retrying interrupted read-only SSH check');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,1000*(attempt+1));
    }
  }
};
const exportInventory=()=>{
  const php=readFileSync(path.join(source,'scripts/catalog-content-fingerprint.php'),'utf8')+'\n'+readFileSync(path.join(source,'scripts/export-seo-inventory.php'),'utf8').replace(/^<\?php/,'');
  const inventory=validateInventory(JSON.parse(readOnlySsh(php)));
  if (catalogFingerprint(inventory)!==inventory.fingerprint) throw Error('Export fingerprint mismatch');
  return inventory;
};
const inspect=()=>JSON.parse(readOnlySsh(readFileSync(path.join(source,'scripts/catalog-refresh-state.php'),'utf8')));
let state=json(stateFile), result, acquired=false;
const retain=(live)=>{
  for(const record of state.history||[]) {
    if(record.pruned || record.sha===live.frontendSha || live.previousRelease.endsWith('/'+record.sha)) continue;
    if(!/^[a-f0-9]{40}$/.test(record.sha) || !/^[a-f0-9]{64}$/.test(record.manifestSha256||'')) throw Error('Retention record is incomplete');
    if(digest(readFileSync(record.archive))!==record.archiveSha256) throw Error('Local rollback archive is missing or corrupt');
    const php=readFileSync(path.join(source,'scripts/prune-catalog-release.php'),'utf8').replace('__TARGET_SHA__',record.sha).replace('__MANIFEST_SHA256__',record.manifestSha256);
    writeFileSync(path.join(record.directory,'retention.log'),ssh('php8.1',php));
    record.pruned=true; save(stateFile,state);
  }
};
try {
  try {writeFileSync(lock,JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}),{flag:'wx'});}
  catch(error) {
    if(error.code!=='EEXIST') throw error;
    const previous=json(lock); let alive=true;
    try {process.kill(previous.pid,0);} catch(error) {alive=error.code!=='ESRCH';}
    if(alive) throw Error('Another catalog controller is running');
    unlinkSync(lock); writeFileSync(lock,JSON.stringify({pid:process.pid}),{flag:'wx'});
  }
  acquired=true;
  if(git(source,'rev-parse','HEAD')!==config.sourceSha || git(source,'status','--porcelain','--untracked-files=no')) throw Error('Controller checkout differs from approved source');
  if(state.halted) {result={status:'halted',reason:state.lastError};}
  else if (!state.pending && Date.now()<Date.parse(state.nextCheckAt||0)) {result={status:'not_due',nextCheckAt:state.nextCheckAt};}
  else if (!state.pending) {
    const live=inspect(); assertBaseline(live,state);
    const inventory=exportInventory(), fingerprint=catalogFingerprint(inventory);
    const previous=JSON.parse(gunzipSync(readFileSync(state.inventoryPath)));
    assertCatalogChange(previous,inventory);
    const unchanged=fingerprint===state.catalogFingerprint && Date.now()-Date.parse(state.lastDeployedAt)<24*3600000;
    if (!execute) result={status:'checked',changed:!unchanged,activeProducts:inventory.products.length,fingerprint,liveFrontendSha:live.frontendSha};
    else if(unchanged) {
      state.nextCheckAt=new Date(Date.now()+config.intervalHours*3600000).toISOString(); save(stateFile,state);
      result={status:'unchanged',nextCheckAt:state.nextCheckAt};
    } else {
      const id=new Date().toISOString().replace(/[-:.TZ]/g,'');
      const directory=path.join(base,'runs',id), checkout=path.join(directory,'checkout'); mkdirSync(directory,{recursive:true});
      const branch='automation/catalog-refresh-'+id;
      save(path.join(directory,'baseline.json'),live);
      writeFileSync(path.join(directory,'inventory.json.gz'),gzipSync(JSON.stringify(inventory)+'\n'));
      git(source,'clone','--shared','--no-checkout',source,checkout);
      git(checkout,'remote','set-url','origin','https://github.com/'+config.repository+'.git');
      git(checkout,'fetch','origin',config.sourceSha);
      git(checkout,'checkout','-b',branch,config.sourceSha);
      writeFileSync(path.join(checkout,'deploy/seo-active-products.json.gz'),readFileSync(path.join(directory,'inventory.json.gz')));
      writeFileSync(path.join(checkout,'deploy/seo-previous-products.json.gz'),readFileSync(state.inventoryPath));
      writeFileSync(path.join(checkout,'deploy/seo-previous-routes.json.gz'),gzipSync(readFileSync(state.routesPath)));
      mkdirSync(path.join(checkout,'generated'),{recursive:true});
      run('node',['scripts/reconcile-canonical-redirects.mjs','--write'],{cwd:checkout});
      git(checkout,'add','deploy/seo-active-products.json.gz','deploy/seo-previous-products.json.gz','deploy/seo-previous-routes.json.gz','deploy/redirects.production.txt');
      git(checkout,'-c','user.name=Optika100 catalog automation','-c','user.email=catalog-automation@optika100.com','commit','--allow-empty','-m','Обновить снимок каталога Bitrix для проверенного выпуска');
      const sha=git(checkout,'rev-parse','HEAD');
      state.pending={directory,checkout,branch,sha,phase:'dispatch',startedAt:new Date().toISOString()}; save(stateFile,state);
      git(checkout,'push','origin',branch);
      gh('workflow','run','prepare-production.yml','--repo',config.repository,'--ref',branch,'-f','backend_sha='+live.backendSha,'-f','backend_manifest='+JSON.stringify(live.backendManifest),'-f','routing_sha256='+live.routingSha256);
      state.pending.phase='building'; save(stateFile,state);
      result={status:'build_started',sha,branch};
    }
  } else {
    const job=state.pending;
    if (!execute) result={status:'pending',...job};
    else {
      if(job.phase==='dispatch') throw Error('Interrupted workflow dispatch; inspect remote branch/runs before recovery');
      const runs=JSON.parse(gh('run','list','--repo',config.repository,'--branch',job.branch,'--workflow','prepare-production.yml','--limit','5','--json','databaseId,headSha,event,workflowName,status,conclusion,url'));
      if(runs.length!==1) throw Error('Expected exactly one candidate workflow');
      const ci=runs[0]; job.runId=ci.databaseId;
      if(candidateAction(ci,job.sha)==='wait') {save(stateFile,state);result={status:'building',runUrl:ci.url};}
      else {
        const candidate=path.join(job.directory,'candidate');
        if(!existsSync(candidate)) {mkdirSync(candidate);gh('run','download',String(ci.databaseId),'--repo',config.repository,'--name','production-candidate','--dir',candidate);}
        const archive=path.join(candidate,'production-release.tgz'), tools=path.join(candidate,'production-tools.tgz');
        for(const file of [archive,tools]) {
          const expected=readFileSync(file+'.sha256','utf8').split(/\s/)[0];
          if(digest(readFileSync(file))!==expected) throw Error('Candidate archive checksum mismatch');
        }
        const manifest=JSON.parse(run('tar',['-xOf',archive,'./release-manifest.json']));
        if(manifest.frontendSha!==job.sha || manifest.backendSha!==state.backendSha || manifest.routingBaseline!==state.routingSha256) throw Error('Candidate does not match approved baseline');
        const log=readFileSync(path.join(candidate,'apache-production.log'),'utf8');
        if(!log.includes(`PASS: Apache served all ${manifest.routeCount} manifest routes byte-for-byte;`)) throw Error('Full Apache validation missing');
        const inventory=JSON.parse(gunzipSync(readFileSync(path.join(job.directory,'inventory.json.gz'))));
        if(manifest.catalogFingerprint!==catalogFingerprint(inventory)) throw Error('Candidate inventory mismatch');
        let live=inspect();
        if(job.phase==='deploying' && live.frontendSha===job.sha && live.status==='deployed') {
          if(live.frontendMismatches.length || live.backendMismatches.length || live.rootRobotsExists) throw Error('Recovered deployment failed integrity check');
        } else {
          if(job.phase==='deploying') throw Error('Interrupted or rolled-back deployment; operator review required');
          assertBaseline(live,state);
          assertStableCatalog(inventory,exportInventory());
          retain(live);
          const remote='/home/t/tretya9f/o100-upload-'+job.sha;
          ssh(`mkdir -p '${remote}'`);
          run('scp',[...sshArgs,archive,tools,config.host+':'+remote+'/'],{timeout:900000});
          assertBaseline(inspect(),state);
          assertStableCatalog(inventory,exportInventory());
          const archiveHash=digest(readFileSync(archive)), toolsHash=digest(readFileSync(tools));
          job.phase='deploying'; save(stateFile,state);
          const command=`set -eu; cd '${remote}'; test "$(sha256sum production-release.tgz | cut -d' ' -f1)" = '${archiveHash}'; test "$(sha256sum production-tools.tgz | cut -d' ' -f1)" = '${toolsHash}'; tar -xzf production-tools.tgz; O100_EXPECTED_FRONTEND=${state.frontendSha} O100_ACCEPTANCE_SCRIPT='${remote}/deploy/accept-catalog-release.php' O100_SMOKE_ORIGIN=https://optika100.com bash deploy/release.sh deploy '${root}' '${job.sha}' '${state.routingSha256}' production-release.tgz`;
          try {writeFileSync(path.join(job.directory,'deployment.log'),ssh(command));}
          catch(error) {writeFileSync(path.join(job.directory,'deployment-failure.log'),String(error.stdout||'')+'\n'+String(error.stderr||'')); throw error;}
          live=inspect();
          if(live.frontendSha!==job.sha || live.status!=='deployed' || live.frontendMismatches.length || live.backendMismatches.length) {
            if(live.frontendSha===job.sha) ssh(`O100_EXPECTED_FRONTEND=${job.sha} O100_SMOKE_ORIGIN=https://optika100.com bash '${remote}/deploy/release.sh' rollback '${root}'`);
            throw Error('Deployment verification failed; rollback requested if candidate was still active');
          }
        }
        save(path.join(job.directory,'production-audit.json'),live);
        const record={sha:job.sha,archive,archiveSha256:digest(readFileSync(archive)),manifestSha256:digest(execFileSync('tar',['-xOf',archive,'./release-manifest.json'],{maxBuffer:64*1024*1024})),directory:job.directory,runUrl:ci.url,deployedAt:new Date().toISOString()};
        state.history=[...(state.history||[]),record];
        Object.assign(state,{frontendSha:job.sha,routingSha256:live.routingSha256,catalogFingerprint:catalogFingerprint(inventory),inventoryPath:path.join(job.directory,'inventory.json.gz'),routesPath:path.join(candidate,'generated/production-routes.json'),lastDeployedAt:record.deployedAt,nextCheckAt:new Date(Date.now()+config.intervalHours*3600000).toISOString(),pending:null});
        save(stateFile,state);
        save(path.join(job.directory,'receipt.json'),{status:'deployed_and_verified',...record,routingSha256:live.routingSha256,backendSha:live.backendSha,fileCount:live.fileCount,catalogFingerprint:state.catalogFingerprint});
        // Удаляем только избыточный upload; проверенный локальный архив сохранён.
        ssh(`test "$(cat '${root}/o100_frontend_current/.release-sha')" = '${job.sha}' && rm -f '/home/t/tretya9f/o100-upload-${job.sha}/production-release.tgz'`);
        retain(live);
        result={status:'deployed',sha:job.sha,runUrl:ci.url,receipt:path.join(job.directory,'receipt.json')};
      }
    }
  }
} catch(error) {
  if(execute && acquired) {state.halted=true; state.lastError=error.message; save(stateFile,state);}
  result={status:'failed',error:error.message,productionAutomaticallyRetried:false}; process.exitCode=1;
} finally {
  if(existsSync(lock) && json(lock).pid===process.pid) unlinkSync(lock);
}
save(path.join(base,'last-result.json'),{...result,readOnlyRetries,checkedAt:new Date().toISOString()});
console.log(JSON.stringify(result,null,2));
