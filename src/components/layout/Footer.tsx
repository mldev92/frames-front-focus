import { Link } from "@tanstack/react-router";
import { Instagram, Send, Youtube } from "lucide-react";

const COLS = [
  {
    title: "Каталог",
    links: [
      ["Оправы", "/opravy"],
      ["Солнцезащитные очки", "/solntsezashchitnye"],
      ["Контактные линзы", "/kontaktnye-linzy"],
      ["Линзы для очков", "/linzy-dlya-ochkov"],
      ["Аксессуары", "/aksessuary"],
    ],
  },
  {
    title: "Услуги",
    links: [
      ["Запись к врачу", "/uslugi/priem-vracha"],
      ["Диагностика зрения", "/uslugi/diagnostika"],
      ["Подбор очков", "/uslugi/podbor-ochkov"],
      ["Ремонт очков", "/uslugi/remont"],
    ],
  },
  {
    title: "Компания",
    links: [
      ["О нас", "/o-nas"],
      ["Салоны", "/salony"],
      ["Журнал", "/zhurnal"],
    ],
  },
  {
    title: "Помощь",
    links: [
      ["Доставка и оплата", "/zhurnal/garantia-i-uhod"],
      ["Гарантия", "/zhurnal/garantia-i-uhod"],
      ["Контакты", "/salony"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-surface mt-24 pt-16 pb-8 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-1">
              <span className="bg-brand text-brand-foreground font-bold px-2 py-1 text-sm rounded-sm">
                100%
              </span>
              <span className="font-serif text-lg">ОПТИКА</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Сеть оптических салонов и интернет-магазин. Подбор очков и контактных линз с
              полным циклом услуг.
            </p>
            <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Ваш e-mail"
                className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                type="submit"
                className="bg-ink text-primary-foreground px-4 py-2 text-sm rounded-sm hover:opacity-90"
              >
                Подписаться
              </button>
            </form>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <div className="font-serif text-sm uppercase tracking-wider mb-4">
                {col.title}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <a href={href} className="hover:text-foreground transition-colors">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-muted-foreground">
          <div>
            © 2025 ОПТИКА 100% · ул. Кирочная, 17, СПб ·{" "}
            <a href="mailto:sale-spb@optika100.com" className="hover:text-foreground">
              sale-spb@optika100.com
            </a>
          </div>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="hover:text-foreground">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Telegram" className="hover:text-foreground">
              <Send className="h-4 w-4" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-foreground">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
