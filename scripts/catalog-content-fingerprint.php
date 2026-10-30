<?php
// Только хеши каталога: цены, остатки, свойства и справочники не экспортируются.
function o100_catalog_row_signature(array $row, array $ignore=[]): string {
    // 1С обновляет служебные даты даже при неизменных публичных значениях.
    foreach (array_merge(['TIMESTAMP_X','DATE_CREATE','CREATED_BY','MODIFIED_BY','TMP_ID','SHOW_COUNTER','SHOW_COUNTER_START'],$ignore) as $column) unset($row[$column]);
    ksort($row);
    return hash('sha256', json_encode($row, JSON_THROW_ON_ERROR));
}
function o100_catalog_content_fingerprint(): array {
    global $DB;
    $tables = [];
    $digest = function (string $name, string $sql, array $ignore = []) use ($DB, &$tables): void {
        $rows = $DB->Query($sql);
        $hashes = [];
        while ($row = $rows->Fetch()) {
            $hashes[] = o100_catalog_row_signature($row,$ignore);
        }
        // Порядок SQL без ORDER BY не является частью содержимого.
        sort($hashes, SORT_STRING);
        $tables[$name] = ['rows'=>count($hashes), 'sha256'=>hash('sha256', implode('', $hashes))];
    };
    $iblocks = [2, 7, (int)O_OFFER_IBLOCK];
    $directories = [];
    foreach ($iblocks as $iblockId) {
    $properties = CIBlockProperty::GetList(['ID'=>'ASC'], ['IBLOCK_ID'=>$iblockId]);
    while ($property = $properties->Fetch()) {
        if (!empty($property['LINK_IBLOCK_ID'])) $iblocks[] = (int)$property['LINK_IBLOCK_ID'];
        $settings = $property['USER_TYPE_SETTINGS'];
        if (is_string($settings)) $settings = unserialize($settings, ['allowed_classes'=>false]);
        if (is_array($settings) && !empty($settings['TABLE_NAME'])) $directories[$settings['TABLE_NAME']] = true;
    }
    }
    $iblocks = array_values(array_unique($iblocks));
    sort($iblocks);
    $ids = implode(',', $iblocks);
    $digest('elements', "SELECT * FROM b_iblock_element WHERE IBLOCK_ID IN ($ids)", ['SHOW_COUNTER','SHOW_COUNTER_START']);
    $digest('sections', "SELECT * FROM b_iblock_section WHERE IBLOCK_ID IN ($ids)");
    $digest('iblocks', "SELECT * FROM b_iblock WHERE ID IN ($ids)");
    $digest('properties', "SELECT * FROM b_iblock_property WHERE IBLOCK_ID IN ($ids)");
    $digest('enums', "SELECT v.* FROM b_iblock_property_enum v JOIN b_iblock_property p ON p.ID=v.PROPERTY_ID WHERE p.IBLOCK_ID IN ($ids)");
    $digest('propertyValues', "SELECT v.* FROM b_iblock_element_property v JOIN b_iblock_element e ON e.ID=v.IBLOCK_ELEMENT_ID WHERE e.IBLOCK_ID IN ($ids)");
    $digest('sectionMembership', "SELECT v.* FROM b_iblock_section_element v JOIN b_iblock_element e ON e.ID=v.IBLOCK_ELEMENT_ID WHERE e.IBLOCK_ID IN ($ids)");
    foreach (['b_catalog_product'=>'ID', 'b_catalog_price'=>'PRODUCT_ID', 'b_catalog_store_product'=>'PRODUCT_ID'] as $table=>$column) {
        $digest($table, "SELECT v.* FROM $table v JOIN b_iblock_element e ON e.ID=v.$column WHERE e.IBLOCK_ID IN ($ids)");
    }
    // Метаданные изображений и правил скидок тоже влияют на публичную карточку.
    foreach (['b_file','b_catalog_discount','b_catalog_group','b_catalog_store'] as $table) $digest($table, "SELECT * FROM $table");
    $versions = $DB->Query("SELECT ID, VERSION FROM b_iblock WHERE ID IN ($ids)");
    while ($iblock = $versions->Fetch()) {
        if ((int)$iblock['VERSION'] !== 2) continue;
        foreach (['s','m'] as $type) {
            $table = 'b_iblock_element_prop_' . $type . (int)$iblock['ID'];
            $digest($table, "SELECT * FROM $table");
        }
    }
    foreach (array_keys($directories) as $table) {
        if (!preg_match('/^[a-zA-Z0-9_]+$/D', $table)) throw new RuntimeException('Invalid catalog directory');
        $digest($table, "SELECT * FROM `$table`");
    }
    ksort($tables);
    return ['version'=>2, 'sha256'=>hash('sha256', json_encode($tables, JSON_THROW_ON_ERROR)), 'sources'=>$tables];
}
