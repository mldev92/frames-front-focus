import { useState, type ReactNode } from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";

export interface SeoCrumb {
  label: string;
  href?: string;
}

export interface SeoFeature {
  icon: LucideIcon;
  title: string;
  text: string;
  href?: string;
}

export interface SeoFaqItem {
  q: string;
  a: string;
}

interface SeoLandingPageProps {
  title: string;
  eyebrow?: string;
  intro: ReactNode;
  heroImage: string;
  heroAlt: string;
  breadcrumbs: SeoCrumb[];
  features?: SeoFeature[];
  children: ReactNode;
  faq?: SeoFaqItem[];
  primaryCta?: { label: string; href: string };
  appointmentLabel?: string;
}

export function SeoLandingPage({
  title,
  eyebrow,
  intro,
  heroImage,
  heroAlt,
  breadcrumbs,
  features = [],
  children,
  faq = [],
  primaryCta,
  appointmentLabel = "Записаться на консультацию",
}: SeoLandingPageProps) {
  const [appointmentOpen, setAppointmentOpen] = useState(false);

  return (
    <div className="bg-background text-foreground">
      <nav aria-label="Хлебные крошки" className="border-b border-border/60 bg-background">
        <ol className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-3 text-xs text-muted-foreground lg:px-8">
          {breadcrumbs.map((crumb, index) => {
            const last = index === breadcrumbs.length - 1;
            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 text-border" />}
                {crumb.href && !last ? (
                  <a href={crumb.href} className="transition-colors hover:text-foreground">
                    {crumb.label}
                  </a>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? "text-foreground" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <section className="border-b border-border bg-gradient-to-b from-cream/70 to-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.08fr_0.92fr] md:items-center lg:px-8 lg:py-16">
          <div>
            {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>}
            <h1 className="max-w-3xl font-serif text-4xl leading-tight md:text-5xl lg:text-6xl">{title}</h1>
            <div className="mt-5 max-w-3xl space-y-4 text-base leading-7 text-muted-foreground md:text-lg">{intro}</div>
            <div className="mt-7 flex flex-wrap gap-3">
              {primaryCta && (
                <a
                  href={primaryCta.href}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-85"
                >
                  {primaryCta.label}
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setAppointmentOpen(true)}
                className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium transition-colors hover:border-ink"
              >
                {appointmentLabel}
              </button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-surface shadow-sm">
            <img src={heroImage} alt={heroAlt} className="aspect-[4/3] h-full w-full object-cover md:aspect-square" />
          </div>
        </div>
      </section>

      {features.length > 0 && (
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              const content = (
                <>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-brand">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{feature.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{feature.text}</span>
                  </span>
                </>
              );
              const className = "flex gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand/40";
              return feature.href ? (
                <a key={feature.title} href={feature.href} className={className}>
                  {content}
                </a>
              ) : (
                <div key={feature.title} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
        <article className="space-y-6 text-[15px] leading-7 text-foreground/85 [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:pt-5 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:leading-tight [&_h3]:pt-2 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:pl-1 [&_p]:max-w-4xl [&_strong]:font-semibold [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-2">
          {children}
        </article>

        {faq.length > 0 && (
          <section aria-labelledby="seo-faq-title" className="mt-14 border-t border-border pt-10">
            <h2 id="seo-faq-title" className="font-serif text-3xl">Часто задаваемые вопросы</h2>
            <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
              {faq.map((item) => (
                <details key={item.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {item.q}
                    <ChevronRight aria-hidden className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-8">
          {primaryCta && (
            <a href={primaryCta.href} className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-primary-foreground">
              {primaryCta.label}
            </a>
          )}
          <button
            type="button"
            onClick={() => setAppointmentOpen(true)}
            className="rounded-full border border-border px-6 py-3 text-sm font-medium hover:border-ink"
          >
            {appointmentLabel}
          </button>
        </div>
      </div>

      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </div>
  );
}
