#!/usr/bin/env bash
# Точечная смена routing без пересборки или переключения frontend.
set -Eeuo pipefail
root=$(realpath "${1:?document root}")
frontend=${2:?current frontend SHA}
baseline=${3:?current routing SHA256}
revision=${4:?reviewed routing commit}
[[ "$frontend" =~ ^[a-f0-9]{40}$ && "$revision" =~ ^[a-f0-9]{40}$ && "$baseline" =~ ^[a-f0-9]{64}$ ]] || exit 2
[[ -d "$root/bitrix" && -L "$root/o100_frontend_current" ]] || exit 2
state="$(dirname "$root")/.o100-deploy"
mkdir -p "$state"
chmod 700 "$state"
exec 9>"$state/lock"
flock -w 60 9
[[ "$(cat "$root/o100_frontend_current/.release-sha")" == "$frontend" ]] || { echo 'Frontend drift' >&2; exit 3; }
[[ "$(sha256sum "$root/.htaccess" | cut -d' ' -f1)" == "$baseline" ]] || { echo 'Routing drift' >&2; exit 3; }
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
php_bin=${O100_PHP:-php8.1}
origin=${O100_SMOKE_ORIGIN:?smoke origin}
transaction="$state/routing-transactions/$(date -u +%Y%m%dT%H%M%SZ)-$revision"
mkdir -m 700 -p "$transaction"
cp -p "$root/.htaccess" "$transaction/htaccess"
cp -p "$root/.htaccess" "$transaction/next.htaccess"
"$php_bin" "$script_dir/merge-routing.php" "$root/.htaccess" "$script_dir" "$baseline" "$transaction/next.htaccess"
printf '%s\n' "$frontend" > "$transaction/frontend-sha"
printf '%s\n' "$revision" > "$transaction/routing-revision"
curl_args=(--compressed --max-time 30 --silent --show-error)
smoke() {
  local path code
  for path in / /catalog_s/opravy/ /catalog_n/opravy/ /basket/ /auth/ /api/store/csrf.php /sitemap.xml; do
    code=$(curl "${curl_args[@]}" --output /dev/null --write-out '%{http_code}' "$origin$path") || return 1
    [[ "$code" == 200 ]] || { echo "Smoke failed: $path ($code)" >&2; return 1; }
  done
  while IFS= read -r path; do
    code=$(curl "${curl_args[@]}" --output /dev/null --write-out '%{http_code}' "$origin$path?routing_probe=1") || return 1
    [[ "$code" == 404 ]] || { echo "Retired URL failed: $path ($code)" >&2; return 1; }
  done < <("$php_bin" -r '$m=json_decode(file_get_contents($argv[1]),true,512,JSON_THROW_ON_ERROR); foreach($m["paths"] as $p) echo str_replace(" ","%20",$p),"\n";' "$script_dir/reviewed-legacy-redirects.json")
}
armed=1
restore() {
  local code=$?
  trap - ERR HUP INT TERM
  if [[ "$armed" == 1 ]]; then
    cp -p "$transaction/htaccess" "$root/.htaccess.next"
    mv -f "$root/.htaccess.next" "$root/.htaccess"
    printf '%s\n' automatically-restored > "$transaction/status"
  fi
  exit "${code:-1}"
}
trap restore ERR HUP INT TERM
cp -p "$transaction/next.htaccess" "$root/.htaccess.next"
mv -f "$root/.htaccess.next" "$root/.htaccess"
[[ "${O100_TEST_FAIL_AFTER_SWAP:-0}" != 1 ]]
smoke
[[ "$(cat "$root/o100_frontend_current/.release-sha")" == "$frontend" ]]
sha256sum "$root/.htaccess" | cut -d' ' -f1 > "$transaction/routing-sha256"
printf '%s\n' deployed > "$transaction/status"
armed=0
trap - ERR HUP INT TERM
echo "Routing updated from $revision; frontend unchanged at $frontend; transaction: $transaction"
