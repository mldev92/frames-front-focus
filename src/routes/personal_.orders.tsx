import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Check, CircleX, FileText, Info, RotateCcw, Truck, Eye } from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/personal_/orders")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { filter_current?: "Y"; filter_history?: "Y" } => ({
    filter_current: search.filter_current === "Y" ? "Y" : undefined,
    filter_history: search.filter_history === "Y" ? "Y" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Мои заказы · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Текущие и выполненные заказы в личном кабинете ОПТИКА 100%: оплата, доставка и статусы.",
      },
      { property: "og:title", content: "Мои заказы · ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Следите за оплатой, доставкой и статусом заказов ОПТИКА 100%.",
      },
    ],
  }),
  component: OrdersPage,
});

type OrderFilter = "all" | "progress" | "done";
type OrderState = Exclude<OrderFilter, "all">;

type Order = {
  id: string;
  date: string;
  itemSummary: string;
  total: string;
  state: OrderState;
  stateLabel: string;
  paymentTitle: string;
  paymentBadge: string;
  paymentStatus: "danger" | "success";
  paymentLine: React.ReactNode;
  note?: string;
  shippingTitle: React.ReactNode;
  shippingBadge: string;
  shippingStatus: "danger" | "success";
  shippingChip: string;
  deliveryLine: string;
  secondaryAction: "cancel" | "receipt";
};

const filters: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "progress", label: "В обработке" },
  { value: "done", label: "Выполненные" },
];

const orders: Order[] = [
  {
    id: "6195",
    date: "08.01.2026",
    itemSummary: "1 товар",
    total: "21 900 ₽",
    state: "progress",
    stateLabel: "В обработке",
    paymentTitle: "Счёт №6195/1 от 08.01.2026, наличными или по карте при выдаче товара",
    paymentBadge: "Не оплачено",
    paymentStatus: "danger",
    paymentLine: (
      <>
        Сумма к оплате по счёту: <strong>21 900 ₽</strong>
      </>
    ),
    note: "Проверьте, пожалуйста, состав товаров в корзине перед оплатой — оплата является окончательным подтверждением выбора Вами товаров, в т.ч. товаров, добавленных менеджером магазина по согласованию с Вами в телефонном разговоре.",
    shippingTitle: (
      <>
        Отгрузка №6195/2, стоимость доставки <strong>0 ₽</strong>
      </>
    ),
    shippingBadge: "Не отгружено",
    shippingStatus: "danger",
    shippingChip: "Ожидает обработки",
    deliveryLine:
      "Служба доставки: Санкт-Петербург — самовывоз из салона «Оптика 100%», ул. Кирочная, 17 (метро Чернышевская)",
    secondaryAction: "cancel",
  },
  {
    id: "6041",
    date: "19.12.2025",
    itemSummary: "2 товара",
    total: "14 380 ₽",
    state: "done",
    stateLabel: "Выполнен",
    paymentTitle: "Счёт №6041/1 от 19.12.2025, оплата онлайн картой",
    paymentBadge: "Оплачено",
    paymentStatus: "success",
    paymentLine: (
      <>
        Оплачено по счёту: <strong>14 380 ₽</strong> · 19.12.2025
      </>
    ),
    shippingTitle: (
      <>
        Отгрузка №6041/2, стоимость доставки <strong>350 ₽</strong>
      </>
    ),
    shippingBadge: "Отгружено",
    shippingStatus: "success",
    shippingChip: "Доставлен 23.12.2025",
    deliveryLine: "Служба доставки: Курьерская доставка по Санкт-Петербургу",
    secondaryAction: "receipt",
  },
];

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-brand bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-border bg-card px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-brand hover:text-brand";

function demoAction(title: string, description: string) {
  toast.info(title, { description });
}

