<?php
// Под общей блокировкой сверяем выпуск с реально опубликованным каталогом.
if (PHP_SAPI !== 'cli' || $argc !== 3) exit(2);
[, $stage, $root] = $argv;
$read = static fn(string $file) => json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
$manifest = $read($stage.'/release-manifest.json');
$current = $root.'/o100_frontend_current';
$parent = $read($current.'/release-manifest.json');
$binding = $manifest['codeOnly'] ?? [];
$backend = $read(dirname($root).'/.o100-backend-release.json');
if (($binding['parentSha'] ?? null) !== trim(file_get_contents($current.'/.release-sha'))
    || $binding['parentSha'] !== $parent['frontendSha']
    || ($binding['parentManifestSha256'] ?? null) !== hash_file('sha256', $current.'/release-manifest.json')
    || $manifest['backendSha'] !== $backend['sha']) {
    throw new RuntimeException('Published storefront or backend changed since preparation');
}
$backendFiles = array_map(static fn($entry) => is_array($entry) ? $entry['sha256'] : $entry, $backend['files']);
$sameFiles = static function(array $left, array $right): bool {
    ksort($left, SORT_STRING);
    ksort($right, SORT_STRING);
    return $left === $right;
};
if (!$sameFiles($manifest['backendFiles'], $backendFiles)) throw new RuntimeException('Backend file list changed after preparation');
if ($parent['backendSha'] === $manifest['backendSha']) {
    if (!$sameFiles($parent['backendFiles'], $backendFiles)) throw new RuntimeException('Published backend contract changed');
} else {
    $previous = $backend['codeOnlyCompatibleFrom'] ?? [];
    $changed = [];
    foreach ($backendFiles as $name => $hash) {
        if (($parent['backendFiles'][$name] ?? null) !== $hash) $changed[$name] = $parent['backendFiles'][$name] ?? null;
    }
    if (!$changed || ($previous['sha'] ?? '') !== $parent['backendSha']
        || !$sameFiles($previous['changedFiles'] ?? [], $changed) || array_diff_key($parent['backendFiles'], $backendFiles)) {
        throw new RuntimeException('Backend changes lack a matching compatibility declaration');
    }
}
foreach (['catalogFingerprint','inventorySha256','inventoryGeneratedAt','settings','retiredPaths','queryAcceptancePaths'] as $key) {
    if (!isset($parent[$key]) || $manifest[$key] !== $parent[$key]) throw new RuntimeException('Changed published baseline: '.$key);
}
if ($manifest['files']['robots.txt'] !== $parent['files']['robots.txt']) throw new RuntimeException('Changed published robots.txt');
$routes = static function(array $files): array {
    $names = array_filter(array_keys($files), fn($p) => $p === 'index.html' || str_ends_with($p, '/index.html'));
    sort($names, SORT_STRING);
    return $names;
};
$pages = $binding['standalonePaths'] ?? [];
if (!is_array($pages) || !array_is_list($pages)) throw new RuntimeException('Invalid standalone page list');
$parentRoutes = $routes($parent['files']);
$newRoutes = $parentRoutes;
$entries = '';
foreach ($pages as $path) {
    if (!is_string($path) || !preg_match('~^/(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*/)+$~D', $path)
        || preg_match('~^/(api|assets|auth|basket|bitrix|catalog|checkout|local|o100|order|payment|personal|robots|sale|search|sitemap|upload|verification)(?:-|/)~', $path)
        || in_array($path, $parent['retiredPaths'], true) || file_exists($root.'/'.trim($path, '/'))) {
        throw new RuntimeException('Invalid standalone page path');
    }
    $directory = dirname(rtrim($path, '/'));
    if ($directory !== '/' && !in_array($directory.'/', $pages, true)
        && !in_array(ltrim($directory, '/').'/index.html', $parentRoutes, true)) {
        throw new RuntimeException('Standalone parent route missing');
    }
    $file = ltrim($path, '/').'index.html';
    if (in_array($file, $newRoutes, true)) throw new RuntimeException('Duplicate standalone page path');
    $newRoutes[] = $file;
    $entries .= '  <url><loc>https://optika100.com'.$path."</loc></url>\n";
}
sort($newRoutes, SORT_STRING);
if ($routes($manifest['files']) !== $newRoutes || $manifest['routeCount'] !== $parent['routeCount'] + count($pages)
    || $manifest['acceptancePaths'] !== array_merge($parent['acceptancePaths'], $pages)) {
    throw new RuntimeException('Changed published routes outside standalone page additions');
}
$sitemapHash = $parent['files']['sitemap.xml'];
if ($pages) {
    $sitemap = file_get_contents($current.'/sitemap.xml');
    $end = strpos($sitemap, '</urlset>');
    if (hash('sha256', $sitemap) !== $sitemapHash || $end === false || !preg_match('~^</urlset>\s*$~D', substr($sitemap, $end))) {
        throw new RuntimeException('Invalid published sitemap');
    }
    foreach ($pages as $path) {
        $url = 'https://optika100.com'.$path;
        if (str_contains($sitemap, '<loc>'.$url.'</loc>') || str_contains($sitemap, '<loc>'.rtrim($url, '/').'</loc>')) {
            throw new RuntimeException('Standalone page already in published sitemap');
        }
    }
    $sitemapHash = hash('sha256', substr_replace($sitemap, $entries, $end, 0));
}
if ($manifest['files']['sitemap.xml'] !== $sitemapHash) throw new RuntimeException('Unexpected published sitemap change');
