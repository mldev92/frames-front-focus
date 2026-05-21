import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { salons } from "@/data/salons";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, MapPin } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type AgeType = "adult" | "child";
type ServiceType = "glasses" | "contacts";

// ─── Step meta ────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Филиал и возраст",  img: "/services1_online_appointment_doctor.png" },
  { label: "Услуга и время",    img: "/services3_selection_of_glasses.png" },
  { label: "Ваши данные",       img: "/services2_vision_diagnostics.png" },
];

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES: { id: ServiceType; label: string; sub: string }[] = [
  { id: "glasses",  label: "Подбор очков",  sub: "бесплатно при заказе" },
  { id: "contacts", label: "Подбор МКЛ",    sub: "1 500 ₽" },
];

// ─── Time slots (static mock — replace with API) ──────────────────────────────
const DAY_NAMES = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const SLOT_TEMPLATES = [
  ["10:00","10:10","10:20","10:30","10:40","11:00","11:10"],
  ["10:00","10:10","10:20","13:50","14:00","14:10","14:20"],
  ["10:00","10:10","10:20","10:30","10:40","11:00","11:10","11:20"],
  ["10:50","11:00","11:10","11:20","11:30","12:00","12:10"],
];

function buildDays() {
  const today = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      day: DAY_NAMES[d.getDay()],
      date: `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`,
      slots: SLOT_TEMPLATES[i % SLOT_TEMPLATES.length],
    };
  });
}

