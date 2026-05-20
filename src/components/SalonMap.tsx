import { useState } from "react";
import { MapPin, Phone, Clock, Car, TrainFront, PersonStanding, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Salon } from "@/data/types";

type TransportMode = "car" | "metro" | "walk";

interface SalonMeta extends Salon {
  pinX: number;
  pinY: number;
  isOpen: boolean;
  ymapsHref: string;
  twogisHref: string;
  eta: Record<TransportMode, string>;
  dist: Record<TransportMode, string>;
}

function enrichSalons(salons: Salon[]): SalonMeta[] {
  const extras: Array<Omit<SalonMeta, keyof Salon>> = [
    {
      pinX: 35, pinY: 42, isOpen: true,
      ymapsHref: "https://yandex.ru/maps/?text=Кирочная+17+Санкт-Петербург",
      twogisHref: "https://2gis.ru/spb/search/Кирочная 17",
      eta: { car: "12 мин", metro: "18 мин", walk: "34 мин" },
      dist: { car: "4.2 км", metro: "2.8 км", walk: "2.8 км" },
    },
    {
      pinX: 55, pinY: 52, isOpen: true,
      ymapsHref: "https://yandex.ru/maps/?text=Невский+пр+88+Санкт-Петербург",
      twogisHref: "https://2gis.ru/spb/search/Невский проспект 88",
      eta: { car: "18 мин", metro: "22 мин", walk: "48 мин" },
      dist: { car: "6.1 км", metro: "4.1 км", walk: "4.1 км" },
    },
    {
      pinX: 22, pinY: 60, isOpen: false,
      ymapsHref: "https://yandex.ru/maps/?text=6-я+линия+В.О.+23+Санкт-Петербург",
      twogisHref: "https://2gis.ru/spb/search/6-я линия Васильевского острова 23",
      eta: { car: "22 мин", metro: "28 мин", walk: "58 мин" },
      dist: { car: "7.5 км", metro: "5.2 км", walk: "5.2 км" },
    },
  ];
  return salons.map((s, i) => ({ ...s, ...extras[i] }));
}

const TRANSPORT_ICONS = {
  car: Car,
  metro: TrainFront,
  walk: PersonStanding,
} as const;

const TRANSPORT_LABELS = {
  car: "Авто",
  metro: "Метро",
  walk: "Пешком",
} as const;

interface Props {
  salons: Salon[];
}

