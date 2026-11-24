import { useState } from "react";
import { ArrowDown, ArrowRight, ChevronDown } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Button } from "@/components/ui/button";
import { progressiveArticles } from "@/lib/progressive-lenses";

const zones = [
  ["Верхняя — вдаль", "Дорога, вывески и предметы на удалении."],
  ["Средняя — на промежуточном расстоянии", "Монитор, приборная панель и разговор с собеседником."],
  ["Нижняя — вблизи", "Книга, телефон и работа с мелкими деталями."],
] as const;

const levels = [
  {
    title: "Базовые",
    text: "Для повседневных задач. При подборе учитывают рецепт и размер оправы.",
  },
  {
    title: "С расширенными зонами",
    text: "Дизайны с разным распределением зон для дали, экрана и чтения. Специалист помогает выбрать баланс под ваши задачи.",
  },
  {
    title: "Индивидуальные",
    text: "При расчёте учитывают рецепт, параметры выбранной оправы и то, как она сидит на лице.",
  },
] as const;

const selectionFactors = [
  ["Рецепт", "Учитывают силу коррекции, астигматизм и аддидацию — добавку для зрения вблизи."],
  [
    "Повседневные задачи",
    "Расскажите, сколько времени вы читаете, работаете за экраном или проводите за рулём.",
  ],
  [
    "Оправа и посадка",
    "Специалист измеряет межзрачковое расстояние и высоту установки линзы в выбранной оправе.",
  ],
] as const;

const brands = [
  [
    "Essilor",
    "Линейки Essentials и Varilux. У Varilux есть серии Liberty, Comfort Max, Physio и X с разными дизайнами и покрытиями.",
  ],
  [
    "Hoya",
    "Линейки Hoyalux, включая Balansis, Daynamic, iD LifeStyle и iD MySelf. У отдельных вариантов доступны покрытия Hi-Vision и фотохром Sensity.",
  ],
  [
    "ZEISS",
    "В линейке Progressive DriveSafe есть дизайн, ориентированный на вождение. Условия подбора уточняйте для выбранной линзы.",
  ],
] as const;

const questions = [
  {
    title: "Можно ли подобрать линзы при астигматизме?",
    answer:
      "Подходящие варианты зависят от параметров рецепта. Специалист проверит, какие линзы можно изготовить с нужной цилиндрической коррекцией.",
  },
  {
    title: "Чем прогрессивные линзы отличаются от офисных?",
    answer:
      "Прогрессивные линзы рассчитаны на три дистанции, включая даль. Офисные предназначены для ближней и промежуточной работы. Если очки нужны в основном для чтения и монитора, обсудите оба варианта со специалистом.",
  },
  {
    title: "Сколько времени нужно, чтобы привыкнуть?",
    answer:
      "Срок адаптации индивидуален. Нужно привыкнуть искать нужную зону линзы взглядом или поворотом головы. Если очки остаются неудобными, специалист проверит рецепт, центровку и посадку оправы.",
  },
  {
    title: "Можно ли использовать свою оправу?",
    answer:
      "Это зависит от её высоты, состояния и посадки. Принесите оправу на подбор, чтобы специалист смог проверить, хватает ли места для всех зон линзы.",
  },
  {
    title: "От чего зависит стоимость прогрессивных очков?",
    answer:
      "На цену влияют дизайн линз, индекс материала, покрытия, оправа и работа по изготовлению. Цены на модели смотрите в каталоге. Итоговую стоимость очков уточняют после выбора линз и оправы.",
  },
] as const;

export function ProgressiveCatalogIntro() {
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  return (
    <div className="mt-3 space-y-4">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Прогрессивные линзы для дали, средней дистанции и чтения. Сравните линейки по цене за пару,
        бренду и покрытию или запишитесь на подбор в Санкт-Петербурге.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild className="min-h-11">
          <a href="#catalog-products">
            Смотреть модели <ArrowDown aria-hidden="true" />
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setAppointmentOpen(true)}
        >
          Записаться на подбор
        </Button>
      </div>
      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </div>
  );
}

