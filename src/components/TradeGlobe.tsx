import { useEffect, useRef, useCallback, memo, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { comexToIso2 } from "@/components/intel/CountryFlag";

export interface MapCity {
  cod_mun: string;
  nome_mun: string;
  uf: string;
  vl_fob: number;
  kg_liquido?: number;
}

export interface MapCountry {
  cod_pais: string;
  nome_pais: string;
  vl_fob: number;
  kg_liquido: number;
}

export interface CityCountryArc {
  cityCode: string;
  countryCode: string;
  fob: number;
  kg: number;
  via?: string;
}

export interface CityCompanyInfo {
  companyCount: number;
  topCompanies: { nome: string; score: number; likely_flow: string }[];
}

export interface CityCountryInfo {
  nome_pais: string;
  cod_pais: string;
  vl_fob: number;
  kg_liquido: number;
}

export interface MapPort {
  urf: string;
  urf_name?: string;
  via_name: string;
  kg: number;
  fob: number;
  countries?: { cod_pais: string; nome_pais: string; kg: number; fob: number }[];
}

interface Props {
  cities: MapCity[];
  countries: MapCountry[];
  arcs: CityCountryArc[];
  selectedCity: string | null;
  selectedCountry: string | null;
  onCityClick: (codMun: string | null) => void;
  onCountryClick: (codPais: string | null) => void;
  flowType: "import" | "export";
  height?: string;
  companyData?: Record<string, CityCompanyInfo>;
  cityCountriesData?: Record<string, CityCountryInfo[]>;
  volumeThreshold?: number;
  ports?: MapPort[];
}

const MODE_COLORS: Record<string, string> = {
  maritimo: "#0EA5E9",
  aereo: "#8B5CF6",
  rodoviario: "#F59E0B",
  default: "#6366F1",
};
const MODE_LABELS: Record<string, string> = {
  maritimo: "Marítimo",
  aereo: "Aéreo",
  rodoviario: "Rodoviário",
  default: "Outros",
};

function greatCircleArc(
  startLng: number, startLat: number,
  endLng: number, endLat: number,
  numPoints: number = 64,
  arcHeight: number = 0.3
): [number, number][] {
  const points: [number, number][] = [];
  const r1 = (startLng * Math.PI) / 180;
  const r2 = (startLat * Math.PI) / 180;
  const r3 = (endLng * Math.PI) / 180;
  const r4 = (endLat * Math.PI) / 180;
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = r2 + (r4 - r2) * t;
    const lng = r1 + (r3 - r1) * t;
    const h = Math.sin(t * Math.PI) * arcHeight;
    const lo = h * (Math.PI / 2);
    points.push([(lng * 180) / Math.PI, ((lat * 180) / Math.PI) + (lo * 180) / Math.PI]);
  }
  return points;
}

function fmtUSD(n: number): string {
  if (!n || isNaN(n)) return "US$ 0";
  if (n >= 1e9) return `US$ ${(n / 1e9).toFixed(2)} Bi`;
  if (n >= 1e6) return `US$ ${(n / 1e6).toFixed(1)} Mi`;
  if (n >= 1e3) return `US$ ${(n / 1e3).toFixed(0)} Mil`;
  return `US$ ${n.toFixed(0)}`;
}

