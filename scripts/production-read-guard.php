<?php
// Короткий CLI-экспорт использует тот же lock, что и длительный сбор API-снимка.
if (PHP_SAPI !== 'cli') exit(2);
$o100ReadHome = '/home/t/tretya9f/wpoptik';
$o100ReadLock = fopen($o100ReadHome.'/.o100-production-read.lock', 'c');
if (!$o100ReadLock || !flock($o100ReadLock, LOCK_EX | LOCK_NB)) throw new RuntimeException('Production reads already locked');
$o100ReadApproval = o100_read_authorization($o100ReadHome, $o100ApprovalHash ?? '', $o100SourceSha ?? '', 'inventory');
if ($o100ReadApproval) {
    $o100DeploymentLock=fopen($o100ReadHome.'/.o100-deploy/lock','c');
    if (!$o100DeploymentLock || !flock($o100DeploymentLock,LOCK_EX|LOCK_NB)) throw new RuntimeException('Deployment blocks inventory');
    o100_capture_pressure($o100ReadHome, null);
}
// Дескриптор остаётся открытым до завершения всего экспортирующего PHP-процесса.
