import { useStorefrontContact } from "@/lib/storefront-content";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ExternalLink,
  Glasses,
  MapPin,
  Ruler,
  Stethoscope,
} from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Button } from "@/components/ui/button";
import { PRIMARY_SALON } from "@/data/contact";
import { doctorServicePrice, spbBiometryPrice } from "@/data/doctor-prices";
import { useMyopiaPrices } from "@/hooks/useMyopiaPrices";
import {
  contactMyopiaModels,
  contactNotice,
  MYOPIA_CONTACT_CATALOG,
  MYOPIA_HERO_IMAGE,
  MYOPIA_PATH,
  MYOPIA_SPECTACLE_CATALOG,
  MYOPIA_TITLE,
  myopiaCatalogPath,
  myopiaDetailsPath,
  spectacleMyopiaModels,
  spectacleNotice,
  type MyopiaModel,
} from "@/lib/myopia-lenses";
import { formatPrice } from "@/lib/store/cart";

const childExamPath = "/detskaya-diagnostika-spb/";
const biometryPath = "/biometriya-glaza/";
const contentWidth = "mx-auto w-full max-w-6xl px-4 sm:px-8";
const sections = [
  ["Линзы для очков", "myopia-spectacles"],
  ["Контактные линзы", "myopia-contacts"],
  ["Диагностика", "myopia-services"],
  ["Как подбирают", "myopia-fitting"],
  ["Вопросы родителей", "myopia-faq"],
] as const;

const fittingSteps = [
  ["Обследование", "Врач проверяет зрение ребёнка и знакомится с его предыдущими рецептами."],
  [
    "Оценка динамики",
    "При необходимости измеряют осевую длину глаза и сопоставляют результаты с предыдущими обследованиями.",
  ],
  ["Выбор линз", "Врач учитывает рецепт, показания к конкретной модели и привычки ребёнка."],
  ["Наблюдение", "После подбора врач объясняет режим ношения и назначает контрольные визиты."],
] as const;

const parentQuestions = [
  [
    "Чем эти линзы отличаются от обычных очков?",
    "Обычные однофокальные линзы помогают чётко видеть вдаль. Специальные дизайны для контроля миопии также предназначены для замедления её прогрессирования. Эффект зависит от ребёнка и выбранной модели.",
  ],
  [
    "С какого возраста можно подбирать линзы?",
    "Возрастные показания зависят от модели. Врач также учитывает рецепт, состояние глаз и динамику миопии. Для контактных линз важны умение соблюдать гигиену и помощь родителей.",
  ],
  [
    "Как выбрать между очками и контактными линзами?",
    "Обсудите с врачом, когда ребёнок будет носить линзы, например на уроках или во время спорта. При выборе контактных линз специалист проверит посадку и научит ребёнка надевать и снимать их.",
  ],
  [
    "Чем Myopilux Plus отличается от Stellest?",
    "В Myopilux Plus предусмотрена дополнительная оптическая сила для работы вблизи. Stellest использует асферические микролинзы вокруг центральной зоны коррекции. Показания к этим дизайнам различаются.",
  ],
  [
    "Зачем измерять осевую длину глаза?",
    "Биометрия показывает осевую длину глаза. Сравнивая результаты нескольких измерений и данные о рефракции, врач оценивает, как меняется близорукость.",
  ],
  [
    "Как проходит биометрия Lenstar LS 900?",
    "Ребёнок смотрит на метку прибора, пока тот выполняет оптическое измерение. Прибор не соприкасается с глазом.",
  ],
  [
    "Когда нужно прийти на повторный осмотр?",
    "График зависит от возраста, результатов обследования и выбранной линзы. Спросите на первом приёме, когда нужно проверить посадку линз или повторить измерения.",
  ],
  [
    "Можно ли спать в этих контактных линзах?",
    "Снимайте перечисленные дневные линзы перед сном. Однодневные линзы после снятия выбрасывают. Для многоразовых линз соблюдайте режим ухода и замены из инструкции.",
  ],
  [
    "От чего зависит цена?",
    "Очковые линзы указаны за пару, контактные — за упаковку. Стоимость зависит от модели, параметров и комплектации. Оправу, изготовление очков и обследование рассчитывают отдельно.",
  ],
  [
    "Что взять на первый приём?",
    "Если есть предыдущие рецепты, очки и результаты обследований или биометрии, возьмите их с собой. Эти данные помогут врачу оценить изменения зрения.",
  ],
] as const;

