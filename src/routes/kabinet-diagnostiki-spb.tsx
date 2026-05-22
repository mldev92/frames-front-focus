import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { serviceHref, services } from "@/data/services";

const others = services.filter((s) => s.slug !== "diagnostika");

const PROCEDURES = [
  {
    img: "https://optika100.com/images/proverka-zreniya/konsultaciya_oftalmologa.jpg",
    alt: "Авторефрактометрия",
    title: "Авторефрактометрия (объективное определение рефракции)",
    lead: "Измерение оптической силы глаза с помощью авторефрактометра.",
    items: [
      "Выявление близорукости (миопии), дальнозоркости (гиперметропии), астигматизма",
      "Определение степени рефракционных нарушений",
    ],
  },
  {
    img: "https://optika100.com/images/proverka-zreniya/podbor_linz.jpg",
    alt: "Биомикроскопия",
    title: "Биомикроскопия переднего отрезка глаза (щелевая лампа)",
    lead: "Детальный осмотр структур глаза под микроскопом.",
    items: [
      "Оценка состояния век, конъюнктивы, роговицы, радужки, хрусталика",
      "Выявление воспалительных процессов, катаракты, дистрофических изменений",
    ],
  },
  {
    img: "https://optika100.com/images/proverka-zreniya/izmenenie_davleniya.jpg",
    alt: "Тонометрия",
    title: "Тонометрия (измерение внутриглазного давления — ВГД)",
    lead: "Бесконтактное измерение давления внутри глаза.",
    items: [
      "Скрининг глаукомы — заболевания, которое может привести к слепоте",
      "Контроль ВГД у пациентов с глаукомой или в группе риска",
    ],
  },
];

