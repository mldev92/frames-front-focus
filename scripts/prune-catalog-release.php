<?php
// Только заранее сохранённый и проверенный релиз; текущий и предыдущий защищены lock.
if (PHP_SAPI!=='cli') exit(2);
$sha='__TARGET_SHA__'; $expectedManifest='__MANIFEST_SHA256__';
if (!preg_match('/^[a-f0-9]{40}$/D',$sha) || !preg_match('/^[a-f0-9]{64}$/D',$expectedManifest)) throw new RuntimeException('Invalid retention receipt');
$root='/home/t/tretya9f/wpoptik/public_html'; $state=dirname($root).'/.o100-deploy';
$lock=fopen($state.'/lock','c'); if (!flock($lock,LOCK_EX|LOCK_NB)) throw new RuntimeException('Deployment in progress');
$target=$root.'/o100_frontend_releases/'.$sha;
$active=realpath($root.'/o100_frontend_current');
$transaction=trim(file_get_contents($state.'/active-transaction'));
if (!str_starts_with($transaction,$state.'/transactions/')) throw new RuntimeException('Invalid transaction');
$previous=trim(file_get_contents($transaction.'/previous'));
if ($target===$active || $target===$previous) throw new RuntimeException('Retention protects live and previous release');
if (!file_exists($target)) {echo "Already absent\n"; exit;}
if (is_link($target) || realpath($target)!==$target || trim(file_get_contents($target.'/.release-sha'))!==$sha) throw new RuntimeException('Unsafe retention path');
if (hash_file('sha256',$target.'/release-manifest.json')!==$expectedManifest) throw new RuntimeException('Archived manifest mismatch');
$manifest=json_decode(file_get_contents($target.'/release-manifest.json'),true,512,JSON_THROW_ON_ERROR);
foreach ($manifest['files'] as $path=>$hash) if (hash_file('sha256',$target.'/'.$path)!==$hash) throw new RuntimeException('Release changed before retention');
$walk=new RecursiveIteratorIterator(new RecursiveDirectoryIterator($target,FilesystemIterator::SKIP_DOTS),RecursiveIteratorIterator::CHILD_FIRST);
foreach($walk as $file) if ($file->isLink() || !str_starts_with($file->getRealPath(),$target.'/')) throw new RuntimeException('Unsafe release entry');
foreach($walk as $file) {if ($file->isDir()) rmdir($file->getPathname()); else unlink($file->getPathname());}
rmdir($target);
echo "Removed archived inactive release $sha\n";
