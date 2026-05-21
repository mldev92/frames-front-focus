import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { salons } from "@/data/salons";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, MapPin, ArrowRight, ArrowLeft } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AgeType = "adult" | "child";
type ServiceType = "glasses" | "contacts";
type Direction = "forward" | "back";

// ─── Step meta ────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Филиал и возраст", img: "/services1_online_appointment_doctor.png" },
  { label: "Услуга и время", img: "/services3_selection_of_glasses.png" },
  { label: "Ваши данные", img: "/services2_vision_diagnostics.png" },
];

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES: { id: ServiceType; label: string; sub: string }[] = [
  { id: "glasses", label: "Подбор очков", sub: "бесплатно при заказе" },
  { id: "contacts", label: "Подбор МКЛ", sub: "1 500 ₽" },
];

// ─── Time slots (static mock) ─────────────────────────────────────────────────
const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const SLOT_TEMPLATES = [
  ["10:00", "10:20", "10:40", "11:00", "11:20"],
  ["10:00", "13:50", "14:00", "14:20", "14:40"],
  ["10:00", "10:20", "10:40", "11:00", "11:20"],
  ["10:50", "11:00", "11:20", "11:40", "12:00"],
];

function buildDays() {
  const today = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      day: DAY_NAMES[d.getDay()],
      date: `${d.getDate()}.${d.getMonth() + 1}`,
      slots: SLOT_TEMPLATES[i % SLOT_TEMPLATES.length],
    };
  });
}

