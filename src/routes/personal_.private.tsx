import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Check, Link2, Plus, Save } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
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

type SocialProfile = {
  name: string;
  status: string;
  linked: boolean;
  icon: ReactNode;
  iconClassName: string;
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

const socialProfiles: SocialProfile[] = [
  {
    name: "ВКонтакте",
    status: "Привязан · Александр П.",
    linked: true,
    iconClassName: "bg-[#0077ff]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.16 17.36c-5.47 0-8.86-3.84-9-10.23h2.76c.1 4.7 2.23 6.7 3.86 7.1V7.13h2.62v3.9c1.58-.17 3.24-2 3.8-3.9h2.6c-.43 2.34-2.2 4.17-3.45 4.92 1.25.61 3.27 2.2 4.05 5.3h-2.86c-.6-1.95-2.1-3.46-4.14-3.66v3.66h-.3z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    status: "Не привязан",
    linked: false,
    iconClassName: "bg-[#2aabee]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.94 4.6 18.6 19.2c-.25 1.1-.9 1.38-1.83.86l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.16 9.4-8.49c.4-.36-.09-.57-.63-.2L5.16 12.1.15 10.53c-1.09-.34-1.11-1.09.23-1.6l19.6-7.56c.91-.34 1.7.2 1.4 1.62z" />
      </svg>
    ),
  },
  {
    name: "Google",
    status: "Не привязан",
    linked: false,
    iconClassName: "border border-border bg-white",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22 12.2c0-.7-.06-1.37-.18-2.02H12V14h5.6a4.8 4.8 0 0 1-2.07 3.15v2.62h3.35C20.83 18 22 15.4 22 12.2z"
        />
        <path
          fill="#34A853"
          d="M12 22c2.7 0 4.97-.9 6.63-2.42l-3.35-2.62c-.93.62-2.12.99-3.28.99-2.53 0-4.67-1.71-5.44-4.01H3.1v2.7A10 10 0 0 0 12 22z"
        />
        <path
          fill="#FBBC05"
          d="M6.56 13.94a6 6 0 0 1 0-3.84V7.4H3.1a10 10 0 0 0 0 9.24l3.46-2.7z"
        />
        <path
          fill="#EA4335"
          d="M12 6.04c1.47 0 2.78.5 3.82 1.5l2.85-2.85A10 10 0 0 0 3.1 7.4l3.46 2.7C7.33 7.78 9.47 6.04 12 6.04z"
        />
      </svg>
    ),
  },
  {
    name: "Яндекс",
    status: "Не привязан",
    linked: false,
    iconClassName: "bg-[#fc3f1d]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.2 4.3h-1.9c-1.9 0-3.6 1.4-3.6 4 0 2.3 1 3.4 2.7 4.6l-2.9 6.8h2.3l3-7.4v7.4h2V4.3zm0 7.1h-.9c-1 0-2-.7-2-2.8 0-2.1.9-2.7 1.9-2.7h1v5.5z" />
      </svg>
    ),
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

  function handleSocialAction(profileName: string, linked: boolean) {
    toast.info(linked ? "Отвязка профиля пока недоступна" : "Привязка скоро появится", {
      description: `${profileName}: авторизация через сервис будет подключена вместе с личным кабинетом.`,
    });
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

          <Reveal
            delay={80}
            className="relative overflow-hidden rounded-[20px] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-12"
          >
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] lg:block">
              <img
                src="/personal/explain-glasses.webp"
                alt=""
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
              <span className="absolute inset-0 bg-gradient-to-r from-card via-card/65 to-transparent" />
              <span className="absolute inset-0 bg-gradient-to-b from-card via-transparent to-card" />
            </div>

            <div className="relative z-10 max-w-[640px]">
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Вы можете связать свой профиль с профилями в социальных сетях и сервисах
              </p>
              <h2 className="mt-2.5 font-serif text-2xl font-semibold leading-tight text-foreground sm:text-[32px]">
                Ваши связанные профили:
              </h2>

              <div className="mt-7 flex flex-col gap-3">
                {socialProfiles.map((social) => (
                  <div
                    key={social.name}
                    className={cn(
                      "flex items-center gap-3 rounded-[14px] border p-3.5 transition-colors sm:gap-4 sm:px-[18px]",
                      social.linked
                        ? "border-success/25 bg-success/[0.06]"
                        : "border-border bg-surface hover:border-brand/30",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center rounded-[11px] text-white [&_svg]:h-[22px] [&_svg]:w-[22px]",
                        social.iconClassName,
                      )}
                    >
                      {social.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-[15px] font-semibold leading-tight text-foreground">
                        {social.name}
                      </strong>
                      <span
                        className={cn(
                          "mt-1 block text-[13px]",
                          social.linked ? "font-medium text-success" : "text-muted-foreground",
                        )}
                      >
                        {social.status}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSocialAction(social.name, social.linked)}
                      className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-border bg-card px-3.5 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-brand hover:text-brand sm:px-[18px]"
                    >
                      {social.linked ? (
                        <Link2 className="hidden h-3.5 w-3.5 sm:block" strokeWidth={2.2} />
                      ) : (
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                      )}
                      {social.linked ? "Отвязать" : "Привязать"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
