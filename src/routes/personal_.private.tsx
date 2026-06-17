import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Check, Save } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/Reveal";
import { authUrl, IS_PRIVATE_BETA } from "@/lib/runtime";
import { cn } from "@/lib/utils";
import { getMe, saveProfile } from "@/lib/api/account";

export const Route = createFileRoute("/personal_/private")({
  head: () => ({
    meta: [
      { title: "Личные данные · ОПТИКА 100%" },
      {
        name: "description",
        content: "Контактные данные и связанные профили в личном кабинете ОПТИКА 100%.",
      },
      { property: "og:title", content: "Личные данные · ОПТИКА 100%" },
      {
        property: "og:description",
        content: "Управляйте контактами и связанными профилями в личном кабинете.",
      },
      { property: "og:image", content: "/personal/explain-glasses.webp" },
    ],
  }),
  component: PrivateDataPage,
});

type ProfileData = {
  fullName: string;
  phone: string;
  email: string;
};

const fields: Array<{
  key: keyof ProfileData;
  label: string;
  type: "text" | "tel" | "email";
  autoComplete: string;
  placeholder?: string;
  hint: string;
}> = [
  {
    key: "fullName",
    label: "Фамилия Имя Отчество",
    type: "text",
    autoComplete: "name",
    hint: "Заполните, чтобы мы знали, как к вам обращаться",
  },
  {
    key: "phone",
    label: "Телефон",
    type: "tel",
    autoComplete: "tel",
    hint: "Необходим для уточнения деталей заказа",
  },
  {
    key: "email",
    label: "E-mail",
    type: "email",
    autoComplete: "email",
    placeholder: "name@company.ru",
    hint: "Для отправки уведомлений о статусе заказа. Используйте как логин для входа в личный кабинет",
  },
];

function validateProfile(profile: ProfileData) {
  const errors: Partial<Record<keyof ProfileData, string>> = {};

  if (profile.fullName.trim().split(/\s+/).length < 2) {
    errors.fullName = "Укажите имя и фамилию";
  }

  if (profile.phone.replace(/\D/g, "").length < 11) {
    errors.phone = "Введите полный номер телефона";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
    errors.email = "Введите корректный e-mail";
  }

  return errors;
}

function PrivateDataPage() {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (savedTimer.current !== null) {
        window.clearTimeout(savedTimer.current);
      }
    },
    [],
  );

  // Prefill from the logged-in user; bounce to /auth/ when not authorized.
  useEffect(() => {
    let alive = true;
    (async () => {
      const me = await getMe().catch(() => ({ authorized: false }) as Awaited<ReturnType<typeof getMe>>);
      if (!alive) return;
      if (!me.authorized) {
        window.location.assign(authUrl());
        return;
      }
      setProfile({
        fullName: me.fullName ?? "",
        phone: me.phone ?? "",
        email: me.email ?? "",
      });
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (IS_PRIVATE_BETA) {
      toast.info("Редактирование профиля недоступно в бета-версии");
      return;
    }
    const nextErrors = validateProfile(profile);
    setErrors(nextErrors);

    const firstError = Object.values(nextErrors)[0];
    if (firstError) {
      setSaved(false);
      toast.error(firstError);
      return;
    }

    // fullName is stored as "Фамилия Имя Отчество" (lastName firstName secondName).
    const parts = profile.fullName.trim().split(/\s+/);
    const [lastName = "", firstName = "", ...rest] = parts;
    const secondName = rest.join(" ");

    setSaving(true);
    const res = await saveProfile({
      firstName,
      lastName,
      secondName,
      email: profile.email.trim(),
      phone: profile.phone.trim(),
    });
    setSaving(false);

    if (!res.ok) {
      setSaved(false);
      toast.error(res.error ?? "Не удалось сохранить изменения");
      return;
    }

    setSaved(true);
    toast.success("Изменения сохранены");

    if (savedTimer.current !== null) {
      window.clearTimeout(savedTimer.current);
    }
    savedTimer.current = window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <div className="bg-background">
      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-4 text-[13px] text-muted-foreground lg:px-8">
        <Link to="/" className="transition-colors hover:text-foreground">
          Главная
        </Link>
        <span className="text-[10px] opacity-50">›</span>
        <Link to="/personal" className="transition-colors hover:text-foreground">
          Личный кабинет
        </Link>
        <span className="text-[10px] opacity-50">›</span>
        <span className="font-medium text-brand">Личные данные</span>
      </nav>

      <section className="mx-auto max-w-7xl px-4 pt-2 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-7">
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Личный кабинет
            </div>
            <h1 className="font-serif text-4xl font-semibold leading-[1.04] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[52px]">
              Личные <span className="text-brand">данные</span>
            </h1>
          </div>
          <Link
            to="/personal"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={2}
            />
            Вернуться в кабинет
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-9 lg:px-8 lg:pb-24 lg:pt-12">
        <div className="flex flex-col gap-6">
          <Reveal className="rounded-[20px] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-12">
            {IS_PRIVATE_BETA ? (
              <p className="mb-7 rounded-xl border border-brand/20 bg-brand/5 px-5 py-4 text-sm text-muted-foreground">
                Бета-версия показывает данные профиля только для проверки. Изменения отключены.
              </p>
            ) : null}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7 sm:gap-8">
              {fields.map((field) => {
                const error = errors[field.key];
                const errorId = `${field.key}-error`;
                const hintId = `${field.key}-hint`;

                return (
                  <div
                    key={field.key}
                    className="grid gap-2.5 md:grid-cols-[minmax(0,560px)_1fr] md:gap-x-10 lg:gap-x-16"
                  >
                    <label
                      htmlFor={field.key}
                      className="text-base font-semibold tracking-[-0.005em] text-foreground md:col-start-1 md:row-start-1"
                    >
                      {field.label}
                      <span className="ml-1 text-brand" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id={field.key}
                      type={field.type}
                      value={profile[field.key]}
                      disabled={IS_PRIVATE_BETA}
                      onChange={(event) => {
                        setProfile((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }));
                        if (errors[field.key]) {
                          setErrors((current) => ({ ...current, [field.key]: undefined }));
                        }
                        setSaved(false);
                      }}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : hintId}
                      className={cn(
                        "min-h-[58px] w-full rounded-xl border bg-surface px-5 py-4 text-base leading-snug text-foreground outline-none transition placeholder:text-muted-foreground/75 hover:border-foreground/20 focus:border-brand focus:bg-card focus:ring-3 focus:ring-brand/10 md:col-start-1 md:row-start-2",
                        error ? "border-brand ring-3 ring-brand/10" : "border-border",
                      )}
                    />
                    <p
                      id={error ? errorId : hintId}
                      className={cn(
                        "text-sm leading-relaxed md:col-start-2 md:row-start-2 md:self-center",
                        error ? "font-medium text-brand" : "text-muted-foreground",
                      )}
                    >
                      {error ?? field.hint}
                    </p>
                  </div>
                );
              })}

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={saving || IS_PRIVATE_BETA}
                  className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-brand bg-brand px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md disabled:opacity-60"
                >
                  <Save className="h-[17px] w-[17px]" strokeWidth={2} />
                  {IS_PRIVATE_BETA
                    ? "Только просмотр в бета"
                    : saving
                      ? "Сохраняем…"
                      : "Сохранить изменения"}
                </button>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-medium text-success transition-opacity",
                    saved ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                  aria-live="polite"
                >
                  <Check className="h-4 w-4" strokeWidth={2.4} />
                  Изменения сохранены
                </span>
              </div>
            </form>
          </Reveal>

        </div>
      </section>
    </div>
  );
}
