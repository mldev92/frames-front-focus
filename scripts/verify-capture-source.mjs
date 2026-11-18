import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { validateInventory } from './seo-inventory.mjs';
import { catalogFingerprint } from './catalog-refresh-policy.mjs';

// Проверка источника до и после сбора: изменение каталога не запечатывается в снимок.
export async function captureVerificationPhp(binding) {
  if (!/^[a-f0-9]{40}$/.test(binding.backendSha) || !/^[a-f0-9]{64}$/.test(binding.routingSha256)) throw Error('Invalid capture source arguments');
  const check = `<?php ini_set('display_errors','0'); $h='/home/t/tretya9f/wpoptik'; $m=json_decode(file_get_contents($h.'/.o100-backend-release.json'),true); if(($m['sha']??'')!==${JSON.stringify(binding.backendSha)} || hash_file('sha256',$h.'/public_html/.htaccess')!==${JSON.stringify(binding.routingSha256)} || empty($m['files'])) exit(3); foreach($m['files'] as $p=>$v) { $expected=is_array($v)?($v['sha256']??null):$v; if(!is_string($expected) || hash_file('sha256',$h.'/public_html/'.$p)!==$expected)exit(3); }`;
  return check + '\n' + (await readFile(new URL('./catalog-content-fingerprint.php',import.meta.url),'utf8')).replace(/^<\?php/,'') + '\n' + (await readFile(new URL('./export-seo-inventory.php',import.meta.url),'utf8')).replace(/^<\?php/,'');
}

export async function verifyCaptureSource({host,identity,binding,signal}) {
  if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+$/.test(host || '') || !identity) throw Error('Invalid capture source arguments');
  const php = await captureVerificationPhp(binding);
  const bytes = await new Promise((resolve,reject)=>{
    const child = spawn('ssh',['-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=10','-i',identity,host,'/usr/local/bin/php8.1'],{windowsHide:true,signal:AbortSignal.any([signal,AbortSignal.timeout(120000)])});
    let size=0;const chunks=[];
    child.stdout.on('data',chunk=>{size+=chunk.length;if(size>32*1024*1024){child.kill();reject(Error('Inventory exceeds capture budget'));}else chunks.push(chunk);});
    // Сырые PHP/SQL ошибки не выводятся: в диагностике достаточно кода завершения.
    child.stderr.resume();child.once('error',reject);child.stdin.on('error',reject);
    child.once('exit',code=>code===0?resolve(Buffer.concat(chunks)):reject(Error('Capture source verification failed: '+code)));
    child.stdin.end(php);
  });
  const live = validateInventory(JSON.parse(bytes.toString('utf8')));
  if (catalogFingerprint(live) !== binding.catalogFingerprint) throw Error('Catalog changed; capture cannot be sealed or resumed against this inventory');
}
