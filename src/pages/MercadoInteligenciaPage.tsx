import React, { useState, useCallback, useEffect, useMemo, useRef, Suspense } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, ArrowLeft, Building2, MapPin, BarChart3,
  Loader2, AlertCircle, FileSearch, Globe,
  X, DollarSign, Package, Ship, Warehouse,
  Sparkles, SlidersHorizontal, Download, ChevronDown, ChevronUp,
} from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import { cn } from "@/lib/utils";
import { getMunicipioNome } from "@/services/ibge";
import { IntelExportData, exportIntelPDF, IntelExportCsv, exportIntelCSV } from "@/services/pdfExport";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { TradeGlobe, MapCity, MapCountry, CityCountryArc, CityCompanyInfo, CityCountryInfo } from "@/components/TradeGlobeLazy";
import { CountryFlag, comexToIso2 } from "@/components/intel/CountryFlag";
import { StateBadge } from "@/components/intel/StateBadge";
import { CompanyLogo } from "@/components/intel/CompanyLogo";
import { ViaIcon as ViaIconNew, UrfIcon, getTransportLabel as getTransportLabelNew, getTransportMode, TRANSPORT_MODES_NEW, ShipIcon, PlaneIcon, TruckIcon } from "@/components/intel/icons/TransportIcons";
import { CompanyDetailCard } from "@/components/intel/CompanyDetailCard";
import { CityDetailPanel } from "@/components/intel/CityDetailPanel";
import { SankeyFlow } from "@/components/intel/SankeyFlow";
import { CountryTreemap } from "@/components/intel/CountryTreemap";
import { CityPriceChart } from "@/components/intel/CityPriceChart";
import { MobileFilterDrawer } from "@/components/intel/MobileFilterDrawer";
import { MobileBottomNav } from "@/components/intel/MobileBottomNav";
import { MobileDataTable } from "@/components/intel/MobileDataTable";
// [REMOVED] import { ScoredCompaniesPanel } from "@/components/intel/ScoredCompaniesPanel";
// [REMOVED] import { CountryCompaniesPanel } from "@/components/intel/CountryCompaniesPanel";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface NcmItem { code: string; desc: string }
interface TradeRow {
  coNcm?: string; ncm?: string; metricFOB?: string; metricKg?: string;
  country?: string; year?: string; monthNumber?: string; period?: string;
  sgUf?: string; bloco?: string; [k: string]: any;
}
interface TradeSummary {
  totalFob: number; totalKg: number; ncmCount: number;
  countryCount: number; rowCount: number;
}
interface CityTrade {
  nome_mun: string; uf: string; vl_fob: number;
  cod_mun?: string; kg_liquido?: number; ops?: number;
}
interface IntelCompany {
  nome: string; cnae: string; cnae_desc: string;
  uf: string; municipio: string; nome_municipio?: string;
  capital_social?: number;
  likely_flow?: string;
  confidence_score?: number;
  confidence_label?: string;
  flow_type?: string;
  cnaes_secundarios?: string[];
  recof?: boolean;
  recof_date?: string;
  cnpj_basico?: string;
  cnpj?: string;
  razao_social?: string;
  bloco?: string;
  situacao_cadastral?: string;
  data_inicio_atividade?: string;
  estimated_fob_import?: number;
  estimated_kg_import?: number;
  estimated_fob_export?: number;
  estimated_kg_export?: number;
  price_per_kg_import?: number;
  price_per_kg_export?: number;
  city_trade?: { import_fob: number; import_kg: number; export_fob: number; export_kg: number };
  evidence?: string[]; // Which matching strategies hit (from backend)
}
interface IntelDetails {
  ncm: string;
  sh4?: string;
  cnaes: { cnae: string; descricao: string; score: number; tier: string }[];
  cnae_breakdown?: { cnae: string; descricao: string; total: number }[];
  evolution?: {
    previous_period: { year: string; month: string };
    import: { total_fob: number; total_kg: number; variation_fob_pct: number | null; variation_kg_pct: number | null };
    export: { total_fob: number; total_kg: number; variation_fob_pct: number | null; variation_kg_pct: number | null };
  };
  monthly_data?: {
    import: { year: string; month: string; fob: number; kg: number }[];
    export: { year: string; month: string; fob: number; kg: number }[];
  };
  yoy?: {
    import: { current: { fob: number; kg: number }; previous: { fob: number; kg: number }; variation_fob_pct: number | null; variation_kg_pct: number | null };
    export: { current: { fob: number; kg: number }; previous: { fob: number; kg: number }; variation_fob_pct: number | null; variation_kg_pct: number | null };
  };
  ncm_name?: string;
  ncm_unid?: string;
  ncm_fat?: string;
  import: { total_fob: number; total_kg: number; cities: CityTrade[]; countries: any[] };
  export: { total_fob: number; total_kg: number; cities: CityTrade[]; countries: any[] };
  empresas: Record<string, IntelCompany[]>;
  ncm_price_avg?: {
    import: { price_per_kg: number; total_fob: number; total_kg: number };
    export: { price_per_kg: number; total_fob: number; total_kg: number };
  };
  ports?: {
    import: PortEntry[];
    export: PortEntry[];
  };
  city_countries?: {
    import: Record<string, { cod_pais: string; nome_pais: string; vl_fob: number; kg_liquido: number }[]>;
    export: Record<string, { cod_pais: string; nome_pais: string; vl_fob: number; kg_liquido: number }[]>;
  };
  city_ports?: {
    import: Record<string, PortEntry[]>;
    export: Record<string, PortEntry[]>;
  };
  blocos?: { bloco: string; count: number; total_fob: number }[];
  city_capital_range?: Record<string, { min: number; max: number; avg: number }>;
}
interface PortEntry {
  via: string; via_name: string; urf: string; urf_name?: string; kg: number; fob: number;
  cod_pais?: string; nome_pais?: string;
  countries?: { cod_pais: string; nome_pais: string; kg: number; fob: number }[];
}

const UF_TO_IBGE: Record<string, string> = {
  AC: "12", AL: "27", AP: "16", AM: "13", BA: "29", CE: "23", DF: "53", ES: "32",
  GO: "52", MA: "21", MT: "51", MS: "50", MG: "31", PA: "15", PB: "25", PR: "41",
  PE: "26", PI: "22", RJ: "33", RN: "24", RS: "43", RO: "11", RR: "14", SC: "42",
  SP: "35", SE: "28", TO: "17",
};
const UF_LIST = Object.keys(UF_TO_IBGE);

/* ═══ Cache ═══ */
const CACHE_TTL = 5 * 60 * 1000;
const PERSISTENT_CACHE_KEY = "txa_intel_cache";
type CacheEntry = { data: any; ts: number };
function loadPersistentCache(): Map<string, CacheEntry> {
  try {
    const raw = sessionStorage.getItem(PERSISTENT_CACHE_KEY);
    if (raw) {
      const entries = JSON.parse(raw);
      const m = new Map<string, CacheEntry>();
      const now = Date.now();
      for (const [k, v] of Object.entries(entries)) {
        const e = v as CacheEntry;
        if (now - e.ts < CACHE_TTL) m.set(k, e);
      }
      return m;
    }
  } catch { /* ignore */ }
  return new Map();
}
function savePersistentCache(m: Map<string, CacheEntry>) {
  try {
    const obj: Record<string, CacheEntry> = {};
    const now = Date.now();
    m.forEach((v, k) => { if (now - v.ts < CACHE_TTL) obj[k] = v; });
    sessionStorage.setItem(PERSISTENT_CACHE_KEY, JSON.stringify(obj));
  } catch { /* ignore */ }
}
const ramCache = loadPersistentCache();
function getCached(key: string): any | null {
  const e = ramCache.get(key);
  if (e && Date.now() - e.ts < CACHE_TTL) return e.data;
  ramCache.delete(key); return null;
}
function setCached(key: string, data: any) {
  ramCache.set(key, { data, ts: Date.now() });
  if (ramCache.size > 200) {
    const oldest = [...ramCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
    if (oldest) ramCache.delete(oldest[0]);
  }
  savePersistentCache(ramCache);
}

/* ═══ Page State Persistence (survives navigation away & back) ═══ */
const PAGE_STATE_KEY = "txa_intel_page_state";
const PAGE_STATE_KEY_LOCAL = "txa_intel_page_state_local";
interface PageState {
  ncms: NcmItem[];
  details: IntelDetails | null;
  tab: "import" | "export";
  selectedCity: string | null;
  selectedPais: string | null;
  volumeThreshold: number;
  blocoFilter: string;
  modalFilter: string;
  period: { mode: string; year?: number; month?: number; count?: number };
  cityNames: Record<string, string>;
}
function savePageState(state: PageState) {
  try {
    sessionStorage.setItem(PAGE_STATE_KEY, JSON.stringify(state));
    // Also save to localStorage as a fallback for tab restore
    try {
      localStorage.setItem(PAGE_STATE_KEY_LOCAL, JSON.stringify({ ...state, _ts: Date.now() }));
    } catch {}
  } catch { /* quota exceeded, ignore */ }
}
function loadPageState(): PageState | null {
  try {
    const raw = sessionStorage.getItem(PAGE_STATE_KEY);
    if (raw) return JSON.parse(raw);
    // Fallback to localStorage
    const rawLocal = localStorage.getItem(PAGE_STATE_KEY_LOCAL);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      const { _ts, ...state } = parsed;
      // Only use localStorage if saved within last 30 minutes
      if (_ts && Date.now() - _ts < 30 * 60 * 1000) {
        return state as PageState;
      }
    }
  } catch { /* ignore */ }
  return null;
}

