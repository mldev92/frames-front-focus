import type { Product } from "@/data/types";
import { CONTACT, PRIMARY_SALON } from "@/data/contact";

export const contactLensCatalogCanonical = "https://optika100.com/catalog_s/kontaktnye_linzy_/";
export const contactLensCatalogTitle =
  "Контактные линзы купить в СПб — подбор с офтальмологом | Оптика 100%";
export const contactLensCatalogDescription =
  "Контактные линзы Acuvue, Air Optix, Biofinity и Dailies в Санкт-Петербурге. Актуальные цены и наличие, подбор параметров, доставка и самовывоз на Кирочной, 17.";

export const contactLensSubcategories = [
  { label: "Прозрачные", href: "/catalog_s/kontaktnye_linzy_/prozrachnye/" },
  { label: "Цветные", href: "/catalog_s/kontaktnye_linzy_/tsvetnye/" },
  { label: "Торические", href: "/catalog_s/kontaktnye_linzy_/toricheskie/" },
  { label: "Мультифокальные", href: "/catalog_s/kontaktnye_linzy_/multifokalnye/" },
  { label: "Для контроля миопии", href: "/catalog_s/kontaktnye_linzy_/dlya_kontrolya_miopii/" },
] as const;

export const contactLensCatalogFaq = [
  {
    q: "Можно ли купить контактные линзы без рецепта?",
    a: "Контактные линзы можно купить без предъявления бумажного рецепта, если вы точно знаете подходящую модель и все её параметры. Перед первой покупкой или при изменении зрения рекомендуется пройти профессиональный подбор, чтобы проверить оптическую силу и посадку линзы.",
  },
  {
    q: "Чем отличаются однодневные, двухнедельные и месячные линзы?",
    a: "Однодневные линзы каждый день заменяют новыми. Двухнедельные и месячные модели требуют ежедневной очистки и хранения в свежем растворе; срок их замены считают от вскрытия упаковки и соблюдают по инструкции производителя.",
  },
  {
    q: "Как понять, что линзы мне подходят?",
    a: "Подходящая линза обеспечивает чёткое зрение и не вызывает стойкого дискомфорта, а её посадку оценивает специалист. Если появляются боль, выраженное покраснение, светобоязнь или затуманивание зрения, линзу нужно снять и как можно скорее обратиться к офтальмологу.",
  },
  {
    q: "Есть ли доставка контактных линз по Санкт-Петербургу?",
    a: "Доступные способы и сроки доставки зависят от выбранной модели, наличия нужных параметров и адреса. Актуальные условия показываются при оформлении заказа или уточняются у консультанта; также доступен самовывоз из салона на Кирочной, 17.",
  },
  {
    q: "Что делать, если линза потерялась?",
    a: "Не надевайте найденную на полу, загрязнённую или повреждённую линзу. Используйте новую линзу с теми же назначенными параметрами, а при ощущении, что линза могла остаться в глазу, не пытайтесь извлечь её острыми предметами и обратитесь к специалисту.",
  },
] as const;

const absoluteUrl = (value: string) => new URL(value, "https://optika100.com").href;

export function contactLensCatalogSchemas(products: Product[], page: number, pageSize: number) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: "https://optika100.com/" },
      { "@type": "ListItem", position: 2, name: "Каталог", item: "https://optika100.com/catalog_s/" },
      { "@type": "ListItem", position: 3, name: "Контактные линзы", item: contactLensCatalogCanonical },
    ],
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Оптика 100%",
    url: "https://optika100.com/",
    telephone: CONTACT.phone.label,
    email: CONTACT.email.label,
    hasPOS: {
      "@type": "Optician",
      name: PRIMARY_SALON.name,
      url: absoluteUrl(PRIMARY_SALON.productionPath),
      telephone: CONTACT.phone.label,
      email: CONTACT.email.label,
      address: {
        "@type": "PostalAddress",
        streetAddress: "ул. Кирочная, 17",
        addressLocality: "Санкт-Петербург",
        postalCode: "191123",
        addressCountry: "RU",
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "10:00",
        closes: "20:00",
      },
    },
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Контактные линзы",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const path = product.canonicalPath ?? `/catalog_s/kontaktnye_linzy_/${product.slug}/`;
      const offer: Record<string, unknown> = {
        "@type": "Offer",
        url: absoluteUrl(path),
        priceCurrency: "RUB",
      };
      if (Number.isFinite(product.price) && product.price > 0) offer.price = product.price;
      if (typeof product.inStock === "boolean") {
        offer.availability = product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock";
      }
      return {
        "@type": "ListItem",
        position: (page - 1) * pageSize + index + 1,
        url: absoluteUrl(path),
        item: {
          "@type": "Product",
          name: product.name,
          url: absoluteUrl(path),
          image: product.images[0] ? absoluteUrl(product.images[0]) : undefined,
          brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
          offers: offer,
        },
      };
    }),
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: contactLensCatalogFaq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return [breadcrumb, organization, itemList, faq].map((schema) => ({
    type: "application/ld+json",
    children: JSON.stringify(schema),
  }));
}