export function SalonMap({ salons: rawSalons }: Props) {
  const salons = enrichSalons(rawSalons);
  const [activeId, setActiveId] = useState(salons[0].id);
  const [mode, setMode] = useState<TransportMode>("metro");
  const active = salons.find((s) => s.id === activeId) ?? salons[0];

  return (
    <div className="grid lg:grid-cols-[260px_1fr_300px] gap-0 border border-border rounded-2xl overflow-hidden bg-card">
      {/* Salon list */}
      <div className="border-r border-border overflow-y-auto max-h-[520px]">
        {salons.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveId(s.id)}
            className={cn(
              "w-full text-left px-4 py-3.5 border-b border-border flex gap-3 items-start transition-colors",
              s.id === activeId ? "bg-cream border-l-2 border-l-ink" : "hover:bg-surface",
            )}
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-medium shrink-0 mt-0.5",
                s.id === activeId ? "bg-ink text-primary-foreground" : "bg-surface text-muted-foreground border border-border",
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <div className="text-[13px] font-medium leading-snug truncate">{s.name}</div>
              <div className="text-[11.5px] text-muted-foreground mt-0.5">{s.metro}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", s.isOpen ? "bg-success" : "bg-muted-foreground")} />
                <span className="text-[11px] text-muted-foreground">{s.isOpen ? "Открыто" : "Закрыто"}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Decorative SVG map */}
      <div className="relative bg-[oklch(0.97_0.006_80)] overflow-hidden min-h-[320px]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          {/* Grid lines */}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="oklch(0.9 0.008 80)" strokeWidth="0.3" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="oklch(0.9 0.008 80)" strokeWidth="0.3" />
          ))}
          {/* Roads */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="white" strokeWidth="1.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="white" strokeWidth="1.2" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="white" strokeWidth="0.8" />
          <line x1="20" y1="0" x2="20" y2="100" stroke="white" strokeWidth="0.8" />
          {/* Park blobs */}
          <ellipse cx="75" cy="20" rx="12" ry="8" fill="oklch(0.88 0.04 150)" opacity="0.5" />
          <ellipse cx="10" cy="80" rx="8" ry="6" fill="oklch(0.88 0.04 150)" opacity="0.5" />
          {/* Route line to active */}
          <path
            d={`M 50 50 Q ${(active.pinX + 50) / 2} ${(active.pinY + 50) / 2} ${active.pinX} ${active.pinY}`}
            fill="none"
            stroke="oklch(0.55 0.18 28)"
            strokeWidth="0.6"
            strokeDasharray="2 1.5"
          />
          {/* User dot */}
          <circle cx="50" cy="50" r="2.5" fill="oklch(0.55 0.18 28)" />
          <circle cx="50" cy="50" r="5" fill="oklch(0.55 0.18 28)" opacity="0.15" />
          {/* Pins */}
          {salons.map((s, i) => (
            <g key={s.id} onClick={() => setActiveId(s.id)} style={{ cursor: "pointer" }}>
              <circle
                cx={s.pinX}
                cy={s.pinY}
                r={s.id === activeId ? 5 : 3.5}
                fill={s.id === activeId ? "oklch(0.22 0.014 250)" : "oklch(0.6 0.015 250)"}
                stroke="white"
                strokeWidth="0.8"
              />
              <text
                x={s.pinX}
                y={s.pinY + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={s.id === activeId ? "3.5" : "2.8"}
                fill="white"
                fontWeight="600"
              >
                {i + 1}
              </text>
            </g>
          ))}
        </svg>
        <div className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          Санкт-Петербург
        </div>
      </div>

      {/* Detail panel */}
      <div className="border-l border-border flex flex-col overflow-y-auto max-h-[520px]">
        <div className="aspect-[16/9] overflow-hidden shrink-0">
          <img src={active.image} alt={active.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-5 flex-1 flex flex-col gap-4">
          <div>
            <h3 className="font-serif text-[17px] font-medium leading-snug">{active.name}</h3>
            <div className={cn("flex items-center gap-1.5 mt-1.5 text-[11.5px]", active.isOpen ? "text-success" : "text-muted-foreground")}>
              <span className={cn("w-1.5 h-1.5 rounded-full", active.isOpen ? "bg-success" : "bg-muted-foreground")} />
              {active.isOpen ? "Открыто сейчас" : "Закрыто"}
            </div>
          </div>

          <ul className="space-y-2.5 text-[12.5px]">
            <li className="flex gap-2 items-start">
              <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
              <span>{active.address}</span>
            </li>
            <li className="flex gap-2 items-center">
              <TrainFront className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>м. {active.metro}</span>
            </li>
            <li className="flex gap-2 items-center">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <a href={`tel:${active.phone}`} className="hover:text-brand">
                {active.phone}
              </a>
            </li>
            <li className="flex gap-2 items-center">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{active.hours}</span>
            </li>
          </ul>

          {/* Transport mode */}
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
              Маршрут
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["car", "metro", "walk"] as TransportMode[]).map((m) => {
                const Icon = TRANSPORT_ICONS[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex flex-col items-center gap-1 py-2 rounded-xl border text-[11px] transition-colors cursor-pointer",
                      m === mode
                        ? "bg-ink text-primary-foreground border-ink"
                        : "bg-background border-border hover:border-ink/40",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="font-medium">{active.eta[m]}</span>
                    <span className={m === mode ? "opacity-60 text-[10px]" : "text-[10px] text-muted-foreground"}>
                      {active.dist[m]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Route CTAs */}
          <div className="mt-auto space-y-2">
            <a
              href={active.ymapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-ink text-primary-foreground rounded-full py-2.5 text-[13px] font-medium no-underline hover:opacity-90 transition-opacity"
            >
              Проложить маршрут
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <div className="flex gap-2 text-[11.5px]">
              <a href={active.ymapsHref} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center py-2 border border-border rounded-full hover:border-ink/50 transition-colors no-underline text-foreground">
                Яндекс Карты
              </a>
              <a href={active.twogisHref} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center py-2 border border-border rounded-full hover:border-ink/50 transition-colors no-underline text-foreground">
                2ГИС
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
