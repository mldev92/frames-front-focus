import { Mail, MessageCircle, Send } from "lucide-react";
import { SiteLogo } from "./SiteLogo";

const COLS = [
  {
    title: "Каталог",
    links: [
      ["Оправы", "/catalog_s/opravy/"],
      ["Солнцезащитные очки", "/catalog_s/solntsezashchitnye_ochki/"],
      ["Контактные линзы", "/catalog_s/kontaktnye_linzy_/"],
      ["Линзы для очков", "/catalog_s/linzy_dlya_ochkov/"],
      ["Аксессуары", "/catalog_s/soputstvuyushchie_tovary/"],
    ],
  },
  {
    title: "Услуги",
    links: [
      ["Запись к врачу", "/uslugi/priem-vracha"],
      ["Диагностика зрения", "/kabinet-diagnostiki-spb/"],
      ["Stellest каталог с линзами", "/stellest-katalog-s-linzami/"],
      ["Подбор очков", "/uslugi/podbor-ochkov"],
      ["Ремонт очков", "/remont-ochkov/"],
    ],
  },
  {
    title: "Компания",
    links: [
      ["О нас", "/o-nas"],
      ["Салоны", "/contacts/"],
      ["Журнал", "/blog/"],
      ["Покрытия очковых линз", "/blog/linzy-dlya-ochkov/pokrytiya-linz-dlya-ochkov/"],
    ],
  },
  {
    title: "Помощь",
    links: [
      ["Оплата и получение", "/payment/"],
      ["Гарантия", "/payment/"],
      ["Контакты", "/contacts/"],
      ["Политика конфиденциальности", "/politika-konfidentsialnosti/"],
      ["Реквизиты", "/requisites/"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 pt-16 pb-8" style={{ background: "#FFFEFE" }}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-12">
          <div className="col-span-2">
            <SiteLogo imageClassName="h-10 sm:h-12" loading="lazy" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Сеть оптических салонов и интернет-магазин. Подбор очков и контактных линз с полным
              циклом услуг.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <div className="font-serif text-sm uppercase tracking-wider mb-4">{col.title}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map(([label, href]) => (
                  <li key={`${label}-${href}`}>
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
          <div className="flex gap-4">
            <a
              href="https://t.me/optika100"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <Send className="h-5 w-5" />
            </a>
            <a
              href="https://vk.com/optika100"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ВКонтакте"
              className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href="mailto:sale-spb@optika100.com"
              aria-label="Email"
              className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
