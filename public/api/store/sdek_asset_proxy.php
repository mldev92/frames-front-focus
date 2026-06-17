<?php
$path = isset($_GET['path']) ? (string)$_GET['path'] : '';
$path = rawurldecode($path);

if (!preg_match('#^/bitrix/images/ipol\.sdek/#', $path)) {
    http_response_code(400);
    echo 'Bad asset path';
    exit;
}

$target = 'https://optika100.com' . $path;
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => "Accept: image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8\r\n",
        'ignore_errors' => true,
        'timeout' => 20,
    ],
]);

$body = file_get_contents($target, false, $context);
$status = 502;
$contentType = '';
foreach (($http_response_header ?? []) as $header) {
    if (preg_match('#^HTTP/\S+\s+(\d+)#', $header, $match)) {
        $status = (int)$match[1];
    } elseif (stripos($header, 'Content-Type:') === 0) {
        $contentType = trim(substr($header, strlen('Content-Type:')));
    }
}

http_response_code($status);
header('Cache-Control: public, max-age=86400');
if ($contentType !== '') {
    header('Content-Type: ' . $contentType);
}
echo $body === false ? '' : $body;
