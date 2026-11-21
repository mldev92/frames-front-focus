import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Один flock на аккаунт для всех машин. Исключение требует отдельного
// согласованного отпечатка, неизменного guard и обязательной паузы 1С.
// PHP-код передаётся через -r, файлы приложения и настройки доступа не меняются.
const authorizationPhp = readFileSync(new URL('./paused-read-authorization.php',import.meta.url),'utf8').replace(/^<\?php/,'');
export function leasePhpFor({approvalSha256='',sourceSha=''} = {}) {
 if (approvalSha256 && (!/^[a-f0-9]{64}$/.test(approvalSha256) || !/^[a-f0-9]{40}$/.test(sourceSha))) throw Error('Invalid paused read approval');
 return authorizationPhp + `\n$approvalHash='${approvalSha256}';$sourceSha='${sourceSha}';\n` + String.raw`
$home='/home/t/tretya9f/wpoptik';
$lock=fopen($home.'/.o100-production-read.lock','c');
if(!$lock || !flock($lock, LOCK_EX|LOCK_NB)) {fwrite(STDERR,"Production reads already locked\n");exit(3);}
stream_set_blocking(STDIN,false);
$end=time()+28800;$lastPressure=0;$baseline=null;$deploymentLock=null;
while(!feof(STDIN) && time()<$end) {
 clearstatcache();
 try {
  $approval=o100_read_authorization($home,$approvalHash,$sourceSha,'capture');
  if($approval && !$deploymentLock) {
   $deploymentLock=fopen($home.'/.o100-deploy/lock','c');
   if(!$deploymentLock || !flock($deploymentLock,LOCK_EX|LOCK_NB)) throw new RuntimeException('Deployment blocks capture');
  }
  if($approval && time()-$lastPressure>=15) {
   $sample=o100_capture_pressure($home,$baseline);$baseline??=$sample;$lastPressure=time();
   echo 'READ_PRESSURE '.json_encode($sample)."\n";fflush(STDOUT);
  }
 } catch(Throwable $e) {fwrite(STDERR,$e->getMessage()."\n");exit(4);}
 echo "LEASE_ALIVE\n";fflush(STDOUT);
 for($i=0;$i<5;$i++){if(feof(STDIN))exit(0);fread(STDIN,8192);sleep(1);}
}
exit(5);`;
}
export const leasePhp = leasePhpFor();
const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";

export async function acquireProductionReadLease({ host, identity, approvalSha256, sourceSha }) {
  if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+$/.test(host || '') || !identity) throw Error('Capture requires --host and --identity for the shared read lease');
  const child = spawn('ssh', ['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=10','-o','ServerAliveInterval=5','-o','ServerAliveCountMax=2','-i',identity,host,'/usr/local/bin/php8.1 -r ' + quote(leasePhpFor({approvalSha256,sourceSha}))], { windowsHide: true, stdio:['pipe','pipe','pipe'] });
  const abort = new AbortController(); let lastHeartbeat = 0, errorText = '', buffered = '';
  child.stderr.on('data', bytes => { errorText = (errorText + bytes.toString()).slice(-1000); });
  child.stdout.on('data', bytes => {
    buffered += bytes.toString();
    const lines = buffered.split('\n'); buffered = lines.pop();
    for (const line of lines) {
      if (line === 'LEASE_ALIVE') lastHeartbeat = Date.now();
      else if (line.startsWith('READ_PRESSURE ')) console.log(line);
    }
  });
  child.on('error', error => abort.abort(error));
  child.on('exit', (code, signal) => abort.abort(Error(`Production read lease ended (${signal ?? `exit ${code}`}): ${errorText.trim()}`)));
  child.stdin.on('error', error => abort.abort(error));
  const check = setInterval(() => {
    if (lastHeartbeat && Date.now() - lastHeartbeat > 12000) abort.abort(Error('Production read lease heartbeat expired'));
    if (!abort.signal.aborted) child.stdin.write('\n');
  }, 1000);
  const close = () => { clearInterval(check); child.stdin.end(); child.kill(); };
  try {
    const deadline = Date.now() + 15000;
    while (!lastHeartbeat) {
      if (abort.signal.aborted) throw abort.signal.reason;
      if (Date.now() > deadline) throw Error('Production read lease did not start');
      await new Promise(resolve => setTimeout(resolve,50));
    }
  } catch (error) { close(); throw error; }
  return {
    signal: abort.signal,
    assertAlive() {
      if (abort.signal.aborted) throw abort.signal.reason;
      if (!lastHeartbeat || Date.now() - lastHeartbeat > 12000) throw Error('Production read lease is not fresh');
    },
    close,
  };
}
