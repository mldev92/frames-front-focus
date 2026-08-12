import { createFileRoute } from "@tanstack/react-router";
import { Focus, Glasses, Palette, Stethoscope } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { SeoLandingPage, type SeoFaqItem } from "@/components/pages/SeoLandingPage";
import { breadcrumbSchema, faqSchema } from "@/lib/seo-schema";
import { getCatalogPage } from "@/lib/api/bitrix";

const canonical = "https://optika100.com/tsvetnye-linzy-s-dioptriyami/";
const title = "Цветные линзы с диоптриями — купить в Санкт-Петербурге | Оптика 100%";
const description =
  "Цветные контактные линзы с диоптриями для коррекции зрения. Помощь в подборе, консультация специалиста, наличие в салоне Оптика 100% в Санкт-Петербурге.";
const breadcrumbs = [
  { label: "Главная", href: "/" },
  { label: "Линзы СПб", href: "/linzy-spb/" },
  { label: "Цветные линзы с диоптриями" },
];

const faq: SeoFaqItem[] = [
  {
    q: "В каком диапазоне диоптрий выпускают цветные линзы?",
    a: "Диапазон зависит от конкретной модели и производителя. Доступные значения оптической силы показаны в карточке товара; при сложном рецепте наличие лучше уточнить у специалиста.",
  },
  {
    q: "Отличается ли зрение в цветных линзах от прозрачных?",
    a: "Оптическая зона цветной линзы остаётся прозрачной. В сумерках расширенный зрачок может частично заходить под окрашенную область, поэтому у некоторых пользователей меняется периферическое восприятие.",
  },
  {
    q: "Есть ли цветные линзы для астигматизма?",
    a: "Такие модели существуют, но их ассортимент и диапазон цилиндров ограничены. Возможность подбора по конкретному рецепту нужно уточнять у специалиста.",
  },
  {
    q: "Можно ли покупать цветные линзы только по диоптриям очков?",
    a: "Нет. Для контактных линз важны не только оптическая сила, но также радиус кривизны, диаметр и посадка на глазу. Перед первым ношением рекомендуется профессиональный подбор.",
  },
];

function hasCorrectivePower(values?: string[]) {
  return values?.some((value) => {
    const normalized = value.replace("−", "-").replace(",", ".").trim();
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) && parsed !== 0;
  }) ?? false;
}

export const Route = createFileRoute("/tsvetnye-linzy-s-dioptriyami")({
  loader: async () => {
    try {
      const page = await getCatalogPage("tsvetnye", { city: "spb", limit: 24 });
      return page.products.filter((product) => hasCorrectivePower(product.sphere));
    } catch {
      return [];
    }
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { property: "og:image", content: "https://optika100.com/lenses_2.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: [breadcrumbSchema(breadcrumbs), faqSchema(faq)],
  }),
  component: CorrectiveColoredLensesPage,
});

function CorrectiveColoredLensesPage() {
  const products = Route.useLoaderData();

  return (
    <SeoLandingPage
      eyebrow="Цвет и коррекция зрения"
      title="Цветные линзы с диоптриями"
      intro={
        <p>
          Цветные контактные линзы с оптической силой одновременно корректируют зрение и меняют
          или подчёркивают оттенок радужки. Подбирать их нужно так же внимательно, как прозрачные:
          по рецепту, параметрам глаза и посадке конкретной модели.
        </p>
      }
      heroImage="/lenses_2.webp"
      heroAlt="Цветные контактные линзы с диоптриями"
      breadcrumbs={breadcrumbs}
      features={[
        { icon: Palette, title: "Оттенок глаз", text: "Естественные и выразительные варианты", href: "/catalog_s/kontaktnye_linzy_/tsvetnye/" },
        { icon: Glasses, title: "Коррекция зрения", text: "Модели с доступной оптической силой" },
        { icon: Focus, title: "Проверка параметров", text: "Сфера, радиус кривизны и посадка" },
        { icon: Stethoscope, title: "Помощь специалиста", text: "Подбор в салоне на Кирочной, 17", href: "/kabinet-diagnostiki-spb/" },
      ]}
      faq={faq}
      primaryCta={{ label: "Все цветные линзы", href: "/catalog_s/kontaktnye_linzy_/tsvetnye/" }}
      appointmentLabel="Записаться на подбор"
    >
      <h2>Цветные модели с оптической силой</h2>
      <p>
        В этом блоке показаны только товары, для которых действующий каталог передаёт хотя бы одно
        ненулевое значение сферы. Точный диапазон диоптрий и наличие нужного оттенка проверяйте в карточке товара.
      </p>
      {products.length > 0 ? (
        <div className="grid gap-x-5 gap-y-8 not-prose sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              compactLensPreview
              city="spb"
              productHref={`/catalog_s/tsvetnye/${product.slug}/`}
            />
          ))}
        </div>
      ) : (
        <div className="not-prose rounded-2xl border border-border bg-cream/50 p-6">
          <p className="font-medium">Актуальные товары временно не загрузились.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Посмотрите полный каталог цветных линз или уточните подходящую модель у консультанта.
          </p>
          <a href="/catalog_s/kontaktnye_linzy_/tsvetnye/" className="mt-4 inline-flex text-sm font-medium text-brand">
            Перейти в каталог →
          </a>
        </div>
      )}

      <h2>Как устроены цветные линзы</h2>
      <p>
        В качественной цветной линзе пигмент находится внутри материала, а центральная оптическая
        зона остаётся прозрачной. Оттеночные модели усиливают естественный цвет светлой радужки,
        непрозрачные способны заметно изменить и тёмный оттенок глаз.
      </p>

      <h2>Почему нужен отдельный подбор</h2>
      <p>
        Рецепт на очки нельзя автоматически переносить на контактные линзы. Специалист учитывает
        расстояние линзы от глаза, радиус кривизны, диаметр, подвижность и центровку рисунка.
        Неправильная посадка может вызывать нечёткость, сухость или покраснение.
      </p>
      <p>
        Начать можно со страницы <a href="/linzy-spb/">контактные линзы в Санкт-Петербурге</a> или
        сразу записаться в <a href="/kabinet-diagnostiki-spb/">кабинет диагностики зрения</a>.
      </p>

      <h2>Ношение и уход</h2>
      <p>
        Соблюдайте срок замены конкретной модели, не используйте повреждённую линзу и не передавайте
        линзы другому человеку. Модели плановой замены очищают и хранят только в свежем растворе;
        спать в линзах можно исключительно тогда, когда такой режим прямо разрешён производителем и специалистом.
      </p>
    </SeoLandingPage>
  );
}
