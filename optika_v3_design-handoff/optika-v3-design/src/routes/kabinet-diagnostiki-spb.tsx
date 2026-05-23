import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { serviceHref, services } from "@/data/services";

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
      <button type="submit" className="w-full bg-brand text-brand-foreground py-3 rounded-sm hover:opacity-90 text-sm font-medium">
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
      {/* HERO WITH IMAGE */}
      <section className="relative">
        <div className="aspect-[21/9] lg:aspect-[21/7] overflow-hidden">
          <img
            src="https://optika100.com/upload/iblock/5f0/exk7kq10lnoxmwcn9m7jvnzvfgjqrdzg.jpg"
            alt="Диагностика зрения"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
          <h1 className="font-serif text-4xl lg:text-6xl text-primary-foreground">Диагностика зрения</h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="max-w-4xl space-y-6 text-foreground leading-relaxed">
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
      <section style={{ backgroundColor: "var(--color-surface, #f8f6f2)" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h2 className="font-serif text-3xl lg:text-4xl mb-12">Как проходит диагностика</h2>
          
          <div className="max-w-4xl space-y-6 text-foreground leading-relaxed mb-12">
            <p>
              Диагностика начинается с первичной консультации и включает поэтапную проверку зрения. Специалист проводит тесты для проверки остроты зрения, выполняет процедуры для определения остроты зрения и оценивает показатели зрения вдаль и вблизи. Проверка проводится для каждого глаза отдельно и совместно, что позволяет объективно оценить состояние зрительной системы.
            </p>
            
            <div>
              <p className="mb-4">В рамках обследования выполняются:</p>
              <ul className="space-y-3 ml-6">
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <span>Измерения внутриглазного давления (только в СПБ)</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <span>Биометрия (только в СПб)</span>
                </li>
                <li className="flex gap-3">
                  <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                  <span>Оценивается состояние диска зрительного нерва, переднего отрезка глаза и слезной пленки, что важно для выявления синдрома сухого глаза.</span>
                </li>
              </ul>
            </div>
            
            <p>
              По итогам обследования специалист анализирует полученные данные в соответствии с клиническими нормами и подготавливает рекомендации.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start mt-12">
            <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
              <img
                src="https://optika100.com/upload/iblock/59b/k70r2x2t7hx3c8nuhbcvf1xm9u4zymoc.jpg"
                alt="Как проходит диагностика"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="bg-cream p-6 rounded-2xl mb-6">
                <p className="text-foreground text-sm leading-relaxed">
                  Если потребуется дополнительная консультация или коррекция, пациенту предложат дальнейшие шаги в ближайшее время.
                </p>
              </div>
              <a href="#booking" className="inline-flex items-center gap-2 bg-brand text-brand-foreground rounded-full px-6 py-3 text-sm hover:opacity-90">
                Записаться на консультацию
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE EXAMINATION */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl mb-6">Комплексное обследование зрения</h2>
            <div className="space-y-6 text-foreground leading-relaxed">
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
            <a href="#booking" className="mt-8 inline-flex items-center gap-2 bg-brand text-brand-foreground rounded-full px-6 py-3 text-sm hover:opacity-90">
              Записаться на обследование
            </a>
          </div>
          <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
            <img
              src="https://optika100.com/upload/iblock/44b/p3g0fk4owz80e29ghd3rplc5uyobdm60.jpg"
              alt="Комплексное обследование зрения"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CONSULTATION */}
      <section style={{ backgroundColor: "var(--color-surface, #f8f6f2)" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[380px_1fr] gap-12 items-center">
            <div className="aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
              <img
                src="https://optika100.com/upload/iblock/b2e/yj0rh2kj21k8d0lxhq9pltdq4p2s1xh8.jpg"
                alt="Консультация оптометриста или офтальмолога"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl mb-6">Консультация оптометриста или офтальмолога</h2>
              <div className="space-y-6 text-foreground leading-relaxed">
                <p>
                  После завершения обследования проводится консультация оптометриста или врача офтальмолога. Специалист подробно разъясняет результаты диагностики, отвечает на часто задаваемые вопросы и объясняет, может быть ли выявленное состояние причиной жалоб на зрение или дискомфорта перед глазами.
                </p>
                
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                    <span>Врач оценивает риски развития заболеваний глаз</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                    <span>Состояние зрительного нерва</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                    <span>При необходимости направляет на дополнительное обследование или консультацию в отделение микрохирургии глаза</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                    <span>Для детей консультацию проводит детский врач, с учетом возрастных особенностей и зрительных нагрузок.</span>
                  </li>
                </ul>
                
                <p>
                  По итогам приема формируются индивидуальные рекомендации и план дальнейших действий — от наблюдения до аппаратного лечения или подбора коррекции.
                </p>
              </div>
              <a href="#booking" className="mt-8 inline-flex items-center gap-2 border border-ink rounded-full px-6 py-3 text-sm hover:bg-ink hover:text-primary-foreground transition-colors">
                Записаться на консультацию
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* OPTIMAL CORRECTION */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 aspect-[4/3] bg-accent rounded-2xl overflow-hidden">
            <img
              src="https://optika100.com/upload/iblock/e4a/wt3v1tpb18qy5diqehjpugvvmx5cjwqx.jpg"
              alt="Подбор оптимальной коррекции"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-serif text-3xl lg:text-4xl mb-6">Подбор оптимальной коррекции</h2>
            <div className="space-y-6 text-foreground leading-relaxed">
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
            <a href="#booking" className="mt-8 inline-flex items-center gap-2 bg-brand text-brand-foreground rounded-full px-6 py-3 text-sm hover:opacity-90">
              Записаться на подбор коррекции
            </a>
          </div>
        </div>
      </section>

      {/* MODERN EQUIPMENT */}
      <section style={{ backgroundColor: "var(--color-surface, #f8f6f2)" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-center">
            <div>
              <h2 className="font-serif text-3xl lg:text-4xl mb-6">Диагностика на современном оборудовании</h2>
              <div className="space-y-6 text-foreground leading-relaxed">
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
            <div className="aspect-[3/4] bg-accent rounded-2xl overflow-hidden">
              <img
                src="https://optika100.com/upload/iblock/89f/uavqkxdyv8k3vkwi51p6qv9z45o8pzg3.jpg"
                alt="Диагностика на современном оборудовании"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US WITH IMAGE */}
      <section className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
        <h2 className="font-serif text-3xl lg:text-4xl mb-12 text-center">Почему стоит проводить диагностику зрения у нас?</h2>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-12">
          <div className="space-y-6 text-foreground leading-relaxed">
            <p>
              Диагностика зрения в наших салонах проводится специалистами высокого уровня. Наши врачи-оптики, а также врачи офтальмологи, регулярно проходят повышение квалификации и работают по современным клиническим стандартам.
            </p>
            <p>
              Мы учитываем образ жизни, профессиональные и зрительные нагрузки пациента, чтобы дать не формальные, а действительно полезные рекомендации для сохранения вашего зрения.
            </p>
            
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <span>Во всех салонах оборудованы диагностические кабинеты современным оборудованием, что позволяет проводить точную и объективную проверку зрения и выявлять нарушения даже на ранних стадиях.</span>
              </li>
              <li className="flex gap-3">
                <Check className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <span>Мы выполняем полную диагностику зрения с применением специализированных тестов, включая оценку состояния зрительного нерва, сетчатки и показателей остроты зрения.</span>
              </li>
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
              src="https://optika100.com/upload/iblock/b2e/yj0rh2kj21k8d0lxhq9pltdq4p2s1xh8.jpg"
              alt="Почему стоит проводить диагностику зрения у нас"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-center bg-cream p-8 rounded-2xl">
          <p className="text-lg text-foreground leading-relaxed mb-6">
            После диагностики вы получаете чёткое понимание состояния глаз и вариантов дальнейших действий — от очковой коррекции до подбора линз или наблюдения.
          </p>
          <a href="#booking" className="inline-flex items-center gap-2 bg-brand text-brand-foreground rounded-full px-8 py-3 text-sm hover:opacity-90">
            Записаться на диагностику
          </a>
        </div>
      </section>

      {/* BOOKING SIDEBAR - Fixed Position */}
      <aside id="booking" className="fixed bottom-4 right-4 w-80 bg-background p-6 rounded-2xl shadow-xl border border-border z-50 hidden lg:block">
        <h3 className="font-serif text-xl mb-4">Записаться на диагностику</h3>
        <BookingForm />
      </aside>

      {/* OTHER SERVICES */}
      <section style={{ backgroundColor: "var(--color-surface, #f8f6f2)" }}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-16">
          <h2 className="font-serif text-2xl lg:text-3xl mb-8">Другие услуги</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {others.map((o) => (
              <a
                key={o.slug}
                href={serviceHref(o.slug)}
                className="block bg-background p-6 rounded-2xl hover:shadow-md transition-shadow"
              >
                <div className="font-serif text-lg mb-2">{o.title}</div>
                <div className="text-sm text-muted-foreground">{o.short}</div>
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
