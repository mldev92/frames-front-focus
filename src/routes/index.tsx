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
import { categories, productHref } from "@/data/categories";
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

function HomePage() {
  const hits = bestsellers();
  const news = newArrivals();
  const recent = articles.slice(0, 3);
  const fourCats = categories.filter((c) => c.slug !== "aksessuary").slice(0, 4);
  const [aptOpen, setAptOpen] = useState(false);

  return (
    <div>
      {/* HERO */}
      <style>{`
        @keyframes _hG{0%,100%{background-position:0% 0%}50%{background-position:100% 100%}}
        @keyframes _gD{0%,100%{opacity:.6;transform:translate(0,0) scale(1)}50%{opacity:1;transform:translate(30px,-20px) scale(1.08)}}
        @keyframes _fA{0%,100%{transform:translate(0,0)}33%{transform:translate(15px,-25px)}66%{transform:translate(-10px,15px)}}
        @keyframes _fB{0%,100%{transform:translate(0,0)}33%{transform:translate(-20px,10px)}66%{transform:translate(12px,-18px)}}
        @keyframes _hPF{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes _gR{0%,100%{opacity:.6;background-position:0% 0%}50%{opacity:1;background-position:100% 100%}}
        @keyframes _fU{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .hero-bg{position:absolute!important;inset:0!important;z-index:0!important;background:linear-gradient(135deg,#1a0508 0%,#3d1218 35%,#5c2028 65%,#2a0d12 100%)!important;background-size:250% 250%!important;animation:_hG 16s ease infinite!important}
        .hero-bg::before{content:''!important;position:absolute!important;width:700px!important;height:700px!important;border-radius:50%!important;background:radial-gradient(circle,rgba(220,80,60,.12) 0%,transparent 65%)!important;top:-150px!important;right:-100px!important;animation:_gD 10s ease-in-out infinite!important}
        .hero-bg::after{content:''!important;position:absolute!important;width:500px!important;height:500px!important;border-radius:50%!important;background:radial-gradient(circle,rgba(255,180,140,.08) 0%,transparent 60%)!important;bottom:-100px!important;left:10%!important;animation:_gD 14s ease-in-out infinite reverse!important}
        .hero-particle{position:absolute!important;border-radius:50%!important;pointer-events:none!important;z-index:1!important}
        .hero-particle:nth-child(2){width:200px!important;height:200px!important;top:10%!important;left:60%!important;background:rgba(255,180,150,.06)!important;filter:blur(40px)!important;animation:_fA 9s ease-in-out infinite!important}
        .hero-particle:nth-child(3){width:120px!important;height:120px!important;top:60%!important;left:20%!important;background:rgba(220,100,80,.08)!important;filter:blur(30px)!important;animation:_fB 11s ease-in-out infinite!important}
        .hero-particle:nth-child(4){width:300px!important;height:300px!important;top:30%!important;right:5%!important;background:rgba(255,220,200,.04)!important;filter:blur(50px)!important;animation:_fA 13s ease-in-out 2s infinite!important}
        .hero-particle:nth-child(5){width:80px!important;height:80px!important;top:70%!important;left:50%!important;background:rgba(255,160,120,.1)!important;filter:blur(25px)!important;animation:_fB 8s ease-in-out 1s infinite!important}
        .hero-particle:nth-child(6){width:160px!important;height:160px!important;top:5%!important;left:35%!important;background:rgba(200,60,40,.06)!important;filter:blur(35px)!important;animation:_fA 12s ease-in-out 3s infinite!important}
        .hero-content{position:relative!important;z-index:2!important;color:#fff!important}
        .hero-eyebrow{font-size:11px!important;font-weight:600!important;letter-spacing:.12em!important;text-transform:uppercase!important;color:rgba(255,200,180,.7)!important;margin-bottom:20px!important;animation:_fU .8s var(--ease) both!important}
        .hero-h1{font-family:var(--font-serif)!important;font-weight:700!important;font-size:clamp(36px,5vw,64px)!important;line-height:1.06!important;letter-spacing:-.02em!important;margin-bottom:20px!important;animation:_fU .8s var(--ease) .15s both!important}
        .hero-h1 em{font-size:1em!important;font-weight:400!important;font-style:italic!important;color:rgba(255,220,200,.85)!important}
        .hero-lead{font-size:19px!important;line-height:1.55!important;color:rgba(255,240,230,.7)!important;max-width:420px!important;margin-bottom:36px!important;animation:_fU .8s var(--ease) .3s both!important}
        .hero-ctas{display:flex!important;gap:12px!important;margin-bottom:48px!important;animation:_fU .8s var(--ease) .45s both!important}
        .hero-stats{display:flex!important;gap:32px!important;padding-top:24px!important;border-top:1px solid rgba(255,255,255,.12)!important;animation:_fU .8s var(--ease) .6s both!important}
        .hero-stats div{display:flex!important;flex-direction:column!important;gap:2px!important}
        .hero-stats strong{font-size:20px!important;font-weight:700!important;color:#fff!important}
        .hero-stats span{font-size:13px!important;color:rgba(255,220,200,.5)!important}
        .hero-visual{position:relative!important;z-index:2!important;display:grid!important;place-items:center!important;min-height:440px!important;animation:_fU 1s var(--ease) .5s both!important}
        .hero-photo-wrap{position:relative!important;width:100%!important;max-width:560px!important}
        .hero-photo-frame{position:relative!important;border-radius:24px!important;overflow:hidden!important;box-shadow:0 20px 60px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.06)!important;animation:_hPF 6s ease-in-out infinite!important}
        .hero-photo-frame img{width:100%!important;height:auto!important;display:block!important;filter:brightness(1.02) contrast(1.03)!important}
        .hero-photo-frame::after{content:''!important;position:absolute!important;inset:0!important;background:linear-gradient(180deg,transparent 50%,rgba(26,5,8,.25) 100%)!important;pointer-events:none!important}
        .hero-photo-glow{position:absolute!important;inset:-4px!important;border-radius:28px!important;z-index:-1!important;background:linear-gradient(135deg,rgba(220,80,60,.3),rgba(255,180,140,.15),rgba(220,80,60,.2))!important;background-size:200% 200%!important;animation:_gR 4s ease-in-out infinite!important;filter:blur(8px)!important}
        .hero-photo-dots{position:absolute!important;top:-16px!important;right:-16px!important;display:grid!important;grid-template-columns:repeat(3,6px)!important;gap:6px!important;opacity:.25!important}
        .hero-photo-dots span{width:6px!important;height:6px!important;border-radius:50%!important;background:rgba(255,200,170,.6)!important}
      `}</style>
      <section className="relative w-full min-h-[620px] lg:min-h-[700px] overflow-hidden flex items-center" style={{ padding: 'clamp(48px, 8vw, 80px) clamp(24px, 5vw, 64px)' }}>
        {/* Animated gradient background */}
        <div className="hero-bg" />
        {/* Bokeh particles */}
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />

        {/* Full-size banner image */}
        <div className="absolute inset-0 z-[1]">
          <img
            src="/main_banner_22_05.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay — darker on left for text readability */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(26,5,8,0.75) 0%, rgba(26,5,8,0.35) 45%, rgba(26,5,8,0.08) 100%)' }} />
        </div>

        {/* Text content overlaid */}
        <div className="hero-content">
          <span className="hero-eyebrow">Новая коллекция · Лето 2026</span>
          <h1 className="hero-h1">Очки,<br /><em>в которых<br />хочется жить.</em></h1>
          <p className="hero-lead">Более 11&nbsp;000 оправ от 120 брендов. Ручная подгонка в&nbsp;наших салонах в&nbsp;Санкт-Петербурге и&nbsp;Новокузнецке.</p>
          <div className="hero-ctas">
            <Link
              to="/catalog_s/$category" params={{ category: "opravy" }}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#fff', color: '#1a0508' }}
            >
              Подобрать оправу
            </Link>
            <button
              className="inline-flex items-center gap-2 border rounded-full px-7 py-3.5 text-sm font-semibold transition-colors cursor-pointer bg-transparent"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.6)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)'; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: '18px', height: '18px' }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Виртуальная примерка
            </button>
          </div>
          <div className="hero-stats">
            <div><strong>11 000+</strong><span>оправ от 120 брендов</span></div>
            <div><strong>2 города</strong><span>СПб · Новокузнецк</span></div>
            <div><strong>4.9 ★</strong><span>1 840 отзывов</span></div>
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
              <a key={p.slug} href={productHref(p.category, p.slug)} className="group block" style={{ textDecoration: 'none', color: 'inherit' }}>
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
