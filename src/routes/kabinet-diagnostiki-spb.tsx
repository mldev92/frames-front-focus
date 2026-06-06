import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { serviceHref, services } from "@/data/services";
import { AppointmentModal } from "@/components/AppointmentModal";

const others = services.filter((s) => s.slug !== "diagnostika");

function CheckIcon({ size = 5 }: { size?: number }) {
  return (
    <svg
      className={`w-${size} h-${size} text-brand shrink-0 mt-0.5`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BrandBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm hover:opacity-90"
      style={{ backgroundColor: "var(--brand)", color: "var(--brand-foreground)" }}
    >
      {children}
    </button>
  );
}

function KabinetDiagnostikiPage() {
  const [aptOpen, setAptOpen] = useState(false);
  const openApt = () => setAptOpen(true);

  return (
    <div>
      {/* HERO */}
      <section className="relative">
        <div className="overflow-hidden" style={{ aspectRatio: "21/7" }}>
          <img
            src="/izmenenie_davleniya.webp"
            alt="Диагностика зрения"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "oklch(0.18 0.01 250 / 0.4)" }}>
          <h1 className="font-serif text-4xl lg:text-6xl text-primary-foreground">Диагностика зрения</h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="max-w-4xl space-y-6 leading-relaxed">
          <p>
            Диагностика зрения — это профессиональная проверка зрения, направленная на оценку состояния зрительной системы и выявление возможных отклонений. В наших салонах проводится полная диагностика зрения для взрослых и детей с использованием методов, позволяющих точно определить, как человек видит вблизи и вдаль, и выявить причины ухудшения зрения.
          </p>
          <p>
            В ходе диагностики выполняется оценка остроты зрения, проверка каждого глаза отдельно и бинокулярного зрения, а также анализ зрительных функций при разных нагрузках. Такая комплексная диагностика позволяет выявить нарушения рефракции, включая близорукость, дальнозоркость, астигматизм, и изменения, связанные с работой зрительного нерва и сетчатки глаза.
          </p>
          <p>
            Регулярная проверка зрения помогает обнаружить признаки заболеваний глаз на ранних стадиях, когда коррекция и лечение наиболее эффективны. По результатам обследования врач дает рекомендации по дальнейшим действиям и подбору коррекции вашего зрения.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h2 className="font-serif text-3xl lg:text-4xl mb-12">Как проходит диагностика</h2>

          <div className="max-w-4xl space-y-6 leading-relaxed mb-12">
            <p>
              Диагностика начинается с первичной консультации и включает поэтапную проверку зрения. Специалист проводит тесты для проверки остроты зрения, выполняет процедуры для определения остроты зрения и оценивает показатели зрения вдаль и вблизи. Проверка проводится для каждого глаза отдельно и совместно, что позволяет объективно оценить состояние зрительной системы.
            </p>
            <div>
              <p className="mb-4">В рамках обследования выполняются:</p>
              <ul className="space-y-3 ml-6">
                {[
                  "Измерения внутриглазного давления (только в СПБ)",
                  "Биометрия (только в СПб)",
                  "Оценивается состояние диска зрительного нерва, переднего отрезка глаза и слезной пленки, что важно для выявления синдрома сухого глаза.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckIcon size={5} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p>По итогам обследования специалист анализирует полученные данные в соответствии с клиническими нормами и подготавливает рекомендации.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
              <img
                src="/pic1.webp"
                alt="Как проходит диагностика"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="bg-cream p-6 rounded-2xl mb-6">
                <p className="text-sm leading-relaxed">
                  Если потребуется дополнительная консультация или коррекция, пациенту предложат дальнейшие шаги в ближайшее время.
                </p>
              </div>
              <BrandBtn onClick={openApt}>Записаться на консультацию</BrandBtn>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE EXAMINATION */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl mb-6">Комплексное обследование зрения</h2>
            <div className="space-y-6 leading-relaxed">
              <p>
                Комплексное обследование зрения направлено на углубленную оценку состояния зрительной системы и выявление скрытых нарушений, которые не всегда заметны при стандартной проверке. Оно позволяет определить причины дискомфорта, жалоб на размытость изображения, задвоение или ощущение напряжения перед глазами.
              </p>
              <p>
                В рамках обследования анализируется состояние ключевых структур глаза, диск зрительного нерва и переднего отрезка. Это особенно важно для раннего выявления заболеваний сетчатки и других патологий, которые на начальных этапах могут протекать без выраженных симптомов. Также оцениваются показатели, влияющие на стабильность зрения и риск снижения остроты в дальнейшем.
              </p>
              <p className="font-medium">
                Такой формат диагностики позволяет выявить изменения на ранних стадиях, определить необходимость наблюдения, лечения или дальнейшего подбора коррекции, а также выбрать оптимальную тактику ведения пациента.
              </p>
            </div>
            <div className="mt-8">
              <BrandBtn onClick={openApt}>Записаться на обследование</BrandBtn>
            </div>
          </div>
          <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
            <img
              src="/pic3.webp"
              alt="Комплексное обследование зрения"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CONSULTATION */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[380px_1fr] gap-12 items-center">
            <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
              <img
                src="/konsultaciya_oftalmologa.webp"
                alt="Консультация оптометриста или офтальмолога"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl mb-6">Консультация оптометриста или офтальмолога</h2>
              <div className="space-y-6 leading-relaxed">
                <p>
                  После завершения обследования проводится консультация оптометриста или врача офтальмолога. Специалист подробно разъясняет результаты диагностики, отвечает на часто задаваемые вопросы и объясняет, может ли выявленное состояние быть причиной жалоб на зрение или дискомфорта.
                </p>
                <ul className="space-y-3">
                  {[
                    "Врач оценивает риски развития заболеваний глаз",
                    "Состояние зрительного нерва",
                    "При необходимости направляет на дополнительное обследование или консультацию в отделение микрохирургии глаза",
                    "Для детей консультацию проводит детский врач, с учетом возрастных особенностей и зрительных нагрузок.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckIcon size={5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  По итогам приема формируются индивидуальные рекомендации и план дальнейших действий — от наблюдения до аппаратного лечения или подбора коррекции.
                </p>
              </div>
              <button
                type="button"
                onClick={openApt}
                className="mt-8 inline-flex items-center gap-2 border border-foreground rounded-full px-6 py-3 text-sm hover:bg-foreground hover:text-primary-foreground transition-colors cursor-pointer"
              >
                Записаться на консультацию
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* OPTIMAL CORRECTION */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
            <img
              src="/podbor_linz.webp"
              alt="Подбор оптимальной коррекции"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-serif text-3xl lg:text-4xl mb-6">Подбор оптимальной коррекции</h2>
            <div className="space-y-6 leading-relaxed">
              <p>
                После завершения диагностики специалист переходит к этапу подбора коррекции. На основании результатов обследования подбирается оптимальный вариант коррекции зрения с учётом образа жизни, зрительных нагрузок и индивидуальных особенностей пациента. Врач объясняет, какие способы коррекции подойдут в конкретном случае и какие ограничения важно учитывать.
              </p>
              <p>
                Пациенту могут быть рекомендованы очки или контактные линзы при активном образе жизни. Подбор выполняется таким образом, чтобы обеспечить комфортное зрение на разных расстояниях и снизить нагрузку на глаза. В сложных случаях специалист оценивает перспективы альтернативных методов, включая лазерную коррекцию зрения, если к этому есть показания.
              </p>
              <p className="font-medium">
                Цель этапа — подобрать наиболее безопасное и эффективное решение для стабилизации вашего зрения и предотвращения дальнейших нарушений.
              </p>
            </div>
            <div className="mt-8">
              <BrandBtn onClick={openApt}>Записаться на подбор коррекции</BrandBtn>
            </div>
          </div>
        </div>
      </section>

      {/* MODERN EQUIPMENT */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl mb-6">Диагностика на современном оборудовании</h2>
              <div className="space-y-6 leading-relaxed">
                <p>
                  Диагностика зрения проводится на современном оборудовании, что обеспечивает высокую точность измерений и достоверность результатов. В процессе обследования используется аппаратура для оценки рефракции, состояния глазных структур и функциональных показателей зрения.
                </p>
                <p>
                  Такой подход особенно важен для выявления патологий на ранних этапах и контроля динамики изменений.
                </p>
                <p>
                  Использование аппаратных методов позволяет врачу объективно оценить риски развития заболеваний глаз, определить тактику наблюдения и при необходимости рекомендовать дополнительные методы лечения или коррекции.
                </p>
              </div>
            </div>
            <div className="bg-accent rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <img
                src="/izmenenie_davleniya.webp"
                alt="Диагностика на современном оборудовании"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <h2 className="font-serif text-3xl lg:text-4xl mb-12 text-center">Почему стоит проводить диагностику зрения у нас?</h2>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
          <div className="space-y-6 leading-relaxed">
            <p>
              Диагностика зрения в наших салонах проводится специалистами высокого уровня. Наши врачи-оптики, а также врачи офтальмологи, регулярно проходят повышение квалификации и работают по современным клиническим стандартам.
            </p>
            <p>
              Мы учитываем образ жизни, профессиональные и зрительные нагрузки пациента, чтобы дать не формальные, а действительно полезные рекомендации для сохранения вашего зрения.
            </p>
            <ul className="space-y-4">
              {[
                "Во всех салонах оборудованы диагностические кабинеты современным оборудованием, что позволяет проводить точную и объективную проверку зрения и выявлять нарушения даже на ранних стадиях.",
                "Мы выполняем полную диагностику зрения с применением специализированных тестов, включая оценку состояния зрительного нерва, сетчатки и показателей остроты зрения.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckIcon size={5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-medium">
              Важное преимущество — комплексная диагностика проводится бесплатно при заказе очков в наших салонах.
            </p>
            <p>
              Это позволяет получить профессиональную оценку зрения и рекомендации по коррекции без дополнительных затрат.
            </p>
          </div>
          <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
            <img
              src="/pic6.webp"
              alt="Почему стоит проводить диагностику зрения у нас"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center bg-cream p-8 rounded-2xl">
          <p className="text-lg leading-relaxed mb-6">
            После диагностики вы получаете чёткое понимание состояния глаз и вариантов дальнейших действий — от очковой коррекции до подбора линз или наблюдения.
          </p>
          <BrandBtn onClick={openApt}>Записаться на диагностику</BrandBtn>
        </div>
      </section>

      {/* OTHER SERVICES */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <h2 className="font-serif text-2xl mb-8">Другие услуги</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {others.map((o) => (
            <a key={o.slug} href={serviceHref(o.slug)} className="block bg-surface p-6 rounded-2xl hover:shadow-md transition-shadow">
              <div className="font-serif text-lg">{o.title}</div>
              <div className="mt-2 text-sm text-muted-foreground">{o.short}</div>
            </a>
          ))}
        </div>
      </section>

      <AppointmentModal open={aptOpen} onOpenChange={setAptOpen} />
    </div>
  );
}

export const Route = createFileRoute("/kabinet-diagnostiki-spb")({
  head: () => ({
    meta: [
      { title: "Диагностика зрения в Санкт-Петербурге · ОПТИКА 100%" },
      { name: "description", content: "Профессиональная диагностика зрения на современном оборудовании. Авторефрактометрия, тонометрия, биомикроскопия. Запись онлайн." },
      { property: "og:title", content: "Диагностика зрения · ОПТИКА 100%" },
      { property: "og:image", content: "/izmenenie_davleniya.webp" },
    ],
  }),
  component: KabinetDiagnostikiPage,
});