function Breadcrumbs({ model }: { model?: MyopiaModel }) {
  return (
    <nav aria-label="Хлебные крошки" className="border-b border-border">
      <ol
        className={`${contentWidth} flex flex-wrap items-center gap-x-2 gap-y-1 py-3 text-sm text-muted-foreground`}
      >
        <li>
          <a href="/" className="hover:text-foreground hover:underline">
            Главная
          </a>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="size-3" />
        </li>
        {model ? (
          <>
            <li>
              <a href={MYOPIA_PATH} className="hover:text-foreground hover:underline">
                {MYOPIA_TITLE}
              </a>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3" />
            </li>
            <li aria-current="page" className="text-foreground">
              {model.name}
            </li>
          </>
        ) : (
          <li aria-current="page" className="text-foreground">
            {MYOPIA_TITLE}
          </li>
        )}
      </ol>
    </nav>
  );
}

function ModelDesign({ model }: { model: MyopiaModel }) {
  return <p className="text-sm font-semibold text-brand">Оптический дизайн — {model.design}</p>;
}

function ModelPrice({ model, price }: { model: MyopiaModel; price?: number }) {
  const packSize = model.kind === "contact" ? `${model.packSize} шт.` : undefined;
  if (price === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        {packSize && `Упаковка ${packSize} · `}Цену уточняйте в каталоге
      </p>
    );
  }
  return (
    <p className="font-semibold tabular-nums">
      {model.kind === "spectacle"
        ? `от ${formatPrice(price)} за пару`
        : `${formatPrice(price)} за ${packSize}`}
    </p>
  );
}

