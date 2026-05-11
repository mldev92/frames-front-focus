import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Eye, Glasses, Wrench } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/categories";
import { bestsellers, newArrivals } from "@/data/products";
import { articles } from "@/data/articles";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ОПТИКА 100% — оправы, очки и контактные линзы в Санкт-Петербурге" },
      {
        name: "description",
        content:
          "Интернет-магазин и салоны ОПТИКА 100%: оправы, солнцезащитные очки, контактные линзы Acuvue, CooperVision, Bausch+Lomb. Подбор и диагностика.",
      },
      {
        property: "og:title",
        content: "ОПТИКА 100% — оправы, очки и контактные линзы в Санкт-Петербурге",
      },
      {
        property: "og:description",
        content:
          "Большой выбор оправ и линз, услуги клиники зрения, салоны в центре Санкт-Петербурга.",
      },
    ],
  }),
  component: HomePage,
});

const SERVICE_ICONS = [Calendar, Eye, Glasses, Wrench];
const SERVICE_LIST = [
  { slug: "priem-vracha", title: "Запись к врачу" },
  { slug: "diagnostika", title: "Диагностика зрения" },
  { slug: "podbor-ochkov", title: "Подбор очков" },
  { slug: "remont", title: "Ремонт очков" },
];

function HomePage() {
  const hits = bestsellers();
  const news = newArrivals();
  const recent = articles.slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-brand mb-4">
              Новая коллекция · 2025
            </div>
            <h1 className="font-serif text-5xl lg:text-7xl leading-[1.05]">
              Очки, в которых хочется жить.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              Современные оправы, профессиональный подбор и линзы мировых брендов в
              салонах ОПТИКА 100% и онлайн.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/opravy"
                className="inline-flex items-center gap-2 bg-ink text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90"
              >
                Посмотреть оправы <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/uslugi/priem-vracha"
                className="inline-flex items-center gap-2 border border-foreground px-6 py-3 rounded-sm hover:bg-accent"
              >
                Записаться к врачу
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/5] bg-accent rounded-sm overflow-hidden">
            <img
              src="https://picsum.photos/seed/hero-optika/900/1100"
              alt="Модель в оправе из новой коллекции"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl lg:text-4xl">Каталог</h2>
          <Link
            to="/opravy"
            className="hidden md:inline-flex items-center gap-1 text-sm hover:text-brand"
          >
            Все категории <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <a
              key={c.slug}
              href={c.href}
              className="group relative aspect-[3/4] bg-surface rounded-sm overflow-hidden"
            >
              <img
                src={c.image}
                alt={c.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-primary-foreground">
                <div className="font-serif text-xl">{c.title}</div>
                <div className="text-xs opacity-90 mt-1">{c.short}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Хиты продаж
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl">Любимые модели сезона</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {hits.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-surface mt-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-brand mb-3">
              Услуги клиники
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl">
              Комплексные услуги по подбору очков и контактных линз
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_LIST.map((s, i) => {
              const Icon = SERVICE_ICONS[i];
              return (
                <Link
                  key={s.slug}
                  to="/uslugi/$slug"
                  params={{ slug: s.slug }}
                  className="bg-background p-6 rounded-sm hover:shadow-md transition-shadow group"
                >
                  <Icon className="h-7 w-7 text-brand mb-6" />
                  <div className="font-serif text-lg">{s.title}</div>
                  <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-1 group-hover:text-foreground">
                    Подробнее <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Новинки
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl">Только что в продаже</h2>
          </div>
          <Link
            to="/opravy"
            className="hidden md:inline-flex items-center gap-1 text-sm hover:text-brand"
          >
            Смотреть все <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {news.slice(0, 4).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="bg-ink text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-brand mb-4">
              Контроль миопии
            </div>
            <h2 className="font-serif text-3xl lg:text-5xl leading-tight">
              Замедляем прогрессирование близорукости у детей.
            </h2>
            <p className="mt-6 text-base/relaxed text-primary-foreground/80 max-w-lg">
              Линзы Stellest и MiSight 1-Day, профильный кабинет в нашей клинике,
              индивидуальная программа наблюдения.
            </p>
            <Link
              to="/uslugi/$slug"
              params={{ slug: "diagnostika" }}
              className="mt-8 inline-flex items-center gap-2 bg-brand text-brand-foreground px-6 py-3 rounded-sm hover:opacity-90"
            >
              Записаться на диагностику <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="aspect-[4/3] bg-accent rounded-sm overflow-hidden">
            <img
              src="https://picsum.photos/seed/hero-kids/1200/900"
              alt="Кабинет контроля миопии"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* JOURNAL */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl lg:text-4xl">Журнал</h2>
          <Link
            to="/zhurnal"
            className="text-sm hover:text-brand inline-flex items-center gap-1"
          >
            Все статьи <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {recent.map((a) => (
            <Link
              key={a.slug}
              to="/zhurnal/$slug"
              params={{ slug: a.slug }}
              className="group block"
            >
              <div className="aspect-[4/3] bg-surface rounded-sm overflow-hidden mb-4">
                <img
                  src={a.cover}
                  alt={a.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="text-xs uppercase tracking-wider text-brand">
                {a.category}
              </div>
              <h3 className="font-serif text-xl mt-2 group-hover:text-brand transition-colors">
                {a.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-2">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
