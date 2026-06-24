"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ship, ArrowRight, AlertTriangle, RefreshCw,
  MapPin, X, Calendar, Mail,
  ChevronRight, Globe, Box, Anchor
} from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useUsage } from "@/hooks/use-usage";

// ─── Types ──────────────────────────────────────────────────────────
interface FreightQuote {
  id: string;
  so_number: string;
  pol: string;
  pod: string;
  container_type: string;
  carrier: string;
  sell_price_usd: number;
  etd: string | null;
  eta: string | null;
  transit_days: number;
  vessel_name: string | null;
  notes: string | null;
}

interface GroupedRate {
  so_number: string;
  pol: string;
  pod: string;
  origin_name: string;
  dest_name: string;
  price_20gp: number | null;
  price_40hc: number | null;
  carrier: string;
  transit_days: number;
  etd: string | null;
  eta: string | null;
  vessel_name: string | null;
  notes: string | null;
}

// Port code → name mapping
const PORT_NAMES: Record<string, string> = {
  INNHA: "Nhava Sheva", INMUN: "Mundra",
  CNSHA: "Shanghai", CNSZX: "Shenzhen", CNNGB: "Ningbo",
  CNTAO: "Qingdao", CNXMN: "Xiamen",
  BRPEE: "Pecém", BRRIG: "Rio Grande", BRRIO: "Rio de Janeiro",
  BRSSZ: "Santos", BRITJ: "Itajaí", BRPRN: "Paranaguá",
  USNYC: "New York", USPEV: "Port Everglades", USJAX: "Jacksonville",
};

function getPortName(code: string) {
  return PORT_NAMES[code] || code;
}

function getCountryFromPort(code: string): string {
  const prefix = code.slice(0, 2);
  const map: Record<string, string> = {
    CN: "China", KR: "Coreia do Sul", JP: "Japão", IN: "Índia",
    TR: "Turquia", AE: "Emirados Árabes", PT: "Portugal", ES: "Espanha",
    NL: "Países Baixos", BR: "Brasil", US: "EUA", GB: "Reino Unido",
    DE: "Alemanha", BE: "Bélgica",
  };
  return map[prefix] || prefix;
}

function fmt(v: number | null | undefined) {
  return v != null ? `US$ ${v.toLocaleString("en-US")}` : "—";
}

function fmtDays(v: number | null) {
  return v != null ? `${v} dias` : "—";
}

// ─── Port Coordinates (lat, lng) ──────────────────────────────────────
const PORT_COORDS: Record<string, [number, number]> = {
  INNHA: [18.95, 72.95],        // Nhava Sheva (Mumbai/JNPT area)
  INMUN: [22.78, 69.68],        // Mundra
  CNSHA: [31.2304, 121.4737],   // Shanghai
  CNSZX: [22.5431, 114.0579],   // Shenzhen
  CNNGB: [29.8683, 121.5440],   // Ningbo
  CNTAO: [36.0671, 120.3826],   // Qingdao
  CNXMN: [24.4798, 118.0894],   // Xiamen
  BRPEE: [-3.5308, -38.8000],   // Pecém
  BRRIG: [-32.0350, -52.1076],  // Rio Grande
  BRRIO: [-22.9068, -43.1729],  // Rio de Janeiro
  BRSSZ: [-23.9608, -46.3331],  // Santos
  BRITJ: [-26.9056, -48.6618],  // Itajaí
  BRPRN: [-25.5205, -48.5095],  // Paranaguá
  USNYC: [40.7128, -74.0060],   // New York
  USPEV: [26.1224, -80.1373],   // Port Everglades
  USJAX: [30.3322, -81.6557],   // Jacksonville
};

// ─── Maritime route waypoints ───────────────────────────────────────
// India → Brazil via Cape of Good Hope
const WAYPOINT_INDIA_BR: [number, number][] = [
  [10.0, 65.0],        // Arabian Sea
  [-5.0, 55.0],        // Indian Ocean
  [-20.0, 55.0],       // Near Mauritius
  [-35.0, 20.0],       // Cape of Good Hope
  [-25.0, -5.0],       // South Atlantic
  [-15.0, -25.0],      // Mid Atlantic
];

