<?php
require __DIR__.'/../scripts/catalog-content-fingerprint.php';
$row=['ID'=>'1','NAME'=>'Frame','PRICE'=>'900.00','QUANTITY'=>'4','IBLOCK_SECTION_ID'=>'7','TIMESTAMP_X'=>'old','MODIFIED_BY'=>'1'];
$stamp=$row; $stamp['TIMESTAMP_X']='new'; $stamp['MODIFIED_BY']='2'; $stamp['SHOW_COUNTER']='100';
if (o100_catalog_row_signature($row)!==o100_catalog_row_signature($stamp)) throw new RuntimeException('Audit-only update changed fingerprint');
foreach (['NAME'=>'Updated','PRICE'=>'850.00','QUANTITY'=>'0','IBLOCK_SECTION_ID'=>'8'] as $field=>$value) {
    $changed=$row; $changed[$field]=$value;
    if (o100_catalog_row_signature($row)===o100_catalog_row_signature($changed)) throw new RuntimeException('Public content edit missed: '.$field);
}
echo "PASS: catalog fingerprint ignores audit churn and detects name, price, stock and section changes\n";
