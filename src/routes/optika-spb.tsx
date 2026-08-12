import { createFileRoute } from "@tanstack/react-router";
import { Clock, Glasses, MapPin, Stethoscope } from "lucide-react";
import { SeoLandingPage, type SeoFaqItem } from "@/components/pages/SeoLandingPage";
import { breadcrumbSchema, faqSchema } from "@/lib/seo-schema";
import { CONTACT, PRIMARY_SALON } from "@/data/contact";

const canonical = "https://optika100.com/optika-spb/";
const title = "Оптика в Санкт-Петербурге — очки, линзы и диагностика зрения | Оптика 100%";
const description =
  "Салон оптики в Санкт-Петербурге: подбор и покупка очков, контактных линз, солнцезащитных очков, диагностика и биометрия зрения. Адрес салона, запись на приём.";
const breadcrumbs = [{ label: "Главная", href: "/" }, { label: "Оптика в Санкт-Петербурге" }];

const faq: SeoFaqItem[] = [
  {
    q: "Где находится салон в Санкт-Петербурге?",
    a: "Салон находится по адресу ул. Кирочная, 17, рядом с метро «Чернышевская». Он работает ежедневно с 10:00 до 20:00.",
  },
  {
    q: "Нужно ли записываться на диагностику заранее?",
    a: "Предварительная запись рекомендуется, чтобы специалист мог принять вас в удобное время. Записаться можно на сайте или по телефону 8-800-700-0214.",
  },
  {
    q: "Можно ли заказать очки по готовому рецепту?",
    a: "Да. Можно принести действующий рецепт, выбрать оправу и очковые линзы. Если параметры зрения изменились или рецепт вызывает вопросы, перед заказом лучше пройти повторную проверку.",
  },
  {
    q: "Работает ли салон с детьми?",
    a: "В каталоге есть детские оправы и решения для контроля миопии. Возможность конкретной диагностики или подбора для ребёнка уточняется при записи.",
  },
];

const localBusinessSchema = {
  type: "application/ld+json",
  children: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Optician",
    name: "Оптика 100%",
    url: canonical,
    telephone: CONTACT.phone.label,
    email: CONTACT.email.label,
    address: {
      "@type": "PostalAddress",
      streetAddress: "ул. Кирочная, 17",
      addressLocality: "Санкт-Петербург",
      postalCode: "191123",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: PRIMARY_SALON.coordinates.lat,
      longitude: PRIMARY_SALON.coordinates.lon,
    },
    openingHours: "Mo-Su 10:00-20:00",
  }),
};

export const Route = createFileRoute("/optika-spb")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { property: "og:image", content: "https://optika100.com/salon_kirochnaya.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: canonical }],
    scripts: [breadcrumbSchema(breadcrumbs), faqSchema(faq), localBusinessSchema],
  }),
  component: OptikaSpbPage,
});

function OptikaSpbPage() {
  return (
    <SeoLandingPage
      eyebrow="Салон на Кирочной, 17"
      title="Оптика в Санкт-Петербурге"
      intro={
        <p>
          «Оптика 100%» — салон в Санкт-Петербурге, где можно проверить зрение, подобрать очки или
          контактные линзы и заказать изготовление очков по индивидуальным параметрам.
        </p>
      }
      heroImage="/salon_kirochnaya.webp"
      heroAlt="Интерьер салона Оптика 100% на Кирочной, 17"
      breadcrumbs={breadcrumbs}
      features={[
        { icon: MapPin, title: "ул. Кирочная, 17", text: `м. ${PRIMARY_SALON.metro}, Санкт-Петербург`, href: PRIMARY_SALON.productionPath },
        { icon: Stethoscope, title: "Диагностика зрения", text: "Проверка зрения и подбор коррекции", href: "/kabinet-diagnostiki-spb/" },
        { icon: Glasses, title: "Очки и линзы", text: "Каталог оправ, линз и солнцезащитных очков", href: "/catalog_s/opravy/" },
        { icon: Clock, title: "Ежедневно", text: PRIMARY_SALON.hours, href: "/contacts/" },
      ]}
      faq={faq}
      primaryCta={{ label: "Выбрать оправу", href: "/catalog_s/opravy/" }}
      appointmentLabel="Записаться на приём"
    >
      <h2>Товары и услуги салона</h2>
      <div className="grid gap-4 not-prose sm:grid-cols-2">
        {[
          ["Контактные линзы в Санкт-Петербурге", "/linzy-spb/", "Каталог, цены, доставка и профессиональный подбор."],
          ["Оправы для очков", "/catalog_s/opravy/", "Взрослые и детские оправы разных форм и материалов."],
          ["Солнцезащитные очки", "/catalog_s/solntsezashchitnye_ochki/", "Модели с защитой от ультрафиолета."],
          ["Подбор очков", "/podbor-ochkov/", "Проверка параметров и выбор подходящей коррекции."],
          ["Диагностика зрения", "/kabinet-diagnostiki-spb/", "Комплексная проверка зрения в Санкт-Петербурге."],
          ["Биометрия глаза", "/biometriya-glaza/", "Подробное измерение параметров глаза."],
        ].map(([label, href, text]) => (
          <a key={href} href={href} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-brand/40">
            <span className="block font-medium">{label}</span>
            <span className="mt-2 block text-sm leading-6 text-muted-foreground">{text}</span>
          </a>
        ))}
      </div>

      <h2>Проверка зрения и подбор коррекции</h2>
      <p>
        В кабинете диагностики специалист оценивает остроту зрения и необходимые параметры
        коррекции. По результатам можно подобрать оправу и очковые линзы, контактные линзы или
        получить рекомендации по дальнейшему наблюдению.
      </p>
      <p>
        Для подробного измерения анатомических параметров доступна отдельная услуга
        <a href="/biometriya-glaza/"> биометрия глаза</a>. Она не заменяет весь комплекс диагностики,
        а решает более узкую измерительную задачу.
      </p>

      <h2>Адрес салона</h2>
      <p>
        Санкт-Петербург, <strong>ул. Кирочная, 17</strong>, метро «Чернышевская». Салон работает
        {` ${PRIMARY_SALON.hours.toLowerCase()}`}. Посмотреть карту и способы связи можно на
        странице <a href="/contacts/">контактов</a>.
      </p>
      <p>
        Телефон: <a href={CONTACT.phone.href}>{CONTACT.phone.label}</a>. Электронная почта:
        <a href={CONTACT.email.href}> {CONTACT.email.label}</a>.
      </p>
    </SeoLandingPage>
  );
}
