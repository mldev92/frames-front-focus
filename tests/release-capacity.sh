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
check() { php deploy/check-release-capacity.php "$root/site" "$bytes" "$files"; }
reading() { printf '{"measuredAt":%d,"bytes":%d,"files":%d}\n' "$1" "$2" "$3" > "$root/.o100-deploy/account-capacity.json"; }
if check; then exit 1; fi
reading "$(date +%s)" "$((bytes-1))" "$files"
if check > "$root/report"; then exit 1; fi
grep -E '^bytes .*shortfall=1$' "$root/report"
reading "$(date +%s)" "$bytes" "$((files-1))"
if check > "$root/report"; then exit 1; fi
grep -E '^files .*shortfall=1$' "$root/report"
reading 1 "$bytes" "$files"
if check; then exit 1; fi
reading "$(date +%s)" "$bytes" "$files"
check
[[ "$(readlink "$root/site/current")" == live && -d "$root/site/rollback" ]]
# Реальное ограничение файловой системы при достаточной заявленной квоте аккаунта.
docker run --rm --tmpfs /stage:size=1m -v "$PWD/deploy/check-release-capacity.php:/check.php:ro" php:8.1-cli bash -eu -c '
  mkdir -p /stage/site /stage/.o100-deploy
  printf "{\"measuredAt\":%d,\"bytes\":999999999,\"files\":999999}" "$(date +%s)" > /stage/.o100-deploy/account-capacity.json
  if php /check.php /stage/site 2000000 10 > /tmp/report; then exit 1; fi
  grep -E "^bytes .*shortfall=[1-9][0-9]*$" /tmp/report
  [[ -z "$(ls -A /stage/site)" ]]
  mkdir -p /root/o100-test/site
  php /check.php /root/o100-test/site 1000 10 100000000 > /tmp/automatic
  grep -Fx "bytes required=1000 available=100000000 shortfall=0" /tmp/automatic
  if php /check.php /root/o100-test/site 1000 10 999 > /tmp/automatic; then exit 1; fi
  grep -E "^bytes .*shortfall=1$" /tmp/automatic
  if php /check.php /root/o100-test/site 1000 5000000 100000000 > /tmp/automatic; then exit 1; fi
  grep -E "^files .*shortfall=[1-9][0-9]*$" /tmp/automatic
  if php /check.php /stage/site 1000 10 100000000; then exit 1; fi
'
