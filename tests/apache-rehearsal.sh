#!/usr/bin/env bash
set -Eeuo pipefail
root=/var/www/html
export O100_PHP=php O100_SMOKE_ORIGIN=http://127.0.0.1
mkdir -p "$root/bitrix" "$root/basket" "$root/order" "$root/auth" "$root/api/store" "$root/local/tools" /evidence
printf '%s\n' '<?php echo "LEGACY";' > "$root/index.php"
printf '%s\n' '<?php echo "BASKET";' > "$root/basket/index.php"
printf '%s\n' '<?php echo "ORDER";' > "$root/order/index.php"
printf '%s\n' '<?php echo "AUTH";' > "$root/auth/index.php"
printf '%s\n' '<?php echo "{}";' > "$root/api/store/csrf.php"
printf '%s\n' '<?php http_response_code(404); echo "LEGACY404";' > "$root/404.php"
printf '%s\n' '<?php if(str_contains($_SERVER["REQUEST_URI"],"/opravy/")){echo "CATALOG";}else{http_response_code(404);echo "LEGACY404";}' > "$root/bitrix/urlrewrite.php"
printf '%s\n' '<urlset />' > "$root/sitemap.xml"
printf '%s\n' '<?php http_response_code(404); header("X-Robots-Tag: noindex"); $file=$_SERVER["DOCUMENT_ROOT"]."/o100_frontend_current/404.html"; if(is_file($file)) readfile($file); else echo "404";' > "$root/local/tools/o100-frontend-404.php"
printf '%s\n' '<?php http_response_code(404); echo "UNKNOWN_PRODUCT";' > "$root/local/tools/o100-product-fallback.php"
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
printf '%s\n' 'SPB-CATALOG' > /candidate/catalog_s/opravy/index.html
printf '%s\n' 'NVK-CATALOG' > /candidate/catalog_n/opravy/index.html
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
$manifest=['frontendSha'=>trim(file_get_contents('/candidate/.release-sha')),'backendSha'=>str_repeat('b',40),'backendFiles'=>['api/store/csrf.php'=>hash_file('sha256','/var/www/html/api/store/csrf.php')], 'routingBaseline'=>hash_file('sha256','/var/www/html/.htaccess'),'settings'=>['privateBeta'=>false,'fixtures'=>false,'virtualTryOn'=>false],'files'=>$files];
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
check 200 /catalog_s/opravy/deep-product/
grep -q DEEP-SPB /tmp/response
check 200 /catalog_n/opravy/deep-product/
check 200 /assets/test-hash.js
check 200 '/basket/?legacy=1'
grep -q BASKET /tmp/response
check 404 /o100_frontend_current/index.html
check 404 /unknown-path/
check 404 /catalog_s/opravy/unknown-product/
cp "$root/.htaccess" /evidence/react.htaccess
sha=3333333333333333333333333333333333333333
make_archive "$sha"
baseline=$(sha256sum "$root/.htaccess" | cut -d' ' -f1)
if O100_TEST_FAIL_AFTER_SWAP=1 bash /frontend/deploy/release.sh deploy "$root" "$sha" "$baseline" "/evidence/$sha.tgz"; then exit 1; fi
[[ "$(readlink "$root/o100_frontend_current")" == "$root/o100_frontend_releases/2222222222222222222222222222222222222222" ]]
cmp /evidence/react.htaccess "$root/.htaccess"
check 200 /assets/test-hash.js
echo 'PASS: Apache redirects, deep links, private paths, native routes, 404, first and subsequent automatic rollback'

bash /frontend/deploy/release.sh rollback "$root"
cmp /evidence/legacy.htaccess "$root/.htaccess"
[[ ! -L "$root/o100_frontend_current" ]]
check 200 /assets/test-hash.js
check 200 /basket/
grep -q BASKET /tmp/response
echo 'PASS: manual rollback after failed update restores legacy; old assets retained'
