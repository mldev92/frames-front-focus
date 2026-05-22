import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Truck, ShieldCheck, Sparkles } from "lucide-react";

function TBankIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="100" height="110" viewBox="0 0 100 110" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 10H90V60C90 78 70 95 50 102C30 95 10 78 10 60V10Z" fill="currentColor"/>
    </svg>
  );
}
import { useState } from "react";
import { ProductCarousel } from "@/components/ProductCarousel";
import { EditorialTriptych } from "@/components/EditorialTriptych";
import { BrandPromiseBand } from "@/components/BrandPromiseBand";
import { PromoBanner } from "@/components/PromoBanner";
import { PromoCards } from "@/components/PromoCards";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Reveal } from "@/components/Reveal";
import { SalonsSection } from "@/components/SalonsSection";
import { categories } from "@/data/categories";
import { bestsellers, newArrivals } from "@/data/products";
import { articles } from "@/data/articles";
import { serviceHref } from "@/data/services";
import { promoBanner, promotions } from "@/data/promotions";

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
      { property: "og:image", content: "/main_banner_v2.png" },
    ],
  }),
  component: HomePage,
});

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

const TRUST = [
  { icon: Truck, t: "Бесплатная доставка от 5 000 ₽" },
  { icon: ShieldCheck, t: "Гарантия 12 месяцев" },
  { icon: TBankIcon, t: "Рассрочка 0-0-3 от Т-Банка" },
  { icon: Sparkles, t: "Виртуальная примерка" },
];

