import { createFileRoute } from "@tanstack/react-router";
import { Eye, ShieldCheck, Stethoscope, Truck } from "lucide-react";
import { SeoLandingPage, type SeoFaqItem } from "@/components/pages/SeoLandingPage";
import { breadcrumbSchema, faqSchema } from "@/lib/seo-schema";
import { getCatalogPage } from "@/lib/api/bitrix";
import { formatPrice } from "@/lib/store/cart";

const canonical = "https://optika100.com/linzy-spb/";
const title = "Контактные линзы в Санкт-Петербурге — купить с доставкой | Оптика 100%";
const description =
  "Большой выбор контактных линз в Санкт-Петербурге: прозрачные, торические, мультифокальные и цветные. Цены, наличие в салоне, консультация специалиста. Доставка и самовывоз.";

const breadcrumbs = [
  { label: "Главная", href: "/" },
  { label: "Контактные линзы", href: "/catalog_s/kontaktnye_linzy_/" },
  { label: "Линзы СПб" },
];

const lensSections = [
  { key: "prozrachnye", label: "Прозрачные линзы", anchor: "прозрачные линзы", href: "/catalog_s/kontaktnye_linzy_/prozrachnye/" },
  { key: "toricheskie", label: "Торические линзы", anchor: "торические", href: "/catalog_s/kontaktnye_linzy_/toricheskie/" },
  { key: "multifokalnye", label: "Мультифокальные линзы", anchor: "мультифокальные", href: "/catalog_s/kontaktnye_linzy_/multifokalnye/" },
  { key: "tsvetnye", label: "Цветные линзы", anchor: "цветные", href: "/catalog_s/kontaktnye_linzy_/tsvetnye/" },
  { key: "dlya_kontrolya_miopii", label: "Контроль миопии", anchor: "для контроля миопии", href: "/catalog_s/kontaktnye_linzy_/dlya_kontrolya_miopii/" },
] as const;

const faq: SeoFaqItem[] = [
  {
    q: "Можно ли купить контактные линзы без рецепта?",
    a: "Линзы продаются без рецепта, но перед первой покупкой рекомендуется пройти диагностику. Специалист определит оптическую силу, радиус кривизны и диаметр, чтобы линза сидела комфортно и безопасно.",
  },
  {
    q: "Чем отличаются однодневные, двухнедельные и месячные линзы?",
    a: "Однодневные линзы каждый день заменяют новыми. Двухнедельные и месячные модели требуют ежедневной очистки и хранения в растворе, но обычно обходятся дешевле в пересчёте на день ношения.",
  },
  {
    q: "Как понять, что линзы подходят?",
    a: "Правильно подобранная линза не вызывает покраснения, слезотечения, нечёткости или выраженного дискомфорта к концу дня. При таких симптомах нужно прекратить ношение и обратиться к специалисту.",
  },
  {
    q: "Есть ли доставка по Санкт-Петербургу?",
    a: "Да, заказ можно оформить с доставкой или самовывозом из салона на Кирочной, 17. Фактический срок и доступный способ получения показываются при оформлении заказа.",
  },
];

export const Route = createFileRoute("/linzy-spb")({
  loader: async () => {
    const results = await Promise.allSettled(
      lensSections.map(async (section) => {
        const page = await getCatalogPage(section.key, { city: "spb", limit: 1 });
        return { key: section.key, total: page.total, minPrice: page.priceBounds.min };
      }),
    );
    return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { property: "og:image", content: "https://optika100.com/categ_contact_lens_v4.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: [breadcrumbSchema(breadcrumbs), faqSchema(faq)],
  }),
  component: LinzySpbPage,
});

function LinzySpbPage() {
  const prices = Route.useLoaderData();

  return (
    <SeoLandingPage
      eyebrow="Контактная коррекция зрения"
      title="Контактные линзы в Санкт-Петербурге"
      intro={
        <p>
          В салоне «Оптика 100%» на <strong>ул. Кирочная, 17</strong> можно подобрать контактные линзы,
          проверить зрение и оформить доставку или самовывоз. В каталоге представлены прозрачные,
          торические, мультифокальные, цветные модели и линзы для контроля миопии.
        </p>
      }
      heroImage="/categ_contact_lens_v4.webp"
      heroAlt="Контактные линзы в каталоге Оптика 100%"
      breadcrumbs={breadcrumbs}
      features={[
        { icon: Eye, title: "Выбор по задаче", text: "Пять основных категорий контактных линз", href: "/catalog_s/kontaktnye_linzy_/" },
        { icon: Stethoscope, title: "Профессиональный подбор", text: "Проверка зрения и параметров линз", href: "/kabinet-diagnostiki-spb/" },
        { icon: Truck, title: "Доставка и самовывоз", text: "Актуальный способ получения при заказе", href: "/payment/" },
        { icon: ShieldCheck, title: "Проверенные бренды", text: "Товары из действующего каталога", href: "/catalog_s/kontaktnye_linzy_/" },
      ]}
      faq={faq}
      primaryCta={{ label: "Перейти в каталог", href: "/catalog_s/kontaktnye_linzy_/" }}
      appointmentLabel="Записаться на подбор линз"
    >
      <h2>Цены и покупка контактных линз</h2>
      <p>
        Цены ниже загружаются из действующего каталога. Наличие конкретных параметров — сферы,
        цилиндра, оси, аддидации и радиуса кривизны — проверяется в карточке товара перед заказом.
      </p>
      <div className="grid gap-4 not-prose sm:grid-cols-2 lg:grid-cols-3">
        {lensSections.map((section) => {
          const data = prices.find((item) => item.key === section.key);
          return (
            <a key={section.key} href={section.href} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/40">
              <span className="block font-medium">{section.label}</span>
              <span className="mt-2 block text-sm text-muted-foreground">
                {data && data.minPrice > 0 ? `от ${formatPrice(data.minPrice)}` : "Посмотреть актуальные цены"}
              </span>
              <span className="mt-4 inline-flex text-sm font-medium text-brand">Купить в каталоге →</span>
            </a>
          );
        })}
      </div>

      <h2>Какие контактные линзы можно выбрать</h2>
      <ul>
        {lensSections.map((section) => (
          <li key={section.key}>
            <a href={section.href}>{section.anchor}</a> — модели для соответствующего типа коррекции и режима ношения.
          </li>
        ))}
      </ul>
      <p>
        Если важна одновременно коррекция зрения и изменение оттенка глаз, посмотрите отдельную
        страницу <a href="/tsvetnye-linzy-s-dioptriyami/">цветные линзы с диоптриями</a>.
      </p>

      <h2>Как проходит подбор</h2>
      <p>
        Специалист уточняет привычный режим ношения, проверяет остроту зрения и параметры глаза,
        после чего подбирает тип, оптическую силу, радиус кривизны и материал линзы. При первой
        покупке важно оценить посадку и качество зрения в выбранной модели.
      </p>
      <p>
        Для записи доступен <a href="/kabinet-diagnostiki-spb/">кабинет диагностики зрения</a>.
        Контактные линзы нельзя выбирать только по рецепту на очки: расстояние между линзой и глазом,
        посадка и характеристики материала влияют на итоговую коррекцию.
      </p>

      <h2>Получение заказа в Санкт-Петербурге</h2>
      <p>
        Заказ можно получить в салоне «Оптика 100%» на Кирочной, 17 или оформить доставку.
        Подтверждение наличия и срок получения сообщаются при оформлении заказа. Не вскрывайте
        упаковку до проверки всех параметров: контактные линзы относятся к товарам индивидуального назначения.
      </p>
    </SeoLandingPage>
  );
}
