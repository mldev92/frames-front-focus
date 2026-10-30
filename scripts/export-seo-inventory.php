<?php
// Только CLI: полный снимок активных товаров из Bitrix, без фильтра наличия.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(2); }
$root = getenv('O100_DOCUMENT_ROOT') ?: '/home/t/tretya9f/wpoptik/public_html';
if (!is_dir($root . '/bitrix')) throw new RuntimeException('Invalid Bitrix root');
$_SERVER['DOCUMENT_ROOT'] = $root;
$_SERVER['HTTP_HOST'] = 'optika100.com';
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/store/catalog_sections.php';
require $root . '/api/store/_bootstrap.php';
require $root . '/api/store/_catalog_identity.php';
$out = ['version'=>1, 'generatedAt'=>gmdate('Y-m-d\TH:i:s\Z'), 'origin'=>'https://optika100.com',
    'source'=>'Bitrix ACTIVE=Y; no CATALOG_AVAILABLE filter', 'counts'=>[], 'products'=>[]];
foreach ([7=>'spb', 2=>'nvk'] as $iblock=>$city) {
    $filter = ['IBLOCK_ID'=>$iblock, 'ACTIVE'=>'Y'];
    $count = (int)CIBlockElement::GetList([], $filter, [], false, ['ID']);
    $activeSections = [];
    $sections = CIBlockSection::GetList([], ['IBLOCK_ID'=>$iblock, 'ACTIVE'=>'Y', 'GLOBAL_ACTIVE'=>'Y'], false, ['ID']);
    while ($section = $sections->Fetch()) $activeSections[(int)$section['ID']] = true;
    $rows = CIBlockElement::GetList(['ID'=>'ASC'], $filter, false, false, ['ID','IBLOCK_ID','IBLOCK_SECTION_ID','CODE','CATALOG_AVAILABLE']);
    $seen = 0;
    while ($row = $rows->Fetch()) {
        $identity = o_catalog_identity($row);
        $out['products'][] = ['id'=>(int)$row['ID'], 'city'=>$city, 'canonicalPath'=>$identity['canonicalPath'],
            'available'=>($row['CATALOG_AVAILABLE'] ?? 'N') === 'Y', 'sectionActive'=>isset($activeSections[(int)$row['IBLOCK_SECTION_ID']])];
        $seen++;
    }
    if ($seen !== $count || !$count) throw new RuntimeException('Incomplete inventory: ' . $city);
    $out['counts'][$city] = $count;
}
echo json_encode($out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), "\n";
