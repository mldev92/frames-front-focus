<?php
// Неизвестную структуру .htaccess не переписываем.
if (PHP_SAPI !== 'cli' || !in_array($argc, [5, 6], true)) exit(2);
[$script, $baseline, $templateDir, $expected, $output] = $argv;
if (!hash_equals($expected, hash_file('sha256', $baseline))) throw new RuntimeException('Routing baseline changed');
$text = file_get_contents($baseline);
if ($argc === 6) {
    $manifest = json_decode(file_get_contents($argv[5]), true, 512, JSON_THROW_ON_ERROR);
    $rules = $manifest['codeOnly']['routingRedirects'] ?? [];
    if (!is_array($rules) || !array_is_list($rules) || !$rules) throw new RuntimeException('Exact redirect list required');
    $pattern = <<<'REGEX'
~^RewriteRule \^(catalog_[sn]/(?:[a-z0-9_-]+(?:\\x20[a-z0-9_-]+)*/)*[a-z0-9_-]+(?:\\x20[a-z0-9_-]+)*)/\?\$ https://optika100\.com(/(?:[a-z0-9_-]+/)+) \[R=301,END\]$~D
REGEX;
    $sources = [];
    foreach ($rules as $rule) {
        if (!is_string($rule) || !preg_match($pattern, $rule, $match)) throw new RuntimeException('Invalid exact catalog redirect');
        [, $source, $target] = $match;
        $path = '/'.str_replace('\x20', ' ', $source).'/';
        if ($path === $target || isset($sources[$path]) || isset($manifest['files'][ltrim($path, '/').'index.html'])
            || !isset($manifest['files'][ltrim($target, '/').'index.html'])
            || in_array($path, $manifest['retiredPaths'], true)
            || str_contains($text, '^'.$source.'/?$ ')) {
            throw new RuntimeException('Exact redirect conflicts with published routing: '.$path);
        }
        $sources[$path] = true;
    }
    $anchor = '/^# BEGIN O100 FRONTEND\R(?:#[^\r\n]*\R)*RewriteEngine On\R/m';
    if (preg_match_all($anchor, $text) !== 1) throw new RuntimeException('Expected one managed frontend rewrite block');
    $text = preg_replace_callback($anchor, fn($m) => $m[0].implode("\n", $rules)."\n", $text, 1);
    if (file_put_contents($output, $text) === false) throw new RuntimeException('Cannot write exact redirects');
    exit;
}
$text = preg_replace('/# BEGIN O100 FRONTEND\R.*?# END O100 FRONTEND\R?/s', '', $text);
$text = preg_replace('/# BEGIN O100 REDIRECTS\R.*?# END O100 REDIRECTS\R?/s', '', $text);
$marker = '/^[\t ]*RewriteCond\s+%\{REQUEST_FILENAME\}\s+robots\.txt\s*$/mi';
if (preg_match_all($marker, $text) !== 1) throw new RuntimeException('Expected one insertion point before robots');
$block = file_get_contents($templateDir . '/production.htaccess');
$block .= "\n# BEGIN O100 REDIRECTS\n" . file_get_contents($templateDir . '/redirects.production.txt') . "\n# END O100 REDIRECTS\n";
$text = preg_replace_callback($marker, fn($m) => $block . "\n" . $m[0], $text, 1);
if (file_put_contents($output, $text) === false) throw new RuntimeException('Cannot write routing');