function CatalogButton({ model, variant }: { model: MyopiaModel; variant?: "outline" }) {
  return (
    <Button asChild variant={variant} className="min-h-11 min-w-0 whitespace-normal">
      <a
        href={myopiaCatalogPath(model)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Перейти в каталог — ${model.brand} ${model.name}`}
      >
        Перейти в каталог
        <ExternalLink aria-hidden="true" />
      </a>
    </Button>
  );
}

function ModelCard({ model, price }: { model: MyopiaModel; price?: number }) {
  const Icon = model.kind === "spectacle" ? Glasses : CircleDot;
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{model.brand}</p>
          <Icon className="size-5 shrink-0 text-brand" aria-hidden="true" />
        </div>
        <h3 className="font-serif text-2xl leading-snug">{model.name}</h3>
        <ModelDesign model={model} />
      </div>
      <div className="grow space-y-2 text-sm leading-relaxed text-muted-foreground">
        <p>{model.description}</p>
        {model.kind === "contact" && <p>{model.note}</p>}
      </div>
      <ModelPrice model={model} price={price} />
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="min-h-11">
          <a
            href={myopiaDetailsPath(model)}
            aria-label={`Подробнее — ${model.brand} ${model.name}`}
          >
            Подробнее
          </a>
        </Button>
        <CatalogButton model={model} />
      </div>
    </article>
  );
}

function PediatricBooking({ service = "glasses" }: { service?: "glasses" | "contacts" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        size="lg"
        className="min-h-11 max-w-full whitespace-normal px-5"
        onClick={() => setOpen(true)}
      >
        Записаться на приём детского врача
      </Button>
      <AppointmentModal
        open={open}
        onOpenChange={setOpen}
        initialSelection={{ salonId: PRIMARY_SALON.id, ageType: "child", service }}
      />
    </>
  );
}

function ClinicContact() {
  const contact = useStorefrontContact("spb");
  return (
    <address className="space-y-2 text-sm not-italic leading-relaxed">
      <p className="flex items-start gap-2">
        <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
        {PRIMARY_SALON.routeQuery}, м. {PRIMARY_SALON.metro}
      </p>
      <p>{PRIMARY_SALON.hours}</p>
      <a
        className="font-semibold underline underline-offset-4 hover:text-brand"
        href={contact.phone.href}
      >
        {contact.phone.label}
      </a>
    </address>
  );
}

function MyopiaHero() {
  return (
    <header className="relative isolate overflow-hidden border-b border-border bg-cream">
      <div className={`${contentWidth} py-9 sm:py-12 md:py-16 lg:py-20`}>
        <div className="max-w-xl md:max-w-[56%]">
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:max-w-xl lg:text-6xl">
            {MYOPIA_TITLE}
          </h1>
          <p className="mt-4 max-w-md leading-relaxed">
            Сравните очковые и контактные линзы для детей. Детский врач поможет выбрать подходящую
            модель после обследования и составит план наблюдения.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#myopia-booking">
                <CalendarDays aria-hidden="true" /> Записаться к врачу
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-background">
              <a href="#myopia-spectacles">
                Сравнить линзы <ArrowDown aria-hidden="true" />
              </a>
            </Button>
          </div>
          <p className="mt-5 flex items-start gap-2 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
            {PRIMARY_SALON.routeQuery}
          </p>
        </div>
      </div>
      <img
        src={MYOPIA_HERO_IMAGE}
        width={1536}
        height={1024}
        alt="Ребёнок в очках на прогулке"
        fetchPriority="high"
        className="h-52 w-full object-cover object-[right_34%] sm:h-64 md:absolute md:inset-y-0 md:right-0 md:-z-20 md:h-full md:w-[64%] md:object-[right_35%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,var(--cream)_39%,transparent_75%)] md:block"
      />
    </header>
  );
}

function MyopiaServices() {
  const childExamPrice = doctorServicePrice("diagnostika", "spb");
  return (
    <section
      id="myopia-services"
      aria-labelledby="myopia-services-title"
      className="scroll-mt-24 border-y border-border bg-muted/45"
    >
      <div className={`${contentWidth} py-10 md:py-14`}>
        <h2 id="myopia-services-title" className="font-serif text-3xl">
          Диагностика и наблюдение
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <Stethoscope className="size-6 text-brand" aria-hidden="true" />
            <h3 className="font-serif text-2xl">Приём детского врача</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Врач проверяет зрение, оценивает состояние глаз, сравнивает результаты с прежними
              обследованиями и обсуждает с родителями способы коррекции.
            </p>
            {childExamPrice !== undefined && (
              <p className="font-semibold">Первичный приём — {formatPrice(childExamPrice)}</p>
            )}
            <a
              href={childExamPath}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              Подробнее о детской диагностике{" "}
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </a>
          </article>
          <article className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <Ruler className="size-6 text-brand" aria-hidden="true" />
            <h3 className="font-serif text-2xl">Биометрия Lenstar LS 900</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Швейцарский оптический биометр бесконтактно измеряет параметры глаза. Сравнение осевой
              длины на повторных визитах помогает врачу наблюдать динамику миопии.
            </p>
            <p className="font-semibold">{formatPrice(spbBiometryPrice)}</p>
            <a
              href={biometryPath}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
            >
              Подробнее о биометрии <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

export function MyopiaLensLanding() {
  const prices = useMyopiaPrices();

  return (
    <div className="bg-background">
      <Breadcrumbs />
      <MyopiaHero />
      <nav aria-label="Разделы страницы" className="border-b border-border">
        <ul className={`${contentWidth} flex flex-wrap gap-x-5 py-2`}>
          {sections.map(([label, id]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold underline-offset-4 hover:text-brand hover:underline"
              >
                {label} <ChevronRight className="size-3" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section
        aria-labelledby="myopia-overview"
        className={`${contentWidth} grid gap-7 py-10 md:grid-cols-[1.3fr_1fr] md:py-14`}
      >
        <div className="space-y-3">
          <h2 id="myopia-overview" className="font-serif text-3xl">
            Что такое контроль миопии
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            При близорукости ребёнку трудно разглядеть предметы вдали. В школьном возрасте миопия
            может прогрессировать. Чтобы оценить динамику, врач сравнивает результаты проверки
            зрения и, при необходимости, измерения осевой длины глаза.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Очковые и контактные линзы различаются оптическим дизайном и режимом ношения. На приёме
            врач учитывает результаты обследования и то, как ребёнок будет пользоваться линзами.
          </p>
        </div>
        <div className="border-l-2 border-brand pl-5">
          <h3 className="font-serif text-xl">Когда стоит проверить зрение</h3>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed">
            {[
              "Ребёнок щурится или подходит ближе, чтобы увидеть надписи вдали.",
              "Рецепт на очки меняется или ребёнок снова хуже видит вдаль.",
              "У родителей есть близорукость и нужно уточнить график проверок для ребёнка.",
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="myopia-spectacles"
        aria-labelledby="myopia-spectacles-title"
        className="scroll-mt-24 border-y border-border bg-cream"
      >
        <div className={`${contentWidth} space-y-5 py-10 md:py-14`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <h2 id="myopia-spectacles-title" className="font-serif text-3xl">
                Линзы для очков
              </h2>
              <p className="text-muted-foreground">3 производителя, 4 линейки линз</p>
            </div>
            <Button asChild variant="outline" className="min-h-11 bg-background">
              <a href={MYOPIA_SPECTACLE_CATALOG} target="_blank" rel="noopener noreferrer">
                Все цены на очковые линзы <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {spectacleMyopiaModels.map((model) => (
              <ModelCard key={model.slug} model={model} price={prices[model.slug]} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5 sm:p-6">
            <p className="max-w-xl text-sm leading-relaxed">{spectacleNotice}</p>
            <Button asChild className="min-h-11">
              <a href="#myopia-booking">Записаться к детскому врачу</a>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="myopia-contacts"
        aria-labelledby="myopia-contacts-title"
        className={`${contentWidth} scroll-mt-24 space-y-5 py-10 md:py-14`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="myopia-contacts-title" className="font-serif text-3xl">
            Контактные линзы
          </h2>
          <Button asChild variant="outline" className="min-h-11">
            <a href={MYOPIA_CONTACT_CATALOG} target="_blank" rel="noopener noreferrer">
              Все цены на контактные линзы <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        </div>
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          При подборе специалист оценивает состояние глаз, проверяет посадку линз и объясняет
          ребёнку и родителям правила ношения и ухода.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {contactMyopiaModels.map((model) => (
            <ModelCard key={model.slug} model={model} price={prices[model.slug]} />
          ))}
        </div>
        <p className="rounded-2xl bg-muted p-5 text-sm leading-relaxed sm:p-6">{contactNotice}</p>
      </section>

      <MyopiaServices />

      <section
        id="myopia-fitting"
        aria-labelledby="myopia-fitting-title"
        className={`${contentWidth} scroll-mt-24 py-10 md:py-14`}
      >
        <h2 id="myopia-fitting-title" className="font-serif text-3xl">
          Как подбирают линзы для контроля миопии
        </h2>
        <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fittingSteps.map(([title, description], index) => (
            <li key={title} className="space-y-2 border-t border-border pt-4">
              <h3 className="flex items-center gap-2 font-serif text-xl">
                <span className="font-sans text-sm font-semibold text-brand">{index + 1}.</span>
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="myopia-faq"
        aria-labelledby="myopia-faq-title"
        className="scroll-mt-24 border-t border-border"
      >
        <div className={`${contentWidth} py-10 md:py-14`}>
          <h2 id="myopia-faq-title" className="font-serif text-3xl">
            Вопросы родителей
          </h2>
          <div className="mt-5 max-w-3xl divide-y divide-border border-y border-border">
            {parentQuestions.map(([question, answer]) => (
              <details key={question} className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {question}{" "}
                  <ChevronDown
                    className="size-4 shrink-0 text-brand group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-4 pr-6 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        id="myopia-booking"
        aria-labelledby="myopia-booking-title"
        className="scroll-mt-24 border-y border-brand/20 bg-brand-50"
      >
        <div className={`${contentWidth} grid gap-8 py-10 md:grid-cols-[1.3fr_1fr] md:py-14`}>
          <div className="space-y-4">
            <h2 id="myopia-booking-title" className="font-serif text-3xl">
              Начните с приёма детского врача
            </h2>
            <p className="max-w-lg leading-relaxed">
              На приёме можно обсудить подходящие линзы, необходимость биометрии и график
              контрольных визитов.
            </p>
            <PediatricBooking />
          </div>
          <div className="space-y-3 border-l-2 border-brand pl-5">
            <h3 className="font-serif text-xl">Салон на Кирочной</h3>
            <ClinicContact />
          </div>
        </div>
      </section>
    </div>
  );
}

export function MyopiaLensDetail({ model }: { model: MyopiaModel }) {
  const price = useMyopiaPrices(model.kind)[model.slug];
  const contact = model.kind === "contact";
  const alternatives = [...spectacleMyopiaModels, ...contactMyopiaModels].filter(
    (other) => other.slug !== model.slug,
  );

  return (
    <article>
      <Breadcrumbs model={model} />
      <header className={`${contentWidth} space-y-4 py-9 md:py-14`}>
        <p className="text-sm font-semibold text-muted-foreground">
          {contact ? "Контактные линзы" : "Линзы для очков"}
        </p>
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
          {model.brand} {model.name}
        </h1>
        <ModelDesign model={model} />
        <p className="max-w-2xl leading-relaxed text-muted-foreground">{model.description}</p>
        {contact && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{model.note}</p>
        )}
        <div className="space-y-3 pt-2">
          <ModelPrice model={model} price={price} />
          <div className="flex flex-wrap gap-3">
            <CatalogButton model={model} variant="outline" />
            <PediatricBooking service={contact ? "contacts" : "glasses"} />
          </div>
        </div>
      </header>
      <section aria-labelledby="myopia-model-fitting" className="border-y border-border bg-cream">
        <div className={`${contentWidth} grid gap-8 py-8 md:grid-cols-[1.4fr_1fr] md:py-12`}>
          <div className="space-y-3">
            <h2 id="myopia-model-fitting" className="font-serif text-2xl">
              {model.fitting.heading}
            </h2>
            <p className="leading-relaxed">{model.fitting.text}</p>
            {model.fitting.source && (
              <a
                className="block text-sm text-brand underline underline-offset-4"
                href={model.fitting.source.href}
              >
                {model.fitting.source.label}
              </a>
            )}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {contact ? contactNotice : spectacleNotice}
            </p>
          </div>
          <div className="space-y-3 border-l-2 border-brand pl-5">
            <h3 className="font-serif text-xl">Подбор и наблюдение на Кирочной</h3>
            <p className="text-sm leading-relaxed">
              Начните с{" "}
              <a
                href={childExamPath}
                className="font-semibold underline underline-offset-4 hover:text-brand"
              >
                приёма детского врача
              </a>
              . При необходимости врач назначит{" "}
              <a
                href={biometryPath}
                className="font-semibold underline underline-offset-4 hover:text-brand"
              >
                биометрию Lenstar LS 900
              </a>{" "}
              и подскажет, когда прийти на повторный осмотр.
            </p>
            <ClinicContact />
          </div>
        </div>
      </section>
      <section
        aria-labelledby="myopia-related"
        className={`${contentWidth} space-y-4 py-8 md:py-12`}
      >
        <h2 id="myopia-related" className="font-serif text-2xl">
          Другие линзы для контроля миопии
        </h2>
        <ul className="flex flex-wrap gap-2">
          {alternatives.map((other) => (
            <li key={other.slug}>
              <Button asChild variant="outline" className="min-h-11 whitespace-normal">
                <a href={myopiaDetailsPath(other)}>{other.name}</a>
              </Button>
            </li>
          ))}
        </ul>
        <a
          href={MYOPIA_PATH}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
        >
          К сравнению очковых и контактных линз{" "}
          <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </a>
      </section>
    </article>
  );
}
