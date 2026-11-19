<?php
// Дополняет проверенный статический выпуск без чтения БД или пересборки каталога.
if (PHP_SAPI !== 'cli' || $argc !== 9) exit(2);
[, $root, $stage, $sha, $parentSha, $parentManifestHash, $backendSha, $backendManifestHash, $routingHash] = $argv;
foreach ([[$sha, 40], [$parentSha, 40], [$parentManifestHash, 64], [$backendSha, 40], [$backendManifestHash, 64], [$routingHash, 64]] as [$value, $length]) {
    if (!preg_match('/^[a-f0-9]{'.$length.'}$/D', $value)) throw new RuntimeException('Invalid approved identity');
}

function check_file(string $path, string $expected): void {
    if (!is_file($path) || is_link($path) || !hash_equals($expected, hash_file('sha256', $path))) {
        throw new RuntimeException('File differs from the approved baseline: ' . basename($path));
    }
}

$home = dirname($root);
$parent = $root . '/o100_frontend_releases/' . $parentSha;
if (str_replace('\\', '/', realpath($root . '/o100_frontend_current') ?: '') !== $parent || trim(file_get_contents($parent.'/.release-sha')) !== $parentSha) {
    throw new RuntimeException('Active storefront changed');
}
check_file($parent.'/release-manifest.json', $parentManifestHash);
check_file($home.'/.o100-backend-release.json', $backendManifestHash);
check_file($root.'/.htaccess', $routingHash);

$manifest = json_decode(file_get_contents($parent.'/release-manifest.json'), true, 512, JSON_THROW_ON_ERROR);
$backend = json_decode(file_get_contents($home.'/.o100-backend-release.json'), true, 512, JSON_THROW_ON_ERROR);
if (($manifest['frontendSha'] ?? '') !== $parentSha || !is_array($manifest['files'] ?? null)
    || empty($manifest['catalogFingerprint']) || empty($manifest['routeCount'])
    || ($backend['sha'] ?? '') !== $backendSha || !isset($backend['files']['api/store/admin_shortcuts.php'])) {
    throw new RuntimeException('Incomplete storefront or backend baseline');
}

$toolbar = file_get_contents(__DIR__.'/admin-toolbar.js');
$asset = 'assets/o100-admin-toolbar-'.hash('sha256', $toolbar).'.js';
$tag = '<script defer src="/'.$asset.'"></script>';
if (isset($manifest['files'][$asset]) || isset($manifest['adminToolbar'])) throw new RuntimeException('Toolbar is already in the baselined release');

$changed = 0;
foreach ($manifest['files'] as $path => $hash) {
    if (str_contains($path, '..') || str_starts_with($path, '/') || str_contains($path, '\\')) throw new RuntimeException('Unexpected release path');
    $source = $parent.'/'.$path;
    $destination = $stage.'/'.$path;
    $directory = dirname($destination);
    if (!is_dir($directory) && !mkdir($directory, 0755, true)) throw new RuntimeException('Cannot prepare release path');
    check_file($source, $hash);
    if ($path === '.release-sha') {
        if (file_put_contents($destination, $sha."\n") === false) throw new RuntimeException('Cannot record release SHA');
        $manifest['files'][$path] = hash('sha256', $sha."\n");
    } elseif (str_ends_with($path, '.html') && $path !== '404.html') {
        $html = file_get_contents($source);
        if (!str_contains($html, '<script type="module"') || substr_count($html, '</head>') !== 1 || str_contains($html, 'o100-admin-toolbar-')) {
            throw new RuntimeException('Unexpected storefront HTML: '.$path);
        }
        $patched = str_replace('</head>', $tag.'</head>', $html);
        if (file_put_contents($destination, $patched) !== strlen($patched)) throw new RuntimeException('Cannot write storefront HTML');
        $manifest['files'][$path] = hash('sha256', $patched);
        $changed++;
    } elseif (!link($source, $destination)) {
        throw new RuntimeException('Cannot reuse immutable release file: '.$path);
    }
}
if ($changed < (int)$manifest['routeCount'] || !is_file($stage.'/_shell.html') || !is_file($stage.'/index.html')) {
    throw new RuntimeException('Incomplete storefront HTML coverage');
}
if (file_put_contents($stage.'/'.$asset, $toolbar) !== strlen($toolbar)) throw new RuntimeException('Cannot write toolbar asset');
$manifest['files'][$asset] = hash('sha256', $toolbar);
$manifest['frontendSha'] = $sha;
$manifest['backendSha'] = $backendSha;
$manifest['backendFiles'] = array_map(fn($entry) => is_array($entry) ? $entry['sha256'] : $entry, $backend['files']);
$manifest['routingBaseline'] = $routingHash;
$manifest['builtAt'] = gmdate('c');
$manifest['adminToolbar'] = ['parentSha'=>$parentSha, 'parentManifestSha256'=>$parentManifestHash, 'asset'=>'/'.$asset, 'updatedPages'=>$changed];
unset($manifest['templateFiles']['deploy/catalog-export.php']);
foreach (array_keys($manifest['templateFiles']) as $tool) {
    $manifest['templateFiles'][$tool] = hash_file('sha256', __DIR__.'/'.basename($tool));
}
foreach (['admin-toolbar-overlay.php', 'admin-toolbar.js'] as $tool) {
    $manifest['templateFiles']['deploy/'.$tool] = hash_file('sha256', __DIR__.'/'.$tool);
}
$data = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n";
if (file_put_contents($stage.'/release-manifest.json', $data) !== strlen($data)) throw new RuntimeException('Cannot record release manifest');
echo json_encode(['overlayPrepared'=>true, 'parent'=>$parentSha, 'updatedPages'=>$changed, 'asset'=>'/'.$asset]),"\n";
