import { useQuery } from "@tanstack/react-query";
import { adminActionClass, useAdminEditMode } from "@/lib/admin-edit-mode";
import type { CityCode } from "@/lib/store/city";

export function CatalogAdminActions({ sectionPath, city }: { sectionPath: string; city: CityCode }) {
  const editing = useAdminEditMode();
  const { data } = useQuery({
    queryKey: ["storefront-admin-catalog-sections", city],
    enabled: editing,
    retry: false,
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/store/catalog_sections.php?city=${city}`, { signal });
      if (!response.ok) throw new Error(`Catalog sections API returned ${response.status}`);
      const data = (await response.json()) as { city: string; sections: Array<{ id: number; path: string }> };
      if (data.city !== city || !Array.isArray(data.sections)) throw new Error("Invalid catalog sections response");
      return data.sections;
    },
  });
  const sectionUrl = `/catalog_${city === "nvk" ? "n" : "s"}/${sectionPath}/`;
  const sectionId = data?.find(({ path }) => path === sectionUrl)?.id;
  if (!editing || typeof sectionId !== "number" || !Number.isSafeInteger(sectionId) || sectionId < 1) return null;

  // Каталоги Битрикс: catalog_s — инфоблок 7, catalog_n — инфоблок 2.
  const catalog = `lang=ru&type=catalog&IBLOCK_ID=${city === "nvk" ? 2 : 7}`;
  const sectionActions = [
    { href: `iblock_section_edit.php?${catalog}&ID=${sectionId}`, label: "Редактировать раздел" },
    { href: `cat_product_list.php?${catalog}&find_section_section=${sectionId}`, label: "Товары раздела" },
    { href: `cat_product_edit.php?${catalog}&ID=0&IBLOCK_SECTION_ID=${sectionId}&filter_section=${sectionId}`, label: "Добавить товар" },
  ];

  return (
    <nav aria-label="Управление разделом" className="mb-4 flex flex-wrap gap-1 rounded-md border border-border bg-muted p-1">
      {sectionActions.map(({ href, label }) => (
        <a
          key={href}
          href={`/bitrix/admin/${href}`}
          target="_blank"
          rel="noopener"
          className={adminActionClass}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
