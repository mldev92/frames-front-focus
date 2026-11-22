#!/usr/bin/env bash
# Выполняется на хостинге. Журнал позволяет повторить уборку после потери SSH или остановки runner.
set -Eeuo pipefail
action=${1:?action}
root=$(realpath "${2:?document root}")
attempt=${3:?run and attempt}
sha=${4:?frontend sha}
shift 4
[[ "$attempt" =~ ^[0-9]+-[0-9]+$ && "$sha" =~ ^[a-f0-9]{40}$ ]]
releases="$root/o100_frontend_releases"
journal="$(dirname "$root")/.o100-deploy/transfer-journal"
[[ -d "$root/bitrix" && -d "$releases" && ! -L "$releases" ]]
umask 077
mkdir -p "$journal"
exec 7<"$journal"
flock -w 60 7
record="$journal/$attempt.$sha"
upload="$HOME/o100-transfer-$attempt"
scratch="/tmp/o100-transfer-$attempt"
incoming="$releases/.incoming-$attempt"
clean() {
    local marker=$1 name run rev pidfile pid
    name=${marker##*/}
    [[ -d "$marker" && ! -L "$marker" && "$name" =~ ^([0-9]+-[0-9]+)\.([a-f0-9]{40})$ ]]
    run=${BASH_REMATCH[1]}
    rev=${BASH_REMATCH[2]}
    # Сначала каталоги, запись журнала удаляется последней; повторный вызов идемпотентен.
    rm -rf -- "$HOME/o100-transfer-$run" "/tmp/o100-transfer-$run" "$releases/.incoming-$run"
    for pidfile in "$marker"/pid-*; do
        [[ -e "$pidfile" ]] || continue
        pid=${pidfile##*/pid-}
        [[ "$pid" =~ ^[0-9]+$ ]]
        rm -rf -- "$releases/$rev.stage-$pid"
        rm -- "$pidfile"
    done
    rmdir -- "$marker"
}
case "$action" in
    recover)
        for marker in "$journal"/*; do
            [[ -e "$marker" ]] || continue
            clean "$marker"
        done ;;
    finish)
        if [[ -e "$record" ]]; then clean "$record"; fi ;;
    start)
        for path in "$upload" "$scratch" "$incoming"; do
            [[ ! -e "$path" && ! -L "$path" ]] || exit 3
        done
        mkdir "$record"
        mkdir "$upload" "$scratch" ;;
    receive)
        [[ -d "$record" ]]
        tar -xf - -C "$upload" --no-same-owner ;;
    download)
        [[ -d "$record" && "$1" =~ ^[a-f0-9]{64}$ ]]
        cd "$scratch"
        curl --silent --show-error --fail --proto '=https' --max-time 900 --output transfer.zip --config -
        echo "$1  transfer.zip" | sha256sum -c -
        unzip -q transfer.zip changes.rsync.xz
        rm -- transfer.zip
        xz -d changes.rsync.xz ;;
    activate)
        [[ -d "$record" ]]
        mode=$1
        parent=$2
        hash=$3
        backend=$4
        routing=$5
        [[ "$parent" =~ ^[a-f0-9]{40}$ && "$hash" =~ ^[a-f0-9]{64}$ && "$backend" =~ ^[a-f0-9]{40}$ && "$routing" =~ ^[a-f0-9]{64}$ ]]
        cd "$upload"
        tar -xzf production-tools.tgz
        if [[ "$mode" == full ]]; then
            sha256sum -c production-release.tgz.sha256
            args=(deploy "$root" "$sha" "$routing" production-release.tgz)
        else
            [[ "$mode" == delta && "$6" =~ ^[a-f0-9]{64}$ ]]
            echo "$hash  $releases/$parent/release-manifest.json" | sha256sum -c -
            echo "$6  /usr/bin/rsync" | sha256sum -c -
            umask 022
            mkdir "$incoming"
            cp -rl "$releases/$parent/." "$incoming/"
            /usr/bin/rsync -rcz --delete --no-whole-file --protocol=30 --read-batch="$scratch/changes.rsync" "$incoming/"
            args=(deploy-code-only "$root" "$sha" "$routing" "$incoming" --adopt-upload)
        fi
        # exec сохраняет PID для привязки временного каталога release.sh к журналу.
        touch "$record/pid-$$"
        export O100_EXPECTED_FRONTEND="$parent" O100_EXPECTED_PARENT_MANIFEST="$hash" O100_EXPECTED_BACKEND="$backend"
        export O100_SMOKE_ORIGIN=https://optika100.com
        umask 022
        exec bash deploy/release.sh "${args[@]}" ;;
    *) exit 2 ;;
esac
