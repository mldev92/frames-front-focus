import { useCallback, useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import type { PickupPointOption } from "@/lib/api/bitrix";
import "leaflet/dist/leaflet.css";
import "./SdekPickupMap.css";

interface SdekPickupMapProps {
  points: PickupPointOption[];
  activeId: string | null;
  onFocus: (id: string) => void;
}

const coordinates = (point: PickupPointOption): [number, number] | null =>
  Number.isFinite(point.lat) && Number.isFinite(point.lon)
    ? [point.lat as number, point.lon as number]
    : null;

export function SdekPickupMap({ points, activeId, onFocus }: SdekPickupMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onFocusRef = useRef(onFocus);
  const pointsRef = useRef(points);
  const activeIdRef = useRef(activeId);

  onFocusRef.current = onFocus;
  pointsRef.current = points;
  activeIdRef.current = activeId;

  const renderMarkers = useCallback(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    const zoom = map.getZoom();
    const groups = new Map<string, { points: PickupPointOption[]; lat: number; lon: number }>();
    for (const point of pointsRef.current) {
      const position = coordinates(point);
      if (!position) continue;
      const pixel = map.project(position, zoom);
      const key = zoom >= 15 ? point.id : `${Math.floor(pixel.x / 55)}:${Math.floor(pixel.y / 55)}`;
      const group = groups.get(key) ?? { points: [], lat: 0, lon: 0 };
      group.points.push(point);
      group.lat += position[0];
      group.lon += position[1];
      groups.set(key, group);
    }

    for (const group of groups.values()) {
      if (group.points.length === 1) {
        const point = group.points[0];
        const position = coordinates(point);
        if (!position) continue;
        L.marker(position, {
          icon: L.divIcon({
            className: `sdek-map-marker${point.id === activeIdRef.current ? " sdek-map-marker--active" : ""}`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            html: "<span aria-hidden=\"true\"></span>",
          }),
          title: `${point.name}, ${point.address}`,
        }).on("click", () => onFocusRef.current(point.id)).addTo(layer);
        continue;
      }

      const count = group.points.length;
      const center: [number, number] = [group.lat / count, group.lon / count];
      L.marker(center, {
        icon: L.divIcon({
          className: "sdek-map-cluster",
          iconSize: [42, 42],
          iconAnchor: [21, 21],
          html: `<span>${count}</span>`,
        }),
        title: `${count} пунктов выдачи`,
      }).on("click", () => map.setView(center, Math.min(map.getZoom() + 2, 16))).addTo(layer);
    }
  }, []);

  const renderPoints = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = pointsRef.current.map(coordinates).filter((value): value is [number, number] => value !== null);
    if (bounds.length > 0) map.fitBounds(bounds, { padding: [35, 35], maxZoom: 11 });
    const selected = pointsRef.current.find((point) => point.id === activeIdRef.current);
    const position = selected && coordinates(selected);
    if (position) map.setView(position, 15);
    renderMarkers();
  }, [renderMarkers]);

  useEffect(() => {
    let disposed = false;
    void import("leaflet").then((L) => {
      if (disposed || !hostRef.current) return;
      leafletRef.current = L;
      const initialPoint = pointsRef.current.map(coordinates).find((value) => value !== null);
      const map = L.map(hostRef.current, { zoomControl: true }).setView(initialPoint ?? [59.9343, 30.3351], 10);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      map.on("zoomend", renderMarkers);
      renderPoints();
      requestAnimationFrame(() => map.invalidateSize());
    });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      leafletRef.current = null;
    };
  }, [renderMarkers, renderPoints]);

  useEffect(() => {
    renderPoints();
  }, [points, renderPoints]);

  useEffect(() => {
    const map = mapRef.current;
    const selected = pointsRef.current.find((point) => point.id === activeId);
    const position = selected && coordinates(selected);
    if (map && position) map.setView(position, Math.max(map.getZoom(), 15));
    renderMarkers();
  }, [activeId, renderMarkers]);

  return <div ref={hostRef} className="h-full w-full" role="application" aria-label="Карта пунктов выдачи СДЭК" />;
}
