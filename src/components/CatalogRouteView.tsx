import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CatalogListing, type CatalogStateChange } from "@/components/CatalogListing";
import { CatalogSeoContent } from "@/components/CatalogSeoContent";
import {
  ContactLensCatalogFooter,
  ContactLensCatalogGuide,
  ContactLensCatalogNavigation,
} from "@/components/ContactLensCatalogSeo";
import { LensLinesCatalog } from "@/components/LensLinesCatalog";
import { LensSearch } from "@/components/LensSearch";
import { categoryForCatalogPath, catalogSectionTitle } from "@/data/categories";
import { catalogConfig } from "@/routes/catalog_s.$category";
import { searchToFilters, type CatalogSearch, type LoaderResult } from "@/lib/catalog-route";
import { useCityStore, type CityCode } from "@/lib/store/city";

interface CatalogRouteViewProps {
  sectionPath: string;
  catalogPath: string;
  city: CityCode;
  result: LoaderResult;
  search: CatalogSearch;
  onRetry: () => void;
  onStateChange: (next: CatalogStateChange) => void;
}

function CatalogMessage({
  title,
  text,
  onRetry,
}: {
  title: string;
  text: string;
  onRetry: () => void;
}) {
  return (
    <div className="w-full py-24 text-center">
      <div className="font-serif text-2xl text-foreground/70 mb-3">{title}</div>
      <p className="text-sm text-muted-foreground mb-6">{text}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 border border-border rounded-full px-5 py-2.5 text-sm hover:border-ink hover:bg-surface transition-all"
        style={{ transitionDuration: "var(--duration-snap)" }}
      >
        Попробовать снова
      </button>
    </div>
  );
}

export function CatalogRouteView({
  sectionPath,
  catalogPath,
  city,
  result,
  search,
  onRetry,
  onStateChange,
}: CatalogRouteViewProps) {
  const setCity = useCityStore((state) => state.setCity);
  const pending = useRouterState({ select: (state) => state.status === "pending" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setCity(city), [city, setCity]);

  const category = categoryForCatalogPath(sectionPath);
  if (!category) {
    return (
      <CatalogMessage title="Раздел не найден" text="Проверьте адрес страницы." onRetry={onRetry} />
    );
  }

  const config = catalogConfig[category];
  const normalizedSectionPath = sectionPath.replace(/^\/+|\/+$/g, "");
  const isContactLensRoot = city === "spb" && normalizedSectionPath === "kontaktnye_linzy_";
  const isLensRoot = normalizedSectionPath === "linzy_dlya_ochkov";

  // Каталог 74 линеек работает от единой базы подборщика. Он не должен
  // падать из-за состояния больше не показываемого Bitrix-индекса.
  if (isLensRoot) {
    const appliedFilters = searchToFilters(search);
    return (
      <>
        <div className="w-full py-10" style={{ paddingLeft: "24px", paddingRight: "24px" }}>
          <div className="mb-8">
            <h1 className="font-serif text-4xl lg:text-5xl">
              {catalogSectionTitle(sectionPath, config.title)}
            </h1>
            {config.subtitle && (
              <p className="mt-3 text-muted-foreground max-w-2xl">{config.subtitle}</p>
            )}
          </div>
          <LensSearch />
          <LensLinesCatalog
            initialFilters={appliedFilters}
            appliedSort={search.sort ?? "default"}
            appliedPriceMin={search.priceMin}
            appliedPriceMax={search.priceMax}
            page={search.page ?? 1}
            onStateChange={onStateChange}
          />
        </div>
        {city === "spb" && <CatalogSeoContent sectionPath={sectionPath} />}
      </>
    );
  }

  if (result.state === "index_not_ready") {
    return (
      <CatalogMessage
        title="Каталог обновляется"
        text="Идёт обновление каталога — это занимает около минуты. Попробуйте обновить страницу."
        onRetry={onRetry}
      />
    );
  }
  if (result.state === "error") {
    return (
      <CatalogMessage
        title="Не удалось загрузить каталог"
        text="Проверьте соединение и попробуйте ещё раз."
        onRetry={onRetry}
      />
    );
  }
  if (result.state === "lens_lines") {
    return (
      <CatalogMessage
        title="Раздел недоступен"
        text="Попробуйте обновить страницу."
        onRetry={onRetry}
      />
    );
  }

  const supportsFacetFiltering = Object.keys(result.data.facets ?? {}).length > 0;
  const appliedFilters = supportsFacetFiltering ? searchToFilters(search) : {};

  return (
    <>
      <CatalogListing
        title={
          isContactLensRoot
            ? "Контактные линзы в Санкт-Петербурге"
            : catalogSectionTitle(sectionPath, config.title)
        }
        subtitle={isContactLensRoot ? undefined : config.subtitle}
        headerBeforeTitle={isContactLensRoot ? <ContactLensCatalogNavigation /> : undefined}
        catalogId={isContactLensRoot ? "catalog-products" : undefined}
        data={result.data}
        facets={config.facets ?? []}
        facetFilteringEnabled={supportsFacetFiltering}
        categoryKey={category}
        initialFilters={appliedFilters}
        expandedFacet={search.expand}
        appliedSort={search.sort ?? "default"}
        appliedPriceMin={search.priceMin}
        appliedPriceMax={search.priceMax}
        page={search.page ?? 1}
        loading={mounted && pending}
        productBasePath={catalogPath}
        city={city}
        onStateChange={onStateChange}
      />
      {isContactLensRoot && <ContactLensCatalogGuide total={result.data.total} />}
      {isContactLensRoot && <ContactLensCatalogFooter />}
      {city === "spb" && <CatalogSeoContent sectionPath={sectionPath} />}
    </>
  );
}
