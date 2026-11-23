import { ArrowDown, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productCardHref } from "@/data/categories";
import type { Product } from "@/data/types";
import { formatRub } from "@/lib/format-rub";
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
    example: "essilor_essentials_everyday_1_5_trio",
  },
  {
    title: "С расширенными зонами",
    text: "Дизайны с разным распределением зон для дали, экрана и чтения. Специалист помогает выбрать баланс под ваши задачи.",
    example: "varilux_comfort_max_orma_crizal_easy_pro_uv",
  },
  {
    title: "Индивидуальные",
    text: "При расчёте учитывают рецепт, параметры выбранной оправы и то, как она сидит на лице.",
    example: "hoyalux_id_myself_hi_vision_longlife",
  },
] as const;

const questions = [
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
  return (
    <div className="-mt-4 mb-6 space-y-4">
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Прогрессивные линзы Essilor, Varilux и Hoyalux для дали, средней дистанции и чтения.
        Сравните модели по цене, бренду и покрытию.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild className="min-h-11">
          <a href="#catalog-products">
            Смотреть модели <ArrowDown aria-hidden="true" />
          </a>
        </Button>
        <Button asChild variant="outline" className="min-h-11">
          <a href="#progressive-guide">
            Как выбрать линзы <ArrowDown aria-hidden="true" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export function ProgressiveCatalogGuide({ products }: { products: readonly Product[] }) {
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
          <ul className="grid gap-3 sm:grid-cols-3">
            {zones.map(([title, text]) => (
              <li key={title} className="space-y-2 rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl">Три уровня прогрессивных линз</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {levels.map((level) => {
              const model = products.find((product) => product.slug === level.example);
              return (
                <article
                  key={level.title}
                  className="flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:p-5"
                >
                  <h3 className="font-serif text-xl">{level.title}</h3>
                  <p className="grow text-sm leading-relaxed text-muted-foreground">{level.text}</p>
                  {model && (
                    <div className="space-y-1 border-t border-border pt-3 text-sm">
                      <p className="font-medium">Пример из каталога</p>
                      <a
                        href={productCardHref(model)}
                        className="break-words text-brand underline underline-offset-4"
                      >
                        {model.name}
                      </a>
                      {Number.isFinite(model.price) && model.price > 0 && (
                        <p className="font-semibold tabular-nums">
                          Цена в каталоге — {formatRub(model.price)}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
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
            <p className="leading-relaxed text-muted-foreground">
              Essilor выпускает линзы Essentials и Varilux. В каталоге также есть Hoyalux от Hoya.
              Сравнивайте дизайн, доступные покрытия и параметры по рецепту.
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
