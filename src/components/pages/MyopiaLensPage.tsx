import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Button } from "@/components/ui/button";
import { CONTACT, PRIMARY_SALON } from "@/data/contact";
import {
  contactMyopiaModels,
  contactNotice,
  MYOPIA_PATH,
  MYOPIA_TITLE,
  myopiaCatalogPath,
  myopiaDetailsPath,
  spectacleMyopiaModels,
  spectacleNotice,
  type MyopiaModel,
} from "@/lib/myopia-lenses";
import { useMyopiaPrices } from "@/hooks/useMyopiaPrices";
import { formatPrice } from "@/lib/store/cart";

function ModelDesign({ model }: { model: MyopiaModel }) {
  return <p className="text-sm font-medium text-foreground">Оптический дизайн — {model.design}</p>;
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
    <p className="font-medium tabular-nums">
      {model.kind === "spectacle"
        ? `от ${formatPrice(price)} за пару`
        : `${formatPrice(price)} за ${packSize}`}
    </p>
  );
}

function CatalogButton({ model }: { model: MyopiaModel }) {
  const newTab = model.kind === "contact";
  return (
    <Button asChild className="min-h-11 min-w-0 whitespace-normal">
      <a
        href={myopiaCatalogPath(model)}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        aria-label={`Перейти в каталог — ${model.brand} ${model.name}`}
      >
        Перейти в каталог
        {newTab && <ExternalLink aria-hidden="true" />}
      </a>
    </Button>
  );
}

function ModelCard({ model, price }: { model: MyopiaModel; price?: number }) {
  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{model.brand}</p>
        <h3 className="font-serif text-2xl leading-snug">{model.name}</h3>
      </div>
      <div className="grow space-y-2 text-sm leading-relaxed text-muted-foreground">
        <ModelDesign model={model} />
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

export function MyopiaLensLanding() {
  const prices = useMyopiaPrices();

  return (
    <div className="mx-auto max-w-screen-xl space-y-12 px-4 py-10 sm:px-8 lg:space-y-16 lg:py-16">
      <header className="max-w-3xl space-y-4">
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{MYOPIA_TITLE}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Очковые и контактные линзы для детей в Санкт-Петербурге. Сравните оптические дизайны и
          обсудите подходящий вариант с врачом на приёме.
        </p>
        <nav aria-label="Разделы страницы" className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="min-h-11">
            <a href="#myopia-spectacles">Линзы для очков</a>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <a href="#myopia-contacts">Контактные линзы</a>
          </Button>
        </nav>
      </header>

      <section aria-labelledby="myopia-spectacles" className="space-y-5">
        <div className="space-y-2">
          <h2 id="myopia-spectacles" className="font-serif text-3xl">
            Линзы для очков
          </h2>
          <p className="text-muted-foreground">3 производителя, 4 линейки линз</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {spectacleMyopiaModels.map((model) => (
            <ModelCard key={model.slug} model={model} price={prices[model.slug]} />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted p-5 sm:p-6">
          <p className="max-w-xl text-sm leading-relaxed">{spectacleNotice}</p>
          <PediatricBooking />
        </div>
      </section>

      <section aria-labelledby="myopia-contacts" className="space-y-5">
        <h2 id="myopia-contacts" className="font-serif text-3xl">
          Контактные линзы
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {contactMyopiaModels.map((model) => (
            <ModelCard key={model.slug} model={model} price={prices[model.slug]} />
          ))}
        </div>
        <p className="rounded-2xl bg-muted p-5 text-sm leading-relaxed sm:p-6">{contactNotice}</p>
      </section>

      <section aria-labelledby="myopia-clinic" className="space-y-3 border-t border-border pt-6">
        <h2 id="myopia-clinic" className="font-serif text-2xl">
          Контакты салона
        </h2>
        <address className="space-y-1 text-sm not-italic leading-relaxed">
          <p>
            {PRIMARY_SALON.routeQuery}, м. {PRIMARY_SALON.metro}
          </p>
          <p>{PRIMARY_SALON.hours}</p>
          <a className="underline underline-offset-4" href={CONTACT.phone.href}>
            {CONTACT.phone.label}
          </a>
        </address>
      </section>
    </div>
  );
}

export function MyopiaLensDetail({ model }: { model: MyopiaModel }) {
  const price = useMyopiaPrices(model.kind)[model.slug];

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-8 lg:py-16">
      <a
        href={MYOPIA_PATH}
        className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {MYOPIA_TITLE}
      </a>
      <header className="space-y-4">
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
          {model.brand} {model.name}
        </h1>
        <ModelDesign model={model} />
        <p className="leading-relaxed text-muted-foreground">{model.description}</p>
      </header>
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-serif text-2xl">{model.fitting.heading}</h2>
        <p className="leading-relaxed">{model.fitting.text}</p>
        {model.fitting.source && (
          <a className="text-sm underline underline-offset-4" href={model.fitting.source.href}>
            {model.fitting.source.label}
          </a>
        )}
        {model.kind === "contact" && <p className="leading-relaxed">{model.note}</p>}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {model.kind === "spectacle" ? spectacleNotice : contactNotice}
        </p>
      </section>
      <ModelPrice model={model} price={price} />
      <div className="flex flex-wrap gap-3">
        <CatalogButton model={model} />
        <PediatricBooking service={model.kind === "contact" ? "contacts" : "glasses"} />
      </div>
    </article>
  );
}
