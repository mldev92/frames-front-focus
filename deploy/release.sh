#!/usr/bin/env bash
# Переключение и возврат без восстановления базы данных.
set -Eeuo pipefail
action=${1:?deploy or rollback}
root=$(realpath "${2:?document root}")
[[ -d "$root/bitrix" && -f "$root/.htaccess" ]] || { echo 'Invalid Bitrix document root' >&2; exit 2; }
state="$(dirname "$root")/.o100-deploy"
mkdir -p "$state"
chmod 700 "$state"
exec 9>"$state/lock"
flock -w 60 9
script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
php_bin=${O100_PHP:-php8.1}
origin=${O100_SMOKE_ORIGIN:?Set smoke origin}
curl_args=(--max-time 30 --silent --show-error)
if [[ -n "${O100_SMOKE_CURL_CONFIG:-}" ]]; then curl_args+=(--config "$O100_SMOKE_CURL_CONFIG"); fi
smoke() {
  local path status html links link actual expected
  for path in / /catalog_s/opravy/ /catalog_n/opravy/ /basket/ /order/ /auth/ /api/store/csrf.php /sitemap.xml; do
    curl "${curl_args[@]}" --fail "$origin$path" >/dev/null || return 1
  done
  # Проверяем ссылки настоящих карточек: успешный ответ категории недостаточен.
  if [[ -L "$root/o100_frontend_current" ]]; then
    # Nginx может отдать старый физический файл раньше правил Apache.
    for path in robots.txt sitemap.xml; do
      expected=$(sha256sum "$root/o100_frontend_current/$path" | cut -d' ' -f1)
      actual=$(curl "${curl_args[@]}" --compressed --fail "$origin/$path" | sha256sum | cut -d' ' -f1) || return 1
      [[ "$actual" == "$expected" ]] || { echo "Public $path differs from release" >&2; return 1; }
    done
    for path in /catalog_s/opravy/ /catalog_n/opravy/; do
      html=$(curl "${curl_args[@]}" --fail "$origin$path") || return 1
      links=$(printf '%s' "$html" | "$php_bin" -r '
        preg_match_all("~<a\b[^>]*>~i", stream_get_contents(STDIN), $tags);
        $links=[];
        foreach ($tags[0] as $tag) {
          if (!preg_match("~\bdata-product-id=\"[0-9]+\"~", $tag)) continue;
          if (preg_match("~\bhref=\"(/catalog_[sn]/[^\"<>[:space:]]+)\"~", $tag, $m)) $links[$m[1]]=true;
        }
        if (!$links) exit(1);
        echo implode("\n", array_slice(array_keys($links), 0, 3));
      ') || return 1
      while IFS= read -r link; do
        status=$(curl "${curl_args[@]}" --output /dev/null --write-out '%{http_code}' "$origin$link") || return 1
        [[ "$status" == 200 ]] || { echo "Product navigation failed: $link ($status)" >&2; return 1; }
      done <<< "$links"
    done
  fi
  status=$(curl "${curl_args[@]}" --output /dev/null --write-out '%{http_code}' "$origin/cutover-missing-route-9f381a/")
  [[ "$status" == 404 ]]
}
restore() {
  local transaction=$1 previous
  [[ -f "$transaction/htaccess" && -f "$transaction/previous" ]] || return 1
  previous=$(cat "$transaction/previous")
  if [[ -n "$previous" ]]; then
    [[ "$previous" == "$root/o100_frontend_releases/"* && -s "$previous/index.html" ]] || return 1
    ln -sfn "$previous" "$root/o100_frontend_next"
    mv -Tf "$root/o100_frontend_next" "$root/o100_frontend_current"
  fi
  cp "$transaction/htaccess" "$root/.htaccess.next"
  mv -f "$root/.htaccess.next" "$root/.htaccess"
  if [[ -z "$previous" && -L "$root/o100_frontend_current" ]]; then unlink "$root/o100_frontend_current"; fi
  if [[ -s "$transaction/parent-transaction" ]]; then
    cp "$transaction/parent-transaction" "$state/active-transaction.next"
    mv -f "$state/active-transaction.next" "$state/active-transaction"
  else
    rm -f "$state/active-transaction"
  fi
}
if [[ "$action" == rollback ]]; then
  if [[ -n "${O100_EXPECTED_FRONTEND:-}" ]]; then
    [[ "$(cat "$root/o100_frontend_current/.release-sha")" == "$O100_EXPECTED_FRONTEND" ]] || { echo 'Rollback refused: frontend changed' >&2; exit 3; }
  fi
  transaction=$(cat "$state/active-transaction")
  [[ "$transaction" == "$state/transactions/"* ]] || exit 2
  restore "$transaction"
  smoke
  printf '%s\n' rolled-back > "$transaction/status"
  exit
fi
[[ "$action" == deploy ]] || exit 2
sha=${3:?approved frontend SHA}
baseline=${4:?approved routing SHA256}
archive=${5:?release archive}
[[ "$sha" =~ ^[a-f0-9]{40}$ && "$baseline" =~ ^[a-f0-9]{64}$ ]] || exit 2
[[ "$(sha256sum "$root/.htaccess" | cut -d' ' -f1)" == "$baseline" ]] || { echo 'Routing drift; deployment refused' >&2; exit 3; }
if [[ -n "${O100_EXPECTED_FRONTEND:-}" ]]; then
  [[ "$(cat "$root/o100_frontend_current/.release-sha")" == "$O100_EXPECTED_FRONTEND" ]] || { echo 'Frontend drift; deployment refused' >&2; exit 3; }
fi
release="$root/o100_frontend_releases/$sha"
[[ ! -e "$release" ]] || { echo 'Immutable release already exists' >&2; exit 3; }
stage="$release.stage-$$"
mkdir -p "$stage"
# Не оставляем распакованный stage после ошибки квоты или проверки.
trap 'if [[ -d "$stage" && ! -L "$stage" && "$stage" == "$root/o100_frontend_releases/$sha.stage-"* ]]; then rm -rf -- "$stage"; fi' EXIT
tar -xOf "$archive" ./release-manifest.json > "$stage/release-manifest.json"
"$php_bin" "$script_dir/link-unchanged.php" "$stage" "$root/o100_frontend_current"
tar -xzf "$archive" -C "$stage" --no-same-owner --skip-old-files
for file in index.html _shell.html 404.html sitemap.xml robots.txt release-manifest.json; do test -s "$stage/$file"; done
[[ "$(cat "$stage/.release-sha")" == "$sha" ]]
"$php_bin" "$script_dir/verify-release.php" "$stage" "$root"
transaction="$state/transactions/$(date -u +%Y%m%dT%H%M%SZ)-$sha"
mkdir -p "$transaction"
cp "$root/.htaccess" "$transaction/htaccess"
"$php_bin" "$script_dir/merge-routing.php" "$root/.htaccess" "$script_dir" "$baseline" "$transaction/next.htaccess"
readlink "$root/o100_frontend_current" > "$transaction/previous" || : > "$transaction/previous"
if [[ -s "$state/active-transaction" ]]; then cp "$state/active-transaction" "$transaction/parent-transaction"; fi
mv "$stage" "$release"
mkdir -p "$root/o100_frontend_assets" "$root/assets"
if [[ -d "$release/assets" ]]; then
  while IFS= read -r -d '' asset; do
    relative=${asset#"$release/assets/"}
    for destination in "$root/o100_frontend_assets/$relative" "$root/assets/$relative"; do
      if [[ -f "$destination" ]]; then cmp "$asset" "$destination" || { echo "Asset collision: $relative" >&2; exit 3; }
      else mkdir -p "$(dirname "$destination")"; cp "$asset" "$destination"; fi
    done
  done < <(find "$release/assets" -type f -print0)
fi
printf '%s\n' "$transaction" > "$state/active-transaction.next"
mv -f "$state/active-transaction.next" "$state/active-transaction"
armed=1
revert_on_error() {
  local code=$?
  trap - ERR HUP INT TERM
  if [[ "$armed" == 1 ]]; then
    restore "$transaction" && printf '%s\n' automatically-restored > "$transaction/status"
    smoke || echo 'Rollback smoke failed: operator intervention required' >&2
  fi
  exit "${code:-1}"
}
trap revert_on_error ERR HUP INT TERM
ln -sfn "$release" "$root/o100_frontend_next"
mv -Tf "$root/o100_frontend_next" "$root/o100_frontend_current"
cp "$transaction/next.htaccess" "$root/.htaccess.next"
mv -f "$root/.htaccess.next" "$root/.htaccess"
[[ "${O100_TEST_FAIL_AFTER_SWAP:-0}" != 1 ]]
smoke
acceptance_script=${O100_ACCEPTANCE_SCRIPT:-}
if "$php_bin" -r '$m=json_decode(file_get_contents($argv[1]),true); exit(empty($m["catalogFingerprint"])?1:0);' "$release/release-manifest.json"; then
  acceptance_script="$script_dir/accept-catalog-release.php"
fi
if [[ -n "$acceptance_script" ]]; then
  [[ -f "$acceptance_script" ]] || { echo 'Acceptance script missing' >&2; false; }
  "$php_bin" "$acceptance_script" "$root" "$release" "$origin"
fi
armed=0
trap - ERR HUP INT TERM
printf '%s\n' deployed > "$transaction/status"
echo "Deployed $sha; rollback transaction: $transaction"