function fmtKg(n: number): string {
  if (!n || isNaN(n)) return "0";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}M t`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}K t`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} t`;
  return `${n.toFixed(0)} kg`;
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

function TradeGlobeInner({
  cities, countries, arcs, selectedCity, selectedCountry,
  onCityClick, onCountryClick, flowType, height,
  companyData, cityCountriesData, volumeThreshold = 0, ports = []
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const portMarkersRef = useRef<maplibregl.Marker[]>([]);
  const coordsRef = useRef<Record<string, { lat: number; lng: number; uf?: string; nome?: string }>>({});
  const paisCoordsRef = useRef<Record<string, { lat: number; lng: number; name: string }>>({});
  const urfCoordsRef = useRef<Record<string, { lat: number; lng: number; name: string; type: string; uf: string }>>({});
  const animRef = useRef<number>(0);
  const dashOffsetRef = useRef(0);
  const [coordsLoaded, setCoordsLoaded] = useState(false);
  const [paisCoordsLoaded, setPaisCoordsLoaded] = useState(false);
  const [urfCoordsLoaded, setUrfCoordsLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [showPorts, setShowPorts] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showCountries, setShowCountries] = useState(true);
  const [showArcs, setShowArcs] = useState(true);

  useEffect(() => {
    if (coordsLoaded) return;
    fetch("/data/cidade_coords.json")
      .then(r => r.json())
      .then(data => { coordsRef.current = data; setCoordsLoaded(true); })
      .catch(() => setCoordsLoaded(true));
  }, [coordsLoaded]);

  useEffect(() => {
    if (paisCoordsLoaded) return;
    fetch("/data/pais_coords.json")
      .then(r => r.json())
      .then(data => { paisCoordsRef.current = data; setPaisCoordsLoaded(true); })
      .catch(() => setPaisCoordsLoaded(true));
  }, [paisCoordsLoaded]);

  useEffect(() => {
    if (urfCoordsLoaded) return;
    fetch("/data/urf_coords.json")
      .then(r => r.json())
      .then(data => { urfCoordsRef.current = data; setUrfCoordsLoaded(true); })
      .catch(() => setUrfCoordsLoaded(true));
  }, [urfCoordsLoaded]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
        center: [-50, -12],
        zoom: 3.2,
        projection: "globe" as any,
        attributionControl: false,
      });
      map.on("style.load", () => {
        try {
          map.setFog({
            color: "rgb(255, 255, 255)",
            "high-color": "rgb(200, 220, 255)",
            "horizon-blend": 0.15,
            "space-color": "rgb(10, 20, 40)",
            "star-intensity": 0.6,
          });
        } catch (e) { /* */ }
      });
      map.addControl(new maplibregl.NavigationControl(), "bottom-right");
      mapRef.current = map;
      setMapReady(true);
    } catch (e) {
      console.error("Map init failed:", e);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  const updateVisuals = useCallback(() => {
    const map = mapRef.current;
    if (!map || !coordsLoaded || !paisCoordsLoaded) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const arcSourceId = "trade-arcs";
    const arcLayerId = "trade-arcs-layer";
    const countryLayerId = "country-points";
    const countrySourceId = "country-points-source";

    // Remove layers in reverse order
    if (map.getLayer(arcLayerId + "-bg")) map.removeLayer(arcLayerId + "-bg");
    if (map.getLayer(arcLayerId + "-dash")) map.removeLayer(arcLayerId + "-dash");
    if (map.getLayer(arcLayerId)) map.removeLayer(arcLayerId);
    if (map.getSource(arcSourceId)) map.removeSource(arcSourceId);
    if (map.getLayer(countryLayerId)) map.removeLayer(countryLayerId);
    if (map.getSource(countrySourceId)) map.removeSource(countrySourceId);

    const bounds = new maplibregl.LngLatBounds();
    let hasBounds = false;
    const flowColor = flowType === "import" ? "#2563EB" : "#059669";
    const altColor = flowType === "import" ? "#059669" : "#2563EB";

    // Build connected country/city sets based on selection
    const selection = selectedCity || selectedCountry;
    const isCitySelected = !!selectedCity;
    const isCountrySelected = !!selectedCountry;

    // Filter arcs by selection
    const filteredArcs = arcs.filter(a => {
      if (volumeThreshold > 0 && a.fob < volumeThreshold) return false;
      if (selectedCity && a.cityCode !== selectedCity) return false;
      if (selectedCountry && a.countryCode !== selectedCountry) return false;
      return true;
    });

    // Build reverse lookup: which cities connect to which countries
    const connectedCities = new Set<string>();
    const connectedCountries = new Set<string>();
    for (const a of filteredArcs) {
      connectedCities.add(a.cityCode);
      connectedCountries.add(a.countryCode);
    }

    // ─── CITY MARKERS ───
    // Filter cities by volume threshold and country selection
    const visibleCities = showCities ? cities.filter(c => {
      if (volumeThreshold > 0 && c.vl_fob < volumeThreshold) return false;
      if (selectedCountry && !connectedCities.has(c.cod_mun)) return false;
      return true;
    }) : [];

    const maxCityFob = Math.max(...visibleCities.map(c => c.vl_fob), 1);
    visibleCities.forEach(city => {
      const coord = coordsRef.current[city.cod_mun];
      if (!coord) return;

      const isSelected = selectedCity === city.cod_mun;
      const isDimmed = selection !== null && !isSelected;

      if (isDimmed) { bounds.extend([coord.lng, coord.lat]); return; }

      bounds.extend([coord.lng, coord.lat]);
      hasBounds = true;

      const radius = isSelected
        ? Math.max(12, Math.sqrt(city.vl_fob / maxCityFob) * 36)
        : Math.max(8, Math.sqrt(city.vl_fob / maxCityFob) * 30);

      const el = document.createElement("div");
      el.style.width = `${radius * 2}px`;
      el.style.height = `${radius * 2}px`;
      el.style.borderRadius = "50%";
      el.style.background = isSelected ? "#D80E16" : `${flowColor}cc`;
      el.style.border = isSelected ? "3px solid #D80E16" : "2px solid white";
      el.style.boxShadow = isSelected
        ? "0 0 25px #D80E1644, 0 2px 8px rgba(0,0,0,0.3)"
        : `0 2px 8px ${flowColor}44`;
      el.style.cursor = "pointer";
      el.style.transition = "all 0.3s";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.color = "white";
      el.style.fontSize = `${Math.max(8, radius * 0.7)}px`;
      el.style.fontWeight = "bold";
      el.innerHTML = city.kg_liquido
        ? `${(city.kg_liquido / 1000).toFixed(0)}t`
        : `${(city.vl_fob / 1e6).toFixed(1)}M`;
      el.title = `${city.nome_mun}/${city.uf} — US$ ${(city.vl_fob / 1e6).toFixed(1)}M`;

      el.addEventListener("click", (e) => { e.stopPropagation(); onCityClick(isSelected ? null : city.cod_mun); });

      let popup: maplibregl.Popup | null = null;
      el.addEventListener("mouseenter", () => {
        const cc = cityCountriesData?.[city.cod_mun];
        const companyCount = companyData?.[city.cod_mun]?.companyCount;
          popup = new maplibregl.Popup({ closeButton: false, offset: 15 })
            .setLngLat([coord.lng, coord.lat])
            .setHTML(`
              <div style="font-family:sans-serif;font-size:13px;min-width:180px">
                <strong style="font-size:14px">${city.nome_mun}</strong> / ${city.uf}<br/>
                <span style="color:${flowColor};font-weight:bold">${fmtUSD(city.vl_fob)}</span>
              ${city.kg_liquido ? ` · <span style="color:#666">${fmtKg(city.kg_liquido)}</span>` : ""}
              ${companyCount ? `<br/><span style="color:#333;font-size:11px">${companyCount} empresa${companyCount !== 1 ? 's' : ''}</span>` : ""}
              ${cc && cc.length > 0 ? `<br/><span style="color:#666;font-size:11px">${cc.length} paíse${cc.length !== 1 ? 's' : ''}</span>` : ""}
            </div>
          `).addTo(map);
      });
      el.addEventListener("mouseleave", () => { if (popup) { popup.remove(); popup = null; } });

      const marker = new maplibregl.Marker({ element: el }).setLngLat([coord.lng, coord.lat]).addTo(map);
      markersRef.current.push(marker);
    });

    // ─── COUNTRY MARKERS ───
    const visibleCountries = showCountries ? countries.filter(c => {
      if (selectedCity && !connectedCountries.has(c.cod_pais)) return false;
      return true;
    }) : [];

    if (visibleCountries.length > 0) {
      const maxCountryFob = Math.max(...visibleCountries.map(c => c.vl_fob), 1);
      visibleCountries.forEach(country => {
        const coord = paisCoordsRef.current[country.cod_pais];
        if (!coord) return;

        const isSelected = selectedCountry === country.cod_pais;

        bounds.extend([coord.lng, coord.lat]);
        hasBounds = true;

        const radius = isSelected ? Math.max(14, Math.sqrt(country.vl_fob / maxCountryFob) * 38)
          : Math.max(10, Math.sqrt(country.vl_fob / maxCountryFob) * 32);
        const el = document.createElement("div");
        el.style.width = `${radius * 2}px`;
        el.style.height = `${radius * 2}px`;
        el.style.borderRadius = "50%";
        el.style.background = isSelected ? "#D80E16" : `${altColor}aa`;
        el.style.border = isSelected ? "3px solid #D80E16" : "2px solid white";
        el.style.boxShadow = isSelected
          ? "0 0 25px #D80E1644, 0 2px 10px rgba(0,0,0,0.3)"
          : `0 2px 12px ${altColor}66`;
        el.style.cursor = "pointer";
        el.style.transition = "all 0.3s";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.color = "white";
        el.style.fontSize = isSelected ? "11px" : "9px";
        el.style.fontWeight = "bold";
        el.style.textShadow = "0 1px 2px rgba(0,0,0,0.5)";
        el.textContent = country.nome_pais.substring(0, isSelected ? 16 : 12);
        el.title = `${country.nome_pais} — US$ ${(country.vl_fob / 1e6).toFixed(1)}M`;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onCountryClick(isSelected ? null : country.cod_pais);
        });

        // Enhanced tooltip
        let popup: maplibregl.Popup | null = null;
        el.addEventListener("mouseenter", () => {
          // Find which cities trade with this country (via arcs)
          const connectedCityCodes = new Set<string>();
          for (const a of arcs) {
            if (a.countryCode === country.cod_pais && a.fob > 0) {
              connectedCityCodes.add(a.cityCode);
            }
          }
          const cityNames = [...connectedCityCodes]
            .map(c => cities.find(ct => ct.cod_mun === c))
            .filter(Boolean)
            .slice(0, 5)
            .map(c => `${c!.nome_mun}/${c!.uf}`)
            .join(", ");

          popup = new maplibregl.Popup({ closeButton: false, offset: 15 })
            .setLngLat([coord.lng, coord.lat])
            .setHTML(`
              <div style="font-family:sans-serif;font-size:13px;min-width:160px">
                <strong style="font-size:14px">${country.nome_pais}</strong><br/>
                <span style="color:${altColor};font-weight:bold">${fmtUSD(country.vl_fob)}</span>
                ${country.kg_liquido > 0 ? `· <span style="color:#666">${fmtKg(country.kg_liquido)}</span>` : ""}
                ${connectedCityCodes.size > 0 ? `<br/><span style="color:#555;font-size:11px">${connectedCityCodes.size} cidade${connectedCityCodes.size !== 1 ? 's' : ''}</span>` : ""}
                ${cityNames ? `<br/><span style="color:#888;font-size:10px">${cityNames}</span>` : ""}
              </div>
            `).addTo(map);
        });
        el.addEventListener("mouseleave", () => { if (popup) { popup.remove(); popup = null; } });

        const marker = new maplibregl.Marker({ element: el }).setLngLat([coord.lng, coord.lat]).addTo(map);
        markersRef.current.push(marker);
      });
    }

    // ─── PORT / URF MARKERS ───
    // Remove old port markers
    portMarkersRef.current.forEach(m => m.remove());
    portMarkersRef.current = [];

    if (showPorts && ports.length > 0 && urfCoordsLoaded) {
      const maxPortFob = Math.max(...ports.map(p => p.fob), 1);
      ports.forEach(port => {
        const urfCoord = urfCoordsRef.current[port.urf];
        if (!urfCoord) return;

        // Skip if filtered by selection
        if (selectedCity || selectedCountry) {
          // Still show ports if they serve the selected entity
          const servesSelection = port.countries?.some(c =>
            (selectedCountry && c.cod_pais === selectedCountry) ||
            (selectedCity && arcs.some(a => a.cityCode === selectedCity && a.countryCode === c.cod_pais))
          );
          if (!servesSelection) return;
        }

        const viaName = (port.via_name || "").toLowerCase();
        let modeColor = MODE_COLORS.default;
        let modeIcon = "warehouse";
        if (viaName.includes("mar") || viaName.includes("maritim")) { modeColor = MODE_COLORS.maritimo; modeIcon = "port"; }
        else if (viaName.includes("aer") || viaName.includes("aere")) { modeColor = MODE_COLORS.aereo; modeIcon = "airport"; }
        else if (viaName.includes("rod") || viaName.includes("rodov")) { modeColor = MODE_COLORS.rodoviario; modeIcon = "border"; }

        const isSelected = false; // Could track selected port in future
        const size = Math.max(18, Math.sqrt(port.fob / maxPortFob) * 28);
        const el = document.createElement("div");
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = "50%";
        el.style.background = "#ffffff";
        el.style.border = `2.5px solid ${modeColor}`;
        el.style.boxShadow = `0 2px 8px ${modeColor}44, 0 0 0 1px rgba(0,0,0,0.05)`;
        el.style.cursor = "pointer";
        el.style.transition = "all 0.3s";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.zIndex = "5";

        // SVG icon inside marker
        const iconSize = size * 0.55;
        const iconSvgs: Record<string, string> = {
          port: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${modeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18l1.5 3h15L21 18"/><path d="M4 18h16l-1-5H5z" fill="${modeColor}20"/><rect x="7" y="9" width="4" height="4" rx="0.5" fill="${modeColor}30"/><rect x="11.5" y="9" width="4" height="4" rx="0.5" fill="${modeColor}20"/><path d="M12 9V5"/><path d="M10 5h4"/></svg>`,
          airport: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${modeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.5l-1.5-6.5L17 8l-1 3.5L8 8 6 9l5 5-2 1.5L6 15l-1 .5L7 18l1 1 2.5-2 1.5-1 5 5 1-1-1.5-3 2-1 2.5 1z" fill="${modeColor}15"/></svg>`,
          border: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${modeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"/><path d="M4 12v8M20 12v8"/><rect x="6" y="10.5" width="3" height="3" fill="${modeColor}30" rx="0.3"/><rect x="10" y="10.5" width="3" height="3" fill="${modeColor}40" rx="0.3"/><rect x="14" y="10.5" width="3" height="3" fill="${modeColor}30" rx="0.3"/></svg>`,
          warehouse: `<svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${modeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l9-4 9 4v13" fill="${modeColor}10"/><rect x="9" y="13" width="6" height="8" rx="0.5" fill="${modeColor}15"/></svg>`,
        };
        el.innerHTML = iconSvgs[modeIcon] || iconSvgs.warehouse;

        const portName = port.urf_name || urfCoord.name || port.urf;
        el.title = `${portName} — ${fmtUSD(port.fob)}`;

        // Rich popup
        let popup: maplibregl.Popup | null = null;
        el.addEventListener("mouseenter", () => {
          const topCountries = (port.countries || []).filter(c => c.kg > 0).slice(0, 5);
          const countriesHtml = topCountries.map(c => {
            const ppk = c.kg > 0 ? (c.fob / c.kg).toFixed(2) : "-";
            return `<div style="display:flex;align-items:center;gap:4px;padding:2px 0;font-size:11px">
              <span style="flex:1;color:#475569">${c.nome_pais}</span>
              <span style="color:#94a3b8;font-family:monospace">${fmtKg(c.kg)}</span>
              <span style="color:#1e293b;font-weight:600;min-width:55px;text-align:right">${fmtUSD(c.fob)}</span>
            </div>`;
          }).join("");
          popup = new maplibregl.Popup({ closeButton: false, offset: 15, maxWidth: "280px" })
            .setLngLat([urfCoord.lng, urfCoord.lat])
            .setHTML(`
              <div style="font-family:sans-serif;min-width:200px">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                  <span style="width:8px;height:8px;border-radius:50%;background:${modeColor};display:inline-block"></span>
                  <strong style="font-size:13px;color:#1e293b">${portName}</strong>
                </div>
                <div style="font-size:11px;color:${modeColor};font-weight:bold;margin-bottom:6px">${fmtUSD(port.fob)} · ${fmtKg(port.kg)}</div>
                ${topCountries.length > 0 ? `
                  <div style="font-size:10px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px">Países atendidos (${port.countries!.length})</div>
                  ${countriesHtml}
                ` : ""}
              </div>
            `).addTo(map);
        });
        el.addEventListener("mouseleave", () => { if (popup) { popup.remove(); popup = null; } });

        const marker = new maplibregl.Marker({ element: el }).setLngLat([urfCoord.lng, urfCoord.lat]).addTo(map);
        portMarkersRef.current.push(marker);
      });
    }

    // ─── TRADE ARCS WITH ANIMATION ───
    if (showArcs && filteredArcs.length > 0) {
      const maxArcKg = Math.max(...filteredArcs.map(a => a.kg), 1);
      const arcFeatures: any[] = [];
      filteredArcs.forEach(arc => {
        const cityCoord = coordsRef.current[arc.cityCode];
        const countryCoord = paisCoordsRef.current[arc.countryCode];
        if (!cityCoord || !countryCoord) return;

        const start: [number, number] = flowType === "import"
          ? [countryCoord.lng, countryCoord.lat] : [cityCoord.lng, cityCoord.lat];
        const end: [number, number] = flowType === "import"
          ? [cityCoord.lng, cityCoord.lat] : [countryCoord.lng, countryCoord.lat];

        const points = greatCircleArc(start[0], start[1], end[0], end[1], 48, 0.2 + (arc.kg / maxArcKg) * 0.3);
        const color = MODE_COLORS[arc.via || "default"] || MODE_COLORS.default;

        arcFeatures.push({
          type: "Feature",
          properties: { kg: arc.kg, fob: arc.fob, color, width: Math.max(1.5, (arc.kg / maxArcKg) * 8) },
          geometry: { type: "LineString", coordinates: points },
        });
      });

      if (arcFeatures.length > 0) {
        map.addSource(arcSourceId, {
          type: "geojson",
          data: { type: "FeatureCollection", features: arcFeatures },
        });

        // Solid background arc (thicker, more visible)
        map.addLayer({
          id: arcLayerId + "-bg",
          type: "line",
          source: arcSourceId,
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["get", "width"],
            "line-opacity": 0.15,
            "line-blur": 2,
          },
        });

        // Main arc layer
        map.addLayer({
          id: arcLayerId,
          type: "line",
          source: arcSourceId,
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["get", "width"],
            "line-opacity": 0.75,
            "line-blur": 0.5,
          },
        });

        // Animated dash layer (for flow effect) — only if not too many arcs
        if (arcFeatures.length <= 50) {
          map.addLayer({
            id: arcLayerId + "-dash",
            type: "line",
            source: arcSourceId,
            paint: {
              "line-color": ["get", "color"],
              "line-width": ["get", "width"],
              "line-opacity": 0.9,
              "line-dasharray": [0.001, 6],
            },
          });

          // Start dash animation
          const animate = () => {
            dashOffsetRef.current += 0.15;
            if (dashOffsetRef.current > 8) dashOffsetRef.current = 0;
            try {
              map.setPaintProperty(arcLayerId + "-dash", "line-dasharray", [0.001, 4, dashOffsetRef.current, 4 - dashOffsetRef.current]);
            } catch(e) { /* */ }
            animRef.current = requestAnimationFrame(animate);
          };
          if (animRef.current) cancelAnimationFrame(animRef.current);
          animRef.current = requestAnimationFrame(animate);
        }
      }
    }

    // Fit bounds
    if (hasBounds) {
      const selCity = selectedCity ? cities.find(c => c.cod_mun === selectedCity) : null;
      const selCountry = selectedCountry ? countries.find(c => c.cod_pais === selectedCountry) : null;
      if (selCity) {
        const coord = coordsRef.current[selCity.cod_mun];
        if (coord) {
          map.flyTo({ center: [coord.lng, coord.lat], zoom: 5.5, duration: 1200 });
          return;
        }
      }
      if (selCountry) {
        const coord = paisCoordsRef.current[selCountry.cod_pais];
        if (coord) {
          map.flyTo({ center: [coord.lng, coord.lat], zoom: 3.5, duration: 1200 });
          return;
        }
      }
      map.fitBounds(bounds, { padding: { top: 70, bottom: 70, left: 70, right: 70 }, maxZoom: 5, duration: 1200 });
    }
  }, [cities, countries, arcs, selectedCity, selectedCountry, onCityClick, onCountryClick, flowType, coordsLoaded, paisCoordsLoaded, urfCoordsLoaded, companyData, cityCountriesData, volumeThreshold, ports, showPorts, showCities, showCountries, showArcs]);

  useEffect(() => {
    if (mapReady) updateVisuals();
  }, [mapReady, updateVisuals]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // ─── DERIVED DATA FOR PANELS ───
  const selectedCityInfo = selectedCity ? cities.find(c => c.cod_mun === selectedCity) : null;
  const selectedCompanyInfo = selectedCity && companyData ? companyData[selectedCity] : null;
  const selectedCityCountries = selectedCity && cityCountriesData ? cityCountriesData[selectedCity] : null;
  const selectedCountryInfo = selectedCountry ? countries.find(c => c.cod_pais === selectedCountry) : null;
  const selectedCountryCities = selectedCountry
    ? cities.filter(c => arcs.some(a => a.countryCode === selectedCountry && a.cityCode === c.cod_mun && a.fob > 0))
    : [];

  const hasSelection = selectedCity || selectedCountry;

  // Compute colors at component level for JSX access
  const flowColor = flowType === "import" ? "#2563EB" : "#059669";
  const altColor = flowType === "import" ? "#059669" : "#2563EB";

  return (
    <div className="relative w-full" style={{ height: height || "500px" }}>
      <div
        ref={mapContainer}
        className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-lg"
        style={{ height: "100%", minHeight: "300px", background: "#0a1428" }}
      />

      {/* ─── OVERLAY CONTROLS ─── */}
      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md rounded-lg border border-slate-200 shadow-lg p-2 space-y-1">
        <button
          onClick={() => setShowCities(!showCities)}
          className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-semibold transition-all w-full",
            showCities ? "bg-[#D80E16]/10 text-[#D80E16]" : "bg-slate-50 text-slate-400")}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: flowColor }} />
          Cidades
        </button>
        <button
          onClick={() => setShowCountries(!showCountries)}
          className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-semibold transition-all w-full",
            showCountries ? "bg-[#D80E16]/10 text-[#D80E16]" : "bg-slate-50 text-slate-400")}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: altColor }} />
          Países
        </button>
        {ports.length > 0 && (
          <button
            onClick={() => setShowPorts(!showPorts)}
            className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-semibold transition-all w-full",
              showPorts ? "bg-[#D80E16]/10 text-[#D80E16]" : "bg-slate-50 text-slate-400")}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 18l1.5 3h15L21 18"/><path d="M4 18h16l-1-5H5z"/></svg>
            Portos
          </button>
        )}
        <button
          onClick={() => setShowArcs(!showArcs)}
          className={cn("flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-semibold transition-all w-full",
            showArcs ? "bg-[#D80E16]/10 text-[#D80E16]" : "bg-slate-50 text-slate-400")}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4"/></svg>
          Rotas
        </button>
      </div>

      {/* ─── LEGEND ─── */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md rounded-lg border border-slate-200 shadow-lg px-3 py-2 text-[10px] space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: flowColor }} />
          <span className="text-slate-600 font-medium">{flowType === "import" ? "Importação" : "Exportação"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 rounded" style={{ background: MODE_COLORS.maritimo }} />
          <span className="text-slate-500">{MODE_LABELS.maritimo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 rounded" style={{ background: MODE_COLORS.aereo }} />
          <span className="text-slate-500">{MODE_LABELS.aereo}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 rounded" style={{ background: MODE_COLORS.rodoviario }} />
          <span className="text-slate-500">{MODE_LABELS.rodoviario}</span>
        </div>
      </div>

      {/* ─── RESET BUTTON ─── */}
      {hasSelection && (
        <button
          onClick={() => { onCityClick(null); onCountryClick(null); }}
          className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md rounded-lg border border-slate-200 shadow-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#D80E16] hover:border-[#D80E16]/30 transition-all flex items-center gap-1.5"
          title="Mostrar tudo"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
          </svg>
          Ver tudo
        </button>
      )}

      {/* ─── INFO PANEL: CITY SELECTED ─── */}
      {selectedCity && selectedCityInfo && (
        <div className="absolute top-3 left-3 right-3 md:right-auto md:w-80 z-10 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-2xl overflow-hidden max-h-[calc(100%-24px)] flex flex-col">
          <div className="px-4 py-3 bg-gradient-to-r from-[#D80E16] to-[#b00c12] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              <span className="font-bold text-sm truncate">{selectedCityInfo.nome_mun}</span>
              <span className="text-xs text-white/70 font-medium">/ {selectedCityInfo.uf}</span>
            </div>
          </div>
          <div className="overflow-y-auto p-4 space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 flex-1">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">FOB</span>
                <span className="font-bold text-slate-800">{fmtUSD(selectedCityInfo.vl_fob)}</span>
              </div>
              {selectedCityInfo.kg_liquido != null && (
                <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 flex-1">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Peso</span>
                  <span className="font-bold text-slate-800">{fmtKg(selectedCityInfo.kg_liquido)}</span>
                </div>
              )}
            </div>
            {selectedCompanyInfo && selectedCompanyInfo.companyCount > 0 && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Empresas ({selectedCompanyInfo.companyCount})
                </h4>
                <div className="space-y-1">
                  {selectedCompanyInfo.topCompanies.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="flex-1 truncate font-medium text-slate-700">{c.nome}</span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{c.score}</span>
                      <span className={cn(
                        "text-[9px] font-bold px-1 py-0.5 rounded uppercase",
                        c.likely_flow === "import" ? "bg-blue-50 text-blue-600" :
                        c.likely_flow === "export" ? "bg-emerald-50 text-emerald-600" :
                        "bg-purple-50 text-purple-600"
                      )}>{c.likely_flow === "import" ? "IMP" : c.likely_flow === "export" ? "EXP" : "AMBOS"}</span>
                    </div>
                  ))}
                  {selectedCompanyInfo.companyCount > 5 && (
                    <p className="text-[10px] text-slate-400 text-center pt-0.5">+ {selectedCompanyInfo.companyCount - 5} empresas</p>
                  )}
                </div>
              </div>
            )}
            {selectedCityCountries && selectedCityCountries.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Países ({selectedCityCountries.length})
                </h4>
                <div className="space-y-1">
                  {selectedCityCountries.slice(0, 8).map((cc, i) => {
                    const iso2 = comexToIso2(cc.cod_pais);
                    const flagUrl = iso2 && iso2 !== "xx" ? `https://flagcdn.com/w20/${iso2}.png` : "";
                    return (
                    <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => { onCityClick(null); onCountryClick(cc.cod_pais); }}>
                      {flagUrl && <img src={flagUrl} alt="" width={14} height={10} className="rounded-sm shrink-0" loading="lazy" />}
                      <span className="flex-1 font-medium text-slate-700 truncate">{cc.nome_pais}</span>
                      <span className="text-[10px] text-slate-400">{fmtKg(cc.kg_liquido)}</span>
                      <span className="text-[10px] font-semibold text-slate-700">{fmtUSD(cc.vl_fob)}</span>
                    </div>
                    );
                  })}
                  {selectedCityCountries.length > 8 && (
                    <p className="text-[10px] text-slate-400 text-center">+ {selectedCityCountries.length - 8} países</p>
                  )}
                </div>
              </div>
            )}
            {!selectedCompanyInfo && (!selectedCityCountries || selectedCityCountries.length === 0) && (
              <p className="text-xs text-slate-400 italic text-center py-2">Sem dados detalhados para esta cidade no período.</p>
            )}
          </div>
        </div>
      )}

      {/* ─── INFO PANEL: COUNTRY SELECTED ─── */}
      {selectedCountry && selectedCountryInfo && !selectedCity && (
        <div className="absolute top-3 left-3 right-3 md:right-auto md:w-80 z-10 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-2xl overflow-hidden max-h-[calc(100%-24px)] flex flex-col">
          <div className="px-4 py-3 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {(() => {
                const iso2 = comexToIso2(selectedCountryInfo.cod_pais);
                return iso2 && iso2 !== "xx" ? <img src={`https://flagcdn.com/w40/${iso2}.png`} alt="" width={20} height={14} className="rounded-sm shrink-0" /> : null;
              })()}
              <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              <span className="font-bold text-sm truncate">{selectedCountryInfo.nome_pais}</span>
            </div>
          </div>
          <div className="overflow-y-auto p-4 space-y-3">
            <div className="flex items-center gap-3 text-xs">
              <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 flex-1">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">FOB</span>
                <span className="font-bold text-slate-800">{fmtUSD(selectedCountryInfo.vl_fob)}</span>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 flex-1">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Peso</span>
                <span className="font-bold text-slate-800">{fmtKg(selectedCountryInfo.kg_liquido)}</span>
              </div>
            </div>
            {selectedCountryCities.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Cidades de {flowType === "import" ? "origem" : "destino"} ({selectedCountryCities.length})
                </h4>
                <div className="space-y-1">
                  {selectedCountryCities.slice(0, 10).map((c, i) => {
                    const arc = arcs.find(a => a.cityCode === c.cod_mun && a.countryCode === selectedCountry);
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="flex-1 font-medium text-slate-700">{c.nome_mun}/{c.uf}</span>
                        {arc && <span className="text-[10px] text-slate-400">{fmtKg(arc.kg)}</span>}
                        {arc && <span className="text-[10px] font-semibold text-slate-700">{fmtUSD(arc.fob)}</span>}
                      </div>
                    );
                  })}
                  {selectedCountryCities.length > 10 && (
                    <p className="text-[10px] text-slate-400 text-center">+ {selectedCountryCities.length - 10} cidades</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export const TradeGlobe = memo(TradeGlobeInner);
