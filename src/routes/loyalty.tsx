import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gift, Info, Star } from "lucide-react";
import { CONTACT } from "@/data/contact";

export const Route = createFileRoute("/loyalty")({
  head: () => ({ meta: [{ title: "Программа лояльности — ОПТИКА 100%" }] }),
  component: LoyaltyPage,
});

const PROGRAM_NOTES = [
  "В Gate A beta мы не показываем персональный баланс, историю начислений и QR-карту, пока кабинет лояльности не подключен к живым данным.",
  "Актуальные условия программы можно уточнить у консультантов салона или по телефону поддержки.",
] as const;

function LoyaltyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-12 space-y-10">
      <section
        className="relative overflow-hidden rounded-[32px] border border-border px-6 py-8 text-white sm:px-8 sm:py-10"
        style={{ background: "linear-gradient(135deg, oklch(0.22 0.014 250) 0%, oklch(0.18 0.012 250) 100%)" }}
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.55 0.18 28 / 0.22) 0%, transparent 72%)" }}
        />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
            <Gift className="h-3.5 w-3.5" />
            Программа лояльности
          </div>
          <h1 className="mt-5 font-serif text-4xl leading-[1.02] sm:text-5xl">
            Личный бонусный кабинет
            <br />
            готовится к подключению
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">
            Мы убрали демонстрационные баллы и историю операций, чтобы beta не
            показывала вымышленные персональные данные.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {PROGRAM_NOTES.map((note) => (
          <div key={note} className="rounded-[24px] border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Info className="h-4 w-4" />
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">{note}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-border bg-cream p-6 sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Что будет позже
          </div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground">
            Подключим живой баланс, историю начислений и управление бонусами
          </h2>
          <div className="mt-6 grid gap-4 text-sm leading-relaxed text-muted-foreground">
            <div className="flex gap-3">
              <Star className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>Баланс и история появятся только после подключения к реальному кабинету клиента.</span>
            </div>
            <div className="flex gap-3">
              <Star className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>До этого момента beta не должна обещать начисление, списание или отображение бонусов.</span>
            </div>
            <div className="flex gap-3">
              <Star className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>Если нужно уточнить действующие условия программы, лучше связаться с салоном напрямую.</span>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-6 sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            Связаться с нами
          </div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground">
            Поможем уточнить условия программы лояльности
          </h2>
          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <a href={CONTACT.phone.href} className="block rounded-2xl border border-border bg-cream px-4 py-3 text-foreground transition-colors hover:border-brand/35">
              {CONTACT.phone.label}
            </a>
            <a href={CONTACT.email.href} className="block rounded-2xl border border-border bg-cream px-4 py-3 text-foreground transition-colors hover:border-brand/35">
              {CONTACT.email.label}
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contacts"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Салоны и контакты
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/personal"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/35 hover:text-brand"
            >
              Личный кабинет
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