function StatusBadge({
  status,
  label,
  Icon,
}: {
  status: "danger" | "success";
  label: string;
  Icon: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold",
        status === "success"
          ? "border-success/30 bg-success/10 text-success"
          : "border-brand/25 bg-brand-50 text-brand",
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.3} />
      {label}
    </span>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const isDone = order.state === "done";

  return (
    <Reveal
      as="article"
      delay={index * 80}
      className="overflow-hidden rounded-[20px] border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-cream px-5 py-5 sm:px-8">
        <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
          <h2 className="font-serif text-xl font-semibold leading-tight tracking-[-0.01em] text-foreground sm:text-[23px]">
            Заказ <span className="text-brand">№{order.id}</span> от {order.date}
          </h2>
          <span className="text-[14.5px] text-muted-foreground">
            {order.itemSummary} на сумму{" "}
            <strong className="font-semibold text-foreground">{order.total}</strong>
          </span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-semibold tracking-[0.02em]",
            isDone ? "bg-success/10 text-success" : "bg-brand/10 text-brand",
          )}
        >
          <span
            className={cn("h-[7px] w-[7px] rounded-full", isDone ? "bg-success" : "bg-brand")}
          />
          {order.stateLabel}
        </span>
      </header>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        <section className="pb-6">
          <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Оплата
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="text-base font-semibold leading-snug text-foreground">
              {order.paymentTitle}
            </div>
            <StatusBadge
              status={order.paymentStatus}
              label={order.paymentBadge}
              Icon={order.paymentStatus === "success" ? Check : AlertCircle}
            />
          </div>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
            {order.paymentLine}
          </p>
          {order.note ? (
            <div className="mt-3 flex gap-2.5 rounded-xl border border-border bg-foreground/[0.035] px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.9} />
              <span>{order.note}</span>
            </div>
          ) : null}
        </section>

        <section className="border-t border-border pt-6">
          <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Доставка
          </div>
          <div className="flex flex-wrap items-center gap-3.5">
            <div className="text-base font-semibold leading-snug text-foreground [&_strong]:font-semibold">
              {order.shippingTitle}
            </div>
            <StatusBadge
              status={order.shippingStatus}
              label={order.shippingBadge}
              Icon={order.shippingStatus === "success" ? Check : Truck}
            />
          </div>
          <div className="my-3 flex flex-wrap items-center gap-3">
            <span className="text-[13.5px] text-muted-foreground">Статус отгрузки:</span>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium",
                isDone
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-border bg-surface text-foreground",
              )}
            >
              <span
                className={cn("h-[7px] w-[7px] rounded-full", isDone ? "bg-success" : "bg-brand")}
              />
              {order.shippingChip}
            </span>
          </div>
          <p className="text-[14.5px] leading-relaxed text-muted-foreground">
            {order.deliveryLine}
          </p>
        </section>
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-border bg-cream/50 px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={() =>
            demoAction(
              "Детали заказа скоро появятся",
              "Подробный состав заказа будет доступен после подключения кабинета к Bitrix.",
            )
          }
          className={primaryButton}
        >
          <Eye className="h-4 w-4" strokeWidth={2} />
          Подробнее о заказе
        </button>
        <button
          type="button"
          onClick={() =>
            demoAction(
              "Повтор заказа пока недоступен",
              "Функция будет подключена вместе с реальными заказами пользователя.",
            )
          }
          className={primaryButton}
        >
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          Повторить заказ
        </button>
        <span className="hidden flex-1 sm:block" />
        {order.secondaryAction === "cancel" ? (
          <button
            type="button"
            onClick={() =>
              demoAction(
                "Отмена заказа пока недоступна",
                "Для изменения заказа свяжитесь с менеджером ОПТИКА 100%.",
              )
            }
            className={secondaryButton}
          >
            <CircleX className="h-4 w-4" strokeWidth={2} />
            Отменить заказ
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              demoAction(
                "Чек пока недоступен",
                "Загрузка чеков появится после подключения истории заказов.",
              )
            }
            className={secondaryButton}
          >
            <FileText className="h-4 w-4" strokeWidth={2} />
            Скачать чек
          </button>
        )}
      </footer>
    </Reveal>
  );
}

function OrdersPage() {
  const { filter_current: filterCurrent, filter_history: filterHistory } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filter, setFilter] = useState<OrderFilter>(
    filterHistory === "Y" ? "done" : filterCurrent === "Y" ? "progress" : "all",
  );

  useEffect(() => {
    if (filterHistory === "Y") {
      setFilter("done");
    } else if (filterCurrent === "Y") {
      setFilter("progress");
    } else {
      setFilter("all");
    }
  }, [filterCurrent, filterHistory]);

  function selectFilter(nextFilter: OrderFilter) {
    setFilter(nextFilter);
    void navigate({
      search:
        nextFilter === "done"
          ? { filter_history: "Y" }
          : nextFilter === "progress"
            ? { filter_current: "Y" }
            : {},
      replace: true,
    });
  }

  const visibleOrders =
    filter === "all" ? orders : orders.filter((order) => order.state === filter);

  return (
    <div className="bg-background">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-[13px] text-muted-foreground lg:px-8">
        <Link to="/" className="transition-colors hover:text-foreground">
          Главная
        </Link>
        <span className="text-[10px] opacity-50">›</span>
        <Link to="/personal" className="transition-colors hover:text-foreground">
          Личный кабинет
        </Link>
        <span className="text-[10px] opacity-50">›</span>
        <span className="font-medium text-brand">Мои заказы</span>
      </nav>

      <section className="mx-auto max-w-7xl px-4 pt-2 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-7">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Личный кабинет
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-[1.04] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[52px]">
              Мои <span className="text-brand">заказы</span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Фильтр заказов">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => selectFilter(item.value)}
                aria-pressed={filter === item.value}
                className={cn(
                  "rounded-full border px-[18px] py-2.5 text-[13.5px] font-medium transition-all",
                  filter === item.value
                    ? "border-ink bg-ink text-background"
                    : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-9 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="flex flex-col gap-6">
          {visibleOrders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))}
        </div>

        <Reveal className="mt-8 text-center text-sm text-muted-foreground">
          Показаны заказы за последние 6 месяцев ·{" "}
          <button
            type="button"
            onClick={() =>
              demoAction(
                "История заказов скоро появится",
                "Полная история будет доступна после подключения данных пользователя.",
              )
            }
            className="font-semibold text-brand underline underline-offset-2"
          >
            Вся история заказов
          </button>
        </Reveal>
      </section>
    </div>
  );
}