// China → Brazil via Cape of Good Hope
const WAYPOINT_CHINA_BR: [number, number][] = [
  [1.35, 103.9],       // Strait of Malacca
  [-6.0, 80.0],        // Indian Ocean
  [-20.0, 55.0],       // Indian Ocean, near Mauritius
  [-35.0, 20.0],       // Cape of Good Hope
  [-25.0, -5.0],       // South Atlantic
  [-15.0, -25.0],      // Mid Atlantic
];

// Brazil → US East Coast (Atlantic crossing)
const WAYPOINT_BR_US: [number, number][] = [
  [-20.0, -40.0],      // South Atlantic
  [0.0, -50.0],        // Equator / Central Atlantic
  [20.0, -60.0],       // Caribbean / North Atlantic
  [35.0, -70.0],       // US East Coast approach
];

// Brazil → Brazil coast (north-south)
const WAYPOINT_BR_COAST: [number, number][] = [
  [-15.0, -38.5],      // Vitória area
  [-20.0, -40.0],      // South Atlantic coastal
  [-24.5, -47.0],      // Santos approach
  [-27.0, -48.5],      // Joinville area
  [-30.0, -50.0],      // South coast
];

// Route lookup: returns full polyline coordinates
function getMaritimeRoute(pol: string, pod: string): [number, number][] {
  const origin = PORT_COORDS[pol];
  const dest = PORT_COORDS[pod];
  if (!origin || !dest) return [origin || dest || [0, 0], dest || origin || [0, 0]];

  const originPrefix = pol.slice(0, 2);
  const destPrefix = pod.slice(0, 2);

  // India → Brazil: via Arabian Sea → Indian Ocean → Cape of Good Hope
  if (originPrefix === "IN" && destPrefix === "BR") {
    return [origin, ...WAYPOINT_INDIA_BR, dest];
  }

  // China → Brazil: via Malacca → Indian Ocean → Cape of Good Hope
  if (originPrefix === "CN" && destPrefix === "BR") {
    return [origin, ...WAYPOINT_CHINA_BR, dest];
  }

  // US East Coast → Brazil: Atlantic crossing
  if (originPrefix === "US" && destPrefix === "BR") {
    return [origin, ...WAYPOINT_BR_US.slice().reverse(), dest];
  }

  // Brazil → US East Coast: Atlantic crossing
  if (originPrefix === "BR" && destPrefix === "US") {
    return [origin, ...WAYPOINT_BR_US, dest];
  }

  // Brazil → Brazil coast (north-south or south-north)
  if (originPrefix === "BR" && destPrefix === "BR") {
    return [origin, ...WAYPOINT_BR_COAST, dest];
  }

  // Default: direct
  return [origin, dest];
}

