import { useState } from "react";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { CONTACT } from "@/data/contact";
import { SiteLogo } from "./SiteLogo";
import { useCityStore } from "@/lib/store/city";
import { serviceHref } from "@/data/services";
import { regionalSiteHref } from "@/lib/city-routing";

const COLS = [
  {
    title: "Каталог",
    links: [
      ["Оправы", "/catalog_s/opravy/"],
      ["Солнцезащитные очки", "/catalog_s/solntsezashchitnye_ochki/"],
      ["Контактные линзы", "/catalog_s/kontaktnye_linzy_/"],
      ["Контактные линзы в СПб", "/linzy-spb/"],
      ["Линзы для очков", "/catalog_s/linzy_dlya_ochkov/"],
      ["Аксессуары", "/catalog_s/soputstvuyushchie_tovary/"],
    ],
  },
  {
    title: "Услуги",
    links: [
      ["Запись к врачу", "/uslugi/priem-vracha"],
      ["Диагностика зрения", "/kabinet-diagnostiki-spb/"],
      ["Биометрия глаза", "/biometriya-glaza/"],
      ["Stellest каталог с линзами", "/stellest-katalog-s-linzami/"],
      ["Подбор очков", "/podbor-ochkov/"],
      ["Ремонт очков", "/remont-ochkov/"],
    ],
  },
  {
    title: "Компания",
    links: [
      ["О нас", "/o-nas"],
      ["Оптика в Санкт-Петербурге", "/optika-spb/"],
      ["Салоны", "/contacts/"],
      ["Блог", "/blog/"],
      ["Покрытия очковых линз", "/blog/linzy-dlya-ochkov/pokrytiya-linz-dlya-ochkov/"],
    ],
  },
  {
    title: "Помощь",
    links: [
      ["Оплата и получение", "/payment/"],
      ["Гарантия", "/warranty/"],
      ["Контакты", "/contacts/"],
      ["Политика конфиденциальности", "/politika-konfidentsialnosti/"],
      ["Реквизиты", "/requisites/"],
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const city = useCityStore((state) => state.city);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const cityColumns = COLS.map((column) => ({
    ...column,
    links: column.links.filter(
      ([, href]) =>
        city === "spb" || !["/linzy-spb/", "/biometriya-glaza/", "/optika-spb/"].includes(href),
    ),
  }));

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

          {cityColumns.map((col) => (
            <div key={col.title}>
              <div className="font-serif text-sm uppercase tracking-wider mb-4">{col.title}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {col.links.map(([label, href]) => {
                  const resolvedHref =
                    href === "/kabinet-diagnostiki-spb/" ? serviceHref("diagnostika", city) : href;

                  return (
                    <li key={`${label}-${href}`}>
                      {href === "/uslugi/priem-vracha" ? (
                        <button
                          type="button"
                          onClick={() => setAppointmentOpen(true)}
                          className="hover:text-foreground transition-colors"
                        >
                          {label}
                        </button>
                      ) : (
                        <a
                          href={regionalSiteHref(resolvedHref, city)}
                          className="hover:text-foreground transition-colors"
                        >
                          {label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-muted-foreground">
          <div>
            © {currentYear} ОПТИКА 100% ·{" "}
            {city === "spb" ? (
              <>
                ул. Кирочная, 17, СПб ·{" "}
                <a href={CONTACT.email.href} className="hover:text-foreground">
                  {CONTACT.email.label}
                </a>
              </>
            ) : (
              <>
                Новокузнецк ·{" "}
                <a href={CONTACT.phone.href} className="hover:text-foreground">
                  {CONTACT.phone.label}
                </a>
              </>
            )}
          </div>
          <div className="flex gap-4">
            {city === "spb" && (
              <a
                href={CONTACT.telegram.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
              >
                <Send className="h-5 w-5" />
              </a>
            )}
            <a
              href={CONTACT.max.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MAX"
              className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            {city === "spb" ? (
              <a
                href={CONTACT.email.href}
                aria-label="Email"
                className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            ) : (
              <a
                href={CONTACT.phone.href}
                aria-label="Телефон"
                className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
              >
                <Phone className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </footer>
  );
}