const DAYS = buildDays();

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AppointmentModal({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction>("forward");

  // Step 1
  const [salonId, setSalonId] = useState(salons[0].id);
  const [ageType, setAgeType] = useState<AgeType>("adult");
  const [salonOpen, setSalonOpen] = useState(false);

  // Step 2
  const [service, setService] = useState<ServiceType>("glasses");
  const [slot, setSlot] = useState<{ date: string; time: string } | null>(null);

  // Step 3
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);

  function reset() {
    setStep(1);
    setDirection("forward");
    setSalonId(salons[0].id);
    setAgeType("adult");
    setSalonOpen(false);
    setService("glasses");
    setSlot(null);
    setLastName("");
    setFirstName("");
    setPatronymic("");
    setBirthDate("");
    setPhone("");
    setComment("");
    setSent(false);
  }

  function handleClose(o: boolean) {
    onOpenChange(o);
    if (!o) setTimeout(reset, 350);
  }

  function go(next: number) {
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => handleClose(false), 2800);
  }

  const selectedSalon = salons.find((s) => s.id === salonId)!;
  const slideIn =
    direction === "forward"
      ? "animate-in fade-in-0 slide-in-from-right-4 duration-400"
      : "animate-in fade-in-0 slide-in-from-left-4 duration-400";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden border-0 rounded-[2rem] shadow-xl bg-background"
        style={{ maxWidth: "820px", width: "calc(100vw - 32px)" }}
      >
        <DialogTitle className="sr-only">Онлайн-запись к врачу</DialogTitle>

        <div className="flex flex-col md:flex-row min-h-[580px]">
          {/* ── Left panel ─────────────────────────────────────── */}
          <div className="relative hidden md:flex flex-col justify-between overflow-hidden w-[320px] min-w-[320px] p-8 bg-ink">
            {/* Stacked cross-fading images */}
            {STEPS.map((s, i) => (
              <img
                key={s.img}
                src={s.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[700ms] ease-[var(--ease-editorial)]"
                style={{ opacity: step === i + 1 ? 0.55 : 0 }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-black/35 backdrop-blur-[1px]" />

            <div className="relative">
              <div className="text-brand uppercase tracking-[0.25em] text-[10px] font-semibold mb-3">
                Онлайн-запись
              </div>
              <h2 className="font-serif text-3xl leading-tight text-white">
                Запись к&nbsp;врачу
              </h2>
              <p className="mt-3 text-[12px] text-white/55 leading-relaxed max-w-[220px]">
                Подберём удобное время в&nbsp;ближайшем салоне.
              </p>
            </div>

            <div className="relative space-y-7">
              {STEPS.map((s, i) => {
                const idx = i + 1;
                const done = step > idx;
                const active = step === idx;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-300",
                        active &&
                          "border-brand bg-brand text-white shadow-[0_0_20px_oklch(0.55_0.18_28/0.45)]",
                        done && "border-white bg-white text-ink",
                        !active && !done && "border-white/25 bg-transparent text-white/40",
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : idx}
                    </div>
                    <div className={cn("flex flex-col transition-opacity duration-300", !active && !done && "opacity-40")}>
                      <span className="text-[13px] font-medium text-white leading-tight">
                        {s.label}
                      </span>
                      <span className="text-[9px] uppercase tracking-[0.18em] text-white/45 mt-0.5">
                        Шаг 0{idx}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right panel ────────────────────────────────────── */}
          <div className="flex-1 flex flex-col bg-cream min-w-0 relative">
            {/* Mobile mini-stepper */}
            <div className="md:hidden px-6 pt-6 pb-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/45 font-semibold">
                Шаг {step} из {STEPS.length}
              </div>
              <div className="font-serif text-lg mt-1">{STEPS[step - 1].label}</div>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* ══ STEP 1 ══════════════════════════════════════ */}
              {step === 1 && (
                <div key="step-1" className={cn("h-full px-6 py-8 md:p-10 flex flex-col", slideIn)}>
                  <div className="flex-1 flex flex-col justify-center gap-10 max-w-[400px] w-full mx-auto">
                    {/* Salon */}
                    <div className="space-y-3">
                      <FieldLabel>Выберите филиал</FieldLabel>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setSalonOpen((v) => !v)}
                          className="w-full bg-background border border-border rounded-xl pl-11 pr-10 py-4 text-left shadow-xs hover:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all"
                        >
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand" />
                          <span className="block text-[14px] text-foreground truncate">
                            {selectedSalon.address}
                          </span>
                          <ChevronDown
                            className={cn(
                              "absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30 transition-transform duration-200",
                              salonOpen && "rotate-180",
                            )}
                          />
                        </button>
                        {salonOpen && (
                          <div className="absolute left-0 right-0 top-full mt-2 bg-background border border-border rounded-xl shadow-lg z-30 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                            {salons.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSalonId(s.id);
                                  setSalonOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left text-sm px-4 py-3 transition-colors hover:bg-muted flex items-center justify-between gap-3",
                                  s.id === salonId && "bg-muted",
                                )}
                              >
                                <span className="truncate">
                                  {s.address}
                                  <span className="text-foreground/40 text-[11px] ml-2">
                                    м.&nbsp;{s.metro}
                                  </span>
                                </span>
                                {s.id === salonId && <Check className="h-3.5 w-3.5 text-brand shrink-0" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 px-1 text-[11px] text-foreground/55">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        <span>м.&nbsp;{selectedSalon.metro} · Сегодня до&nbsp;21:00</span>
                      </div>
                    </div>

                    {/* Age */}
                    <div className="space-y-3">
                      <FieldLabel>Тип записи</FieldLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {(["adult", "child"] as AgeType[]).map((t) => (
                          <ChoiceCard
                            key={t}
                            selected={ageType === t}
                            onClick={() => setAgeType(t)}
                            eyebrow={t === "adult" ? "Для себя" : "С ребёнком"}
                            title={t === "adult" ? "Взрослый (18+)" : "Детский (0–17)"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Footer>
                    <PrimaryButton onClick={() => go(2)}>Продолжить</PrimaryButton>
                  </Footer>
                </div>
              )}

              {/* ══ STEP 2 ══════════════════════════════════════ */}
              {step === 2 && (
                <div key="step-2" className={cn("h-full px-6 py-8 md:p-10 flex flex-col", slideIn)}>
                  <div className="flex-1 flex flex-col gap-6 max-w-[440px] w-full mx-auto">
                    {/* Service */}
                    <div className="space-y-3">
                      <FieldLabel>Выберите услугу</FieldLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {SERVICES.map((sv) => (
                          <ChoiceCard
                            key={sv.id}
                            selected={service === sv.id}
                            onClick={() => setService(sv.id)}
                            eyebrow={sv.sub}
                            title={sv.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Time grid */}
                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                      <FieldLabel>Выберите время</FieldLabel>
                      <div className="flex-1 overflow-y-auto rounded-2xl border border-border bg-background p-3">
                        <div className="grid grid-cols-4 gap-2">
                          {DAYS.map((d) => (
                            <div key={d.key} className="min-w-0">
                              <div className="text-center pb-2 mb-2 border-b border-border/70">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                                  {d.day}
                                </div>
                                <div className="text-[10px] text-foreground/40 mt-0.5">{d.date}</div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                {d.slots.map((t) => {
                                  const active = slot?.date === d.key && slot.time === t;
                                  return (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => setSlot({ date: d.key, time: t })}
                                      className={cn(
                                        "text-[11px] font-medium rounded-lg py-1.5 border transition-all",
                                        active
                                          ? "bg-ink text-primary-foreground border-ink shadow-sm"
                                          : "border-border bg-background hover:border-brand hover:text-brand",
                                      )}
                                    >
                                      {t}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Footer>
                    <SecondaryButton onClick={() => go(1)}>
                      <ArrowLeft className="h-4 w-4" /> Назад
                    </SecondaryButton>
                    <PrimaryButton onClick={() => slot && go(3)} disabled={!slot}>
                      Продолжить
                    </PrimaryButton>
                  </Footer>
                </div>
              )}

              {/* ══ STEP 3 ══════════════════════════════════════ */}
              {step === 3 && (
                <div key="step-3" className={cn("h-full px-6 py-8 md:p-10 flex flex-col", slideIn)}>
                  {sent ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
                      <div className="h-16 w-16 rounded-full bg-brand/10 border-2 border-brand/30 grid place-items-center">
                        <Check className="h-7 w-7 text-brand" />
                      </div>
                      <h3 className="font-serif text-2xl">Запись принята!</h3>
                      <p className="text-[13px] text-foreground/55 leading-relaxed max-w-[280px]">
                        Мы свяжемся с&nbsp;вами в&nbsp;течение часа для подтверждения времени.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="flex-1 flex flex-col gap-4 max-w-[440px] w-full mx-auto"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <InlineField id="ap-ln" label="Фамилия *" placeholder="Иванов" value={lastName} onChange={setLastName} required />
                        <InlineField id="ap-fn" label="Имя *" placeholder="Иван" value={firstName} onChange={setFirstName} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <InlineField id="ap-pn" label="Отчество *" placeholder="Иванович" value={patronymic} onChange={setPatronymic} required />
                        <InlineField id="ap-bd" label="Дата рождения" placeholder="ДД.ММ.ГГГГ" value={birthDate} onChange={setBirthDate} />
                      </div>
                      <InlineField id="ap-ph" label="Телефон *" placeholder="+7 (___) ___-__-__" value={phone} onChange={setPhone} required type="tel" />
                      <div>
                        <FieldLabel htmlFor="ap-cm">Комментарий</FieldLabel>
                        <textarea
                          id="ap-cm"
                          placeholder="Фамилия врача или другая информация"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={2}
                          className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs"
                        />
                      </div>

                      <Footer>
                        <SecondaryButton onClick={() => go(2)}>
                          <ArrowLeft className="h-4 w-4" /> Назад
                        </SecondaryButton>
                        <PrimaryButton type="submit">Записаться</PrimaryButton>
                      </Footer>

                      <p className="text-[10.5px] text-foreground/40 leading-relaxed text-center -mt-1">
                        Отправляя данные, вы соглашаетесь с{" "}
                        <a href="/politika-konfidentsialnosti" className="underline hover:text-foreground transition-colors">
                          политикой конфиденциальности
                        </a>
                        .
                      </p>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/45 mb-2"
    >
      {children}
    </label>
  );
}

function InlineField({
  id,
  label,
  placeholder,
  value,
  onChange,
  required,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-background border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all shadow-xs"
      />
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  eyebrow,
  title,
}: {
  selected: boolean;
  onClick: () => void;
  eyebrow: string;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative text-left p-5 rounded-[1.25rem] transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5",
        selected
          ? "bg-ink text-primary-foreground shadow-md"
          : "bg-background border border-border hover:border-brand/30 hover:shadow-sm",
      )}
    >
      <div
        className={cn(
          "text-[10px] uppercase tracking-[0.18em] font-semibold mb-1.5",
          selected ? "text-white/55" : "text-foreground/45",
        )}
      >
        {eyebrow}
      </div>
      <div className={cn("text-[14px] font-medium leading-snug", selected ? "text-white" : "text-foreground")}>
        {title}
      </div>
      {selected && (
        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand grid place-items-center">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  const count = Array.isArray(children) ? children.length : 1;
  return (
    <div
      className="mt-8 grid gap-3"
      style={{ gridTemplateColumns: count === 1 ? "1fr" : "auto 1fr" }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group w-full inline-flex items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-semibold transition-all duration-300",
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-brand text-brand-foreground hover:-translate-y-0.5 shadow-[0_12px_32px_-10px_oklch(0.55_0.18_28/0.5)] hover:shadow-[0_16px_36px_-10px_oklch(0.55_0.18_28/0.55)]",
      )}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 py-4 text-[13px] font-medium text-foreground/70 hover:text-foreground hover:border-foreground/40 transition-colors"
    >
      {children}
    </button>
  );
}