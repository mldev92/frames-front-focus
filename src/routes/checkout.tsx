import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useCart, formatPrice } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Оформление заказа · ОПТИКА 100%" },
      { name: "description", content: "Оформите доставку и оплату вашего заказа." },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Контакты", "Доставка", "Оплата"];

function Checkout() {
  const [step, setStep] = useState(0);
  const { totals, lines, clear } = useCart();
  const { subtotal } = totals();

  const submit = () => {
    toast.success("Заказ оформлен! Мы свяжемся с вами в течение 30 минут.");
    clear();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-8 py-10">
      <h1 className="font-serif text-4xl mb-8">Оформление заказа</h1>

      {/* Stepper */}
      <ol className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-2 text-sm",
                i === step ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center text-xs",
                  i <= step
                    ? "bg-ink text-primary-foreground border-ink"
                    : "border-border",
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <span className="text-muted-foreground">·</span>}
          </li>
        ))}
      </ol>

      <div className="grid lg:grid-cols-[1fr_360px] gap-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 2) setStep(step + 1);
            else submit();
          }}
          className="space-y-6"
        >
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl">Контактные данные</h2>
              <Field label="Имя" required />
              <Field label="Телефон" type="tel" required />
              <Field label="E-mail" type="email" required />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl">Доставка</h2>
              <div className="space-y-2">
                {[
                  ["Самовывоз из салона", "Бесплатно"],
                  ["Курьер по СПб", "от 350 ₽"],
                  ["Почта России / СДЭК", "по тарифу"],
                ].map(([t, p]) => (
                  <label
                    key={t}
                    className="flex items-center gap-3 border border-border p-4 rounded-sm cursor-pointer hover:border-foreground"
                  >
                    <input type="radio" name="delivery" defaultChecked={t === "Курьер по СПб"} />
                    <div className="flex-1">{t}</div>
                    <div className="text-muted-foreground text-sm">{p}</div>
                  </label>
                ))}
              </div>
              <Field label="Адрес доставки" />
              <Field label="Комментарий" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-serif text-2xl">Оплата</h2>
              <div className="space-y-2">
                {["Картой онлайн", "СБП", "При получении"].map((m) => (
                  <label
                    key={m}
                    className="flex items-center gap-3 border border-border p-4 rounded-sm cursor-pointer hover:border-foreground"
                  >
                    <input type="radio" name="payment" defaultChecked={m === "Картой онлайн"} />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="border border-border px-5 py-3 rounded-sm"
              >
                Назад
              </button>
            )}
            <button
              type="submit"
              className="bg-ink text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90"
            >
              {step < 2 ? "Продолжить" : "Подтвердить заказ"}
            </button>
          </div>
        </form>

        <aside className="bg-surface p-6 rounded-sm h-fit">
          <h3 className="font-serif text-lg mb-4">Ваш заказ</h3>
          <div className="space-y-3 text-sm pb-4 border-b border-border">
            {lines.map((l) => (
              <div key={l.slug + (l.color ?? "")} className="flex justify-between gap-2">
                <span className="text-muted-foreground truncate">
                  {l.name} × {l.qty}
                </span>
                <span>{formatPrice(l.price * l.qty)}</span>
              </div>
            ))}
            {lines.length === 0 && (
              <Link to="/opravy" className="text-brand text-sm">
                Корзина пуста — в каталог
              </Link>
            )}
          </div>
          <div className="flex justify-between font-medium pt-4">
            <span>К оплате</span>
            <span className="font-serif text-xl">{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, type = "text", required }: { label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm mb-1.5">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        className="w-full bg-background border border-border rounded-sm px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand"
      />
    </label>
  );
}