export function ProgressiveCatalogGuide() {
  return (
    <section
      id="progressive-guide"
      aria-labelledby="progressive-guide-title"
      className="scroll-mt-24 border-t border-border bg-cream"
    >
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-8 lg:space-y-12 lg:py-14">
        <div className="space-y-4">
          <h2 id="progressive-guide-title" className="font-serif text-3xl">
            Что такое прогрессивные линзы
          </h2>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            При пресбиопии глазу становится сложнее фокусироваться вблизи. В прогрессивной линзе
            оптическая сила меняется плавно сверху вниз. Это даёт возможность пользоваться одними
            очками для разных расстояний.
          </p>
          <figure className="grid items-center gap-5 rounded-xl border border-border bg-card p-5 sm:grid-cols-[minmax(0,12rem)_1fr]">
            <svg viewBox="0 0 200 240" className="mx-auto w-full max-w-48" aria-hidden="true">
              <defs>
                <linearGradient id="progressive-lens-zones" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    className="[stop-color:var(--color-brand)]"
                    stopOpacity="0.08"
                  />
                  <stop
                    offset="100%"
                    className="[stop-color:var(--color-brand)]"
                    stopOpacity="0.4"
                  />
                </linearGradient>
              </defs>
              <ellipse
                cx="100"
                cy="120"
                rx="88"
                ry="111"
                fill="url(#progressive-lens-zones)"
                className="stroke-brand"
                strokeWidth="2"
              />
              <path
                d="M100 64v120"
                className="stroke-brand/20"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <g textAnchor="middle" fontSize="14" fontWeight="600" className="fill-foreground">
                <text x="100" y="54">
                  Даль
                </text>
                <text x="100" y="125">
                  Средняя зона
                </text>
                <text x="100" y="202">
                  Близь
                </text>
              </g>
            </svg>
            <figcaption>
              <dl className="space-y-4">
                {zones.map(([title, text]) => (
                  <div key={title}>
                    <dt className="font-semibold">{title}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{text}</dd>
                  </div>
                ))}
              </dl>
            </figcaption>
          </figure>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl">Три уровня прогрессивных линз</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {levels.map(({ title, text }) => (
              <article
                key={title}
                className="space-y-2 rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Кому подходят прогрессивные линзы</h2>
            <p className="leading-relaxed text-muted-foreground">
              Такой дизайн стоит обсудить при пресбиопии, если нужно видеть вдаль и вблизи в одних
              очках. На подборе расскажите, сколько времени вы проводите за экраном, читаете или
              водите.
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Преимущества и ограничения</h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>Одна пара очков для дали, экрана и чтения, с плавным переходом между зонами.</li>
              <li>
                По краям поля зрения возможны искажения. Нужно привыкнуть направлять взгляд через
                подходящую зону.
              </li>
              <li>Для хорошей посадки важны точный рецепт, положение линз и подходящая оправа.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl">Как выбрать прогрессивные линзы</h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            {selectionFactors.map(([title, text]) => (
              <div key={title}>
                <dt className="font-semibold">{title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl">Сравнение производителей</h2>
          <dl className="grid gap-3 sm:grid-cols-3">
            {brands.map(([brand, text]) => (
              <div key={brand} className="space-y-2 rounded-xl border border-border bg-card p-4">
                <dt className="font-semibold">{brand}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{text}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl">Частые вопросы о прогрессивных линзах</h2>
          <div className="max-w-3xl divide-y divide-border border-y border-border">
            {questions.map(({ title, answer }) => (
              <details key={title} className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {title}{" "}
                  <ChevronDown
                    className="size-4 shrink-0 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-4 pr-6 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>

        <nav aria-label="Статьи о прогрессивных линзах" className="space-y-3">
          <h2 className="font-serif text-2xl">Статьи о выборе и стоимости</h2>
          <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {progressiveArticles.map(({ slug, title }) => (
              <li key={slug}>
                <a
                  href={`/blog/linzy-dlya-ochkov/${slug}/`}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline"
                >
                  {title} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
