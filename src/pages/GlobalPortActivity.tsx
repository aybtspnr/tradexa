"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Anchor, Ship, Loader2, AlertTriangle,
  MapPin, Clock, Globe, Search, X,
  Thermometer, Wind, CloudRain, Waves,
  Navigation, ExternalLink
} from "lucide-react";

interface PortGeo {
  name: string;
  country: string;
  lat: number;
  lng: number;
  index: number;
}

interface Vessel {
  mmsi: number;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  shipType: number;
  updatedAt: string;
}

interface Weather {
  temp: number;
  windSpeed: number;
  windDir: number;
  precip: number;
  code: number;
  desc: string;
}

interface PortActivity {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  atBerth: number;
  atAnchor: number;
  approaching: number;
  total: number;
  congestionPct: number;
  vessels: { name: string; speed: number; dist: number }[];
  weather?: Weather | null;
  weatherLoading?: boolean;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Bearing from vessel to port (degrees 0-360)
function bearingToPort(vLat: number, vLng: number, pLat: number, pLng: number): number {
  const dLng = (pLng - vLng) * Math.PI / 180;
  const vLatRad = vLat * Math.PI / 180;
  const pLatRad = pLat * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(pLatRad);
  const x = Math.cos(vLatRad) * Math.sin(pLatRad) - Math.sin(vLatRad) * Math.cos(pLatRad) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Check if vessel heading points toward the port
function headingTowardsPort(vesselLat: number, vesselLng: number, portLat: number, portLng: number, heading: number): boolean {
  if (heading === 511) return true; // heading unknown, assume approaching
  const bearing = bearingToPort(vesselLat, vesselLng, portLat, portLng);
  const diff = Math.abs(heading - bearing);
  return Math.min(diff, 360 - diff) <= 70; // within 70° of port direction
}

const WEATHER_CODES: Record<number, string> = {
  0: "Céu limpo", 1: "Limpo", 2: "Parcial nublado", 3: "Nublado",
  45: "Neblina", 48: "Geada",
  51: "Chuva fraca", 53: "Chuva mod.", 55: "Chuva forte",
  56: "Chuva gelada", 57: "Chuva gelada forte",
  61: "Chuva", 63: "Chuva mod.", 65: "Chuva forte",
  66: "Chuva gelada", 67: "Chuva gelada forte",
  71: "Neve fraca", 73: "Neve mod.", 75: "Neve forte",
  77: "Grãos de neve",
  80: "Pancadas", 81: "Pancadas mod.", 82: "Pancadas fortes",
  85: "Neve fraca", 86: "Neve forte",
  95: "Trovoada", 96: "Trovoada c/ granizo", 99: "Trovoada c/ granizo forte",
};

const countryName: Record<string, string> = {
  US: "EUA", BR: "Brasil", CN: "China", JP: "Japão", KR: "Coreia do Sul",
  GB: "Reino Unido", DE: "Alemanha", FR: "França", IT: "Itália", ES: "Espanha",
  NL: "Holanda", BE: "Bélgica", DK: "Dinamarca", SE: "Suécia", NO: "Noruega",
  FI: "Finlândia", PT: "Portugal", IE: "Irlanda", PL: "Polônia", GR: "Grécia",
  TR: "Turquia", RU: "Rússia", IN: "Índia", SG: "Singapura", MY: "Malásia",
  TH: "Tailândia", VN: "Vietnã", PH: "Filipinas", ID: "Indonésia",
  TW: "Taiwan", HK: "Hong Kong", AU: "Austrália", NZ: "Nova Zelândia",
  ZA: "África do Sul", NG: "Nigéria", EG: "Egito", KE: "Quênia",
  AE: "Emirados Árabes", SA: "Arábia Saudita", QA: "Catar", KW: "Kuweit",
  AR: "Argentina", CL: "Chile", PE: "Peru", CO: "Colômbia", MX: "México",
  PA: "Panamá", CA: "Canadá",
};

function getCountryName(code: string): string { return countryName[code] || code; }

function windDirLabel(d: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  const i = Math.round(d / 22.5) % 16;
  return dirs[i];
}

export default function GlobalPortActivity() {
  const [ports, setPorts] = useState<PortActivity[]>([]);
  const [allPorts, setAllPorts] = useState<PortGeo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPorts, setLoadingPorts] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minActivity, setMinActivity] = useState(1);

