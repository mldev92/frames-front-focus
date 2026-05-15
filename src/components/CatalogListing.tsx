import { useMemo, useState } from "react";
import { SlidersHorizontal, X, Search, ChevronDown, Check } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { Slider } from "./ui/slider";
import type { Product } from "@/data/types";
import { cn } from "@/lib/utils";

type FacetKey =
  | "shape"
  | "material"
  | "gender"
  | "size"
  | "brand"
  | "wearMode"
  | "lensType"
  | "purpose";

interface ListingProps {
  title: string;
  subtitle?: string;
  products: Product[];
  facets?: FacetKey[];
}

// ── Frame shape icons (inline SVG) ───────────────────────────────────────────
const ShapeIcon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 48 20" className="w-10 h-5" fill="none" stroke="currentColor" strokeWidth="1.4">
    {d === "rect" && (
      <>
        <rect x="2" y="4" width="18" height="12" rx="2" />
        <rect x="28" y="4" width="18" height="12" rx="2" />
        <path d="M20 10h8" />
      </>
    )}
    {d === "square" && (
      <>
        <rect x="2" y="3" width="18" height="14" />
        <rect x="28" y="3" width="18" height="14" />
        <path d="M20 10h8" />
      </>
    )}
    {d === "round" && (
      <>
        <circle cx="11" cy="10" r="8" />
        <circle cx="37" cy="10" r="8" />
        <path d="M19 10h10" />
      </>
    )}
    {d === "oval" && (
      <>
        <ellipse cx="11" cy="10" rx="9" ry="6" />
        <ellipse cx="37" cy="10" rx="9" ry="6" />
        <path d="M20 10h8" />
      </>
    )}
    {d === "aviator" && (
      <>
        <path d="M2 6 Q11 18 20 8 Z" />
        <path d="M28 8 Q37 18 46 6 Z" />
        <path d="M20 8h8" />
      </>
    )}
    {d === "cat" && (
      <>
        <path d="M2 12 Q4 4 14 5 Q22 6 20 12 Z" />
        <path d="M28 12 Q26 6 34 5 Q44 4 46 12 Z" />
        <path d="M20 9h8" />
      </>
    )}
    {d === "browline" && (
      <>
        <path d="M2 6 H20 V14 H2 Z" fill="currentColor" fillOpacity=".15" />
        <path d="M28 6 H46 V14 H28 Z" fill="currentColor" fillOpacity=".15" />
        <path d="M2 6 H46" strokeWidth="2" />
        <path d="M20 10h8" />
      </>
    )}
    {d === "big" && (
      <>
        <rect x="1" y="2" width="20" height="16" rx="3" />
        <rect x="27" y="2" width="20" height="16" rx="3" />
        <path d="M21 10h6" />
      </>
    )}
    {d === "narrow" && (
      <>
        <rect x="2" y="7" width="18" height="6" rx="1" />
        <rect x="28" y="7" width="18" height="6" rx="1" />
        <path d="M20 10h8" />
      </>
    )}
    {d === "sport" && (
      <>
        <path d="M2 8 Q4 4 14 5 L22 7 Q24 10 22 13 L14 15 Q4 16 2 12 Z" />
        <path d="M46 8 Q44 4 34 5 L26 7 Q24 10 26 13 L34 15 Q44 16 46 12 Z" />
      </>
    )}
    {d === "mono" && (
      <>
        <rect x="3" y="4" width="42" height="12" rx="6" />
        <path d="M24 4v12" />
      </>
    )}
    {d === "mask" && (
      <path d="M3 6 Q24 0 45 6 L45 14 Q24 20 3 14 Z" />
    )}
    {d === "clip" && (
      <>
        <rect x="2" y="4" width="18" height="12" rx="2" />
        <rect x="28" y="4" width="18" height="12" rx="2" />
        <path d="M5 2v2M43 2v2" />
      </>
    )}
  </svg>
);

const SHAPE_DEFS: { key: string; label: string; icon: string }[] = [
  { key: "Прямоугольные", label: "прямоугольные", icon: "rect" },
  { key: "Квадратные", label: "квадратные", icon: "square" },
  { key: "Вэйфэрер", label: "вэйфэрер", icon: "browline" },
  { key: "Большие", label: "большие", icon: "big" },
  { key: "Овальные", label: "овальные", icon: "oval" },
  { key: "Спортивные", label: "спортивные", icon: "sport" },
  { key: "Авиаторы", label: "авиатор", icon: "aviator" },
  { key: "Кошачий глаз", label: "кошачий глаз", icon: "cat" },
  { key: "Круглые", label: "круглые", icon: "round" },
  { key: "Броулайнеры", label: "броулайнеры", icon: "browline" },
  { key: "Монолинза", label: "монолинза", icon: "mono" },
  { key: "Узкие", label: "узкие", icon: "narrow" },
  { key: "Клипоны", label: "клипоны", icon: "clip" },
  { key: "Горнолыжные маски", label: "горнолыжные маски", icon: "mask" },
];

