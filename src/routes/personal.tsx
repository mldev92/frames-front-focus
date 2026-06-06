import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Box,
  History,
  LogOut,
  Package,
  ShoppingBag,
  Star,
  UserRound,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/Reveal";
import { useCart, formatPrice } from "@/lib/store/cart";
import { getMe, getOrders, type CabinetOrder, type Me } from "@/lib/api/account";

export const Route = createFileRoute("/personal")({
  head: () => ({
    meta: [
      { title: "Личный кабинет · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Личный кабинет ОПТИКА 100%: текущие заказы, история покупок, личные данные и корзина.",
      },
      { property: "og:title", content: "Личный кабинет · ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Управляйте заказами, личными данными и покупками в одном месте.",
      },
      { property: "og:image", content: "/personal/hero.png" },
    ],
  }),
  component: PersonalPage,
});

const dashboardCards = [
  {
    title: (
      <>
        Текущие
        <br />
        заказы
      </>
    ),
    subtitle: "2 заказа в обработке",
    image: "/personal/orders.png",
    imagePosition: "center 40%",
    badge: 2,
    Icon: Package,
    action: "orders",
    href: "/personal/orders",
    search: { filter_current: "Y" as const },
  },
  {
    title: (
      <>
        Личные
        <br />
        данные
      </>
    ),
    subtitle: "Профиль и контакты",
    image: "/personal/profile.png",
    imagePosition: "center 30%",
    Icon: UserRound,
    action: "profile",
    href: "/personal/private",
  },
  {
    title: (
      <>
        История
        <br />
        заказов
      </>
    ),
    subtitle: "Все предыдущие покупки",
    image: "/personal/history.png",
    imagePosition: "center 55%",
    Icon: History,
    action: "history",
    href: "/personal/orders",
    search: { filter_history: "Y" as const },
  },
] as const;

function formatCartItems(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} товар`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} товара`;
  }
  return `${count} товаров`;
}

function formatOrders(count: number) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} заказ`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} заказа`;
  return `${count} заказов`;
}

function showComingSoon() {
  toast.info("Раздел скоро появится", {
    description: "Сейчас мы подключаем данные личного кабинета.",
  });
}

