#!/usr/bin/env bash
set -Eeuo pipefail
php /frontend/tests/catalog-fingerprint.php
root=/var/www/html
export O100_PHP=php O100_SMOKE_ORIGIN=http://127.0.0.1
mkdir -p "$root/bitrix" "$root/basket" "$root/order" "$root/auth" "$root/api/store" "$root/local/tools" /evidence
printf '%s\n' '<?php echo "LEGACY";' > "$root/index.php"
printf '%s\n' '<?php echo "BASKET";' > "$root/basket/index.php"
printf '%s\n' '<?php echo "ORDER";' > "$root/order/index.php"
printf '%s\n' '<?php echo "AUTH";' > "$root/auth/index.php"
printf '%s\n' '<?php echo isset($_GET["auth"]) ? ($_SERVER["REMOTE_USER"] ?? "MISSING") : "{}";' > "$root/api/store/csrf.php"
printf '%s\n' '<?php http_response_code(404); echo "LEGACY404";' > "$root/404.php"
printf '%s\n' '<?php if(str_contains($_SERVER["REQUEST_URI"],"/opravy/")){echo "CATALOG";}else{http_response_code(404);echo "LEGACY404";}' > "$root/bitrix/urlrewrite.php"
printf '%s\n' '<urlset />' > "$root/sitemap.xml"
printf '%s\n' '<?php http_response_code(404); header("X-Robots-Tag: noindex"); $file=$_SERVER["DOCUMENT_ROOT"]."/o100_frontend_current/404.html"; if(is_file($file)) readfile($file); else echo "404";' > "$root/local/tools/o100-frontend-404.php"
cat > "$root/local/tools/o100-product-fallback.php" <<'PHP'
<?php
// Воспроизводим старый Bitrix-handler: снятая карточка ошибочно уходит в категорию.
$reviewed=json_decode(file_get_contents('/frontend/deploy/reviewed-legacy-redirects.json'),true);
$path=rawurldecode(parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH));
if(in_array(rtrim($path,'/').'/', $reviewed['paths'],true)) { header('Location: /catalog_s/opravy/',true,301); exit; }
http_response_code(404); echo 'UNKNOWN_PRODUCT';
PHP
cat > "$root/.htaccess" <<'BASELINE'
Options -Indexes
DirectoryIndex index.php index.html
ErrorDocument 404 /404.php
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} robots.txt
RewriteCond %{DOCUMENT_ROOT}/robots.php -f
RewriteRule ^(.*)$ /robots.php [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-l
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /bitrix/urlrewrite.php [L]
BASELINE
cp "$root/.htaccess" /evidence/legacy.htaccess
mkdir -p /candidate/assets /candidate/catalog_s/opravy/deep-product /candidate/catalog_n/opravy/deep-product
for file in index.html _shell.html 404.html; do printf '%s\n' 'REACT' > "/candidate/$file"; done
printf '%s\n' 'SPB-CATALOG <a href="/catalog_s/opravy/deep-product/" data-product-id="1">Товар</a>' > /candidate/catalog_s/opravy/index.html
printf '%s\n' 'NVK-CATALOG <a href="/catalog_n/opravy/deep-product/" data-product-id="2">Товар</a>' > /candidate/catalog_n/opravy/index.html
printf '%s\n' 'DEEP-SPB' > /candidate/catalog_s/opravy/deep-product/index.html
printf '%s\n' 'DEEP-NVK' > /candidate/catalog_n/opravy/deep-product/index.html
printf '%s\n' 'ASSET' > /candidate/assets/test-hash.js
printf '%s\n' '<urlset />' > /candidate/sitemap.xml
printf '%s\n' 'User-agent: *' > /candidate/robots.txt
make_archive() {
  local sha=$1
  printf '%s\n' "$sha" > /candidate/.release-sha
  php <<'PHP'
<?php
$files=[];
foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator('/candidate',FilesystemIterator::SKIP_DOTS)) as $file) {
  $name=substr($file->getPathname(),11);
  if($file->isFile() && $name !== 'release-manifest.json') $files[$name]=hash_file('sha256',$file->getPathname());
}
$tools=[]; foreach(['production.htaccess','redirects.production.txt','release.sh','merge-routing.php','verify-release.php','link-unchanged.php'] as $name) $tools['deploy/'.$name]=hash_file('sha256','/frontend/deploy/'.$name);
$manifest=['templateFiles'=>$tools,'frontendSha'=>trim(file_get_contents('/candidate/.release-sha')),'backendSha'=>str_repeat('b',40),'backendFiles'=>['api/store/csrf.php'=>hash_file('sha256','/var/www/html/api/store/csrf.php')], 'routingBaseline'=>hash_file('sha256','/var/www/html/.htaccess'),'settings'=>['privateBeta'=>false,'fixtures'=>false,'virtualTryOn'=>false],'files'=>$files];
file_put_contents('/candidate/release-manifest.json',json_encode($manifest));
PHP
  tar -czf "/evidence/$sha.tgz" -C /candidate .
}
check() { local expected=$1 path=$2 actual; actual=$(curl -s -o /tmp/response -w '%{http_code}' "$O100_SMOKE_ORIGIN$path"); [[ "$actual" == "$expected" ]] || { echo "$path: expected $expected got $actual"; cat /tmp/response; exit 1; }; }
sha=1111111111111111111111111111111111111111
make_archive "$sha"
baseline=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
started=$SECONDS
if O100_TEST_FAIL_AFTER_SWAP=1 bash /frontend/deploy/release.sh deploy "$root" "$sha" "$baseline" "/evidence/$sha.tgz"; then echo 'Expected injected failure' >&2; exit 1; fi
cmp /evidence/legacy.htaccess "$root/.htaccess"
[[ ! -L "$root/o100_frontend_current" ]]
check 200 /order/
echo "First-launch automatic rollback: $((SECONDS-started)) seconds"
sha=2222222222222222222222222222222222222222
make_archive "$sha"
bash /frontend/deploy/release.sh deploy "$root" "$sha" "$baseline" "/evidence/$sha.tgz"
check 301 /catalog_s/
check 301 /catalog_n/
check 301 '/catalog_s/kontaktnye_linzy_/biofinity_6_sht/?utm_source=rehearsal'
curl -s -D /tmp/headers -o /dev/null "$O100_SMOKE_ORIGIN/catalog_s/kontaktnye_linzy_/biofinity_6_sht/?utm_source=rehearsal"
grep -q '/catalog_s/kontaktnye_linzy_/prozrachnye/biofinity_6_sht/?utm_source=rehearsal' /tmp/headers
curl -s -D /tmp/headers -o /dev/null "$O100_SMOKE_ORIGIN/blog/pochemyMi.php/?cutover_probe=1"
grep -Fq 'Location: https://optika100.com/o-nas/?cutover_probe=1#pochemu-my' /tmp/headers || { cat /tmp/headers; exit 1; }
check 404 /catalog_s/kontaktnye_linzy_/biofinity_6_sht/unrelated/
curl -s -H 'Authorization: Bearer rehearsal' "$O100_SMOKE_ORIGIN/api/store/csrf.php?auth=1" | grep -q 'Bearer rehearsal'
check 200 /catalog_s/opravy/deep-product/
grep -q DEEP-SPB /tmp/response
check 200 /catalog_n/opravy/deep-product/
check 200 /assets/test-hash.js
check 200 '/basket/?legacy=1'
grep -q BASKET /tmp/response
check 404 /o100_frontend_current/index.html
check 404 /%6f100_frontend_current/index.html
check 404 /o100_frontend_assets/test-hash.js
check 404 /unknown-path/
check 404 /catalog_s/opravy/unknown-product/
# Проверяем прежние ошибочные редиректы, query, отсутствие завершающего слеша и пробел.
while IFS= read -r path; do
  check 404 "$path"
  check 404 "$path?routing_probe=1"
  check 404 "${path%/}"
