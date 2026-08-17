import { createFileRoute } from "@tanstack/react-router";
import { Eye, ShieldCheck, Stethoscope, Truck } from "lucide-react";
import { useEffect } from "react";
import { SeoLandingPage, type SeoFaqItem } from "@/components/pages/SeoLandingPage";
import { breadcrumbSchema, faqSchema } from "@/lib/seo-schema";
import { getCatalogPage } from "@/lib/api/bitrix";
import { formatPrice } from "@/lib/store/cart";
import { useCityStore } from "@/lib/store/city";

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
    q: "Можно ли купить линзы в СПб с доставкой в тот же день?",
    a: "Возможность доставки в день заказа зависит от выбранной модели, наличия нужных параметров и доступного способа получения. Актуальный срок показывается при оформлении заказа или уточняется у консультанта.",
  },
  {
    q: "Какие линзы подойдут при астигматизме?",
    a: "Для коррекции астигматизма используют торические контактные линзы. Их подбирают с учётом не только оптической силы, но и цилиндра, оси, радиуса кривизны и посадки на глазу.",
  },
  {
    q: "Нужен ли рецепт для покупки контактных линз?",
    a: "Линзы продаются без рецепта, но перед первой покупкой рекомендуется пройти диагностику. Специалист определит оптическую силу, радиус кривизны и диаметр, чтобы линза сидела комфортно и безопасно.",
  },
  {
    q: "Сколько стоят контактные линзы на месяц?",
    a: "Стоимость зависит от модели, количества линз в упаковке и режима замены. Актуальные цены загружаются из каталога на этой странице, а итоговую стоимость выбранных параметров можно проверить в карточке товара.",
  },
  {
    q: "Чем отличаются однодневные, двухнедельные и месячные линзы?",
    a: "Однодневные линзы каждый день заменяют новыми. Двухнедельные и месячные модели требуют ежедневной очистки и хранения в растворе, но обычно обходятся дешевле в пересчёте на день ношения.",
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
  const city = useCityStore((state) => state.city);
  const cityHydrated = useCityStore((state) => state.hydrated);
  const setCity = useCityStore((state) => state.setCity);

  useEffect(() => {
    if (cityHydrated && city !== "spb") setCity("spb");
  }, [city, cityHydrated, setCity]);

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
      primaryCta={{ label: "Купить контактные линзы", href: "/catalog_s/kontaktnye_linzy_/" }}
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

      <h2>Материалы контактных линз</h2>
      <p>
        Гидрогелевые линзы мягкие и содержат много влаги, а силикон-гидрогелевые материалы обычно
        пропускают к роговице больше кислорода. Подходящий материал зависит от состояния слёзной
        плёнки, продолжительности ношения, работы за экраном и индивидуальной реакции глаза.
        Ориентироваться только на влагосодержание или популярность бренда не стоит.
      </p>

      <h2>Как выбрать линзы под образ жизни</h2>
      <ul>
        <li><strong>Для регулярной работы за компьютером</strong> важны стабильное увлажнение, достаточная кислородная проницаемость и перерывы для глаз.</li>
        <li><strong>При сезонной аллергии</strong> однодневный режим помогает не накапливать пыльцу и отложения на одной паре.</li>
        <li><strong>Для спорта и поездок</strong> удобны однодневные модели, но плавать в контактных линзах без специальных герметичных очков нельзя.</li>
        <li><strong>При редком ношении</strong> однодневные линзы часто практичнее моделей плановой замены, срок которых идёт после вскрытия упаковки.</li>
      </ul>

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

      <h2>Как читать параметры перед онлайн-заказом</h2>
      <ul>
        <li><strong>SPH</strong> — оптическая сила отдельно для правого и левого глаза.</li>
        <li><strong>BC</strong> — базовая кривизна, влияющая на посадку линзы.</li>
        <li><strong>DIA</strong> — диаметр контактной линзы.</li>
        <li><strong>CYL и AX</strong> нужны для торических моделей, а <strong>ADD</strong> — для мультифокальных.</li>
      </ul>
      <p>
        Рецепт на очки нельзя механически переносить в заказ контактных линз: кроме оптической силы
        отличаются условия расположения коррекции и параметры посадки. Если параметры уже известны,
        выберите товар в каталоге, укажите значения для каждого глаза и доступный способ получения.
      </p>

      <h2>Однодневные и линзы плановой замены</h2>
      <p>
        Однодневную пару вечером выбрасывают, поэтому раствор и контейнер не нужны. Двухнедельные и
        месячные модели экономичнее при постоянном ношении, но требуют ежедневной механической
        очистки, свежего раствора и регулярной замены контейнера. Срок замены считают от вскрытия,
        а не по числу дней, когда линзу фактически надевали.
      </p>

      <h2>Когда линзы нужно снять</h2>
      <p>
        Резкая боль, стойкое ощущение инородного тела, светобоязнь, выраженное покраснение или
        затуманивание зрения — повод сразу снять линзы и обратиться к офтальмологу. Повреждённую
        линзу и блистер лучше сохранить до консультации.
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
