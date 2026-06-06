import { Link } from "@tanstack/react-router";

type Tile = {
  image: string;
  eyebrow?: string;
  title: string;
  cta: string;
  href: string;
};

const TILES: Tile[] = [
  {
    image: "/main1example.webp",
    eyebrow: "Дизайн из Италии",
    title: "Коллекция Tutto",
    cta: "Смотреть коллекцию",
    href: "/catalog_s/opravy/",
  },
  {
    image: "/main2example.webp",
    eyebrow: "В стиле 90-х",
    title: "Винтажные оправы",
    cta: "К оправам",
    href: "/catalog_s/opravy/?shape=Круглые",
  },
  {
    image: "/main3example.webp",
    eyebrow: "Создано для движения",
    title: "Спорт и активность",
    cta: "Солнцезащитные",
    href: "/catalog_s/solntsezashchitnye_ochki/",
  },
];

export function EditorialTriptych() {
  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TILES.map((t) => (
          <a
            key={t.title}
            href={t.href}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-cream"
          >
            <img
              src={t.image}
              alt={t.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-foreground/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 text-primary-foreground">
              {t.eyebrow && (
                <div className="text-xs uppercase tracking-[0.15em] opacity-90 mb-2">
                  {t.eyebrow}
                </div>
              )}
              <div className="font-serif text-2xl leading-tight mb-4">{t.title}</div>
              <span className="inline-flex items-center bg-background text-foreground text-sm rounded-full px-4 py-2 group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
                {t.cta}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
