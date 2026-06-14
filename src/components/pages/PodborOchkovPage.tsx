import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  Check,
  Clock3,
  ContactRound,
  Eye,
  Glasses,
  HeartHandshake,
  Laptop,
  MessageCircle,
  MonitorCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  SprayCan,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Reveal } from "@/components/Reveal";

type IconText = {
  Icon: LucideIcon;
  title: string;
  text?: string;
};

const steps: IconText[] = [
  {
    Icon: MessageCircle,
    title: "Консультация",
    text: "Специалист уточняет жалобы, пожелания и особенности зрительной нагрузки.",
  },
  {
    Icon: Eye,
    title: "Диагностика",
    text: "Проверяем зрение вдаль и вблизи, выполняем точные измерения и тесты.",
  },
  {
    Icon: Glasses,
    title: "Подбор линз",
    text: "Выбираем оптимальную коррекцию и проверяем её в пробной оправе.",
  },
  {
    Icon: ContactRound,
    title: "Подбор оправы",
    text: "Подбираем оправу с учётом линз, анатомии лица и ваших предпочтений.",
  },
];

const lensUses: IconText[] = [
  { Icon: Glasses, title: "Для постоянного ношения" },
  { Icon: ContactRound, title: "Для вождения" },
  { Icon: Laptop, title: "Для работы за компьютером" },
  { Icon: BriefcaseBusiness, title: "Для офиса" },
];

const recommendations: IconText[] = [
  { Icon: BriefcaseBusiness, title: "Как хранить очки" },
  { Icon: SprayCan, title: "Очищать линзы и избегать повреждений" },
  {
    Icon: RefreshCw,
    title: "Советы по чередованию очков и контактных линз при комбинированной коррекции",
  },
  {
    Icon: Clock3,
    title: "Когда стоит повторно пройти проверку зрения или обратиться за корректировкой",
  },
];

const reasons: IconText[] = [
  {
    Icon: UserRound,
    title: "Опытные специалисты",
    text: "Врачи-оптики и оптометристы высокого класса, регулярно повышающие квалификацию.",
  },
  {
    Icon: MonitorCheck,
    title: "Современное оборудование",
    text: "Кабинеты диагностики во всех салонах с точными приборами и специализированными тестами.",
  },
  {
    Icon: HeartHandshake,
    title: "Индивидуальный подход",
    text: "Учитываем образ жизни, профессию и зрительные нагрузки каждого клиента.",
  },
  {
    Icon: ShieldCheck,
    title: "Точность и качество",
    text: "Дополнительный контроль качества и гарантия на изготовление очков до 6 месяцев.",
  },
];

const badges: IconText[] = [
  { Icon: Eye, title: "Профессиональная проверка зрения" },
  { Icon: MonitorCheck, title: "Современное оборудование" },
  { Icon: Glasses, title: "Большой выбор оправ и линз" },
  { Icon: ShieldCheck, title: "Гарантия на очки до 6 месяцев" },
];

const prescriptionDefinitions = [
  <>
    <b>OD</b> — правый глаз, <b>OS</b> — левый глаз
  </>,
  <>
    <b>Sph</b> — оптическая сила линзы (диоптрии)
  </>,
  <>
    <b>Cyl</b> и <b>Ax</b> — параметры при астигматизме
  </>,
  <>
    <b>Add</b> — добавка для близи
  </>,
  <>
    <b>Degr</b> — уменьшение диоптрий в верхней части (для офисных линз)
  </>,
  <>
    <b>Призма</b> — величина призматической коррекции
  </>,
  <>
    <b>Основание</b> — направление основания призмы (градусы)
  </>,
  <>
    <b>Межзрачковое расстояние (PD)</b> — расстояние между зрачками
  </>,
];

const cardClass = "overflow-hidden rounded-3xl bg-cream p-7 sm:p-9 lg:p-12";
const headingClass =
  "font-serif text-[1.7rem] font-medium leading-tight text-foreground sm:text-3xl lg:text-[2.1rem]";
const bodyClass = "text-[15px] leading-[1.65] text-muted-foreground";
const primaryButton =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-all hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none";
const photoClass =
  "h-full w-full object-cover transition-transform duration-1000 ease-editorial group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100";

function PageImage({
  src,
  alt,
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <div className={`group overflow-hidden rounded-2xl bg-surface ${className}`}>
      <img
        src={src}
        alt={alt}
        className={photoClass}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
    </div>
  );
}

