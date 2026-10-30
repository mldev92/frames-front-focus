<?php
// Проверка без вывода конфигурации и секретов; только хеши и публичные пути.
if (PHP_SAPI !== 'cli') exit(2);
$root='/home/t/tretya9f/wpoptik/public_html';
$state=dirname($root).'/.o100-deploy';
$m=json_decode(file_get_contents($root.'/o100_frontend_current/release-manifest.json'),true,512,JSON_THROW_ON_ERROR);
$backendManifest=$approvedBackend??['sha'=>$m['backendSha'],'files'=>$m['backendFiles']];
if (!preg_match('/^[a-f0-9]{40}$/D',$backendManifest['sha']) || empty($backendManifest['files'])) throw new RuntimeException('Invalid approved backend manifest');
$frontend=[]; $backend=[];
foreach ($m['files'] as $path=>$hash) if (!is_file($root.'/o100_frontend_current/'.$path) || hash_file('sha256',$root.'/o100_frontend_current/'.$path)!==$hash) $frontend[]=$path;
foreach ($backendManifest['files'] as $path=>$hash) {
    if (!str_starts_with($path,'api/store/') || str_contains($path,'..') || !preg_match('/^[a-f0-9]{64}$/D',$hash)) throw new RuntimeException('Unsafe backend manifest path');
    if (!is_file($root.'/'.$path) || hash_file('sha256',$root.'/'.$path)!==$hash) $backend[]=$path;
}
$transaction=trim(file_get_contents($state.'/active-transaction'));
if (!str_starts_with($transaction,$state.'/transactions/')) throw new RuntimeException('Invalid transaction');
echo json_encode(['checkedAt'=>gmdate('c'),'frontendSha'=>$m['frontendSha'],'backendSha'=>$backendManifest['sha'],
    'backendManifest'=>$backendManifest,
    'frontendMismatches'=>$frontend,'backendMismatches'=>$backend,'fileCount'=>count($m['files']),
    'routingSha256'=>hash_file('sha256',$root.'/.htaccess'), 'rootRobotsExists'=>file_exists($root.'/robots.txt'),
    'status'=>trim(file_get_contents($transaction.'/status')), 'transaction'=>$transaction,
    'previousRelease'=>trim(file_get_contents($transaction.'/previous'))], JSON_THROW_ON_ERROR|JSON_UNESCAPED_SLASHES), "\n";