  // Expand tracking for weather fetch
  const [expandedPorts, setExpandedPorts] = useState<Set<string>>(new Set());

  // Load all ports once
  useEffect(() => {
    fetch("/api/ports")
      .then((r) => r.json())
      .then((data: PortGeo[]) => {
        setAllPorts(data);
        setLoadingPorts(false);
      })
      .catch(() => setLoadingPorts(false));
  }, []);

  // Fetch live AIS data
  async function fetchActivity() {
    try {
      setError("");
      const res = await fetch("/api/maritime-live");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const ships: Vessel[] = data.ships || [];

      const results = allPorts.map((port): PortActivity => {
        const vessels: { name: string; speed: number; dist: number }[] = [];
        let atBerth = 0, atAnchor = 0, approaching = 0;

        ships.forEach((ship) => {
          if (ship.shipType < 70 || ship.shipType >= 80) return;
          const dist = haversineKm(port.lat, port.lng, ship.lat, ship.lng);
          const speed = ship.speed ?? 0;
          const heading = ship.heading ?? 511;

          // Very close and stopped = at berth
          if (dist <= 0.5 && speed < 0.5) {
            atBerth++;
            vessels.push({ name: ship.name, speed, dist });
          }
          // Within 1.5km and stopped = at anchor
          else if (dist <= 1.5 && speed < 0.5) {
            atAnchor++;
            vessels.push({ name: ship.name, speed, dist });
          }
          // Within 8km and moving toward the port = approaching
          else if (dist <= 8.0 && speed >= 0.5 && headingTowardsPort(ship.lat, ship.lng, port.lat, port.lng, heading)) {
            approaching++;
            vessels.push({ name: ship.name, speed, dist });
          }
        });

        const total = atBerth + atAnchor + approaching;
        const congestionPct = (atBerth + atAnchor) > 0
          ? Math.round((atAnchor / (atBerth + atAnchor)) * 100)
          : 0;

        return {
          name: port.name,
          country: getCountryName(port.country),
          countryCode: port.country,
          lat: port.lat,
          lng: port.lng,
          atBerth, atAnchor, approaching, total, congestionPct,
          vessels: vessels.sort((a, b) => a.dist - b.dist).slice(0, 10),
        };
      });

      results.sort((a, b) => b.total - a.total);
      setPorts(results);
      setLastUpdate(new Date().toLocaleTimeString("pt-BR"));
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!loadingPorts && allPorts.length > 0) {
      fetchActivity();
      const interval = setInterval(fetchActivity, 60000);
      return () => clearInterval(interval);
    }
  }, [loadingPorts, allPorts]);

  // Fetch weather for a port (Open-Meteo, free, no key)
  const fetchWeather = useCallback(async (port: PortActivity) => {
    const key = `${port.name}-${port.countryCode}`;
    setPorts((prev) => prev.map((p) =>
      p.name === port.name && p.countryCode === port.countryCode
        ? { ...p, weatherLoading: true } : p
    ));

    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${port.lat}&longitude=${port.lng}` +
        `&current=temperature_2m,windspeed_10m,winddirection_10m,weathercode,precipitation&timezone=auto`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      const c = d.current;

      const weather: Weather = {
        temp: c.temperature_2m,
        windSpeed: c.windspeed_10m,
        windDir: c.winddirection_10m,
        precip: c.precipitation,
        code: c.weathercode,
        desc: WEATHER_CODES[c.weathercode] || "Desconhecido",
      };

      setPorts((prev) => prev.map((p) =>
        p.name === port.name && p.countryCode === port.countryCode
          ? { ...p, weather, weatherLoading: false } : p
      ));
    } catch {
      setPorts((prev) => prev.map((p) =>
        p.name === port.name && p.countryCode === port.countryCode
          ? { ...p, weather: null, weatherLoading: false } : p
      ));
    }
  }, []);

  const handleExpand = useCallback((port: PortActivity) => {
    const key = `${port.name}-${port.countryCode}`;
    setExpandedPorts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        // Fetch weather if not already fetched
        if (port.weather === undefined) {
          fetchWeather(port);
        }
      }
      return next;
    });
  }, [fetchWeather]);

  const countries = useMemo(() => {
    const set = new Set(ports.map((p) => p.country));
    return [...set].sort();
  }, [ports]);

  const filteredPorts = useMemo(() => {
    let list = ports.filter((p) => p.total >= minActivity);
    if (countryFilter !== "all") list = list.filter((p) => p.country === countryFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)
      );
    }
    return list;
  }, [ports, countryFilter, searchQuery, minActivity]);

  const totalActive = ports.filter((p) => p.total > 0).length;
  const totalBerth = ports.reduce((s, p) => s + p.atBerth, 0);
  const totalAnchor = ports.reduce((s, p) => s + p.atAnchor, 0);
  const totalApproach = ports.reduce((s, p) => s + p.approaching, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Port Activity"
        subtitle={`${totalActive} portos ativos de ${ports.length} monitorados — ao vivo via AIS.`}
        variant="blue"
      />

      {/* Summary bar */}
      <Card className="border border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-center">
          <div className="text-center">
            <span className="text-2xl font-black text-slate-900">{totalBerth}</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Atracados</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <span className="text-2xl font-black text-amber-600">{totalAnchor}</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Fundeados</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <span className="text-2xl font-black text-blue-600">{totalApproach}</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Aproximando</p>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="text-center">
            <span className="text-2xl font-black text-[#D80E16]">{totalActive}</span>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Portos ativos</p>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="border border-slate-200 rounded-2xl">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <Badge className="bg-[#D80E16] text-white text-[10px] font-black px-2.5 py-1">
            <Ship className="w-3 h-3 inline mr-1" /> AO VIVO
          </Badge>

          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Buscar porto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 outline-none focus:border-[#D80E16]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700">
            <option value="all">🌎 Todos os países</option>
            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={minActivity} onChange={(e) => setMinActivity(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700">
            <option value={1}>≥ 1 navio</option>
            <option value={3}>≥ 3 navios</option>
            <option value={5}>≥ 5 navios</option>
            <option value={10}>≥ 10 navios</option>
          </select>

          {lastUpdate && (
            <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" /> {lastUpdate}
            </span>
          )}

          <button onClick={fetchActivity}
            className="text-xs font-bold text-[#D80E16] hover:text-red-700 transition-colors">
            Atualizar
          </button>
        </CardContent>
      </Card>

      {(loading || loadingPorts) && ports.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <span className="ml-3 text-slate-500 font-medium">
            {loadingPorts ? "Carregando base de portos..." : "Analisando navios nos portos..."}
          </span>
        </div>
      )}

      {error && (
        <Card className="border border-red-200 bg-red-50 rounded-2xl">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={fetchActivity} className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium">
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      )}

      {!loading && !loadingPorts && !error && filteredPorts.length === 0 && (
        <Card className="border border-slate-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">
              {searchQuery || countryFilter !== "all"
                ? "Nenhum porto encontrado com esses filtros."
                : "Nenhum navio de carga detectado próximo aos portos monitorados no momento."}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredPorts.length > 0 && (
        <div className="space-y-2">
          {filteredPorts.slice(0, 200).map((port) => {
            const key = `${port.name}-${port.countryCode}`;
            return (
              <PortRow
                key={key}
                port={port}
                isExpanded={expandedPorts.has(key)}
                onToggle={() => handleExpand(port)}
              />
            );
          })}
          {filteredPorts.length > 200 && (
            <p className="text-center text-xs text-slate-400 py-2">
              Mostrando 200 de {filteredPorts.length} portos com atividade.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PortRow({ port, isExpanded, onToggle }: {
  port: PortActivity;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer"
      onClick={onToggle}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#D80E16]/10 flex items-center justify-center shrink-0">
            <Anchor className="w-4 h-4 text-[#D80E16]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 truncate">{port.name}</h4>
              {port.congestionPct > 50 && (
                <Badge className="bg-red-100 text-red-700 border-red-200 text-[8px] font-black shrink-0">
                  🔴 {port.congestionPct}%
                </Badge>
              )}
              {port.congestionPct > 25 && port.congestionPct <= 50 && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[8px] font-black shrink-0">
                  🟡 {port.congestionPct}%
                </Badge>
              )}
              {port.congestionPct > 0 && port.congestionPct <= 25 && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[8px] font-black shrink-0">
                  🟢 {port.congestionPct}%
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500">{port.country}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {port.atBerth > 0 && (
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-black">
                {port.atBerth}
              </Badge>
            )}
            {port.atAnchor > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-black">
                {port.atAnchor}
              </Badge>
            )}
            {port.approaching > 0 && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] font-black">
                {port.approaching}
              </Badge>
            )}
            <div className="text-right ml-2 border-l border-slate-200 pl-3">
              <span className="text-xl font-black text-slate-900">{port.total}</span>
              <span className="text-[9px] text-slate-400 block leading-tight">navios</span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            {/* Weather */}
            {port.weatherLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Carregando clima...
              </div>
            )}
            {port.weather && !port.weatherLoading && (
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-black gap-1">
                  <Thermometer className="w-3 h-3" /> {port.weather.temp.toFixed(0)}°C
                </Badge>
                <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px] font-black gap-1">
                  <Wind className="w-3 h-3" /> {port.weather.windSpeed.toFixed(0)} km/h {windDirLabel(port.weather.windDir)}
                </Badge>
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] font-black gap-1">
                  <CloudRain className="w-3 h-3" /> {port.weather.precip.toFixed(1)} mm
                </Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-[10px] font-black">
                  {port.weather.desc}
                </Badge>
              </div>
            )}
            {port.weather === null && !port.weatherLoading && (
              <p className="text-[10px] text-slate-400">Clima indisponível</p>
            )}

            {/* Congestion detail */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${port.atBerth > 0 ? (port.atBerth / (port.atBerth + port.atAnchor + port.approaching)) * 100 : 0}%`, float: "left" }} />
                <div className="h-full bg-amber-500 rounded-full transition-all"
                  style={{ width: `${port.atAnchor > 0 ? (port.atAnchor / (port.atBerth + port.atAnchor + port.approaching)) * 100 : 0}%`, float: "left" }} />
                <div className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${port.approaching > 0 ? (port.approaching / (port.atBerth + port.atAnchor + port.approaching)) * 100 : 0}%`, float: "left" }} />
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">
                {port.congestionPct}% congestionado
              </span>
            </div>

            {/* Vessel list */}
            {port.vessels.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Navios próximos</p>
                {port.vessels.map((v, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5">
                    <span className="font-medium truncate max-w-[200px]">{v.name}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge className={`text-[9px] font-black ${
                        v.speed < 0.5 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {v.speed < 0.5 ? "Parado" : `${v.speed.toFixed(1)} kn`}
                      </Badge>
                      <span className="text-slate-400 text-[10px]">{v.dist.toFixed(1)} km</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <MapPin className="w-3 h-3" />
              {port.lat.toFixed(3)}, {port.lng.toFixed(3)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
