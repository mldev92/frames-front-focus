#!/usr/bin/env bash
set -Eeuo pipefail
root=$(mktemp -d)
trap 'rm -rf -- "$root"' EXIT
mkdir -p "$root/.o100-deploy" "$root/site/live" "$root/site/rollback" "$root/candidate/assets" "$root/tools"
ln -s live "$root/site/current"
for i in $(seq 1 160); do
  mkdir -p "$root/candidate/catalog/$i"
  printf '%s\n' "$i" > "$root/candidate/catalog/$i/index.html"
done
dd if=/dev/zero of="$root/candidate/assets/bundle" bs=1024 count=512 status=none
tar -czf "$root/archive.tgz" -C "$root/candidate" .
tar -czf "$root/tools.tgz" -C "$root/tools" .
estimate=$(python3 scripts/release-capacity.py "$root/archive.tgz" "$root/tools.tgz")
bytes=$(jq -er .bytes <<< "$estimate")
files=$(jq -er .files <<< "$estimate")
(( bytes > 1572864 && files > 320 ))
check() { php deploy/check-release-capacity.php "$root/site" "$bytes" "$files" "$1"; }
if check ''; then exit 1; fi
if check "$((bytes-1))" > "$root/report"; then exit 1; fi
grep -E '^bytes .*shortfall=1$' "$root/report"
check "$bytes"
[[ "$(readlink "$root/site/current")" == live && -d "$root/site/rollback" ]]
docker run --rm --tmpfs /stage:size=1m -v "$PWD/deploy/check-release-capacity.php:/check.php:ro" php:8.1-cli bash -eu -c '
  mkdir -p /stage/site
  if php /check.php /stage/site 2000000 10 999999999 > /tmp/report; then exit 1; fi
  grep -E "^bytes .*shortfall=[1-9][0-9]*$" /tmp/report
  [[ -z "$(ls -A /stage/site)" ]]
'
python3 tests/beget-capacity.py
bash tests/transfer-exhaustion.sh
