import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AdminEditMode, adminActionClass, adminProductEditHref, adminShortcutsUrl } from "@/lib/admin-edit-mode";
import type { ResolvedCatalogRoute } from "@/lib/catalog-route";

const editModeKey = "o100-admin-edit-mode";

export function AdminShortcuts({ children }: { children: ReactNode }) {
  const [editing, setEditing] = useState(() => {
    try {
      return typeof window === "undefined" || window.sessionStorage.getItem(editModeKey) !== "off";
    } catch {
      return true;
    }
  });
  const { data: isAdmin, isError } = useQuery({
    queryKey: ["storefront-admin-session"],
    enabled: !import.meta.env.SSR,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch(adminShortcutsUrl, { cache: "no-store", signal });
      if (!response.ok) return false;
      const session = await response.json();
      return session?.isAdmin === true;
    },
  });
  const productId = useRouterState({
    select: ({ matches }) => {
      const route = matches.at(-1)?.loaderData as ResolvedCatalogRoute | undefined;
      return route?.kind === "product" ? route.data.product.id : undefined;
    },
  });
  const isHomepage = useRouterState({ select: (state) => state.location.pathname === "/" });
  const showToolbar = isAdmin === true && !isError;
  const editProductHref = adminProductEditHref(productId);

  function toggleEditing() {
    const next = !editing;
    setEditing(next);
    try {
      window.sessionStorage.setItem(editModeKey, next ? "on" : "off");
    } catch {
      // Режим правки доступен и при отключённом хранилище.
    }
  }

  return (
    <AdminEditMode.Provider value={showToolbar && editing}>
      {showToolbar && (
        <nav
          aria-label="Управление сайтом"
          className="flex flex-wrap items-center gap-1 border-b border-border bg-muted px-2 py-1 lg:px-8"
        >
          <a className={adminActionClass} href="/bitrix/admin/">Админка Битрикс</a>
          <button
            type="button"
            className={`${adminActionClass} border border-border aria-pressed:bg-background aria-pressed:font-semibold`}
            aria-pressed={editing}
            onClick={toggleEditing}
          >
            Режим правки
          </button>
          {editing && isHomepage && (
            <a className={adminActionClass} href="/bitrix/admin/o100_homepage.php">Редактировать главную</a>
          )}
          {editing && editProductHref && (
            <a className={adminActionClass} href={editProductHref}>Редактировать товар</a>
          )}
        </nav>
      )}
      {children}
    </AdminEditMode.Provider>
  );
}
