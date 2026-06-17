<?php
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

function o100_proxy_header_value(string $name): string {
    $key = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
    return isset($_SERVER[$key]) ? (string)$_SERVER[$key] : '';
}

function o100_relay_cookie(string $header): void {
    $cookie = trim(substr($header, strlen('Set-Cookie:')));
    if ($cookie === '') return;
    $cookie = preg_replace('/;\s*domain=[^;]*/i', '', $cookie);
    header('Set-Cookie: ' . $cookie, false);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
    http_response_code(204);
    exit;
}

$target = 'https://optika100.com/api/store/sdek_ajax_proxy.php';
$headers = [
    'Origin: https://beta.optika100.com',
    'Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'application/x-www-form-urlencoded; charset=UTF-8'),
    'X-Requested-With: XMLHttpRequest',
];
$cookie = o100_proxy_header_value('Cookie');
if ($cookie !== '') $headers[] = 'Cookie: ' . $cookie;

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => implode("\r\n", $headers),
        'content' => file_get_contents('php://input'),
        'ignore_errors' => true,
        'timeout' => 30,
    ],
]);

$body = file_get_contents($target, false, $context);
$status = 502;
foreach (($http_response_header ?? []) as $header) {
    if (preg_match('#^HTTP/\S+\s+(\d+)#', $header, $match)) {
        $status = (int)$match[1];
    } elseif (stripos($header, 'Content-Type:') === 0) {
        header($header);
    } elseif (stripos($header, 'Set-Cookie:') === 0) {
        o100_relay_cookie($header);
    }
}

http_response_code($status);
echo $body === false ? '' : $body;
