<?php
// Работает под той же блокировкой, что и переключение выпуска.
if (PHP_SAPI !== 'cli') exit(2);
function requireValue(bool $valid, string $message): void {
    if (!$valid) throw new RuntimeException($message);
}
function readValue(string $path): string {
    $value = file_get_contents($path);
    requireValue($value !== false, "Cannot read $path");
    return trim($value);
}
function releaseId(string $path, string $base): string {
    $id = basename($path);
    requireValue(preg_match('/^[a-f0-9]{40}$/D', $id) === 1 &&
        $path === "$base/$id" && realpath($path) === $path, 'Invalid release pointer');
    requireValue(readValue("$path/.release-sha") === $id, 'Release marker mismatch');
    return $id;
}

[$script, $root, $action] = $argv;
requireValue(realpath($root) === $root && in_array($action, ['list', 'prune', 'finish'], true), 'Invalid arguments');
$state = dirname($root) . '/.o100-deploy';
$base = "$root/o100_frontend_releases";
requireValue(realpath($base) === $base, 'Invalid release directory');
$lock = fopen("$state/lock", 'r');
requireValue($lock && flock($lock, ($action === 'list' ? LOCK_SH : LOCK_EX) | LOCK_NB), 'Deployment in progress');
$tx = readValue("$state/active-transaction");
requireValue(dirname($tx) === "$state/transactions" && realpath($tx) === $tx &&
    readValue("$tx/status") === 'deployed', 'Invalid active transaction');
$live = releaseId(realpath("$root/o100_frontend_current") ?: '', $base);
requireValue(str_ends_with($tx, "-$live"), 'Transaction and live release differ');
$previousPath = readValue("$tx/previous");
$previous = $previousPath === '' ? null : releaseId($previousPath, $base);
if ($action === 'list') {
    $older = [];
    foreach (glob("$base/*") as $path) {
        $id = basename($path);
        if (!preg_match('/^[a-f0-9]{40}$/D', $id) || $id === $live || $id === $previous) continue;
        $published = false;
        foreach (glob("$state/transactions/*-$id/status") as $status) {
            if (readValue($status) === 'deployed') $published = true;
        }
        requireValue($published, "Unrecognized release requires review: $id");
        releaseId($path, $base);
        $older[$id] = hash_file('sha256', "$path/release-manifest.json");
    }
    $pending = [];
    foreach (glob("$base/.pruning-*") as $detached) {
        requireValue(preg_match('/^\.pruning-([a-f0-9]{40})-([a-f0-9]{64})$/D', basename($detached), $parts) === 1 &&
            hash_file('sha256', "$state/retention-$parts[1].json") === $parts[2], 'Unknown pending cleanup');
        $pending[$parts[1]] = $parts[2];
    }
    echo json_encode(['pending' => (object)$pending, 'live' => $live, 'previous' => $previous, 'older' => (object)$older], JSON_THROW_ON_ERROR), "\n";
    exit;
}

[, , , $expectedLive, $target, $digest] = $argv;
requireValue($expectedLive === $live && $target !== $live && $target !== $previous, 'Protected release or changed baseline');
requireValue(preg_match('/^[a-f0-9]{40}$/D', $target) === 1 &&
    preg_match('/^[a-f0-9]{64}$/D', $digest) === 1, 'Invalid archive receipt');
$path = "$base/$target";
$detached = "$base/.pruning-$target-$digest";
$receipt = "$state/retention-$target.json";
$resuming = is_dir($detached);
if ($resuming) {
    requireValue(realpath($detached) === $detached && !file_exists($path), 'Unexpected detached release');
} else {
    requireValue($action === 'prune', 'Missing detached release');
    releaseId($path, $base);
}
$tree = $resuming ? $detached : $path;
$manifestBytes = file_get_contents($resuming ? $receipt : "$tree/release-manifest.json");
requireValue($manifestBytes !== false && hash('sha256', $manifestBytes) === $digest, 'Manifest differs from archive');
$manifest = json_decode($manifestBytes, true, 512, JSON_THROW_ON_ERROR);
requireValue($manifest['frontendSha'] === $target && !empty($manifest['files']), 'Invalid manifest');
$expected = $manifest['files'];
$expected['release-manifest.json'] = $digest;
$walk = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($tree, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST);
foreach ($walk as $file) {
    requireValue(!$file->isLink(), 'Unexpected symlink');
    if ($file->isDir()) continue;
    $name = substr($file->getPathname(), strlen($tree) + 1);
    requireValue($file->isFile() && isset($expected[$name]) &&
        hash_file('sha256', $file->getPathname()) === $expected[$name], "Unarchived or changed file: $name");
    unset($expected[$name]);
}
if (!$resuming) {
    requireValue(!$expected, 'Files missing from release');
    requireValue(file_put_contents("$receipt.tmp", $manifestBytes) === strlen($manifestBytes) &&
        rename("$receipt.tmp", $receipt), 'Cannot record verified archive manifest');
    requireValue(rename($path, $detached), 'Cannot detach verified release');
}
$walk = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($detached, FilesystemIterator::SKIP_DOTS),
    RecursiveIteratorIterator::CHILD_FIRST);
foreach ($walk as $file) {
    requireValue(!$file->isLink() && str_starts_with($file->getRealPath(), "$detached/"), 'Unsafe detached entry');
    requireValue($file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname()), 'Prune failed');
}
requireValue(rmdir($detached), 'Cannot remove detached directory');
requireValue(unlink($receipt), 'Cannot remove temporary manifest');
echo "Pruned $target\n";
