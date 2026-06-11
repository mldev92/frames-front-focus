import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { services, serviceHref } from "@/data/services";
import type { Service } from "@/data/types";
import { submitCallback } from "@/lib/api/bitrix";

export function ServiceDetail({ service }: { service: Service }) {
  const others = services.filter((s) => s.slug !== service.slug);
  const [sdName, setSdName] = useState("");
  const [sdPhone, setSdPhone] = useState("");

  return (
    <div>
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
              <Link to="/" className="hover:text-foreground">Главная</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/uslugi" className="hover:text-foreground">Услуги</Link>
            </nav>
            <h1 className="font-serif text-4xl lg:text-5xl">{service.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{service.short}</p>
            <div className="mt-6 flex gap-6 text-sm">
              <div>
                <div className="text-muted-foreground">Цена</div>
                <div className="font-medium">{service.price}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Длительность</div>
                <div className="font-medium">{service.duration}</div>
              </div>
            </div>
          </div>
          <div className="aspect-[4/3] bg-accent rounded-sm overflow-hidden">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 lg:px-8 py-16 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="font-serif text-2xl mb-4">Описание</h2>
          <p className="text-muted-foreground leading-relaxed">{service.description}</p>

          <h3 className="font-serif text-xl mt-10 mb-4">Что входит</h3>
          <ul className="space-y-2">
            {service.includes.map((i) => (
              <li key={i} className="flex gap-2">
                <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <span>{i}</span>
              </li>
            ))}
          </ul>

          <h3 className="font-serif text-xl mt-10 mb-4">Как это проходит</h3>
          <ol className="space-y-4">
            {service.steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <div className="font-serif text-2xl text-brand w-8">{i + 1}</div>
                <div>
                  <div className="font-medium">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.text}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="bg-surface p-6 rounded-sm h-fit sticky top-24">
          <h3 className="font-serif text-xl mb-4">Записаться</h3>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await submitCallback({ name: sdName, phone: sdPhone, comment: `Услуга: ${service.title}` });
                toast.success("Спасибо! Мы перезвоним для подтверждения.");
                setSdName("");
                setSdPhone("");
              } catch {
                toast.error("Не удалось отправить заявку. Позвоните нам напрямую.");
              }
            }}
          >
            <input
              required
              placeholder="Имя"
              value={sdName}
              onChange={(e) => setSdName(e.target.value)}
              className="w-full bg-background border border-border rounded-sm px-3 py-2.5"
            />
            <input
              required
              type="tel"
              placeholder="Телефон"
              value={sdPhone}
              onChange={(e) => setSdPhone(e.target.value)}
              className="w-full bg-background border border-border rounded-sm px-3 py-2.5"
            />
            <input
              type="date"
              className="w-full bg-background border border-border rounded-sm px-3 py-2.5"
            />
            <select className="w-full bg-background border border-border rounded-sm px-3 py-2.5">
              <option>Любое время</option>
              <option>Утро (10–13)</option>
              <option>День (13–17)</option>
              <option>Вечер (17–21)</option>
            </select>
            <button
              type="submit"
              className="w-full bg-ink text-primary-foreground py-3 rounded-sm hover:opacity-90"
            >
              Записаться
            </button>
            <p className="text-xs text-muted-foreground">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
            </p>
          </form>
        </aside>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h2 className="font-serif text-2xl mb-8">Другие услуги</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {others.map((o) => (
              <a
                key={o.slug}
                href={serviceHref(o.slug)}
                className="block bg-background p-6 rounded-sm hover:shadow-md transition-shadow"
              >
                <div className="font-serif text-lg">{o.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">{o.short}</div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
