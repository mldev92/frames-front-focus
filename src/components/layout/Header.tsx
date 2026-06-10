import { Link } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { CONTACT, PRIMARY_SALON } from "@/data/contact";
import { HEADER_NAV_ITEMS, HeaderMegaPanel, isMegaNavItem } from "./HeaderMegaMenu";
import { SiteLogo } from "./SiteLogo";

const CITIES = ["Санкт-Петербург", "Новокузнецк", "Россия"] as const;
type City = (typeof CITIES)[number];

const PROMOS = [
  { text: "ДО -40% НА СОЛНЦЕЗАЩИТНЫЕ ОЧКИ", href: "/catalog_s/opravy/vysota-oversize-crystal" },
  { text: "ПОДАРОК К ЛИНЗАМ STELLEST", href: "/catalog_s/opravy/vysota-oversize-crystal" },
  { text: "ОТЛИЧНЫЕ ЛИНЗЫ + КЭШБЭК 14%", href: "/catalog_s/opravy/vysota-oversize-crystal" },
  {
    text: "КУПИТЕ 2 УПАКОВКИ ЛИНЗ ULTRAFLEX PREMIER И ПОЛУЧИТЕ СКЛАДНУЮ СУМКУ В ПОДАРОК",
    href: "/catalog_s/opravy/vysota-oversize-crystal",
  },
  { text: "ДЕТСКАЯ МИОПИЯ ПОД КОНТРОЛЕМ", href: "/catalog_s/opravy/vysota-oversize-crystal" },
  {
    text: "КУПИТЕ 2 УПАКОВКИ ЛИНЗ MISIGHT 1 DAY 90 И ПОЛУЧИТЕ 20 ЛИНЗ В ПОДАРОК + СКИДКУ 1000 р",
    href: "/catalog_s/opravy/vysota-oversize-crystal",
  },
];

