import type { CityCode } from "@/lib/store/city";
import { formatRub } from "@/lib/format-rub";

/**
 * Прейскурант на услуги мастера. Источник — прайс-лист ИП Левочкина Е. А.
 * (файл «услуги.xls», листы «СПБ» и «НКВЗ»), цены указаны на 01.10.2026.
 * Уточнение владельца от 04.10.2026: SILHOUETTE в СПб — за штуку,
 * плёнка на заушник — 200 ₽ в обоих городах.
 *
 * Цены в Санкт-Петербурге и Новокузнецке различаются, поэтому таблица
 * хранится одним списком с ценой по каждому городу: услуга, которой в городе
 * нет, просто не имеет цены и в таблицу этого города не попадает.
 */
export type RepairPriceRow = {
  /** Название услуги. */
  name: string;
  /** Название для города, если в прайс-листе оно отличается (единица измерения). */
  names?: Partial<Record<CityCode, string>>;
  /** Цена в рублях по городам. Отсутствие цены = услуга в городе не оказывается. */
  prices: Partial<Record<CityCode, number>>;
};

/** Дата, на которую действует прайс-лист. */
export const REPAIR_PRICES_DATE = "01.10.2026";

export const REPAIR_PRICES: RepairPriceRow[] = [
  { name: "Выправка оправы безободковой", prices: { spb: 600, nvk: 600 } },
  { name: "Выправка оправы на леске", prices: { spb: 500, nvk: 500 } },
  { name: "Выправка оправы ободковой", prices: { spb: 400, nvk: 400 } },
  { name: "Замена заушника (шт.)", prices: { spb: 500, nvk: 500 } },
  { name: "Замена лески (шт.)", prices: { spb: 500, nvk: 500 } },
  { name: "Замена наконечника (шт.)", prices: { spb: 400, nvk: 200 } },
  {
    name: "Замена носоупора SILHOUETTE",
    names: {
      spb: "Замена носоупора SILHOUETTE (шт.)",
      nvk: "Замена носоупора SILHOUETTE (шт.)",
    },
    prices: { spb: 500, nvk: 400 },
  },
  { name: "Замена силиконового носоупора (шт.)", prices: { spb: 250 } },
  { name: "Замена носоупора (шт.)", prices: { spb: 200, nvk: 200 } },
  { name: "Нарезка резьбы (шт.)", prices: { spb: 200, nvk: 200 } },
  { name: "Переустановка линз в оправу клиента (пара)", prices: { spb: 400 } },
  { name: "Ремонт крепления заушника", prices: { spb: 1200, nvk: 1200 } },
  { name: "Снятие тонировки (пара)", prices: { nvk: 500 } },
  { name: "Срочное изготовление очков (пара)", prices: { spb: 500 } },
  { name: "Срочная работа вне очереди", prices: { nvk: 1000 } },
  { name: "Тонировка однотонная с UV-защитой (пара)", prices: { spb: 1300, nvk: 1300 } },
  { name: "Тонировка градиент с UV-защитой (пара)", prices: { spb: 1500 } },
  { name: "Тонировка упрочняющая с UV-защитой (пара)", prices: { nvk: 1500 } },
  { name: "Уплотнение линзы в оправе (шт.)", prices: { spb: 300, nvk: 300 } },
  { name: "Установка (замена) винта или гайки (шт.)", prices: { spb: 100, nvk: 100 } },
  { name: "Установка (замена) втулки (шт.)", prices: { spb: 250, nvk: 200 } },
  { name: "Установка колпачка на винт (шт.)", prices: { spb: 50, nvk: 50 } },
  { name: "Установка накладки на носоупоры (шт.)", prices: { nvk: 100 } },
  { name: "Установка термоусадочной плёнки на заушник (шт.)", prices: { spb: 200, nvk: 200 } },
  { name: "Установка линз в оправу безободковую", prices: { spb: 1300, nvk: 1500 } },
  { name: "Установка линз в оправу на леске", prices: { spb: 1100, nvk: 1300 } },
  { name: "Установка линз в оправу ободковую", prices: { spb: 900, nvk: 1100 } },
  { name: "Установка линз в оправу повторная", prices: { spb: 1800, nvk: 1800 } },
  { name: "Установка страз (шт.)", prices: { nvk: 100 } },
  { name: "Фиксация крепёжного элемента (шт.)", prices: { spb: 50, nvk: 50 } },
  { name: "Чистка оправы в УЗ-ванне", prices: { spb: 300, nvk: 200 } },
  { name: "Экстракция винта (шт.)", prices: { spb: 600, nvk: 600 } },
];

export type RepairPrice = { name: string; price: string };

/** Прейскурант одного города: только услуги, которые в нём оказываются. */
export const repairPricesFor = (city: CityCode): RepairPrice[] =>
  REPAIR_PRICES.flatMap((row) => {
    const price = row.prices[city];
    if (price === undefined) return [];
    return [{ name: row.names?.[city] ?? row.name, price: formatRub(price) }];
  });

/** Делит прейскурант на две колонки одинаковой высоты для вёрстки в две полосы. */
export const repairPriceColumns = (city: CityCode): RepairPrice[][] => {
  const rows = repairPricesFor(city);
  const half = Math.ceil(rows.length / 2);
  return [rows.slice(0, half), rows.slice(half)];
};
