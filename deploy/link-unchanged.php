<?php
// Неизменяемые файлы одинакового содержимого разделяют inode между релизами.
// Список для tar содержит только новые/изменённые файлы, с разделителем NUL.
if (PHP_SAPI!=='cli' || $argc!==4) exit(2);
[$script,$stage,$previous,$extractList]=$argv;
$relinkStaged=$extractList==='--relink-staged';
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
    // После потоковой распаковки заменяем только проверенный файл staging.
    // Старый inode никогда не открывается для записи или распаковки tar.
    if ($relinkStaged) {
        $staged=$stage.'/'.$path;
        if (!is_file($staged) || is_link($staged) || hash_file('sha256',$staged)!==$hash) throw new RuntimeException('Staged release drift during deduplication');
        if (!unlink($staged)) throw new RuntimeException('Cannot unlink staged duplicate');
    }
    $directory=dirname($stage.'/'.$path);
    if (!is_dir($directory) && !mkdir($directory,0755,true)) throw new RuntimeException('Cannot create stage directory');
    if (!link($previous.'/'.$path,$stage.'/'.$path)) throw new RuntimeException('Cannot link unchanged release file');
    $linked++;
}
if (!$relinkStaged && file_put_contents($extractList,$missing ? implode("\0",$missing)."\0" : '')===false) throw new RuntimeException('Cannot write extraction list');
echo "Linked $linked checksum-verified immutable files\n";