export function Header() {
  const { totals, open: openCart, saved } = useCart();
  const { count } = totals();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openMegaHref, setOpenMegaHref] = useState<string | null>(null);

  const [city, setCity] = useState<City>("Санкт-Петербург");
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const stored = localStorage.getItem("o100-city") as City | null;
    if (stored && (CITIES as readonly string[]).includes(stored)) setCity(stored);
  }, []);

  useEffect(() => {
    if (!cityOpen) return;

    function onClickOutside(event: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setCityOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [cityOpen]);

  function selectCity(nextCity: City) {
    setCity(nextCity);
    localStorage.setItem("o100-city", nextCity);
    setCityOpen(false);
  }

  const [promoIdx, setPromoIdx] = useState(0);
  const [promoVisible, setPromoVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPromoVisible(false);
      setTimeout(() => {
        setPromoIdx((index) => (index + 1) % PROMOS.length);
        setPromoVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const openMegaItem = HEADER_NAV_ITEMS.find(
    (item) => item.href === openMegaHref && isMegaNavItem(item),
  );

  return (
    <>
      <div className="bg-ink px-4 py-2 text-xs text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative" ref={cityRef}>
              <button
                onClick={() => setCityOpen((value) => !value)}
                className="flex shrink-0 items-center gap-1.5 opacity-80 transition-opacity hover:opacity-100"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-7.6 8-13a8 8 0 1 0-16 0c0 5.4 8 13 8 13z" />
                  <circle cx="12" cy="9" r="3" />
                </svg>
                {city}
                <svg
                  width="9"
                  height="9"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: cityOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {cityOpen && (
                <div
                  className="absolute left-0 z-50 rounded border border-white/15 bg-ink shadow-xl"
                  style={{ top: "calc(100% + 6px)", minWidth: "180px" }}
                >
                  {CITIES.map((item) => (
                    <button
                      key={item}
                      onClick={() => selectCity(item)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-white/10",
                        item === city ? "opacity-100" : "opacity-55",
                      )}
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: item === city ? 1 : 0, flexShrink: 0 }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="opacity-40">·</span>

            <a
              href={PROMOS[promoIdx].href}
              className="truncate uppercase tracking-wide transition-colors hover:opacity-100"
              style={{
                opacity: promoVisible ? 0.75 : 0,
                transition: "opacity 0.3s ease",
                maxWidth: "min(420px, calc(100vw - 150px))",
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
              }}
            >
              {PROMOS[promoIdx].text}
            </a>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <button
              onClick={() => document.dispatchEvent(new CustomEvent("open-callback"))}
              className="border-b border-dotted border-white/30 pb-px opacity-70 transition-opacity hover:border-white/70 hover:opacity-100"
            >
              Заказать звонок
            </button>
            <a
              href={CONTACT.phone.href}
              className="flex items-center gap-2 rounded-full border border-transparent bg-white/10 px-3.5 py-1 text-[13px] font-semibold text-primary-foreground no-underline transition-all hover:border-white/20 hover:bg-white/15"
            >
              <span className="h-1.5 w-1.5 animate-[pulse-ring_2s_infinite] rounded-full bg-success shadow-[0_0_0_0_oklch(0.75_0.18_150/0.6)]" />
              {CONTACT.phone.label}
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.37 1.88.72 2.78a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.83.59 2.78.72A2 2 0 0 1 22 16.92z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div
            className="relative flex h-16 items-center justify-between gap-4"
            onMouseLeave={() => setOpenMegaHref(null)}
          >
            <button
              className="-ml-2 p-2 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Меню"
            >
              <Menu className="h-5 w-5" />
            </button>

            <SiteLogo imageClassName="h-7 sm:h-9 lg:h-10" />

            <nav className="hidden h-full min-w-0 flex-1 items-stretch justify-center gap-1 px-3 lg:flex">
              {HEADER_NAV_ITEMS.map((item) => {
                const hasMega = isMegaNavItem(item);
                const isOpen = openMegaItem?.href === item.href;

                return (
                  <div
                    key={item.href}
                    className="flex items-stretch"
                    onMouseEnter={() => setOpenMegaHref(hasMega ? item.href : null)}
                    onFocusCapture={() => setOpenMegaHref(hasMega ? item.href : null)}
                  >
                    <a
                      href={item.href}
                      className={cn(
                        "group relative inline-flex h-full items-center gap-1 px-3 text-[15px] font-medium transition-colors duration-[var(--duration-snap)]",
                        hasMega
                          ? isOpen
                            ? "text-brand"
                            : "text-foreground hover:text-brand"
                          : "text-foreground hover:text-brand",
                      )}
                    >
                      <span>{item.label}</span>
                      {hasMega && (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-all duration-[var(--duration-snap)]",
                            isOpen ? "rotate-180 text-brand" : "group-hover:text-brand",
                          )}
                        />
                      )}
                      {hasMega && (
                        <span
                          className={cn(
                            "absolute bottom-0 left-3 right-3 h-0.5 rounded-full transition-all duration-[var(--duration-snap)]",
                            isOpen
                              ? "bg-brand opacity-100"
                              : "bg-brand/60 opacity-0 group-hover:opacity-100",
                          )}
                        />
                      )}
                    </a>
                  </div>
                );
              })}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/search"
                search={{ q: "" }}
                className="p-2 transition-colors hover:text-brand"
                aria-label="Поиск"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                to="/personal"
                className="p-2 transition-colors hover:text-brand"
                aria-label="Кабинет"
              >
                <User className="h-5 w-5" />
              </Link>

              <button
                className="relative p-2 transition-colors hover:text-brand"
                aria-label="Отложенные"
              >
                <Heart className="h-5 w-5" />
                {mounted && saved.length > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-brand-foreground">
                    {saved.length}
                  </span>
                )}
              </button>

              <button
                onClick={openCart}
                className="relative p-2 transition-colors hover:text-brand"
                aria-label="Корзина"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && count > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] text-brand-foreground">
                    {count}
                  </span>
                )}
              </button>
            </div>

            {openMegaItem && (
              <div
                className="absolute inset-x-0 top-full z-50 hidden pt-1 lg:block"
                onMouseEnter={() => setOpenMegaHref(openMegaItem.href)}
              >
                <HeaderMegaPanel menu={openMegaItem.mega} />
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/40" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute left-0 top-0 h-full w-[85%] max-w-sm overflow-y-auto bg-background p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <SiteLogo onClick={() => setMobileOpen(false)} imageClassName="h-9" />
              <button onClick={() => setMobileOpen(false)} aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {HEADER_NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-border py-3 text-lg"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
              <p>ул. Кирочная, 17 · м. {PRIMARY_SALON.metro}</p>
              <a href={CONTACT.email.href} className="block">
                {CONTACT.email.label}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
