<?php
// Выполняется под release lock до отключения автоматического отката.
if (PHP_SAPI !== 'cli' || $argc !== 4) exit(2);
[$script,$root,$release,$origin]=$argv;
$manifest=json_decode(file_get_contents($release.'/release-manifest.json'),true,512,JSON_THROW_ON_ERROR);
$request=function(string $path) use ($origin): array {
    $curl=curl_init($origin.str_replace(' ', '%20', $path));
    curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_TIMEOUT=>30,CURLOPT_ENCODING=>'']);
    $body=curl_exec($curl); $status=curl_getinfo($curl,CURLINFO_HTTP_CODE);
    if ($body===false) throw new RuntimeException('Public request failed: '.$path);
    curl_close($curl); return [$status,$body];
};
foreach ($manifest['files'] as $path=>$hash) {
    if (hash_file('sha256',$release.'/'.$path)!==$hash) throw new RuntimeException('Release file drift: '.$path);
}
foreach ($manifest['backendFiles'] as $path=>$hash) {
    if (hash_file('sha256',$root.'/'.$path)!==$hash) throw new RuntimeException('Backend drift: '.$path);
}
$paths=$manifest['acceptancePaths']??[];
if (count($paths)<4) throw new RuntimeException('Acceptance paths missing');
foreach ($paths as $path) {
    [$status,$body]=$request($path);
    $file=$path==='/'?'index.html':ltrim($path,'/').'index.html';
    if ($status!==200 || hash('sha256',$body)!==($manifest['files'][$file]??'')) throw new RuntimeException('Public HTML mismatch: '.$path);
}
foreach ($manifest['retiredPaths']??[] as $path) {
    [$status,$body]=$request($path);
    if ($status!==404) throw new RuntimeException('Retired URL does not return 404: '.$path);
}
// Контроль источника после HTTP-проверок исключает публикацию устаревшего снимка.
if (!empty($manifest['catalogFingerprint'])) {
    ob_start();
    require __DIR__.'/catalog-export.php';
    $inventory=json_decode(ob_get_clean(),true,512,JSON_THROW_ON_ERROR);
    if (!hash_equals($manifest['catalogFingerprint'],$inventory['fingerprint']??'')) throw new RuntimeException('Catalog changed before acceptance');
}
echo json_encode(['passed'=>true,'frontendSha'=>$manifest['frontendSha'],'checkedFiles'=>count($manifest['files']),
    'htmlPages'=>count($paths),'retiredUrls'=>count($manifest['retiredPaths']??[]),'checkedAt'=>gmdate('c')],JSON_THROW_ON_ERROR),"\n";
