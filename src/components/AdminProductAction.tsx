import { Pencil } from "lucide-react";
import { adminActionClass, adminProductEditHref, useAdminEditMode } from "@/lib/admin-edit-mode";

export function AdminProductAction({ id, name }: { id?: number; name: string }) {
  const editing = useAdminEditMode();
  const href = adminProductEditHref(id);
  if (!editing || !href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={adminActionClass}
      aria-label={`Редактировать товар: ${name}`}
    >
      <Pencil className="size-4" aria-hidden="true" />
      Редактировать товар
    </a>
  );
}