function PersonalPage() {
  const { totals } = useCart();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<CabinetOrder[]>([]);

  useEffect(() => setMounted(true), []);

  // Per-user data is fetched client-side so the Bitrix session cookie is sent.
  // Logged-out users are bounced to the native /auth/ page.
  useEffect(() => {
    let alive = true;
    (async () => {
      const profile = await getMe().catch(() => ({ authorized: false }) as Me);
      if (!alive) return;
      if (!profile.authorized) {
        window.location.assign("/auth/");
        return;
      }
      setMe(profile);
      const list = await getOrders("all").catch(() => []);
      if (alive) setOrders(list);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cartCount = mounted ? totals().count : 0;
  const currentCount = orders.filter((o) => o.state === "progress").length;
  const lastOrder = orders[0] ?? null;
  const greetingName = me?.firstName?.trim() || "в кабинете";
  const bonus = me?.bonus ?? 0;

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Введите корректный e-mail");
      return;
    }

    if (!consent) {
      toast.error("Подтвердите согласие на обработку данных");
      return;
    }

    toast.success("Спасибо за подписку!", {
      description: "Демо-форма не отправляет данные.",
    });
    setEmail("");
    setConsent(false);
  }

  return (
    <div className="bg-background">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-[13px] text-muted-foreground lg:px-8">
        <Link to="/" className="transition-colors hover:text-foreground">
          Главная
        </Link>
        <span className="text-[10px] opacity-50">›</span>
        <span className="font-medium text-brand">Личный кабинет</span>
      </nav>

      <section className="relative overflow-hidden bg-cream">
        <Reveal className="relative h-[240px] sm:h-[300px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[60%]">
          <img
            src="/personal/hero.png"
            alt="Очки, футляр и фирменный пакет ОПТИКА 100%"
            className="h-full w-full object-cover object-[60%_center]"
            loading="eager"
          />
          <div
            className="pointer-events-none absolute inset-0 lg:hidden"
            style={{
              background:
                "linear-gradient(to top, var(--cream) 0%, color-mix(in oklab, var(--cream) 60%, transparent) 30%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(to right, var(--cream) 0%, color-mix(in oklab, var(--cream) 88%, transparent) 9%, color-mix(in oklab, var(--cream) 42%, transparent) 24%, transparent 46%)",
            }}
          />
        </Reveal>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-7 sm:pb-14 lg:min-h-[480px] lg:px-8 lg:py-20">
          <Reveal className="max-w-[500px]">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Личный кабинет
            </div>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.02] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[66px]">
              Здравствуйте,
              <br />
              <span className="text-brand">{greetingName}</span>
            </h1>
            <p className="mt-5 max-w-[420px] text-base leading-relaxed text-muted-foreground sm:text-lg">
              Управляйте заказами, личными данными и покупками в одном месте.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4 sm:gap-6">
              {bonus > 0 ? (
                <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card py-2 pl-2.5 pr-5 shadow-xs">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-brand">
                    <Star className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="leading-tight">
                    <strong className="block font-serif text-[17px] font-semibold text-foreground">
                      {formatPrice(bonus)}
                    </strong>
                    <span className="text-[11.5px] text-muted-foreground">Бонусные баллы</span>
                  </span>
                </div>
              ) : null}

              <a
                href="/?logout=yes"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand no-underline"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} />
                Выйти
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {dashboardCards.map(
            (
              { title, subtitle, image, imagePosition, badge, Icon, action, href, ...card },
              index,
            ) => {
              // The "Текущие заказы" card reflects the live count.
              const isOrdersCard = action === "orders";
              const liveBadge = isOrdersCard ? currentCount || undefined : badge;
              const liveSubtitle = isOrdersCard
                ? `${formatOrders(currentCount)} в обработке`
                : subtitle;
              const content = (
                <>
                  <img
                    src={image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
                    style={{ objectPosition: imagePosition }}
                    loading="lazy"
                  />
                  <span className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/80" />
                  {liveBadge ? (
                    <span className="absolute right-5 top-5 z-10 grid h-9 min-w-9 place-items-center rounded-full bg-brand px-2 text-[15px] font-bold shadow-[0_4px_14px_rgba(201,64,64,0.45)]">
                      {liveBadge}
                    </span>
                  ) : null}
                  <span className="relative z-10 flex w-full flex-col p-7 sm:p-8">
                    <Icon
                      className="mb-4 h-6 w-6 text-white/80"
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                    <span className="font-serif text-[28px] font-semibold leading-[1.04] sm:text-[34px]">
                      {title}
                    </span>
                    <span className="mt-2.5 text-[14.5px] font-medium text-white/85">
                      {liveSubtitle}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-3.5 pt-7 text-[15px] font-semibold">
                      <span className="grid h-[46px] w-[46px] place-items-center rounded-full border border-white/60 transition-all group-hover:translate-x-0.5 group-hover:border-brand group-hover:bg-brand">
                        <ArrowRight className="h-5 w-5" strokeWidth={1.9} />
                      </span>
                      Перейти
                    </span>
                  </span>
                </>
              );

              return (
                <Reveal key={action} delay={index * 70}>
                  {href ? (
                    <Link
                      to={href}
                      search={"search" in card ? card.search : undefined}
                      className="group relative flex min-h-[280px] w-full overflow-hidden rounded-[20px] text-left text-white no-underline shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-h-[320px]"
                      aria-label={`${subtitle}. Открыть раздел`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={showComingSoon}
                      className="group relative flex min-h-[280px] w-full overflow-hidden rounded-[20px] text-left text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-h-[320px]"
                      aria-label={`${subtitle}. Открыть раздел`}
                    >
                      {content}
                    </button>
                  )}
                </Reveal>
              );
            },
          )}

          <Reveal delay={210}>
            <Link
              to="/basket"
              className="group relative flex min-h-[280px] w-full overflow-hidden rounded-[20px] text-left text-white no-underline shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:min-h-[320px]"
              aria-label="Открыть корзину"
            >
              <img
                src="/personal/cart.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_45%] transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/80" />
              {cartCount > 0 ? (
                <span className="absolute right-5 top-5 z-10 grid h-9 min-w-9 place-items-center rounded-full bg-brand px-2 text-[15px] font-bold shadow-[0_4px_14px_rgba(201,64,64,0.45)]">
                  {cartCount}
                </span>
              ) : null}
              <span className="relative z-10 flex w-full flex-col p-7 sm:p-8">
                <ShoppingBag
                  className="mb-4 h-6 w-6 text-white/80"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span className="font-serif text-[28px] font-semibold leading-[1.04] sm:text-[34px]">
                  Корзина
                </span>
                <span className="mt-2.5 text-[14.5px] font-medium text-white/85">
                  {cartCount > 0 ? formatCartItems(cartCount) : "Корзина пуста"}
                </span>
                <span className="mt-auto inline-flex items-center gap-3.5 pt-7 text-[15px] font-semibold">
                  <span className="grid h-[46px] w-[46px] place-items-center rounded-full border border-white/60 transition-all group-hover:translate-x-0.5 group-hover:border-brand group-hover:bg-brand">
                    <ArrowRight className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  Перейти
                </span>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {lastOrder ? (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:pb-16 lg:px-8 lg:pb-20">
          <Reveal className="grid items-center gap-7 rounded-[20px] border border-border bg-card p-6 shadow-sm sm:p-8 lg:grid-cols-[1.5fr_auto_auto_auto] lg:gap-10 lg:p-10">
            <div className="flex items-start gap-4 sm:gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand sm:h-[60px] sm:w-[60px]">
                <Box className="h-7 w-7" strokeWidth={1.6} />
              </span>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
                  Последний заказ
                </div>
                <div className="mt-2.5 font-serif text-2xl font-semibold leading-tight text-foreground">
                  Заказ №{lastOrder.id}
                </div>
                {lastOrder.items[0] ? (
                  <div className="mt-1 text-[15px] text-muted-foreground">
                    {lastOrder.items[0].name}
                    {lastOrder.itemCount > 1 ? ` и ещё ${lastOrder.itemCount - 1}` : ""}
                  </div>
                ) : null}
                <div className="mt-3 text-sm text-foreground">
                  Статус:{" "}
                  <strong
                    className={
                      lastOrder.state === "canceled"
                        ? "font-semibold text-brand"
                        : lastOrder.state === "done"
                          ? "font-semibold text-success"
                          : "font-semibold text-foreground"
                    }
                  >
                    {lastOrder.stateLabel}
                  </strong>
                </div>
              </div>
            </div>

            <div className="flex gap-8 sm:gap-12 lg:contents">
              <div>
                <div className="text-xs uppercase tracking-[0.04em] text-muted-foreground">
                  Дата заказа
                </div>
                <div className="mt-1 whitespace-nowrap font-serif text-xl font-semibold text-foreground">
                  {lastOrder.date}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.04em] text-muted-foreground">
                  Сумма
                </div>
                <div className="mt-1 whitespace-nowrap font-serif text-xl font-semibold text-foreground">
                  {formatPrice(lastOrder.total)}
                </div>
              </div>
            </div>

            <Link
              to="/personal/orders"
              search={lastOrder.state === "progress" ? { filter_current: "Y" } : { filter_history: "Y" }}
              className="inline-flex items-center justify-center rounded-full border-[1.5px] border-brand bg-card px-7 py-3.5 text-sm font-semibold text-brand transition-all hover:-translate-y-0.5 hover:bg-brand hover:text-white"
            >
              Подробнее о заказе
            </Link>
          </Reveal>
        </section>
      ) : null}

      <section className="-mb-24 bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-4 py-14 md:grid-cols-2 md:gap-16 lg:px-8 lg:py-20">
          <Reveal>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Будьте в курсе
            </div>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-foreground sm:text-[42px]">
              Подпишитесь на новости
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Получайте информацию о новинках, акциях и специальных предложениях первыми.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <form className="flex flex-col gap-4" onSubmit={handleNewsletterSubmit} noValidate>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="personal-newsletter-email">
                  Ваш e-mail
                </label>
                <input
                  id="personal-newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Ваш e-mail"
                  className="min-w-0 flex-1 rounded-full border border-border bg-card px-6 py-4 text-[15px] text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                />
                <button
                  type="submit"
                  className="rounded-full bg-brand px-8 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                >
                  Подписаться
                </button>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  className="mt-0.5 h-[17px] w-[17px] shrink-0 accent-brand"
                />
                <span>
                  Я согласен на обработку{" "}
                  <Link
                    to="/politika-konfidentsialnosti"
                    className="text-brand underline underline-offset-2"
                  >
                    персональных данных
                  </Link>
                </span>
              </label>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
