import { spawn } from 'node:child_process';

// Один flock на аккаунт для всех машин. При паузе 1С сбор данных запрещён.
// PHP-код передаётся через -r, файлы приложения и настройки доступа не меняются.
export const leasePhp = String.raw`
$home='/home/t/tretya9f/wpoptik';
$lock=fopen($home.'/.o100-production-read.lock','c');
if(!$lock || !flock($lock, LOCK_EX|LOCK_NB)) {fwrite(STDERR,"Production reads already locked\n");exit(3);}
stream_set_blocking(STDIN,false);
$end=time()+28800;
while(!feof(STDIN) && time()<$end) {
 clearstatcache();
 if(is_file($home.'/.o100-1c-catalog-paused') || is_file($home.'/.o100-1c-diagnostic-permit.json')) {fwrite(STDERR,"1C pause or diagnostic blocks production reads\n");exit(4);}
 echo "LEASE_ALIVE\n";fflush(STDOUT);
 for($i=0;$i<5;$i++){if(feof(STDIN))exit(0);fread(STDIN,8192);sleep(1);}
}
exit(5);`;
const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";

export async function acquireProductionReadLease({ host, identity }) {
  if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+$/.test(host || '') || !identity) throw Error('Capture requires --host and --identity for the shared read lease');
  const child = spawn('ssh', ['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=10','-o','ServerAliveInterval=5','-o','ServerAliveCountMax=2','-i',identity,host,'/usr/local/bin/php8.1 -r ' + quote(leasePhp)], { windowsHide: true, stdio:['pipe','pipe','pipe'] });
  const abort = new AbortController(); let lastHeartbeat = 0, errorText = '', buffered = '';
  child.stderr.on('data', bytes => { errorText = (errorText + bytes.toString()).slice(-1000); });
  child.stdout.on('data', bytes => {
    buffered += bytes.toString();
    const lines = buffered.split('\n'); buffered = lines.pop();
    for (const line of lines) if (line === 'LEASE_ALIVE') lastHeartbeat = Date.now();
  });
  child.on('error', error => abort.abort(error));
  child.on('exit', () => abort.abort(Error('Production read lease ended: ' + errorText.trim())));
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
