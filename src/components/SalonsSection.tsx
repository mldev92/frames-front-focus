import { useState } from "react";
import { ArrowRight, Phone, Clock, MapPin } from "lucide-react";
import { ContactActionButtons, yandexMapsSearchHref } from "@/components/ContactActionButtons";
import { CONTACT, NK_SALONS, SPB_SALONS } from "@/data/contact";

type City = "spb" | "nk";

const SPB_SALON = SPB_SALONS[0];

const MetroBadge = () => (
  <span
    style={{
      display: "inline-flex",
      width: 18,
      height: 18,
      borderRadius: "50%",
      background: "var(--brand)",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <span style={{ color: "white", fontSize: 9, fontWeight: 700, lineHeight: 1 }}>М</span>
  </span>
);

const StatusBadge = () => (
  <div
    style={{
      position: "absolute",
      top: 14,
      left: 14,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 12px",
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 600,
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      background: "oklch(0.95 0.05 150 / 0.9)",
      color: "oklch(0.3 0.1 150)",
    }}
  >
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "var(--success, oklch(0.65 0.15 150))",
        animation: "salonPulseDot 2s ease-in-out infinite",
      }}
    />
    Открыто
  </div>
);

const ImagePlaceholder = ({ label }: { label: string }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      background:
        "repeating-linear-gradient(-45deg, transparent, transparent 8px, oklch(0.935 0.008 80) 8px, oklch(0.935 0.008 80) 9px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column" as const,
      gap: 6,
    }}
  >
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--muted-foreground)", opacity: 0.5 }}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
    <span
      style={{
        fontSize: 11,
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        color: "var(--muted-foreground)",
        background: "var(--surface)",
        padding: "3px 10px",
        borderRadius: 4,
      }}
    >
      {label}
    </span>
  </div>
);

const RatingBadge = ({
  source,
  score,
  stars,
  half,
}: {
  source: "yandex" | "2gis";
  score: string;
  stars: number;
  half?: boolean;
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "6px 12px",
      borderRadius: 8,
      background: "var(--surface)",
      fontSize: 13,
      cursor: "default",
    }}
  >
    <span
      style={{
        display: "inline-flex",
        width: 18,
        height: 18,
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: source === "yandex" ? "var(--brand)" : "oklch(0.55 0.16 150)",
      }}
    >
      <span style={{ color: "white", fontSize: 8, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {source === "yandex" ? "Я" : "2G"}
      </span>
    </span>
    <span style={{ fontWeight: 600, color: "var(--foreground)" }}>{score}</span>
    <span style={{ color: "oklch(0.78 0.16 85)", fontSize: 12, letterSpacing: 1 }}>
      {"★".repeat(stars)}
      {half && <span style={{ color: "var(--border)" }}>★</span>}
    </span>
    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
      {source === "yandex" ? "Яндекс" : "2ГИС"}
    </span>
  </div>
);

const MapPlaceholder = ({ city, imageSrc }: { city: string; imageSrc?: string }) => (
  <div
    style={{
      borderRadius: 16,
      overflow: "hidden",
      border: "1px solid var(--border)",
      background: "var(--surface)",
      height: 240,
      position: "relative",
      marginBottom: 28,
    }}
  >
    {imageSrc ? (
      <img
        src={imageSrc}
        alt={`Карта · ${city}`}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    ) : (
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column" as const,
          gap: 8,
          color: "var(--muted-foreground)",
        }}
      >
        <MapPin size={36} style={{ opacity: 0.5 }} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>Яндекс Карта · {city}</span>
        <span style={{ fontSize: 12, opacity: 0.6 }}>Вставьте iframe Яндекс.Карт</span>
      </div>
    )}
  </div>
);

interface SalonCardProps {
  name: string;
  addressNote: string;
  hours: string;
  phone?: string;
  metro?: boolean;
  metroName?: string;
  imageLabel: string;
  imageSrc?: string;
  yandexScore: string;
  yandexStars: number;
  twogisScore: string;
  twogisStars: number;
  routeHref: string;
  phoneHref: string;
  phoneLabel: string;
  twogisHalf?: boolean;
  wide?: boolean;
}

const SalonCard = ({
  name,
  addressNote,
  hours,
  phone,
  metro,
  metroName,
  imageLabel,
  imageSrc,
  yandexScore,
  yandexStars,
  twogisScore,
  twogisStars,
  routeHref,
  phoneHref,
  phoneLabel,
  twogisHalf,
  wide,
}: SalonCardProps) => (
  <div
    className="salon-card-hover"
    style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      overflow: "hidden",
      display: wide ? "grid" : "flex",
      flexDirection: wide ? undefined : "column",
      gridTemplateColumns: wide ? "1fr 1fr" : undefined,
    }}
  >
    <div
      style={{
        aspectRatio: wide ? "auto" : "16/9",
        minHeight: wide ? 280 : undefined,
        background: "var(--surface)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name}
          loading="lazy"
          className="salon-img"
        />
      ) : (
        <ImagePlaceholder label={imageLabel} />
      )}
      <StatusBadge />
    </div>
    <div
      style={{
        padding: "24px 24px 28px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <h3 style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35, marginBottom: 6 }}>{name}</h3>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 14, lineHeight: 1.45 }}>
        {addressNote}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {metro && metroName && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--muted-foreground)" }}>
            <MetroBadge />
            <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{metroName}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--muted-foreground)" }}>
          <Clock size={16} style={{ flexShrink: 0 }} />
          <span>{hours}</span>
        </div>
        {phone && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--muted-foreground)" }}>
            <Phone size={16} style={{ flexShrink: 0 }} />
            <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{phone}</span>
          </div>
        )}
      </div>

      <ContactActionButtons
        routeHref={routeHref}
        phoneHref={phoneHref}
        phoneLabel={phoneLabel}
        className="mb-5"
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          marginTop: "auto",
          paddingTop: 18,
          borderTop: "1px solid var(--border)",
        }}
      >
        <RatingBadge source="yandex" score={yandexScore} stars={yandexStars} />
        <RatingBadge source="2gis" score={twogisScore} stars={twogisStars} half={twogisHalf} />
      </div>
    </div>
  </div>
);

