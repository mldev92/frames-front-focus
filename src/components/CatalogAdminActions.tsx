import { useQuery } from "@tanstack/react-query";
import { adminActionClass, adminShortcutsUrl, useAdminEditMode } from "@/lib/admin-edit-mode";
import { getCatalogSections } from "@/lib/api/bitrix";
import type { CityCode } from "@/lib/store/city";

const sectionActions = [
  { action: "edit", label: "Редактировать раздел" },
  { action: "products", label: "Товары раздела" },
  { action: "add", label: "Добавить товар" },
] as const;

export function CatalogAdminActions({ sectionPath, city }: { sectionPath: string; city: CityCode }) {
  const editing = useAdminEditMode();
  const { data } = useQuery({
    queryKey: ["storefront-admin-catalog-sections", city],
    enabled: editing,
    retry: false,
    staleTime: 60_000,
    queryFn: ({ signal }) => getCatalogSections(city, signal),
  });
  const sectionUrl = `/catalog_${city === "nvk" ? "n" : "s"}/${sectionPath}/`;
  const sectionId = data?.find(({ path }) => path === sectionUrl)?.id;
  if (!editing || typeof sectionId !== "number" || !Number.isSafeInteger(sectionId) || sectionId < 1) return null;

  return (
    <nav aria-label="Управление разделом" className="mb-4 flex flex-wrap gap-1 rounded-md border border-border bg-muted p-1">
      {sectionActions.map(({ action, label }) => (
        <a
          key={action}
          href={`${adminShortcutsUrl}?sectionId=${sectionId}&action=${action}`}
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
