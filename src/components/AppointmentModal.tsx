import { useEffect, useState, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SALONS as salons, type VerifiedSalon } from "@/data/contact";
import { cn } from "@/lib/utils";
import {
  getAppointmentSlots,
  submitAppointment,
  type AppointmentSlot,
} from "@/lib/api/bitrix";
import { Check, ChevronDown, MapPin, ArrowRight, ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { toast } from "sonner";

type AgeType = "adult" | "child";
type ServiceType = "glasses" | "contacts";
type Direction = "forward" | "back";

const STEPS = [
  { label: "Филиал и возраст", img: "/services1_online_appointment_doctor.webp" },
  { label: "Услуга и время", img: "/services3_selection_of_glasses.webp" },
  { label: "Ваши данные", img: "/services2_vision_diagnostics.webp" },
];

const SERVICES: { id: ServiceType; label: string; sub: string }[] = [
  { id: "glasses", label: "Подбор очков", sub: "подтверждаем через ANZ" },
  { id: "contacts", label: "Подбор МКЛ", sub: "подтверждаем через ANZ" },
];

const APPOINTMENT_CLINICS = [
  {
    id: "bardina",
    clinicUid: "04915758-e503-11ef-ba4a-a8a1599d2915",
    label: "Новокузнецк, пр-кт. Бардина, 42 (Дом Быта)",
  },
  {
    id: "zapsibovtsev",
    clinicUid: "4947eacd-e521-11ef-ba4a-a8a1599d2915",
    label: "Новокузнецк, пр-кт. Запсибовцев, 37 (ост. Роддом)",
  },
  {
    id: "shahterov",
    clinicUid: "fc3512dd-e521-11ef-ba4a-a8a1599d2915",
    label: "Новокузнецк, пр-кт. Шахтеров, 12",
  },
  {
    id: "toreza",
    clinicUid: "cd94ba16-e51a-11ef-ba4a-a8a1599d2915",
    label: "Новокузнецк, ул. Тореза, 32 (ост. Рынок)",
  },
  {
    id: "kirochnaya",
    clinicUid: "f5b3c5f1-6529-11ef-9f2f-2cf05d761a4a",
    label: "Санкт-Петербург, ул. Кирочная, 17 (м. Чернышевского)",
  },
] as const;

type AppointmentSalon = VerifiedSalon & {
  appointmentLabel: string;
  clinicUid: string;
};

const APPOINTMENT_SALONS: AppointmentSalon[] = APPOINTMENT_CLINICS.map((clinic) => {
  const salon = salons.find((item) => item.id === clinic.id);
  if (!salon) {
    throw new Error(`Appointment salon not found: ${clinic.id}`);
  }

  return {
    ...salon,
    appointmentLabel: clinic.label,
    clinicUid: clinic.clinicUid,
  };
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AppointmentModal({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<Direction>("forward");

  const [salonId, setSalonId] = useState(APPOINTMENT_SALONS[0].id);
  const [ageType, setAgeType] = useState<AgeType>("adult");
  const [salonOpen, setSalonOpen] = useState(false);

  const [service, setService] = useState<ServiceType>("glasses");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedSalon = APPOINTMENT_SALONS.find((item) => item.id === salonId) ?? APPOINTMENT_SALONS[0];
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? null;
  const groupedSlots = groupSlotsByDay(slots);
  const birthDateMax = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    setSelectedSlotId("");
  }, [salonId, ageType, service]);

  useEffect(() => {
    if (!open || step !== 2) {
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError("");
    setSlots([]);

    getAppointmentSlots({
      clinicUid: selectedSalon.clinicUid,
      ageType,
      serviceCode: service,
    })
      .then((nextSlots) => {
        if (cancelled) return;
        setSlots(nextSlots);
      })
      .catch(() => {
        if (cancelled) return;
        setSlotsError("Не удалось загрузить свободное время. Попробуйте ещё раз или позвоните в салон.");
      })
      .finally(() => {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ageType, open, selectedSalon.clinicUid, service, step]);

  function reset() {
    setStep(1);
    setDirection("forward");
    setSalonId(APPOINTMENT_SALONS[0].id);
    setAgeType("adult");
    setSalonOpen(false);
    setService("glasses");
    setSlotsLoading(false);
    setSlotsError("");
    setSlots([]);
    setSelectedSlotId("");
    setLastName("");
    setFirstName("");
    setPatronymic("");
    setBirthDate("");
    setPhone("");
    setComment("");
    setSent(false);
    setSubmitting(false);
  }

  function handleClose(o: boolean) {
    onOpenChange(o);
    if (!o) setTimeout(reset, 350);
  }

  function go(next: number) {
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!selectedSlot) {
      toast.error("Выберите свободное время на предыдущем шаге.");
      go(2);
      return;
    }

    const normalizedPhone = normalizeRussianPhone(phone);
    if (!normalizedPhone) {
      toast.error("Введите телефон в формате +7 (___) ___-__-__.");
      return;
    }

    setSubmitting(true);
    try {
      await submitAppointment({
        name: firstName.trim(),
        lastName: lastName.trim(),
        patronymic: patronymic.trim(),
        phone: normalizedPhone,
        dob: birthDate || undefined,
        salon: selectedSalon.appointmentLabel,
        service: selectedSlot.serviceName,
        comment: comment.trim() || undefined,
        clinicUid: selectedSlot.clinicUid,
        specialty: selectedSlot.specialty,
        specialtyUid: selectedSlot.specialtyUid,
        serviceUid: selectedSlot.serviceUid,
        serviceDuration: selectedSlot.serviceDuration,
        doctorName: selectedSlot.doctorName,
        refUid: selectedSlot.refUid,
        orderDate: selectedSlot.orderDate,
        timeBegin: selectedSlot.timeBegin,
        timeEnd: selectedSlot.timeEnd,
      });
      setSent(true);
      setTimeout(() => handleClose(false), 2800);
    } catch (err) {
      toast.error("Не удалось оформить запись. Попробуйте ещё раз или позвоните нам напрямую.");
    } finally {
      setSubmitting(false);
    }
  }

  const slideIn =
    direction === "forward"
      ? "animate-in fade-in-0 slide-in-from-right-4 duration-400"
      : "animate-in fade-in-0 slide-in-from-left-4 duration-400";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="p-0 gap-0 overflow-hidden border-0 rounded-[2rem] shadow-xl bg-background"
        style={{ maxWidth: "920px", width: "calc(100vw - 32px)" }}
      >
        <DialogTitle className="sr-only">Онлайн-запись к врачу</DialogTitle>

        <div className="flex flex-col md:flex-row min-h-[620px]">
          <div className="relative hidden md:flex flex-col justify-between overflow-hidden w-[320px] min-w-[320px] p-8 bg-ink">
            {STEPS.map((item, index) => (
              <img
                key={item.img}
                src={item.img}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[700ms] ease-[var(--ease-editorial)]"
                style={{ opacity: step === index + 1 ? 0.55 : 0 }}
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
                Выберите филиал, услугу и свободное время из расписания ANZ.
              </p>
            </div>

            <div className="relative space-y-7">
              {STEPS.map((item, index) => {
                const idx = index + 1;
                const done = step > idx;
                const active = step === idx;
                return (
                  <div key={item.label} className="flex items-center gap-4">
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
                        {item.label}
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

          <div className="flex-1 flex flex-col bg-cream min-w-0 relative">
            <div className="md:hidden px-6 pt-6 pb-2">
              <div className="text-[10px] uppercase tracking-[0.18em] text-foreground/45 font-semibold">
                Шаг {step} из {STEPS.length}
              </div>
              <div className="font-serif text-lg mt-1">{STEPS[step - 1].label}</div>
            </div>

            <div className="flex-1 overflow-hidden">
              {step === 1 && (
                <div key="step-1" className={cn("h-full px-6 py-8 md:p-10 flex flex-col", slideIn)}>
                  <div className="flex-1 flex flex-col justify-center gap-10 max-w-[440px] w-full mx-auto">
                    <div className="space-y-3">
                      <FieldLabel>Выберите филиал</FieldLabel>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setSalonOpen((value) => !value)}
                          className="w-full bg-background border border-border rounded-xl pl-11 pr-10 py-4 text-left shadow-xs hover:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15 focus:border-brand transition-all"
                        >
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand" />
                          <span className="block text-[14px] text-foreground truncate">
                            {selectedSalon.appointmentLabel}
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
                            {APPOINTMENT_SALONS.map((salon) => (
                              <button
                                key={salon.id}
                                type="button"
                                onClick={() => {
                                  setSalonId(salon.id);
                                  setSalonOpen(false);
                                }}
                                className={cn(
                                  "w-full text-left text-sm px-4 py-3 transition-colors hover:bg-muted flex items-center justify-between gap-3",
                                  salon.id === salonId && "bg-muted",
                                )}
                              >
                                <span className="min-w-0 truncate">{salon.appointmentLabel}</span>
                                {salon.id === salonId && <Check className="h-3.5 w-3.5 text-brand shrink-0" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 px-1 text-[11px] text-foreground/55">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        <span>
                          {selectedSalon.metro ? <>м.&nbsp;{selectedSalon.metro}</> : selectedSalon.cityLabel}
                          {" · "}Сегодня до&nbsp;{selectedSalon.closesAt}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <FieldLabel>Тип записи</FieldLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {(["adult", "child"] as AgeType[]).map((value) => (
                          <ChoiceCard
                            key={value}
                            selected={ageType === value}
                            onClick={() => setAgeType(value)}
                            eyebrow={value === "adult" ? "Для себя" : "С ребёнком"}
                            title={value === "adult" ? "Взрослый (18+)" : "Детский (0–17)"}
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

              {step === 2 && (
                <div key="step-2" className={cn("h-full px-6 py-8 md:p-10 flex flex-col", slideIn)}>
                  <div className="flex-1 flex flex-col gap-6 max-w-[560px] w-full mx-auto">
                    <div className="space-y-3">
                      <FieldLabel>Выберите услугу</FieldLabel>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SERVICES.map((item) => (
                          <ChoiceCard
                            key={item.id}
                            selected={service === item.id}
                            onClick={() => setService(item.id)}
                            eyebrow={item.sub}
                            title={item.label}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <FieldLabel>Свободное время</FieldLabel>
                        <span className="text-[11px] text-foreground/45">Слоты загружаются из ANZ</span>
                      </div>

                      {slotsLoading && (
                        <div className="rounded-2xl border border-border bg-background p-5 text-sm text-foreground/60">
                          Загружаем доступное время...
                        </div>
                      )}

                      {!slotsLoading && slotsError && (
                        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
                          {slotsError}
                        </div>
                      )}

                      {!slotsLoading && !slotsError && slots.length === 0 && (
                        <div className="rounded-2xl border border-border bg-background p-5 text-sm text-foreground/60">
                          Для выбранного филиала и типа записи пока нет свободных слотов. Попробуйте другой филиал или позвоните нам.
                        </div>
                      )}

                      {!slotsLoading && !slotsError && slots.length > 0 && (
                        <div className="space-y-4">
                          {groupedSlots.map((group) => (
                            <div key={group.dateKey} className="rounded-[1.5rem] border border-border bg-background p-4">
                              <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground/65 mb-3">
                                <CalendarDays className="h-4 w-4 text-brand" />
                                <span>{group.label}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {group.slots.map((slot) => {
                                  const selected = slot.id === selectedSlotId;
                                  return (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      onClick={() => setSelectedSlotId(slot.id)}
                                      className={cn(
                                        "rounded-2xl border px-4 py-3 text-left transition-all",
                                        selected
                                          ? "border-brand bg-brand/8 shadow-sm"
                                          : "border-border hover:border-brand/35 hover:bg-muted/50",
                                      )}
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
                                          <Clock3 className="h-4 w-4 text-brand" />
                                          <span>{formatSlotTime(slot.timeBegin)}</span>
                                        </div>
                                        {selected && <Check className="h-4 w-4 text-brand shrink-0" />}
                                      </div>
                                      <div className="mt-1 text-[12px] text-foreground/55">{slot.doctorName}</div>
                                      <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-foreground/35">
                                        {slot.servicePrice !== null ? formatPrice(slot.servicePrice) : "Запись"}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Footer>
                    <SecondaryButton onClick={() => go(1)}>
                      <ArrowLeft className="h-4 w-4" /> Назад
                    </SecondaryButton>
                    <PrimaryButton onClick={() => go(3)} disabled={!selectedSlot || slotsLoading}>
                      Продолжить
                    </PrimaryButton>
                  </Footer>
                </div>
              )}

              {step === 3 && (
                <div key="step-3" className={cn("h-full px-6 py-8 md:p-10 flex flex-col", slideIn)}>
                  {sent ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4">
                      <div className="h-16 w-16 rounded-full bg-brand/10 border-2 border-brand/30 grid place-items-center">
                        <Check className="h-7 w-7 text-brand" />
                      </div>
                      <h3 className="font-serif text-2xl">Запись оформлена</h3>
                      <p className="text-[13px] text-foreground/55 leading-relaxed max-w-[320px]">
                        {selectedSlot
                          ? `Слот ${formatSlotDay(selectedSlot.timeBegin)} в ${formatSlotTime(selectedSlot.timeBegin)} сохранён в системе.`
                          : "Мы сохранили вашу запись в системе."}
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="flex-1 flex flex-col gap-4 max-w-[500px] w-full mx-auto"
                    >
                      {selectedSlot && (
                        <div className="rounded-[1.5rem] border border-border bg-background px-4 py-4 text-sm text-foreground/70">
                          <div className="font-semibold text-foreground">{selectedSalon.appointmentLabel}</div>
                          <div className="mt-1">{selectedSlot.serviceName}</div>
                          <div className="mt-2 text-[12px] text-foreground/55">
                            {formatSlotDay(selectedSlot.timeBegin)} · {formatSlotTime(selectedSlot.timeBegin)} · {selectedSlot.doctorName}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InlineField id="ap-ln" label="Фамилия *" placeholder="Иванов" value={lastName} onChange={setLastName} required autoComplete="family-name" />
                        <InlineField id="ap-fn" label="Имя *" placeholder="Иван" value={firstName} onChange={setFirstName} required autoComplete="given-name" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InlineField id="ap-pn" label="Отчество *" placeholder="Иванович" value={patronymic} onChange={setPatronymic} required autoComplete="additional-name" />
                        <InlineField
                          id="ap-bd"
                          label="Дата рождения"
                          placeholder="Выберите дату"
                          value={birthDate}
                          onChange={setBirthDate}
                          type="date"
                          max={birthDateMax}
                        />
                      </div>
                      <InlineField
                        id="ap-ph"
                        label="Телефон *"
                        placeholder="+7 (___) ___-__-__"
                        value={phone}
                        onChange={(value) => setPhone(formatRussianPhone(value))}
                        required
                        type="tel"
                        inputMode="tel"
                        maxLength={18}
                        autoComplete="tel"
                      />
                      <div>
                        <FieldLabel htmlFor="ap-cm">Комментарий</FieldLabel>
                        <textarea
                          id="ap-cm"
                          placeholder="Например: удобнее после 18:00"
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
                        <PrimaryButton type="submit" disabled={submitting}>
                          {submitting ? "Оформляем запись..." : "Записаться"}
                        </PrimaryButton>
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

function groupSlotsByDay(slots: AppointmentSlot[]) {
  const groups = new Map<string, AppointmentSlot[]>();
  for (const slot of slots) {
    const dateKey = slot.orderDate.slice(0, 10);
    const existing = groups.get(dateKey) ?? [];
    existing.push(slot);
    groups.set(dateKey, existing);
  }

  return Array.from(groups.entries()).map(([dateKey, daySlots]) => ({
    dateKey,
    label: formatSlotDay(daySlots[0].timeBegin),
    slots: daySlots,
  }));
}

function normalizeRussianPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+7${digits}`;
  }
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }
  return null;
}

function formatRussianPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  let normalized = digits;
  if (normalized.length === 1 && normalized !== "7" && normalized !== "8") {
    normalized = `7${normalized}`;
  } else if (normalized.startsWith("8")) {
    normalized = `7${normalized.slice(1)}`;
  } else if (!normalized.startsWith("7")) {
    normalized = `7${normalized}`;
  }

  normalized = normalized.slice(0, 11);
  const local = normalized.slice(1);
  const parts = [
    local.slice(0, 3),
    local.slice(3, 6),
    local.slice(6, 8),
    local.slice(8, 10),
  ];

  let formatted = "+7";
  if (parts[0]) formatted += ` (${parts[0]}`;
  if (parts[0]?.length === 3) formatted += ")";
  if (parts[1]) formatted += ` ${parts[1]}`;
  if (parts[2]) formatted += `-${parts[2]}`;
  if (parts[3]) formatted += `-${parts[3]}`;
  return formatted;
}

function formatSlotDay(isoDate: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(isoDate));
}

function formatSlotTime(isoDate: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function formatPrice(value: number): string {
  if (value <= 0) return "Бесплатно";
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function FieldLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
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
  inputMode,
  maxLength,
  max,
  autoComplete,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  max?: string;
  autoComplete?: string;
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
        inputMode={inputMode}
        maxLength={maxLength}
        max={max}
        autoComplete={autoComplete}
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

function Footer({ children }: { children: ReactNode }) {
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
  children: ReactNode;
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
  children: ReactNode;
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
