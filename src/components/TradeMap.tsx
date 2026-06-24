import { useEffect, useRef, useCallback, memo, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapCity {
  cod_mun: string;
  nome_mun: string;
  uf: string;
  vl_fob: number;
}

interface Props {
  cities: MapCity[];
  selectedCity: string | null;
  onCityClick: (codMun: string) => void;
  flowType: "import" | "export";
}

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function TradeMapInner({ cities, selectedCity, onCityClick, flowType }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const coordsRef = useRef<Record<string, { lat: number; lng: number }>>({});
  const [coordsLoaded, setCoordsLoaded] = useState(false);

  // Load coordinates once
  useEffect(() => {
    if (coordsLoaded) return;
    fetch("/data/cidade_coords.json")
      .then(r => r.json())
      .then(data => { coordsRef.current = data; setCoordsLoaded(true); })
      .catch(() => setCoordsLoaded(true));
  }, [coordsLoaded]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_STYLE,
        center: [-51.0, -14.5],
        zoom: 4,
        attributionControl: false,
      });
      map.addControl(new maplibregl.NavigationControl(), "bottom-right");
      mapRef.current = map;
    } catch (e) {
      console.error("Map init failed:", e);
    }
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // Update markers
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !coordsLoaded || !cities.length) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const maxFob = Math.max(...cities.map(c => c.vl_fob));
    if (maxFob <= 0) return;

    const bounds = new maplibregl.LngLatBounds();
    let hasBounds = false;

    cities.forEach(city => {
      const coord = coordsRef.current[city.cod_mun];
      if (!coord) return;

      bounds.extend([coord.lng, coord.lat]);
      hasBounds = true;

      const radius = Math.max(8, Math.sqrt(city.vl_fob / maxFob) * 35);
      const isSelected = selectedCity === city.cod_mun;
      const color = flowType === "import" ? "#2563EB" : "#059669";

      const el = document.createElement("div");
      el.style.width = `${radius * 2}px`;
      el.style.height = `${radius * 2}px`;
      el.style.borderRadius = "50%";
      el.style.background = isSelected ? color : `${color}99`;
      el.style.border = isSelected ? `3px solid #D80E16` : `2px solid white`;
      el.style.boxShadow = isSelected
        ? `0 0 20px ${color}88, 0 2px 8px rgba(0,0,0,0.2)`
        : `0 1px 4px rgba(0,0,0,0.15)`;
      el.style.cursor = "pointer";
      el.style.transition = "all 0.2s";
      el.title = `${city.nome_mun}/${city.uf} - $${(city.vl_fob / 1e3).toFixed(0)}K`;

      el.addEventListener("click", (e) => { e.stopPropagation(); onCityClick(city.cod_mun); });

      let popup: maplibregl.Popup | null = null;
      el.addEventListener("mouseenter", () => {
        popup = new maplibregl.Popup({ closeButton: false, offset: 12 })
          .setLngLat([coord.lng, coord.lat])
          .setHTML(`
            <div style="font-family:sans-serif;font-size:12px">
              <strong>${city.nome_mun}</strong> / ${city.uf}<br/>
              <span style="color:${color};font-weight:bold">$${(city.vl_fob / 1e3).toFixed(0)}K</span>
            </div>
          `)
          .addTo(map);
      });
      el.addEventListener("mouseleave", () => {
        if (popup) { popup.remove(); popup = null; }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([coord.lng, coord.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (hasBounds) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 10, duration: 800 });
    }
  }, [cities, selectedCity, onCityClick, flowType, coordsLoaded]);

  useEffect(() => { updateMarkers(); }, [updateMarkers]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-200"
      style={{ minHeight: "400px" }}
    />
  );
}

export const TradeMap = memo(TradeMapInner);