export function SalonsSection() {
  const [city, setCity] = useState<City>("spb");

  return (
    <>
      <style>{`
        @keyframes salonPulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes salonFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .salon-city-panel {
          animation: salonFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (max-width: 860px) {
          .salons-grid-2col { grid-template-columns: 1fr !important; }
          .salon-card-wide { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .salons-header-wrap { flex-direction: column !important; align-items: flex-start !important; }
          .salons-cta-row { flex-direction: column !important; align-items: flex-start !important; }
        }
        .salon-card-hover { transition: box-shadow 0.3s, transform 0.3s; }
        .salon-card-hover:hover { box-shadow: 0 8px 28px -6px rgba(0,0,0,0.14); transform: translateY(-4px); }
        .salon-img { width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.7s cubic-bezier(0.22,1,0.36,1); }
        .salon-card-hover:hover .salon-img { transform: scale(1.05); }
        .salon-cta-primary,.salon-cta-secondary { transition: filter 0.2s, transform 0.2s, background 0.25s, color 0.25s; }
        .salon-cta-primary:hover { filter: brightness(1.1); transform: translateY(-2px); }
        .salon-cta-secondary:hover { background: var(--foreground) !important; color: var(--background) !important; }
        .salon-city-tab:hover:not([data-active="true"]) { background: rgba(0,0,0,0.06) !important; }
      `}</style>

      <section style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px 96px", background: "#FBFAF8" }}>

        {/* Header */}
        <div
          className="salons-header-wrap"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            marginBottom: 44,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <p
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "var(--brand)",
                marginBottom: 16,
                fontWeight: 600,
              }}
            >
              ОПТИКА 100%
            </p>
            <h2
              className="font-serif"
              style={{ fontSize: "clamp(32px, 4.5vw, 48px)", fontWeight: 400, lineHeight: 1.1, marginBottom: 14 }}
            >
              Наши салоны
            </h2>
            <p style={{ fontSize: 16, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
              Приходите на диагностику зрения и подбор очков в удобный для&nbsp;вас салон.
            </p>
          </div>

          {/* City tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(["spb", "nk"] as City[]).map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className="salon-city-tab"
                data-active={city === c ? "true" : "false"}
                style={{
                  padding: "10px 22px",
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "1px solid var(--border)",
                  background: city === c ? "var(--foreground)" : "transparent",
                  color: city === c ? "var(--background)" : "var(--foreground)",
                  fontFamily: "inherit",
                  transition: "all 360ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {c === "spb" ? "Санкт-Петербург" : "Новокузнецк"}
              </button>
            ))}
          </div>
        </div>

        {/* SPB */}
        {city === "spb" && (
          <div className="salon-city-panel">
            <MapPlaceholder city="Санкт-Петербург" imageSrc="/map_template.webp" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 28 }}>
              <SalonCard
                wide
                name={SPB_SALON.address}
                addressNote="Центр города, рядом с метро Чернышевская"
                hours={SPB_SALON.hours}
                phone={CONTACT.phone.label}
                metro
                metroName={SPB_SALON.metro}
                imageLabel={SPB_SALON.imageLabel}
                imageSrc={SPB_SALON.imageSrc}
                yandexScore="5.0"
                yandexStars={5}
                twogisScore="5.0"
                twogisStars={5}
                routeHref={yandexMapsSearchHref(SPB_SALON.routeQuery)}
                phoneHref={CONTACT.phone.href}
                phoneLabel={CONTACT.phone.label}
              />
            </div>
          </div>
        )}

        {/* Novokuznetsk */}
        {city === "nk" && (
          <div className="salon-city-panel">
            <MapPlaceholder city="Новокузнецк" />
            <div
              className="salons-grid-2col"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}
            >
              {NK_SALONS.map((salon, index) => (
                <SalonCard
                  key={salon.id}
                  name={salon.address}
                  addressNote={salon.name}
                  hours={salon.hours}
                  phone={CONTACT.phone.label}
                  imageLabel={salon.imageLabel}
                  imageSrc={salon.imageSrc}
                  yandexScore="5.0"
                  yandexStars={5}
                  twogisScore={index === 1 ? "5.0" : "4.8"}
                  twogisStars={index === 1 ? 5 : 4}
                  routeHref={yandexMapsSearchHref(salon.routeQuery)}
                  phoneHref={CONTACT.phone.href}
                  phoneLabel={CONTACT.phone.label}
                  twogisHalf={index !== 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* CTA row */}
        <div
          className="salons-cta-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <p style={{ fontSize: 15, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
            <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>5 салонов</strong> в 2 городах
            {" · "}Диагностика зрения бесплатно при заказе очков
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href={CONTACT.phone.href}
              className="salon-cta-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 26px",
                background: "var(--brand)",
                color: "var(--brand-foreground, white)",
                border: "none",
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <Phone size={18} />
              Позвонить
            </a>
            <a
              href="/contacts"
              className="salon-cta-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 26px",
                background: "none",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: 9999,
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              Все контакты
              <ArrowRight size={18} />
            </a>
          </div>
        </div>

      </section>
    </>
  );
}
