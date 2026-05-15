import { Link } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Menu, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const NAV = [
  {
    label: "Оправы",
    href: "/opravy" as const,
    mega: {
      cols: [
        {
          title: "По форме",
          links: [
            ["Прямоугольные", "/opravy?shape=Прямоугольные"],
            ["Круглые", "/opravy?shape=Круглые"],
            ["Авиаторы", "/opravy?shape=Авиаторы"],
            ["Кошачий глаз", "/opravy?shape=Кошачий+глаз"],
            ["Геометрические", "/opravy?shape=Геометрические"],
          ],
        },
        {
          title: "По полу",
          links: [
            ["Мужские", "/opravy?gender=Мужские"],
            ["Женские", "/opravy?gender=Женские"],
            ["Унисекс", "/opravy?gender=Унисекс"],
            ["Детские", "/opravy?gender=Детские"],
          ],
        },
        {
          title: "По материалу",
          links: [
            ["Ацетат", "/opravy?material=Ацетат"],
            ["Титан", "/opravy?material=Титан"],
            ["Металл", "/opravy?material=Металл"],
          ],
        },
      ],
    },
  },
  { label: "Солнцезащитные", href: "/solntsezashchitnye" as const },
  { label: "Контактные линзы", href: "/kontaktnye-linzy" as const },
  { label: "Линзы для очков", href: "/linzy-dlya-ochkov" as const },
  { label: "Аксессуары", href: "/aksessuary" as const },
  { label: "Услуги", href: "/uslugi" as const },
  { label: "Салоны", href: "/salony" as const },
];

export function Header() {
  const { totals, open: openCart, saved } = useCart();
  const { count } = totals();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Guard localStorage-derived state from SSR — prevents hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ink text-primary-foreground text-xs py-2 px-4 text-center">
        Бесплатная доставка по СПб от 5 000 ₽ · Гарантия на оправы 12 месяцев
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
                  <Link
                    to={item.href}
                    className="hover:text-brand transition-colors"
                    activeProps={{ className: "text-brand" }}
                  >
                    {item.label}
                  </Link>
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
              <button className="p-2 hover:text-brand" aria-label="Поиск">
                <Search className="h-5 w-5" />
              </button>
              <Link
                to="/salony"
                className="hidden md:flex items-center gap-1 p-2 hover:text-brand text-sm"
              >
                <MapPin className="h-4 w-4" />
                <span>Салоны</span>
              </Link>
              <Link to="/cabinet" className="p-2 hover:text-brand" aria-label="Кабинет">
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
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-lg border-b border-border"
                >
                  {item.label}
                </Link>
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
