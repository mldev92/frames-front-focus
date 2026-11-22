#!/usr/bin/env bash
set -Eeuo pipefail
remote="$SSH_USER@$SSH_HOST"
[[ "$PRODUCTION_ROOT" =~ ^/[a-zA-Z0-9_./-]+$ ]]
ssh_opts=(-o BatchMode=yes -o StrictHostKeyChecking=yes -o ServerAliveInterval=20 -i ~/.ssh/optika-production)
remote_helper() {
  ssh "${ssh_opts[@]}" "$remote" "nice -n 15 php8.1 -f /dev/stdin -- '$PRODUCTION_ROOT' $*" < deploy/retain-release.php
}
if [[ "$1" == list ]]; then
  remote_helper list
  exit
fi
live=$(jq -er .live inventory.json)
[[ "$live" =~ ^[a-f0-9]{40}$ ]]
jq -r '.older | to_entries[] | [.key, .value] | @tsv' inventory.json > targets.tsv
if [[ "$1" == archive ]]; then
  [[ "$RECIPIENT" == ssh-ed25519\ * ]]
  mkdir encrypted
elif [[ "$1" == prune ]]; then
  # Проверяем скачанные файлы по описи, созданной до загрузки.
  if [[ -s targets.tsv ]]; then (cd restored && sha256sum --check ../stored.sha256); fi
  while read -r sha manifest; do
    [[ "$sha" =~ ^[a-f0-9]{40}$ && "$manifest" =~ ^[a-f0-9]{64}$ ]]
    remote_helper finish "$live" "$sha" "$manifest"
  done < <(jq -r '.pending | to_entries[] | [.key, .value] | @tsv' inventory.json)
else
  exit 2
fi
while read -r sha manifest; do
  [[ "$sha" =~ ^[a-f0-9]{40}$ && "$manifest" =~ ^[a-f0-9]{64}$ ]]
  if [[ "$1" == archive ]]; then
    release="$PRODUCTION_ROOT/o100_frontend_releases/$sha"
    ssh -n "${ssh_opts[@]}" "$remote" "set -o pipefail; cd '$release' && nice -n 15 tar --hard-dereference -cf - . | nice -n 15 gzip -1" > release.tgz
    python3 scripts/verify-retention-archive.py release.tgz "$sha" "$manifest" > "encrypted/$sha.json"
    age -r "$RECIPIENT" -o "encrypted/$sha.tgz.age" release.tgz
    rm -- release.tgz
  else
    remote_helper prune "$live" "$sha" "$manifest"
    curl --fail --silent --show-error --max-time 30 https://optika100.com/ --output /dev/null
  fi
done < targets.tsv
if [[ "$1" == archive ]]; then
  (cd encrypted && sha256sum -- *.age *.json) > stored.sha256
else
  remote_helper list > after.json
  jq -e --slurp '.[0].live == .[1].live and .[0].previous == .[1].previous and (.[1].older | length == 0) and (.[1].pending | length == 0)' inventory.json after.json
fi
