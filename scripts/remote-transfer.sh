#!/usr/bin/env bash
# Тело команды берётся из защищённого контроллера; stdin остаётся для архива или подписанной ссылки.
set -Eeuo pipefail
action=${1:?action}
shift
script=$(cat "$(dirname "$0")/../deploy/release-transfer.sh")
printf -v command ' %q' "$script" release-transfer "$action" "$PRODUCTION_ROOT" "$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT" "$FRONTEND_SHA" "$@"
exec ssh -T -i ~/.ssh/optika-production -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=15 \
  -o ServerAliveInterval=15 -o ServerAliveCountMax=4 "$SSH_USER@$SSH_HOST" "bash -c$command"
