<?php
// Неизменяемые файлы одинакового содержимого разделяют inode между релизами.
// Список для tar содержит только новые/изменённые файлы, с разделителем NUL.
if (PHP_SAPI!=='cli' || $argc!==4) exit(2);
[$script,$stage,$previous,$extractList]=$argv;
$next=json_decode(file_get_contents($stage.'/release-manifest.json'),true,512,JSON_THROW_ON_ERROR);
$old=is_file($previous.'/release-manifest.json') ? json_decode(file_get_contents($previous.'/release-manifest.json'),true,512,JSON_THROW_ON_ERROR) : ['files'=>[]];
$linked=0;
$missing=[];
foreach ($next['files'] as $path=>$hash) {
    if ($path==='' || $path==='release-manifest.json' || str_contains($path,"\0") || str_contains($path,'..') || str_starts_with($path,'/') || !preg_match('/^[a-f0-9]{64}$/D',$hash)) throw new RuntimeException('Unsafe manifest path');
    if (($old['files'][$path]??'')!==$hash || !is_file($previous.'/'.$path) || is_link($previous.'/'.$path)) {
        $missing[]='./'.$path; continue;
    }
    if (hash_file('sha256',$previous.'/'.$path)!==$hash) throw new RuntimeException('Previous release drift during deduplication');
    $directory=dirname($stage.'/'.$path);
    if (!is_dir($directory) && !mkdir($directory,0755,true)) throw new RuntimeException('Cannot create stage directory');
    if (!link($previous.'/'.$path,$stage.'/'.$path)) throw new RuntimeException('Cannot link unchanged release file');
    $linked++;
}
if (file_put_contents($extractList,$missing ? implode("\0",$missing)."\0" : '')===false) throw new RuntimeException('Cannot write extraction list');
echo "Linked $linked checksum-verified immutable files\n";
