import { createFileRoute } from "@tanstack/react-router";
import { CONTACT, LEGAL_DETAILS } from "@/data/contact";

export const Route = createFileRoute("/requisites")({
  head: () => ({
    meta: [
      { title: "Реквизиты и контакты · ОПТИКА 100%" },
      {
        name: "description",
        content: "Юридические реквизиты и контактная информация ОПТИКА 100%.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RequisitesPage,
});

const rows: [string, string][] = [
  ["Наименование", LEGAL_DETAILS.name],
  ["ИНН", LEGAL_DETAILS.inn],
  ["ОГРНИП", LEGAL_DETAILS.ogrnip],
  ["Адрес", LEGAL_DETAILS.address],
  ["Телефон", CONTACT.phone.label],
  ["E-mail", CONTACT.email.label],
];

function RequisitesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 lg:px-8 py-12">
      <h1 className="font-serif text-4xl lg:text-5xl">Реквизиты</h1>
      <dl className="mt-10 divide-y divide-border border-y border-border">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col sm:flex-row sm:gap-6 py-4">
            <dt className="text-muted-foreground sm:w-56 shrink-0">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
