import { useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";
import { AdminEditAction, AdminEditableArea } from "@/components/AdminEditableArea";
import { AppointmentModal } from "@/components/AppointmentModal";
import { SiteLogo } from "./SiteLogo";
import { useCityStore } from "@/lib/store/city";
import { serviceHref } from "@/data/services";
import { regionalSiteHref } from "@/lib/city-routing";
import { siteContentEditor, storefrontContact, useStorefrontContent } from "@/lib/storefront-content";

const footerMenuKeys = ["catalog", "services", "company", "help"] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();
  const city = useCityStore((state) => state.city);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const content = useStorefrontContent();
  const contact = storefrontContact(city, content);
  const cityColumns = footerMenuKeys.map((key) => {
    const column = content[key];
    return {
      ...column,
      key,
      links: column.links.filter(
        ([, href]) =>
          city === "spb" ||
          ![
            "/catalog_s/linzy_dlya_ochkov/",
            "/linzy-spb/",
            "/biometriya-glaza/",
            "/linzy-dlya-kontrolya-miopii/",
            "/optika-spb/",
          ].includes(href),
      ),
    };
  });

  return (
    <footer className="mt-24 pt-16 pb-8" style={{ background: "#FFFEFE" }}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-12">
          <AdminEditableArea className="col-span-2" href={siteContentEditor("intro")} label="Редактировать текст подвала" action="Редактировать текст">
            <SiteLogo imageClassName="h-10 sm:h-12" loading="lazy" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {content.intro.text}
            </p>
          </AdminEditableArea>

          {cityColumns.map((col) => (
            <AdminEditableArea key={col.key} href={siteContentEditor(col.key)} label={`Редактировать меню подвала: ${col.title}`} action="Редактировать меню">
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
            </AdminEditableArea>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-muted-foreground">
          <div>
            <AdminEditAction className="mr-2" href={siteContentEditor("legal")} label="Редактировать подпись в подвале" action="Редактировать подпись" />
            © {currentYear} {content.legal.text} · {content.legal[city]} ·{" "}
            <a href={contact.email.href} className="hover:text-foreground">
              {contact.email.label}
            </a>
          </div>
          <div className="flex gap-4">
            <AdminEditAction href={siteContentEditor(`contact_${city}`)} label="Редактировать контакты региона" action="Редактировать контакты" />
            <a
              href={contact.telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <Send className="h-5 w-5" />
            </a>
            <a
              href={contact.max.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="MAX"
              className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            <a
              href={contact.email.href}
              aria-label="Email"
              className="p-2 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </footer>
  );
}
