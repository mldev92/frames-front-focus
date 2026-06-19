interface YandexMapProps {
  address?: string;
  markers?: readonly {
    lat: number;
    lon: number;
  }[];
  center?: {
    lat: number;
    lon: number;
  };
  zoom?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

function formatLonLat(point: { lat: number; lon: number }) {
  return `${point.lon},${point.lat}`;
}

function averageCenter(markers: readonly { lat: number; lon: number }[]) {
  const total = markers.reduce(
    (acc, marker) => ({
      lat: acc.lat + marker.lat,
      lon: acc.lon + marker.lon,
    }),
    { lat: 0, lon: 0 },
  );

  return {
    lat: total.lat / markers.length,
    lon: total.lon / markers.length,
  };
}

export function YandexMap({
  address,
  markers,
  center,
  zoom = 16,
  height = 300,
  className,
  style,
}: YandexMapProps) {
  const hasMarkers = Boolean(markers && markers.length > 0);
  const mapCenter = hasMarkers ? center ?? averageCenter(markers) : undefined;
  const markerPoints = hasMarkers
    ? markers.map((marker) => `${formatLonLat(marker)},pm2rdm`).join("~")
    : undefined;
  const src = hasMarkers && mapCenter && markerPoints
    ? `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(formatLonLat(mapCenter))}&z=${zoom}&pt=${encodeURIComponent(markerPoints)}`
    : `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address ?? "")}&z=${zoom}`;

  return (
    <iframe
      src={src}
      width="100%"
      height={height}
      className={className}
      style={{ border: 0, display: "block", ...style }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={address ? `Карта · ${address}` : "Карта салонов"}
    />
  );
}
