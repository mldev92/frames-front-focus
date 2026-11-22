<?php
// Учитываем квоту аккаунта Beget и свободное место файловой системы.
declare(strict_types=1);
if ($argc !== 4) exit(2);
[, $root, $requiredBytes, $requiredFiles] = $argv;
if (!ctype_digit($requiredBytes) || !ctype_digit($requiredFiles)) exit(2);
$path = dirname($root) . '/.o100-deploy/account-capacity.json';
$reading = is_file($path) ? json_decode(file_get_contents($path), true) : null;
if (!is_array($reading) || !is_int($reading['measuredAt'] ?? null)
    || abs(time() - $reading['measuredAt']) > 300) {
    fwrite(STDERR, "Fresh Beget account quota reading required. Need $requiredBytes bytes and $requiredFiles files.\n");
    exit(3);
}
$available = [];
foreach (['bytes', 'files'] as $unit) {
    if (!is_int($reading[$unit] ?? null) || $reading[$unit] < 0) exit(3);
    $available[$unit] = $reading[$unit];
}
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
