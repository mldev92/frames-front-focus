import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/politika-konfidentsialnosti")({
  head: () => ({
    meta: [
      { title: "Политика конфиденциальности · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Политика обработки персональных данных пользователей сайта ОПТИКА 100%.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacyPage,
});

// NOTE: placeholder section structure — replace with the legally approved text
// currently published at optika100.com/politika-konfidentsialnosti/.
const sections = [
  {
    h: "1. Общие положения",
    p: "Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта. Используя сайт, вы соглашаетесь с условиями настоящей Политики.",
  },
  {
    h: "2. Какие данные мы собираем",
    p: "Имя, контактный телефон, адрес электронной почты и адрес доставки, указанные при оформлении заказа или записи на услугу.",
  },
  {
    h: "3. Цели обработки",
    p: "Обработка заказов, информирование о статусе заказа, запись на приём и услуги, ответы на обращения.",
  },
  {
    h: "4. Хранение и защита",
    p: "Персональные данные хранятся не дольше, чем требуется для целей обработки, и защищаются организационными и техническими мерами.",
  },
  {
    h: "5. Права пользователя",
    p: "Вы вправе запросить изменение или удаление своих персональных данных, обратившись по контактам, указанным на сайте.",
  },
];

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12">
      <h1 className="font-serif text-4xl lg:text-5xl">Политика конфиденциальности</h1>
      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-serif text-xl">{s.h}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
