import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
      { property: "og:image", content: "/main_banner_22_05.jpg" },
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

const HERO_PARTICLES = [
  { style: { width: '300px', height: '300px', top: '10%', left: '5%', animationDelay: '0s', animationDuration: '7s' } },
  { style: { width: '200px', height: '200px', top: '60%', left: '15%', animationDelay: '2s', animationDuration: '8s' } },
  { style: { width: '250px', height: '250px', top: '20%', right: '10%', animationDelay: '1s', animationDuration: '6s' } },
  { style: { width: '180px', height: '180px', top: '70%', right: '20%', animationDelay: '3s', animationDuration: '9s' } },
  { style: { width: '220px', height: '220px', top: '40%', left: '50%', animationDelay: '4s', animationDuration: '7.5s' } },
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
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #2d0a0e 0%, #4a1a1a 25%, #3d1f1a 50%, #2a1520 75%, #1a0508 100%)',
          backgroundSize: '200% 200%',
          animation: 'hero-gradient-shift 12s ease infinite',
        }} />
        {HERO_PARTICLES.map((p, i) => (
          <div key={i} style={{
            ...p.style,
            position: 'absolute',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,180,120,0.25) 0%, transparent 70%)',
            filter: 'blur(20px)',
            animation: 'hero-particle-float 6s ease-in-out infinite',
            pointerEvents: 'none' as const,
          }} />
        ))}

        <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 grid lg:grid-cols-2 gap-12 items-center" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
          <div>
            <span className="text-xs uppercase tracking-[0.2em]" style={{ color: 'rgba(255,200,170,0.8)' }}>
              Новая коллекция · Лето 2026
            </span>
            <h1 className="font-serif text-4xl lg:text-6xl leading-[1.05] text-primary-foreground" style={{ marginTop: '16px' }}>
              Очки,<br /><em>в которых<br />хочется жить.</em>
            </h1>
            <p className="mt-5 text-base lg:text-lg max-w-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Более 11&nbsp;000 оправ от 120 брендов. Ручная подгонка в&nbsp;наших салонах в&nbsp;Санкт-Петербурге и&nbsp;Новокузнецке.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/catalog_s/$category" params={{ category: "opravy" }}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm hover:opacity-90"
                style={{ background: '#fff', color: '#1a0508' }}
              >
                Подобрать оправу
              </Link>
              <button
                className="inline-flex items-center gap-2 border border-primary-foreground/80 text-primary-foreground rounded-full px-5 py-2.5 text-sm hover:bg-primary-foreground/10 bg-transparent cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: '18px', height: '18px' }}>
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Виртуальная примерка
              </button>
            </div>
            <div className="mt-8 flex gap-8 text-primary-foreground" style={{ fontSize: '13px' }}>
              <div>
                <strong>11 000+</strong>
                <br />
                <span style={{ opacity: 0.7 }}>оправ от 120 брендов</span>
              </div>
              <div>
                <strong>2 города</strong>
                <br />
                <span style={{ opacity: 0.7 }}>СПб · Новокузнецк</span>
              </div>
              <div>
                <strong>4.9 ★</strong>
                <br />
                <span style={{ opacity: 0.7 }}>1 840 отзывов</span>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute rounded-full" style={{
              width: '80%', height: '80%',
              background: 'radial-gradient(circle, rgba(180,80,40,0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }} />
            <div className="relative rounded-2xl" style={{
              border: '2px solid rgba(255,255,255,0.15)',
            }}>
              <img
                src="/main_banner_22_05.jpg"
                alt="Семья играет в настольную игру — только ребёнок в очках, все увлечены игрой"
                className="w-[150%] max-w-none h-auto -translate-x-1/6 rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS — grid */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 pt-16 pb-10">
        <Reveal className="flex items-end justify-between mb-8 gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Каталог
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl">Только что в продаже</h2>
          </div>
          <a
            href="/catalog_s/opravy/"
            className="hidden sm:inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            style={{ textDecoration: 'none' }}
          >
            Смотреть все →
          </a>
        </Reveal>
        <Reveal delay={120}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {news.slice(0, 4).map((p) => (
              <a key={p.slug} href={`/catalog_s/opravy/${p.slug}/`} className="group block" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="aspect-square bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider" style={{ marginTop: '12px' }}>{p.brand}</div>
                <div className="text-sm font-medium" style={{ marginTop: '4px' }}>{p.name}</div>
                <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
                  <span className="text-sm font-semibold">₽ {p.price.toLocaleString('ru-RU')}</span>
                  <span className="text-xs" style={{ color: '#2a9d5c' }}>● В наличии</span>
                </div>
              </a>
            ))}
          </div>
        </Reveal>
      </section>

      {/* EDITORIAL TRIPTYCH */}
      <EditorialTriptych />

      {/* CATEGORIES — dark gradient + SVG icons */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-serif text-3xl lg:text-4xl">Четыре способа купить</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {fourCats.map((c, i) => (
            <Reveal key={c.slug} delay={i * 80}>
              <a
                href={c.href}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden block"
                style={{
                  background: 'linear-gradient(160deg, #3d1f1a 0%, #2d0a0e 50%, #1a0508 100%)',
                }}
              >
                <img
                  src={c.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ opacity: 0.55 }}
                />
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(26,5,8,0.25) 100%)',
                }} />
                <div className="relative z-10 flex flex-col items-center justify-end h-full text-primary-foreground" style={{ paddingBottom: '24px' }}>
                  <span className="text-sm font-medium">{c.title}</span>
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
