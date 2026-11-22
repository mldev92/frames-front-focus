#!/usr/bin/env bash
set -Eeuo pipefail

controller=$(cd -- "$(dirname -- "$0")/.." && pwd)
required=$(python3 "$controller/scripts/release-capacity.py" "$@")
bytes=$(jq -er .bytes <<< "$required")
files=$(jq -er .files <<< "$required")
[[ "$PRODUCTION_ROOT" =~ ^/[a-zA-Z0-9_./-]+$ && "$bytes" =~ ^[0-9]+$ && "$files" =~ ^[0-9]+$ ]]

account_bytes=
if [[ -n "${BEGET_API_LOGIN:-}" && -n "${BEGET_API_PASSWORD:-}" ]] &&
    measured_bytes=$(python3 "$controller/scripts/beget-free-bytes.py") &&
    [[ "$measured_bytes" =~ ^[0-9]+$ ]]; then
  account_bytes=$measured_bytes
  echo 'Beget API returned a fresh account quota reading.'
else
  echo '::warning::Beget API quota unavailable. The host must have a verified quota reading less than five minutes old.'
fi

ssh -i ~/.ssh/optika-production -o BatchMode=yes -o StrictHostKeyChecking=yes \
  -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=2 \
  "$SSH_USER@$SSH_HOST" "php8.1 /dev/stdin '$PRODUCTION_ROOT' '$bytes' '$files' '$account_bytes'" \
  < "$controller/deploy/check-release-capacity.php"
