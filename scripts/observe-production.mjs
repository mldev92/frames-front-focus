import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
const approved=JSON.parse(readFileSync(new URL('./production-observation-approved.json',import.meta.url)));
const preflight=process.argv.includes('--preflight'),minutes=preflight?0:60;
const started=Date.now(),end=started+minutes*60000,checks=[];
const digest=b=>createHash('sha256').update(b).digest('hex');
async function check(item){
 const attempts=[];
 for(let attempt=0;attempt<2;attempt++){
  const start=Date.now();
  try{
   const r=await fetch('https://optika100.com'+item.path,{redirect:'manual',signal:AbortSignal.timeout(20000)});
   const body=Buffer.from(await r.arrayBuffer()),mime=r.headers.get('content-type')??'';
   let ok=r.status===item.status;const detail={};
   if(item.sha256){detail.artifactMatch=digest(body)===item.sha256;ok&&=detail.artifactMatch;}
   if(item.kind==='products'){
    const data=JSON.parse(body);detail.items=data.products?.length??0;
    ok&&=Array.isArray(data.products)&&data.products.length>0&&data.total>0&&data.products.every(p=>Number.isFinite(p.price)&&p.price>0);
   }
   if(item.kind==='lens'){const data=JSON.parse(body);detail.matches=data.matches?.length??0;ok&&=detail.matches>0;}
   if(item.kind==='image'){detail.mime=mime;ok&&=mime.startsWith('image/');}
   const result={status:r.status,ok,bytes:body.length,seconds:(Date.now()-start)/1000,...detail};attempts.push(result);
   if(ok)return {path:item.path,...result,attempts};
  }catch(error){attempts.push({ok:false,error:error.message,seconds:(Date.now()-start)/1000});}
  if(attempt===0)await delay(1000);
 }
 return {path:item.path,...attempts.at(-1),attempts};
}
do{
 const time=new Date().toISOString(),http=[];let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<approved.targets.length){const item=approved.targets[cursor++];http.push(await check(item));}}));
 const row={time,http,ok:http.every(x=>x.ok)};checks.push(row);
 const report={frontendSha:approved.frontendSha,requestedMinutes:minutes,location:'github-actions',startedAt:new Date(started).toISOString(),checks,completed:false};
 writeFileSync('production-observation.json',JSON.stringify(report,null,2));
 if(!row.ok||checks.length===1||checks.length%5===0)console.log(JSON.stringify({time,cycles:checks.length,ok:row.ok,failures:http.filter(x=>!x.ok),resolvedRetries:http.filter(x=>x.attempts.length>1)}));
 if(Date.now()>=end)break;await delay(Math.min(55000,end-Date.now()));
}while(true);
const report={frontendSha:approved.frontendSha,requestedMinutes:minutes,location:'github-actions',startedAt:new Date(started).toISOString(),checks,completed:true,completedAt:new Date().toISOString(),durationSeconds:(Date.now()-started)/1000,passed:checks.every(x=>x.ok),runUrl:process.env.GITHUB_RUN_ID?`https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`:null};
writeFileSync('production-observation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({completed:true,passed:report.passed,cycles:checks.length,durationSeconds:report.durationSeconds}));
if(!report.passed)process.exitCode=1;