const COLOR_SWATCHES: { name: string; hex: string }[] = [
  { name: "Чёрный", hex: "#1a1a1a" },
  { name: "Серый", hex: "#7a7a7a" },
  { name: "Белый", hex: "#f5f5f0" },
  { name: "Серебро", hex: "#c8c8d0" },
  { name: "Золото", hex: "#d4a44a" },
  { name: "Бронза", hex: "#9a6b3a" },
  { name: "Коричневый", hex: "#5a3a1a" },
  { name: "Бежевый", hex: "#d8b890" },
  { name: "Розовый", hex: "#e9a8b0" },
  { name: "Красный", hex: "#c83a32" },
  { name: "Бордовый", hex: "#6a1a28" },
  { name: "Оранжевый", hex: "#e07028" },
  { name: "Жёлтый", hex: "#e8c540" },
  { name: "Зелёный", hex: "#3a7a48" },
  { name: "Бирюзовый", hex: "#3aa0a8" },
  { name: "Голубой", hex: "#5aa8d8" },
  { name: "Синий", hex: "#28488a" },
  { name: "Фиолетовый", hex: "#6a3a8a" },
  { name: "Прозрачный", hex: "transparent" },
  { name: "Градиент", hex: "linear-gradient(135deg,#e8b8a0,#7a4a90)" },
];

const GENDER_ICON: Record<string, string> = {
  "Мужские": "♂",
  "Женские": "♀",
  "Унисекс": "⚥",
  "Детские": "★",
};

