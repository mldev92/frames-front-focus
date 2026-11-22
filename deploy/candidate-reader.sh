#!/usr/bin/env bash
# Команды отдельного SSH-ключа подготовки кандидата.
set -Eeuo pipefail
root=$(realpath "${1:?document root}")
current="$root/o100_frontend_current"
parent=$(cat "$current/.release-sha")
[[ "$parent" =~ ^[a-f0-9]{40}$ ]]
published=$(realpath "$current")
[[ "$published" == "$root/o100_frontend_releases/$parent" ]]
case ${SSH_ORIGINAL_COMMAND:-} in
  baseline)
    php8.1 -r '
      [$unused,$root,$parent]= $argv;
      $backend=json_decode(file_get_contents(dirname($root)."/.o100-backend-release.json"),true,512,JSON_THROW_ON_ERROR);
      echo json_encode(["parent"=>$parent,"manifest"=>hash_file("sha256",$root."/o100_frontend_current/release-manifest.json"),"routing"=>hash_file("sha256",$root."/.htaccess"),"backend"=>$backend],JSON_THROW_ON_ERROR),PHP_EOL;
    ' "$root" "$parent"
    ;;
  "pages $parent")
    cd "$published"
    find . -type f \( -name '*.html' -o -path './release-manifest.json' -o -path './robots.txt' -o -path './sitemap.xml' \) -print0 |
      tar -czf - --no-recursion --null -T -
    ;;
  *) exit 2 ;;
esac