done < <(php -r '$m=json_decode(file_get_contents("/frontend/deploy/reviewed-legacy-redirects.json"),true); foreach($m["paths"] as $p) echo str_replace(" ","%20",$p),"\n";')
restored="$root/o100_frontend_current/catalog_s/kontaktnye_linzy_/prozrachnye/air_optix_aqua_6_sht"
mkdir -p "$restored"
printf '%s\n' 'RESTORED_PRODUCT' > "$restored/index.html"
check 200 /catalog_s/kontaktnye_linzy_/prozrachnye/air_optix_aqua_6_sht/
grep -q RESTORED_PRODUCT /tmp/response
rm "$restored/index.html"
baseline=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
if O100_TEST_FAIL_AFTER_SWAP=1 bash /frontend/deploy/update-routing.sh "$root" "$sha" "$baseline" aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa; then exit 1; fi
[[ "$(sha256sum "$root/.htaccess" | cut -d' ' -f1)" == "$baseline" ]]
bash /frontend/deploy/update-routing.sh "$root" "$sha" "$baseline" bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
[[ "$(cat "$root/o100_frontend_current/.release-sha")" == "$sha" ]]
echo 'PASS: 31 reviewed legacy paths return direct 404 with query/slash variants; restored static product returns 200; routing-only rollback and update preserve frontend'
cp "$root/.htaccess" /evidence/react.htaccess
sha=3333333333333333333333333333333333333333
make_archive "$sha"
baseline=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
if O100_TEST_FAIL_AFTER_SWAP=1 bash /frontend/deploy/release.sh deploy "$root" "$sha" "$baseline" "/evidence/$sha.tgz"; then exit 1; fi
[[ "$(readlink "$root/o100_frontend_current")" == "$root/o100_frontend_releases/2222222222222222222222222222222222222222" ]]
cmp /evidence/react.htaccess "$root/.htaccess"
check 200 /assets/test-hash.js
echo 'PASS: Apache redirects, deep links, private paths, native routes, 404, first and subsequent automatic rollback'

