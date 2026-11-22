#!/usr/bin/env bash
# Настоящая квота inode на одноразовом ext4. Хостинг и ключи не используются.
set -Eeuo pipefail
export LC_ALL=C
[[ "$(id -u)" != 0 ]]
work=$(mktemp -d)
mountpoint="$work/fs"
attempt="$$-$RANDOM"
cleanup() {
    if mountpoint -q "$mountpoint"; then sudo umount "$mountpoint"; fi
    rm -rf -- "$work" "/tmp/o100-transfer-$attempt"
}
trap cleanup EXIT
mkdir "$mountpoint"
truncate -s 64M "$work/test.img"
mkfs.ext4 -q -F -O quota -E quotatype=usrquota "$work/test.img"
sudo mount -o loop,usrquota "$work/test.img" "$mountpoint"
sudo chown "$(id -u):$(id -g)" "$mountpoint"
if ! command -v setquota >/dev/null; then
    sudo apt-get -qq update && sudo apt-get -qq install -y quota
fi
root="$mountpoint/site"
export HOME="$mountpoint/home"
mkdir -p "$HOME" "$root/bitrix" "$root/o100_frontend_releases" "$work/fixture" "$work/wrappers"
releases="$root/o100_frontend_releases"
parent=$(printf '%040d' 1)
sha=$(printf '%040d' 2)
mkdir "$releases/$parent" "$releases/rollback" "$releases/foreign"
echo live > "$releases/$parent/index.html"
echo rollback > "$releases/rollback/index.html"
ln -s "$releases/$parent" "$root/o100_frontend_current"
echo routing > "$root/.htaccess"
routing=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
echo manifest > "$releases/$parent/release-manifest.json"
hash=$(sha256sum "$releases/$parent/release-manifest.json" | cut -d' ' -f1)
for n in $(seq 1 90); do
    mkdir "$releases/$parent/$n" "$work/fixture/$n"
    printf 'new\n' > "$work/fixture/$n/index.html"
done
transfer() { bash deploy/release-transfer.sh "$1" "$root" "$attempt" "$sha" "${@:2}"; }
export O100_PHP=php
printf '{"sha":"%s"}\n' "$parent" > "$mountpoint/.o100-backend-release.json"
tar -czf "$work/production-tools.tgz" -C "${O100_RELEASE_TOOLS:-.}" deploy/release.sh
tar -czf "$work/production-release.tgz" -C "$work/fixture" .
(cd "$work" && sha256sum production-release.tgz > production-release.tgz.sha256)
# После удаления первого каталога принудительно прерываем сам процесс уборки.
cat > "$work/wrappers/rm" <<'EOF'
#!/usr/bin/env bash
set -eu
[[ "$1" == -rf && "$2" == -- && "$3" == "$HOME"/o100-transfer-* ]]
/bin/rm -rf -- "$3"
kill -KILL "$PPID"
EOF
chmod +x "$work/wrappers/rm"
sudo setquota -u "$(id -u)" 0 0 0 145 "$mountpoint"
for mode in full delta; do
    transfer start
    tar -cf - -C "$work" production-tools.tgz production-release.tgz production-release.tgz.sha256 | transfer receive
    rsync_hash=$(sha256sum /usr/bin/rsync | cut -d' ' -f1)
    if transfer activate "$mode" "$parent" "$hash" "$parent" "$routing" "$rsync_hash" > "$work/log" 2>&1; then exit 1; fi
    grep -m1 'Disk quota exceeded' "$work/log"
    marker="$mountpoint/.o100-deploy/transfer-journal/$attempt.$sha"
    if PATH="$work/wrappers:$PATH" transfer finish; then exit 1; fi
    [[ -d "$marker" && ! -e "$HOME/o100-transfer-$attempt" && -d "/tmp/o100-transfer-$attempt" ]]
    transfer recover
    transfer recover
    [[ ! -e "$marker" && ! -e "$releases/.incoming-$attempt" && ! -e "/tmp/o100-transfer-$attempt" ]]
    [[ -z "$(find "$releases" -name '*.stage-*' -print -quit)" && ! -e "$releases/$sha" ]]
    [[ "$(readlink "$root/o100_frontend_current")" == "$releases/$parent" ]]
    [[ "$(cat "$root/o100_frontend_current/index.html")" == live && "$(cat "$releases/rollback/index.html")" == rollback ]]
    [[ -d "$releases/foreign" && "$(cat "$root/.htaccess")" == routing ]]
    echo "PASS: $mode hit EDQUOT before activation; recovery resumed interrupted cleanup."
done
