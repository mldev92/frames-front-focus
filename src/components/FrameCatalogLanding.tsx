import { useState } from "react";
import type { CatalogPage } from "@/lib/api/bitrix";
import { CONTACT, PRIMARY_SALON } from "@/data/contact";
import { frameBreadcrumbs } from "@/data/frame-catalog-seo";
import {
  frameBrandHref,
  frameFacetEntries,
  framePriceRange,
  matchesFrameBrand,
  LIONS_HEART_PATH,
  WOMENS_FRAMES_PATH,
} from "@/lib/frame-landing";

type Props = { kind: "women" | "brand"; data: CatalogPage };
const womenHref = `/catalog_s/${WOMENS_FRAMES_PATH}/`;
const brandHref = `/catalog_s/${LIONS_HEART_PATH}/`;
const linkClass = "text-brand underline-offset-4 hover:underline";

export function FrameLandingBreadcrumbs({ path }: { path: string }) {
  const items = frameBreadcrumbs(path);
  return (
    <nav
      aria-label="Хлебные крошки"
      className="mb-6 flex flex-wrap gap-2 text-xs text-muted-foreground"
    >
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 && (
            <span aria-hidden="true" className="mr-2">
              /
            </span>
          )}
          {index === items.length - 1 ? (
            <span aria-current="page">{item.label}</span>
          ) : (
            <a href={item.href} className="hover:underline">
              {item.label}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}

export function FrameLandingIntro({ kind, data }: Props) {
  const price = framePriceRange(data);
  return (
    <div className="mb-10 max-w-3xl space-y-5">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-widest text-muted-foreground">
        <span>{data.total.toLocaleString("ru-RU")} позиций в каталоге</span>
        {kind === "women" && <span>{frameFacetEntries(data, "brand").length} брендов</span>}
        {price && <span>{price}</span>}
      </div>
      <p className="text-base leading-7 text-foreground/80">
        {kind === "women"
          ? "Сравните формы, материалы и размеры. Примерьте оправу на Кирочной, 17 в Санкт-Петербурге и подберите линзы по рецепту."
          : "В каталоге LION’S HEART собраны мужские и женские оправы. Сравните формы, материалы и размеры, затем уточните наличие выбранной модели в салоне на Кирочной, 17 в Санкт-Петербурге."}
      </p>
      <div className="flex flex-wrap gap-3">
        <a href="#catalog-products" className="rounded-full bg-ink px-4 py-3 text-sm text-white">
          Смотреть каталог
        </a>
        <a
          href="/podbor-ochkov/"
          className="rounded-full border border-border px-4 py-3 text-sm hover:border-ink"
        >
          Подобрать оправу
        </a>
      </div>
    </div>
  );
}

function BrandDirectory({ data }: { data: CatalogPage }) {
  const [query, setQuery] = useState("");
  const brands = frameFacetEntries(data, "brand");
  const matches = brands.filter(([name]) => matchesFrameBrand(name, query));
  const renderBrands = (items: typeof brands) => (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([brand, count]) => (
        <li key={brand}>
          <a
            href={frameBrandHref(brand)}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm hover:border-ink"
          >
            <span className="min-w-0 break-words">{brand}</span>
            <span className="text-muted-foreground">{count}</span>
          </a>
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-labelledby="frame-brands" className="space-y-5">
      <h2 id="frame-brands" className="font-serif text-3xl">
        Бренды женских оправ
      </h2>
      <p className="text-sm text-muted-foreground">
        Количество рядом с брендом относится к женскому каталогу. Страница LION’S HEART показывает
        весь ассортимент бренда.
      </p>
      <label className="block max-w-md space-y-2 text-sm">
        <span>Поиск по бренду</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Например, Guess или Гесс"
          className="w-full rounded-lg border border-border bg-background px-4 py-3"
        />
      </label>
      <p role="status" className="text-sm text-muted-foreground">
        Найдено брендов: {matches.length}
      </p>
      {renderBrands(matches.slice(0, 9))}
      {matches.length > 9 && (
        <details key={query ? "search" : "all"} open={query ? true : undefined}>
          <summary className="mb-4 cursor-pointer text-sm text-brand">
            Все бренды ({matches.length})
          </summary>
          {renderBrands(matches.slice(9))}
        </details>
      )}
      {!matches.length && <p>Бренд не найден. Попробуйте другое написание.</p>}
    </section>
  );
}

export function FrameLandingFooter({ kind, data }: Props) {
  const price = framePriceRange(data);
  const faq = [
    {
      q: kind === "women" ? "Как выбрать женскую оправу?" : "Как выбрать оправу LION’S HEART?",
      a: "Учитывайте параметры рецепта, размер и посадку. На примерке специалист проверит положение оправы на переносице и заушниках и возможность установки выбранных линз.",
    },
    {
      q: "Какая оправа подойдёт для круглого лица?",
      a: "Можно начать с прямоугольных, квадратных моделей или формы «кошачий глаз». Это ориентир для примерки: окончательный выбор зависит от ваших предпочтений, размера оправы и посадки.",
    },
    {
      q: kind === "women" ? "Сколько стоят женские оправы?" : "Сколько стоят оправы LION’S HEART?",
      a: price
        ? `В текущем каталоге цены ${price}. Линзы и работы рассчитываются отдельно; итоговая стоимость зависит от рецепта и выбранной комплектации.`
        : "Актуальные цены указаны в карточках каталога. Линзы и работы рассчитываются отдельно.",
    },
    {
      q: "Можно ли установить линзы в любую оправу?",
      a: "Совместимость зависит от рецепта, конструкции, размеров и состояния оправы. Возможность установки линз в вашу оправу специалист определит после осмотра.",
    },
    {
      q: "Можно ли поставить прогрессивные линзы?",
      a: "Специалист проверит высоту светового проёма и посадку конкретной оправы и подберёт подходящий дизайн линз. Совместимость оценивается на примерке.",
    },
    {
      q: "Где примерить оправу в Санкт-Петербурге?",
      a: `${PRIMARY_SALON.address}, метро ${PRIMARY_SALON.metro}. ${PRIMARY_SALON.hours}. Перед поездкой уточните наличие выбранной модели по телефону ${CONTACT.phone.label}.`,
    },
  ];
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-6 py-12 lg:px-8">
      {kind === "women" && <BrandDirectory data={data} />}
      <section className="max-w-4xl space-y-5 text-[15px] leading-7 [&_a:hover]:underline">
        <h2 className="font-serif text-3xl">
          {kind === "women"
            ? "Женские оправы для очков в Санкт-Петербурге"
            : "Как выбрать оправу LION’S HEART"}
        </h2>
        <p>
          {kind === "women"
            ? "Сравните формы и материалы в каталоге, а посадку оцените на примерке. Параметры рецепта и размеры оправы помогут сузить выбор."
            : "Выбирайте конкретную модель по её характеристикам. Материал, размеры и конструкция указаны в карточке; наличие клипона нужно проверять для каждой модели отдельно."}
        </p>
        <h3 className="text-lg font-semibold">Формы и материалы</h3>
        <p>
          Прямоугольные и квадратные оправы создают чёткий силуэт, круглые и овальные — более
          мягкий. «Кошачий глаз» и бабочка выделяют верхнюю линию оправы. Удобство зависит от
          размеров и посадки конкретной модели.
        </p>
        <p>
          Сравните пластик, ацетат, металл и титан в фильтре материалов. Вес и комфорт зависят от
          всей конструкции. При чувствительности к металлам уточните состав сплава, покрытие и
          материал деталей, соприкасающихся с кожей.
        </p>
        {kind === "women" && (
          <div className="grid gap-6 sm:grid-cols-2">
            {(["shape", "material"] as const).map((facet) => (
              <div key={facet}>
                <h3 className="mb-3 text-lg font-semibold">
                  {facet === "shape" ? "Формы в каталоге" : "Материалы в каталоге"}
                </h3>
                <ul className="space-y-2">
                  {frameFacetEntries(data, facet).map(([value, count]) => (
                    <li key={value}>
                      <a
                        href={`${womenHref}?${facet}=${encodeURIComponent(value)}`}
                        className={linkClass}
                      >
                        {value} <span className="text-muted-foreground">({count})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        <h3 className="text-lg font-semibold">Размеры и рецепт</h3>
        <p>
          Сопоставьте ширину линзы, ширину переносицы и длину заушника с удобной для вас оправой.
          Ширина линзы не равна общей ширине оправы. Для прогрессивных линз важны высота светового
          проёма и посадка; при сильной коррекции размер и форму лучше выбирать вместе со
          специалистом.
        </p>
        <h3 className="text-lg font-semibold">Цены и наличие</h3>
        <p>
          {price
            ? `Цены на оправы в текущем каталоге — ${price}. `
            : "Цены смотрите в карточках каталога. "}
          Стоимость линз и работ зависит от рецепта и комплектации. Каталог включает разные варианты
          наличия: перед поездкой уточните, находится ли выбранная модель в салоне.
        </p>
      </section>
      <section aria-labelledby="frame-faq" className="max-w-4xl">
        <h2 id="frame-faq" className="mb-6 font-serif text-3xl">
          Вопросы о выборе оправы
        </h2>
        {faq.map(({ q, a }) => (
          <details key={q} className="border-b border-border py-4">
            <summary className="cursor-pointer font-medium">{q}</summary>
            <p className="mt-3 text-sm leading-7 text-foreground/80">{a}</p>
          </details>
        ))}
      </section>
      <section className="max-w-4xl space-y-5">
        <h2 className="font-serif text-3xl">Смотрите также</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <a className={linkClass} href={kind === "women" ? brandHref : womenHref}>
            {kind === "women" ? "Оправы LION’S HEART" : "Все женские оправы"}
          </a>
          <a className={linkClass} href="/catalog_s/opravy/">
            Все оправы
          </a>
          <a className={linkClass} href="/podbor-ochkov/">
            Подбор очков
          </a>
          <a className={linkClass} href="/uslugi/">
            Услуги и стоимость
          </a>
          <a className={linkClass} href="/catalog_s/linzy_dlya_ochkov/?design=Прогрессивные">
            Прогрессивные линзы
          </a>
        </div>
      </section>
      <section className="max-w-4xl rounded-2xl bg-surface p-6 sm:p-8">
        <h2 className="font-serif text-3xl">Подобрать оправу в салоне</h2>
        <p className="my-4 text-sm leading-7">
          {PRIMARY_SALON.address}. Метро {PRIMARY_SALON.metro}. {PRIMARY_SALON.hours}. Специалист
          поможет оценить посадку и подобрать линзы по вашему рецепту.
        </p>
        <a
          href={CONTACT.phone.href}
          className="inline-flex rounded-full bg-ink px-5 py-3 text-sm text-white"
        >
          Позвонить {CONTACT.phone.label}
        </a>
      </section>
    </div>
  );
}
