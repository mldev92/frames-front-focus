<?php
// Неизвестную структуру .htaccess не переписываем.
if (PHP_SAPI !== 'cli' || $argc !== 5) exit(2);
[$script, $baseline, $templateDir, $expected, $output] = $argv;
if (!hash_equals($expected, hash_file('sha256', $baseline))) throw new RuntimeException('Routing baseline changed');
$text = file_get_contents($baseline);
$text = preg_replace('/# BEGIN O100 FRONTEND\R.*?# END O100 FRONTEND\R?/s', '', $text);
$text = preg_replace('/# BEGIN O100 REDIRECTS\R.*?# END O100 REDIRECTS\R?/s', '', $text);
$marker = '/^[\t ]*RewriteCond\s+%\{REQUEST_FILENAME\}\s+robots\.txt\s*$/mi';
if (preg_match_all($marker, $text) !== 1) throw new RuntimeException('Expected one insertion point before robots');
$block = file_get_contents($templateDir . '/production.htaccess');
$block .= "\n# BEGIN O100 REDIRECTS\n" . file_get_contents($templateDir . '/redirects.production.txt') . "\n# END O100 REDIRECTS\n";
$text = preg_replace_callback($marker, fn($m) => $block . "\n" . $m[0], $text, 1);
if (file_put_contents($output, $text) === false) throw new RuntimeException('Cannot write routing');
