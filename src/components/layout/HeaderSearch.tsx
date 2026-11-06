import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Search, X, ArrowUpRight } from "lucide-react";
import { useSearchAutocomplete } from "@/lib/use-search-autocomplete";
import {
  fullSearchHref,
  searchBrandHref,
  searchProductHref,
  lensSearchHref,
} from "@/lib/search-query";
import { regionalSiteHref } from "@/lib/city-routing";
import { useCityStore } from "@/lib/store/city";
import { cn } from "@/lib/utils";

const categoryLabels = {
  opravy: "Оправы",
  solntsezashchitnye: "Солнцезащитные очки",
  "kontaktnye-linzy": "Контактные линзы",
  "linzy-dlya-ochkov": "Линзы для очков",
  aksessuary: "Аксессуары",
};

export function HeaderSearch({
  onClose,
  trigger,
}: {
  onClose: (restoreFocus?: boolean) => void;
  trigger: HTMLButtonElement | null;
}) {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const city = useCityStore((state) => state.city);
  const router = useRouter();
  const href = useRouterState({ select: (state) => state.location.href });
  const previousHref = useRef(href);
  const id = useId();
  const resultsId = `${id}-results`;
  const result = useSearchAutocomplete(query, city);
  const groups = [
    {
      label: "Бренды",
      items: result.brands.map((brand) => ({
        key: `brand:${brand.category}:${brand.name}`,
        title: brand.name,
        detail: categoryLabels[brand.category],
        href: searchBrandHref(brand, city),
      })),
    },
    {
      label: "Модели",
      items: [
        ...result.products.map((product) => ({
          key: `product:${product.id ?? product.slug}`,
          title: product.name,
          detail: [product.brand, `${product.price.toLocaleString("ru-RU")} ₽`]
            .filter(Boolean)
            .join(" · "),
          href: searchProductHref(product, city),
        })),
        ...result.lenses.map((lens) => ({
          key: `lens:${lens.id}`,
          title: [lens.line, lens.coating, lens.treatment].filter(Boolean).join(" · "),
          detail: `${lens.supplier.toUpperCase()} · ${lens.priceRub && lens.priceRub > 0 ? `${lens.priceRub.toLocaleString("ru-RU")} ₽ / линза` : "Стоимость уточняется"}`,
          href: lensSearchHref(query, city),
        })),
      ].slice(0, 6),
    },
    {
      label: "Страницы и категории",
      items: result.pages.map((page) => ({
        key: `page:${page.href}`,
        title: page.title,
        detail: page.type,
        href: regionalSiteHref(page.href, city),
      })),
    },
  ];
  const items = groups.flatMap((group) => group.items);
  const activeIndex = items.findIndex((item) => item.key === activeId);
  const activeItem = items[activeIndex];
  const fullHref = fullSearchHref(query, city);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (previousHref.current !== href) onClose();
    previousHref.current = href;
  }, [href, onClose]);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !trigger?.contains(target)) onClose();
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [onClose, trigger]);
  useEffect(() => {
    if (activeIndex >= 0)
      document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, id]);

  const navigate = (target: string) => {
    onClose();
    void router.navigate({ href: target });
  };
  const followLink = (event: MouseEvent<HTMLAnchorElement>, target: string) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    navigate(target);
  };

  return (
    <div
      ref={panelRef}
      className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-7rem)] overflow-y-auto border-b border-border bg-background shadow-lg"
      onBlurCapture={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node) &&
          event.relatedTarget !== trigger
        )
          onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.nativeEvent.isComposing) {
          event.preventDefault();
          onClose(true);
        }
      }}
    >
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        <form
          role="search"
          aria-label="Поиск по сайту"
          className="flex items-center gap-3 border-b border-ink pb-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!composing.current && query.trim()) navigate(fullHref);
          }}
        >
          <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-muted-foreground" />
          <label htmlFor={`${id}-input`} className="sr-only">
            Поиск по товарам, брендам и страницам
          </label>
          <input
            id={`${id}-input`}
            ref={inputRef}
            type="search"
            role="combobox"
            value={query}
            maxLength={120}
            autoComplete="off"
            spellCheck={false}
            placeholder="Бренд, модель или услуга"
            aria-autocomplete="list"
            aria-expanded={result.enabled}
            aria-controls={result.enabled ? resultsId : undefined}
            aria-activedescendant={activeItem ? `${id}-option-${activeIndex}` : undefined}
            aria-describedby={`${id}-status`}
            className="min-w-0 flex-1 bg-transparent text-base outline-none"
            onCompositionStart={() => {
              composing.current = true;
            }}
            onCompositionEnd={() => {
              composing.current = false;
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveId(undefined);
            }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || composing.current) return;
              if (event.key === "Enter" && activeItem) {
                event.preventDefault();
                navigate(activeItem.href);
              }
              if ((event.key === "ArrowDown" || event.key === "ArrowUp") && items.length) {
                event.preventDefault();
                const next =
                  event.key === "ArrowDown"
                    ? (activeIndex + 1) % items.length
                    : activeIndex <= 0
                      ? items.length - 1
                      : activeIndex - 1;
                setActiveId(items[next].key);
              }
            }}
          />
          <button
            type="submit"
            aria-label="Показать все результаты"
            className="shrink-0 p-2 hover:text-brand"
          >
            <ArrowUpRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            aria-label="Закрыть поиск"
            className="shrink-0 p-2 hover:text-brand"
          >
            <X className="h-5 w-5" />
          </button>
        </form>
        <p id={`${id}-status`} role="status" className="mt-3 text-xs text-muted-foreground">
          {!result.enabled
            ? "Введите минимум 2 символа. Например, Гесс или Стеллест."
            : result.loading
              ? "Ищем варианты…"
              : items.length
                ? `Подсказок: ${items.length}. Выберите стрелками или откройте все результаты.`
                : result.productError || result.brandError
                  ? "Часть поиска сейчас недоступна. Попробуйте ещё раз."
                  : "Ничего не найдено. Попробуйте другое написание."}
        </p>
        {result.enabled && (
          <div
            id={resultsId}
            role="listbox"
            aria-label="Подсказки поиска"
            className="mt-3 max-h-[min(55dvh,480px)] overflow-y-auto overscroll-contain"
          >
            {groups
              .filter((group) => group.items.length)
              .map((group, groupIndex) => (
                <div
                  key={group.label}
                  role="group"
                  aria-labelledby={`${id}-group-${groupIndex}`}
                  className="mb-4"
                >
                  <div
                    id={`${id}-group-${groupIndex}`}
                    className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground"
                  >
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const index = items.findIndex((candidate) => candidate.key === item.key);
                    return (
                      <a
                        key={item.key}
                        id={`${id}-option-${index}`}
                        role="option"
                        aria-selected={activeId === item.key}
                        tabIndex={-1}
                        href={item.href}
                        onClick={(event) => followLink(event, item.href)}
                        onMouseDown={(event) => event.preventDefault()}
                        onPointerMove={() => setActiveId(item.key)}
                        className={cn(
                          "block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface",
                          activeId === item.key && "bg-surface",
                        )}
                      >
                        <span className="block break-words text-sm font-medium">{item.title}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {item.detail}
                        </span>
                      </a>
                    );
                  })}
                </div>
              ))}
          </div>
        )}
        {result.enabled && (result.productError || result.brandError) && items.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Часть подсказок недоступна. Можно повторить поиск на странице результатов.
          </p>
        )}
        {result.enabled && (
          <a
            href={fullHref}
            onClick={(event) => followLink(event, fullHref)}
            className="mt-3 inline-flex py-2 text-sm font-medium text-brand hover:underline"
          >
            Все результаты по запросу «{query.trim()}» →
          </a>
        )}
      </div>
    </div>
  );
}
