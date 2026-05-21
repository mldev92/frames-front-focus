import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/o-nas")({
  head: () => ({
    meta: [
      { title: "О компании · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "ОПТИКА 100% — сеть оптических салонов в Санкт-Петербурге с собственной клиникой и онлайн-магазином.",
      },
      { property: "og:title", content: "О компании · ОПТИКА 100%" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="bg-surface">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 py-20 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-brand mb-4">
            О компании
          </div>
          <h1 className="font-serif text-4xl lg:text-6xl leading-tight">
            Зрение — главное чувство. Мы заботимся о нём с 2005 года.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 lg:px-8 py-16 prose prose-neutral">
        <p className="text-lg text-muted-foreground">
          ОПТИКА 100% — сеть оптических салонов в Санкт-Петербурге. У нас работают
          врачи-офтальмологи, оптики и мастера по ремонту, а ассортимент включает оправы и
          линзы ведущих мировых брендов.
        </p>
        <p className="mt-6 text-muted-foreground">
          Мы открыли первый салон на Кирочной в 2005 году и с тех пор выросли в сеть из
          нескольких салонов и интернет-магазина. Сегодня нам доверяют тысячи клиентов в
          Санкт-Петербурге.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-12 grid md:grid-cols-3 gap-8 text-center">
        {[
          ["20+", "лет опыта"],
          ["50 000+", "довольных клиентов"],
          ["3", "салона в СПб"],
        ].map(([n, l]) => (
          <div key={l} className="bg-surface p-8 rounded-sm">
            <div className="font-serif text-5xl text-brand">{n}</div>
            <div className="mt-2 text-muted-foreground">{l}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 lg:px-8 py-16 text-center">
        <h2 className="font-serif text-3xl">Наши ценности</h2>
        <div className="mt-8 grid sm:grid-cols-3 gap-6 text-left">
          {[
            ["Профессионализм", "Только сертифицированные врачи и оптики."],
            ["Качество", "Линзы ZEISS, Essilor, Hoya и оправы мировых брендов."],
            ["Забота", "Гарантия и сервис на весь срок носки."],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="font-serif text-lg">{t}</div>
              <div className="text-sm text-muted-foreground mt-1">{d}</div>
            </div>
          ))}
        </div>
        <Link
          to="/contacts"
          className="mt-10 inline-block bg-ink text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90"
        >
          Адреса салонов
        </Link>
      </section>
    </div>
  );
}
