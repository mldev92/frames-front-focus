#!/usr/bin/env bash
set -Eeuo pipefail
# Извлекаем только отсутствующие файлы; существующие hard link не открываются tar.
extract_list() {
  local archive=$1 destination=$2 list=$3
  [[ -d "$destination" && -f "$list" ]] || return 2
  if [[ -s "$list" ]]; then
    tar -xzf "$archive" -C "$destination" --no-same-owner --no-recursion --no-wildcards --anchored --null -T "$list"
  fi
}
case ${1:-} in
  extract)
    [[ $# == 4 ]] || exit 2
    extract_list "$2" "$3" "$4"
    ;;
  check)
    # Поведенческая проверка настоящего tar, до создания staging и переключения.
    scratch=$(mktemp -d "${TMPDIR:-/tmp}/o100-tar-check.XXXXXXXX")
    trap 'rm -rf -- "$scratch"' EXIT
    mkdir "$scratch/old" "$scratch/payload" "$scratch/stage"
    printf 'original shared\n' > "$scratch/old/shared.txt"
    ln "$scratch/old/shared.txt" "$scratch/stage/shared.txt"
    printf 'must not overwrite shared inode\n' > "$scratch/payload/shared.txt"
    for name in 'changed.txt' 'literal [x]*.txt' '-C' 'товар с пробелом.txt'; do
      printf 'new content\n' > "$scratch/payload/$name"
      printf './%s\0' "$name" >> "$scratch/files"
    done
    printf 'old changed\n' > "$scratch/old/changed.txt"
    tar -czf "$scratch/archive.tgz" -C "$scratch/payload" .
    extract_list "$scratch/archive.tgz" "$scratch/stage" "$scratch/files"
    [[ "$scratch/old/shared.txt" -ef "$scratch/stage/shared.txt" ]]
    [[ "$(cat "$scratch/old/shared.txt")" == 'original shared' ]]
    [[ "$(cat "$scratch/old/changed.txt")" == 'old changed' ]]
    [[ ! "$scratch/old/changed.txt" -ef "$scratch/stage/changed.txt" ]]
    for name in 'changed.txt' 'literal [x]*.txt' '-C' 'товар с пробелом.txt'; do
      cmp "$scratch/payload/$name" "$scratch/stage/$name"
    done
    : > "$scratch/empty"
    extract_list "$scratch/archive.tgz" "$scratch/stage" "$scratch/empty"
    [[ "$(cat "$scratch/old/shared.txt")" == 'original shared' ]]
    echo 'PASS: tar exact-file extraction preserves hardlinks, literal names and empty lists'
    ;;
  *) exit 2 ;;
esac
