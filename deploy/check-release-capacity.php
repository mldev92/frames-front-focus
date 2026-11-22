<?php
// Учитываем квоту аккаунта Beget и свободное место файловой системы.
declare(strict_types=1);
if ($argc !== 5) exit(2);
[, $root, $requiredBytes, $requiredFiles, $accountBytes] = $argv;
foreach ([$requiredBytes, $requiredFiles, $accountBytes] as $number) {
    if (!ctype_digit($number) || (string)(int)$number !== $number) exit(2);
}
$available = ['bytes' => (int)$accountBytes, 'files' => PHP_INT_MAX];
// df ограничивает только свободные inode файловой системы; квоту файлов аккаунта проверяет сама запись.
foreach ([$root, sys_get_temp_dir(), getenv('HOME') ?: $root] as $dir) {
    $free = disk_free_space($dir);
    if ($free === false) exit(3);
    $available['bytes'] = min($available['bytes'], (int)$free);
    exec('LC_ALL=C df -Pi -- ' . escapeshellarg($dir), $rows, $status);
    $values = preg_split('/\s+/', trim(end($rows)));
    if ($status !== 0 || !ctype_digit($values[3] ?? '')) exit(3);
    $available['files'] = min($available['files'], (int)$values[3]);
    unset($rows);
}
$ok = true;
foreach (['bytes' => (int)$requiredBytes, 'files' => (int)$requiredFiles] as $unit => $needed) {
    $short = max(0, $needed - $available[$unit]);
    printf("%s required=%d available=%d shortfall=%d\n", $unit, $needed, $available[$unit], $short);
    $ok = $ok && $short === 0;
}
exit($ok ? 0 : 3);
