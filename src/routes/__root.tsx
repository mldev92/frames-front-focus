import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MessengerFAB } from "@/components/MessengerFAB";
import { useCart } from "@/lib/store/cart";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl">404</h1>
        <h2 className="mt-4 text-xl">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Возможно, вы перешли по устаревшей ссылке или страница была удалена.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-ink px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">Что-то пошло не так</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Попробуйте обновить страницу или вернитесь на главную.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-ink px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90"
          >
            Попробовать снова
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-border px-5 py-2.5 text-sm hover:bg-accent"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ОПТИКА 100% — оправы, солнцезащитные очки и контактные линзы" },
      {
        name: "description",
        content:
          "Сеть оптических салонов и интернет-магазин ОПТИКА 100%: оправы, солнцезащитные очки, контактные линзы, услуги офтальмолога.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Оправы, солнцезащитные очки, контактные линзы и услуги клиники зрения.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <CartDrawer />
      <MessengerFAB />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}
