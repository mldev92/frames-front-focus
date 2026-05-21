import { Link } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Menu, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const CITIES = ["Санкт-Петербург", "Новокузнецк", "Россия"] as const;
type City = typeof CITIES[number];

const NAV = [
  {
    label: "Оправы",
    href: "/catalog_s/opravy/",
    mega: {
      cols: [
        {
          title: "По форме",
          links: [
            ["Прямоугольные", "/catalog_s/opravy/?shape=Прямоугольные"],
            ["Круглые", "/catalog_s/opravy/?shape=Круглые"],
            ["Авиаторы", "/catalog_s/opravy/?shape=Авиаторы"],
            ["Кошачий глаз", "/catalog_s/opravy/?shape=Кошачий+глаз"],
            ["Геометрические", "/catalog_s/opravy/?shape=Геометрические"],
          ],
        },
        {
          title: "По полу",
          links: [
            ["Мужские", "/catalog_s/opravy/?gender=Мужские"],
            ["Женские", "/catalog_s/opravy/?gender=Женские"],
            ["Унисекс", "/catalog_s/opravy/?gender=Унисекс"],
            ["Детские", "/catalog_s/opravy/?gender=Детские"],
          ],
        },
        {
          title: "По материалу",
          links: [
            ["Ацетат", "/catalog_s/opravy/?material=Ацетат"],
            ["Титан", "/catalog_s/opravy/?material=Титан"],
            ["Металл", "/catalog_s/opravy/?material=Металл"],
          ],
        },
      ],
    },
  },
  { label: "Солнцезащитные", href: "/catalog_s/solntsezashchitnye_ochki/" },
  { label: "Контактные линзы", href: "/catalog_s/kontaktnye_linzy_/" },
  { label: "Линзы для очков", href: "/catalog_s/linzy_dlya_ochkov/" },
  { label: "Аксессуары", href: "/catalog_s/soputstvuyushchie_tovary/" },
  { label: "Услуги", href: "/uslugi" },
  { label: "Салоны", href: "/contacts/" },
];