const DAYS = buildDays();

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AppointmentModal({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(1);

  // Step 1
  const [salonId, setSalonId] = useState(salons[0].id);
  const [ageType, setAgeType] = useState<AgeType>("adult");
  const [salonOpen, setSalonOpen] = useState(false);

  // Step 2
  const [service, setService] = useState<ServiceType>("glasses");
  const [slot, setSlot] = useState<{ date: string; time: string } | null>(null);

  // Step 3
  const [lastName,   setLastName]   = useState("");
  const [firstName,  setFirstName]  = useState("");
  const [patronymic, setPatronymic] = useState("");
  const [birthDate,  setBirthDate]  = useState("");
  const [phone,      setPhone]      = useState("");
  const [comment,    setComment]    = useState("");
  const [sent, setSent] = useState(false);

  function reset() {
    setStep(1); setSalonId(salons[0].id); setAgeType("adult");
    setSalonOpen(false); setService("glasses"); setSlot(null);
    setLastName(""); setFirstName(""); setPatronymic("");
    setBirthDate(""); setPhone(""); setComment(""); setSent(false);
  }

  function handleClose(o: boolean) {
    onOpenChange(o);
    if (!o) setTimeout(reset, 350);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => handleClose(false), 2800);
  }

  const meta         = STEPS[step - 1];
  const selectedSalon = salons.find((s) => s.id === salonId)!;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden gap-0 rounded-2xl border-0 shadow-2xl"
        style={{ maxWidth: "780px", width: "calc(100vw - 32px)" }}>

        {/* Visually-hidden title for a11y */}
        <DialogTitle className="sr-only">Онлайн-запись к врачу</DialogTitle>

        <div style={{ display: "flex", height: "520px" }}>

          {/* ── Left panel ─────────────────────────────────────── */}
          <div className="hidden md:flex flex-col justify-between"
            style={{ width: "248px", minWidth: "248px", position: "relative", overflow: "hidden" }}>

            {/* bg image — transitions when step changes */}
            {STEPS.map((s, i) => (
              <img key={s.img} src={s.img} alt=""
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%", objectFit: "cover",
                  opacity: step === i + 1 ? 1 : 0,
                  transition: "opacity 0.55s ease",
                }}
              />
            ))}
            {/* dark overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)" }} />

            {/* Top text */}
            <div style={{ position: "relative", padding: "28px 24px 0" }}>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "10px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "10px" }}>
                Онлайн-запись
              </div>
              <div style={{ color: "white", fontFamily: "serif", fontSize: "22px", lineHeight: 1.2, fontWeight: 400 }}>
                Запись к врачу
              </div>
            </div>

            {/* Step list */}
            <div style={{ position: "relative", padding: "0 24px 32px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {STEPS.map((s, i) => {
                const done    = step > i + 1;
                const active  = step === i + 1;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* circle */}
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      border: "2px solid",
                      borderColor: active || done ? "white" : "rgba(255,255,255,0.25)",
                      background: done ? "white" : (active ? "white" : "transparent"),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.3s ease",
                    }}>
                      {done
                        ? <Check style={{ width: "12px", height: "12px", color: "#111" }} />
                        : <span style={{ fontSize: "11px", fontWeight: 600, color: active ? "#111" : "rgba(255,255,255,0.35)" }}>{i + 1}</span>
                      }
                    </div>
                    <span style={{ fontSize: "12px", color: active ? "white" : "rgba(255,255,255,0.38)", transition: "color 0.3s ease", lineHeight: 1.3 }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right panel ────────────────────────────────────── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--background)" }}>

            {/* Mobile step header */}
            <div className="md:hidden" style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#999", marginBottom: "4px" }}>
                Шаг {step} из {STEPS.length}
              </div>
              <div style={{ fontFamily: "serif", fontSize: "18px" }}>{meta.label}</div>
            </div>

            {/* Slider */}
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{
                display: "flex",
                width: "300%",
                height: "100%",
                transform: `translateX(-${(step - 1) * 33.3333}%)`,
                transition: "transform 0.42s cubic-bezier(0.4,0,0.2,1)",
              }}>

                {/* ══ STEP 1 ══════════════════════════════════════ */}
                <div style={{ width: "33.3333%", padding: "28px 28px 24px", display: "flex", flexDirection: "column", gap: "22px", overflowY: "auto" }}>

                  {/* Salon selector */}
                  <div>
                    <FieldLabel>Выберите филиал</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <button type="button"
                        onClick={() => setSalonOpen(v => !v)}
                        className="w-full border border-border rounded-xl text-sm hover:border-foreground/40 transition-colors text-left"
                        style={{ padding: "10px 36px 10px 12px", display: "flex", alignItems: "center", gap: "8px" }}
                      >
                        <MapPin style={{ width: "13px", height: "13px", opacity: 0.4, flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {selectedSalon.address}
                          <span style={{ color: "#999", marginLeft: "6px", fontSize: "12px" }}>м. {selectedSalon.metro}</span>
                        </span>
                        <ChevronDown style={{
                          width: "13px", height: "13px", opacity: 0.45,
                          position: "absolute", right: "10px", top: "50%", transform: salonOpen ? "translateY(-50%) rotate(180deg)" : "translateY(-50%) rotate(0deg)",
                          transition: "transform 0.15s ease",
                        }} />
                      </button>
                      {salonOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                          {salons.map((s) => (
                            <button key={s.id} type="button"
                              onClick={() => { setSalonId(s.id); setSalonOpen(false); }}
                              className={cn("w-full text-left text-sm transition-colors hover:bg-muted", s.id === salonId && "bg-muted")}
                              style={{ padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                            >
                              <span>
                                {s.address}
                                <span style={{ color: "#999", marginLeft: "6px", fontSize: "11px" }}>м. {s.metro}</span>
                              </span>
                              {s.id === salonId && <Check style={{ width: "13px", height: "13px", opacity: 0.5 }} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Age type */}
                  <div>
                    <FieldLabel>Тип записи</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {(["adult", "child"] as AgeType[]).map((t) => (
                        <button key={t} type="button" onClick={() => setAgeType(t)}
                          className={cn(
                            "rounded-xl border text-sm py-3 transition-all font-medium",
                            ageType === t
                              ? "bg-ink text-primary-foreground border-ink"
                              : "border-border hover:border-foreground/40 bg-background"
                          )}
                        >
                          {t === "adult" ? "Взрослый (18+)" : "Детский (до 18)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    <button type="button" onClick={() => setStep(2)}
                      className="w-full bg-ink text-primary-foreground rounded-full py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Продолжить →
                    </button>
                  </div>
                </div>

                {/* ══ STEP 2 ══════════════════════════════════════ */}
                <div style={{ width: "33.3333%", padding: "24px 24px 20px", display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden" }}>

                  {/* Service */}
                  <div>
                    <FieldLabel>Выберите услугу</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      {SERVICES.map((sv) => (
                        <button key={sv.id} type="button" onClick={() => setService(sv.id)}
                          className={cn(
                            "rounded-xl border text-sm py-2.5 px-3 text-center transition-all leading-tight",
                            service === sv.id
                              ? "bg-ink text-primary-foreground border-ink"
                              : "border-border hover:border-foreground/40 bg-background"
                          )}
                        >
                          <div className="font-medium">{sv.label}</div>
                          <div style={{ fontSize: "11px", opacity: 0.6, marginTop: "2px" }}>{sv.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time grid */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <FieldLabel>Выберите время</FieldLabel>
                    <div style={{ flex: 1, overflowY: "auto", border: "1px solid var(--border)", borderRadius: "12px", padding: "10px 8px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "4px" }}>
                        {DAYS.map((d) => (
                          <div key={d.key}>
                            <div style={{ textAlign: "center", marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px solid var(--border)" }}>
                              <div style={{ fontSize: "10px", fontWeight: 700, color: "#888", textTransform: "uppercase" }}>{d.day}.</div>
                              <div style={{ fontSize: "10px", color: "#bbb" }}>{d.date}</div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                              {d.slots.map((t) => {
                                const active = slot?.date === d.key && slot.time === t;
                                return (
                                  <button key={t} type="button"
                                    onClick={() => setSlot({ date: d.key, time: t })}
                                    className={cn(
                                      "text-xs rounded-md py-1 transition-colors border w-full",
                                      active
                                        ? "bg-ink text-primary-foreground border-ink"
                                        : "border-border hover:border-brand hover:text-brand bg-background"
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

                  {/* Nav */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button type="button" onClick={() => setStep(1)}
                      className="border border-border rounded-full py-2.5 text-sm hover:border-foreground/50 transition-colors"
                    >← Назад</button>
                    <button type="button"
                      onClick={() => { if (slot) setStep(3); }}
                      className={cn(
                        "rounded-full py-2.5 text-sm font-medium transition-all",
                        slot
                          ? "bg-ink text-primary-foreground hover:opacity-90"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      )}
                    >Продолжить →</button>
                  </div>
                </div>

                {/* ══ STEP 3 ══════════════════════════════════════ */}
                <div style={{ width: "33.3333%", padding: "24px 28px 20px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  {sent ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", textAlign: "center", padding: "24px 12px" }}>
                      <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#f0fdf4", border: "2px solid #86efac", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check style={{ width: "24px", height: "24px", color: "#16a34a" }} />
                      </div>
                      <div className="font-serif" style={{ fontSize: "22px" }}>Запись принята!</div>
                      <div style={{ fontSize: "13px", color: "#888", lineHeight: 1.6 }}>
                        Мы свяжемся с вами для подтверждения.
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, overflowY: "auto" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <InlineField id="ap-ln" label="Фамилия *"       placeholder="Иванов"    value={lastName}   onChange={setLastName}   required />
                        <InlineField id="ap-fn" label="Имя *"           placeholder="Иван"      value={firstName}  onChange={setFirstName}  required />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <InlineField id="ap-pn" label="Отчество *"      placeholder="Иванович"  value={patronymic} onChange={setPatronymic} required />
                        <InlineField id="ap-bd" label="Дата рождения"   placeholder="ДД.ММ.ГГГГ" value={birthDate}  onChange={setBirthDate} />
                      </div>
                      <InlineField id="ap-ph" label="Телефон *" placeholder="+7 (___) ___-__-__" value={phone} onChange={setPhone} required type="tel" />
                      <div>
                        <FieldLabel htmlFor="ap-cm">Комментарий</FieldLabel>
                        <textarea id="ap-cm"
                          placeholder="Укажите фамилию врача или другую информацию"
                          value={comment} onChange={(e) => setComment(e.target.value)}
                          className="w-full border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-foreground/40 transition-colors"
                          style={{ padding: "9px 12px", height: "68px" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "8px", marginTop: "auto" }}>
                        <button type="button" onClick={() => setStep(2)}
                          className="border border-border rounded-full py-2.5 text-sm hover:border-foreground/50 transition-colors"
                        >← Назад</button>
                        <button type="submit"
                          className="bg-ink text-primary-foreground rounded-full py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                        >Записаться на приём</button>
                      </div>
                      <p style={{ fontSize: "10.5px", color: "#bbb", lineHeight: 1.4 }}>
                        Отправляя данные, вы соглашаетесь с{" "}
                        <a href="/privacy" className="underline hover:text-foreground transition-colors">политикой конфиденциальности</a>.
                      </p>
                    </form>
                  )}
                </div>

              </div>
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
    <label htmlFor={htmlFor}
      style={{ fontSize: "10.5px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#888", display: "block", marginBottom: "7px" }}>
      {children}
    </label>
  );
}

function InlineField({ id, label, placeholder, value, onChange, required, type = "text" }: {
  id: string; label: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean; type?: string;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input id={id} type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full border border-border rounded-xl text-sm focus:outline-none focus:border-foreground/40 transition-colors bg-background"
        style={{ padding: "9px 12px" }}
      />
    </div>
  );
}
