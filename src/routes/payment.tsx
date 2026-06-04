import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Home,
  MapPin,
  PackageCheck,
  Smartphone,
  Store,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Оплата и получение · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Оплата заказов ОПТИКА 100% наличными, банковской картой и онлайн. Доставка СДЭК до пункта выдачи или адреса, самовывоз из салона и отправка после полной оплаты.",
      },
      { property: "og:title", content: "Оплата и получение · ОПТИКА 100%" },
      {
        property: "og:description",
        content:
          "Удобная оплата и получение заказов ОПТИКА 100%: СДЭК, самовывоз, наличные, карты и онлайн-оплата.",
      },
      { property: "og:image", content: "/payment/payment-hero.png" },
    ],
  }),
  component: PaymentPage,
});

type IconItem = {
  title: string;
  text?: string;
  Icon: LucideIcon;
};

const paymentMethods: IconItem[] = [
  { title: "Наличные", Icon: Banknote },
  { title: "Банковские карты", Icon: CreditCard },
  { title: "Онлайн оплата", Icon: Smartphone },
];

const deliveryCards = [
  {
    title: "СДЭК с доставкой до пункта выдачи заказов",
    image: "/payment/cdek-pickup.png",
    alt: "Пункт выдачи заказов СДЭК",
    Icon: MapPin,
  },
  {
    title: "СДЭК с доставкой до адреса",
    image: "/payment/cdek-courier.png",
    alt: "Курьерская доставка СДЭК до адреса",
    Icon: Home,
  },
  {
    title: "Самовывоз",
    image: "/payment/salon-pickup.png",
    alt: "Салон ОПТИКА 100% для самовывоза заказа",
    Icon: Store,
  },
];

const promoItems = [
  "СДЭК до пункта выдачи или до адреса",
  "Самовывоз из салона на Кирочной 17",
  "Оплата наличными, картой и онлайн",
  "Доставка после полной оплаты заказа",
];

const callouts: IconItem[] = [
  {
    title: "Стоимость доставки рассчитывается при оформлении заказа.",
    Icon: Truck,
  },
  {
    title: "Доставка осуществляется после полной оплаты заказа.",
    Icon: CheckCircle2,
  },
];

function PaymentPage() {
  return (
    <div className="bg-background">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-[13px] text-muted-foreground lg:px-8">
        <Link to="/" className="transition-colors hover:text-foreground">
          Главная
        </Link>
        <span className="text-[10px] opacity-50">›</span>
        <span className="font-medium text-brand">Оплата и получение</span>
      </nav>

      <section className="relative overflow-hidden bg-cream">
        <Reveal className="relative h-[300px] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[58%]">
          <img
            src="/payment/payment-hero.png"
            alt="Оплата и получение заказа в ОПТИКА 100%"
            className="h-full w-full object-cover"
            style={{ filter: "brightness(0.78) contrast(1.06) saturate(0.94)" }}
            loading="eager"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--cream) 0%, color-mix(in oklab, var(--cream) 58%, transparent) 24%, transparent 58%), linear-gradient(to top, rgba(30, 24, 18, 0.32) 0%, rgba(30, 24, 18, 0.14) 32%, transparent 62%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 hidden md:block"
            style={{
              background:
                "linear-gradient(to right, var(--cream) 0%, color-mix(in oklab, var(--cream) 88%, transparent) 9%, color-mix(in oklab, var(--cream) 38%, transparent) 20%, transparent 31%)",
            }}
          />
        </Reveal>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:min-h-[520px] md:py-20 lg:px-8">
          <Reveal className="max-w-[480px]">
            <div className="text-xs font-semibold uppercase text-brand">Доставка и оплата</div>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.06] text-foreground sm:text-5xl lg:text-6xl">
              Оплата и получение<span className="text-brand">.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              Оплата товара принимается наличными, банковскими картами и онлайн.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {paymentMethods.map(({ title, Icon }) => (
                <div
                  key={title}
                  className="flex min-w-[118px] flex-col items-center gap-3 rounded-2xl border border-border bg-card px-5 py-5 text-center shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-6 w-6" strokeWidth={1.6} />
                  </div>
                  <span className="text-[13px] font-semibold leading-snug text-foreground">
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="flex overflow-hidden bg-brand text-white"
        aria-label="Акции и доставка"
      >
        <div className="z-10 flex shrink-0 items-center gap-2 bg-black/15 px-4 py-3 text-xs font-semibold sm:px-6 sm:text-[13px]">
          <Truck className="h-[18px] w-[18px]" strokeWidth={1.75} />
          <span>
            Доставка по всей России
            <small className="hidden text-[10px] font-normal uppercase opacity-75 sm:block">
              Бесплатно от 5 000 ₽
            </small>
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-center overflow-hidden">
          <div className="payment-promo-track flex whitespace-nowrap">
            {[...promoItems, ...promoItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="inline-flex items-center gap-4 px-7 py-3 text-[13px] font-medium"
              >
                <span>{item}</span>
                <span className="h-1 w-1 rounded-full bg-white/45" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <Reveal className="mb-10">
          <div className="text-xs font-semibold uppercase text-brand">Способы доставки</div>
          <h2 className="mt-4 border-b border-border pb-5 font-serif text-3xl font-semibold leading-tight text-foreground lg:text-5xl">
            Доставляем:
          </h2>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deliveryCards.map(({ title, image, alt, Icon }, index) => (
            <Reveal
              key={title}
              as="article"
              delay={index * 80}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-cream">
                <img
                  src={image}
                  alt={alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center rounded-full bg-card text-brand shadow-md">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="text-lg font-semibold leading-snug text-foreground">{title}</h3>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4">
          {callouts.map(({ title, Icon }, index) => (
            <Reveal
              key={title}
              delay={index * 80}
              className="flex items-center gap-4 rounded-2xl border border-border bg-cream/70 px-5 py-5 transition-transform hover:-translate-y-0.5 sm:px-7"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                <Icon className="h-[22px] w-[22px]" strokeWidth={1.6} />
              </div>
              <p className="m-0 text-sm font-medium leading-relaxed text-foreground sm:text-base">
                {title}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="text-xs font-semibold uppercase text-brand">Готовы оформить заказ?</div>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
              Выберите удобный способ получения при оформлении.
            </h2>
          </div>
          <a
            href="/catalog_s/opravy/"
            className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            Перейти в каталог
          </a>
        </div>
      </section>
    </div>
  );
}
