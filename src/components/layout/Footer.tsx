import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageCircle, Send } from "lucide-react";
import { AdminEditableArea } from "@/components/AdminEditableArea";
import { AppointmentModal } from "@/components/AppointmentModal";
import { contactForCity } from "@/data/contact";
import { SiteLogo } from "./SiteLogo";
import { useCityStore } from "@/lib/store/city";
import { serviceHref } from "@/data/services";
import { regionalSiteHref } from "@/lib/city-routing";
import footerDefaults from "../../../public/storefront-footer-defaults.json";

const footerMenuKeys = ["catalog", "services", "company", "help"] as const;

function footerEditor(block: keyof typeof footerDefaults) {
  return `/bitrix/admin/o100_footer.php?block=${block}`;
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const city = useCityStore((state) => state.city);
  const contact = contactForCity(city);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const { data: savedBlocks } = useQuery<Partial<typeof footerDefaults>>({
    queryKey: ["storefront-footer-content"],
    enabled: !import.meta.env.SSR,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetch("/api/store/footer.php", { credentials: "omit", signal });
      if (!response.ok) throw new Error("Footer content is unavailable");
      return response.json();
    },
  });
  const intro = savedBlocks?.intro ?? footerDefaults.intro;
  const cityColumns = footerMenuKeys.map((key) => {
    const column = savedBlocks?.[key] ?? footerDefaults[key];
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
          <AdminEditableArea className="col-span-2" href={footerEditor("intro")} label="Редактировать текст подвала" action="Редактировать текст">
            <SiteLogo imageClassName="h-10 sm:h-12" loading="lazy" />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              {intro.text}
            </p>
          </AdminEditableArea>

          {cityColumns.map((col) => (
            <AdminEditableArea key={col.key} href={footerEditor(col.key)} label={`Редактировать меню подвала: ${col.title}`} action="Редактировать меню">
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
            © {currentYear} ОПТИКА 100% · {city === "spb" ? "ул. Кирочная, 17, СПб" : "Новокузнецк"}{" "}
            ·{" "}
            <a href={contact.email.href} className="hover:text-foreground">
              {contact.email.label}
            </a>
          </div>
          <div className="flex gap-4">
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
