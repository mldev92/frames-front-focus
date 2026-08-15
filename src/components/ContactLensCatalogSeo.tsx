import { ChevronRight, Eye, ShieldCheck, Stethoscope, Truck } from "lucide-react";
import { CONTACT, PRIMARY_SALON } from "@/data/contact";
import { contactLensCatalogFaq, contactLensSubcategories } from "@/data/contact-lens-catalog-seo";

export function ContactLensCatalogNavigation() {
  return (
    <div className="mb-7 space-y-4">
      <nav aria-label="Хлебные крошки">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <li><a href="/" className="transition-colors hover:text-foreground">Главная</a></li>
          <li className="flex items-center gap-1"><ChevronRight aria-hidden className="h-3.5 w-3.5 text-border" /><span>Каталог</span></li>
          <li className="flex items-center gap-1"><ChevronRight aria-hidden className="h-3.5 w-3.5 text-border" /><span aria-current="page" className="text-foreground">Контактные линзы</span></li>
        </ol>
      </nav>
      <nav aria-label="Категории контактных линз" className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex min-w-max gap-2">
          {contactLensSubcategories.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-brand/50 hover:text-brand">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function ContactLensCatalogGuide({ total }: { total: number }) {
  const benefits = [
    { icon: Eye, title: `${total} моделей`, text: "По текущим параметрам каталога" },
    { icon: Stethoscope, title: "Подбор с офтальмологом", text: "Диагностика зрения и параметров линз" },
    { icon: Truck, title: "Доставка и самовывоз", text: "Срок и способ подтверждаются при заказе" },
    { icon: ShieldCheck, title: "Проверенные бренды", text: "Модели из действующего каталога" },
  ];

  return (
    <section
      className="mx-auto max-w-7xl space-y-10 px-6 pb-4 pt-12 text-[15px] leading-7 text-foreground/85"
      aria-label="О контактных линзах и подборе"
    >
      <div className="grid gap-7 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
        <div className="max-w-4xl">
          <p>
            В салоне «Оптика 100%» на <strong>ул. Кирочная, 17</strong> можно подобрать контактные линзы
            для разных задач и режимов ношения. В каталоге представлены Acuvue, Air Optix, Biofinity,
            Dailies, CooperVision и другие бренды; цены и доступные параметры загружаются из действующего каталога.
          </p>
        </div>
        <img src="/podbor_linz.webp" alt="Контактная линза крупным планом — Оптика 100%" className="aspect-[16/9] w-full rounded-2xl bg-surface object-cover" />
      </div>

      <section aria-labelledby="contact-lens-benefits-title">
        <h2 id="contact-lens-benefits-title" className="font-serif text-3xl leading-tight">Почему линзы выбирают у нас</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-brand"><Icon aria-hidden className="h-5 w-5" /></span>
              <span><strong className="block text-sm text-foreground">{title}</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">{text}</span></span>
            </div>
          ))}
        </div>
        <ul className="mt-6 ml-5 max-w-4xl list-disc space-y-2">
          <li>Прозрачные, цветные, торические, мультифокальные модели и линзы для контроля миопии собраны в одном каталоге.</li>
          <li>Перед первой покупкой можно записаться в <a href="/kabinet-diagnostiki-spb/" className="text-brand hover:underline">кабинет диагностики зрения</a> для проверки параметров и посадки.</li>
          <li>Наличие конкретной сферы, цилиндра, оси, аддидации, кривизны и диаметра проверяется в карточке товара.</li>
          <li>Растворы, контейнеры и средства ухода доступны в разделе <a href="/catalog_s/soputstvuyushchie_tovary/" className="text-brand hover:underline">аксессуаров</a>.</li>
        </ul>
      </section>

      <section className="max-w-4xl">
        <h2 className="font-serif text-3xl leading-tight">Технологии материалов: гидрогель и силикон-гидрогель</h2>
        <p className="mt-4">
          Роговица получает кислород из окружающей среды, поэтому при подборе учитывают кислородную
          проницаемость материала, состояние слёзной плёнки и предполагаемое время ношения. Силикон-гидрогелевые
          материалы обычно пропускают больше кислорода, а технологии увлажнения разных производителей помогают
          поддерживать свойства поверхности линзы. Комфорт остаётся индивидуальным и оценивается после примерки.
        </p>
      </section>

      <section className="max-w-4xl">
        <h2 className="font-serif text-3xl leading-tight">Совет специалиста: линзы под образ жизни</h2>
        <ul className="mt-4 ml-5 list-disc space-y-2">
          <li><strong>Работа за компьютером.</strong> Делайте регулярные перерывы, сознательно моргайте и обсуждайте сухость глаз со специалистом.</li>
          <li><strong>Аллергия и поллиноз.</strong> Однодневный режим уменьшает накопление отложений на одной паре, но не устраняет причину аллергии.</li>
          <li><strong>Спорт и бассейн.</strong> Линзы следует снимать перед плаванием; для коррекции зрения подходят герметичные очки с диоптриями.</li>
          <li><strong>Редкое ношение.</strong> Однодневные модели часто практичнее, поскольку срок плановой замены считают от вскрытия упаковки.</li>
        </ul>
      </section>
    </section>
  );
}