export function CatalogListing({ title, subtitle, products, facets = [] }: ListingProps) {
  const [active, setActive] = useState<Record<string, Set<string>>>({});
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">("featured");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [tryOn, setTryOn] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const priceBounds = useMemo(() => {
    const ps = products.map((p) => p.price);
    return { min: Math.min(100, ...ps), max: Math.max(...ps, 50000) };
  }, [products]);
  const [price, setPrice] = useState<[number, number]>([priceBounds.min, priceBounds.max]);

  const [sizeWidth, setSizeWidth] = useState<[number, number]>([1, 165]);
  const [sizeHeight, setSizeHeight] = useState<[number, number]>([1, 156]);
  const [sizeTemple, setSizeTemple] = useState<[number, number]>([1, 178]);

  const facetCounts = useMemo(() => {
    const out: Record<string, Record<string, number>> = {};
    for (const f of facets) {
      const map: Record<string, number> = {};
      for (const p of products) {
        const v = (p as unknown as Record<string, string | undefined>)[f];
        if (v) map[v] = (map[v] ?? 0) + 1;
      }
      out[f] = map;
    }
    return out;
  }, [products, facets]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (p.price < price[0] || p.price > price[1]) return false;
      if (tryOn && !p.hasTryOn) return false;
      if (selectedColors.size > 0) {
        const names = (p.colors ?? []).map((c) => c.name);
        if (!names.some((n) => selectedColors.has(n))) return false;
      }
      const specMap: Record<string, number> = {};
      for (const s of p.specs) {
        const num = parseInt(s.value, 10);
        if (!isNaN(num)) specMap[s.label] = num;
      }
      const width = specMap["Ширина оправы"];
      const temple = specMap["Длина дужки"];
      if (width !== undefined && (width < sizeWidth[0] || width > sizeWidth[1])) return false;
      if (temple !== undefined && (temple < sizeTemple[0] || temple > sizeTemple[1])) return false;
      return Object.entries(active).every(([k, set]) => {
        if (!set || set.size === 0) return true;
        const v = (p as unknown as Record<string, string | undefined>)[k];
        return v ? set.has(v) : false;
      });
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, active, sort, price, tryOn, selectedColors, sizeWidth, sizeTemple]);

  const toggle = (facet: string, value: string) => {
    setActive((prev) => {
      const next = { ...prev };
      const set = new Set(next[facet] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      next[facet] = set;
      return next;
    });
  };

  const clearAll = () => {
    setActive({});
    setSelectedColors(new Set());
    setPrice([priceBounds.min, priceBounds.max]);
    setTryOn(false);
  };

  const activeChips: { facet: string; value: string }[] = [];
  for (const [k, set] of Object.entries(active)) {
    for (const v of set) activeChips.push({ facet: k, value: v });
  }

  const hasFacet = (k: FacetKey) => facets.includes(k);

  const FilterContent = (
    <div className="text-sm">
      <FilterSection title="фильтры" titleClass="text-base" noBorder>
        <div className="flex items-center justify-between bg-surface rounded-sm px-3 py-2">
          <span className="flex items-center gap-2">
            <span className="inline-block w-5 h-5 rounded-full border border-border" />
            онлайн-примерка
          </span>
          <button
            onClick={() => setTryOn((v) => !v)}
            className={cn(
              "relative inline-flex h-5 w-9 rounded-full transition-colors",
              tryOn ? "bg-brand" : "bg-muted",
            )}
            aria-label="Онлайн-примерка"
          >
            <span
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform",
                tryOn ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </button>
          <span className="text-xs text-muted-foreground">{tryOn ? "да" : "нет"}</span>
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="цена">
        <div className="flex items-center gap-2 mb-3">
          <label className="flex-1 flex items-center gap-1 border border-border rounded-sm px-2 py-1">
            <span className="text-muted-foreground text-xs">от</span>
            <input
              type="number"
              value={price[0]}
              onChange={(e) => setPrice([Number(e.target.value) || 0, price[1]])}
              className="w-full bg-transparent outline-none text-sm"
            />
            <span className="text-muted-foreground text-xs">₽</span>
          </label>
          <label className="flex-1 flex items-center gap-1 border border-border rounded-sm px-2 py-1">
            <span className="text-muted-foreground text-xs">до</span>
            <input
              type="number"
              value={price[1]}
              onChange={(e) => setPrice([price[0], Number(e.target.value) || 0])}
              className="w-full bg-transparent outline-none text-sm"
            />
            <span className="text-muted-foreground text-xs">₽</span>
          </label>
        </div>
        <Slider
          min={priceBounds.min}
          max={priceBounds.max}
          step={100}
          value={price}
          onValueChange={(v) => setPrice([v[0], v[1]] as [number, number])}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
          <span>{priceBounds.min} ₽</span>
          <span>{Math.round((priceBounds.min + priceBounds.max) / 2)} ₽</span>
          <span>{priceBounds.max} ₽</span>
        </div>
      </FilterSection>

      {/* Frame shape — tile grid */}
      {hasFacet("shape") && (
        <FilterSection title="форма оправы">
          <div className="grid grid-cols-2 gap-2">
            {SHAPE_DEFS.filter((s) => facetCounts.shape?.[s.key]).map((s) => {
              const count = facetCounts.shape?.[s.key] ?? 0;
              const checked = active.shape?.has(s.key) ?? false;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggle("shape", s.key)}
                  className={cn(
                    "group relative flex flex-col items-center justify-center gap-1.5 rounded-md border bg-card px-2 py-3 text-center transition-all hover:-translate-y-[1px] hover:shadow-sm",
                    checked
                      ? "border-foreground ring-1 ring-foreground"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  {checked && (
                    <span className="absolute right-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                  )}
                  <ShapeIcon d={s.icon} />
                  <span className="text-[11px] leading-tight first-letter:uppercase">
                    {s.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{count}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Frame type */}
      <FilterSection title="тип оправы">
        <div className="grid grid-cols-2 gap-2">
          {["ободковые", "полуободковые", "безободковые"].map((t) => (
            <button
              key={t}
              type="button"
              className="flex flex-col items-center gap-1.5 rounded-md border border-border bg-card px-2 py-3 text-[11px] transition hover:border-foreground/40 hover:-translate-y-[1px] hover:shadow-sm"
            >
              <ShapeIcon d="rect" />
              <span className="first-letter:uppercase">{t}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Gender — pills */}
      {hasFacet("gender") && (
        <FilterSection title="пол">
          <div className="flex flex-wrap gap-2">
            {Object.entries(facetCounts.gender ?? {}).map(([g, c]) => {
              const checked = active.gender?.has(g) ?? false;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggle("gender", g)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition",
                    checked
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:border-foreground/50",
                  )}
                >
                  <span className="text-sm leading-none">{GENDER_ICON[g] ?? "•"}</span>
                  <span className="first-letter:uppercase">{g.toLowerCase()}</span>
                  <span className={cn("text-[10px]", checked ? "opacity-70" : "text-muted-foreground")}>
                    ({c})
                  </span>
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Color — tile grid with swatch + name */}
      <FilterSection title="цвет оправы">
        <div className="grid grid-cols-2 gap-2">
          {COLOR_SWATCHES.map((c) => {
            const sel = selectedColors.has(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() =>
                  setSelectedColors((prev) => {
                    const next = new Set(prev);
                    if (next.has(c.name)) next.delete(c.name);
                    else next.add(c.name);
                    return next;
                  })
                }
                className={cn(
                  "flex items-center gap-2 rounded-md border bg-card px-2.5 py-2 text-left text-xs transition hover:-translate-y-[1px] hover:shadow-sm",
                  sel ? "border-foreground ring-1 ring-foreground" : "border-border hover:border-foreground/40",
                )}
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-border"
                  style={{
                    background: c.hex,
                    backgroundImage:
                      c.hex === "transparent"
                        ? "repeating-conic-gradient(#ddd 0 25%, #fff 0 50%)"
                        : c.hex.includes("gradient")
                          ? c.hex
                          : undefined,
                    backgroundSize: c.hex === "transparent" ? "8px 8px" : undefined,
                  }}
                />
                <span className="flex-1 truncate first-letter:uppercase">{c.name.toLowerCase()}</span>
                {sel && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </FilterSection>


      {/* Collections */}
      <FilterSection title="новинки">
        {["коллекция 2026 года", "коллекция 2025 года", "коллекция 2024 года"].map((c) => (
          <label key={c} className="flex items-center gap-2 cursor-pointer hover:text-brand py-1">
            <input type="checkbox" className="accent-[var(--brand)]" />
            <span className="flex-1">{c}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="поляризация">
        <label className="flex items-center gap-2 cursor-pointer hover:text-brand">
          <input type="checkbox" className="accent-[var(--brand)]" />
          <span className="flex-1">да</span>
        </label>
      </FilterSection>

      {/* Material */}
      {hasFacet("material") && (
        <FilterSection title="материал оправы">
          {Object.entries(facetCounts.material ?? {}).map(([m, c]) => {
            const checked = active.material?.has(m) ?? false;
            return (
              <label key={m} className="flex items-center gap-2 cursor-pointer hover:text-brand py-1">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle("material", m)}
                  className="accent-[var(--brand)]"
                />
                <span className="flex-1">{m.toLowerCase()}</span>
                <span className="text-muted-foreground text-xs">({c})</span>
              </label>
            );
          })}
        </FilterSection>
      )}

      <FilterSection title="фотохромные">
        <label className="flex items-center gap-2 cursor-pointer hover:text-brand">
          <input type="checkbox" className="accent-[var(--brand)]" />
          <span className="flex-1">да</span>
        </label>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="размеры оправы">
        <SizeSlider label="ширина" icon="↔" value={sizeWidth} onChange={setSizeWidth} max={165} />
        <SizeSlider label="высота" icon="↕" value={sizeHeight} onChange={setSizeHeight} max={156} />
        <SizeSlider label="дужка" icon="—" value={sizeTemple} onChange={setSizeTemple} max={178} />
      </FilterSection>

      {/* Brands */}
      {hasFacet("brand") && (
        <FilterSection title="бренды">
          <div className="flex gap-1 mb-3">
            <button className="px-3 py-1 text-xs rounded-sm bg-brand text-brand-foreground">
              популярные
            </button>
            <button className="px-3 py-1 text-xs rounded-sm border border-border">все</button>
          </div>
          <div className="relative mb-2">
            <Search className="h-3.5 w-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="найти"
              className="w-full bg-transparent border border-border rounded-sm pl-7 pr-2 py-1.5 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
            {Object.entries(facetCounts.brand ?? {})
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([b, c]) => {
                const checked = active.brand?.has(b) ?? false;
                return (
                  <label key={b} className="flex items-center gap-2 cursor-pointer hover:text-brand">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle("brand", b)}
                      className="accent-[var(--brand)]"
                    />
                    <span className="flex-1">{b}</span>
                    <span className="text-muted-foreground text-xs">({c})</span>
                  </label>
                );
              })}
          </div>
          <button className="mt-3 text-brand text-xs hover:underline">смотреть все ▾</button>
        </FilterSection>
      )}

      {activeChips.length > 0 && (
        <button onClick={clearAll} className="text-sm text-brand hover:underline mt-2">
          Сбросить все
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-muted-foreground max-w-2xl">{subtitle}</p>}
      </div>

      <div className="lg:flex lg:items-start">
        {facets.length > 0 && (
          <div
            className={cn(
              "hidden lg:block shrink-0 sticky top-4 self-start overflow-hidden transition-[width,margin-right] duration-300 ease-in-out",
              sidebarOpen ? "w-[260px] mr-10" : "w-0 mr-0",
            )}
          >
            <div className="w-[260px] h-[calc(100vh-6rem)] overflow-y-auto pr-4">
              {FilterContent}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 gap-4">
            {/* Filter toggle — always left */}
            {facets.length > 0 && (
              <>
                <button
                  onClick={() => setSidebarOpen((v) => !v)}
                  className="hidden lg:flex items-center gap-1.5 text-sm font-medium hover:text-brand transition-colors shrink-0"
                >
                  {sidebarOpen ? "← Скрыть фильтры" : "Показать фильтры →"}
                </button>
                <button
                  onClick={() => setMobileFilters(true)}
                  className="lg:hidden inline-flex items-center gap-2 text-sm border border-border rounded-sm px-3 py-1.5"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Фильтры
                </button>
              </>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <div className="hidden lg:block text-sm text-muted-foreground shrink-0">
                {filtered.length}{" "}
                {filtered.length % 10 === 1 && filtered.length !== 11
                  ? "модель"
                  : filtered.length % 10 >= 2 &&
                      filtered.length % 10 <= 4 &&
                      !(filtered.length >= 12 && filtered.length <= 14)
                    ? "модели"
                    : "моделей"}
              </div>
              <div className="hidden md:flex items-center border border-border rounded-sm overflow-hidden">
                <button
                  onClick={() => setGridCols(2)}
                  className={cn(
                    "px-2.5 py-1.5 transition-colors",
                    gridCols === 2 ? "bg-foreground text-background" : "hover:bg-surface",
                  )}
                  aria-label="2 колонки"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={cn(
                    "px-2.5 py-1.5 border-l border-border transition-colors",
                    gridCols === 3 ? "bg-foreground text-background" : "hover:bg-surface",
                  )}
                  aria-label="3 колонки"
                >
                  <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor">
                    <rect x="0.5" y="1" width="4" height="6" rx="1" />
                    <rect x="6" y="1" width="4" height="6" rx="1" />
                    <rect x="11.5" y="1" width="4" height="6" rx="1" />
                    <rect x="0.5" y="9" width="4" height="6" rx="1" />
                    <rect x="6" y="9" width="4" height="6" rx="1" />
                    <rect x="11.5" y="9" width="4" height="6" rx="1" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="appearance-none bg-background border border-border rounded-sm pl-3 pr-8 py-1.5 text-sm cursor-pointer focus:outline-none focus:border-brand"
                >
                  <option value="featured">Популярные</option>
                  <option value="price-asc">Цена ↑</option>
                  <option value="price-desc">Цена ↓</option>
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  ▾
                </span>
              </div>
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeChips.map(({ facet, value }) => (
                <button
                  key={facet + value}
                  onClick={() => toggle(facet, value)}
                  className="inline-flex items-center gap-1 bg-surface border border-border text-xs px-2 py-1 rounded-sm hover:border-brand"
                >
                  {value} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              Ничего не найдено. Попробуйте изменить фильтры.
            </div>
          ) : (
            <div className={cn("grid gap-x-5 gap-y-10", gridCols === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3")}>
              {filtered.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 lg:hidden"
          onClick={() => setMobileFilters(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-lg max-h-[85vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-xl">Фильтры</h3>
              <button onClick={() => setMobileFilters(false)} aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterContent}
            <div className="sticky bottom-0 bg-background pt-4 flex gap-3">
              <button onClick={clearAll} className="flex-1 border border-border py-3 rounded-sm">
                Сбросить
              </button>
              <button
                onClick={() => setMobileFilters(false)}
                className="flex-1 bg-ink text-primary-foreground py-3 rounded-sm"
              >
                Показать ({filtered.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSection({
  title,
  titleClass,
  noBorder,
  defaultOpen = true,
  children,
}: {
  title: string;
  titleClass?: string;
  noBorder?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("py-5", !noBorder && "border-t border-border")}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between text-left group",
          titleClass,
        )}
      >
        <span className="font-serif text-[15px] tracking-tight first-letter:uppercase">
          {title}
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-foreground group-hover:text-foreground">
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")}
          />
        </span>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-[2000px] mt-4 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SizeSlider({
  label,
  icon,
  value,
  onChange,
  max,
}: {
  label: string;
  icon: string;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  max: number;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span className="text-base">{icon}</span>
        <span>
          {value[0]} — {value[1]} мм.
        </span>
      </div>
      <Slider
        min={1}
        max={max}
        step={1}
        value={value}
        onValueChange={(v) => onChange([v[0], v[1]] as [number, number])}
      />
    </div>
  );
}
