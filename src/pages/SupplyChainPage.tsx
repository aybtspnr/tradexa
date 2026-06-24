"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SupplyChainMap, type SelectedFeature } from "./SupplyChainMap";
import { CommodityBar } from "./CommodityBar";
import { LayerToggle } from "./LayerToggle";
import { FeatureDetail } from "./FeatureDetail";
import { ViewPresets } from "./ViewPresets";
import BottomIntelBar from "@/components/BottomIntelBar";
import { useSeo } from "@/hooks/use-seo";
import { SiteLayout } from "@/components/SiteLayout";
import { SplashScreen } from "@/components/SplashScreen";

interface Commodity {
  name: string; symbol: string; price: number | null;
  unit: string; change: number | null; changePercent: number | null;
}

const LAYERS = [
  { id: "ports", label: "Portos", color: "#D80E16" },
  { id: "airports", label: "Aeroportos", color: "#3b82f6" },
  { id: "chokepoints", label: "Chokepoints", color: "#f59e0b" },
  { id: "maritime", label: "Navios", color: "#0891b2" },
  { id: "cargoFlights", label: "Aviões", color: "#D80E16" },
  { id: "cctv", label: "Câmeras ao Vivo", color: "#39FF14" },
  { id: "earthquakes", label: "Terremotos", color: "#FFD700" },
  { id: "weather", label: "Tempestades", color: "#E040FB" },
  { id: "fires", label: "Incêndios", color: "#FF6B00" },
  { id: "conflicts", label: "Conflitos", color: "#FF1744" },
];

