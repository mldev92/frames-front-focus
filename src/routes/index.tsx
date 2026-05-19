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
const SERVICE_IMAGES = [
  "/services1_online_appointment_doctor.png",
  "/services2_vision_diagnostics.png",
  "/services3_selection_of_glasses.png",
  "/services4_glasses_repair.png",
];
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
      <section className="relative w-full">
        <img
          src="/main_banner_v2.png"
          alt="ОПТИКА 100% — оправы, очки и контактные линзы"
          className="w-full h-auto max-h-[600px] lg:max-h-[700px] object-cover"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-foreground/50 to-transparent">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
            <div className="max-w-lg text-primary-foreground">
              <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/80 mb-4">
                Новая коллекция · 2025
              </div>
              <h1 className="font-serif text-5xl lg:text-7xl leading-[1.05]">
                Очки, в которых хочется жить.
              </h1>
              <p className="mt-6 text-lg text-primary-foreground/90 max-w-md">
                Современные оправы, профессиональный подбор и линзы мировых брендов в
                салонах ОПТИКА 100% и онлайн.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/opravy"
                  className="inline-flex items-center gap-2 bg-white text-ink px-6 py-3 rounded-sm hover:opacity-90"
                >
                  Посмотреть оправы <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/uslugi/priem-vracha"
                  className="inline-flex items-center gap-2 border border-white text-white px-6 py-3 rounded-sm hover:bg-white/10"
                >
                  Записаться к врачу
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif text-3xl lg:text-4xl">Каталог</h2>
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
                  className="relative rounded-sm overflow-hidden hover:shadow-md transition-shadow group aspect-[4/3]"
                >
                  <img
                    src={SERVICE_IMAGES[i]}
                    alt={s.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="relative z-10 p-6 h-full flex flex-col justify-end text-primary-foreground">
                    <Icon className="h-7 w-7 text-primary-foreground/80 mb-3" />
                    <div className="font-serif text-lg">{s.title}</div>
                    <div className="mt-3 text-sm text-primary-foreground/70 inline-flex items-center gap-1 group-hover:text-primary-foreground">
                      Подробнее <ArrowRight className="h-3 w-3" />
                    </div>
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
              src="/main_bottom_child_banner.png"
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
