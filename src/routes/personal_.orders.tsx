import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  CircleX,
  FileText,
  Info,
  RotateCcw,
  Truck,
  Eye,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/Reveal";
import { authUrl, IS_PRIVATE_BETA } from "@/lib/runtime";
import { cn } from "@/lib/utils";
import { formatPrice, useCart } from "@/lib/store/cart";
import {
  cancelOrder,
  getMe,
  getOrders,
  type CabinetOrder,
} from "@/lib/api/account";
import type { Product } from "@/data/types";

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

const filters: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "progress", label: "В обработке" },
  { value: "done", label: "Выполненные" },
];

const primaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-brand bg-brand px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90";
const secondaryButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-border bg-card px-6 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-brand hover:text-brand";

const UNPAID_NOTE =
  "Проверьте, пожалуйста, состав товаров в корзине перед оплатой — оплата является окончательным подтверждением выбора Вами товаров, в т.ч. товаров, добавленных менеджером магазина по согласованию с Вами в телефонном разговоре.";

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

function OrderCard({
  order,
  index,
  onCancelled,
}: {
  order: CabinetOrder;
  index: number;
  onCancelled: (id: string) => void;
}) {
  const isDone = order.state === "done";
  const isCanceled = order.state === "canceled";
  const navigate = useNavigate();
  const cartAdd = useCart((s) => s.add);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);

  const paid = order.payment?.paid ?? false;
  const shipped = order.shipment?.shipped ?? false;

  function repeat() {
    if (!order.items.length) {
      toast.info("В заказе нет позиций для повтора");
      return;
    }
    for (const item of order.items) {
      const product = {
        slug: item.slug ?? `order-${order.id}-${item.name}`,
        name: item.name,
        brand: item.brand ?? "",
        price: item.price,
        images: [item.img ?? ""],
      } as unknown as Product;
      cartAdd(product, {
        qty: item.qty,
        image: item.img ?? undefined,
        openDrawer: false,
      });
    }
    toast.success("Товары добавлены в корзину");
    void navigate({ to: "/basket" });
  }

  async function cancel() {
    setBusy(true);
    const res = await cancelOrder(order.id);
    setBusy(false);
    if (res.ok) {
      toast.success("Заказ отменён");
      onCancelled(order.id);
    } else {
      toast.error(res.error ?? "Не удалось отменить заказ");
    }
  }

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
            <strong className="font-semibold text-foreground">{formatPrice(order.total)}</strong>
          </span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] font-semibold tracking-[0.02em]",
            isDone
              ? "bg-success/10 text-success"
              : isCanceled
                ? "bg-surface text-muted-foreground"
                : "bg-brand/10 text-brand",
          )}
        >
          <span
            className={cn(
              "h-[7px] w-[7px] rounded-full",
              isDone ? "bg-success" : isCanceled ? "bg-foreground/40" : "bg-brand",
            )}
          />
          {order.stateLabel}
        </span>
      </header>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {order.payment ? (
          <section className="pb-6">
            <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Оплата
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              <div className="text-base font-semibold leading-snug text-foreground">
                {order.payment.title}
              </div>
              <StatusBadge
                status={paid ? "success" : "danger"}
                label={paid ? "Оплачено" : "Не оплачено"}
                Icon={paid ? Check : AlertCircle}
              />
            </div>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground">
              {paid ? (
                <>
                  Оплачено по счёту: <strong>{formatPrice(order.payment.sum)}</strong>
                  {order.payment.date ? ` · ${order.payment.date}` : ""}
                </>
              ) : (
                <>
                  Сумма к оплате по счёту: <strong>{formatPrice(order.payment.sum)}</strong>
                </>
              )}
            </p>
            {!paid && !isCanceled ? (
              <div className="mt-3 flex gap-2.5 rounded-xl border border-border bg-foreground/[0.035] px-4 py-3 text-[12.5px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" strokeWidth={1.9} />
                <span>{UNPAID_NOTE}</span>
              </div>
            ) : null}
          </section>
        ) : null}

        {order.shipment ? (
          <section className={cn(order.payment ? "border-t border-border pt-6" : "")}>
            <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Доставка
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              <div className="text-base font-semibold leading-snug text-foreground [&_strong]:font-semibold">
                {order.shipment.title}
              </div>
              <StatusBadge
                status={shipped ? "success" : "danger"}
                label={shipped ? "Отгружено" : "Не отгружено"}
                Icon={shipped ? Check : Truck}
              />
            </div>
            <div className="my-3 flex flex-wrap items-center gap-3">
              <span className="text-[13.5px] text-muted-foreground">Статус отгрузки:</span>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-medium",
                  shipped
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border bg-surface text-foreground",
                )}
              >
                <span
                  className={cn("h-[7px] w-[7px] rounded-full", shipped ? "bg-success" : "bg-brand")}
                />
                {order.shipment.statusChip}
              </span>
            </div>
            {order.shipment.deliveryLine ? (
              <p className="text-[14.5px] leading-relaxed text-muted-foreground">
                {order.shipment.deliveryLine}
              </p>
            ) : null}
          </section>
        ) : null}

        {expanded && order.items.length ? (
          <section className="mt-6 border-t border-border pt-6">
            <div className="mb-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Состав заказа
            </div>
            <ul className="flex flex-col gap-3">
              {order.items.map((item, i) => (
                <li key={`${item.slug ?? item.name}-${i}`} className="flex items-center gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface">
                    {item.img ? (
                      <img src={item.img} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" strokeWidth={1.6} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium leading-tight text-foreground">
                      {item.name}
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {item.qty} шт · {formatPrice(item.price)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center gap-3 border-t border-border bg-cream/50 px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={primaryButton}
        >
          <Eye className="h-4 w-4" strokeWidth={2} />
          {expanded ? "Скрыть состав" : "Подробнее о заказе"}
        </button>
        <button type="button" onClick={repeat} className={primaryButton}>
          <RotateCcw className="h-4 w-4" strokeWidth={2} />
          Повторить заказ
        </button>
        <span className="hidden flex-1 sm:block" />
        {order.payment?.receiptUrl ? (
          <a
            href={order.payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(secondaryButton, "no-underline")}
          >
            <FileText className="h-4 w-4" strokeWidth={2} />
            Скачать чек
          </a>
        ) : null}
        {order.canCancel && !IS_PRIVATE_BETA ? (
          <button type="button" onClick={cancel} disabled={busy} className={secondaryButton}>
            <CircleX className="h-4 w-4" strokeWidth={2} />
            {busy ? "Отмена…" : "Отменить заказ"}
          </button>
        ) : null}
      </footer>
    </Reveal>
  );
}

function OrdersPage() {
  const { filter_current: filterCurrent, filter_history: filterHistory } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [orders, setOrders] = useState<CabinetOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>(
    filterHistory === "Y" ? "done" : filterCurrent === "Y" ? "progress" : "all",
  );

  useEffect(() => {
    if (filterHistory === "Y") setFilter("done");
    else if (filterCurrent === "Y") setFilter("progress");
    else setFilter("all");
  }, [filterCurrent, filterHistory]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await getMe().catch(() => ({ authorized: false }) as Awaited<ReturnType<typeof getMe>>);
      if (!alive) return;
      if (!me.authorized) {
        window.location.assign(authUrl());
        return;
      }
      const list = await getOrders("all").catch(() => []);
      if (!alive) return;
      setOrders(list);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

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

  function handleCancelled(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, state: "canceled", stateLabel: "Отменён", canCancel: false }
          : o,
      ),
    );
  }

  const visibleOrders = useMemo(
    () =>
      filter === "all"
        ? orders
        : orders.filter((o) => (filter === "progress" ? o.state === "progress" : o.state !== "progress")),
    [orders, filter],
  );

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
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Загружаем ваши заказы…</div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-[20px] border border-border bg-card px-6 py-16 text-center">
            <p className="text-lg font-medium text-foreground">Заказов пока нет</p>
            <p className="mt-2 text-muted-foreground">
              Когда вы оформите заказ, он появится здесь.
            </p>
            <Link
              to="/catalog_s/$category"
              params={{ category: "opravy" }}
              className="mt-6 inline-flex rounded-full border-[1.5px] border-brand bg-brand px-7 py-3 text-sm font-semibold text-white no-underline transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {visibleOrders.map((order, index) => (
              <OrderCard
                key={order.id}
                order={order}
                index={index}
                onCancelled={handleCancelled}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
