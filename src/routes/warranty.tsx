import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "Гарантия и обращения · ОПТИКА 100%" },
      {
        name: "description",
        content: "Как обратиться по вопросам качества, ремонта, обмена или возврата покупки.",
      },
    ],
    links: [{ rel: "canonical", href: "https://optika100.com/warranty/" }],
  }),
  component: WarrantyPage,
});

function WarrantyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Помощь</p>
      <h1 className="mt-3 font-serif text-4xl">Гарантия и обращения по качеству</h1>
      <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
        <p>
          Условия зависят от вида товара, изготовленных по рецепту линз и причины обращения.
          Мы проверим покупку и документы, после чего сообщим доступный вариант решения.
        </p>
        <p>
          Возьмите товар, комплектующие и подтверждение покупки в салон, где оформлялся заказ,
          либо заранее свяжитесь с нами. Не выполняйте самостоятельный ремонт до осмотра.
        </p>
        <p>
          Эта страница не ограничивает права покупателя, предусмотренные законодательством РФ.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/contacts" className="rounded-full bg-brand px-6 py-3 font-semibold text-white">
          Контакты салонов
        </Link>
        <Link to="/remont-ochkov" className="rounded-full border border-border px-6 py-3 font-semibold">
          Ремонт очков
        </Link>
      </div>
    </main>
  );
}