export function ContactLensCatalogFooter() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-12" aria-label="Как выбрать и носить контактные линзы">
      <article className="max-w-5xl space-y-8 text-[15px] leading-7 text-foreground/85 [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:leading-tight [&_h3]:text-lg [&_h3]:font-semibold">
        <section>
          <h2>Как подобрать линзы правильно</h2>
          <p className="mt-4">
            Контактные линзы не следует выбирать только по рецепту на очки. Специалист определяет оптическую силу,
            базовую кривизну, диаметр и другие необходимые параметры, а затем оценивает посадку и качество зрения.
            Подходящие значения зависят от глаза и конструкции конкретной модели.
          </p>
        </section>

        <section>
          <h2>Однодневные и линзы плановой замены</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3>Однодневные</h3>
              <p className="mt-2">Новую пару надевают утром и выбрасывают вечером. Раствор и контейнер не нужны; такой режим удобен при редком ношении, поездках и повышенных требованиях к гигиене.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3>Двухнедельные и месячные</h3>
              <p className="mt-2">После снятия линзы очищают и промывают рекомендованным раствором, затем хранят в свежем растворе. Нельзя доливать новый раствор к использованному; контейнер меняют по инструкции, не реже рекомендованного срока.</p>
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-red-200 bg-red-50/60 p-6 text-red-950">
          <h2>Красные флаги: когда линзы нужно немедленно снять</h2>
          <ul className="mt-4 ml-5 list-disc space-y-2">
            <li>резкая или усиливающаяся боль и стойкое ощущение инородного тела;</li>
            <li>светобоязнь, выраженное слезотечение или выделения;</li>
            <li>заметное покраснение или внезапное затуманивание зрения.</li>
          </ul>
          <p className="mt-4">Снимите линзы и как можно скорее обратитесь к офтальмологу. Не надевайте их снова до консультации; упаковку и контейнер полезно сохранить.</p>
        </aside>

        <section>
          <h2>Салон в Санкт-Петербурге</h2>
          <p className="mt-4">
            Салон расположен по адресу <a href={PRIMARY_SALON.productionPath}>ул. Кирочная, 17</a>, рядом с метро «Чернышевская».
            Телефон: <a href={CONTACT.phone.href}>{CONTACT.phone.label}</a>, email: <a href={CONTACT.email.href}>{CONTACT.email.label}</a>.
            Здесь можно получить заказ самовывозом и подобрать контактные линзы; актуальные условия доставки подтверждаются при оформлении.
          </p>
          <p className="mt-3">
            Для дней без контактных линз посмотрите <a href="/catalog_s/opravy/">оправы для очков</a> или
            <a href="/catalog_s/solntsezashchitnye_ochki/"> солнцезащитные очки</a>.
          </p>
        </section>
      </article>

      <section aria-labelledby="contact-lens-faq-title" className="mt-14 max-w-5xl border-t border-border pt-10">
        <h2 id="contact-lens-faq-title" className="font-serif text-3xl">Часто задаваемые вопросы</h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
          {contactLensCatalogFaq.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.q}<ChevronRight aria-hidden className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}
