import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tinkoff")({
  head: () => ({
    meta: [
      { title: "Рассрочка 0-0-3 от Т-Банка · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Купите очки, оправы или линзы в рассрочку 0-0-3 от Т-Банка. Без переплат, без процентов, на 3 месяца.",
      },
    ],
  }),
  component: TinkoffPage,
});

const BULLETS = [
  "0% процентная ставка — без переплат",
  "3 месяца рассрочки",
  "Сумма от 3 500 до 500 000 ₽",
  "Одобрение за несколько минут",
  "Доступно для граждан РФ от 18 до 70 лет",
];

const STEPS = [
  "Выберите оправы или линзы в каталоге Санкт-Петербурга",
  "Нажмите кнопку «Забронировать» или «в Корзину» на странице товара",
  "Заполните форму — мы свяжемся с вами для подтверждения",
  "Получите товар в салоне и оформите рассрочку на месте",
  "Сумма делится на 3 равных платежа, списывается автоматически",
];

function TinkoffPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 pb-16">
      {/* Hero */}
      <div
        className="mb-10 rounded-2xl bg-[#f5f5f5] p-10"
        style={{
          backgroundImage: "url('/tinkoff_bg_3.webp')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right bottom",
          backgroundSize: "auto 95%",
          paddingRight: "42%",
        }}
      >
        <img src="/icon_tbank.svg" alt="Т-Банк" className="mb-4 h-12 w-auto" />
        <h1 className="mb-6 text-4xl font-medium text-gray-900">
          Рассрочка от Т&#8209;Банка
        </h1>
        <ul className="space-y-2">
          {BULLETS.map((b) => (
            <li
              key={b}
              className="flex w-fit items-center gap-2.5 rounded-lg bg-white/85 px-3.5 py-2.5 text-sm"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFDD2D] text-xs font-bold text-gray-900">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Как оформить рассрочку в Т&#8209;Банке?
      </h2>
      <ul className="space-y-2.5">
        {STEPS.map((step, i) => (
          <li
            key={i}
            className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3.5 text-sm leading-relaxed"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFDD2D] text-xs font-bold text-gray-900">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
