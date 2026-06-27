"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/use-auth";
import { SiteLayout } from "@/components/SiteLayout";
import { SplashScreen } from "@/components/SplashScreen";
import { Mail, X, Ship, Anchor, Calendar, ArrowRight, Send, User, Phone, Package, Hash, TrendingUp, Loader2, AlertCircle, FileText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════════════════════════
   MARITIME FREIGHT MAP — Mapa 3D de rotas marítimas
   ═══════════════════════════════════════════════════════════════ */

interface FreightQuote {
  id: string; so_number: string; pol: string; pod: string;
  container_type: string; carrier: string; sell_price_usd: number;
  etd: string | null; eta: string | null; transit_days: number;
  vessel_name: string | null; notes: string | null;
}

interface GroupedRate {
  so_number: string; pol: string; pod: string;
  origin_name: string; dest_name: string;
  price_20gp: number | null; price_40hc: number | null;
  carrier: string; transit_days: number;
  etd: string | null; eta: string | null;
  vessel_name: string | null; notes: string | null;
}

interface RouteLine {
  id: string; pol: string; pod: string;
  path: [number, number][]; color: string;
  rates: GroupedRate[]; corridor: string;
}

interface QuoteFormData {
  name: string; email: string; phone: string;
  origin: string; destination: string;
  cargoType: string; cargoValue: string;
  containerType: string; ncmHs: string;
  notes: string;
}

// ─── Constants ─────────────────────────────────────────────────────
const PORT_NAMES: Record<string, string> = {
  INNHA: "Nhava Sheva", INMUN: "Mundra",
  CNSHA: "Shanghai", CNSZX: "Shenzhen", CNNGB: "Ningbo",
  CNTAO: "Qingdao", CNXMN: "Xiamen",
  VNSGN: "Ho Chi Minh", VNHPH: "Hai Phong",
  BRPEE: "Pecém", BRRIG: "Rio Grande", BRRIO: "Rio de Janeiro",
  BRSSZ: "Santos", BRITJ: "Itajaí", BRPRN: "Paranaguá",
  USNYC: "New York", USPEV: "Port Everglades", USJAX: "Jacksonville",
};

const PORT_COORDS: Record<string, [number, number]> = {
  INNHA: [18.95, 72.95], INMUN: [22.78, 69.68],
  CNSHA: [31.2304, 121.4737], CNSZX: [22.5431, 114.0579],
  CNNGB: [29.8683, 121.5440], CNTAO: [36.0671, 120.3826],
  CNXMN: [24.4798, 118.0894],
  VNSGN: [10.8231, 106.6297], VNHPH: [20.8600, 106.6815],
  BRPEE: [-3.5308, -38.8000], BRRIG: [-32.0350, -52.1076],
  BRRIO: [-22.9068, -43.1729], BRSSZ: [-23.9608, -46.3331],
  BRITJ: [-26.9056, -48.6618], BRPRN: [-25.5205, -48.5095],
  USNYC: [40.7128, -74.0060], USPEV: [26.1224, -80.1373],
  USJAX: [30.3322, -81.6557],
};

// Baseline waypoints (all in open ocean)
const BASE_WAYPOINTS: Record<string, [number, number][]> = {
  "IN-BR": [[10,65],[-5,55],[-20,55],[-35,20],[-25,-5],[-15,-25]],
  "CN-BR": [[22,118],[10,108],[1,104],[-6,80],[-20,55],[-35,20],[-25,-5],[-15,-25]],
  "VN-BR": [[10,108],[1,104],[-6,80],[-20,55],[-35,20],[-25,-5],[-15,-25]],
  "BR-US": [[-22,-41],[-18,-37],[-8,-33],[0,-36],[12,-48],[22,-60],[30,-72]],
  "US-BR": [[30,-72],[22,-60],[12,-48],[0,-36],[-8,-33],[-18,-37],[-22,-41]],
};

const CORRIDOR_COLORS: Record<string, string> = {
  "CN-BR": "#D80E16", "IN-BR": "#FF9933", "VN-BR": "#00A651",
  "BR-US": "#1e40af", "US-BR": "#1e40af",
};

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

// Price margin: 60% sobre o valor base
const PRICE_MARGIN = 1.60;

function getPortName(c: string) { return PORT_NAMES[c] || c; }
function getCorridor(pol: string, pod: string): string {
  const k = `${pol.slice(0, 2)}-${pod.slice(0, 2)}`;
  return k in CORRIDOR_COLORS ? k : "other";
}

// Dynamic path builder — filters waypoints to avoid backtracking
function buildPath(pol: string, pod: string): [number, number][] {
  const origin = PORT_COORDS[pol], dest = PORT_COORDS[pod];
  if (!origin || !dest) return [];
  const corridor = getCorridor(pol, pod);
  const allWp = BASE_WAYPOINTS[corridor];
  if (!allWp) return [origin, dest];

  let filtered: [number, number][];
  if (corridor === "BR-US") {
    filtered = allWp.filter(wp => wp[0] >= origin[0] - 0.5);
  } else if (corridor === "US-BR") {
    filtered = allWp.filter(wp => wp[0] <= origin[0] + 0.5);
  } else {
    filtered = allWp;
  }

  return [origin, ...filtered, dest];
}

// Apply WCI + margin to a price
function applyPricing(basePrice: number | null, wciMultiplier: number): number | null {
  if (basePrice == null) return null;
  return Math.round(basePrice * wciMultiplier * PRICE_MARGIN);
}

function fmt(v: number | null | undefined) { return v != null ? `US$ ${v.toLocaleString("en-US")}` : "—"; }
function fmtDays(v: number | null) { return v != null ? `${v} dias` : "—"; }

// ─── Despachante Aduaneiro EUA — custos marítimos ───
const USA_CUSTOMS_COSTS = {
  customsClearance: 125,
  handlingFee: 55,
  isf: 35,
  terminalFeesMin: 140,
  terminalFeesMax: 492,
  mpfRate: 0.3464,
  mpfMin: 33.58,
  mpfMax: 651.50,
  hmfRate: 0.125,
  sebRate: 4.50,
  sebMin: 60,
  onCarriageMiami: 490,
  onCarriagePortEverglades: 775,
  chassisPerDay: 55,
};
function isUSPort(code: string) { return code?.startsWith("US"); }
function despachanteTotal(code: string) {
  if (!isUSPort(code)) return null;
  const base = USA_CUSTOMS_COSTS.customsClearance + USA_CUSTOMS_COSTS.handlingFee + USA_CUSTOMS_COSTS.isf;
  return base;
}

// ═══════════════════════════════════════════════════════════════════
export default function MaritimeFreightMapPage() {
  const { profile } = useAuth();
  const isLoggedIn = !!profile;
  useSeo({
    title: "Mapa de Frete Marítimo — Rotas e Cotações Interativas",
    description: "Mapa 3D de rotas de frete marítimo com preços WCI. Compare cotações entre portos, veja navios em tempo real e solicite preços atualizados.",
    canonical: "https://www.tradexa.com.br/maritime-freight-map",
  });

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const shipsRef = useRef<{ progress: number }[]>([]);
  const animFrameRef = useRef<number>(0);
  const routesRef = useRef<RouteLine[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const initRef = useRef(false);

  const [routes, setRoutes] = useState<RouteLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteLine | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<"" | "20GP" | "40HC">("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteRate, setQuoteRate] = useState<GroupedRate | null>(null);
  const [sending, setSending] = useState(false);
  const [wciData, setWciData] = useState<{ wci: number; trend: string } | null>(null);
  const [formData, setFormData] = useState<QuoteFormData>({
    name: "", email: "", phone: "", origin: "", destination: "",
    cargoType: "", cargoValue: "", containerType: "20GP", ncmHs: "", notes: "",
  });

  useEffect(() => { const t = setTimeout(() => setShowSplash(false), 2500); return () => clearTimeout(t); }, []);

  // ─── Fetch WCI ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/wci")
      .then(r => r.json())
      .then(d => setWciData({ wci: d.wci, trend: d.trend }))
      .catch(() => setWciData({ wci: 4166, trend: "stable" }));
  }, []);

  // ─── Load data ──────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from("freight_quotes").select("*").order("so_number");
        if (error) { console.error(error); setLoading(false); return; }
        if (!data?.length) { setLoading(false); return; }

        const grouped = new Map<string, FreightQuote[]>();
        (data as FreightQuote[]).forEach(r => {
          const a = grouped.get(r.so_number) || []; a.push(r); grouped.set(r.so_number, a);
        });

        const allRates: GroupedRate[] = Array.from(grouped.entries()).map(([so, rows]) => ({
          so_number: so, pol: rows[0].pol, pod: rows[0].pod,
          origin_name: getPortName(rows[0].pol), dest_name: getPortName(rows[0].pod),
          price_20gp: rows.find(r => r.container_type === "20GP")?.sell_price_usd ?? null,
          price_40hc: rows.find(r => r.container_type === "40HC")?.sell_price_usd ?? null,
          carrier: rows[0].carrier || "—", transit_days: rows[0].transit_days,
          etd: rows[0].etd, eta: rows[0].eta, vessel_name: rows[0].vessel_name, notes: rows[0].notes,
        }));

        const routeMap = new Map<string, RouteLine>();
        allRates.forEach(rate => {
          const corr = getCorridor(rate.pol, rate.pod);
          if (corr === "BR-BR" || corr === "other") return;
          const key = `${rate.pol}-${rate.pod}`;
          if (!routeMap.has(key)) {
            routeMap.set(key, { id: key, pol: rate.pol, pod: rate.pod, path: buildPath(rate.pol, rate.pod), color: CORRIDOR_COLORS[corr] || "#64748b", rates: [], corridor: corr });
          }
          routeMap.get(key)!.rates.push(rate);
        });

        const routeList = Array.from(routeMap.values());
        routesRef.current = routeList;
        setRoutes(routeList);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const portRoutes = useMemo(() => {
    const map = new Map<string, RouteLine[]>();
    routes.forEach(r => {
      for (const code of [r.pol, r.pod]) {
        if (!map.has(code)) map.set(code, []);
        map.get(code)!.push(r);
      }
    });
    return map;
  }, [routes]);

  // ─── Init map ──────────────────────────────────────────────────
  useEffect(() => {
    if (loading || !mapContainer.current || initRef.current) return;
    initRef.current = true;

    const map = new maplibregl.Map({
      container: mapContainer.current, style: MAP_STYLE,
      center: [-25, -10], zoom: 2.5, minZoom: 1.5, maxZoom: 12,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl(), "bottom-right");
    mapRef.current = map;

    map.on("load", () => {
      try {
        (map as any).setProjection({ type: "globe" });
        (map as any).setSky({ "sky-color": "#04040A", "sky-horizon-blend": 0.5, "horizon-color": "#0a0a1a", "horizon-fog-blend": 0.3, "fog-color": "#04040A", "fog-ground-blend": 0.9 });
        map.easeTo({ pitch: 25, duration: 1200 });
      } catch (e) {}

      // Port icon
      const pc = document.createElement("canvas"); pc.width = 24; pc.height = 24;
      const px = pc.getContext("2d")!;
      px.beginPath(); px.arc(12, 12, 9, 0, Math.PI * 2); px.fillStyle = "#fff"; px.fill(); px.strokeStyle = "#D80E16"; px.lineWidth = 2.5; px.stroke();
      px.beginPath(); px.arc(12, 12, 4, 0, Math.PI * 2); px.fillStyle = "#D80E16"; px.fill();
      if (!map.hasImage("port-icon")) map.addImage("port-icon", { width: 24, height: 24, data: new Uint8Array(px.getImageData(0, 0, 24, 24).data) });

      const seen = new Set<string>(); const feats: any[] = [];
      routesRef.current.forEach(r => {
        for (const code of [r.pol, r.pod]) {
          if (seen.has(code)) continue; seen.add(code);
          const c = PORT_COORDS[code]; if (!c) continue;
          feats.push({ type: "Feature", geometry: { type: "Point", coordinates: [c[1], c[0]] }, properties: { name: getPortName(code), code } });
        }
      });
      map.addSource("ports-src", { type: "geojson", data: { type: "FeatureCollection", features: feats } });
      map.addLayer({
        id: "ports-layer", type: "symbol", source: "ports-src",
        layout: { "icon-image": "port-icon", "icon-size": 0.7, "icon-allow-overlap": true, "text-field": ["get", "name"], "text-offset": [0, 1.8], "text-anchor": "top", "text-size": 10 },
        paint: { "text-color": "#1e293b", "text-halo-color": "#fff", "text-halo-width": 2 },
      });
      map.on("mouseenter", "ports-layer", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "ports-layer", () => { map.getCanvas().style.cursor = ""; });
      map.on("click", "ports-layer", (e: any) => {
        const p = e.features?.[0]?.properties;
        if (!p) return;
        popupRef.current?.remove();
        setActiveRoute(null);
        setSelectedPort(p.code);
      });

      // Ship icon
      const sc = document.createElement("canvas"); sc.width = 24; sc.height = 24;
      const sx = sc.getContext("2d")!;
      sx.fillStyle = "#D80E16";
      sx.beginPath(); sx.moveTo(2, 14); sx.lineTo(20, 14); sx.lineTo(22, 18); sx.lineTo(0, 18); sx.closePath(); sx.fill();
      sx.beginPath(); sx.moveTo(20, 14); sx.lineTo(22, 18); sx.lineTo(24, 16); sx.closePath(); sx.fill();
      sx.fillStyle = "#fff"; sx.fillRect(7, 9, 5, 5);
      sx.fillStyle = "#D80E16"; sx.fillRect(8, 10, 3, 3);
      if (!map.hasImage("freight-ship")) map.addImage("freight-ship", { width: 24, height: 24, data: new Uint8Array(sx.getImageData(0, 0, 24, 24).data) });

      map.addSource("active-route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } } });
      map.addLayer({ id: "active-glow", type: "line", source: "active-route", paint: { "line-color": ["get","color"], "line-width": ["interpolate",["linear"],["zoom"],2,5,6,10], "line-opacity": 0.12, "line-blur": 1 } });
      map.addLayer({ id: "active-line", type: "line", source: "active-route", paint: { "line-color": ["get","color"], "line-width": ["interpolate",["linear"],["zoom"],2,2.5,6,4.5], "line-opacity": 0.7 } });
      map.addSource("ships-src", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "ships-layer", type: "symbol", source: "ships-src", layout: { "icon-image": "freight-ship", "icon-size": 0.5, "icon-rotate": ["get","heading"], "icon-rotation-alignment": "map", "icon-allow-overlap": true, "icon-ignore-placement": true } });
    });

    return () => { cancelAnimationFrame(animFrameRef.current); popupRef.current?.remove(); map.remove(); mapRef.current = null; };
  }, [loading, routes]);

  // ─── Update ports when routes load after map is ready ──────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || routes.length === 0) return;
    // Update port features if the source exists
    const src = map.getSource("ports-src") as maplibregl.GeoJSONSource;
    if (!src) return;
    const seen = new Set<string>(); const feats: any[] = [];
    routes.forEach(r => {
      for (const code of [r.pol, r.pod]) {
        if (seen.has(code)) continue; seen.add(code);
        const c = PORT_COORDS[code]; if (!c) continue;
        feats.push({ type: "Feature", geometry: { type: "Point", coordinates: [c[1], c[0]] }, properties: { name: getPortName(code), code } });
      }
    });
    src.setData({ type: "FeatureCollection", features: feats });
  }, [routes]);

  // ─── Draw active route ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    cancelAnimationFrame(animFrameRef.current);
    if (!activeRoute || activeRoute.path.length < 2) {
      (map.getSource("active-route") as maplibregl.GeoJSONSource)?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } });
      (map.getSource("ships-src") as maplibregl.GeoJSONSource)?.setData({ type: "FeatureCollection", features: [] });
      return;
    }
    const coords = activeRoute.path.map(([lat, lng]) => [lng, lat]);
    (map.getSource("active-route") as maplibregl.GeoJSONSource)?.setData({ type: "Feature", properties: { color: activeRoute.color }, geometry: { type: "LineString", coordinates: coords } });
    const bounds = new maplibregl.LngLatBounds();
    activeRoute.path.forEach(([lat, lng]) => bounds.extend([lng, lat]));
    map.fitBounds(bounds, { padding: 80, duration: 1200, maxZoom: 8 });

    shipsRef.current = [{ progress: 0 }, { progress: 0.5 }];
    let lastT = performance.now();
    function anim(now: number) {
      const dt = Math.min((now - lastT) / 1000, 0.1); lastT = now;
      const feats: any[] = [];
      shipsRef.current = shipsRef.current.map(s => {
        let prog = s.progress + 0.04 * dt; if (prog > 1) prog -= 1;
        const path = activeRoute!.path;
        const segs = path.length - 1;
        const sf = prog * segs, si = Math.min(Math.floor(sf), segs - 1), st = sf - si;
        const lat = path[si][0] + (path[si+1][0] - path[si][0]) * st;
        const lng = path[si][1] + (path[si+1][1] - path[si][1]) * st;
        const hdg = Math.atan2(path[si+1][1]-path[si][1], path[si+1][0]-path[si][0]) * (180/Math.PI);
        feats.push({ type: "Feature", geometry: { type: "Point", coordinates: [lng, lat] }, properties: { heading: hdg } });
        return { ...s, progress: prog };
      });
      (map.getSource("ships-src") as maplibregl.GeoJSONSource)?.setData({ type: "FeatureCollection", features: feats });
      animFrameRef.current = requestAnimationFrame(anim);
    }
    animFrameRef.current = requestAnimationFrame(anim);
  }, [activeRoute]);

  const portRouteList = useMemo(() => {
    if (!selectedPort) return [];
    const all = portRoutes.get(selectedPort) || [];
    const seen = new Set<string>();
    return all.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
  }, [selectedPort, portRoutes]);

  // Get WCI-adjusted prices for display
  const WCI_BASE = 3200;
  const wciMult = wciData ? wciData.wci / WCI_BASE : 1.0;

  function displayPrice(rate: GroupedRate, type: "20GP" | "40HC"): number | null {
    const base = type === "20GP" ? rate.price_20gp : rate.price_40hc;
    return applyPricing(base, wciMult);
  }

  // ─── Open quote form ───────────────────────────────────────────
  function openQuoteForm(rate: GroupedRate) {
    setQuoteRate(rate);
    setFormData({
      name: "", email: "", phone: "",
      origin: rate.origin_name, destination: rate.dest_name,
      cargoType: "", cargoValue: "",
      containerType: rate.price_20gp != null ? "20GP" : "40HC",
      ncmHs: "", notes: "",
    });
    setShowQuoteForm(true);
  }

  async function submitQuote() {
    const r = quoteRate;
    if (!r) return;
    const f = formData;
    setSending(true);

    try {
      const res = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.name, email: f.email, phone: f.phone,
          origin: f.origin, destination: f.destination,
          cargoType: f.cargoType, cargoValue: f.cargoValue,
          containerType: f.containerType, ncmHs: f.ncmHs,
          notes: f.notes,
          referencePrice: `20' GP: ${fmt(displayPrice(r, "20GP"))} / 40' HC: ${fmt(displayPrice(r, "40HC"))}`,
          carrier: r.carrier,
          transitDays: `${r.transit_days} dias`,
        }),
      });

      if (res.ok) {
        toast.success("Cotação enviada com sucesso! Responderemos em até 24h.");
        setShowQuoteForm(false);
      } else {
        // Fallback: open mailto
        const subject = encodeURIComponent(`Cotação de Frete — ${f.origin} → ${f.destination}`);
        const body = encodeURIComponent(
          `SOLICITAÇÃO DE COTAÇÃO DE FRETE MARÍTIMO\n` +
          `═══════════════════════════════════════\n\n` +
          `DADOS DO SOLICITANTE\n` +
          `• Nome: ${f.name}\n` +
          `• Email: ${f.email}\n` +
          `• Telefone: ${f.phone}\n\n` +
          `DADOS DA CARGA\n` +
          `• Origem: ${f.origin}\n` +
          `• Destino: ${f.destination}\n` +
          `• Tipo de Carga: ${f.cargoType}\n` +
          `• Valor da Carga: ${f.cargoValue}\n` +
          `• Container: ${f.containerType}\n` +
          `• Código NCM/HS: ${f.ncmHs}\n\n` +
          `OBSERVAÇÕES\n${f.notes || "Nenhuma"}\n\n` +
          `Atenciosamente,\n${f.name}`
        );
        window.location.href = `mailto:freight@tradexa.com.br?subject=${subject}&body=${body}`;
        toast.info("Abrindo seu cliente de email...");
        setShowQuoteForm(false);
      }
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const wciTrendIcon = wciData?.trend === "up" ? "↑" : wciData?.trend === "down" ? "↓" : "→";
  const wciTrendColor = wciData?.trend === "up" ? "text-red-500" : wciData?.trend === "down" ? "text-green-500" : "text-slate-400";

  const mapContent = (
    <>
      {showSplash && <SplashScreen cinematic subtitle="Freight Map" stages={["Conectando...","Carregando rotas...","Renderizando mapa 3D...","Pronto"]} duration={2500} onDone={() => setShowSplash(false)} />}
      <div className="flex flex-col" style={{ height: isLoggedIn ? "100vh" : "calc(100vh - 64px)" }}>
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full" />

          {/* ── Top Bar: Beta badge + WCI + Free notice ── */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
            {/* WCI indicator */}
            {wciData && (
              <div className="bg-white/90 backdrop-blur-md rounded-xl px-3 py-1.5 border border-slate-200 shadow-lg flex items-center gap-2 text-[10px]">
                <TrendingUp className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-slate-700">WCI {wciData.wci.toLocaleString("en-US")}</span>
                <span className={`${wciTrendColor} font-black`}>{wciTrendIcon}</span>
                <span className="text-[9px] text-slate-400">Drewry WCI</span>
              </div>
            )}
            {/* Beta + Free badges */}
            <div className="flex items-center gap-2">
              <span className="bg-[#D80E16] text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">Beta</span>
              <span className="bg-green-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                Grátis
              </span>
            </div>
          </div>

          {/* ── Bottom notice bar ── */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-white/90 backdrop-blur-md rounded-xl px-4 py-2 border border-slate-200 shadow-lg text-[10px] text-slate-500 flex items-center gap-3">
              <span>⏳ <strong>Gratuito por tempo limitado</strong> — depois disponível apenas no plano Business</span>
              <span className="text-slate-300">|</span>
              <span>Preços atualizados pelo <strong>World Container Index</strong> (WCI)</span>
            </div>
          </div>

          {/* Sidebar */}
          {(selectedPort || activeRoute) && !showQuoteForm && (
            <div className="absolute top-4 left-4 w-[420px] max-w-[calc(100vw-2rem)] max-h-[calc(100%-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-20 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {activeRoute ? <><Ship className="w-4 h-4" style={{ color: activeRoute.color }} /><span className="text-xs font-black uppercase tracking-wider text-slate-600">{activeRoute.rates[0]?.origin_name} → {activeRoute.rates[0]?.dest_name}</span></>
                  : <><Anchor className="w-4 h-4 text-[#D80E16]" /><span className="text-xs font-black uppercase tracking-wider text-slate-600">{getPortName(selectedPort!)}</span></>}
                </div>
                <button onClick={() => { setSelectedPort(null); setActiveRoute(null); }} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
              </div>
              <div className="overflow-y-auto p-3 space-y-2">
                {activeRoute ? (<>
                  <button onClick={() => setActiveRoute(null)} className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-1">← Voltar para {getPortName(selectedPort!)}</button>
                  {activeRoute.rates.filter(r => !selectedContainer || (selectedContainer === "20GP" ? r.price_20gp : r.price_40hc) != null).map((rate, i) => {
                    const dp20 = displayPrice(rate, "20GP");
                    const dp40 = displayPrice(rate, "40HC");
                    return (
                    <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-2 mb-3"><Anchor className="w-4 h-4 text-slate-400" /><span className="text-sm font-bold text-slate-800">{rate.carrier}</span>{rate.vessel_name && <span className="text-[10px] text-slate-400 ml-auto">{rate.vessel_name}</span>}</div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {dp20 != null && <div className="bg-white rounded-xl p-3 border border-slate-100"><div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">20' GP</div><div className="text-lg font-extrabold text-[#D80E16]">US$ {dp20.toLocaleString("en-US")}</div></div>}
                        {dp40 != null && <div className="bg-white rounded-xl p-3 border border-slate-100"><div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1">40' HC</div><div className="text-lg font-extrabold text-[#D80E16]">US$ {dp40.toLocaleString("en-US")}</div></div>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDays(rate.transit_days)}</span>{rate.etd && <span className="font-medium">ETD: {rate.etd}</span>}</div>
                      {(isUSPort(rate.pol) || isUSPort(rate.pod)) && (
                        <div className="mt-3 p-4 rounded-xl bg-blue-50 border border-blue-200 shadow-sm">
                          <div className="flex items-center gap-2 text-xs font-bold text-blue-800 uppercase tracking-wider mb-2"><FileText className="w-4 h-4" />Despachante Aduaneiro (EUA)</div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm"><span className="text-slate-600 font-medium">Customs Clearance</span><span className="font-bold text-slate-800">$125</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600 font-medium">Handling Fee</span><span className="font-bold text-slate-800">$55</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600 font-medium">ISF Filing</span><span className="font-bold text-slate-800">$35</span></div>
                            <div className="border-t border-blue-200/60 mt-1.5 pt-1.5 flex justify-between text-sm"><span className="font-bold text-slate-700">Total fixo</span><span className="font-bold text-blue-700 text-base">$215</span></div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                            Taxas variáveis: MPF 0,3464% (mín. $33), HMF 0,125%, SEB $4,50/$1.000. On-carriage port→warehouse ~$490-775. Consulte para cotação exata.
                          </div>
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); openQuoteForm(rate); }} className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D80E16] text-white text-sm font-bold hover:bg-[#b80d13] transition-colors"><Send className="w-4 h-4" />Solicitar Cotação Completa</button>
                    </div>
                    );
                  })}
                </>) : (<>
                  <div className="text-xs text-slate-400 font-medium mb-3">{portRouteList.length} rota{portRouteList.length !== 1 ? "s" : ""} disponível{portRouteList.length !== 1 ? "eis" : ""}</div>
                  {(["", "20GP", "40HC"] as const).map(ct => (
                    <button key={ct || "all"} onClick={() => setSelectedContainer(ct)} className={`mr-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedContainer === ct ? "bg-[#D80E16] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{ct === "" ? "Todos" : ct === "20GP" ? "20' GP" : "40' HC"}</button>
                  ))}
                  <div className="space-y-1.5 mt-2">
                    {portRouteList.map((r, i) => {
                      const isOrigin = r.pol === selectedPort;
                      const otherPort = isOrigin ? r.pod : r.pol;
                      return (
                        <button key={i} onClick={() => setActiveRoute(r)} className="w-full text-left p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
                          <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
                            <span className="text-sm font-bold text-slate-700 group-hover:text-[#D80E16] transition-colors">{isOrigin ? `${getPortName(selectedPort!)} → ${getPortName(otherPort)}` : `${getPortName(otherPort)} → ${getPortName(selectedPort!)}`}</span>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#D80E16] ml-auto transition-colors" />
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium"><span>{r.rates.length} cotaç{r.rates.length === 1 ? "ão" : "ões"}</span>{r.rates[0]?.carrier && <span>{r.rates[0].carrier}</span>}</div>
                        </button>
                      );
                    })}
                  </div>
                </>)}
              </div>
            </div>
          )}

          {/* Quote Form Modal */}
          {showQuoteForm && quoteRate && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowQuoteForm(false)} />
              <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Solicitar Cotação Completa</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{quoteRate.origin_name} → {quoteRate.dest_name}</p>
                  </div>
                  <button onClick={() => setShowQuoteForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
                </div>
                <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><User className="w-3 h-3" />Nome</label>
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-300 focus:border-[#D80E16] focus:ring-1 focus:ring-[#D80E16] outline-none" placeholder="Seu nome completo" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><Phone className="w-3 h-3" />Telefone</label>
                      <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-300 focus:border-[#D80E16] focus:ring-1 focus:ring-[#D80E16] outline-none" placeholder="+55 (11) 99999-9999" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><Mail className="w-3 h-3" />Email</label>
                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-300 focus:border-[#D80E16] focus:ring-1 focus:ring-[#D80E16] outline-none" placeholder="seu@email.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Origem</label>
                      <input value={formData.origin} onChange={e => setFormData({...formData, origin: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50 outline-none" readOnly />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Destino</label>
                      <input value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50 outline-none" readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><Package className="w-3 h-3" />Tipo de Carga</label>
                      <input value={formData.cargoType} onChange={e => setFormData({...formData, cargoType: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-300 focus:border-[#D80E16] focus:ring-1 focus:ring-[#D80E16] outline-none" placeholder="Ex: Eletrônicos, Soja..." />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Valor da Carga</label>
                      <input value={formData.cargoValue} onChange={e => setFormData({...formData, cargoValue: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-300 focus:border-[#D80E16] focus:ring-1 focus:ring-[#D80E16] outline-none" placeholder="US$ 50.000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Container</label>
                      <select value={formData.containerType} onChange={e => setFormData({...formData, containerType: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#D80E16] outline-none">
                        <option value="20GP">20' GP</option>
                        <option value="40HC">40' HC</option>
                        <option value="40GP">40' GP</option>
                        <option value="Reefer">Reefer</option>
                        <option value="LCL">LCL (Carga Consolidada)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1"><Hash className="w-3 h-3" />NCM / HS Code</label>
                      <input value={formData.ncmHs} onChange={e => setFormData({...formData, ncmHs: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-300 focus:border-[#D80E16] focus:ring-1 focus:ring-[#D80E16] outline-none" placeholder="Ex: 0901.11.10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Observações</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-300 focus:border-[#D80E16] focus:ring-1 focus:ring-[#D80E16] outline-none resize-none" placeholder="Detalhes adicionais sobre o envio..." />
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
                  <button onClick={submitQuote} disabled={!formData.name || !formData.email || sending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D80E16] text-white text-xs font-bold hover:bg-[#b80d13] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Enviando...</> : <><Send className="w-3.5 h-3.5" />Enviar Solicitação para freight@tradexa.com.br</>}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return isLoggedIn ? mapContent : <SiteLayout noFooter noBreadcrumbs>{mapContent}</SiteLayout>;
}