export default function SupplyChainPage() {
  useSeo({
    title: "Supply Chain Map — Mapa Logístico Global ao Vivo",
    description: "Navios, aviões, portos e chokepoints ao vivo. Rastreamento AIS e ADS-B, câmeras, tráfego portuário e condições oceânicas no mapa global.",
    keywords: "supply chain map, mapa logístico, navios ao vivo, câmeras ao vivo, aviões carga, portos globais, rastreamento marítimo, aisstream, terremotos, tempestades",
    canonical: "https://www.tradexa.com.br/supply-chain",
  });

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [ports, setPorts] = useState<any[]>([]);
  const [airports, setAirports] = useState<any[]>([]);
  const [chokepoints, setChokepoints] = useState<any[]>([]);
  const [cargoFlights, setCargoFlights] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  const [activeLayers, setActiveLayers] = useState<Set<string>>(
    new Set(["ports", "airports", "chokepoints", "maritime", "cargoFlights", "cctv", "earthquakes", "conflicts", "weather"])
  );
  const [selected, setSelected] = useState<SelectedFeature | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [airlines, setAirlines] = useState<Record<string, string>>({});
  const [showSplash, setShowSplash] = useState(true);
  const [activePreset, setActivePreset] = useState<string>("global");
  const mapRef = useRef<any>(null);

  // Slower splash — 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  // Load static data (ports + airports + chokepoints)
  useEffect(() => {
    Promise.all([
      fetch("/api/ports").then(r => r.json()),
      fetch("/api/airports").then(r => r.json()),
      fetch("/api/chokepoints").then(r => r.json()),
    ]).then(([p, a, c]) => {
      setPorts(Array.isArray(p) ? p : []);
      setAirports(Array.isArray(a) ? a : []);
      setChokepoints(c.features || []);
      setCounts(prev => ({
        ...prev,
        ports: Array.isArray(p) ? p.length : 0,
        airports: Array.isArray(a) ? a.length : 0,
        chokepoints: (c.features || []).length,
      }));
    }).catch(console.error);
  }, []);

  // Commodities polling
  useEffect(() => {
    const fetchCommodities = () => {
      fetch("/api/commodities").then(r => r.json()).then(d => setCommodities(d.commodities || [])).catch(() => {});
    };
    fetchCommodities();
    const i = setInterval(fetchCommodities, 60000);
    return () => clearInterval(i);
  }, []);

  // Cargo flights polling
  useEffect(() => {
    let mounted = true;
    const fetchFlights = () => {
      fetch("/api/cargo-flights").then(r => r.json()).then(d => {
        if (!mounted) return;
        setCargoFlights(d.flights || []);
        setCounts(prev => ({ ...prev, cargoFlights: d.total || 0 }));
      }).catch(() => {});
    };
    fetchFlights();
    const i = setInterval(fetchFlights, 15000);
    return () => { mounted = false; clearInterval(i); };
  }, []);

  // Maritime / ships polling (cargo vessels only: shipType 70-79)
  useEffect(() => {
    let mounted = true;
    const fetchShips = () => {
      fetch("/api/maritime-live").then(r => r.json()).then(d => {
        if (!mounted) return;
        const allShips = d.ships || [];
        // Filter: only cargo vessels (container ships, bulk carriers, general cargo)
        const cargoShips = allShips.filter((s: any) => s.shipType >= 70 && s.shipType < 80);
        setShips(cargoShips);
        setCounts(prev => ({ ...prev, maritime: cargoShips.length }));
      }).catch(() => {});
    };
    fetchShips();
    const i = setInterval(fetchShips, 30000);
    return () => { mounted = false; clearInterval(i); };
  }, []);

  // Load airlines lookup
  useEffect(() => {
    fetch("/api/airlines").then(r => r.json()).then(d => setAirlines(d || {})).catch(() => {});
  }, []);

  // Load airlines lookup
  useEffect(() => {
    const refresh = () => {
      fetch("/api/earthquakes").then(r => r.json()).then(d => setCounts(prev => ({ ...prev, earthquakes: d.total || 0 }))).catch(() => {});
      fetch("/api/weather-events").then(r => r.json()).then(d => setCounts(prev => ({ ...prev, weather: d.total || 0 }))).catch(() => {});
      fetch("/api/fires").then(r => r.json()).then(d => setCounts(prev => ({ ...prev, fires: d.total || 0 }))).catch(() => {});
      fetch("/api/cctv").then(r => r.json()).then(d => setCounts(prev => ({ ...prev, cctv: d.total || 0 }))).catch(() => {});
      fetch("/api/conflicts").then(r => r.json()).then(d => setCounts(prev => ({ ...prev, conflicts: d.zones?.length || 0 }))).catch(() => {});
    };
    refresh();
    const i = setInterval(refresh, 120000);
    return () => clearInterval(i);
  }, []);

  const toggleLayer = useCallback((id: string) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleFeatureClick = useCallback((feature: SelectedFeature) => {
    if (feature.type === "cargo_flight" && feature.data?.icao24 && airlines) {
      const callsign = feature.data.callsign || "";
      const icaoPrefix = callsign.replace(/[0-9]/g, "").toUpperCase().slice(0, 3);
      const airline = airlines[icaoPrefix] || airlines[feature.data.icao24?.slice(0, 3)?.toUpperCase()];
      if (airline) {
        feature = { ...feature, data: { ...feature.data, airline } };
      }
    }
    setSelected(feature);
  }, [airlines]);

  return (
    <SiteLayout noFooter noBreadcrumbs>
      {/* SEO: visually hidden H1 */}
      <h1 className="sr-only">Supply Chain Map — Mapa Logístico Global ao Vivo</h1>
      <div className="sr-only">
        <h2>Sobre o Supply Chain Map</h2>
        <p>O Supply Chain Map da TRADEXA é a ferramenta mais completa de monitoramento logístico global em tempo real. Visualize navios de carga ao vivo via satélites AIS (Automatic Identification System), acompanhe voos cargueiros com dados ADS-B, monitore portos e aeroportos estratégicos, e identifique gargalos logísticos como chokepoints marítimos que podem impactar sua cadeia de suprimentos. Camadas adicionais incluem câmeras ao vivo em portos, alertas de terremotos e tempestades que afetam rotas comerciais, focos de incêndio próximos a infraestrutura logística e zonas de conflito ativas. O mapa também exibe commodities em tempo real com cotações de frete (WCI — World Container Index), preços de bunker, ouro e moedas. Ideal para profissionais de logística internacional, traders de commodities, analistas de supply chain e empresas que precisam antecipar disrupções nas suas operações de importação e exportação. Todos os dados são atualizados continuamente com frequência de 15 a 120 segundos dependendo da camada, garantindo que você sempre tenha a informação mais recente para tomada de decisão.</p>
      </div>

      {/* ── Splash overlay (covers entire viewport) ── */}
      {showSplash && (
        <SplashScreen
          cinematic
          subtitle="Supply Chain Map"
          stages={[
            "Conectando aos servidores...",
            "Carregando dados ao vivo...",
            "Renderizando mapa 3D...",
            "Calibrando sensores...",
            "Pronto",
          ]}
          duration={3500}
          onDone={() => setShowSplash(false)}
        />
      )}

      {/* ── Full-height content below header ── */}
      <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
        <CommodityBar commodities={commodities} />

        <div className="flex-1 relative">
          <SupplyChainMap
            ref={mapRef}
            ports={activeLayers.has("ports") ? ports : []}
            airports={activeLayers.has("airports") ? airports : []}
            chokepoints={activeLayers.has("chokepoints") ? chokepoints : []}
            cargoFlights={activeLayers.has("cargoFlights") ? cargoFlights : []}
            ships={activeLayers.has("maritime") ? ships : []}
            activeLayers={activeLayers}
            onFeatureClick={handleFeatureClick}
          />

          {/* ── Top bar: Presets ── */}
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:pr-[200px]">
            <ViewPresets
              active={activePreset}
              onSelect={(id, center, zoom, pitch, bearing) => {
                setActivePreset(id);
                mapRef.current?.flyToPreset(center, zoom, pitch, bearing);
              }}
            />
          </div>

          <div className="absolute top-3 right-4 z-10 sm:top-4 mt-16 sm:mt-0">
            <LayerToggle layers={LAYERS} activeLayers={activeLayers} counts={counts} onToggle={toggleLayer} />
          </div>

          {selected && <FeatureDetail feature={selected} onClose={() => setSelected(null)} />}

          {/* ── Bottom Intel Bar (Osiris-style: ticker + markets + alerts) ── */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <BottomIntelBar />
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
