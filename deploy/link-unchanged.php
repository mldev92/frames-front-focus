<?php
// Неизменяемые файлы одинакового содержимого разделяют inode между релизами.
// tar --skip-old-files не перезаписывает ссылки; изменённые файлы создаются отдельно.
if (PHP_SAPI!=='cli' || $argc!==3) exit(2);
[$script,$stage,$previous]=$argv;
if (!is_dir($previous) || !is_file($previous.'/release-manifest.json')) exit;
$next=json_decode(file_get_contents($stage.'/release-manifest.json'),true,512,JSON_THROW_ON_ERROR);
$old=json_decode(file_get_contents($previous.'/release-manifest.json'),true,512,JSON_THROW_ON_ERROR);
$linked=0;
foreach ($next['files'] as $path=>$hash) {
    if (str_contains($path,'..') || str_starts_with($path,'/') || !preg_match('/^[a-f0-9]{64}$/D',$hash)) throw new RuntimeException('Unsafe manifest path');
    if (($old['files'][$path]??'')!==$hash || !is_file($previous.'/'.$path) || is_link($previous.'/'.$path)) continue;
    if (hash_file('sha256',$previous.'/'.$path)!==$hash) throw new RuntimeException('Previous release drift during deduplication');
    $directory=dirname($stage.'/'.$path);
    if (!is_dir($directory) && !mkdir($directory,0755,true)) throw new RuntimeException('Cannot create stage directory');
    if (!link($previous.'/'.$path,$stage.'/'.$path)) throw new RuntimeException('Cannot link unchanged release file');
    $linked++;
}
echo "Linked $linked checksum-verified immutable files\n";
