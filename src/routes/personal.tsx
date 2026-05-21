import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart, formatPrice } from "@/lib/store/cart";

export const Route = createFileRoute("/personal")({
  head: () => ({
    meta: [
      { title: "Личный кабинет · ОПТИКА 100%" },
      { name: "description", content: "Заказы, рецепты, адреса и личные данные." },
    ],
  }),
  component: Cabinet,
});

const TABS = ["Заказы", "Рецепты", "Адреса", "Профиль"] as const;

function Cabinet() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Заказы");
  const { saved } = useCart();

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
      <h1 className="font-serif text-4xl mb-2">Личный кабинет</h1>
      <p className="text-muted-foreground mb-8">Добро пожаловать!</p>

      <div className="grid lg:grid-cols-[200px_1fr] gap-10">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "text-left px-4 py-2 rounded-sm whitespace-nowrap text-sm",
                tab === t ? "bg-surface font-medium" : "hover:bg-surface/60",
              )}
            >
              {t}
            </button>
          ))}
          <Link
            to="/loyalty"
            className="text-left px-4 py-2 rounded-sm whitespace-nowrap text-sm text-brand hover:bg-surface/60 no-underline"
          >
            Программа лояльности →
          </Link>
          <Link
            to="/"
            className="text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Выйти
          </Link>
        </nav>

        <section>
          {tab === "Заказы" && (
            <div className="border border-border rounded-sm divide-y divide-border">
              {[
                ["#10245", "12.04.2025", "Доставлен", 17800],
                ["#10212", "28.03.2025", "В пути", 8900],
              ].map(([id, date, status, sum]) => (
                <div key={id} className="p-5 flex items-center gap-6">
                  <div>
                    <div className="font-medium">Заказ {id}</div>
                    <div className="text-xs text-muted-foreground">{date}</div>
                  </div>
                  <div className="text-sm flex-1">{status}</div>
                  <div className="font-medium">{formatPrice(sum as number)}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "Рецепты" && (
            <div className="bg-surface p-6 rounded-sm">
              <p className="text-muted-foreground">
                Здесь будут сохранены ваши рецепты. Получите рецепт после приёма у врача
                в нашей клинике.
              </p>
              <Link
                to="/uslugi/$slug"
                params={{ slug: "priem-vracha" }}
                className="mt-4 inline-block bg-ink text-primary-foreground px-5 py-2 rounded-sm"
              >
                Записаться к врачу
              </Link>
            </div>
          )}
          {tab === "Адреса" && (
            <div className="text-muted-foreground">У вас нет сохранённых адресов.</div>
          )}
          {tab === "Профиль" && (
            <form className="space-y-4 max-w-md">
              <input
                placeholder="Имя"
                className="w-full bg-background border border-border rounded-sm px-3 py-2.5"
              />
              <input
                placeholder="E-mail"
                className="w-full bg-background border border-border rounded-sm px-3 py-2.5"
              />
              <input
                placeholder="Телефон"
                className="w-full bg-background border border-border rounded-sm px-3 py-2.5"
              />
              <button
                type="button"
                className="bg-ink text-primary-foreground px-5 py-2.5 rounded-sm"
              >
                Сохранить
              </button>
            </form>
          )}
          {tab === "Заказы" && saved.length > 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              Отложенных товаров: {saved.length}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