const WHY = [
  {
    title: "Современное оборудование",
    text: "Авторефрактометр, щелевая лампа, бесконтактный тонометр, кератометр — всё в одном кабинете.",
  },
  {
    title: "Тонометрия и биометрия — только в СПб",
    text: "Измерение внутриглазного давления и параметров глаза доступно только в нашем петербургском салоне.",
  },
  {
    title: "Комплексный подход",
    text: "Диагностика + консультация + подбор коррекции за один визит — не нужно ходить по нескольким местам.",
  },
  {
    title: "Опытные специалисты",
    text: "Наши оптометристы и офтальмологи регулярно проходят обучение и повышают квалификацию.",
  },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function KabinetDiagnostikiPage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <nav className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
              <Link to="/" className="hover:text-foreground">Главная</Link>
              <span>›</span>
              <Link to="/uslugi" className="hover:text-foreground">Услуги</Link>
              <span>›</span>
              <span>Диагностика зрения</span>
            </nav>
            <div className="text-xs uppercase tracking-widest text-brand mb-3">Кабинет диагностики</div>
            <h1 className="font-serif text-4xl lg:text-5xl leading-tight">Диагностика зрения</h1>
            <p className="mt-5 text-base leading-relaxed">
              Диагностика зрения — это профессиональное изучение зрения, проводящееся по одному состояния зрительной системы с целью выявления различных нарушений и заболеваний глаз. Включает проверку остроты зрения, определение рефракции (близорукость, дальнозоркость, астигматизм), осмотр структур глаза с помощью специального оборудования, измерение внутриглазного давления и другие процедуры. Результаты позволяют подобрать оптимальную коррекцию (очки, контактные линзы), выявить ранние признаки глазных заболеваний (глаукома, катаракта, патологии сетчатки) и направить к профильному специалисту при необходимости.
            </p>
          </div>
          <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
            <img
              src="https://optika100.com/images/proverka-zreniya/izmenenie_davleniya.jpg"
              alt="Диагностика зрения в Оптика 100%"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="max-w-4xl">
          <p className="text-muted-foreground leading-relaxed">
            Такая диагностика важна потому что многие глазные болезни протекают бессимптомно на ранних стадиях, и именно превентивные обследования помогают сохранить зрение и предотвратить серьёзные осложнения. Регулярная проверка зрения рекомендуется раз в 1–2 года для взрослых, а для детей, людей старше 40 лет и пациентов с хроническими заболеваниями (диабет, гипертония) — чаще.
          </p>
        </div>
      </section>

      {/* PROCEDURES */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl mb-4">Какие процедуры проводятся?</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              Диагностика зрения проводится с помощью современного офтальмологического оборудования. Она позволяет объективно оценить функции зрительной системы, выявить скрытые нарушения и подобрать оптимальную коррекцию. Ниже — перечень основных процедур и их клиническое значение.
            </p>
          </div>

          <div className="space-y-16">
            {PROCEDURES.map((p) => (
              <div key={p.title} className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
                <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
                  <img src={p.img} alt={p.alt} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-serif text-xl mb-3">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.lead}</p>
                  <div className="space-y-3">
                    <div className="text-sm font-medium">В рамках обследования выполняется:</div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {p.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <CheckIcon />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTATION */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <h2 className="font-serif text-3xl mb-6">Консультация оптометриста или офтальмолога</h2>
        <p className="text-muted-foreground leading-relaxed mb-8 max-w-4xl">
          Комплексное обследование зрения включает не только объективные измерения на приборах, но и консультацию квалифицированного специалиста — оптометриста или врача-офтальмолога. Именно специалист интерпретирует полученные данные, учитывает жалобы пациента, анамнез, образ жизни и профессиональные особенности, чтобы поставить точный диагноз и дать индивидуальные рекомендации.
        </p>
        <div className="bg-cream border-l-4 border-brand p-6 rounded-sm max-w-4xl">
          <h3 className="font-serif text-lg mb-3">Важно!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Консультация врача — это не просто «выписать рецепт». Это анализ всей картины в целом: от оптических параметров глаза до состояния глазного дна и риска развития патологий. Раннее выявление глаукомы, начальной катаракты или дистрофии сетчатки может предотвратить потерю зрения в будущем.
          </p>
        </div>
      </section>

      {/* MYOPIA CONTROL */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <div className="max-w-4xl">
            <h2 className="font-serif text-3xl lg:text-4xl mb-4">Кабинет профилактики и лечения близорукости (миопии) у детей</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Детская близорукость — распространённая проблема: по статистике, каждый третий ребёнок школьного возраста имеет миопию. Чем раньше она появляется, тем быстрее прогрессирует, и к совершеннолетию может достичь высоких степеней (−6.0 D и более), увеличивая риск осложнений.
            </p>
            <div className="bg-cream border-l-4 border-brand p-6 rounded-sm">
              <h3 className="font-serif text-lg mb-3">Помните!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Раннее начало контроля миопии — ключ к сохранению здоровья глаз ребёнка на всю жизнь.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DRY EYE */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="max-w-4xl">
          <h2 className="font-serif text-3xl lg:text-4xl mb-4">Диагностика и лечение синдрома «сухого глаза»</h2>
          <p className="text-muted-foreground leading-relaxed">
            Синдром «сухого глаза» (ССГ) — нарушение стабильности слёзной плёнки, вызывающее дискомфорт, покраснение, ощущение песка в глазах. Особенно актуально для пользователей компьютеров, носителей контактных линз, людей в возрасте 40+.
          </p>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h2 className="font-serif text-3xl lg:text-4xl mb-12 text-center">Почему стоит проводить диагностику зрения у нас?</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {WHY.map((w) => (
              <div key={w.title} className="bg-white p-6 rounded-2xl">
                <h3 className="font-serif text-lg mb-3">{w.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a href="#booking" className="inline-flex items-center gap-2 bg-ink text-primary-foreground rounded-full px-8 py-3 text-sm hover:opacity-90 mb-4">
              Записаться на диагностику
            </a>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <PinIcon />
              <span>г. Санкт-Петербург, ул. Кирочная, 17 (м. Чернышевская)</span>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="max-w-lg mx-auto">
          <h2 className="font-serif text-3xl mb-8 text-center">Записаться на диагностику</h2>
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
              Записаться
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.
            </p>
          </form>
        </div>
      </section>

      {/* OTHER SERVICES */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h2 className="font-serif text-2xl mb-8">Другие услуги</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {others.map((o) => (
              <a key={o.slug} href={serviceHref(o.slug)} className="block bg-white p-6 rounded-2xl hover:shadow-md transition-shadow">
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
      { name: "description", content: "Профессиональная диагностика зрения на современном оборудовании. Авторефрактометрия, тонометрия, биомикроскопия. Запись онлайн." },
      { property: "og:title", content: "Диагностика зрения · ОПТИКА 100%" },
      { property: "og:image", content: "https://optika100.com/images/proverka-zreniya/izmenenie_davleniya.jpg" },
    ],
  }),
  component: KabinetDiagnostikiPage,
});
