#!/usr/bin/env bash
set -Eeuo pipefail
source_root=${1:-/frontend}
php_bin=${O100_PHP:-php}
bash "$source_root/deploy/tar-extract.sh" check
scratch=$(mktemp -d "${TMPDIR:-/tmp}/o100-staging-test.XXXXXXXX")
trap 'rm -rf -- "$scratch"' EXIT
mkdir "$scratch/old" "$scratch/payload" "$scratch/stage" "$scratch/fresh"
printf 'same\n' > "$scratch/old/shared.txt"
cp "$scratch/old/shared.txt" "$scratch/payload/shared.txt"
printf 'old\n' > "$scratch/old/changed.txt"
printf 'new\n' > "$scratch/payload/changed.txt"
printf 'old revision\n' > "$scratch/old/.release-sha"
printf 'new revision\n' > "$scratch/payload/.release-sha"
mkdir "$scratch/payload/каталог с пробелом"
printf 'literal\n' > "$scratch/payload/каталог с пробелом/[x]*.txt"
"$php_bin" -r '
foreach(["old","payload"] as $folder) {
 $root=$argv[1]."/".$folder; $files=[];
 foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root,FilesystemIterator::SKIP_DOTS)) as $file) {
  if($file->isFile()) $files[substr($file->getPathname(),strlen($root)+1)]=hash_file("sha256",$file->getPathname());
 }
 file_put_contents($root."/release-manifest.json",json_encode(["files"=>$files],JSON_THROW_ON_ERROR));
}' "$scratch"
tar -czf "$scratch/archive.tgz" -C "$scratch/payload" .
for stage in stage fresh; do
 cp "$scratch/payload/release-manifest.json" "$scratch/$stage/release-manifest.json"
 previous="$scratch/old"
 if [[ "$stage" == fresh ]]; then previous="$scratch/no-previous"; fi
 "$php_bin" "$source_root/deploy/link-unchanged.php" "$scratch/$stage" "$previous" "$scratch/$stage.files"
 bash "$source_root/deploy/tar-extract.sh" extract "$scratch/archive.tgz" "$scratch/$stage" "$scratch/$stage.files"
 "$php_bin" -r '
 $m=json_decode(file_get_contents($argv[1]."/release-manifest.json"),true,512,JSON_THROW_ON_ERROR);
 foreach($m["files"] as $path=>$hash) if(hash_file("sha256",$argv[1]."/".$path)!==$hash) throw new RuntimeException("Extracted content mismatch");
 ' "$scratch/$stage"
done
[[ "$scratch/old/shared.txt" -ef "$scratch/stage/shared.txt" ]]
[[ ! "$scratch/old/changed.txt" -ef "$scratch/stage/changed.txt" ]]
[[ ! "$scratch/old/.release-sha" -ef "$scratch/stage/.release-sha" ]]
[[ "$(cat "$scratch/old/changed.txt")" == old ]]
[[ "$(cat "$scratch/old/.release-sha")" == 'old revision' ]]
cmp "$scratch/payload/release-manifest.json" "$scratch/stage/release-manifest.json"
# Изменённый исходный inode нельзя принять за проверенный неизменяемый файл.
mkdir "$scratch/drift"
cp "$scratch/payload/release-manifest.json" "$scratch/drift/release-manifest.json"
printf 'unexpected drift\n' > "$scratch/old/shared.txt"
if "$php_bin" -d display_errors=1 "$source_root/deploy/link-unchanged.php" "$scratch/drift" "$scratch/old" "$scratch/drift.files" >"$scratch/drift.log" 2>&1; then exit 1; fi
grep -q 'Previous release drift' "$scratch/drift.log"
echo 'PASS: first and incremental staging, shared inode preservation, changed files isolated, source drift rejected'
