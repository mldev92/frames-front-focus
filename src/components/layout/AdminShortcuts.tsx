import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import type { ResolvedCatalogRoute } from "@/lib/catalog-route";

const shortcutsUrl = "/api/store/admin_shortcuts.php";
const linkClass = "inline-flex min-h-11 items-center px-2 underline underline-offset-4";

export function AdminShortcuts() {
  const { data: isAdmin, isError } = useQuery({
    queryKey: ["storefront-admin-session"],
    enabled: !import.meta.env.SSR,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch(shortcutsUrl, { cache: "no-store", signal });
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

  if (!isAdmin || isError) return null;

  return (
    <nav
      aria-label="Управление сайтом"
      className="flex flex-wrap items-center gap-x-2 border-b border-border bg-muted px-2 text-sm lg:px-8"
    >
      <a className={linkClass} href="/bitrix/admin/">
        Админка Битрикс
      </a>
      {typeof productId === "number" && Number.isSafeInteger(productId) && productId > 0 && (
        <a className={linkClass} href={`${shortcutsUrl}?productId=${productId}`}>
          Редактировать товар
        </a>
      )}
    </nav>
  );
}