// ─── Map Component ──────────────────────────────────────────────────
function MaritimeMap({ pol, pod }: { pol: string; pod: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Cleanup previous map
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const origin = PORT_COORDS[pol];
    const dest = PORT_COORDS[pod];
    if (!origin || !dest) return;

    const route = getMaritimeRoute(pol, pod);

    const map = L.map(mapRef.current, {
      center: [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2],
      zoom: 2,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Draw maritime route polyline
    L.polyline(route, {
      color: "#D80E16",
      weight: 3,
      opacity: 0.85,
      smoothFactor: 1.5,
      dashArray: undefined,
    }).addTo(map);

    // Origin marker (red)
    L.circleMarker(origin, {
      radius: 8,
      fillColor: "#D80E16",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95,
    })
      .bindPopup(`<b>${getPortName(pol)}</b><br>Porto de Origem`)
      .addTo(map);

    // Destination marker (dark)
    L.circleMarker(dest, {
      radius: 8,
      fillColor: "#0f172a",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95,
    })
      .bindPopup(`<b>${getPortName(pod)}</b><br>Porto de Destino`)
      .addTo(map);

    // Fit bounds with padding
    const bounds = L.latLngBounds(route);
    map.fitBounds(bounds, { padding: [40, 40] });

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [pol, pod]);

  return <div ref={mapRef} className="w-full h-full" />;
}

export default function MaritimeFreight() {
  const { consume } = useUsage();
  useSeo({
    title: "Frete Marítimo FCL — Cotações de Container",
    description: "Cotações de frete marítimo FCL entre portos do mundo. Preços de container 20' GP e 40' HC com dados reais de armadores e freight forwarders.",
  });

  const [rates, setRates] = useState<GroupedRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedRate, setSelectedRate] = useState<GroupedRate | null>(null);

  // Wizard filters
  const [wizardOrigin, setWizardOrigin] = useState("");
  const [wizardDest, setWizardDest] = useState("");
  const [wizardContainer, setWizardContainer] = useState<"" | "20GP" | "40HC">("");

  useEffect(() => {
    async function fetchRates() {
        const ok = await consume("search");
        if (!ok) return;
      try {
        const { data, error } = await supabase
          .from("freight_quotes")
          .select("*")
          .order("so_number", { ascending: true });
        if (error) {
          console.error("Supabase freight_quotes error:", error);
          throw new Error(error.message || "Erro ao buscar cotações");
        }
        if (!data || data.length === 0) {
          setRates([]);
          setFetchError("Nenhuma cotação encontrada no banco de dados.");
          return;
        }

        // Group by so_number
        const grouped = new Map<string, FreightQuote[]>();
        (data as FreightQuote[]).forEach((row) => {
          const arr = grouped.get(row.so_number) || [];
          arr.push(row);
          grouped.set(row.so_number, arr);
        });

        const mapped: GroupedRate[] = Array.from(grouped.entries()).map(([so_number, rows]) => {
          const first = rows[0];
          const price20 = rows.find(r => r.container_type === "20GP")?.sell_price_usd ?? null;
          const price40 = rows.find(r => r.container_type === "40HC")?.sell_price_usd ?? null;
          return {
            so_number,
            pol: first.pol,
            pod: first.pod,
            origin_name: getPortName(first.pol),
            dest_name: getPortName(first.pod),
            price_20gp: price20,
            price_40hc: price40,
            carrier: first.carrier || "—",
            transit_days: first.transit_days,
            etd: first.etd,
            eta: first.eta,
            vessel_name: first.vessel_name,
            notes: first.notes,
          };
        });

        setRates(mapped);
        setFetchError("");
      } catch (err: any) {
        console.error("Freight rates fetch error:", err);
        setFetchError(err.message || "Erro ao carregar cotações. Verifique sua conexão.");
        setRates([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRates();
  }, []);

  // ─── Corridor detection ─────────────────────────────────────────────
  const corridors = useMemo(() => {
    const map: Record<string, { label: string; color: string; icon: string; count: number }> = {};
    rates.forEach(r => {
      const prefixO = r.pol.slice(0, 2);
      const prefixD = r.pod.slice(0, 2);
      let key = "";
      let label = "";
      let color = "";
      let icon = "";

      if (prefixO === "CN" && prefixD === "BR") {
        key = "CN-BR"; label = "China → Brasil"; color = "#D80E16"; icon = "🇨🇳 → 🇧🇷";
      } else if (prefixO === "IN" && prefixD === "BR") {
        key = "IN-BR"; label = "Índia → Brasil"; color = "#FF9933"; icon = "🇮🇳 → 🇧🇷";
      } else if (prefixO === "BR" && prefixD === "US") {
        key = "BR-US"; label = "Brasil → EUA"; color = "#1e40af"; icon = "🇧🇷 → 🇺🇸";
      } else if (prefixO === "US" && prefixD === "BR") {
        key = "US-BR"; label = "EUA → Brasil"; color = "#1e40af"; icon = "🇺🇸 → 🇧🇷";
      } else if (prefixO === "BR" && prefixD === "BR") {
        key = "BR-BR"; label = "Costa Brasileira"; color = "#059669"; icon = "🇧🇷 → 🇧🇷";
      }

      if (key) {
        if (!map[key]) map[key] = { label, color, icon, count: 0 };
        map[key].count += 1;
      }
    });
    return map;
  }, [rates]);

  const [selectedCorridor, setSelectedCorridor] = useState<string>("");

  const filteredRates = useMemo(() => {
    return rates.filter(r => {
      if (selectedCorridor) {
        const prefixO = r.pol.slice(0, 2);
        const prefixD = r.pod.slice(0, 2);
        const match =
          (selectedCorridor === "CN-BR" && prefixO === "CN" && prefixD === "BR") ||
          (selectedCorridor === "IN-BR" && prefixO === "IN" && prefixD === "BR") ||
          (selectedCorridor === "BR-US" && prefixO === "BR" && prefixD === "US") ||
          (selectedCorridor === "US-BR" && prefixO === "US" && prefixD === "BR") ||
          (selectedCorridor === "BR-BR" && prefixO === "BR" && prefixD === "BR");
        if (!match) return false;
      }
      if (wizardContainer === "20GP" && r.price_20gp == null) return false;
      if (wizardContainer === "40HC" && r.price_40hc == null) return false;
      return true;
    });
  }, [rates, selectedCorridor, wizardContainer]);

  const activeFiltersCount = [selectedCorridor, wizardContainer].filter(Boolean).length;

  function clearFilters() {
    setSelectedCorridor("");
    setWizardContainer("");
  }

  function openReservation(rate: GroupedRate) {
    const subject = encodeURIComponent(`Pré-reserva de frete — ${rate.origin_name} → ${rate.dest_name}`);
    const body = encodeURIComponent(
      `Olá,\n\n` +
      `Gostaria de solicitar uma pré-reserva para a seguinte cotação de frete marítimo:\n\n` +
      `• SO: ${rate.so_number}\n` +
      `• Origem: ${rate.origin_name} (${rate.pol})\n` +
      `• Destino: ${rate.dest_name} (${rate.pod})\n` +
      `• 20GP: ${fmt(rate.price_20gp)}\n` +
      `• 40HC: ${fmt(rate.price_40hc)}\n` +
      `• Trânsito: ${fmtDays(rate.transit_days)}\n` +
      `• Armador: ${rate.carrier}\n\n` +
      `Por favor, confirmar disponibilidade e enviar cotação atualizada.\n\n` +
      `Atenciosamente`
    );
    window.open(`mailto:vendas@tradexa.com.br?subject=${subject}&body=${body}`, "_blank");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Frete Marítimo FCL"
        subtitle="Cotações de frete marítimo FCL. Rotas internacionais com detalhamento completo."
        badges={[{ label: "FCL", icon: <Ship className="w-3 h-3 mr-1" /> }]}
        variant="blue"
      />

      {/* Terms banner */}
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          <strong>Aviso importante:</strong> Os valores exibidos são estimativas baseadas em cotações recebidas de armadores e freight forwarders.
          Estão sujeitos a alterações sem aviso prévio conforme disponibilidade de espaço, equipamento, época do ano e condições de mercado.
          Para cotações firmes e pré-reservas, entre em contato com nossa equipe comercial.
        </p>
      </div>

      {/* ─── Corridor Cards + Container Toggle ──────────────────────────────── */}
      <div className="space-y-4">
        {/* Corridor cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(corridors).map(([key, c]) => {
            const isActive = selectedCorridor === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCorridor(isActive ? "" : key)}
                className={`relative rounded-2xl p-4 text-left transition-all border-2 ${
                  isActive
                    ? "border-current shadow-lg scale-[1.02]"
                    : "border-transparent hover:scale-[1.02] shadow-sm"
                }`}
                style={{
                  background: isActive ? `${c.color}15` : "#fff",
                  borderColor: isActive ? c.color : "transparent",
                  boxShadow: isActive ? `0 4px 20px ${c.color}30` : "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{c.icon}</span>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                    style={{ background: c.color }}
                  >
                    {c.count} rotas
                  </span>
                </div>
                <p className={`font-bold text-sm ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                  {c.label}
                </p>
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: c.color }}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Toolbar: Container toggle + Clear */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            {(["", "20GP", "40HC"] as const).map((ct) => (
              <button
                key={ct || "all"}
                onClick={() => setWizardContainer(ct)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  wizardContainer === ct
                    ? "bg-[#D80E16] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {ct === "" ? "Todos" : ct === "20GP" ? "20' GP" : "40' HC"}
              </button>
            ))}
          </div>

          {activeFiltersCount > 0 && (
            <>
              <Badge className="bg-slate-100 text-slate-600 border-0 text-xs font-bold">
                {filteredRates.length} resultado{filteredRates.length !== 1 ? "s" : ""}
              </Badge>
              <button
                onClick={clearFilters}
                className="text-xs text-[#D80E16] hover:text-[#b00c12] font-bold flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpar filtros
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
          <span className="ml-3 text-slate-500 font-medium">Carregando cotações...</span>
        </div>
      )}

      {/* Error / Empty */}
      {!loading && (filteredRates.length === 0 || fetchError) && (
        <Card className="border border-slate-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">
              {fetchError || "Nenhuma cotação encontrada com os filtros selecionados."}
            </p>
            {activeFiltersCount > 0 && !fetchError && (
              <button onClick={clearFilters} className="mt-3 text-sm text-[#D80E16] hover:text-[#b00c12] font-medium">Limpar filtros</button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rate Cards Grid */}
      {!loading && filteredRates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRates.map((rate) => {
            const has20 = rate.price_20gp != null;
            const has40 = rate.price_40hc != null;
            const originCountry = getCountryFromPort(rate.pol);
            const destCountry = getCountryFromPort(rate.pod);

            return (
              <Card
                key={rate.so_number}
                className="border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                onClick={() => setSelectedRate(rate)}
              >
                <div className="h-1.5 bg-[#D80E16]" />
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#D80E16]/10 text-[#D80E16]">
                        <Ship className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{rate.origin_name}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <ArrowRight className="w-3 h-3" /> {rate.dest_name}
                        </div>
                      </div>
                    </div>
                    <Badge className="text-[10px] bg-[#D80E16]/10 text-[#D80E16] border-[#D80E16]/20">
                      {rate.so_number}
                    </Badge>
                  </div>

                  {/* Route meta */}
                  <div className="flex flex-wrap gap-2 mb-3 text-[10px] text-slate-500">
                    <span className="bg-slate-100 rounded-md px-2 py-0.5">{originCountry}</span>
                    <span className="bg-slate-100 rounded-md px-2 py-0.5">{destCountry}</span>
                    {rate.carrier && rate.carrier !== "—" && (
                      <span className="bg-red-50 text-[#D80E16] rounded-md px-2 py-0.5">{rate.carrier}</span>
                    )}
                  </div>

                  {/* Key info */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {has20 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">20GP</p>
                        <p className="text-base font-black text-slate-900">US$ {rate.price_20gp!.toLocaleString("en-US")}</p>
                      </div>
                    )}
                    {has40 && (
                      <div className="p-2.5 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/10 text-center">
                        <p className="text-[10px] text-[#D80E16] uppercase font-bold">40HC</p>
                        <p className="text-base font-black text-[#D80E16]">US$ {rate.price_40hc!.toLocaleString("en-US")}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {fmtDays(rate.transit_days)}
                      </span>
                      {(rate.etd || rate.eta) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {rate.etd || "—"} → {rate.eta || "—"}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#D80E16] transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal with Map */}
      {selectedRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedRate(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#D80E16]/10 text-[#D80E16]">
                  <Ship className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{selectedRate.origin_name} → {selectedRate.dest_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className="text-[10px] bg-[#D80E16]/10 text-[#D80E16] border-[#D80E16]/20">
                      {selectedRate.so_number}
                    </Badge>
                    {selectedRate.carrier && selectedRate.carrier !== "—" && (
                      <Badge className="bg-slate-100 text-slate-600 text-[10px]">{selectedRate.carrier}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedRate(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Map with maritime route */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-64 bg-slate-100">
                <MaritimeMap pol={selectedRate.pol} pod={selectedRate.pod} />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">20GP</p>
                  <p className="text-xl font-black text-slate-900">{fmt(selectedRate.price_20gp)}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#D80E16]/5 border border-[#D80E16]/10 text-center">
                  <p className="text-[10px] text-[#D80E16] uppercase font-bold">40HC</p>
                  <p className="text-xl font-black text-[#D80E16]">{fmt(selectedRate.price_40hc)}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Trânsito</p>
                  <p className="font-bold text-slate-800">{fmtDays(selectedRate.transit_days)}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">ETD → ETA</p>
                  <p className="font-bold text-slate-800">{selectedRate.etd || "—"} → {selectedRate.eta || "—"}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Armador</p>
                  <p className="font-bold text-slate-800">{selectedRate.carrier}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Navio</p>
                  <p className="font-bold text-slate-800">{selectedRate.vessel_name || "—"}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedRate.notes && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Observações</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{selectedRate.notes}</p>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={() => openReservation(selectedRate)}
                className="w-full py-3 rounded-xl bg-[#D80E16] text-white font-black text-sm hover:bg-[#b00c12] transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Solicitar Pré-reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
