<?php
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

$target = 'https://optika100.com/api/store/sdek_widget_frame.php';
$query = $_SERVER['QUERY_STRING'] ?? '';
if ($query !== '') $target .= '?' . $query;

$headers = [
    'Origin: https://beta.optika100.com',
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
];
$cookie = o100_proxy_header_value('Cookie');
if ($cookie !== '') $headers[] = 'Cookie: ' . $cookie;

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => implode("\r\n", $headers),
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