export function Header() {
  const { totals, open: openCart, saved } = useCart();
  const { count } = totals();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Guard localStorage-derived state from SSR — prevents hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [hovered, setHovered] = useState<string | null>(null);

  const [city, setCity] = useState<City>("Санкт-Петербург");
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("o100-city") as City | null;
    if (stored && (CITIES as readonly string[]).includes(stored)) setCity(stored);
  }, []);

  useEffect(() => {
    if (!cityOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [cityOpen]);

  function selectCity(c: City) {
    setCity(c);
    localStorage.setItem("o100-city", c);
    setCityOpen(false);
  }

  return (
    <>
      {/* Utility bar */}
      <div className="bg-ink text-primary-foreground text-xs py-2 px-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* City selector */}
            <div className="relative" ref={cityRef}>
              <button
                onClick={() => setCityOpen((v) => !v)}
                className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-7.6 8-13a8 8 0 1 0-16 0c0 5.4 8 13 8 13z"/>
                  <circle cx="12" cy="9" r="3"/>
                </svg>
                {city}
                <svg
                  width="9" height="9"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: cityOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease" }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {cityOpen && (
                <div
                  className="absolute left-0 bg-ink border border-white/15 rounded shadow-xl z-50"
                  style={{ top: "calc(100% + 6px)", minWidth: "180px" }}
                >
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => selectCity(c)}
                      className={cn(
                        "w-full text-left flex items-center gap-2 text-xs transition-colors hover:bg-white/10",
                        c === city ? "opacity-100" : "opacity-55"
                      )}
                      style={{ padding: "8px 12px" }}
                    >
                      <svg
                        width="9" height="9"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ opacity: c === city ? 1 : 0, flexShrink: 0 }}
                      >
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="opacity-50">·</span>
            <span className="opacity-70">Бесплатная доставка от 5 000 ₽</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => document.dispatchEvent(new CustomEvent("open-callback"))}
              className="opacity-70 hover:opacity-100 transition-opacity border-b border-dotted border-white/30 hover:border-white/70 pb-px"
            >
              Заказать звонок
            </button>
            <a
              href="tel:+78121000000"
              className="flex items-center gap-2 font-semibold text-[13px] px-3.5 py-1 rounded-full bg-white/10 border border-transparent hover:bg-white/15 hover:border-white/20 transition-all no-underline text-primary-foreground"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_0_0_oklch(0.75_0.18_150/0.6)] animate-[pulse-ring_2s_infinite]" />
              +7 (812) 100-00-00
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.37 1.88.72 2.78a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.35 1.83.59 2.78.72A2 2 0 0 1 22 16.92z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile menu */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(true)}
              aria-label="Меню"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 shrink-0">
              <span className="bg-brand text-brand-foreground font-bold px-2 py-1 text-sm tracking-tight rounded-sm">
                100%
              </span>
              <span className="font-serif text-lg tracking-tight">ОПТИКА</span>
            </Link>

            {/* Desktop nav */}
            <nav
              className="hidden lg:flex items-center gap-6 text-sm flex-1 justify-center"
              onMouseLeave={() => setHovered(null)}
            >
              {NAV.map((item) => (
                <div
                  key={item.href}
                  onMouseEnter={() => setHovered(item.href)}
                  className="py-5"
                >
                  <a
                    href={item.href}
                    className="hover:text-brand transition-colors"
                  >
                    {item.label}
                  </a>
                </div>
              ))}

              {/* Mega-menu */}
              {NAV.map(
                (item) =>
                  item.mega &&
                  hovered === item.href && (
                    <div
                      key={`mega-${item.href}`}
                      className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-lg"
                      onMouseEnter={() => setHovered(item.href)}
                    >
                      <div className="mx-auto max-w-7xl px-8 py-10 grid grid-cols-3 gap-12">
                        {item.mega.cols.map((col) => (
                          <div key={col.title}>
                            <div className="font-serif text-sm uppercase tracking-wider text-muted-foreground mb-4">
                              {col.title}
                            </div>
                            <ul className="space-y-2">
                              {col.links.map(([label, href]) => (
                                <li key={href}>
                                  <a
                                    href={href}
                                    className="hover:text-brand transition-colors"
                                  >
                                    {label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ),
              )}
            </nav>

            {/* Right icons */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/search"
                search={{ q: "" }}
                className="p-2 hover:text-brand"
                aria-label="Поиск"
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link
                to="/contacts"
                className="hidden md:flex items-center gap-1 p-2 hover:text-brand text-sm"
              >
                <MapPin className="h-4 w-4" />
                <span>Салоны</span>
              </Link>
              <Link to="/personal" className="p-2 hover:text-brand" aria-label="Кабинет">
                <User className="h-5 w-5" />
              </Link>
              <button className="p-2 hover:text-brand relative" aria-label="Отложенные">
                <Heart className="h-5 w-5" />
                {mounted && saved.length > 0 && (
                  <span className="absolute top-0 right-0 bg-brand text-brand-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {saved.length}
                  </span>
                )}
              </button>
              <button
                onClick={openCart}
                className="p-2 hover:text-brand relative"
                aria-label="Корзина"
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && count > 0 && (
                  <span className="absolute top-0 right-0 bg-brand text-brand-foreground text-[10px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className={cn(
              "absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background p-6 overflow-y-auto",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1"
              >
                <span className="bg-brand text-brand-foreground font-bold px-2 py-1 text-sm rounded-sm">
                  100%
                </span>
                <span className="font-serif text-lg">ОПТИКА</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-lg border-b border-border"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-8 space-y-3 text-sm text-muted-foreground">
              <p>ул. Кирочная, 17 · м. Чернышевская</p>
              <a href="mailto:sale-spb@optika100.com" className="block">
                sale-spb@optika100.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
