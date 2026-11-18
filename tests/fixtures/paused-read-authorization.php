<?php
require $argv[2];
$home=str_replace('\\','/',$argv[1]);mkdir($home.'/public_html/bitrix/admin',0700,true);
foreach(['.o100-1c-catalog-paused','.o100-backend-release.json','public_html/.htaccess','public_html/bitrix/admin/1c_exchange.php'] as $f)file_put_contents($home.'/'.$f,'baseline');
$sha=str_repeat('a',40);$a=['version'=>1,'purpose'=>'runtime-fix-snapshot','source_sha'=>$sha,'operations'=>['inventory','capture'],'issued_at'=>time()-1,'expires_at'=>time()+60];
foreach(['pause_sha256'=>'.o100-1c-catalog-paused','backend_manifest_sha256'=>'.o100-backend-release.json','routing_sha256'=>'public_html/.htaccess','guard_sha256'=>'public_html/bitrix/admin/1c_exchange.php'] as $k=>$f)$a[$k]=hash_file('sha256',$home.'/'.$f);
function deny(callable $fn):void {try{$fn();}catch(Throwable $e){return;}throw new RuntimeException('Unsafe read accepted');}
function approval(array $a):string {global $home;$f=$home.'/.o100-paused-read-approval.json';file_put_contents($f,json_encode($a));clearstatcache();return hash_file('sha256',$f);}
$hash=approval($a);if(o100_read_authorization($home,$hash,$sha,'capture')!==$a)throw new RuntimeException('Valid scope rejected');
deny(fn()=>o100_read_authorization($home,'',$sha,'capture'));
deny(fn()=>o100_read_authorization($home,$hash,str_repeat('b',40),'capture'));
deny(fn()=>o100_read_authorization($home,$hash,$sha,'unapproved'));
foreach([['expires_at'=>time()-1],['issued_at'=>time()+10],['expires_at'=>time()+30000]] as $change){$bad=approval(array_replace($a,$change));deny(fn()=>o100_read_authorization($home,$bad,$sha,'capture'));}
$hash=approval($a);file_put_contents($home.'/.o100-paused-read-approval.json','tampered');deny(fn()=>o100_read_authorization($home,$hash,$sha,'capture'));
$hash=approval($a);
foreach(['.o100-1c-diagnostic-permit.json','.o100-1c-diagnostic-state.json'] as $f){file_put_contents($home.'/'.$f,'{}');deny(fn()=>o100_read_authorization($home,$hash,$sha,'capture'));unlink($home.'/'.$f);}
foreach(['.o100-1c-catalog-paused','.o100-backend-release.json','public_html/.htaccess','public_html/bitrix/admin/1c_exchange.php'] as $f){file_put_contents($home.'/'.$f,'changed');deny(fn()=>o100_read_authorization($home,$hash,$sha,'capture'));file_put_contents($home.'/'.$f,'baseline');}
unlink($home.'/.o100-1c-catalog-paused');deny(fn()=>o100_read_authorization($home,$hash,$sha,'capture'));
if(o100_read_authorization($home,'','','inventory')!==null)throw new RuntimeException('Normal unpaused read rejected');
$s=['Threads_connected'=>70,'Threads_running'=>2,'max_connections'=>320,'max_user_connections'=>50,'account_connections'=>1,'account_active'=>0,'Connection_errors_max_connections'=>10,'Uptime'=>1000];
o100_check_capture_pressure($s,null);o100_check_capture_pressure($s,$s);
foreach([['Threads_connected'=>256],['Threads_running'=>40],['account_connections'=>10],['account_active'=>5],['Connection_errors_max_connections'=>11],['Uptime'=>999],['max_connections'=>321]] as $change)deny(fn()=>o100_check_capture_pressure(array_replace($s,$change),$s));
echo "PASS: paused read authorization and pressure boundaries\n";