export function PodborOchkovPage() {
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const openAppointment = () => setAppointmentOpen(true);

  return (
    <div className="bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-0 pt-6 lg:px-8 lg:pt-7">
        <section className={`${cardClass} grid p-0 lg:grid-cols-[0.92fr_1.08fr]`}>
          <Reveal className="self-center p-8 sm:p-10 lg:p-14">
            <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[3.25rem]">
              Подбор очков
            </h1>
            <p className={`mt-6 max-w-md ${bodyClass}`}>
              Подбор очков проводится в наших салонах оптики и включает профессиональную проверку
              зрения на современном оборудовании.
            </p>
            <p className={`mt-4 max-w-md ${bodyClass}`}>
              Услуга направлена на точную коррекцию зрения и подбор оптимального решения для
              повседневной жизни, работы и отдыха.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <button type="button" onClick={openAppointment} className={primaryButton}>
                Записаться на подбор
              </button>
              <Link
                to="/contacts"
                className="group/link inline-flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                Наши салоны
                <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1 motion-reduce:transform-none" />
              </Link>
            </div>
          </Reveal>
          <Reveal className="min-h-[320px] lg:min-h-[460px]" delay={100}>
            <PageImage
              src="/podbor-hero.webp"
              alt="Специалист помогает клиентке подобрать очки"
              className="h-full rounded-2xl lg:rounded-l-none lg:rounded-r-3xl"
              eager
            />
          </Reveal>
        </section>

        <section className={cardClass}>
          <div className="grid items-stretch gap-7 lg:grid-cols-[1.15fr_0.85fr]">
            <Reveal>
              <h2 className={headingClass}>Как проходит подбор</h2>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {steps.map(({ Icon, title, text }, index) => (
                  <div
                    key={title}
                    className="flex min-h-[220px] flex-col items-center rounded-2xl border border-border bg-card px-3 py-5 text-center"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full border border-brand text-xs font-semibold text-brand">
                      {index + 1}
                    </span>
                    <Icon className="mt-4 h-8 w-8 text-brand" strokeWidth={1.6} />
                    <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-xs leading-normal text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal className="min-h-[280px]" delay={100}>
              <PageImage
                src="/podbor-steps.webp"
                alt="Диагностика зрения на фороптере"
                className="h-full min-h-[280px]"
              />
            </Reveal>
          </div>
        </section>

        <section className={cardClass}>
          <div className="grid items-stretch gap-7 lg:grid-cols-[1fr_1.15fr]">
            <Reveal className="self-center">
              <h2 className={headingClass}>Обследование</h2>
              <div className={`mt-5 max-w-[460px] space-y-4 ${bodyClass}`}>
                <p>
                  Обследование проводится после первичной консультации и включает комплексную
                  диагностику состояния зрения.
                </p>
                <p>
                  Проверяется зрение каждого глаза и их совместная работа, а также реакция на
                  зрительную нагрузку при взгляде вдаль и вблизи.
                </p>
                <p>
                  Диагностика позволяет выявить особенности, которые важно учитывать при подборе
                  коррекции и выборе очков или линз.
                </p>
              </div>
            </Reveal>
            <Reveal className="min-h-[300px]" delay={100}>
              <PageImage
                src="/podbor-obsledovanie.webp"
                alt="Аппаратное обследование зрения"
                className="h-full min-h-[300px]"
              />
            </Reveal>
          </div>
        </section>

        <section className={cardClass}>
          <div className="grid items-stretch gap-7 lg:grid-cols-[1.05fr_1fr]">
            <Reveal className="min-h-[320px]">
              <PageImage
                src="/podbor-linzy.webp"
                alt="Подбор пробных очковых линз"
                className="h-full min-h-[320px]"
              />
            </Reveal>
            <Reveal className="self-center" delay={100}>
              <h2 className={headingClass}>Подбор очковых линз</h2>
              <div className={`mt-5 space-y-4 ${bodyClass}`}>
                <p>
                  После завершения обследования специалист подбирает оптимальную коррекцию и
                  проверяет её в пробной оправе.
                </p>
                <p>Далее подбирается тип линз в зависимости от условий использования:</p>
              </div>
              <div className="my-5 grid gap-4 sm:grid-cols-2">
                {lensUses.map(({ Icon, title }) => (
                  <div key={title} className="flex items-center gap-3 text-[13.5px] font-semibold">
                    <Icon className="h-6 w-6 shrink-0 text-brand" strokeWidth={1.6} />
                    {title}
                  </div>
                ))}
              </div>
              <p className={bodyClass}>
                При необходимости могут быть рекомендованы прогрессивные очки.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[13px] text-muted-foreground">
                  <Clock3 className="h-4 w-4 text-brand" />
                  Примерное время: 30–45 мин.
                </span>
                <button type="button" onClick={openAppointment} className={primaryButton}>
                  Записаться на подбор очков
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        <section className={cardClass}>
          <div className="grid items-stretch gap-7 lg:grid-cols-[1fr_1.15fr]">
            <Reveal className="self-center">
              <h2 className={headingClass}>Подбор оправы</h2>
              <div className={`mt-5 max-w-[460px] space-y-4 ${bodyClass}`}>
                <p>
                  Оправа подбирается с учётом назначенных линз, анатомических особенностей лица и
                  пожеланий пациента.
                </p>
                <p>В салоне представлены варианты для разных задач:</p>
              </div>
              <ul className="my-5 space-y-3">
                {["Классические модели", "Современные дизайнерские решения", "Детские оправы"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-brand text-brand">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>
              <p className={`max-w-[460px] ${bodyClass}`}>
                При необходимости специалист корректирует посадку оправы, чтобы очки не смещались и
                не вызывали дискомфорта.
              </p>
            </Reveal>
            <Reveal className="min-h-[300px]" delay={100}>
              <PageImage
                src="/podbor-oprava.webp"
                alt="Примерка оправы перед зеркалом"
                className="h-full min-h-[300px]"
              />
            </Reveal>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className={cardClass}>
            <h2 className={headingClass}>Рекомендации по использованию очков</h2>
            <div className="mt-6 grid items-stretch gap-6 sm:grid-cols-[1.05fr_0.95fr]">
              <Reveal className="flex flex-col justify-center gap-4">
                {recommendations.map(({ Icon, title }) => (
                  <div key={title} className="flex items-start gap-3.5 text-[13.5px] font-medium">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand/30 bg-card text-brand">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                    </span>
                    <span className="pt-2.5 leading-normal">{title}</span>
                  </div>
                ))}
              </Reveal>
              <Reveal className="min-h-[340px]" delay={100}>
                <PageImage
                  src="/podbor-reco.webp"
                  alt="Очки, футляр и средства для ухода"
                  className="h-full min-h-[340px]"
                />
              </Reveal>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className={headingClass}>Как читать рецепт на очки</h2>
            <div className="mt-6 grid items-stretch gap-7 sm:grid-cols-[1fr_1.15fr]">
              <Reveal>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                  Специалист поможет правильно интерпретировать рецепт и подобрать нужные линзы.
                </p>
                <ul className="mt-4 space-y-2.5">
                  {prescriptionDefinitions.map((definition, index) => (
                    <li
                      key={index}
                      className="flex gap-2.5 text-xs leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <span className="[&_b]:font-semibold [&_b]:text-foreground">
                        {definition}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={100}>
                <div className="flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <img
                    src="/glasses_reciept.jpg"
                    alt="Образец рецепта на очки с расшифровкой параметров"
                    className="h-full max-h-[520px] w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </Reveal>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Даже при наличии рецепта рекомендуется пройти контрольную проверку, чтобы убедиться в
              актуальности данных.
            </p>
          </section>
        </div>

        <section className={cardClass}>
          <div className="grid items-stretch gap-7 lg:grid-cols-[1fr_1.15fr]">
            <Reveal className="self-center">
              <h2 className={headingClass}>Почему стоит подбирать у нас?</h2>
              <div className="mt-6 space-y-5">
                {reasons.map(({ Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-brand/30 bg-card text-brand">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{title}</h3>
                      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal className="min-h-[330px]" delay={100}>
              <PageImage
                src="/podbor-why.webp"
                alt="Специалист обсуждает результаты диагностики с семьёй"
                className="h-full min-h-[330px]"
              />
            </Reveal>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className={cardClass}>
            <h2 className={headingClass}>Сроки изготовления очков</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Сроки зависят от сложности заказа, выбранных линз и оправы.
            </p>
            <div className="mt-5">
              {[
                [Glasses, "Простые очки", "от 1 часа"],
                [CalendarDays, "Стандартные заказы", "1–5 дней"],
                [CalendarCheck, "Индивидуальные линзы и специальные решения", "до 21 дня"],
              ].map(([Icon, name, value], index) => {
                const TermIcon = Icon as LucideIcon;
                return (
                  <div
                    key={name as string}
                    className={`flex items-center gap-3.5 border-b border-border py-3.5 ${index === 0 ? "border-t" : ""}`}
                  >
                    <TermIcon className="h-5 w-5 shrink-0 text-brand" strokeWidth={1.6} />
                    <span className="flex-1 text-sm font-medium leading-snug">
                      {name as string}
                    </span>
                    <span className="whitespace-nowrap text-sm font-bold">{value as string}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Подбор и оформление заказа осуществляются в нашей сети салонов, работающих ежедневно с
              10:00 до 20:00. Адреса салонов — в разделе{" "}
              <Link to="/contacts" className="font-medium text-brand hover:underline">
                Контакты
              </Link>
              .
            </p>
          </section>

          <section className={`${cardClass} flex items-center gap-6`}>
            <Reveal className="min-w-0 flex-1">
              <h2 className={headingClass}>Нужна консультация?</h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Оставьте заявку на подбор очков — специалист свяжется с вами в ближайшее время и
                ответит на все вопросы.
              </p>
              <button type="button" onClick={openAppointment} className={`mt-6 ${primaryButton}`}>
                Оставить заявку
              </button>
            </Reveal>
            <Reveal
              delay={100}
              className="hidden h-32 w-32 shrink-0 place-items-center rounded-full bg-card text-brand sm:grid"
            >
              <CalendarCheck className="h-14 w-14" strokeWidth={1.3} />
            </Reveal>
          </section>
        </div>
      </div>

      <section className="mt-7 bg-brand-700 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 py-6 lg:grid-cols-4 lg:px-8">
          {badges.map(({ Icon, title }) => (
            <div key={title} className="flex items-center justify-center gap-3">
              <Icon className="h-7 w-7 shrink-0 opacity-90" strokeWidth={1.5} />
              <span className="max-w-[170px] text-[13px] font-medium leading-snug">{title}</span>
            </div>
          ))}
        </div>
      </section>

      <AppointmentModal open={appointmentOpen} onOpenChange={setAppointmentOpen} />
    </div>
  );
}
