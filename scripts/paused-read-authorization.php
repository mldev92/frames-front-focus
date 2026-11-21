<?php
// Разрешение только на чтение снимка; оно никогда не открывает обмен 1С.
function o100_read_authorization(string $home, string $approvalHash, string $sourceSha, string $purpose): ?array {
    clearstatcache();
    if (is_file($home.'/.o100-1c-diagnostic-permit.json') || is_file($home.'/.o100-1c-diagnostic-state.json')) throw new RuntimeException('1C diagnostic blocks production reads');
    $paused = is_file($home.'/.o100-1c-catalog-paused');
    if ($approvalHash === '') {
        if ($paused) throw new RuntimeException('1C pause blocks production reads');
        return null;
    }
    if (!$paused || !preg_match('/^[a-f0-9]{64}$/D', $approvalHash) || !preg_match('/^[a-f0-9]{40}$/D', $sourceSha)) throw new RuntimeException('Invalid paused read scope');
    $file = $home.'/.o100-paused-read-approval.json';
    if (!is_file($file) || is_link($file) || filesize($file)>16384 || !hash_equals($approvalHash, hash_file('sha256', $file))) throw new RuntimeException('Paused read approval missing or changed');
    $a = json_decode(file_get_contents($file), true, 512, JSON_THROW_ON_ERROR);
    $now = time();
    if (($a['version']??null)!==1 || ($a['purpose']??'')!=='runtime-fix-snapshot' || ($a['source_sha']??'')!==$sourceSha
        || !in_array($purpose, $a['operations']??[], true) || !is_int($a['issued_at']??null) || !is_int($a['expires_at']??null)
        || $a['issued_at']>$now || $a['expires_at']<=$now || $a['expires_at']-$a['issued_at']>28800) throw new RuntimeException('Paused read approval expired or outside scope');
    foreach (['pause_sha256'=>'.o100-1c-catalog-paused', 'backend_manifest_sha256'=>'.o100-backend-release.json',
        'routing_sha256'=>'public_html/.htaccess', 'guard_sha256'=>'public_html/bitrix/admin/1c_exchange.php'] as $key=>$relative) {
        if (!preg_match('/^[a-f0-9]{64}$/D', $a[$key]??'') || !is_file($home.'/'.$relative) || !hash_equals($a[$key],hash_file('sha256',$home.'/'.$relative))) throw new RuntimeException('Paused read baseline changed');
    }
    return $a;
}

// Проверяется только существующим read-only probe, без загрузки Bitrix.
function o100_capture_pressure(string $home, ?array $baseline): array {
    $probe = $home.'/.o100-deploy/passive-monitor-952df90/db_pressure_sample.php';
    if (!hash_equals('52dc853c36c00a1da90e0e6815b5cc2067fe547e67dbd3ce98b048ca98cd7533',hash_file('sha256',$probe))) throw new RuntimeException('Pressure probe changed');
    exec('timeout 10 '.escapeshellarg(PHP_BINARY).' '.escapeshellarg($probe).' '.escapeshellarg($home.'/public_html').' 2>/dev/null', $lines, $code);
    $s = json_decode(implode("\n",$lines),true);
    if ($code!==0) throw new RuntimeException('Capture pressure probe failed: exit='.$code);
    if (!is_array($s) || ($s['ok']??false)!==true) throw new RuntimeException('Capture pressure probe failed: no valid result');
    return o100_check_capture_pressure($s, $baseline);
}
function o100_check_capture_pressure(array $s, ?array $baseline): array {
    foreach (['Threads_connected','Threads_running','max_connections','max_user_connections','account_connections','account_active','Connection_errors_max_connections','Uptime'] as $key) {
        if (!is_int($s[$key]??null) || $s[$key]<0) throw new RuntimeException('Capture pressure sample invalid: '.$key);
    }
    if ($s['max_connections']<1) throw new RuntimeException('Capture pressure sample invalid: max_connections=0');
    $limits = ['Threads_connected'=>.8*$s['max_connections'], 'Threads_running'=>40, 'account_connections'=>10, 'account_active'=>5];
    foreach ($limits as $key=>$limit) {
        if ($s[$key]>=$limit) throw new RuntimeException("Capture pressure limit reached: $key={$s[$key]}, limit=$limit");
    }
    $userCapacity = .8*$s['max_user_connections'];
    if ($s['max_user_connections'] && $s['account_connections']+1>=$userCapacity) {
        throw new RuntimeException("Capture pressure limit reached: account_connections+1=".($s['account_connections']+1).", user_capacity=$userCapacity");
    }
    if ($baseline) {
        foreach (['Connection_errors_max_connections','Uptime','max_connections','max_user_connections'] as $key) {
            $changed = $key==='Uptime' ? $s[$key]<$baseline[$key] : $s[$key]!==$baseline[$key];
            if ($changed) throw new RuntimeException("Capture database baseline changed: $key={$s[$key]}, baseline={$baseline[$key]}");
        }
    }
    return $s;
}
