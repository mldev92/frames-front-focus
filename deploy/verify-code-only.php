<?php
// Под общей блокировкой сверяем выпуск с реально опубликованным каталогом.
if (PHP_SAPI !== 'cli' || $argc !== 3) exit(2);
[, $stage, $root] = $argv;
$read = static fn(string $file) => json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
$manifest = $read($stage.'/release-manifest.json');
$current = $root.'/o100_frontend_current';
$parent = $read($current.'/release-manifest.json');
$binding = $manifest['codeOnly'] ?? [];
if (($binding['parentSha'] ?? null) !== trim(file_get_contents($current.'/.release-sha'))
    || $binding['parentSha'] !== $parent['frontendSha']
    || ($binding['parentManifestSha256'] ?? null) !== hash_file('sha256', $current.'/release-manifest.json')
    || $manifest['backendSha'] !== $read(dirname($root).'/.o100-backend-release.json')['sha']) {
    throw new RuntimeException('Published storefront or backend changed since preparation');
}
foreach (['catalogFingerprint','inventorySha256','inventoryGeneratedAt','routeCount','backendSha','backendFiles','settings','retiredPaths','acceptancePaths','queryAcceptancePaths'] as $key) {
    if (!isset($parent[$key]) || $manifest[$key] !== $parent[$key]) throw new RuntimeException('Changed published baseline: '.$key);
}
foreach (['sitemap.xml','robots.txt'] as $name) {
    if ($manifest['files'][$name] !== $parent['files'][$name]) throw new RuntimeException('Changed published '.$name);
}
$routes = static function(array $files): array {
    $names = array_filter(array_keys($files), fn($p) => $p === 'index.html' || str_ends_with($p, '/index.html'));
    sort($names, SORT_STRING);
    return $names;
};
if ($routes($manifest['files']) !== $routes($parent['files'])) throw new RuntimeException('Changed published routes');
