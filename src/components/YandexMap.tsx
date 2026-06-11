interface YandexMapProps {
  address: string;
  zoom?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function YandexMap({ address, zoom = 16, height = 300, className, style }: YandexMapProps) {
  const src = `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(address)}&z=${zoom}`;
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
      title={`Карта · ${address}`}
    />
  );
}
