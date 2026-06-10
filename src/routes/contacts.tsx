import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppointmentModal } from "@/components/AppointmentModal";
import { ContactActionButtons, yandexMapsSearchHref } from "@/components/ContactActionButtons";
import { CONTACT, NK_SALONS, SPB_SALONS } from "@/data/contact";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Наши салоны · ОПТИКА 100%" },
      {
        name: "description",
        content:
          "Адреса салонов ОПТИКА 100% в Санкт-Петербурге и Новокузнецке. Диагностика зрения, подбор очков и линз.",
      },
      { property: "og:title", content: "Наши салоны · ОПТИКА 100%" },
    ],
  }),
  component: ContactsPage,
});

// ── SVG icons ────────────────────────────────────────────────────────────────

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EnvelopeIcon({ color = "var(--brand)", size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ClockIcon({ color = "var(--brand)", size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MapPinIcon({ size = 40, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function YandexRatingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="oklch(0.55 0.2 28)" />
      <circle cx="12" cy="10" r="3" fill="white" />
    </svg>
  );
}

function CardIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function CurrencyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

// ── Reusable sub-components ──────────────────────────────────────────────────

const SPB_SALON = SPB_SALONS[0];

function PayBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 12px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 500,
      background: "var(--surface)",
      color: "var(--muted-foreground)",
    }}>
      {icon}
      {label}
    </span>
  );
}

function RatingRow({ yandex, twoGis }: { yandex: string; twoGis: string }) {
  const twoGisFull = twoGis === "5.0";
  return (
    <div className="flex flex-wrap items-center" style={{ gap: 16 }}>
      <div className="flex items-center" style={{ gap: 8 }}>
        <YandexRatingIcon />
        <span style={{ fontSize: 14, fontWeight: 600 }}>{yandex}</span>
        <span style={{ color: "oklch(0.78 0.16 85)" }}>★★★★★</span>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Яндекс</span>
      </div>
      <div className="flex items-center" style={{ gap: 8 }}>
        <span style={{
          display: "inline-flex",
          width: 18,
          height: 18,
          borderRadius: 4,
          background: "oklch(0.55 0.16 150)",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>2G</span>
        </span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{twoGis}</span>
        <span style={{ color: "oklch(0.78 0.16 85)" }}>
          {"★★★★"}
          {twoGisFull
            ? <span style={{ color: "oklch(0.78 0.16 85)" }}>★</span>
            : <span style={{ color: "var(--border)" }}>★</span>
          }
        </span>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>2ГИС</span>
      </div>
    </div>
  );
}

const paymentBadges = (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
    <PayBadge icon={<CardIcon />} label="Visa" />
    <PayBadge icon={<CardIcon />} label="MasterCard" />
    <PayBadge icon={<CurrencyIcon />} label="Наличные" />
  </div>
);

function MapPlaceholder({ city, imageSrc }: { city: string; imageSrc?: string }) {
  return (
    <div style={{
      height: 340,
      borderRadius: 16,
      overflow: "hidden",
      border: "1px solid var(--border)",
      background: "var(--surface)",
      marginBottom: 40,
      position: "relative",
    }}>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`Карта · ${city}`}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 8,
          color: "var(--muted-foreground)",
        }}>
          <MapPinIcon size={40} />
          <span style={{ fontSize: 14 }}>Яндекс Карта · {city}</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>Вставьте iframe Яндекс.Карт</span>
        </div>
      )}
    </div>
  );
}

interface SalonCardProps {
  address: string;
  note?: string;
  metro?: string;
  hours: string;
  yandex: string;
  twoGis: string;
  routeHref: string;
  phoneHref: string;
  phoneLabel: string;
}

