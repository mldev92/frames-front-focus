import { useEffect, useId, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { searchLocations } from "@/lib/api/bitrix";
import type { LocationSuggestion } from "@/lib/api/bitrix";

export const CITY_SEARCH_MIN_LENGTH = 2;
export const CITY_SEARCH_DEBOUNCE_MS = 300;

/**
 * Поиск города с подсказками СДЭК («Владимир, Владимирская область, Центр, Россия»).
 * Пока покупатель печатает, выбранный город сбрасывается (onClear): расчёт доставки
 * нельзя вести по недописанному названию.
 */
export function CityAutocomplete({
  selectedLabel,
  hasSelection,
  onSelect,
  onClear,
}: {
  /** Подпись города, выбранного из подсказок; пустая — поле остаётся пустым (город мог быть выбран кнопкой). */
  selectedLabel: string;
  /** Город выбран (кнопкой или из подсказок): начало набора текста сбрасывает выбор. */
  hasSelection: boolean;
  onSelect: (location: LocationSuggestion) => void;
  onClear: () => void;
}) {
  const listId = useId();
  const [text, setText] = useState(selectedLabel);
  const [items, setItems] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const typing = useRef(false);
  const wrapper = useRef<HTMLDivElement>(null);

  // Поле по умолчанию пустое: выбранный кнопкой город видно по кнопке, а не по тексту в поиске.
  useEffect(() => {
    if (!selectedLabel && typing.current) return;
    typing.current = false;
    setText(selectedLabel);
    setItems([]);
    setOpen(false);
  }, [selectedLabel]);

  useEffect(() => {
    if (!typing.current) return;
    const query = text.trim();
    if (query.length < CITY_SEARCH_MIN_LENGTH) {
      setItems([]);
      setSearched(false);
      setError(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      searchLocations(query, controller.signal)
        .then((result) => {
          setItems(result);
          setSearched(true);
          setError(null);
          setActive(result.length ? 0 : -1);
        })
        .catch((reason) => {
          if (controller.signal.aborted) return;
          setItems([]);
          setSearched(false);
          setError(reason instanceof Error ? reason.message : "Не удалось найти город");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, CITY_SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [text]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const choose = (item: LocationSuggestion) => {
    typing.current = false;
    setText(item.label);
    setItems([]);
    setOpen(false);
    onSelect(item);
  };

  const showList =
    open &&
    text.trim().length >= CITY_SEARCH_MIN_LENGTH &&
    (items.length > 0 || loading || Boolean(error) || searched);

  return (
    <div ref={wrapper} style={{ position: "relative" }}>
      <Search
        size={16}
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--muted-foreground)",
          pointerEvents: "none",
        }}
      />
      <input
        type="text"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Введите название города..."
        value={text}
        onChange={(event) => {
          typing.current = true;
          setText(event.target.value);
          setOpen(true);
          if (hasSelection) onClear();
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (!showList || !items.length) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % items.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index - 1 + items.length) % items.length);
          } else if (event.key === "Enter" && active >= 0) {
            event.preventDefault();
            choose(items[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
        className="w-full bg-background border border-border"
        style={{
          borderRadius: "8px",
          padding: "10px 36px 10px 36px",
          fontSize: "15px",
          outline: "none",
        }}
      />
      {loading && (
        <Loader2
          size={16}
          className="animate-spin text-muted-foreground"
          style={{ position: "absolute", right: "12px", top: "50%", marginTop: "-8px" }}
        />
      )}
      {showList && (
        <ul
          id={listId}
          role="listbox"
          style={{
            position: "absolute",
            zIndex: 20,
            left: 0,
            right: 0,
            top: "calc(100% + 4px)",
            maxHeight: "280px",
            overflowY: "auto",
            margin: 0,
            padding: "4px",
            listStyle: "none",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "0 8px 24px oklch(0 0 0 / 0.12)",
          }}
        >
          {items.map((item, index) => (
            <li
              key={item.code}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(item);
              }}
              onMouseEnter={() => setActive(index)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "9px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                background: index === active ? "var(--surface)" : "transparent",
              }}
            >
              <MapPin size={14} className="text-muted-foreground" style={{ flexShrink: 0 }} />
              <span>
                <strong>{item.name}</strong>
                <span className="text-muted-foreground">
                  {item.label.slice(item.name.length)}
                </span>
              </span>
            </li>
          ))}
          {!items.length && (loading || error || searched) && (
            <li
              className="text-muted-foreground"
              style={{ padding: "10px", fontSize: "13px", cursor: "default" }}
            >
              {loading
                ? "Ищем..."
                : error
                  ? `Не удалось выполнить поиск: ${error}`
                  : "Такой город не найден. Проверьте название."}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