function HomePage() {
  const hits = bestsellers();
  const news = newArrivals();
  const recent = articles.slice(0, 3);
  const fourCats = categories.filter((c) => c.slug !== "aksessuary").slice(0, 4);
  const [aptOpen, setAptOpen] = useState(false);

  return (
    <div>
      {/* HERO */}
      <section className="relative w-full">
        <img
          src="/main_banner_v2.png"
          alt="ОПТИКА 100% — оправы, очки и контактные линзы"
          className="w-full h-auto max-h-[640px] object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-foreground/45 via-foreground/15 to-transparent">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
            <div className="max-w-md text-primary-foreground">
              <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/80 mb-4">
                Новая коллекция · 2025
              </div>
              <h1 className="font-serif text-4xl lg:text-6xl leading-[1.05]">
                Очки, в которых хочется жить.
              </h1>
              <p className="mt-5 text-base lg:text-lg text-primary-foreground/90 max-w-sm">
                Современные оправы, профессиональный подбор и линзы мировых брендов.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/catalog_s/$category" params={{ category: "opravy" }}
                  className="inline-flex items-center gap-2 bg-background text-foreground rounded-full px-5 py-2.5 text-sm hover:opacity-90"
                >
                  Подобрать оправу
                </Link>
                <Link
                  to="/catalog_s/$category" params={{ category: "solntsezashchitnye_ochki" }}
                  className="inline-flex items-center gap-2 border border-primary-foreground/80 text-primary-foreground rounded-full px-5 py-2.5 text-sm hover:bg-primary-foreground/10"
                >
                  Солнцезащитные
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Trust strip */}
        <div className="absolute left-0 right-0 bottom-0 bg-foreground/35 backdrop-blur-sm text-primary-foreground hidden md:block">
          <div className="mx-auto max-w-7xl px-4 lg:px-8 py-3 grid grid-cols-4 gap-4 text-xs">
            {TRUST.map((tr) => {
              const I = tr.icon;
              return (
                <div key={tr.t} className="flex items-center gap-2 justify-center">
                  <I className="h-4 w-4 opacity-90" />
                  <span>{tr.t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS — carousel */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 pt-16 pb-10">
        <Reveal className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Новинки
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl">Только что в продаже</h2>
          </div>
          <Link
            to="/catalog_s/$category" params={{ category: "opravy" }}
            className="hidden sm:inline-flex items-center gap-2 border border-border rounded-full px-4 py-2 text-sm hover:border-foreground"
          >
            Смотреть все новинки
          </Link>
        </Reveal>
        <Reveal delay={120}>
          <ProductCarousel products={news} />
        </Reveal>
      </section>

      {/* EDITORIAL TRIPTYCH */}
      <EditorialTriptych />

      {/* CATEGORIES — 4 tiles, lighter */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-3xl lg:text-4xl">Четыре способа купить</h2>
          <p className="mt-3 text-muted-foreground">
            Оправы, солнцезащитные, контактные линзы и услуги клиники — в одном месте.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {fourCats.map((c, i) => (
            <Reveal key={c.slug} delay={i * 80}>
              <a
                href={c.href}
                className="group relative aspect-[3/4] bg-cream rounded-2xl overflow-hidden block"
              >
                <img
                  src={c.image}
                  alt={c.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center bg-background text-foreground text-sm rounded-full px-4 py-2 shadow-sm whitespace-nowrap group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
                    {c.title}
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BESTSELLERS — carousel */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <Reveal className="flex items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Хиты продаж
              </div>
              <h2 className="font-serif text-3xl lg:text-4xl">Любимые модели сезона</h2>
            </div>
            <Link
              to="/catalog_s/$category" params={{ category: "opravy" }}
              className="hidden sm:inline-flex items-center gap-2 border border-border rounded-full px-4 py-2 text-sm hover:border-foreground bg-background"
            >
              Смотреть все
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <ProductCarousel products={hits} />
          </Reveal>
        </div>
      </section>

      {/* BRAND PROMISE BAND */}
      <BrandPromiseBand />

      {/* PROMOTIONS */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16 space-y-8">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-brand mb-3">Акции</div>
            <h2 className="font-serif text-3xl lg:text-4xl">Специальные предложения</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <PromoBanner data={promoBanner} />
        </Reveal>
        <Reveal delay={160}>
          <PromoCards promotions={promotions} />
        </Reveal>
      </section>

      {/* SERVICES — lighter, white cards */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-brand mb-3">
            Услуги клиники
          </div>
          <h2 className="font-serif text-3xl lg:text-4xl">
            Комплексные услуги по подбору очков и линз
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_LIST.map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <a
                href={s.slug === "priem-vracha" ? undefined : serviceHref(s.slug)}
                onClick={s.slug === "priem-vracha" ? (e) => { e.preventDefault(); setAptOpen(true); } : undefined}
                className="group block rounded-2xl overflow-hidden border border-border bg-background hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden bg-cream">
                  <img
                    src={SERVICE_IMAGES[SERVICE_LIST.findIndex((x) => x.slug === s.slug)]}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <div className="font-serif text-lg">{s.title}</div>
                  <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-1 group-hover:text-foreground">
                    Подробнее <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EDITORIAL — myopia, lightened */}
      <section className="bg-cream">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.2em] text-brand mb-4">
              Контроль миопии
            </div>
            <h2 className="font-serif text-3xl lg:text-5xl leading-tight">
              Замедляем прогрессирование близорукости у детей.
            </h2>
            <p className="mt-6 text-base/relaxed text-muted-foreground max-w-lg">
              Линзы Stellest и MiSight 1-Day, профильный кабинет в нашей клинике,
              индивидуальная программа наблюдения.
            </p>
            <a
              href={serviceHref("diagnostika")}
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-background rounded-full px-6 py-3 hover:opacity-90"
            >
              Записаться на диагностику <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
          <Reveal delay={140} className="aspect-[4/3] rounded-2xl overflow-hidden">
            <img
              src="/main_bottom_child_banner.png"
              alt="Кабинет контроля миопии"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </Reveal>
        </div>
      </section>

      <SalonsSection />

      {/* JOURNAL */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
        <Reveal className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Журнал
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl">Свежее в журнале</h2>
          </div>
          <Link
            to="/blog"
            className="text-sm hover:text-brand inline-flex items-center gap-1"
          >
            Все статьи <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {recent.map((a, i) => (
            <Reveal key={a.slug} delay={i * 100}>
              <Link
                to="/blog/$category/$slug"
                params={{ category: a.categorySlug, slug: a.slug }}
                className="group block"
              >
                <div className="aspect-[4/3] bg-cream rounded-2xl overflow-hidden mb-4">
                  <img
                    src={a.cover}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <span className="inline-block text-[11px] uppercase tracking-wider text-brand border border-brand/30 rounded-full px-2.5 py-0.5">
                  {a.category}
                </span>
                <h3 className="font-serif text-xl mt-3 group-hover:text-brand transition-colors">
                  {a.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">{a.excerpt}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <AppointmentModal open={aptOpen} onOpenChange={setAptOpen} />
    </div>
  );
}