function SalonCard({
  address,
  note,
  metro,
  hours,
  yandex,
  twoGis,
  routeHref,
  phoneHref,
  phoneLabel,
}: SalonCardProps) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "28px 32px",
      transition: "box-shadow 360ms cubic-bezier(0.22,1,0.36,1), border-color 360ms cubic-bezier(0.22,1,0.36,1)",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-md)";
        (e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.82 0.01 80)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start" }}>
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 8px", lineHeight: 1.35 }}>
            {address}
          </h3>
          {note && (
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: "0 0 12px" }}>{note}</p>
          )}
          {metro && (
            <div className="flex items-center" style={{ gap: 8, marginBottom: 12 }}>
              <span style={{
                display: "inline-flex",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "oklch(0.55 0.2 28)",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>М</span>
              </span>
              <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>{metro}</span>
            </div>
          )}
          <div className="flex items-center" style={{ gap: 8, marginBottom: 16 }}>
            <ClockIcon color="var(--muted-foreground)" size={16} />
            <span style={{ fontSize: 14, color: "var(--muted-foreground)" }}>{hours}</span>
          </div>
          <ContactActionButtons
            routeHref={routeHref}
            phoneHref={phoneHref}
            phoneLabel={phoneLabel}
            className="mb-5"
          />
          <RatingRow yandex={yandex} twoGis={twoGis} />
        </div>
        {paymentBadges}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

function ContactsPage() {
  const [city, setCity] = useState<"spb" | "nk">("spb");
  const [aptOpen, setAptOpen] = useState(false);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 24px",
    borderRadius: 9999,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: active ? "var(--foreground)" : "transparent",
    color: active ? "var(--background)" : "var(--foreground)",
    transition: "all 360ms cubic-bezier(0.22,1,0.36,1)",
  });

  const pillStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 24px",
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    textDecoration: "none",
    color: "var(--foreground)",
    transition: "all 360ms cubic-bezier(0.22,1,0.36,1)",
  };

  const iconCircle: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    background: "var(--brand-50)",
  };

  return (
    <div>
      {/* HERO */}
      <section style={{ background: "var(--surface)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px 56px" }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--brand)", margin: "0 0 20px" }}>
            ОПТИКА 100%
          </p>
          <h1 className="font-serif" style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1, fontWeight: 400, margin: "0 0 24px" }}>
            Наши салоны
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted-foreground)", maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
            Приходите на диагностику зрения и подбор очков или линз в удобный для вас салон.
          </p>
        </div>
      </section>

      {/* CONTACT BAR */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div className="flex flex-wrap" style={{ gap: 16, marginTop: -28, position: "relative", zIndex: 2 }}>
          <a href={CONTACT.phone.href} style={pillStyle}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--shadow-sm)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "oklch(0.82 0.01 80)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
            }}
          >
            <div style={iconCircle}><PhoneIcon /></div>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Бесплатный звонок</div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{CONTACT.phone.label}</div>
            </div>
          </a>

          <a href={CONTACT.email.href} style={pillStyle}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "var(--shadow-sm)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "oklch(0.82 0.01 80)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
            }}
          >
            <div style={iconCircle}><EnvelopeIcon /></div>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Электронная почта</div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>{CONTACT.email.label}</div>
            </div>
          </a>

          <div style={pillStyle}>
            <div style={iconCircle}><ClockIcon /></div>
            <div>
              <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Время работы</div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>Ежедневно</div>
            </div>
          </div>
        </div>
      </div>

      {/* CITY SELECTOR + SALONS */}
      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 32px 64px" }}>

        {/* City tabs */}
        <div className="flex" style={{ gap: 10, marginBottom: 40 }}>
          <button style={tabStyle(city === "spb")} onClick={() => setCity("spb")}>
            Санкт-Петербург
          </button>
          <button style={tabStyle(city === "nk")} onClick={() => setCity("nk")}>
            Новокузнецк
          </button>
        </div>

        {/* SPB */}
        {city === "spb" && (
          <div>
            <MapPlaceholder city="Санкт-Петербург" imageSrc="/map_template.webp" />
            <SalonCard
              address={SPB_SALON.address}
              metro={SPB_SALON.metro}
              hours={SPB_SALON.hours}
              yandex="5.0"
              twoGis="5.0"
              routeHref={yandexMapsSearchHref(SPB_SALON.routeQuery)}
              phoneHref={CONTACT.phone.href}
              phoneLabel={CONTACT.phone.label}
            />
          </div>
        )}

        {/* NK */}
        {city === "nk" && (
          <div>
            <MapPlaceholder city="Новокузнецк" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {NK_SALONS.map((salon, index) => (
                <SalonCard
                  key={salon.id}
                  address={salon.address}
                  hours={salon.hours}
                  yandex="5.0"
                  twoGis={index === 1 ? "5.0" : "4.8"}
                  routeHref={yandexMapsSearchHref(salon.routeQuery)}
                  phoneHref={CONTACT.phone.href}
                  phoneLabel={CONTACT.phone.label}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* CTA BANNER */}
      <section style={{ background: "var(--surface)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 32px", textAlign: "center" }}>
          <h2 className="font-serif" style={{ fontSize: 32, fontWeight: 500, margin: "0 0 12px" }}>
            Записаться на диагностику
          </h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: 16, margin: "0 auto 28px", maxWidth: 480, lineHeight: 1.6 }}>
            Позвоните нам или оставьте заявку — мы подберём удобное время для визита.
          </p>
          <div className="flex flex-wrap justify-center" style={{ gap: 12 }}>
            <a
              href={CONTACT.phone.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--brand)",
                color: "var(--brand-foreground)",
                borderRadius: 9999,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              <PhoneIcon />
              {CONTACT.phone.label}
            </a>
            <button
              type="button"
              onClick={() => setAptOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--foreground)",
                color: "var(--background)",
                borderRadius: 9999,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 500,
                border: "none",
                cursor: "pointer",
              }}
            >
              <EnvelopeIcon color="var(--background)" size={18} />
              Записаться онлайн
            </button>
          </div>
        </div>
      </section>

      <AppointmentModal open={aptOpen} onOpenChange={setAptOpen} />
    </div>
  );
}
