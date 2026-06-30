import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useSeo } from "@/hooks/use-seo";
import { SiteLayout } from "@/components/SiteLayout";
import { SplashScreen } from "@/components/SplashScreen";
import { Ship, Plane, Navigation, Search, X, Loader2, Locate } from "lucide-react";

/* ── Types ── */
interface Vessel { mmsi: number; name: string; lat: number; lng: number; speed: number; heading: number; destination: string; eta: string; callsign: string; shipType: number; }
interface CargoFlight { callsign: string; lat: number; lng: number; alt: number; heading: number; speed_knots: number | null; model: string; icao24: string; registration: string; }
type TrackFeature = Vessel | CargoFlight;

export default function TrackTracePage() {
  useSeo({
    title: "Track & Trace — Navios e Aviões ao Vivo",
    description: "Rastreamento em tempo real de navios de carga e aviões cargueiros com dados AIS e ADS-B.",
    keywords: "track trace, navios ao vivo, aviões carga, AIS, ADS-B",
    canonical: "https://www.tradexa.com.br/track-trace",
  });

  const [showSplash, setShowSplash] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [flights, setFlights] = useState<CargoFlight[]>([]);
  const [totalV, setTotalV] = useState(0);
  const [totalF, setTotalF] = useState(0);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"all"|"vessels"|"flights">("all");
  const [selected, setSelected] = useState<TrackFeature|null>(null);
  const [selType, setSelType] = useState<"vessel"|"flight">("vessel");

  // ── Init map ──
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-30, -10],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 18,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    map.on("load", () => {
      // ── Canvas-drawn icons (36×36, same style as Supply Chain) ──
      function drawIcon(key: string, color: string) {
        const c = document.createElement("canvas");
        c.width = 36; c.height = 36;
        const ctx = c.getContext("2d")!;
        const cx = 18, cy = 18, r = 15;

        // Colored circle background
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // White drawing
        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (key === "ship") {
          // Ship hull + masts
          ctx.beginPath();
          ctx.moveTo(cx - 9, cy + 5); ctx.lineTo(cx - 6, cy - 3); ctx.lineTo(cx + 6, cy - 3); ctx.lineTo(cx + 9, cy + 5); ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(cx - 3, cy - 3); ctx.lineTo(cx - 3, cy - 9);
          ctx.moveTo(cx + 3, cy - 3); ctx.lineTo(cx + 3, cy - 8);
          ctx.moveTo(cx - 4, cy - 9); ctx.lineTo(cx + 4, cy - 8);
          ctx.stroke();
          ctx.fillRect(cx - 3, cy - 10, 6, 3);
        } else {
          // Cargo plane
          ctx.beginPath();
          ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 5);
          ctx.moveTo(cx - 8, cy - 1); ctx.quadraticCurveTo(cx, cy - 4, cx + 8, cy - 1);
          ctx.moveTo(cx, cy - 6); ctx.lineTo(cx + 4, cy - 3); ctx.lineTo(cx, cy - 1);
          ctx.stroke();
          ctx.fillRect(cx - 4, cy + 3, 8, 5);
          ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(cx - 4, cy + 3, 8, 5);
          ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.8;
        }

        if (!map.hasImage(`${key}-icon`)) {
          map.addImage(`${key}-icon`, { width: 36, height: 36, data: new Uint8Array(ctx.getImageData(0, 0, 36, 36).data) });
        }
      }

      drawIcon("ship", "#0891b2");
      drawIcon("plane", "#D80E16");

      // ── Vessels source + layer ──
      map.addSource("vessels", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "vessels-layer", type: "symbol", source: "vessels",
        layout: {
          "icon-image": "ship-icon",
          "icon-size": 0.45,
          "icon-allow-overlap": true,
          "icon-rotate": ["get", "heading"],
          "icon-rotation-alignment": "map",
        },
      });

      // ── Flights source + layer ──
      map.addSource("flights", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "flights-layer", type: "symbol", source: "flights",
        layout: {
          "icon-image": "plane-icon",
          "icon-size": 0.45,
          "icon-allow-overlap": true,
          "icon-rotate": ["get", "heading"],
          "icon-rotation-alignment": "map",
        },
      });

      // Click handlers — premium slow flyTo
      const flyOpts = (c: [number, number], minZoom: number) => ({
        center: c,
        zoom: Math.max(map.getZoom(), minZoom),
        duration: 3000,
        essential: true,
      });

      map.on("click", "vessels-layer", (e: any) => {
        const p = e.features?.[0]?.properties, c = (e.features?.[0]?.geometry as any)?.coordinates;
        if (p && c) { setSelected({ mmsi: p.mmsi, name: p.name, lat: c[1], lng: c[0], speed: p.speed, heading: p.heading, destination: p.destination, eta: p.eta, callsign: p.callsign, shipType: p.shipType } as Vessel); setSelType("vessel"); map.flyTo(flyOpts(c, 7)); }
      });
      map.on("click", "flights-layer", (e: any) => {
        const p = e.features?.[0]?.properties, c = (e.features?.[0]?.geometry as any)?.coordinates;
        if (p && c) { setSelected({ callsign: p.callsign, lat: c[1], lng: c[0], alt: p.alt, heading: p.heading, speed_knots: p.speed_knots, model: p.model, icao24: p.icao24, registration: p.registration } as CargoFlight); setSelType("flight"); map.flyTo(flyOpts(c, 8)); }
      });
      ["vessels-layer", "flights-layer"].forEach(l => {
        map.on("mouseenter", l, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", l, () => { map.getCanvas().style.cursor = ""; });
      });

      mapRef.current = map;
      setMapReady(true);
    });

    map.on("error", (e: any) => console.error("TrackTrace map error:", e.error?.message || e));

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Fetch vessels ──
  useEffect(() => {
    let m = true;
    const fn = () => {
      fetch("/api/maritime-live").then(r => r.json()).then(d => {
        if (!m) return;
        const s = (d.ships || []).filter((v: any) => v.lat && v.lng && v.shipType >= 70 && v.shipType < 90);
        setVessels(s); setTotalV(s.length);
      }).catch(() => {});
    };
    fn(); const i = setInterval(fn, 30000);
    return () => { m = false; clearInterval(i); };
  }, []);

  // ── Fetch flights ──
  useEffect(() => {
    let m = true;
    const fn = () => {
      fetch("/api/cargo-flights").then(r => r.json()).then(d => {
        if (!m) return; setFlights(d.flights || []); setTotalF(d.total || 0);
      }).catch(() => {});
    };
    fn(); const i = setInterval(fn, 15000);
    return () => { m = false; clearInterval(i); };
  }, []);

  // ── Update GeoJSON ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    let fv = viewMode === "flights" ? [] : vessels;
    let ff = viewMode === "vessels" ? [] : flights;
    if (search.trim()) {
      const q = search.toLowerCase();
      fv = fv.filter(v => v.name.toLowerCase().includes(q) || v.callsign.toLowerCase().includes(q));
      ff = ff.filter(f => f.callsign.toLowerCase().includes(q) || f.icao24.toLowerCase().includes(q));
    }

    const vsrc = map.getSource("vessels") as maplibregl.GeoJSONSource;
    if (vsrc) vsrc.setData({ type: "FeatureCollection", features: fv.map(v => ({ type: "Feature", geometry: { type: "Point", coordinates: [v.lng, v.lat] }, properties: { mmsi: v.mmsi, name: (v.name || "").trim(), speed: v.speed, heading: v.heading, destination: (v.destination || "").trim(), eta: v.eta || "", callsign: v.callsign || "", shipType: v.shipType } })) });

    const fsrc = map.getSource("flights") as maplibregl.GeoJSONSource;
    if (fsrc) fsrc.setData({ type: "FeatureCollection", features: ff.map(f => ({ type: "Feature", geometry: { type: "Point", coordinates: [f.lng, f.lat] }, properties: { callsign: f.callsign, alt: f.alt, heading: f.heading, speed_knots: f.speed_knots, model: f.model, icao24: f.icao24, registration: f.registration } })) });
  }, [vessels, flights, search, viewMode, mapReady]);

  // ── Detail panel ──
  const detail = selected ? (
    <div className="bg-white rounded-t-xl shadow-2xl border border-gray-200 p-4 max-h-[35vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {selType === "vessel" ? <>
            <Ship className="w-5 h-5 text-cyan-600" /><h3 className="font-bold text-lg truncate">{((selected as Vessel).name || "").trim()}</h3></> : <>
            <Plane className="w-5 h-5 text-red-600" /><h3 className="font-bold text-lg">{(selected as CargoFlight).callsign}</h3></>
          }
        </div>
        <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
      </div>
      {selType === "vessel" ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Tipo</span><p className="font-medium">Carga</p></div>
          <div><span className="text-gray-500">MMSI</span><p className="font-mono text-xs">{(selected as Vessel).mmsi}</p></div>
          <div><span className="text-gray-500">Velocidade</span><p className="font-medium">{(selected as Vessel).speed} knots</p></div>
          <div><span className="text-gray-500">Direção</span><p className="font-medium">{(selected as Vessel).heading}°</p></div>
          <div className="col-span-2"><span className="text-gray-500">Destino</span><p className="font-medium">{((selected as Vessel).destination || "").trim() || "Não informado"}</p></div>
          <div className="col-span-2"><span className="text-gray-500">Previsão</span><p className="font-medium">{((selected as Vessel).eta || "").trim() || "Não informado"}</p></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Modelo</span><p className="font-medium">{(selected as CargoFlight).model || "N/A"}</p></div>
          <div><span className="text-gray-500">Altitude</span><p className="font-medium">{(selected as CargoFlight).alt ? `${((selected as CargoFlight).alt / 1000).toFixed(0)} km` : "Solo"}</p></div>
          <div><span className="text-gray-500">Velocidade</span><p className="font-medium">{(selected as CargoFlight).speed_knots ? `${(selected as CargoFlight).speed_knots} knots` : "—"}</p></div>
          <div><span className="text-gray-500">Direção</span><p className="font-medium">{(selected as CargoFlight).heading}°</p></div>
          <div><span className="text-gray-500">ICAO24</span><p className="font-mono text-xs">{(selected as CargoFlight).icao24}</p></div>
          <div><span className="text-gray-500">Registro</span><p className="font-mono text-xs">{(selected as CargoFlight).registration}</p></div>
        </div>
      )}
    </div>
  ) : null;

  return (
    <SiteLayout noFooter noBreadcrumbs>
      <h1 className="sr-only">Track and Trace — Rastreamento de Navios e Aviões</h1>
      <div className="sr-only">
        <h2>Sobre o Track and Trace</h2>
        <p>O módulo Track and Trace da TRADEXA oferece rastreamento em tempo real de navios de carga e aviões cargueiros em todo o mundo. Utilizando dados de satélites AIS para embarcações e receptores ADS-B para aeronaves, a ferramenta permite localizar qualquer navio por nome, callsign ou MMSI, e qualquer voo cargueiro por callsign ou código ICAO24. Você pode alternar entre visualização de navios, aviões ou ambos simultaneamente, com informações detalhadas de cada unidade: velocidade, rumo, destino, ETA e tipo de embarcação ou modelo de aeronave. O mapa é construído sobre MapLibre GL com tiles vetoriais de alta performance, oferecendo zoom suave e transições animadas. Perfeito para operadores logísticos que precisam monitorar cargas em trânsito, importadores acompanhando seus pedidos, e analistas de comércio exterior que desejam cruzar dados de rastreamento com informações de mercado. A cobertura é global, com maior densidade de dados nas principais rotas marítimas e corredores aéreos de carga, incluindo Atlântico Norte, Pacífico, Canal de Suez e Estreito de Malaca.</p>
      </div>

      {/* Cinematic splash */}
      {showSplash && (
        <SplashScreen
          cinematic
          subtitle="Track & Trace"
          stages={["Conectando satélites AIS...", "Rastreando navios...", "Monitorando voos cargueiros...", "Pronto"]}
          duration={3000}
          onDone={() => setShowSplash(false)}
        />
      )}

      <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-2 flex-wrap z-20 shrink-0">
          <Navigation className="w-5 h-5 text-red-600 shrink-0" />

          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
            {(["all", "vessels", "flights"] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-2.5 py-1.5 font-medium transition-colors ${viewMode === m ? (m === "vessels" ? "bg-cyan-600 text-white" : "bg-red-600 text-white") : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >{m === "all" ? "Tudo" : m === "vessels" ? "Navios" : "Aviões"}</button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[120px] max-w-[260px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && search.trim() && mapRef.current) {
                  const q = search.toLowerCase();
                  const vMatch = vessels.find(v => v.name.toLowerCase().includes(q) || v.callsign.toLowerCase().includes(q));
                  const fMatch = flights.find(f => f.callsign.toLowerCase().includes(q) || f.icao24.toLowerCase().includes(q));
                  if (vMatch) {
                    mapRef.current.flyTo({ center: [vMatch.lng, vMatch.lat], zoom: 10, duration: 3500, essential: true });
                    setSelected(vMatch); setSelType("vessel");
                  } else if (fMatch) {
                    mapRef.current.flyTo({ center: [fMatch.lng, fMatch.lat], zoom: 10, duration: 3500, essential: true });
                    setSelected(fMatch as any); setSelType("flight");
                  }
                }
              }}
              placeholder="Buscar navio ou voo..." className="w-full pl-7 pr-16 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500" />
            {search && <button onClick={() => setSearch("")} className="absolute right-8 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-gray-400" /></button>}
            <button
              disabled={!search.trim()}
              onClick={() => {
                if (!search.trim() || !mapRef.current) return;
                const q = search.toLowerCase();
                const vMatch = vessels.find(v => v.name.toLowerCase().includes(q) || v.callsign.toLowerCase().includes(q));
                const fMatch = flights.find(f => f.callsign.toLowerCase().includes(q) || f.icao24.toLowerCase().includes(q));
                if (vMatch) {
                  mapRef.current.flyTo({ center: [vMatch.lng, vMatch.lat], zoom: 10, duration: 3500, essential: true });
                  setSelected(vMatch); setSelType("vessel");
                } else if (fMatch) {
                  mapRef.current.flyTo({ center: [fMatch.lng, fMatch.lat], zoom: 10, duration: 3500, essential: true });
                  setSelected(fMatch as any); setSelType("flight");
                }
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-red-50 disabled:opacity-30 transition-colors"
              title="Localizar (Enter)"
            >
              <Locate className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>

          <span className="text-xs text-gray-500 whitespace-nowrap">{totalV} navios | {totalF} aviões</span>
        </div>

        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: 0 }}>
          {!mapReady && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
              <div className="bg-white rounded-xl shadow-xl p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                <span className="text-sm font-medium">Carregando mapa...</span>
              </div>
            </div>
          )}
          <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

          {mapReady && (
            <div className="absolute bottom-24 md:bottom-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg shadow border border-gray-200 px-3 py-2 text-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500 border-2 border-white shadow-sm" />
                <span>Navio de carga</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm" />
                <span>Avião</span>
              </div>
            </div>
          )}

          {detail && <div className="absolute bottom-16 md:bottom-4 left-0 right-0 z-20 mx-3">{detail}</div>}
        </div>
      </div>
    </SiteLayout>
  );
}
