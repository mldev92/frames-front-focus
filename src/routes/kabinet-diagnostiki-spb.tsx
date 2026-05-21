import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight, Eye, Gauge, Layers, Droplets } from "lucide-react";
import { toast } from "sonner";
import { serviceHref, services } from "@/data/services";

const INCLUDES = [
  "Авторефрактометрия — определение рефракции",
  "Тонометрия — измерение внутриглазного давления (СПб)",
  "Биометрия глаза (СПб)",
  "Биомикроскопия переднего отрезка глаза",
  "Осмотр глазного дна",
  "Анализ слёзной плёнки",
];

const STEPS = [
  { n: "01", title: "Консультация", text: "Рассказываете о жалобах; врач собирает анамнез." },
  { n: "02", title: "Обследование", text: "Серия коротких безболезненных процедур на современном оборудовании." },
  { n: "03", title: "Заключение", text: "Получаете подробный отчёт и рекомендации по коррекции." },
];

const WHY = [
  { icon: Eye, text: "Современное диагностическое оборудование" },
  { icon: Gauge, text: "Тонометрия и биометрия — только в нашем СПб кабинете" },
  { icon: Layers, text: "Комплексный осмотр за один визит" },
  { icon: Droplets, text: "Анализ слёзной плёнки при синдроме сухого глаза" },
];

const others = services.filter((s) => s.slug !== "diagnostika");

function BookingForm() {
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Спасибо! Мы перезвоним для подтверждения.");
      }}
    >
      <input required placeholder="Имя" className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm" />
      <input required type="tel" placeholder="Телефон" className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm" />
      <input type="date" className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm" />
      <select className="w-full bg-background border border-border rounded-sm px-3 py-2.5 text-sm">
        <option>Любое время</option>
        <option>Утро (10–13)</option>
        <option>День (13–17)</option>
        <option>Вечер (17–21)</option>
      </select>
      <button type="submit" className="w-full bg-ink text-primary-foreground py-3 rounded-sm hover:opacity-90 text-sm">
        Записаться на диагностику
      </button>
      <p className="text-xs text-muted-foreground">
        Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
      </p>
    </form>
  );
}