sha=4444444444444444444444444444444444444444
make_archive "$sha"
baseline=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
bash /frontend/deploy/release.sh deploy "$root" "$sha" "$baseline" "/evidence/$sha.tgz"
[[ "$(stat -c %i "$root/o100_frontend_current/index.html")" == "$(stat -c %i "$root/o100_frontend_releases/2222222222222222222222222222222222222222/index.html")" ]]
[[ "$(cat "$root/o100_frontend_releases/2222222222222222222222222222222222222222/.release-sha")" == 2222222222222222222222222222222222222222 ]]
bash /frontend/deploy/release.sh rollback "$root"
[[ "$(readlink "$root/o100_frontend_current")" == "$root/o100_frontend_releases/2222222222222222222222222222222222222222" ]]
cmp /evidence/react.htaccess "$root/.htaccess"
echo 'PASS: manual React-to-React rollback restores the previous release'

bash /frontend/deploy/release.sh rollback "$root"
cmp /evidence/legacy.htaccess "$root/.htaccess"
[[ ! -L "$root/o100_frontend_current" ]]
check 200 /assets/test-hash.js
check 200 /basket/
grep -q BASKET /tmp/response
echo 'PASS: manual rollback after failed update restores legacy; old assets retained'

# Категория отвечает 200, но её настоящая карточка ведёт в 404: выпуск обязан откатиться.
sed -i 's@/deep-product/@/missing-product/@g' /candidate/catalog_n/opravy/index.html
sha=5555555555555555555555555555555555555555
make_archive "$sha"
baseline=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
if bash /frontend/deploy/release.sh deploy "$root" "$sha" "$baseline" "/evidence/$sha.tgz"; then echo 'Broken product link was accepted' >&2; exit 1; fi
cmp /evidence/legacy.htaccess "$root/.htaccess"
[[ ! -L "$root/o100_frontend_current" ]]
echo 'PASS: broken Novokuznetsk card link automatically restores legacy'

# Дополнительная приёмка выполняется до снятия защиты откатом.
sed -i 's@/missing-product/@/deep-product/@g' /candidate/catalog_n/opravy/index.html
printf '%s\n' '<?php throw new RuntimeException("injected acceptance failure");' > /tmp/fail-acceptance.php
sha=6666666666666666666666666666666666666666
make_archive "$sha"
baseline=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
if O100_ACCEPTANCE_SCRIPT=/tmp/fail-acceptance.php bash /frontend/deploy/release.sh deploy "$root" "$sha" "$baseline" "/evidence/$sha.tgz"; then exit 1; fi
cmp /evidence/legacy.htaccess "$root/.htaccess"
[[ ! -L "$root/o100_frontend_current" ]]
echo 'PASS: extended acceptance failure automatically restores legacy'

# Имитируем отдачу старого robots перед управляемым блоком.
printf '%s\n' 'User-agent: *' 'Disallow: /catalog_n/' > "$root/shadow-robots.txt"
sed -i '/RewriteEngine On/a RewriteRule ^robots.txt$ /shadow-robots.txt [END]' "$root/.htaccess"
cp "$root/.htaccess" /evidence/shadow.htaccess
sha=7777777777777777777777777777777777777777
make_archive "$sha"
baseline=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
if bash /frontend/deploy/release.sh deploy "$root" "$sha" "$baseline" "/evidence/$sha.tgz"; then echo 'Shadow robots was accepted' >&2; exit 1; fi
cmp /evidence/shadow.htaccess "$root/.htaccess"
[[ ! -L "$root/o100_frontend_current" ]]
cp /evidence/legacy.htaccess "$root/.htaccess"
echo 'PASS: shadowing public robots automatically restores legacy'
