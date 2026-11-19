import { createContext, useContext } from "react";

export const AdminEditMode = createContext(false);
export const adminShortcutsUrl = "/api/store/admin_shortcuts.php";
export const adminActionClass =
  "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm hover:bg-accent hover:underline";

export function useAdminEditMode() {
  return useContext(AdminEditMode);
}

export function adminProductEditHref(id: number | undefined) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0
    ? `${adminShortcutsUrl}?productId=${id}`
    : undefined;
}
