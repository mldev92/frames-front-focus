<?php
// Контроль содержимого до переключения.
if (PHP_SAPI !== 'cli' || $argc !== 3) exit(2);
$root = $argv[1];
$liveRoot = $argv[2];
$manifest = json_decode(file_get_contents($root . '/release-manifest.json'), true, 512, JSON_THROW_ON_ERROR);
if (($manifest['frontendSha'] ?? '') !== trim(file_get_contents($root . '/.release-sha'))) throw new RuntimeException('Frontend SHA mismatch');
if (!hash_equals($manifest['routingBaseline'], hash_file('sha256', $liveRoot . '/.htaccess'))) throw new RuntimeException('Routing baseline mismatch');
if (empty($manifest['backendFiles'])) throw new RuntimeException('Backend checksums required');
foreach ($manifest['backendFiles'] as $path => $hash) {
    if (str_contains($path, '..') || str_starts_with($path, '/') || !is_file($liveRoot . '/' . $path) || !hash_equals($hash, hash_file('sha256', $liveRoot . '/' . $path))) throw new RuntimeException('Deployed API changed: ' . $path);
}
if (($manifest['settings']['privateBeta'] ?? true) || ($manifest['settings']['fixtures'] ?? true) || ($manifest['settings']['virtualTryOn'] ?? true)) throw new RuntimeException('Unsafe production settings');
foreach ($manifest['files'] as $path => $hash) {
    if (str_contains($path, '..') || str_starts_with($path, '/') || !is_file($root . '/' . $path) || !hash_equals($hash, hash_file('sha256', $root . '/' . $path))) throw new RuntimeException('Artifact hash mismatch: ' . $path);
}

if (empty($manifest['templateFiles'])) throw new RuntimeException('Deployment tool checksums required');
foreach ($manifest['templateFiles'] as $path => $hash) {
    if (!in_array($path, ['deploy/production.htaccess', 'deploy/redirects.production.txt', 'deploy/release.sh', 'deploy/merge-routing.php', 'deploy/verify-release.php'], true)) throw new RuntimeException('Unexpected deployment tool');
    if (!hash_equals($hash, hash_file('sha256', __DIR__ . '/' . basename($path)))) throw new RuntimeException('Deployment tools differ from approved artifact');
}
