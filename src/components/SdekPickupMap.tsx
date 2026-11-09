import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker, MarkerClusterGroup } from "leaflet";
import type { PickupPointOption } from "@/lib/api/bitrix";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
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
  const layerRef = useRef<MarkerClusterGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const onFocusRef = useRef(onFocus);
  const pointsRef = useRef(points);
  const activeIdRef = useRef(activeId);

  onFocusRef.current = onFocus;
  pointsRef.current = points;
  activeIdRef.current = activeId;

  const renderPoints = () => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    markersRef.current.clear();
    const bounds: [number, number][] = [];
    for (const point of pointsRef.current) {
      const position = coordinates(point);
      if (!position) continue;
      bounds.push(position);
      const marker = L.marker(position, {
        icon: L.divIcon({
          className: `sdek-map-marker${point.id === activeIdRef.current ? " sdek-map-marker--active" : ""}`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          html: "<span aria-hidden=\"true\"></span>",
        }),
        title: `${point.name}, ${point.address}`,
      });
      marker.on("click", () => onFocusRef.current(point.id));
      marker.addTo(layer);
      markersRef.current.set(point.id, marker);
    }
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 11 });
    }
  };

  useEffect(() => {
    let disposed = false;
    const markers = markersRef.current;
    void import("leaflet").then(async (L) => {
      Object.assign(globalThis, { L });
      await import("leaflet.markercluster");
      if (disposed || !hostRef.current) return;
      leafletRef.current = L;
      const initialPoint = pointsRef.current.map(coordinates).find((value) => value !== null);
      const map = L.map(hostRef.current, { zoomControl: true }).setView(initialPoint ?? [59.9343, 30.3351], 10);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.markerClusterGroup({ maxClusterRadius: 55, showCoverageOnHover: false }).addTo(map);
      renderPoints();
      requestAnimationFrame(() => map.invalidateSize());
    });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      leafletRef.current = null;
      markers.clear();
    };
  }, []);

  useEffect(() => {
    renderPoints();
  }, [points]);

  useEffect(() => {
    const L = leafletRef.current;
    if (!L) return;
    for (const [id, marker] of markersRef.current) {
      marker.setIcon(L.divIcon({
        className: `sdek-map-marker${id === activeId ? " sdek-map-marker--active" : ""}`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        html: "<span aria-hidden=\"true\"></span>",
      }));
    }
    const marker = activeId ? markersRef.current.get(activeId) : null;
    if (marker) mapRef.current?.panTo(marker.getLatLng());
  }, [activeId]);

  return <div ref={hostRef} className="h-full w-full" role="application" aria-label="Карта пунктов выдачи СДЭК" />;
}