/* ═══ Formatters ═══ */
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
  if (n < 1) return `${(n * 1000).toFixed(0)} g`;
  return `${n.toFixed(0)} kg`;
}
function fmtCnpj(c: string | undefined) {
  if (!c) return "";
  // Handle full 14-digit CNPJ (cnpj_basico + ordem + dv)
  const digits = c.replace(/\D/g, "");
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  }
  // Handle 8-digit cnpj_basico only
  if (digits.length === 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}`;
  }
  return c;
}

/* ═══ City Name Resolver ═══ */
const cityNameCache = new Map<string, string>();
async function resolveCityName(code: string): Promise<string> {
  if (cityNameCache.has(code)) return cityNameCache.get(code)!;
  try { const name = await getMunicipioNome(code); cityNameCache.set(code, name); return name; }
  catch { return code; }
}

/* ═══ API ═══ */
async function apiGet(url: string): Promise<any> {
  try { const r = await fetch(url); return r.ok ? r.json() : null; } catch { return null; }
}
async function apiPost(url: string, body: any): Promise<any> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return r.ok ? r.json() : null;
  } catch { return null; }
}
async function searchNcm(text: string): Promise<NcmItem[]> {
  const d = await apiGet(`/api/proxy/comexstat/tables/ncm?search=${encodeURIComponent(text)}&language=pt`);
  return (d?.data?.list || []).slice(0, 10).map((s: any) => ({ code: s.coNcm || "", desc: s.noNCM || "" }));
}
async function fetchIntelDetails(ncm: string, month?: string, year?: string, months?: number, minCapital?: number, minConfidence?: number): Promise<IntelDetails | "NETWORK_ERROR" | "NOT_FOUND" | "NO_DATA" | null> {
  try {
    let url = `/api/intel/ncm/${ncm}/details`;
    const params: string[] = [];
    if (month && year) {
      params.push(`month=${month}`, `year=${year}`);
    } else if (year && !month) {
      params.push(`year=${year}`);
    }
    if (months !== undefined && months > 0 && months <= 12) {
      params.push(`months=${months}`);
    }
    if (minCapital !== undefined && minCapital > 0) {
      params.push(`min_capital=${minCapital}`);
    }
    if (minConfidence !== undefined && minConfidence > 0) {
      params.push(`min_confidence=${minConfidence}`);
    }
    if (params.length) {
      url += "?" + params.join("&");
    }
    const res = await fetch(url);
    if (res.status === 404) return "NOT_FOUND";
    if (!res.ok) return "NETWORK_ERROR";
    const data = await res.json();
    // Check if NCM has no trade data at all
    if (!data || (!data.empresas && !data.trade_summary)) {
      return "NO_DATA";
    }
    const empresas: Record<string, IntelCompany[]> = {};
    for (const [key, list] of Object.entries(data.empresas || {})) {
      const normKey = key.includes("_") ? key : `_${key}`;
      empresas[normKey] = (list as any[]).map(e => ({
        nome: e.nome_fantasia || e.razao_social || e.nome || "N/I",
        cnae: e.cnae_fiscal || e.cnae || "",
        cnae_desc: e.cnae_desc || "",
        uf: e.uf || "",
        municipio: e.municipio || "",
        nome_municipio: e.nome_municipio || "",
        capital_social: e.capital_social || 0,
        likely_flow: e.likely_flow || e.flow_type || "unknown",
        confidence_score: e.confidence_score || 0,
        confidence_label: e.confidence_label || "",
        flow_type: e.flow_type || "",
        cnaes_secundarios: e.cnaes_secundarios || [],
        recof: e.recof || false,
        recof_date: e.recof_date || "",
        cnpj_basico: e.cnpj_basico || "",
        cnpj: e.cnpj || "",
        razao_social: e.razao_social || "",
        evidence: e.evidence || [],
      })).filter(e => e.nome !== "N/I");
    }
    data.empresas = empresas;
    return data;
  } catch { return "NETWORK_ERROR"; }
}
async function queryTrade(flow: string, ncms: string[], months: number, ufs: string[], specificMonth?: { year: number; month: number } | null): Promise<{ rows: TradeRow[]; summary: TradeSummary }> {
  const now = new Date();
  let endMonth = now.getMonth() + 1, endYear = now.getFullYear();
  let startMonth = endMonth - months, startYear = endYear;
  while (startMonth <= 0) { startMonth += 12; startYear -= 1; }

  if (specificMonth) {
    startYear = specificMonth.year; startMonth = specificMonth.month;
    endYear = specificMonth.year; endMonth = specificMonth.month;
  }

  const cacheKey = `${flow}|${ncms.join(",")}|${startYear}-${startMonth}|${endYear}-${endMonth}|${ufs.join(",")}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  const periods: { from: string; to: string }[] = [];
  if (startYear === endYear) {
    periods.push({ from: `${startYear}-${String(startMonth).padStart(2, "0")}`, to: `${endYear}-${String(endMonth).padStart(2, "0")}` });
  } else {
    periods.push({ from: `${startYear}-${String(startMonth).padStart(2, "0")}`, to: `${startYear}-12` });
    periods.push({ from: `${endYear}-01`, to: `${endYear}-${String(endMonth).padStart(2, "0")}` });
  }
  const filters: any[] = ncms.map(n => ({ filter: "heading", values: [n.replace(/\D/g, '').substring(0, 4)] }));
  if (ufs.length) filters.push({ filter: "state", values: ufs.map(u => UF_TO_IBGE[u]) });
  const allRows: TradeRow[] = [];
  for (const p of periods) {
    const r = await apiPost("/api/proxy/comexstat/general", {
      flow: flow === "import" ? "import" : "export",
      period: p, details: ["ncm", "country"], filters,
    });
    allRows.push(...(r?.data?.list || []));
  }
  const totalFob = allRows.reduce((s, r) => s + Number(r.metricFOB || 0), 0);
  const totalKg = allRows.reduce((s, r) => s + Number(r.metricKg || 0), 0);
  const out = {
    rows: allRows,
    summary: { totalFob, totalKg, ncmCount: new Set(allRows.map(r => r.coNcm)).size, countryCount: new Set(allRows.map(r => r.country)).size, rowCount: allRows.length },
  };
  setCached(cacheKey, out);
  return out;
}
function exportCsv(rows: TradeRow[], flow: string) {
  const header = "NCM,Descrição,País,Valor FOB,Peso (kg)";
  const lines = rows.map(r =>
    `"${r.coNcm || ""}","${(r.ncm || "").replace(/"/g, '""')}","${(r.country || "").replace(/"/g, '""')}",${r.metricFOB || 0},${r.metricKg || 0}`
  );
  const blob = new Blob(["\ufeff" + [header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `tradexa_${flow}_${Date.now()}.csv`;
  a.click();
}

/* ═══════════════════════════════════════════
   TRANSPORT MODE HELPERS — SVG icons
   ═══════════════════════════════════════════ */

function ShipSvg({ className }: { className?: string }) {
  return <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4a11.6 11.6 0 0 0 1.62 6"/><path d="M12 4V2"/><path d="M9 3h6"/></svg>;
}
function PlaneSvg({ className }: { className?: string }) {
  return <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
}
function TruckSvg({ className }: { className?: string }) {
  return <svg className={className || "w-4 h-4"} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
}

function ViaIcon({ viaName, className }: { viaName: string; className?: string }) {
  const name = viaName.toLowerCase();
  if (name.includes("mar") || name.includes("maritimo") || name.includes("marítimo") || name.includes("ocean")) return <ShipSvg className={className} />;
  if (name.includes("aer") || name.includes("aereo") || name.includes("aéreo") || name.includes("air")) return <PlaneSvg className={className} />;
  if (name.includes("rod") || name.includes("rodoviario") || name.includes("rodoviário") || name.includes("road") || name.includes("truck")) return <TruckSvg className={className} />;
  return <ShipSvg className={className} />;
}

function getTransportLabel(viaName: string): string {
  const name = viaName.toLowerCase();
  if (name.includes("mar") || name.includes("maritimo") || name.includes("marítimo") || name.includes("ocean")) return "Marítimo";
  if (name.includes("aer") || name.includes("aereo") || name.includes("aéreo") || name.includes("air")) return "Aéreo";
  if (name.includes("rod") || name.includes("rodoviario") || name.includes("rodoviário") || name.includes("road") || name.includes("truck")) return "Rodoviário";
  return viaName;
}

function normalizeViaKey(viaName: string): string {
  const name = viaName.toLowerCase();
  if (name.includes("mar") || name.includes("maritimo") || name.includes("marítimo") || name.includes("ocean")) return "Maritimo";
  if (name.includes("aer") || name.includes("aereo") || name.includes("aéreo") || name.includes("air")) return "Aereo";
  if (name.includes("rod") || name.includes("rodoviario") || name.includes("rodoviário") || name.includes("road") || name.includes("truck")) return "Rodoviario";
  return "Outros";
}

const TRANSPORT_MODES: { key: string; icon: React.ReactNode; label: string }[] = [
  { key: "Maritimo", icon: <ShipIcon size={16} />, label: "Marítimo" },
  { key: "Aereo", icon: <PlaneIcon size={16} />, label: "Aéreo" },
  { key: "Rodoviario", icon: <TruckIcon size={16} />, label: "Rodoviário" },
];

/* ═══════════════════════════════════════════
   COMPANY SCORING — Multi-signal detection
   ═══════════════════════════════════════════ */

const USD_TO_BRL = 5.0;
const MIN_CAPITAL_BRL = 50000 * USD_TO_BRL; // R$ 250.000

/** CNAEs de comércio exterior para detecção de importadores/exportadores */
const TRADE_CNAES = new Set([
  "46893", // Comércio atacadista de produtos químicos (trading)
  "46301", // Comércio atacadista de alimentos
  "46494", // Comércio atacadista de medicamentos
  "46500", // Comércio atacadista de máquinas
  "46603", // Comércio atacadista de madeira/ferro
  "46606", // Comércio atacadista de materiais de construção
  "46701", // Comércio atacadista de têxteis
  "46801", // Comércio atacadista especializado
  "46802", // Comércio atacadista de outros produtos
  "46809", // Comércio atacadista de outros produtos
  "46900", // Comércio atacadista não-especializado
  "46478", // Comércio atacadista de equipamentos
  "46501", // Comércio atacadista de máquinas e equipamentos
  "46602", // Comércio atacadista de ferragens
]);

/** Palavras-chave no nome da empresa que sugerem comércio exterior */
const TRADE_KEYWORDS = [
  "import", "export", "trading", "logistics", "logistica",
  "international", "global", "world", "worldwide",
  "comercio exterior", "comercio internacional",
  "transporte internacional", "frete internacional",
  "do brasil", "brasil trade", "trade",
  "shipping", "ocean", "maritima", "marítima",
  "forwarding", "cargo", "log", "distribuidora",
];

function recalcCompanyScore(company: IntelCompany): { score: number; label: string; flowIcon: string } {
  // Use backend confidence_score as the single source of truth
  const score = company.confidence_score || 0;

  let label: string;
  if (score >= 80) label = "Alta";
  else if (score >= 55) label = "Media";
  else label = "Baixa";

  // No emojis — return empty string, UI uses text labels
  const flowIcon = "";

  return { score, label, flowIcon };
}

/* ═══════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════ */

/* ─── CityCountryRow: extracted from map callback to fix hook-inside-loop (React #310) ─── */
function CityCountryRow({ cc, ncm, tab, setSelectedPais }: {
  cc: { cod_pais: string; nome_pais: string; vl_fob: number; kg_liquido: number };
  ncm: string;
  tab: "import" | "export";
  setSelectedPais: (p: string | null) => void;
}) {
  const [showCC, setShowCC] = React.useState(false);
  const countryPpk = cc.kg_liquido > 0 ? cc.vl_fob / cc.kg_liquido : 0;
  return (
    <div>
      <div className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200"
        onClick={() => { setShowCC(!showCC); setSelectedPais(cc.cod_pais); }}
      >
        <CountryFlag codPais={cc.cod_pais} nome={cc.nome_pais} size="sm" />
        <span className="text-slate-800 font-semibold truncate min-w-0">{cc.nome_pais}</span>
        <span className="font-mono text-slate-500 text-[11px] shrink-0 ml-auto">{fmtKg(cc.kg_liquido)}</span>
        <span className="font-mono font-bold text-slate-600 text-[11px] w-16 text-right shrink-0">{countryPpk > 0 ? `$${countryPpk.toFixed(2)}` : '-'}</span>
        <span className="font-bold text-slate-900 text-xs w-24 text-right shrink-0">{fmtUSD(cc.vl_fob)}</span>
        {showCC ? (
          <ChevronUp className="h-3.5 w-3.5 text-[#D80E16] shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        )}
      </div>
      {showCC && null}
      {/* [REMOVED] CountryCompaniesPanel */}
    </div>
  );
}

export default function MercadoInteligenciaPage() {
  useSeo({ title: "Inteligência de Mercado — Análise por NCM | TRADEXA" });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ─── State ─── */
  const [latestMonth, setLatestMonth] = useState<{import: {year: number, month: number, fob_usd_millions: number} | null, export: {year: number, month: number, fob_usd_millions: number} | null}>({import: null, export: null});

  // Fetch latest available month on mount
  useEffect(() => {
    fetch("/api/intel/latest-month")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setLatestMonth(d); })
      .catch(() => {});
  }, []);
  const [ncms, setNcms] = useState<NcmItem[]>(() => {
    // Restore single NCM from URL on mount
    const ncmParam = searchParams.get("ncm");
    if (ncmParam) {
      return [{ code: ncmParam.trim(), desc: ncmParam.trim() }];
    }
    return [];
  });
  const [ncmInput, setNcmInput] = useState("");
  const [ncmSug, setNcmSug] = useState<NcmItem[]>([]);
  const [showNcmSug, setShowNcmSug] = useState(false);
  const [ncmLoading, setNcmLoading] = useState(false);
  const [ufs, setUfs] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const [tab, setTab] = useState<"import" | "export">("import");
  const [loading, setLoading] = useState(false);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [loadingTrade, setLoadingTrade] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<{ mode: string; year?: number; month?: number; count?: number }>({ mode: "full_year", year: 2026 });

  const [tradeData, setTradeData] = useState<TradeRow[]>([]);
  const [tradeSummary, setTradeSummary] = useState<TradeSummary | null>(null);
  const [details, setDetails] = useState<IntelDetails | null>(null);
  const [cityNames, setCityNames] = useState<Map<string, string>>(new Map());
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPais, setSelectedPais] = useState<string | null>(null);
  const [volumeThreshold, setVolumeThreshold] = useState<number>(0);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [expandedPais, setExpandedPais] = useState<string | null>(null);
  const [expandedCompanyCity, setExpandedCompanyCity] = useState<string | null>(null);
  const [showAllCompanies, setShowAllCompanies] = useState<Set<string>>(new Set());
  const [blocoFilter, setBlocoFilter] = useState("");
  const [modalFilter, setModalFilter] = useState<string>("");
  const [cityPanelOpen, setCityPanelOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleShowAll = useCallback((codMun: string) => {
    setShowAllCompanies(prev => {
      const next = new Set(prev);
      if (next.has(codMun)) next.delete(codMun);
      else next.add(codMun);
      return next;
    });
  }, []);

  const ncmRef = useRef<HTMLInputElement>(null);
  const ncmDropRef = useRef<HTMLDivElement>(null);
  const [ufOpen, setUfOpen] = useState(false);
  const ufDropdownRef = useRef<HTMLDivElement>(null);
  const ufDropRef = useRef<HTMLDivElement>(null);

  /* ─── Autocomplete ─── */
  useEffect(() => {
    if (ncmInput.length < 2) { setNcmSug([]); setShowNcmSug(false); return; }
    const t = setTimeout(async () => {
      setNcmLoading(true);
      const r = await searchNcm(ncmInput);
      setNcmSug(r.filter(x => x.code && !ncms.some(n => n.code === x.code)));
      setShowNcmSug(true);
      setNcmLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [ncmInput, ncms]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ncmDropRef.current && !ncmDropRef.current.contains(e.target as Node) && ncmRef.current && !ncmRef.current.contains(e.target as Node)) setShowNcmSug(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    if (!ufOpen) return;
    const h = (e: MouseEvent) => {
      if (ufDropdownRef.current && !ufDropdownRef.current.contains(e.target as Node)) setUfOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ufOpen]);
  const addNcm = (code: string, desc?: string) => {
    if (ncms.some(n => n.code === code)) return;
    setNcms([{ code, desc: desc || code }]);
    setNcmInput(""); setShowNcmSug(false);
  };
  const removeNcm = (_code: string) => setNcms([]);
  const toggleUf = (uf: string) => setUfs(p => p.includes(uf) ? p.filter(u => u !== uf) : [...p, uf]);

  // Sync NCMs → URL params
  useEffect(() => {
    if (ncms.length > 0) {
      setSearchParams({ ncm: ncms[0].code }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [ncms]);

  // Auto-search on mount if NCMs restored from URL
  const hasAutoSearched = useRef(false);
  const restoredState = useRef(false);
  useEffect(() => {
    if (ncms.length > 0 && !hasAutoSearched.current) {
      hasAutoSearched.current = true;
      // Try to restore full page state from sessionStorage (survives navigation away & back)
      const saved = loadPageState();
      if (saved && saved.ncms.length > 0 && saved.ncms[0]?.code === ncms[0]?.code) {
        // Restore cached data — skip API call
        restoredState.current = true;
        setDetails(saved.details);
        setTab(saved.tab);
        setSelectedCity(saved.selectedCity);
        setSelectedPais(saved.selectedPais);
        setVolumeThreshold(saved.volumeThreshold);
        setBlocoFilter(saved.blocoFilter);
        setModalFilter(saved.modalFilter);
        if (saved.period) {
          setPeriod(saved.period);
        } else if ((saved as any).monthFilter) {
          const old = (saved as any).monthFilter;
          setPeriod(old ? { mode: "specific_month", year: old.year, month: old.month } : { mode: "full_year", year: 2026 });
        }
        if (saved.cityNames && Object.keys(saved.cityNames).length > 0) {
          setCityNames(new Map(Object.entries(saved.cityNames)));
        }
        return;
      }
      const t = setTimeout(() => search(), 100);
      return () => clearTimeout(t);
    }
  }, []);

  // Save page state whenever details or active filters change
  useEffect(() => {
    if (!details || !ncms.length) return;
    const state: PageState = {
      ncms,
      details,
      tab,
      selectedCity,
      selectedPais,
      volumeThreshold,
      blocoFilter,
      modalFilter,
      period,
      cityNames: Object.fromEntries(cityNames),
    };
    savePageState(state);
  }, [details, tab, selectedCity, selectedPais, volumeThreshold, blocoFilter, modalFilter, period, cityNames, ncms]);

  /* ─── Search ─── */
  const search = useCallback(async () => {
    if (!ncms.length) return;
    setLoading(true); setError(null);
    setDetails(null); setCityNames(new Map());
    setSelectedCity(null); setExpandedCity(null);
    setFilterOpen(false);
    try {
      setLoadingIntel(true);
      try {
        let apiMonth: string | undefined;
        let apiYear: string | undefined;
        let apiMonths: number | undefined;
        if (period.mode === "months") {
          apiMonths = period.count;
        } else if (period.mode === "full_year") {
          apiYear = String(period.year);
        } else if (period.mode === "specific_month") {
          apiMonth = String(period.month).padStart(2, "0");
          apiYear = String(period.year);
        }

        // Fetch single NCM
        const ncmCode = ncms[0].code.replace(/\D/g, "");
        const result = await fetchIntelDetails(ncmCode, apiMonth, apiYear, apiMonths, 360000);

        if (!result || typeof result === "string" || !(result as IntelDetails).empresas) {
          if (result === "NETWORK_ERROR") {
            setError("Erro de conexão. Verifique sua internet e tente novamente.");
          } else if (result === "NOT_FOUND") {
            setError("NCM não encontrado na base. Verifique o código e tente novamente.");
          } else if (result === "NO_DATA") {
            setError("Nenhum dado de comércio exterior encontrado para este NCM no período selecionado.");
          } else {
            setError("Erro ao carregar dados. Tente novamente.");
          }
        } else {
          // Resolve city names
          if (result.empresas) {
            const codes = [...new Set(Object.keys(result.empresas).map(k => k.split("_")[1]).filter(Boolean))];
            const resolved = new Map<string, string>();
            await Promise.all(codes.map(async c => {
              try { resolved.set(c, await resolveCityName(c)); } catch { resolved.set(c, c); }
            }));
            setCityNames(resolved);
          }
          setDetails(result);
        }
      } finally { setLoadingIntel(false); }
    } catch { setError("Erro de conexão. Verifique sua internet e tente novamente."); }
    setLoading(false);
  }, [ncms, ufs, period]);
  useEffect(() => { if (ncms.length) search(); }, [tab, period, ufs]);

  /* ─── Derived data ─── */
  const flowCities = useMemo(() => {
    if (!details) return [];
    const cities = (tab === "import" ? details.import?.cities : details.export?.cities) || [];
    if (!ufs.length) return cities.filter(c => (c.vl_fob || 0) > 0 && (c.kg_liquido || 0) > 0);
    return cities.filter(c => ufs.includes(c.uf) && (c.vl_fob || 0) > 0 && (c.kg_liquido || 0) > 0);
  }, [details, tab, ufs]);
  const flowTotals = useMemo(() => {
    if (!details) return null;
    const raw = tab === "import" ? details.import : details.export;
    if (!ufs.length) return raw;
    // Recompute totals from filtered cities
    const filteredCities = raw.cities?.filter(c => ufs.includes(c.uf)) || [];
    const totalFob = filteredCities.reduce((s, c) => s + (c.vl_fob || 0), 0);
    const totalKg = filteredCities.reduce((s, c) => s + (c.kg_liquido || 0), 0);
    return { ...raw, total_fob: totalFob, total_kg: totalKg, cities: filteredCities };
  }, [details, tab, ufs]);
  const flowCountries = useMemo(() => {
    if (!details) return [];
    const countries = (tab === "import" ? details.import?.countries : details.export?.countries) || [];
    const filtered = countries.filter(c => (c.vl_fob || 0) > 0);
    if (!ufs.length) return filtered;
    // Filter countries — keep only those present in filtered cities
    const cityCountries = details.city_countries?.[tab === "import" ? "import" : "export"] || {};
    const filteredCities = flowCities;
    const keptPaises = new Set<string>();
    for (const ct of filteredCities) {
      const entries = cityCountries[ct.cod_mun] || [];
      for (const e of entries) {
        if (e.cod_pais) keptPaises.add(String(e.cod_pais));
      }
    }
    if (!keptPaises.size) return filtered;
    return filtered.filter(c => keptPaises.has(String(c.cod_pais)));
  }, [details, tab, ufs, flowCities]);

  const companyGroups = useMemo(() => {
    if (!details?.empresas) return [];
    // Build lookup by IBGE code (cod_mun) instead of city name
    const tradeByMun = new Map<string, CityTrade>();
    for (const c of flowCities) {
      if (c.cod_mun) tradeByMun.set(c.cod_mun, c);
    }
    const groups: { cityName: string; uf: string; tradeFob: number; codMun: string; companies: IntelCompany[] }[] = [];
    for (const [key, list] of Object.entries(details.empresas)) {
      const parts = key.split("_");
      if (parts.length < 2 || !list.length) continue;
      const empUf = parts[0];
      if (ufs.length && !ufs.includes(empUf)) continue;
      const codMun = parts[1];
      // Match by IBGE code — reliable, no accent issues
      const tradeCity = tradeByMun.get(codMun);
      if (!tradeCity) continue;
      const cityName = cityNames.get(codMun) || codMun;
      // Use backend score directly — no frontend recalculation
      // Remove the R$ 200K capital filter — backend already filters by min_capital
      const scored = list
        .map(c => ({ ...c, _score: c.confidence_score || 0 }))
        .filter(c => c._score > 0)
        .sort((a, b) => b._score - a._score);
      if (!scored.length) continue;
      groups.push({ cityName, uf: empUf, tradeFob: tradeCity.vl_fob || 0, codMun, companies: scored });
    }
    groups.sort((a, b) => b.tradeFob - a.tradeFob || b.companies.length - a.companies.length);
    return groups;
  }, [details, flowCities, cityNames, ufs]);

  const filteredGroupsAll = useMemo(() => {
    let groups = selectedCity ? companyGroups.filter(g => g.codMun === selectedCity) : companyGroups;
    // Bloco filter — check if any company's city trades with this bloco
    if (blocoFilter && details?.city_countries) {
      const cityData = tab === "import" ? details.city_countries.import : details.city_countries.export;
      const citiesWithBloco = new Set<string>();
      for (const [cityCode, countries] of Object.entries(cityData)) {
        if (countries.some(c => c.nome_pais?.toLowerCase().includes(blocoFilter.toLowerCase()))) {
          citiesWithBloco.add(cityCode);
        }
      }
      groups = groups.filter(g => citiesWithBloco.has(g.codMun));
    }
    // Modal filter — filter cities by transport mode
    if (modalFilter && details?.city_modal) {
      const cityModal = tab === "import" ? details.city_modal.import : details.city_modal.export;
      if (cityModal && typeof cityModal === "object") {
        const citiesWithModal = new Set<string>();
        for (const [cityCode, modals] of Object.entries(cityModal)) {
          if (Array.isArray(modals) && modals.some((m: any) => {
            const via = (m.via_name || "").toLowerCase();
            return via.includes(modalFilter.toLowerCase());
          })) {
            citiesWithModal.add(cityCode);
          }
        }
        if (citiesWithModal.size > 0) {
          groups = groups.filter(g => citiesWithModal.has(g.codMun));
        }
      }
    }
    // Sort companies by score descending (default)
    groups = groups.map(g => {
      const sorted = [...g.companies].sort((a, b) => (b._score || 0) - (a._score || 0));
      return { ...g, companies: sorted };
    });
    return groups;
  }, [companyGroups, selectedCity, blocoFilter, details, tab, modalFilter]);

  const totalCompanies = useMemo(() => filteredGroupsAll.reduce((s, g) => s + g.companies.length, 0), [filteredGroupsAll]);

  // City options for filter dropdown
  const cityOptions = useMemo(() => {
    return flowCities.map(c => ({ cod_mun: c.cod_mun || "", nome: c.nome_mun, uf: c.uf }))
      .filter((v, i, a) => a.findIndex(x => x.cod_mun === v.cod_mun) === i)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [flowCities]);

  // Cities that already have matched companies (so we skip SH4-level countries/ports fallback)
  const citiesWithCompanies = useMemo(() => {
    const set = new Set<string>();
    for (const g of companyGroups) {
      if (g.companies.length > 0) set.add(g.codMun);
    }
    return set;
  }, [companyGroups]);

  // Countries display (from trade data when available)
  const displayCountries = useMemo(() => {
    if (tradeData.length > 0) {
      const m = new Map<string, number>();
      tradeData.forEach(r => {
        const c = r.country || "Outros";
        m.set(c, (m.get(c) || 0) + Number(r.metricFOB || 0));
      });
      return [...m].map(([nome_pais, vl_fob]) => ({ nome_pais, vl_fob }))
        .sort((a, b) => b.vl_fob - a.vl_fob);
    }
    return flowCountries;
  }, [tradeData, flowCountries]);

  // Summary totals - use Intel API data (correctly scoped by months)
  const displayTotals = useMemo(() => {
    if (flowTotals && (flowTotals.total_kg > 0 || flowTotals.total_fob > 0)) {
      return flowTotals;
    }
    return flowTotals;
  }, [flowTotals]);

  // Period label
  const periodLabel = useMemo(() => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    if (period.mode === "specific_month") {
      return `${monthNames[(period.month || 1) - 1]}/${period.year}`;
    } else if (period.mode === "months") {
      return `Últimos ${period.count} meses`;
    }
    return `${period.year} (completo)`;
  }, [period]);

  // Sparkline data (monthly FOB evolution for summary cards)
  // Sparkline data (monthly FOB evolution) from Intel API
  const sparklineData = useMemo(() => {
    const md = details?.monthly_data?.[tab === "import" ? "import" : "export"] || [];
    return md.map(d => ({ fob: d.fob }));
  }, [details, tab]);

  // Sparkline data (monthly KG evolution)
  const sparklineKgData = useMemo(() => {
    const md = details?.monthly_data?.[tab === "import" ? "import" : "export"] || [];
    return md.map(d => ({ kg: d.kg }));
  }, [details, tab]);

  // Sparkline data (monthly price-per-kg evolution)
  const sparklinePriceData = useMemo(() => {
    const md = details?.monthly_data?.[tab === "import" ? "import" : "export"] || [];
    return md.map(d => ({ price: d.kg > 0 ? d.fob / d.kg : 0 }));
  }, [details, tab]);

  // City countries/ports for expanded view
  const cityCountries = useMemo(() => {
    if (!details?.city_countries) return null;
    return tab === "import" ? details.city_countries.import : details.city_countries.export;
  }, [details, tab]);

  const cityPorts = useMemo(() => {
    if (!details?.city_ports) return null;
    return tab === "import" ? details.city_ports.import : details.city_ports.export;
  }, [details, tab]);

  // Fallback: opposite tab ports for when current tab has no data
  const cityPortsOpposite = useMemo(() => {
    if (!details?.city_ports) return null;
    return tab === "import" ? details.city_ports.export : details.city_ports.import;
  }, [details, tab]);

  // Modal data (transport mode aggregates per city)
  const cityModal = useMemo(() => {
    if (!details?.city_modal) return null;
    return tab === "import" ? details.city_modal.import : details.city_modal.export;
  }, [details, tab]);

  const cityModalOpposite = useMemo(() => {
    if (!details?.city_modal) return null;
    return tab === "import" ? details.city_modal.export : details.city_modal.import;
  }, [details, tab]);

  // Helper: get best transport info for a city, trying current tab then opposite
  function getCityTransportMode(cityCode: string): { viaKey: string; label: string; kg: number; pct?: number } | null {
    // 1. Try cityPorts (current tab)
    const ports = cityPorts?.[cityCode];
    if (ports && ports.length > 0) {
      const bp = ports[0];
      return { viaKey: bp.via_name, label: getTransportLabel(bp.via_name), kg: bp.kg || 0 };
    }
    // 2. Try cityModal (current tab)
    const modal = cityModal?.[cityCode];
    if (modal) {
      const entries = Object.entries(modal)
        .filter(([_, v]: any) => (v as any).kg > 0)
        .sort((a: any, b: any) => b[1].pct - a[1].pct);
      if (entries.length > 0) {
        const [viaKey, info] = entries[0] as [string, any];
        return { viaKey, label: getTransportLabel(viaKey), kg: info.kg, pct: info.pct };
      }
    }
    // 3. Try opposite tab's city_ports
    const oppPorts = cityPortsOpposite?.[cityCode];
    if (oppPorts && oppPorts.length > 0) {
      const bp = oppPorts[0];
      return { viaKey: bp.via_name, label: getTransportLabel(bp.via_name), kg: bp.kg || 0 };
    }
    // 4. Try opposite tab's city_modal
    const oppModal = cityModalOpposite?.[cityCode];
    if (oppModal) {
      const entries = Object.entries(oppModal)
        .filter(([_, v]: any) => (v as any).kg > 0)
        .sort((a: any, b: any) => b[1].pct - a[1].pct);
      if (entries.length > 0) {
        const [viaKey, info] = entries[0] as [string, any];
        return { viaKey, label: getTransportLabel(viaKey), kg: info.kg, pct: info.pct };
      }
    }
    return null;
  }

  // Globe data — cities with coordinates for the 3D globe
  const globeCities = useMemo((): MapCity[] => {
    return flowCities.map(c => ({
      cod_mun: c.cod_mun || "",
      nome_mun: c.nome_mun,
      uf: c.uf,
      vl_fob: c.vl_fob,
      kg_liquido: c.kg_liquido,
    }));
  }, [flowCities]);

  // Globe data — countries with FOB/KG values
  const globeCountries = useMemo((): MapCountry[] => {
    // Build kg lookup from per-city country data if available
    const kgByCountry = new Map<string, number>();
    if (cityCountries) {
      for (const ccList of Object.values(cityCountries)) {
        for (const cc of ccList) {
          kgByCountry.set(cc.cod_pais, (kgByCountry.get(cc.cod_pais) || 0) + (cc.kg_liquido || 0));
        }
      }
    }
    return flowCountries.map(c => ({
      cod_pais: c.cod_pais || "",
      nome_pais: c.nome_pais || "",
      vl_fob: c.vl_fob || 0,
      kg_liquido: kgByCountry.get(c.cod_pais) || (c as any).kg_liquido || 0,
    }));
  }, [flowCountries, cityCountries]);

  // Globe data — arcs between countries and cities
  const globeArcs = useMemo((): CityCountryArc[] => {
    if (!cityCountries) return [];
    const arcs: CityCountryArc[] = [];
    for (const [cityCode, ccList] of Object.entries(cityCountries)) {
      for (const cc of ccList) {
        // Determine transport mode from city ports
        let via: string | undefined;
        if (cityPorts?.[cityCode]?.[0]) {
          via = cityPorts[cityCode][0].via_name?.toLowerCase().includes("mar") ? "maritimo"
            : cityPorts[cityCode][0].via_name?.toLowerCase().includes("aer") ? "aereo"
            : cityPorts[cityCode][0].via_name?.toLowerCase().includes("rod") ? "rodoviario"
            : undefined;
        }
        arcs.push({
          cityCode,
          countryCode: cc.cod_pais,
          fob: cc.vl_fob || 0,
          kg: cc.kg_liquido || 0,
          via,
        });
      }
    }
    return arcs.filter(a => a.kg > 0 || a.fob > 0);
  }, [cityCountries, cityPorts]);

  // Globe data — company info per city for the info panel
  const globeCompanyData = useMemo((): Record<string, CityCompanyInfo> => {
    const data: Record<string, CityCompanyInfo> = {};
    for (const g of companyGroups) {
      const sorted = [...g.companies].sort((a, b) => (b._score || 0) - (a._score || 0));
      data[g.codMun] = {
        companyCount: g.companies.length,
        topCompanies: sorted.slice(0, 10).map(c => ({
          nome: c.nome,
          score: c._score || 0,
          likely_flow: c.likely_flow || "unknown",
        })),
      };
    }
    return data;
  }, [companyGroups]);

  // Globe data — city countries data for the info panel
  const globeCityCountriesData = useMemo((): Record<string, CityCountryInfo[]> => {
    if (!cityCountries) return {};
    const data: Record<string, CityCountryInfo[]> = {};
    for (const [cityCode, ccList] of Object.entries(cityCountries)) {
      data[cityCode] = ccList.map(cc => ({
        nome_pais: cc.nome_pais,
        cod_pais: cc.cod_pais || "",
        vl_fob: cc.vl_fob || 0,
        kg_liquido: cc.kg_liquido || 0,
      }));
    }
    return data;
  }, [cityCountries]);

  /* ═══ RENDER ═══ */
  return (
    <>
      <Helmet><title>Inteligência de Mercado — Análise por NCM | TRADEXA</title></Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">

        {/* ═══ HEADER ═══ */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-white to-slate-50/90 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
          <div className="max-w-full mx-auto px-4 md:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <img src="/logo-tradexa-red.png" alt="TRADEXA" className="h-8 md:h-10 w-auto" />
              <span className="hidden sm:block w-px h-6 bg-slate-200" />
              <h1 className="hidden sm:block text-base font-bold text-slate-800">Inteligência de Mercado</h1>
              {/* Data freshness badge */}
              {latestMonth.import && (
                <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Dados até {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][(latestMonth.import.month||1)-1]}/{latestMonth.import.year}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Refresh button */}
              {details && (
                <button onClick={() => {
                  try { sessionStorage.removeItem(PERSISTENT_CACHE_KEY); } catch {}
                  setDetails(null);
                  setTimeout(() => search(), 50);
                }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                  title="Recarregar dados (ignorar cache)">
                  <Loader2 className="h-3 w-3" />
                  Recarregar
                </button>
              )}

            </div>
          </div>
        </header>
        {/* ═══ HORIZONTAL FILTER BAR (desktop) ═══ */}
        <div className="hidden md:block sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-full mx-auto px-4 md:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-visible flex-wrap">

            {/* Modo */}
            <div className="flex shrink-0 bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => { setTab("import"); setExpandedCity(null); }}
                className={cn("flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-md transition-all whitespace-nowrap",
                  tab === "import" ? "bg-white text-[#D80E16] shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}>
                <Ship className="h-3.5 w-3.5" /> Import.
              </button>
              <button onClick={() => { setTab("export"); setExpandedCity(null); }}
                className={cn("flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-md transition-all whitespace-nowrap",
                  tab === "export" ? "bg-white text-[#D80E16] shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}>
                <Warehouse className="h-3.5 w-3.5" /> Export.
              </button>
            </div>

            <span className="w-px h-6 bg-slate-200 shrink-0" />

            {/* NCM */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">NCM</label>
              <div className="relative">
                <Input ref={ncmRef} value={ncmInput} onChange={e => {
                  setNcmInput(e.target.value);
                  if (e.target.value.length < 2) setNcmSug([]);
                }}
                  onFocus={() => { if (ncmInput.length >= 2) setShowNcmSug(true); }}
                  placeholder="Ex: 2836"
                  className="w-28 h-8 text-xs px-2.5 rounded-md border-slate-200"
                />
                {ncms.length > 0 && ncmInput === "" && (
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">{ncms.length}</span>
                )}
                {ncmSug.length > 0 && ncmInput.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-52 overflow-y-auto">
                    {ncmSug.slice(0, 10).map((s, i) => (
                      <button key={i} className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-start gap-2 text-xs border-b border-slate-100 last:border-0"
                        onClick={() => addNcm(s.code, s.desc)}>
                        <code className="font-mono font-bold text-[#D80E16] shrink-0">{s.code}</code>
                        <span className="text-slate-600 truncate">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {ncms.map((n, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold bg-[#D80E16]/10 text-[#D80E16] px-2 py-1 rounded shrink-0">
                  {n.code}
                  <button onClick={() => removeNcm(n.code)} className="hover:text-[#b80c12]"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>

            <span className="w-px h-6 bg-slate-200 shrink-0" />

            {/* Período */}
            <div className="flex items-center gap-1.5 shrink-0">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">Ano</label>
              <div className="flex gap-1">
                {[2024, 2025, 2026].map(y => {
                  const isActiveYear = (period.mode === "full_year" || period.mode === "specific_month") && period.year === y;
                  return (
                    <button key={y} onClick={() => {
                      if (isActiveYear && period.mode === "full_year") {
                        setPeriod({ mode: "specific_month", year: y, month: period.month || 1 });
                      } else if (isActiveYear && period.mode === "specific_month") {
                        setPeriod({ mode: "full_year", year: y });
                      } else {
                        setPeriod({ mode: "full_year", year: y });
                      }
                    }}
                      className={cn("text-[11px] font-bold py-1.5 px-2.5 rounded border transition-all",
                        isActiveYear ? "bg-[#D80E16] text-white border-[#D80E16]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                      )}>{y}</button>
                  );
                })}
                {latestMonth.import && latestMonth.import.year > 2026 && (
                  <button key={latestMonth.import.year} onClick={() => {
                    const y = latestMonth.import!.year;
                    const isActive = (period.mode === "full_year" || period.mode === "specific_month") && period.year === y;
                    if (isActive && period.mode === "full_year") {
                      setPeriod({ mode: "specific_month", year: y, month: period.month || 1 });
                    } else if (isActive && period.mode === "specific_month") {
                      setPeriod({ mode: "full_year", year: y });
                    } else {
                      setPeriod({ mode: "full_year", year: y });
                    }
                  }}
                    className={cn("text-[11px] font-bold py-1.5 px-2.5 rounded border transition-all",
                      (period.mode === "full_year" || period.mode === "specific_month") && period.year === latestMonth.import!.year ? "bg-[#D80E16] text-white border-[#D80E16]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    )}>{latestMonth.import!.year}</button>
                )}
              </div>
              {period.mode === "full_year" && period.year && (
                <button onClick={() => setPeriod({ mode: "specific_month", year: period.year!, month: 1 })}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline whitespace-nowrap">mês</button>
              )}
              {period.mode === "specific_month" && period.year && (
                <div className="flex gap-1">
                  {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map((m, i) => {
                    const isActive = period.month === i + 1;
                    const latestY = latestMonth.import?.year || 2026;
                    const latestM = latestMonth.import?.month || 5;
                    const isFuture = period.year === latestY && i + 1 > latestM;
                    return (
                      <button key={i}
                        onClick={() => {
                          if (isFuture) return;
                          if (isActive) { setPeriod({ mode: "full_year", year: period.year! }); }
                          else { setPeriod({ mode: "specific_month", year: period.year!, month: i + 1 }); }
                        }}
                        className={cn("text-[10px] font-bold py-1.5 px-2 rounded border transition-all",
                          isActive ? "bg-[#D80E16] text-white border-[#D80E16]" : 
                          isFuture ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" :
                          "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        )}
                        disabled={isFuture}
                      >{m}</button>
                    );
                  })}
                </div>
              )}
            </div>

            <span className="w-px h-6 bg-slate-200 shrink-0" />

            {/* Estados - dropdown */}
            <div className="relative shrink-0" ref={ufDropdownRef}>
              <button onClick={() => setUfOpen(!ufOpen)}
                className={cn("flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg border transition-all",
                  ufs.length > 0 ? "bg-[#D80E16]/10 text-[#D80E16] border-[#D80E16]/30" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}>
                <span>UF{ufs.length > 0 ? ` (${ufs.length})` : ""}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {ufOpen && (
                <div ref={ufDropRef} className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-60 overflow-y-auto p-2">
                  <div className="grid grid-cols-4 gap-1">
                    {UF_LIST.map(uf => {
                      const isSelected = ufs.includes(uf);
                      return (
                        <button key={uf} onClick={() => toggleUf(uf)}
                          className={cn("text-[11px] font-bold py-1.5 px-1.5 rounded border transition-all",
                            isSelected ? "bg-[#D80E16]/10 text-[#D80E16] border-[#D80E16]/30" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                          )}>{uf}</button>
                      );
                    })}
                  </div>
                  {ufs.length > 0 && (
                    <button onClick={() => { setUfs([]); }}
                      className="w-full mt-1.5 text-[11px] text-slate-400 hover:text-red-500 transition-colors py-1.5 rounded border border-dashed border-slate-200">
                      Limpar estados
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Button onClick={search} disabled={loading || ncms.length === 0}
                className="h-8 bg-[#D80E16] hover:bg-[#b80c12] text-white text-xs gap-1.5 rounded-lg px-3.5">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                {loading ? "..." : "Consultar"}
              </Button>
              {(ncms.length > 0 || ufs.length > 0) && (
                <button onClick={() => { setUfs([]); setNcms([]); setNcmInput(""); }}
                  className="text-[11px] text-slate-400 hover:text-red-500 transition-colors whitespace-nowrap">
                  Limpar
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ═══ MOBILE FILTER BAR (compact) ═══ */}
        <div className="md:hidden sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="px-4 py-2.5 flex items-center gap-2">
            {/* Mode toggle compact */}
            <div className="flex shrink-0 bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => { setTab("import"); setExpandedCity(null); }}
                className={cn("flex items-center gap-1 text-[11px] font-semibold py-1.5 px-2.5 rounded-md transition-all min-h-[32px]",
                  tab === "import" ? "bg-white text-[#D80E16] shadow-sm" : "text-slate-500"
                )}>
                <Ship className="h-3 w-3" /> Imp
              </button>
              <button onClick={() => { setTab("export"); setExpandedCity(null); }}
                className={cn("flex items-center gap-1 text-[11px] font-semibold py-1.5 px-2.5 rounded-md transition-all min-h-[32px]",
                  tab === "export" ? "bg-white text-[#D80E16] shadow-sm" : "text-slate-500"
                )}>
                <Warehouse className="h-3 w-3" /> Exp
              </button>
            </div>

            {/* NCM chips compact */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {ncms.length === 0 ? (
                <span className="text-xs text-slate-400 shrink-0">Nenhum NCM selecionado</span>
              ) : (
                ncms.map((n, i) => (
                  <span key={i} className="inline-flex items-center text-[11px] font-mono font-bold bg-[#D80E16]/10 text-[#D80E16] px-2 py-1 rounded shrink-0">
                    {n.code}
                  </span>
                ))
              )}
            </div>

            {/* Filters button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 min-h-[36px] shrink-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
            </button>
          </div>
        </div>
          <div className="flex-1 min-w-0">
            {/* Internal Nav — desktop only */}
            {!loading && details && (
              <div className="hidden md:block px-4 md:px-6 pt-3">
                <div className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200/60 px-3 py-1.5 shadow-sm overflow-x-auto">
                  <span className="text-slate-500 font-semibold mr-1 shrink-0">Navegar:</span>
                  <a href="#secao-resumo" className="shrink-0 px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors">Resumo</a>
                  <span className="text-slate-200 shrink-0">|</span>
                  <a href="#secao-cidades" className="shrink-0 px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors">Cidades</a>
                  <span className="text-slate-200 shrink-0">|</span>
                  <a href="#secao-empresas" className="shrink-0 px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors">Empresas</a>
                  <span className="text-slate-200 shrink-0">|</span>
                  <a href="#secao-precos" className="shrink-0 px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors">Preços</a>
                  <span className="text-slate-200 shrink-0">|</span>
                  <a href="#secao-paises" className="shrink-0 px-2 py-1 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors">Países</a>
                </div>
              </div>
            )}

            <main className="px-4 md:px-6 py-5 md:py-8 pb-20 md:pb-8">
          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              <div className="flex gap-3 mb-2">
                {loadingIntel && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Carregando inteligência...
                  </div>
                )}
                {loadingTrade && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Carregando dados de comércio...
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 md:h-24 rounded-xl" />)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Skeleton className="h-[400px] rounded-xl" />
                <Skeleton className="h-[400px] rounded-xl" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Empty state — 0 empresas encontradas */}
          {!loading && !error && details && totalCompanies === 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
                <Building2 className="h-8 w-8 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Nenhuma empresa encontrada</p>
                  <p className="text-xs text-amber-700 mt-1">Todas as empresas candidatas foram filtradas pelos critérios de confiança e volume. Tente:</p>
                  <ul className="text-xs text-amber-700 mt-1 list-disc list-inside text-left">
                    <li>Selecionar um período mais amplo</li>
                    <li>Ajustar o filtro de capital mínimo</li>
                    <li>Verificar outro NCM relacionado</li>
                    <li>Clicar em "Recarregar" para forçar nova consulta</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ═══ RESULTS ═══ */}
          {!loading && details && (
            <div className="space-y-5">

              {/* SUMMARY CARDS */}
              {(displayTotals || flowTotals) && (
                <div id="secao-resumo">
                  {details?.ncm_name && (
                    <div className="flex items-center gap-2 mb-2">
                      {details?.ncm_name && (
                        <span className="text-xs font-medium text-slate-500 mr-2">
                          <span className="text-[#D80E16] font-bold">{ncms.map(n=>n.code).join(', ')}</span>
                          {' — '}{details.ncm_name}
                          {details.ncm_unid && <span className="ml-2 text-slate-400">({details.ncm_unid})</span>}
                        </span>
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Período: <span className="text-[#D80E16]">{periodLabel}</span>
                      </span>
                      {period.mode === "specific_month" && (
                        <span className="text-xs px-3 py-1 rounded-full bg-[#D80E16]/10 text-[#D80E16] font-bold">
                          {periodLabel}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="grid grid-cols-2 max-[400px]:grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5 animate-fadeIn">
                    <SumCard icon={DollarSign} label="Valor" value={fmtUSD(displayTotals?.total_fob !== undefined ? displayTotals.total_fob : (flowTotals?.total_fob ?? 0))} color="red" sparklineData={sparklineData} />
                    <SumCard icon={Package} label="Peso" value={fmtKg(displayTotals?.total_kg !== undefined ? displayTotals.total_kg : (flowTotals?.total_kg ?? 0))} color="blue" sparklineData={sparklineKgData} sparklineColor="#059669" />
                    {(() => {
                      const kg = displayTotals?.total_kg ?? flowTotals?.total_kg ?? 0;
                      const fob = displayTotals?.total_fob ?? flowTotals?.total_fob ?? 0;
                      const avgPrice = kg > 0 ? fob / kg : 0;
                      return (
                        <SumCard icon={BarChart3} label="Preço Médio" value={avgPrice > 0 ? `US$ ${avgPrice.toFixed(2)}/kg` : "-"} color="purple" sparklineData={sparklinePriceData} sparklineColor="#7C3AED" />
                      );
                    })()}
                    <SumCard icon={MapPin} label="Cidades" value={String(flowCities.length)} color="green" />
                    <SumCard icon={Building2} label="Empresas" value={String(totalCompanies)} color="amber" />
                  </div>
                </div>
              )}

              {/* NCM COMPARISON (multiple NCMs) */}
              {ncms.length > 1 && tradeData.length > 0 && (() => {
                const byNcm = new Map<string, { fob: number; kg: number }>();
                tradeData.forEach(r => {
                  const code = r.coNcm || "";
                  if (!code) return;
                  const v = byNcm.get(code) || { fob: 0, kg: 0 };
                  v.fob += Number(r.metricFOB || 0);
                  v.kg += Number(r.metricKg || 0);
                  byNcm.set(code, v);
                });
                const ncmList = [...byNcm.entries()].sort((a, b) => b[1].fob - a[1].fob);
                const maxFob = Math.max(...ncmList.map(([, v]) => v.fob));
                return (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                        <BarChart3 className="h-4 w-4 text-[#D80E16]" />
                        Comparação entre NCMs
                        <span className="text-sm font-normal text-slate-400">({ncmList.length} NCMs)</span>
                      </h3>
                    </div>
                    <div className="p-4 md:p-5 space-y-3">
                      {ncmList.map(([code, val], i) => {
                        const ncmInfo = ncms.find(n => n.code === code);
                        return (
                          <div key={code} className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-300 w-5 text-right shrink-0">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <code className="text-xs font-mono font-bold text-[#D80E16]">{code}</code>
                                  <span className="text-[10px] text-slate-500 truncate">{ncmInfo?.desc || ""}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-800 shrink-0">{fmtUSD(val.fob)}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full bg-[#D80E16]/60" style={{ width: `${(val.fob / maxFob) * 100}%` }} />
                                </div>
                                <span className="text-[9px] text-slate-400 w-16 text-right shrink-0">{fmtKg(val.kg)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* PDF EXPORT */}
              {(displayTotals || flowTotals) && (() => {
                const allCompanies = filteredGroupsAll.flatMap(g => g.companies);
                const totalWeighted = allCompanies.reduce((s, c) => s + ((c.capital_social || 0) * ((c.confidence_score || 0) / 100)), 0);
                const topForPdf = [...allCompanies]
                  .map(c => ({
                    nome: c.nome,
                    cnpj: fmtCnpj(c.cnpj || c.cnpj_basico),
                    capital: c.capital_social || 0,
                    score: c.confidence_score || 0,
                    share: totalWeighted > 0 ? ((((c.capital_social || 0) * ((c.confidence_score || 0) / 100)) / totalWeighted) * 100).toFixed(1) + "%" : "-",
                    likely_flow: c.likely_flow,
                  }))
                  .sort((a, b) => b.capital - a.capital).slice(0, 10);
                // Price positioning for PDF
                const citiesWithPrice = flowCities
                  .filter(c => c.kg_liquido && c.kg_liquido >= 50)
                  .map(c => ({ price: c.vl_fob / c.kg_liquido!, fob: c.vl_fob }));
                const sortedPrices = [...citiesWithPrice].sort((a, b) => a.price - b.price);
                const pricePositioning = sortedPrices.length >= 5 ? {
                  p5: sortedPrices[Math.floor(sortedPrices.length * 0.05)].price,
                  median: sortedPrices.length % 2 === 0
                    ? (sortedPrices[sortedPrices.length / 2 - 1].price + sortedPrices[sortedPrices.length / 2].price) / 2
                    : sortedPrices[Math.floor(sortedPrices.length / 2)].price,
                  p95: sortedPrices[Math.floor(sortedPrices.length * 0.95)].price,
                  weightedAvg: sortedPrices.reduce((s, c) => s + c.price * c.fob, 0) / sortedPrices.reduce((s, c) => s + c.fob, 0),
                  spread: sortedPrices.length >= 5
                    ? ((sortedPrices[Math.floor(sortedPrices.length * 0.95)].price - sortedPrices[Math.floor(sortedPrices.length * 0.05)].price) / (
                      sortedPrices.length % 2 === 0
                        ? (sortedPrices[sortedPrices.length / 2 - 1].price + sortedPrices[sortedPrices.length / 2].price) / 2
                        : sortedPrices[Math.floor(sortedPrices.length / 2)].price
                    )) * 100
                    : 0,
                } : undefined;
                const pdfData: IntelExportData = {
                  ncms: ncms.map(n => n.code),
                  ncmName: details?.ncm_name || undefined,
                  flowType: tab,
                  periodLabel,
                  totalFob: displayTotals?.total_fob ?? flowTotals?.total_fob ?? 0,
                  totalKg: displayTotals?.total_kg ?? flowTotals?.total_kg ?? 0,
                  avgPrice: (displayTotals?.total_kg ?? flowTotals?.total_kg ?? 0) > 0
                    ? ((displayTotals?.total_fob ?? flowTotals?.total_fob ?? 0) / (displayTotals?.total_kg ?? flowTotals?.total_kg ?? 0))
                    : 0,
                  cityCount: flowCities.length,
                  companyCount: totalCompanies,
                  topCountries: displayCountries.slice(0, 10).map(c => {
                    // Look up kg from per-city country data
                    const countryCode = (c as any).cod_pais || "";
                    let countryKg = (c as any).kg_liquido || 0;
                    if (!countryKg && countryCode && cityCountries) {
                      for (const ccList of Object.values(cityCountries)) {
                        for (const cc of ccList) {
                          if (cc.cod_pais === countryCode) {
                            countryKg += cc.kg_liquido || 0;
                          }
                        }
                      }
                    }
                    return {
                      nome_pais: c.nome_pais || c.country || "",
                      vl_fob: c.vl_fob || 0,
                      kg_liquido: countryKg,
                    };
                  }),
                  topCompanies: topForPdf,
                  cities: flowCities.slice(0, 20).map(c => ({ nome: c.nome_mun, uf: c.uf, fob: c.vl_fob, kg: c.kg_liquido })),
                  companiesByCity: filteredGroupsAll.slice(0, 5).map(g => ({
                    cityName: g.cityName,
                    uf: g.uf,
                    companies: g.companies.slice(0, 5).map(c => ({
                      nome: c.nome,
                      score: c._score || 0,
                      likely_flow: c.likely_flow || "unknown",
                    })),
                  })),
                  pricePositioning,
                };
                const csvData: IntelExportCsv = {
                  ncms: ncms.map(n => n.code),
                  flowType: tab,
                  periodLabel,
                  ncmName: details?.ncm_name || undefined,
                  totalFob: displayTotals?.total_fob ?? flowTotals?.total_fob ?? 0,
                  totalKg: displayTotals?.total_kg ?? flowTotals?.total_kg ?? 0,
                  avgPrice: (displayTotals?.total_kg ?? flowTotals?.total_kg ?? 0) > 0
                    ? ((displayTotals?.total_fob ?? flowTotals?.total_fob ?? 0) / (displayTotals?.total_kg ?? flowTotals?.total_kg ?? 0))
                    : 0,
                  topCountries: displayCountries.slice(0, 200).map(c => {
                    const countryCode = (c as any).cod_pais || "";
                    let countryKg = (c as any).kg_liquido || 0;
                    if (!countryKg && countryCode && cityCountries) {
                      for (const ccList of Object.values(cityCountries)) {
                        for (const cc of ccList) {
                          if (cc.cod_pais === countryCode) {
                            countryKg += cc.kg_liquido || 0;
                          }
                        }
                      }
                    }
                    return {
                      nome_pais: c.nome_pais || c.country || "",
                      vl_fob: c.vl_fob || 0,
                      kg_liquido: countryKg,
                    };
                  }),
                  topCompanies: allCompanies.map(c => ({
                    nome: c.nome,
                    cnpj: fmtCnpj(c.cnpj || c.cnpj_basico),
                    capital: c.capital_social || 0,
                    score: c._score || 0,
                    likely_flow: c.likely_flow || "unknown",
                    uf: c.uf || "",
                    city: c.nome_municipio || c.municipio || "",
                  })),
                  cities: flowCities.map(c => ({ nome: c.nome_mun, uf: c.uf, fob: c.vl_fob, kg: c.kg_liquido, ops: c.ops, cod_mun: c.cod_mun })),
                  cityCountries: cityCountries ? (() => {
                    const out: Record<string, { nome_pais: string; vl_fob: number; kg_liquido: number }[]> = {};
                    for (const [code, ccList] of Object.entries(cityCountries)) {
                      out[code] = ccList.map(cc => ({
                        nome_pais: cc.nome_pais,
                        vl_fob: cc.vl_fob || 0,
                        kg_liquido: cc.kg_liquido || 0,
                      }));
                    }
                    return out;
                  })() : undefined,
                  cityPorts: cityPorts ? (() => {
                    const out: Record<string, { via_name: string; urf_name?: string; urf: string; kg: number; fob: number; countries?: { cod_pais: string; nome_pais: string; kg: number; fob: number }[] }[]> = {};
                    for (const [code, portList] of Object.entries(cityPorts)) {
                      out[code] = portList.map(p => ({
                        via_name: p.via_name,
                        urf_name: p.urf_name,
                        urf: p.urf,
                        kg: p.kg || 0,
                        fob: p.fob || 0,
                        countries: p.countries ? p.countries.filter(c => c.kg > 0) : undefined,
                      }));
                    }
                    return out;
                  })() : undefined,
                  companiesByCity: filteredGroupsAll.length > 0 ? (() => {
                    const out: Record<string, { nome: string; score: number; likely_flow: string; cnpj: string; capital: number }[]> = {};
                    for (const g of filteredGroupsAll) {
                      const key = `${g.cityName}|${g.uf}`;
                      out[key] = g.companies.map(c => ({
                        nome: c.nome,
                        score: c._score || 0,
                        likely_flow: c.likely_flow || "unknown",
                        cnpj: fmtCnpj(c.cnpj || c.cnpj_basico),
                        capital: c.capital_social || 0,
                      }));
                    }
                    return out;
                  })() : undefined,
                };
                return (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportIntelCSV(csvData)}
                      className="border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" /> CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportIntelPDF(pdfData)}
                      className="border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </div>
                );
              })()}

              {/* EVOLUTION BADGES (month selected) */}
              {details?.evolution?.previous_period && period.mode === "specific_month" && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
                  <div className="p-3 md:p-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h3 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-[#D80E16]" />
                        Evolução vs {details.evolution.previous_period.month}/{details.evolution.previous_period.year}
                      </h3>
                      {(() => {
                        const ev = tab === "import" ? details.evolution!.import : details.evolution!.export;
                        if (!ev || ev.variation_fob_pct === null) return null;
                        const isUp = ev.variation_fob_pct > 0;
                        return (
                          <div className="flex items-center gap-3">
                            <span className={cn("text-sm font-bold px-3 py-1 rounded-full", isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              {isUp ? "▲" : "▼"} FOB: {Math.abs(ev.variation_fob_pct).toFixed(1)}%
                            </span>
                            {ev.variation_kg_pct !== null && (
                              <span className={cn("text-sm font-bold px-3 py-1 rounded-full", ev.variation_kg_pct > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                {ev.variation_kg_pct > 0 ? "▲" : "▼"} KG: {Math.abs(ev.variation_kg_pct).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        );
                      })()}
                      {/* YoY badges */}
                      {details?.yoy && (() => {
                        const yoyData = tab === "import" ? details.yoy!.import : details.yoy!.export;
                        if (!yoyData || yoyData.variation_fob_pct === null) return null;
                        const isUp = yoyData.variation_fob_pct > 0;
                        return (
                          <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">YoY</span>
                            <span className={cn("text-sm font-bold px-3 py-1 rounded-full", isUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                              {isUp ? "▲" : "▼"} {Math.abs(yoyData.variation_fob_pct).toFixed(1)}%
                            </span>
                            {yoyData.variation_kg_pct !== null && (
                              <span className={cn("text-sm font-bold px-3 py-1 rounded-full", yoyData.variation_kg_pct > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                                {yoyData.variation_kg_pct > 0 ? "▲" : "▼"} KG: {Math.abs(yoyData.variation_kg_pct).toFixed(1)}%
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* MONTHLY CHART with YoY */}
              {(tradeData.length > 0 || details?.monthly_data) && (
                <MonthlyChart data={tradeData} flowType={tab} monthlyData={details?.monthly_data?.[tab === "import" ? "import" : "export"]} />
              )}

              {/* GLOBE + COMPANIES LAYOUT */}
              <div className="space-y-4" id="secao-empresas">
                {/* 3D Globe Map */}
                <div id="secao-mapa">
                {(globeCities.length > 0 || globeCountries.length > 0) && (
                  <Suspense fallback={<div className="h-[350px] md:h-[550px] bg-slate-50 rounded-xl flex items-center justify-center text-sm text-slate-400"><Loader2 className="h-5 w-5 animate-spin mr-2" />Carregando mapa...</div>}>
                  <TradeGlobe
                    cities={globeCities}
                    countries={globeCountries}
                    arcs={globeArcs}
                    selectedCity={selectedCity}
                    selectedCountry={selectedPais}
                    onCityClick={(codMun) => { setSelectedPais(null); setSelectedCity(codMun); }}
                    onCountryClick={(codPais) => { setSelectedCity(null); setSelectedPais(codPais); }}
                    flowType={tab}
                    height="clamp(350px, 60vh, 550px)"
                    companyData={globeCompanyData}
                    cityCountriesData={globeCityCountriesData}
                    volumeThreshold={volumeThreshold}
                    ports={details?.ports?.[tab] || []}
                  />
                  </Suspense>
                )}
                </div>{/* /secao-mapa */}

                {/* Companies - Full width */}
                <div>
                  {filteredGroupsAll.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-4 md:p-5 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#D80E16]" />
                            Empresas Prováveis
                            <span className="text-sm font-normal text-slate-400">({totalCompanies})</span>
                          </h2>
                          <div className="flex items-center gap-2">
                          </div>
                        </div>
                      <div className="divide-y divide-slate-100 max-h-[500px] md:max-h-[600px] overflow-y-auto">
                        {filteredGroupsAll.map((g, gi) => {
                            const cityCountriesList = cityCountries && g.codMun ? (cityCountries[g.codMun] || []) : [];
                            const cityPortsList = cityPorts && g.codMun ? (cityPorts[g.codMun] || []) : [];

                            return (
                          <div key={gi} className="p-3 md:p-4">
                            <div
                              className="flex max-md:flex-col max-md:items-start items-center justify-between mb-3 gap-2 rounded-lg p-2 -mx-2"

                            >
                              <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                                <StateBadge uf={g.uf} size="sm" badge />
                                <span className="text-base font-bold text-slate-900">{g.cityName}</span>
                                <span className="text-sm font-medium text-slate-400">/ {g.uf}</span>
                                <span className="text-[11px] font-mono text-slate-400 ml-1">({g.companies.length} {g.companies.length !== 1 ? 'empresas' : 'empresa'})</span>
                                {/* Always expanded - show chevron indicator */}
                                <ChevronDown className="h-4 w-4 text-slate-300 shrink-0 ml-1" />
                              </div>
                              {g.tradeFob > 0 && (
                                <div className="flex flex-wrap max-md:mt-1 items-center gap-1.5 md:gap-2">
                                  {(() => {
                                    const cityTrade = flowCities.find(c => c.cod_mun === g.codMun);
                                    const cityKg = cityTrade?.kg_liquido;
                                    const cityPrice = cityKg && cityKg > 0 ? g.tradeFob / cityKg : null;
                                    const cityOps = cityTrade?.ops;
                                    return (
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {cityPrice ? (
                                          <span className="text-xs font-semibold" title="Preço médio por kg">
                                            <span className="text-slate-500">Preço:</span>{' '}
                                            <span className="font-mono font-bold text-slate-800">US$ {cityPrice.toFixed(2)}/kg</span>
                                          </span>
                                        ) : null}
                                        <span className="text-xs font-semibold" title="Peso total importado">
                                          <span className="text-slate-500">Peso:</span>{' '}
                                          <span className="font-mono text-slate-800 font-semibold">{cityKg != null && cityKg > 0 ? fmtKg(cityKg) : '-'}</span>
                                        </span>
                                        <span className="text-xs font-semibold" title="Número de operações">
                                          <span className="text-slate-500">Operações:</span>{' '}
                                          <span className="text-slate-800 font-semibold">{cityOps != null && cityOps > 0 ? `${cityOps}x` : '-'}</span>
                                        </span>
                                      </div>
                                    );
                                  })()}
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold px-3 py-1">
                                    {fmtUSD(g.tradeFob)}
                                  </Badge>
                                </div>
                              )}
                            </div>

                            {/* Transport mode + port badge */}
                            {(() => {
                              const tm = getCityTransportMode(g.codMun);
                              if (!tm) return null;
                              const ports = cityPorts?.[g.codMun];
                              if (ports && ports.length > 0) {
                                const bestPort = ports[0];
                                return (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 shrink-0 mb-2">
                                    <UrfIcon viaName={bestPort.via_name} size={14} />
                                    <span className="truncate max-w-[120px]">{bestPort.urf_name || bestPort.urf}</span>
                                    <span className="text-slate-300 mx-0.5">|</span>
                                    <span>{getTransportLabel(bestPort.via_name)}</span>
                                  </span>
                                );
                              }
                              // Fallback: show dominant transport mode
                                return (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 shrink-0 mb-2">
                                  <ViaIconNew viaName={tm.viaKey} size={14} />
                                  <span>{tm.label}</span>
                                  {tm.pct != null && (
                                    <span className="text-slate-300 ml-1 font-mono">({tm.pct.toFixed(0)}%)</span>
                                  )}
                                  {!cityPorts?.[g.codMun] && cityPortsOpposite?.[g.codMun] && (
                                    <span className="text-slate-300 ml-0.5">(dados de {tab === "import" ? "exportação" : "importação"})</span>
                                  )}
                                </span>
                              );
                            })()}

                            {/* FULL CONTENT — Always visible */}
                              <div className="mb-3 ml-6 pl-4 border-l-2 border-[#D80E16]/20 space-y-3">
                                {/* Countries this city trades with */}
                                {cityCountriesList.length > 0 && (
                                  <div className="bg-slate-50 rounded-lg p-4">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <Globe className="h-4 w-4 text-slate-500" />
                                      Países de {tab === "import" ? "origem" : "destino"} ({cityCountriesList.length})
                                      <span className="text-[11px] text-slate-400 font-normal ml-auto">US$/kg</span>
                                    </h4>
                                    <div className="space-y-1">
                                      {cityCountriesList.slice(0, 15).map((cc, j) => {
                                        const countryPpk = cc.kg_liquido > 0 ? cc.vl_fob / cc.kg_liquido : 0;
                                        return (
                                          <div key={j} className="flex items-center gap-2 text-sm py-2 px-3 rounded-lg hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                                            onClick={() => { setSelectedCity(null); setSelectedPais(cc.cod_pais); }}
                                          >
                                            <CountryFlag codPais={cc.cod_pais} nome={cc.nome_pais} size="sm" />
                                            <span className="text-slate-800 font-semibold truncate min-w-0">{cc.nome_pais}</span>
                                            <span className="font-mono text-slate-500 text-[11px] shrink-0 ml-auto">{fmtKg(cc.kg_liquido)}</span>
                                            <span className="font-mono font-bold text-slate-600 text-[11px] w-16 text-right shrink-0">{countryPpk > 0 ? `$${countryPpk.toFixed(2)}` : '-'}</span>
                                            <span className="font-bold text-slate-900 text-xs w-24 text-right shrink-0">{fmtUSD(cc.vl_fob)}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    {cityCountriesList.length > 15 && (
                                      <p className="text-xs text-slate-400 mt-2">+ {cityCountriesList.length - 15} países</p>
                                    )}
                                  </div>
                                )}

                                {/* Ports this city uses */}
                                {cityPortsList.length > 0 ? (
                                  <div className="bg-slate-50 rounded-lg p-4">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <Warehouse className="h-4 w-4 text-slate-500" />
                                      Portos / Vias ({cityPortsList.length})
                                    </h4>
                                    <div className="space-y-1">
                                      {cityPortsList.slice(0, 10).map((cp, j) => (
                                        <div key={j}>
                                          <div className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                                            <span className="shrink-0"><UrfIcon viaName={cp.via_name} size={16} /></span>
                                            <span className="text-slate-800 font-semibold truncate min-w-0">{cp.urf_name || cp.urf}</span>
                                            <span className="text-slate-500 text-[11px] font-medium shrink-0">{getTransportLabel(cp.via_name)}</span>
                                            <span className="font-mono text-slate-500 text-[11px] shrink-0 ml-auto">{fmtKg(cp.kg)}</span>
                                            <span className="font-bold text-slate-900 text-xs w-24 text-right shrink-0">{fmtUSD(cp.fob)}</span>
                                          </div>
                                          {cp.countries && cp.countries.length > 1 && (
                                            <div className="ml-8 pl-4 border-l-2 border-slate-200 space-y-0.5 mb-1">
                                              {cp.countries.filter(ct => ct.kg > 0).map((ct, ck) => (
                                                <div key={ck} className="flex items-center gap-2 text-xs py-0.5 px-3 text-slate-500">
                                                  <span className="truncate min-w-0">→ {ct.nome_pais}</span>
                                                  <span className="font-mono shrink-0 ml-auto">{fmtKg(ct.kg)}</span>
                                                  <span className="font-semibold text-slate-700 text-[11px] w-20 text-right shrink-0">{fmtUSD(ct.fob)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (() => {
                                  // Fallback: show modal data when no port breakdown
                                  const fallbackPorts = cityPortsOpposite?.[g.codMun];
                                  if (fallbackPorts && fallbackPorts.length > 0) {
                                    return (
                                      <div className="bg-slate-50 rounded-lg p-4">
                                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                          <Warehouse className="h-4 w-4 text-slate-500" />
                                          Portos / Vias ({fallbackPorts.length}) <span className="text-[10px] font-normal text-slate-400 normal-case">(dados de {tab === "import" ? "exportação" : "importação"})</span>
                                        </h4>
                                        <div className="space-y-1">
                                          {fallbackPorts.slice(0, 10).map((cp, j) => (
                                        <div key={j}>
                                          <div className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                                            <span className="shrink-0"><UrfIcon viaName={cp.via_name} size={16} /></span>
                                            <span className="text-slate-800 font-semibold truncate min-w-0">{cp.urf_name || cp.urf}</span>
                                            <span className="text-slate-500 text-[11px] font-medium shrink-0">{getTransportLabel(cp.via_name)}</span>
                                            <span className="font-mono text-slate-500 text-[11px] shrink-0 ml-auto">{fmtKg(cp.kg)}</span>
                                            <span className="font-bold text-slate-900 text-xs w-24 text-right shrink-0">{fmtUSD(cp.fob)}</span>
                                          </div>
                                              {cp.countries && cp.countries.length > 1 && (
                                                <div className="ml-8 pl-4 border-l-2 border-slate-200 space-y-0.5 mb-1">
                                                  {cp.countries.filter(ct => ct.kg > 0).map((ct, ck) => (
                                                    <div key={ck} className="flex items-center gap-2 text-xs py-0.5 px-3 text-slate-500">
                                                      <span className="truncate min-w-0">→ {ct.nome_pais}</span>
                                                      <span className="font-mono shrink-0 ml-auto">{fmtKg(ct.kg)}</span>
                                                      <span className="font-semibold text-slate-700 text-[11px] w-20 text-right shrink-0">{fmtUSD(ct.fob)}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}

                                {cityCountriesList.length === 0 && cityPortsList.length === 0 && !cityPortsOpposite?.[g.codMun] && !cityModalOpposite?.[g.codMun] && (
                                  <p className="text-xs text-slate-400 italic">Sem dados detalhados para esta cidade no período.</p>
                                )}
                              </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {(showAllCompanies.has(g.codMun) ? g.companies : g.companies.slice(0, 10)).map((c, ci) => {
                                const scoreInfo = recalcCompanyScore(c);
                                const portInfo = cityPorts?.[g.codMun]?.[0] || null;
                                const tm = getCityTransportMode(g.codMun);
                                const showOpposite = !cityPorts?.[g.codMun] && (cityPortsOpposite?.[g.codMun] || cityModalOpposite?.[g.codMun]);
                                return (
                                  <CompanyDetailCard
                                    key={ci}
                                    company={c as any}
                                    scoreInfo={scoreInfo}
                                    tab={tab}
                                    cityUf={g.uf}
                                    cityName={g.cityName}
                                    portInfo={portInfo}
                                    transportMode={tm || null}
                                    showOppositeData={showOpposite}
                                    onViewOnMap={() => {
                                      setSelectedCity(g.codMun);
                                      setSelectedPais(null);
                                      document.getElementById('secao-empresas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    fmtUSD={fmtUSD}
                                    fmtKg={fmtKg}
                                    fmtCnpj={fmtCnpj}
                                    ncm={ncms[0]?.code?.replace(/\D/g, "") || undefined}
                                    cityCountryNames={cityCountriesList.map(cc => cc.nome_pais).filter(Boolean)}
                                  />
                                );
                              })}
                            </div>
                            {g.companies.length > 10 && (
                              <button onClick={() => toggleShowAll(g.codMun)}
                                className="mt-3 text-xs font-semibold text-[#D80E16] hover:text-[#b00c12] transition-colors flex items-center gap-1 mx-auto">
                                {showAllCompanies.has(g.codMun) ? (
                                  <>Mostrar menos <ChevronUp className="h-3 w-3" /></>
                                ) : (
                                  <>Ver todas ({g.companies.length}) <ChevronDown className="h-3 w-3" /></>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })}
                      </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* PRICE POSITIONING */}
              {details?.ncm_price_avg && (() => {
                const avg = details.ncm_price_avg![tab as "import" | "export"];
                if (!avg || !avg.price_per_kg) return null;
                return (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="secao-precos">
                    <div className="p-4 md:p-5">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-3">
                        <BarChart3 className="h-4 w-4 text-[#D80E16]" />
                        Price Positioning — Preço por kg
                      </h3>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="bg-slate-50 rounded-lg px-5 py-3 border border-slate-200">
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Média {tab === "import" ? "Importação" : "Exportação"}</p>
                          <p className="text-xl font-bold text-slate-800">US$ {avg.price_per_kg.toFixed(2)}/kg</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-5 py-3 border border-slate-200">
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Volume Total</p>
                          <p className="text-lg font-bold text-slate-800">{fmtUSD(avg.total_fob)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-5 py-3 border border-slate-200">
                          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Peso Total</p>
                          <p className="text-lg font-bold text-slate-800">{fmtKg(avg.total_kg)}</p>
                        </div>
                      </div>
                      {/* Price spread across cities — percentile-based to remove outliers */}
                      {flowCities.length > 0 && (() => {
                        const citiesWithPrice = flowCities
                          .filter(c => c.kg_liquido && c.kg_liquido >= 50)
                          .map(c => ({ name: c.nome_mun, uf: c.uf, price: c.vl_fob / c.kg_liquido!, fob: c.vl_fob, kg: c.kg_liquido! }));
                        if (citiesWithPrice.length < 5) return null;
                        const sorted = [...citiesWithPrice].sort((a, b) => a.price - b.price);
                        const totalFob = sorted.reduce((s, c) => s + c.fob, 0);
                        const p5 = sorted[Math.floor(sorted.length * 0.05)];
                        const p95 = sorted[Math.floor(sorted.length * 0.95)];
                        const medianIdx = Math.floor(sorted.length / 2);
                        const median = sorted.length % 2 === 0
                          ? (sorted[medianIdx - 1].price + sorted[medianIdx].price) / 2
                          : sorted[medianIdx].price;
                        const weightedAvg = sorted.reduce((s, c) => s + c.price * c.fob, 0) / totalFob;
                        const p5Name = p5 ? `${p5.name}/${p5.uf}` : '—';
                        const p95Name = p95 ? `${p95.name}/${p95.uf}` : '—';
                        const spread = p5 && p95 ? ((p95.price - p5.price) / median) * 100 : 0;
                        return (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Distribuição entre cidades</p>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              <div className="bg-white rounded-lg px-3 py-2.5 border border-slate-200">
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider">P5</p>
                                <p className="text-sm font-bold text-emerald-600">US$ {(p5?.price || 0).toFixed(2)}</p>
                                <p className="text-[9px] text-slate-400 truncate">{p5Name}</p>
                              </div>
                              <div className="bg-white rounded-lg px-3 py-2.5 border border-slate-200">
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider">P50 (Mediana)</p>
                                <p className="text-sm font-bold text-slate-800">US$ {median.toFixed(2)}</p>
                                <p className="text-[9px] text-slate-400">{sorted.length} cidades</p>
                              </div>
                              <div className="bg-white rounded-lg px-3 py-2.5 border border-slate-200">
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider">P95</p>
                                <p className="text-sm font-bold text-red-500">US$ {(p95?.price || 0).toFixed(2)}</p>
                                <p className="text-[9px] text-slate-400 truncate">{p95Name}</p>
                              </div>
                              <div className="bg-white rounded-lg px-3 py-2.5 border border-slate-200">
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Média Ponderada</p>
                                <p className="text-sm font-bold text-purple-600">US$ {weightedAvg.toFixed(2)}</p>
                                <p className="text-[9px] text-slate-400">por volume FOB</p>
                              </div>
                              <div className="bg-white rounded-lg px-3 py-2.5 border border-slate-200">
                                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Spread (P95−P5)</p>
                                <p className="text-sm font-bold text-amber-600">{spread.toFixed(0)}%</p>
                                <p className="text-[9px] text-slate-400">vs mediana</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {/* Import vs Export comparison */}
                      {details?.ncm_price_avg && (() => {
                        const imp = details.ncm_price_avg!.import;
                        const exp = details.ncm_price_avg!.export;
                        if (!imp.price_per_kg || !exp.price_per_kg) return null;
                        const diff = ((exp.price_per_kg - imp.price_per_kg) / imp.price_per_kg) * 100;
                        return (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">Comparação Importação vs Exportação</p>
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
                                <p className="text-[9px] text-blue-600 font-semibold">Importação</p>
                                <p className="text-xs font-bold text-slate-800">US$ {imp.price_per_kg.toFixed(2)}/kg</p>
                              </div>
                              <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
                                <p className="text-[9px] text-emerald-600 font-semibold">Exportação</p>
                                <p className="text-xs font-bold text-slate-800">US$ {exp.price_per_kg.toFixed(2)}/kg</p>
                              </div>
                              <div className={cn("bg-white rounded-lg px-3 py-2 border", diff > 0 ? "border-emerald-200" : "border-red-200")}>
                                <p className="text-[9px] text-slate-500 font-semibold">Margem</p>
                                <p className={cn("text-xs font-bold", diff > 0 ? "text-emerald-600" : "text-red-500")}>
                                  {diff > 0 ? "+" : ""}{diff.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* COMPACT TABLE — Price × Volume by City */}
              {flowCities.length >= 5 && (() => {
                const tableData = flowCities
                  .filter(c => c.kg_liquido && c.kg_liquido >= 50)
                  .map(c => ({ name: `${c.nome_mun}/${c.uf}`, price: c.vl_fob / c.kg_liquido!, fob: c.vl_fob, kg: c.kg_liquido! }))
                  .sort((a, b) => b.fob - a.fob);
                if (tableData.length < 3) return null;
                return (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-3 md:p-4">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <BarChart3 className="h-3.5 w-3.5 text-[#D80E16]" />
                        Dispersão Preço × Volume por Cidade
                      </h3>
                      <div className="overflow-x-auto max-h-64 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-white">
                            <tr className="border-b border-slate-100">
                              <th className="text-left font-semibold text-slate-400 py-1.5 pr-2">Cidade</th>
                              <th className="text-right font-semibold text-slate-400 py-1.5 px-2">US$/kg</th>
                              <th className="text-right font-semibold text-slate-400 py-1.5 px-2">FOB</th>
                              <th className="text-right font-semibold text-slate-400 py-1.5 pl-2">Volume</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((d, i) => (
                              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="py-1.5 pr-2 font-medium text-slate-700 truncate max-w-[120px]">{d.name}</td>
                                <td className="py-1.5 px-2 text-right font-semibold text-slate-800">US$ {d.price.toFixed(2)}</td>
                                <td className="py-1.5 px-2 text-right font-medium text-slate-700 whitespace-nowrap">{fmtUSD(d.fob)}</td>
                                <td className="py-1.5 pl-2 text-right text-slate-500 whitespace-nowrap">{fmtKg(d.kg)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ═══ CITY PRICE CHART (bars with avg line) ═══ */}
              {flowCities.length >= 3 && details?.ncm_price_avg?.[tab as "import" | "export"]?.price_per_kg && (() => {
                const priceData = flowCities
                  .filter(c => c.kg_liquido && c.kg_liquido >= 50)
                  .map(c => ({
                    name: c.nome_mun,
                    uf: c.uf,
                    codMun: c.cod_mun || "",
                    pricePerKg: c.vl_fob / c.kg_liquido!,
                    fob: c.vl_fob,
                    kg: c.kg_liquido!,
                  }));
                if (priceData.length < 3) return null;
                return (
                  <CityPriceChart
                    cities={priceData}
                    avgPrice={details.ncm_price_avg![tab as "import" | "export"]!.price_per_kg}
                    fmtUSD={fmtUSD}
                    fmtKg={fmtKg}
                    onCityClick={(codMun) => { setSelectedCity(codMun); setCityPanelOpen(true); }}
                  />
                );
              })()}

              {/* DONUT CHARTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                {/* Transport Modes */}
                {details?.ports && details.ports?.[tab]?.length > 0 && (() => {
                  const portEntries = details.ports![tab];
                  const viaGroups = new Map<string, { fob: number; kg: number }>();
                  portEntries.forEach(p => {
                    const key = normalizeViaKey(p.via_name);
                    const g = viaGroups.get(key) || { fob: 0, kg: 0 };
                    g.fob += p.fob; g.kg += p.kg;
                    viaGroups.set(key, g);
                  });
                  const modeIcons: Record<string, string> = {
                    Maritimo: "Maritimo", Aereo: "Aereo", Rodoviario: "Rodoviario", Outros: "Outros"
                  };
                  const viaData = [...viaGroups.entries()]
                    .filter(([, v]) => v.fob > 0)
                    .map(([k, v]) => ({
                      name: `${modeIcons[k] || ""} ${k}`,
                      value: v.fob,
                    }));
                  if (!viaData.length) return null;
                  return (
                    <DonutChartCard
                      title="Modal de Transporte"
                      icon={Ship}
                      data={viaData}
                      formatter={fmtUSD}
                    />
                  );
                })()}
                {/* Countries */}
                {displayCountries.length > 0 && (
                  <DonutChartCard
                    title={tab === "import" ? "Países de Origem" : "Países de Destino"}
                    icon={Globe}
                    data={displayCountries.slice(0, 10).map(c => ({
                      name: c.nome_pais || c.country || "Outros",
                      value: c.vl_fob || 0,
                      codPais: (c as any).cod_pais,
                    }))}
                    formatter={fmtUSD}
                  />
                )}
              </div>

              {/* ═══ TREEMAP + SANKEY ═══ */}
              {(() => {
                // Treemap data
                const treemapData = displayCountries.slice(0, 20).map(c => {
                  const cc = c as any;
                  let kg = cc.kg_liquido || 0;
                  if (!kg && cc.cod_pais && cityCountries) {
                    for (const ccList of Object.values(cityCountries)) {
                      for (const entry of ccList) {
                        if (entry.cod_pais === cc.cod_pais) kg += entry.kg_liquido || 0;
                      }
                    }
                  }
                  return {
                    name: cc.nome_pais || cc.country || "Outros",
                    size: cc.vl_fob || 0,
                    codPais: cc.cod_pais,
                    pricePerKg: kg > 0 ? (cc.vl_fob || 0) / kg : undefined,
                    fob: cc.vl_fob || 0,
                    kg,
                  };
                });

                // Sankey data — pass full arrays; component handles limiting
                const sankeyCities = flowCities.map(c => ({
                  name: c.nome_mun, uf: c.uf, codMun: c.cod_mun || "", fob: c.vl_fob || 0,
                }));
                const sankeyPorts = (details?.ports?.[tab] || []).map(p => ({
                  urf: p.urf, urfName: p.urf_name, viaName: p.via_name, fob: p.fob || 0,
                  countries: p.countries?.map(ct => ({ codPais: ct.cod_pais, nomePais: ct.nome_pais, fob: ct.fob || 0 })),
                }));
                const sankeyCountries = displayCountries.map(c => ({
                  codPais: (c as any).cod_pais, nomePais: c.nome_pais || c.country || "", fob: c.vl_fob || 0,
                }));

                const hasSankeyData = sankeyCities.length > 0 && sankeyPorts.length > 0 && sankeyCountries.length > 0;

                return (
                  <div className="space-y-4">
                    {treemapData.length > 0 && (
                      <CountryTreemap
                        data={treemapData}
                        fmtUSD={fmtUSD}
                        fmtKg={fmtKg}
                        flowType={tab}
                        onCountryClick={(codPais) => { setSelectedCity(null); setSelectedPais(codPais); }}
                      />
                    )}
                    {hasSankeyData && (
                      <SankeyFlow
                        cities={sankeyCities}
                        cityPortsMap={cityPorts || undefined}
                        ports={sankeyPorts}
                        countries={sankeyCountries}
                        flowType={tab}
                        fmtUSD={fmtUSD}
                        onCityClick={(codMun) => { setSelectedCity(codMun); setCityPanelOpen(true); }}
                        onCountryClick={(codPais) => { setSelectedCity(null); setSelectedPais(codPais); }}
                      />
                    )}
                  </div>
                );
              })()}

              {/* PORTS & TRANSPORT MODES */}
              {details?.ports && details?.ports?.[tab as "import" | "export"]?.length > 0 && (period.mode === "specific_month" || period.mode === "full_year") && (() => {
                const portEntries = details.ports![tab as "import" | "export"];
                const maxFob = Math.max(...portEntries.map(p => p.fob));
                const totalFob = portEntries.reduce((s, p) => s + p.fob, 0);

                // Group by normalized transport mode (3 modes)
                const viaGroups = new Map<string, { fob: number; kg: number; count: number }>();
                portEntries.forEach(p => {
                  const key = normalizeViaKey(p.via_name);
                  const g = viaGroups.get(key) || { fob: 0, kg: 0, count: 0 };
                  g.fob += p.fob; g.kg += p.kg; g.count++;
                  viaGroups.set(key, g);
                });

                return (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                        <Ship className="h-4 w-4 text-[#D80E16]" />
                        Portos e Vias de Transporte
                        <span className="text-sm font-normal text-slate-400">({periodLabel})</span>
                      </h3>
                    </div>
                    <div className="p-4 md:p-5">
                      {/* Via summary badges - 3 modes */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {TRANSPORT_MODES.map(mode => {
                          const val = viaGroups.get(mode.key);
                          if (!val) return null;
                          return (
                            <div key={mode.key} className="bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200 flex items-center gap-2">
                              <span className="text-sm">{mode.icon}</span>
                              <span className="text-xs font-semibold text-slate-700">{mode.label}</span>
                              <span className="text-[10px] font-bold text-[#D80E16]">{((val.fob / totalFob) * 100).toFixed(0)}%</span>
                            </div>
                          );
                        })}
                      </div>
                      {/* Port list */}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto overflow-x-auto">
                        {portEntries.slice(0, 15).map((p, i) => (
                          <div key={i} className="flex items-center gap-2 md:gap-3 py-1.5 px-2 md:px-3 rounded-lg hover:bg-slate-50 transition-colors min-w-[320px] md:min-w-0">
                            <span className="shrink-0"><UrfIcon viaName={p.via_name} size={16} /></span>
                            <span className="text-[10px] md:text-xs font-medium text-slate-500 w-14 md:w-20 shrink-0 truncate">{getTransportLabel(p.via_name)}</span>
                            <span className="text-[10px] md:text-xs text-slate-600 flex-1 truncate">{p.urf_name || p.urf}</span>
                            <div className="hidden md:block flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                              <div className="h-full rounded-full" style={{ width: `${(p.fob / maxFob) * 100}%`, backgroundColor: getTransportMode(p.via_name) === 'maritimo' ? '#0EA5E9' : getTransportMode(p.via_name) === 'aereo' ? '#8B5CF6' : getTransportMode(p.via_name) === 'rodoviario' ? '#F59E0B' : '#2563EB', opacity: 0.6 }} />
                            </div>
                            <span className="text-[10px] md:text-xs font-semibold text-slate-700 w-16 md:w-20 text-right shrink-0">{fmtUSD(p.fob)}</span>
                            <span className="text-[9px] md:text-[10px] text-slate-400 w-12 md:w-14 text-right shrink-0">{fmtKg(p.kg)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* COUNTRIES + CITIES 2-COLUMN (expandable city rows) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="secao-paises">
                {/* Countries */}
                {displayCountries.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 md:p-5 border-b border-slate-100">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                        <Globe className="h-5 w-5 text-[#D80E16]" />
                        {tab === "import" ? "Países de Origem" : "Países de Destino"}
                        {period.mode === "specific_month" && <span className="text-sm font-normal text-slate-400">({periodLabel})</span>}
                      </h3>
                    </div>
                    <div className="p-4 md:p-5 space-y-1">
                      {displayCountries.slice(0, 10).map((item, i) => {
                        const maxC = Math.max(...displayCountries.map((c: any) => c.vl_fob || 0));
                        const codPais = (item as any).cod_pais || "";
                        const nomePais = item.nome_pais || item.country || "";
                        const isExpanded = expandedPais === codPais;
                        return (
                        <div key={i}>
                          <div className="flex items-center gap-2 md:gap-3 py-1.5 cursor-pointer hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors"
                            onClick={() => {
                              setExpandedPais(isExpanded ? null : codPais);
                              setSelectedPais(codPais);
                            }}>
                            <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">{i + 1}</span>
                            <CountryFlag codPais={codPais} nome={nomePais} size="sm" />
                            <span className="text-sm font-medium text-slate-700 w-24 md:w-32 truncate shrink-0">{nomePais}</span>
                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#2563EB]/60" style={{ width: `${((item.vl_fob || 0) / maxC) * 100}%` }} />
                            </div>
                            <span className="text-sm font-bold text-slate-800 w-24 md:w-28 text-right shrink-0">{fmtUSD(item.vl_fob || 0)}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-[#D80E16] shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                            )}
                          </div>
                          {/* [REMOVED] Scored companies for this country */}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Cities - expandable rows */}
                {flowCities.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="secao-cidades">
                    <div className="p-4 md:p-5 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-[#D80E16]" />
                          Cidades
                          <span className="text-sm font-normal text-slate-400">({flowCities.length})</span>
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 md:p-5 space-y-2 max-h-[600px] overflow-y-auto">
                      {/* Column legend */}
                      <div className="flex items-center gap-3 md:gap-4 px-4 py-1 text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                        <span className="w-6 shrink-0 text-right">#</span>
                        <span className="w-5 shrink-0" />
                        <span className="flex-1">Cidade</span>
                        <span className="w-8 shrink-0 text-center">UF</span>
                        <span className="w-20 shrink-0 text-right">Volume</span>
                        <span className="w-12 shrink-0 text-right">Ops</span>
                        <span className="w-20 shrink-0 text-right">Preço/kg</span>
                        <span className="w-12 shrink-0 text-right group relative cursor-help" title="Diferença do preço/kg da cidade em relação à média do NCM. ▲ = acima da média, ▼ = abaixo da média">
                          VS Média
                          <svg className="h-2.5 w-2.5 inline-block ml-0.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                        </span>
                        <span className="w-24 shrink-0 text-right">FOB</span>
                        <span className="w-5 shrink-0" />
                      </div>
                      {flowCities.slice(0, 25).map((ct, i) => {
                        const cityPrice = ct.kg_liquido && ct.kg_liquido >= 50 ? ct.vl_fob / ct.kg_liquido : null;
                        const avgPrice = details?.ncm_price_avg?.[tab as "import" | "export"]?.price_per_kg || 0;
                        const diff = avgPrice > 0 && cityPrice ? ((cityPrice - avgPrice) / avgPrice) * 100 : 0;
                        const isExpanded = expandedCity === ct.cod_mun;
                        const cityCode = ct.cod_mun || "";

                        // Get expanded data
                        const cityCountriesList = cityCountries && cityCode ? (cityCountries[cityCode] || []) : [];
                        const cityPortsList = cityPorts && cityCode ? (cityPorts[cityCode] || []) : [];

                        return (
                          <div key={i}>
                            <div
                              className={cn(
                                "flex items-center gap-3 md:gap-4 py-3.5 px-4 rounded-xl cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5",
                                isExpanded
                                  ? "bg-[#D80E16]/5 border-2 border-[#D80E16]/30 shadow-sm"
                                  : "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
                              )}
                              onClick={() => setExpandedCity(isExpanded ? null : cityCode)}
                            >
                              <span className="text-sm font-bold text-slate-400 w-6 text-right shrink-0">{i + 1}</span>
                              <StateBadge uf={ct.uf} size="sm" badge />
                              <span className="text-sm font-bold text-slate-900 flex-1 truncate">{ct.nome_mun}</span>
                              <span className="text-xs font-semibold text-slate-500 w-8 shrink-0">{ct.uf}</span>
                              <span className="text-xs font-semibold text-slate-700 w-20 text-right shrink-0 font-mono">{ct.kg_liquido != null && ct.kg_liquido > 0 ? fmtKg(ct.kg_liquido) : '-'}</span>
                              <span className="text-[10px] text-slate-500 w-12 text-right shrink-0 font-mono">{ct.ops != null && ct.ops > 0 ? ct.ops + 'x' : '-'}</span>
                              {cityPrice ? (
                                <span className="text-xs font-bold font-mono text-slate-800 w-20 text-right shrink-0">${cityPrice.toFixed(2)}</span>
                              ) : <span className="text-xs text-slate-400 w-20 text-right shrink-0">-</span>}
                              {avgPrice > 0 && cityPrice ? (
                                <span className={cn("text-[10px] font-bold w-12 text-right shrink-0", diff > 5 ? "text-emerald-600" : diff < -5 ? "text-red-500" : "text-slate-500")}>{diff > 0 ? "▲" : "▼"}{Math.abs(diff).toFixed(0)}%</span>
                              ) : <span className="text-[10px] text-slate-400 w-12 text-right shrink-0">-</span>}
                              <span className="text-sm font-bold text-slate-800 w-24 text-right shrink-0">{fmtUSD(ct.vl_fob)}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-[#D80E16] shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                              )}
                            </div>

                            {/* EXPANDED CONTENT */}
                            {isExpanded && (
                              <div className="mt-1 ml-8 pl-4 border-l-2 border-[#D80E16]/20 space-y-3 py-2">
                                {/* Price per kg info */}
                                {cityPrice != null && (
                                  <div className="bg-slate-50 rounded-lg p-4 flex items-center gap-3 flex-wrap">
                                    <div>
                                      <span className="text-xs font-bold text-slate-500 uppercase">Preço</span>
                                      <span className="block text-base font-bold text-slate-900">US$ {cityPrice.toFixed(2)}/kg</span>
                                    </div>
                                    {avgPrice > 0 && (
                                      <>
                                        <div>
                                          <span className="text-xs font-bold text-slate-500 uppercase">Média NCM</span>
                                          <span className="block text-base font-bold text-slate-700">US$ {avgPrice.toFixed(2)}/kg</span>
                                        </div>
                                        <div className={cn("px-3 py-1.5 rounded-full text-sm font-bold", diff > 5 ? "bg-emerald-100 text-emerald-700" : diff < -5 ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-600")}>
                                          {diff > 0 ? "▲" : "▼"} {Math.abs(diff).toFixed(0)}%
                                        </div>
                                      </>
                                    )}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelectedCity(cityCode); setCityPanelOpen(true); }}
                                      className="ml-auto text-xs font-bold text-white bg-[#D80E16] hover:bg-[#b00c12] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h18"/></svg>
                                      Ver detalhes
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelectedCity(cityCode); document.getElementById('secao-empresas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                                      className="text-xs font-bold text-[#D80E16] hover:text-[#b00c12] bg-[#D80E16]/10 hover:bg-[#D80E16]/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                      Mapa
                                    </button>
                                  </div>
                                )}

                                {/* Countries this city trades with — ALWAYS show */}
                                {cityCountriesList.length > 0 && (
                                  <div className="bg-slate-50 rounded-lg p-4">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                                      Países de {tab === "import" ? "origem" : "destino"} ({cityCountriesList.length})
                                      <span className="text-[11px] text-slate-400 font-normal ml-auto">US$/kg</span>
                                    </h4>
                                    <div className="space-y-1">
                                      {cityCountriesList.slice(0, 15).map((cc, j) => (
                                        <CityCountryRow
                                          key={j}
                                          cc={cc}
                                          ncm={ncms[0]?.code || ""}
                                          tab={tab}
                                          setSelectedPais={setSelectedPais}
                                        />
                                      ))}
                                    </div>
                                    {cityCountriesList.length > 15 && (
                                      <p className="text-xs text-slate-400 mt-2">+ {cityCountriesList.length - 15} países</p>
                                    )}
                                  </div>
                                )}

                                {/* Ports this city uses — ALWAYS show */}
                                {cityPortsList.length > 0 && (
                                  <div className="bg-slate-50 rounded-lg p-4">
                                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4a11.6 11.6 0 0 0 1.62 6"/><path d="M12 4V2"/><path d="M9 3h6"/></svg>
                                      Portos / Vias ({cityPortsList.length})
                                    </h4>
                                    <div className="space-y-1">
                                      {cityPortsList.slice(0, 10).map((cp, j) => (
                                        <div key={j}>
                                          <div className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                                            <span className="shrink-0"><UrfIcon viaName={cp.via_name} size={16} /></span>
                                            <span className="text-slate-800 font-semibold truncate min-w-0">{cp.urf_name || cp.urf}</span>
                                            <span className="text-slate-500 text-[11px] font-medium shrink-0">{getTransportLabel(cp.via_name)}</span>
                                            <span className="font-mono text-slate-500 text-[11px] shrink-0 ml-auto">{fmtKg(cp.kg)}</span>
                                            <span className="font-bold text-slate-900 text-xs w-24 text-right shrink-0">{fmtUSD(cp.fob)}</span>
                                          </div>
                                          {cp.countries && cp.countries.length > 1 && (
                                            <div className="ml-8 pl-4 border-l-2 border-slate-200 space-y-0.5 mb-1">
                                              {cp.countries.filter(ct => ct.kg > 0).map((ct, ck) => (
                                                <div key={ck} className="flex items-center gap-2 text-xs py-0.5 px-3 text-slate-500">
                                                  <span className="truncate min-w-0">→ {ct.nome_pais}</span>
                                                  <span className="font-mono shrink-0 ml-auto">{fmtKg(ct.kg)}</span>
                                                  <span className="font-semibold text-slate-700 text-[11px] w-20 text-right shrink-0">{fmtUSD(ct.fob)}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Empty state */}
                                {cityCountriesList.length === 0 && cityPortsList.length === 0 && (
                                  <p className="text-xs text-slate-400 italic">Sem dados detalhados para esta cidade no período.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* DETAILED DATA TABLE */}
              <div id="secao-dados">
              {tradeData.length > 0 && tradeSummary && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 md:p-5 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                        <FileSearch className="h-5 w-5 text-[#D80E16]" />
                        Dados Detalhados <span className="text-sm font-normal text-slate-400">({tradeSummary.rowCount} registros)</span>
                      </h3>
                      <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 gap-1.5 text-xs" onClick={() => exportCsv(tradeData, tab)}><Download className="h-3.5 w-3.5" /> CSV</Button>
                    </div>
                  </div>
                  <MobileDataTable
                    data={tradeData}
                    fmtUSD={fmtUSD}
                    fmtKg={fmtKg}
                    flowType={tab}
                  />
                </div>
              )}
              </div>

            </div>
          )}

          {/* Empty state */}
          {!loading && !details && !tradeSummary && !error && (
            <div className="mt-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <FileSearch className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">Inteligência de Mercado TRADEXA</h3>
              <p className="text-base text-slate-400 max-w-lg mx-auto">
                Adicione NCMs para consultar dados de importação/exportação por cidade,
                encontrar empresas relacionadas e mapear a concorrência.
              </p>
            </div>
          )}
        </main>
          </div>
      </div>

      {/* ═══ CITY DETAIL PANEL ═══ */}
      {(() => {
        if (!cityPanelOpen || !selectedCity || !details) return null;
        const city = flowCities.find(c => c.cod_mun === selectedCity);
        if (!city) return null;
        const cityCountriesList = cityCountries?.[selectedCity] || [];
        const cityPortsList = cityPorts?.[selectedCity] || cityPortsOpposite?.[selectedCity] || [];
        const companyInfo = globeCompanyData?.[selectedCity];
        const avgPrice = city.kg_liquido && city.kg_liquido >= 50 ? city.vl_fob / city.kg_liquido : undefined;
        const ncmAvg = details?.ncm_price_avg?.[tab as "import" | "export"]?.price_per_kg;
        return (
          <CityDetailPanel
            open={cityPanelOpen}
            onClose={() => setCityPanelOpen(false)}
            cityName={city.nome_mun}
            cityUf={city.uf}
            cityCodMun={city.cod_mun || selectedCity}
            fob={city.vl_fob}
            kg={city.kg_liquido || 0}
            ops={city.ops}
            avgPrice={avgPrice}
            ncmAvgPrice={ncmAvg}
            companyCount={companyInfo?.companyCount || 0}
            topCompanies={companyInfo?.topCompanies || []}
            countries={cityCountriesList}
            ports={cityPortsList}
            flowType={tab}
            onCountryClick={(codPais) => {
              setCityPanelOpen(false);
              setSelectedCity(null);
              setSelectedPais(codPais);
            }}
            fmtUSD={fmtUSD}
            fmtKg={fmtKg}
          />
        );
      })()}

      {/* ═══ MOBILE BOTTOM NAV ═══ */}
      {!loading && details && (
        <MobileBottomNav
          items={[
            { id: "secao-resumo", label: "Resumo", icon: BarChart3 },
            { id: "secao-mapa", label: "Mapa", icon: MapPin },
            { id: "secao-empresas", label: "Empresas", icon: Building2 },
            { id: "secao-paises", label: "Países", icon: Globe },
            { id: "secao-dados", label: "Dados", icon: FileSearch },
          ]}
        />
      )}

      {/* ═══ MOBILE FILTER DRAWER ═══ */}
      <MobileFilterDrawer
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        tab={tab}
        onTabChange={(t) => { setTab(t); setExpandedCity(null); }}
        ncmInput={ncmInput}
        onNcmInputChange={setNcmInput}
        ncms={ncms}
        onAddNcm={addNcm}
        onRemoveNcm={removeNcm}
        ncmSuggestions={ncmSug}
        onNcmFocus={() => { if (ncmInput.length >= 2) setShowNcmSug(true); }}
        period={period}
        onPeriodChange={setPeriod}
        latestYear={latestMonth.import?.year || 2026}
        latestMonth={latestMonth.import?.month || 5}
        ufs={ufs}
        onToggleUf={toggleUf}
        onClearUfs={() => setUfs([])}
        onSearch={search}
        onClearAll={() => { setUfs([]); setNcms([]); setNcmInput(""); }}
        loading={loading}
      />
    </>
  );
}

/* ═══════════════════════════════════════════
   MonthlyChart COMPONENT
   ═══════════════════════════════════════════ */

function MonthlyChart({ data, flowType, monthlyData }: { 
  data: TradeRow[]; 
  flowType: string; 
  monthlyData?: { year: string; month: string; fob: number; kg: number }[] 
}) {
  const [metric, setMetric] = useState<"fob" | "kg">("fob");
  // Use monthlyData from API (preferred) or derive from tradeData
  const monthly = useMemo(() => {
    if (monthlyData && monthlyData.length > 0) {
      return monthlyData.map(m => [`${m.year}-${m.month}`, { fob: m.fob, kg: m.kg }] as [string, { fob: number; kg: number }]);
    }
    const byMonth = new Map<string, { fob: number; kg: number }>();
    data.forEach(r => {
      const monthKey = r.year && r.monthNumber ? `${r.year}-${String(r.monthNumber).padStart(2, "0")}`
        : r.period ? `${r.period}` : null;
      if (!monthKey) return;
      const val = byMonth.get(monthKey) || { fob: 0, kg: 0 };
      val.fob += Number(r.metricFOB || 0);
      val.kg += Number(r.metricKg || 0);
      byMonth.set(monthKey, val);
    });
    return [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  }, [data, monthlyData]);

  // Group monthly by year for YoY comparison bars
  const byYear = useMemo(() => {
    const years = new Map<string, Map<string, { fob: number; kg: number }>>();
    for (const [key, val] of monthly) {
      const [year, month] = key.split("-");
      if (!years.has(year)) years.set(year, new Map());
      years.get(year)!.set(month, val);
    }
    return years;
  }, [monthly]);

  // Find months that appear in multiple years (for YoY bars)
  if (!monthly.length) return null;
  const maxVal = Math.max(...monthly.map(([, v]) => metric === "fob" ? v.fob : v.kg));
  const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // Determine if we have multiple years
  const years = [...new Set(monthly.map(([k]) => k.split("-")[0]))].sort();
  const hasMultipleYears = years.length >= 2;

  const getYearColor = (year: string) => {
    if (!hasMultipleYears) return "#D80E16";
    return year === years[years.length - 1] ? "#D80E16" : "#FCA5A5";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <BarChart3 className="h-4 w-4 text-[#D80E16]" />
            Evolução {flowType === "import" ? "das Importações" : "das Exportações"}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setMetric("fob")}
                className={cn("text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                  metric === "fob" ? "bg-[#D80E16] text-white" : "text-slate-500 hover:text-slate-700")}
              >FOB</button>
              <button
                onClick={() => setMetric("kg")}
                className={cn("text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                  metric === "kg" ? "bg-[#D80E16] text-white" : "text-slate-500 hover:text-slate-700")}
              >KG</button>
            </div>
            {hasMultipleYears && (
              <div className="flex items-center gap-3 text-[10px]">
                {years.map(y => (
                  <span key={y} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getYearColor(y) }} />
                    {y}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-3 md:p-4">
        <div className="flex items-end gap-1.5 h-44">
          {monthly.map(([key, val]) => {
            const currentVal = metric === "fob" ? val.fob : val.kg;
            const pct = maxVal > 0 ? (currentVal / maxVal) * 100 : 0;
            const parts = key.split("-");
            const monthNum = parseInt(parts[1]);
            const label = monthNames[monthNum] || parts[1];
            const year = parts[0];
            const color = getYearColor(year);
            
            // Find previous year's value for this month (YoY overlay)
            const prevYear = years.includes(String(Number(year) - 1)) ? String(Number(year) - 1) : null;
            const prevVal = prevYear ? byYear.get(prevYear)?.get(parts[1]) : undefined;
            const prevValNum = prevVal ? (metric === "fob" ? prevVal.fob : prevVal.kg) : 0;
            const prevPct = prevVal && maxVal > 0 ? (prevValNum / maxVal) * 100 : 0;

            return (
              <div key={key} className="flex-1 flex flex-col items-center gap-1.5 relative">
                <span className="text-[9px] font-semibold text-slate-500">{metric === "fob" ? fmtUSD(currentVal) : fmtKg(currentVal)}</span>
                {/* Previous year's bar (behind) */}
                {prevVal && prevValNum > 0 && (
                  <div className="absolute bottom-6 w-full flex justify-center">
                    <div className="w-[90%] bg-red-100 rounded-t-sm" style={{ height: `${Math.max(prevPct * 0.5, 3)}px` }} />
                  </div>
                )}
                {/* Current bar */}
                <div className="w-full bg-slate-100 rounded-full overflow-hidden" style={{ height: `${Math.max(pct * 0.7, 4)}px` }}>
                  <div 
                    className="h-full rounded-full transition-all" 
                    style={{ width: `${pct}%`, backgroundColor: color, opacity: prevVal ? '0.5' : '0.7' }} 
                  />
                </div>
                <span className="text-[9px] text-slate-400">{label}</span>
                {prevVal && prevValNum > 0 && (
                  <span className="text-[7px] font-bold mt-[-2px]">
                    {currentVal > prevValNum ? (
                      <span className="text-emerald-600">▲ {((currentVal - prevValNum) / prevValNum * 100).toFixed(0)}%</span>
                    ) : (
                      <span className="text-red-500">▼ {((prevValNum - currentVal) / prevValNum * 100).toFixed(0)}%</span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SumCard COMPONENT
   ═══════════════════════════════════════════ */

function SumCard({ icon: Icon, label, value, color, sparklineData, sparklineColor, gradient }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string;
  color: "red" | "blue" | "green" | "amber" | "purple";
  sparklineData?: { [k: string]: number }[];
  sparklineColor?: string;
  gradient?: string;
}) {
  const colors = {
    red: { bg: "bg-[#D80E16]/10", t: "text-[#D80E16]", i: "text-[#D80E16]", gradient: "from-red-50 to-white", line: "#D80E16" },
    blue: { bg: "bg-blue-100", t: "text-blue-700", i: "text-blue-600", gradient: "from-blue-50 to-white", line: "#2563EB" },
    green: { bg: "bg-emerald-100", t: "text-emerald-700", i: "text-emerald-600", gradient: "from-emerald-50 to-white", line: "#059669" },
    amber: { bg: "bg-amber-100", t: "text-amber-700", i: "text-amber-600", gradient: "from-amber-50 to-white", line: "#D97706" },
    purple: { bg: "bg-purple-100", t: "text-purple-700", i: "text-purple-600", gradient: "from-purple-50 to-white", line: "#7C3AED" },
  }[color];
  const hasSparkline = sparklineData && sparklineData.length >= 2;
  const dataKey = sparklineData && sparklineData.length > 0 ? Object.keys(sparklineData[0])[0] : "value";
  const strokeColor = sparklineColor || colors.line;
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white shadow-sm p-4 md:p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden", gradient || `bg-gradient-to-br ${colors.gradient}`)}>
      <div className="flex items-center gap-3 md:gap-4">
        <div className={cn("p-2 md:p-2.5 rounded-xl", colors.bg)}><Icon className={cn("h-5 w-5 md:h-6 md:w-6", colors.i)} /></div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={cn("text-2xl md:text-3xl font-black mt-1 truncate", colors.t)}>{value}</p>
        </div>
      </div>
      {hasSparkline && (
        <div className="mt-1 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DONUT CHART CARD
   ═══════════════════════════════════════════ */

const DONUT_COLORS = [
  "#D80E16", "#2563EB", "#059669", "#D97706", "#7C3AED",
  "#DC2626", "#0891B2", "#65A30D", "#C026D3", "#EA580C",
  "#0284C7", "#84CC16", "#0D9488", "#9333EA", "#E11D48",
];

interface DonutItem {
  name: string;
  value: number;
  color?: string;
  codPais?: string;
}

function DonutChartCard({ title, icon: Icon, data, formatter, height = 220 }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  data: DonutItem[];
  formatter?: (v: number) => string;
  height?: number;
}) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0);
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, 10);
  const topItems = sorted.slice(0, 5);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-[#D80E16]" />
          {title}
          <span className="text-sm font-normal text-slate-400">({data.length})</span>
        </h3>
      </div>
      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Donut */}
          <div className="shrink-0">
            <ResponsiveContainer width={160} height={height}>
              <PieChart>
                <Pie
                  data={sorted}
                  cx="50%" cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sorted.map((entry, i) => (
                    <Cell key={i} fill={entry.color || DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [formatter ? formatter(value) : value, ""]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex-1 w-full space-y-2 min-w-0">
            {topItems.map((item, i) => {
              const pct = total > 0 ? ((item.value / total) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {item.codPais ? (
                    <CountryFlag codPais={item.codPais} nome={item.name} size="xs" />
                  ) : (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || DONUT_COLORS[i % DONUT_COLORS.length] }}
                    />
                  )}
                  <span className="text-slate-700 truncate flex-1 text-xs">{item.name}</span>
                  <span className="text-xs font-semibold text-slate-900">{pct.toFixed(0)}%</span>
                  <span className="text-[10px] text-slate-400 w-16 text-right">{formatter ? formatter(item.value) : item.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


