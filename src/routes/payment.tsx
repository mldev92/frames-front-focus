import { createFileRoute } from "@tanstack/react-router";
import { Truck, CreditCard, Store, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Оплата и доставка · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Способы оплаты и доставки заказов ОПТИКА 100%: курьер, самовывоз из салонов, оплата картой и рассрочка.",
      },
      { property: "og:title", content: "Оплата и доставка · ОПТИКА 100%" },
    ],
  }),
  component: PaymentPage,
});

const delivery = [
  {
    icon: Truck,
    title: "Курьерская доставка",
    text: "По Санкт-Петербургу и Новокузнецку — 1–2 дня. По России — СДЭК и Почта России, 3–7 дней.",
  },
  {
    icon: Store,
    title: "Самовывоз из салона",
    text: "Бесплатно. Заберите заказ в любом из наших салонов после уведомления о готовности.",
  },
  {
    icon: CreditCard,
    title: "Оплата",
    text: "Банковской картой онлайн, наличными или картой при получении, рассрочка через Т-Банк.",
  },
  {
    icon: RotateCcw,
    title: "Возврат и обмен",
    text: "14 дней на возврат товара надлежащего качества при сохранении упаковки и вида.",
  },
];

function PaymentPage() {
  return (
    <div>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h1 className="font-serif text-4xl lg:text-5xl">Оплата и доставка</h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Удобные способы получить и оплатить заказ — онлайн или в салоне.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 lg:px-8 py-16 grid sm:grid-cols-2 gap-8">
        {delivery.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4">
            <Icon className="h-6 w-6 text-brand shrink-0 mt-1" />
            <div>
              <h2 className="font-serif text-xl">{title}</h2>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