function KabinetDiagnostikiPage() {
  return (
    <div>
      {/* HERO */}
      <section style={{ backgroundColor: "var(--color-surface, #f8f6f2)" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
              <Link to="/" className="hover:text-foreground">Главная</Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/uslugi" className="hover:text-foreground">Услуги</Link>
              <ChevronRight className="h-3 w-3" />
              <span>Диагностика зрения</span>
            </nav>
            <div className="text-xs uppercase tracking-[0.2em] text-brand mb-3">Кабинет диагностики · Санкт-Петербург</div>
            <h1 className="font-serif text-4xl lg:text-5xl">Диагностика зрения</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Профессиональная оценка состояния зрительной системы — проверка остроты зрения, выявление рефракционных нарушений и ранних признаков заболеваний.
            </p>
            <div className="mt-6 flex gap-6 text-sm">
              <div>
                <div className="text-muted-foreground">Цена</div>
                <div className="font-medium">от 2 800 ₽</div>
              </div>
              <div>
                <div className="text-muted-foreground">Длительность</div>
                <div className="font-medium">60 минут</div>
              </div>
            </div>
            <a
              href="#booking"
              className="mt-7 inline-flex items-center gap-2 bg-ink text-primary-foreground rounded-full px-6 py-3 text-sm hover:opacity-90"
            >
              Записаться на обследование
            </a>
          </div>
          <div className="aspect-[4/3] bg-accent rounded-sm overflow-hidden">
            <img
              src="https://optika100.com/images/proverka-zreniya/izmenenie_davleniya.jpg"
              alt="Диагностика зрения в Оптика 100%"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <h2 className="font-serif text-2xl lg:text-3xl mb-10 text-center">Как проходит диагностика</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="font-serif text-4xl text-brand leading-none w-12 shrink-0">{s.n}</div>
              <div>
                <div className="font-medium mb-1">{s.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT'S INCLUDED + BOOKING */}
      <section style={{ backgroundColor: "var(--color-surface, #f8f6f2)" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16 grid lg:grid-cols-[1fr_380px] gap-12">
          <div>
            <h2 className="font-serif text-2xl mb-6">Комплексное обследование зрения</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Программа направлена на выявление скрытых нарушений, анализ ключевых структур глаза и определение потребности в коррекции или лечении.
            </p>
            <ul className="space-y-3">
              {INCLUDES.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* CONSULTATION BLOCK */}
            <div className="mt-14 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-serif text-xl mb-3">Консультация оптометриста или офтальмолога</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Специалист разбирает результаты обследования, отвечает на вопросы и подбирает оптимальный вид коррекции — очки или контактные линзы.
                </p>
                <a href="#booking" className="mt-5 inline-flex items-center gap-2 border border-ink rounded-full px-5 py-2.5 text-sm hover:bg-ink hover:text-primary-foreground transition-colors">
                  Записаться на консультацию
                </a>
              </div>
              <div className="aspect-[4/3] bg-accent rounded-sm overflow-hidden">
                <img
                  src="https://optika100.com/images/proverka-zreniya/konsultaciya_oftalmologa.jpg"
                  alt="Консультация офтальмолога"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* CORRECTION SELECTION BLOCK */}
            <div className="mt-12 grid md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 aspect-[4/3] bg-accent rounded-sm overflow-hidden">
                <img
                  src="https://optika100.com/images/proverka-zreniya/podbor_linz.jpg"
                  alt="Подбор оптимальной коррекции"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="order-1 md:order-2">
                <h2 className="font-serif text-xl mb-3">Подбор оптимальной коррекции</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  По результатам диагностики подбираем очки или контактные линзы с учётом образа жизни, профессии и индивидуальных особенностей зрения.
                </p>
                <a href="#booking" className="mt-5 inline-flex items-center gap-2 border border-ink rounded-full px-5 py-2.5 text-sm hover:bg-ink hover:text-primary-foreground transition-colors">
                  Записаться на подбор коррекции
                </a>
              </div>
            </div>
          </div>

          {/* BOOKING SIDEBAR */}
          <aside id="booking" className="bg-background p-6 rounded-sm h-fit sticky top-24 border border-border">
            <h3 className="font-serif text-xl mb-4">Записаться</h3>
            <BookingForm />
          </aside>
        </div>
      </section>

      {/* WHY US */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <h2 className="font-serif text-2xl lg:text-3xl mb-10 text-center">Почему стоит проводить диагностику зрения у нас?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {WHY.map(({ icon: Icon, text }) => (
            <div key={text} className="flex gap-4 items-start">
              <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-surface, #f8f6f2)" }}>
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <p className="text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href="#booking" className="inline-flex items-center gap-2 bg-ink text-primary-foreground rounded-full px-8 py-3 text-sm hover:opacity-90">
            Записаться на диагностику
          </a>
          <div className="mt-3 text-xs text-muted-foreground">г. Санкт-Петербург, ул. Кирочная, 17 (м. Чернышевская)</div>
        </div>
      </section>

      {/* OTHER SERVICES */}
      <section style={{ backgroundColor: "var(--color-surface, #f8f6f2)" }}>
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

export const Route = createFileRoute("/kabinet-diagnostiki-spb")({
  head: () => ({
    meta: [
      { title: "Диагностика зрения в Санкт-Петербурге · ОПТИКА 100%" },
      { name: "description", content: "Комплексная диагностика зрения на современном оборудовании. Авторефрактометрия, тонометрия, биомикроскопия. Запись онлайн." },
      { property: "og:title", content: "Диагностика зрения · ОПТИКА 100%" },
      { property: "og:image", content: "https://optika100.com/images/proverka-zreniya/izmenenie_davleniya.jpg" },
    ],
  }),
  component: KabinetDiagnostikiPage,
});
