<?php
// Короткий CLI-экспорт использует тот же lock, что и длительный сбор API-снимка.
if (PHP_SAPI !== 'cli') exit(2);
$o100ReadHome = '/home/t/tretya9f/wpoptik';
$o100ReadLock = fopen($o100ReadHome.'/.o100-production-read.lock', 'c');
if (!$o100ReadLock || !flock($o100ReadLock, LOCK_EX | LOCK_NB)) throw new RuntimeException('Production reads already locked');
if (is_file($o100ReadHome.'/.o100-1c-catalog-paused') || is_file($o100ReadHome.'/.o100-1c-diagnostic-permit.json')) throw new RuntimeException('1C pause or diagnostic blocks production reads');
// Дескриптор остаётся открытым до завершения всего экспортирующего PHP-процесса.
