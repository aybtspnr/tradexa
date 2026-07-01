"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, TrendingUp, TrendingDown, DollarSign,
  Package, Globe, AlertCircle, ArrowRight, ArrowLeft, ArrowLeftRight,
  Map, Route, Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { GlassKpi, GlassCard } from "@/components/GlassKpi";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";
import { saveSearchHistory } from "@/hooks/use-search-history";
import GlobalMarketSection from "@/components/intel/GlobalMarketSection";

/* ═══════════════════ TYPES ═══════════════════ */

interface Registro {
  co_ano: string;
  co_mes: string;
  mes_nome: string;
  co_pais: string;
  pais_nome: string;
  sg_uf: string;
  uf_nome: string;
  co_via: string;
  via_nome: string;
  co_urf: string;
  urf_nome: string;
  co_unid: string;
  unid_nome: string;
  qt_estat: number;
  kg_liquido: number;
  vl_fob: number;
  municipios: { co_mun: string; mun_nome: string; kg_liquido: number; vl_fob: number }[];
}

interface NcmSuggestion {
  code: string;
  description: string;
}

interface TradeRoute {
  partnerCountry: string;
  partnerCode: string;
  fob: number;
  kg: number;
  transactions: number;
}

interface RouteCardData {
  partnerCountry: string;
  partnerCode: string;
  direction: "import" | "export";
  fob: number;
  kg: number;
  transactions: number;
}

/* ═══════════════════ COUNTRY FLAG HELPERS ═══════════════════ */

const COUNTRY_FLAGS: Record<string, string> = {
  "china": "🇨🇳",
  "estados unidos": "🇺🇸",
  "eua": "🇺🇸",
  "argentina": "🇦🇷",
  "alemanha": "🇩🇪",
  "países baixos": "🇳🇱",
  "holanda": "🇳🇱",
  "japão": "🇯🇵",
  "japao": "🇯🇵",
  "coreia do sul": "🇰🇷",
  "méxico": "🇲🇽",
  "méxico": "🇲🇽",
  "itália": "🇮🇹",
  "frança": "🇫🇷",
  "espanha": "🇪🇸",
  "reino unido": "🇬🇧",
  "chile": "🇨🇱",
  "índia": "🇮🇳",
  "india": "🇮🇳",
  "canadá": "🇨🇦",
  "canada": "🇨🇦",
  "bélgica": "🇧🇪",
  "suíça": "🇨🇭",
  "suica": "🇨🇭",
  "rússia": "🇷🇺",
  "russia": "🇷🇺",
  "arábia saudita": "🇸🇦",
  "arabia saudita": "🇸🇦",
  "austrália": "🇦🇺",
  "australia": "🇦🇺",
  "indonésia": "🇮🇩",
  "indonesia": "🇮🇩",
  "tailândia": "🇹🇭",
  "tailandia": "🇹🇭",
  "malásia": "🇲🇾",
  "malasia": "🇲🇾",
  "singapura": "🇸🇬",
  "vietnã": "🇻🇳",
  "vietna": "🇻🇳",
  "emirados árabes unidos": "🇦🇪",
  "emirados arabes unidos": "🇦🇪",
  "peru": "🇵🇪",
  "colômbia": "🇨🇴",
  "colombia": "🇨🇴",
  "venezuela": "🇻🇪",
  "egito": "🇪🇬",
  "nígeria": "🇳🇬",
  "nigeria": "🇳🇬",
  "áfrica do sul": "🇿🇦",
  "africa do sul": "🇿🇦",
  "paraguai": "🇵🇾",
  "uruguai": "🇺🇾",
  "bolívia": "🇧🇴",
  "bolivia": "🇧🇴",
  "equador": "🇪🇨",
  "portugal": "🇵🇹",
  "suécia": "🇸🇪",
  "suecia": "🇸🇪",
  "dinamarca": "🇩🇰",
  "polônia": "🇵🇱",
  "polonia": "🇵🇱",
  "áustria": "🇦🇹",
  "austria": "🇦🇹",
  "irlanda": "🇮🇪",
  "finlândia": "🇫🇮",
  "finlandia": "🇫🇮",
  "noruega": "🇳🇴",
  "turquia": "🇹🇷",
  "israel": "🇮🇱",
  "taiwan": "🇹🇼",
  "hong kong": "🇭🇰",
  "panamá": "🇵🇦",
  "panama": "🇵🇦",
  "guatemala": "🇬🇹",
  "costa rica": "🇨🇷",
  "república dominicana": "🇩🇴",
  "republica dominicana": "🇩🇴",
  "cuba": "🇨🇺",
  "marrocos": "🇲🇦",
  "argélia": "🇩🇿",
  "argelia": "🇩🇿",
  "angola": "🇦🇴",
  "moçambique": "🇲🇿",
  "mocambique": "🇲🇿",
  "catar": "🇶🇦",
  "kuwait": "🇰🇼",
  "omã": "🇴🇲",
  "oma": "🇴🇲",
  "jordânia": "🇯🇴",
  "jordania": "🇯🇴",
  "líbano": "🇱🇧",
  "libano": "🇱🇧",
  "ucrânia": "🇺🇦",
  "ucrania": "🇺🇦",
  "romênia": "🇷🇴",
  "romenia": "🇷🇴",
  "grécia": "🇬🇷",
  "grecia": "🇬🇷",
  "hungria": "🇭🇺",
  "república tcheca": "🇨🇿",
  "republica tcheca": "🇨🇿",
  "tcheca": "🇨🇿",
  "eslováquia": "🇸🇰",
  "eslovaquia": "🇸🇰",
  "eslovênia": "🇸🇮",
  "eslovenia": "🇸🇮",
  "croácia": "🇭🇷",
  "croacia": "🇭🇷",
  "lituânia": "🇱🇹",
  "lituania": "🇱🇹",
  "letônia": "🇱🇻",
  "letonia": "🇱🇻",
  "estônia": "🇪🇪",
  "estonia": "🇪🇪",
  "bulgária": "🇧🇬",
  "bulgaria": "🇧🇬",
  "bielorrússia": "🇧🇾",
  "bielorrussia": "🇧🇾",
  "cazaquistão": "🇰🇿",
  "cazaquistao": "🇰🇿",
  "nova zelândia": "🇳🇿",
  "nova zelandia": "🇳🇿",
  "filipinas": "🇵🇭",
  "paquistão": "🇵🇰",
  "paquistao": "🇵🇰",
  "bangladesh": "🇧🇩",
  "sri lanka": "🇱🇰",
  "myanmar": "🇲🇲",
  "birmânia": "🇲🇲",
  "birmânia": "🇲🇲",
  "camboja": "🇰🇭",
  "quênia": "🇰🇪",
  "quenia": "🇰🇪",
  "gana": "🇬🇭",
  "costa do marfim": "🇨🇮",
  "senegal": "🇸🇳",
  "camarões": "🇨🇲",
  "camaroes": "🇨🇲",
  "congo": "🇨🇬",
  "gabão": "🇬🇦",
  "gabao": "🇬🇦",
  "tunísia": "🇹🇳",
  "tunisia": "🇹🇳",
  "etiópia": "🇪🇹",
  "etiopia": "🇪🇹",
  "síria": "🇸🇾",
  "siria": "🇸🇾",
  "iraque": "🇮🇶",
  "irã": "🇮🇷",
  "ira": "🇮🇷",
  "sérvia": "🇷🇸",
  "servia": "🇷🇸",
  "libia": "🇱🇾",
  "lÍbia": "🇱🇾",
  "haiti": "🇭🇹",
  "jamaica": "🇯🇲",
  "bahamas": "🇧🇸",
  "trinidad e tobago": "🇹🇹",
  "barbados": "🇧🇧",
  "belize": "🇧🇿",
  "guiana": "🇬🇾",
  "suriname": "🇸🇷",
  "porto rico": "🇵🇷",
  "luxemburgo": "🇱🇺",
  "malta": "🇲🇹",
  "chipre": "🇨🇾",
  "islândia": "🇮🇸",
  "islandia": "🇮🇸",
  "albânia": "🇦🇱",
  "albania": "🇦🇱",
  "macedônia": "🇲🇰",
  "macedonia": "🇲🇰",
  "bósnia": "🇧🇦",
  "bosnia": "🇧🇦",
  "montenegro": "🇲🇪",
  "geórgia": "🇬🇪",
  "georgia": "🇬🇪",
  "armênia": "🇦🇲",
  "armenia": "🇦🇲",
  "azerbaijão": "🇦🇿",
  "azerbaijao": "🇦🇿",
  "turcomenistão": "🇹🇲",
  "turcomenistao": "🇹🇲",
  "uzbequistão": "🇺🇿",
  "uzbequistao": "🇺🇿",
  "quirguistão": "🇰🇬",
  "quirguistao": "🇰🇬",
  "tadjiquistão": "🇹🇯",
  "tadjiquistao": "🇹🇯",
  "mongólia": "🇲🇳",
  "mongolia": "🇲🇳",
  "brunei": "🇧🇳",
  "laos": "🇱🇦",
  "butão": "🇧🇹",
  "butao": "🇧🇹",
  "nepal": "🇳🇵",
  "ilhas marshall": "🇲🇭",
  "ilhas salomão": "🇸🇧",
  "salomão": "🇸🇧",
  "fiji": "🇫🇯",
  "samoa": "🇼🇸",
  "papua nova guiné": "🇵🇬",
  "papua nova guinea": "🇵🇬",
  "timor leste": "🇹🇱",
  "timor-leste": "🇹🇱",
  "somália": "🇸🇴",
  "somalia": "🇸🇴",
  "sudão": "🇸🇩",
  "sudao": "🇸🇩",
  "sudão do sul": "🇸🇸",
  "sudao do sul": "🇸🇸",
  "botswana": "🇧🇼",
  "zâmbia": "🇿🇲",
  "zambia": "🇿🇲",
  "zimbábue": "🇿🇼",
  "zimbabue": "🇿🇼",
  "malauí": "🇲🇼",
  "malaui": "🇲🇼",
  "madagascar": "🇲🇬",
  "uganda": "🇺🇬",
  "ruanda": "🇷🇼",
  "burundi": "🇧🇮",
  "seicheles": "🇸🇨",
  "maurício": "🇲🇺",
  "mauricio": "🇲🇺",
  "cabo verde": "🇨🇻",
  "guiné-bissau": "🇬🇼",
  "guine-bissau": "🇬🇼",
  "guiné equatorial": "🇬🇶",
  "guine equatorial": "🇬🇶",
  "guiné": "🇬🇳",
  "guine": "🇬🇳",
  "togo": "🇹🇬",
  "benin": "🇧🇯",
  "burkina faso": "🇧🇫",
  "mali": "🇲🇱",
  "níger": "🇳🇪",
  "niger": "🇳🇪",
  "chade": "🇹🇩",
  "república centro-africana": "🇨🇫",
  "republica centro-africana": "🇨🇫",
  "república democrática do congo": "🇨🇩",
  "republica democratica do congo": "🇨🇩",
  "guiné": "🇬🇳",
  "guine": "🇬🇳",
  "libéria": "🇱🇷",
  "liberia": "🇱🇷",
  "serra leoa": "🇸🇱",
  "mauritânia": "🇲🇷",
  "mauritania": "🇲🇷",
  "djibuti": "🇩🇯",
  "eritréia": "🇪🇷",
  "eritreia": "🇪🇷",
  "bahrein": "🇧🇭",
  "iemen": "🇾🇪",
};

function getCountryFlag(countryName: string): string {
  if (!countryName) return "🌍";
  const key = countryName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return COUNTRY_FLAGS[key] || "🌍";
}

/* ═══════════════════ HELPERS ═══════════════════ */

function formatNcmCode(code: string): string {
  const digits = (code || "").replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  return code;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `US$ ${(n / 1_000).toFixed(2)}K`;
  return `US$ ${n.toFixed(2)}`;
}

function formatCurrencyFull(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function aggregateRoutes(registros: Registro[], direction: "import" | "export"): TradeRoute[] {
  const countryMap = new Map<string, { fob: number; kg: number; transactions: number }>();

  for (const r of registros) {
    const fob = Number(r.vl_fob) || 0;
    const kg = Number(r.kg_liquido) || 0;
    const country = r.pais_nome || "Desconhecido";
    const code = r.co_pais || "ZZ";

    const prev = countryMap.get(country) || { fob: 0, kg: 0, transactions: 0 };
    prev.fob += fob;
    prev.kg += kg;
    prev.transactions += Number(r.qt_estat) || 0;
    countryMap.set(country, prev);
  }

  return Array.from(countryMap.entries())
    .map(([partnerCountry, data]) => ({
      partnerCountry,
      partnerCode: "",
      fob: data.fob,
      kg: data.kg,
      transactions: data.transactions,
    }))
    .sort((a, b) => b.fob - a.fob);
}

/* ═══════════════════ COMPONENT ═══════════════════ */

export default function TradeRoutes() {
  const { consume } = useUsage();

  /* ── Search form state ── */
  const [searchNcm, setSearchNcm] = useState("");
  const [ncmDescription, setNcmDescription] = useState("");
  const [direction, setDirection] = useState<"import" | "export">("import");

  /* ── NCM autocomplete ── */
  const [ncmSuggestions, setNcmSuggestions] = useState<NcmSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /* ── Data state ── */
  const [loading, setLoading] = useState(false);
  const [importRoutes, setImportRoutes] = useState<TradeRoute[]>([]);
  const [exportRoutes, setExportRoutes] = useState<TradeRoute[]>([]);
  const [importRegistros, setImportRegistros] = useState<Registro[]>([]);
  const [exportRegistros, setExportRegistros] = useState<Registro[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  /* ── Summary KPIs ── */
  const importSummary = importRoutes.length > 0
    ? {
        totalRoutes: importRoutes.length,
        totalFob: importRoutes.reduce((s, r) => s + r.fob, 0),
        totalKg: importRoutes.reduce((s, r) => s + r.kg, 0),
        topOrigin: importRoutes[0]?.partnerCountry || "—",
        topFob: importRoutes[0]?.fob || 0,
      }
    : null;

  const exportSummary = exportRoutes.length > 0
    ? {
        totalRoutes: exportRoutes.length,
        totalFob: exportRoutes.reduce((s, r) => s + r.fob, 0),
        totalKg: exportRoutes.reduce((s, r) => s + r.kg, 0),
        topDestination: exportRoutes[0]?.partnerCountry || "—",
        topFob: exportRoutes[0]?.fob || 0,
      }
    : null;

  /* ── Active routes (based on direction toggle) ── */
  const activeRoutes = direction === "import" ? importRoutes : exportRoutes;
  const topRoutes = activeRoutes.slice(0, 30);
  const routeCount = activeRoutes.length;

  useSeo({
    title: "Fluxo de Rotas — TRADEXA",
    description:
      "Visualize rotas comerciais entre países para qualquer NCM. Explore origens, destinos e volumes por rota comercial.",
    keywords:
      "rotas comerciais, fluxo de comércio, rotas exportação, rotas importação, comexstat, origem destino, NCM",
  });

  /* ── Close suggestions on outside click ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !suggestionsRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Fetch NCM suggestions ── */
  useEffect(() => {
    const fetchSuggestions = async () => {
      const digits = searchNcm.replace(/\D/g, "");
      if (digits.length < 2) {
        setNcmSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("ncms")
          .select("code, description")
          .like("code", `${digits}%`)
          .limit(10);
        setNcmSuggestions(data || []);
        setShowSuggestions((data || []).length > 0);
      } catch {
        setNcmSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [searchNcm]);

  /* ── Select NCM from suggestion ── */
  const selectNcm = useCallback((code: string) => {
    setSearchNcm(formatNcmCode(code));
    setShowSuggestions(false);
  }, []);

  /* ── Main search ── */
  const handleSearch = useCallback(async () => {
    if (!searchNcm.trim()) {
      showError("Digite um código NCM.");
      return;
    }

    const ok = await consume("search");
    if (!ok) return;

    setLoading(true);
    setHasSearched(true);
    setImportError(null);
    setExportError(null);
    setImportRegistros([]);
    setExportRegistros([]);
    setImportRoutes([]);
    setExportRoutes([]);

    const ncmClean = searchNcm.replace(/\D/g, "");
    const params = { ncm: ncmClean };

    const promises: Promise<any>[] = [];
    promises.push(
      supabase.functions.invoke("import-data", { body: { ...params, tipo: "IMP" } }),
    );
    promises.push(
      supabase.functions.invoke("export-data", { body: { ...params, tipo: "EXP" } }),
    );

    try {
      const results = await Promise.allSettled(promises);
      let importData: Registro[] = [];
      let exportData: Registro[] = [];
      let importDesc = "";
      let exportDesc = "";

      // Import result (index 0)
      if (results[0].status === "fulfilled") {
        const value = results[0].value;
        const { data, error: funcError } = value;
        if (funcError) {
          setImportError(funcError.message);
        } else if (data?.error) {
          setImportError(data.error);
        } else {
          importData = data?.registros || [];
          setImportRegistros(importData);
          if (data?.ncm_description) importDesc = data.ncm_description;
        }
      } else {
        setImportError(results[0].reason?.message || "Erro ao buscar importação");
      }

      // Export result (index 1)
      if (results[1].status === "fulfilled") {
        const value = results[1].value;
        const { data, error: funcError } = value;
        if (funcError) {
          setExportError(funcError.message);
        } else if (data?.error) {
          setExportError(data.error);
        } else {
          exportData = data?.registros || [];
          setExportRegistros(exportData);
          if (data?.ncm_description) exportDesc = data.ncm_description;
        }
      } else {
        setExportError(results[1].reason?.message || "Erro ao buscar exportação");
      }

      // Set NCM description
      if (importDesc) setNcmDescription(importDesc);
      else if (exportDesc) setNcmDescription(exportDesc);

      // Aggregate routes
      if (importData.length > 0) {
        setImportRoutes(aggregateRoutes(importData, "import"));
      }
      if (exportData.length > 0) {
        setExportRoutes(aggregateRoutes(exportData, "export"));
      }

      // Show success
      const msgParts: string[] = [];
      if (importData.length > 0) {
        msgParts.push(`${formatNumber(importData.length)} registros de importação`);
      }
      if (exportData.length > 0) {
        msgParts.push(`${formatNumber(exportData.length)} registros de exportação`);
      }
      if (msgParts.length > 0) {
        showSuccess(msgParts.join(" e ") + " encontrados!");
      }
      saveSearchHistory(
        "Fluxo de Rotas",
        `NCM ${searchNcm} — ${direction === "import" ? "Importação" : "Exportação"}`,
        "trade_balance",
      );
    } catch (err: any) {
      const msg = err.message || "Erro inesperado";
      showError("Erro: " + msg);
      setImportError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchNcm, direction, consume]);

  /* ── Route card renderer ── */
  const renderRouteCard = (route: TradeRoute, index: number) => {
    const rank = index + 1;
    const isImport = direction === "import";

    return (
      <motion.div
        key={`${route.partnerCountry}-${direction}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.6) }}
        className="group relative overflow-hidden rounded-2xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 hover:border-slate-600/40"
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Rank badge */}
            <div className="shrink-0 w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/40 flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-400 tabular-nums">
                {rank}
              </span>
            </div>

            {/* Route indicator */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Origin */}
                <span className="flex items-center gap-1.5">
                  <span className="text-lg leading-none">{getCountryFlag(isImport ? route.partnerCountry : "Brasil")}</span>
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {isImport ? route.partnerCountry : "Brasil"}
                  </span>
                </span>

                {/* Arrow */}
                <span className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                  isImport
                    ? "bg-rose-500/15 text-rose-400"
                    : "bg-emerald-500/15 text-emerald-400",
                )}>
                  {isImport ? (
                    <ArrowRight className="w-3 h-3" />
                  ) : (
                    <ArrowRight className="w-3 h-3" />
                  )}
                  <span>{isImport ? "IMP" : "EXP"}</span>
                </span>

                {/* Destination */}
                <span className="flex items-center gap-1.5">
                  <span className="text-lg leading-none">{getCountryFlag(isImport ? "Brasil" : route.partnerCountry)}</span>
                  <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {isImport ? "Brasil" : route.partnerCountry}
                  </span>
                </span>
              </div>
            </div>

            {/* FOB Value */}
            <div className="shrink-0 text-right">
              <p className="text-xs font-black tabular-nums text-slate-100">
                {formatCurrency(route.fob)}
              </p>
              <p className="text-[10px] text-slate-500 tabular-nums">
                {formatNumber(route.kg)} kg
              </p>
            </div>
          </div>

          {/* Progress bar for trade volume visualization */}
          <div className="mt-2.5 h-1 bg-slate-800/60 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                isImport ? "bg-rose-500/60" : "bg-emerald-500/60",
              )}
              style={{
                width: `${topRoutes.length > 0 ? (route.fob / topRoutes[0].fob) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Detail row */}
          <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatCurrencyFull(route.fob)}
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {formatNumber(route.kg)} kg
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {formatNumber(route.transactions)} transações
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  /* ── Initial empty state ── */
  const renderEmptyState = () => (
    <GlassCard>
      <div className="p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/30 mb-4">
          <Route className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-black text-slate-200 mb-1">
          Fluxo de Rotas Comerciais
        </h3>
        <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
          Digite um código NCM para visualizar as rotas comerciais entre países.
          Explore origens, destinos, valores FOB e volumes por rota.
        </p>
      </div>
    </GlassCard>
  );

  /* ── No results state ── */
  const renderNoResults = () => (
    <GlassCard>
      <div className="p-10 text-center">
        <Package className="w-14 h-14 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-black text-slate-200 mb-1">
          Nenhuma rota encontrada
        </h3>
        <p className="text-slate-400 text-xs">
          Nenhum dado disponível para o NCM e direção selecionados.
        </p>
      </div>
    </GlassCard>
  );

  /* ── SVG Network visualization (decorative overview) ── */
  const renderNetworkSvg = () => {
    if (activeRoutes.length === 0) return null;
    const topN = activeRoutes.slice(0, 8);
    const maxFob = topN[0]?.fob || 1;
    const isImp = direction === "import";

    // Generate positions along a curve
    const nodes = topN.map((r, i) => {
      const angle = (i / Math.max(topN.length - 1, 1)) * Math.PI - Math.PI / 2;
      const radius = 55 + (r.fob / maxFob) * 30;
      const x = 120 + Math.cos(angle) * radius;
      const y = 80 + Math.sin(angle) * radius * 0.6;
      return { ...r, x, y };
    });

    // Brazil center
    const brazilX = 120;
    const brazilY = 80;

    return (
      <div className="relative rounded-2xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-xl overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-black text-slate-200 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Rotas {isImp ? "de Importação" : "de Exportação"} — Top {topN.length}
          </h3>
          <div className="flex justify-center">
            <svg
              viewBox="0 0 240 160"
              className="w-full max-w-md h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background grid dots */}
              <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="0.5" fill="#334155" />
              </pattern>
              <rect width="240" height="160" fill="url(#grid)" rx="8" />

              {/* Connecting lines */}
              {nodes.map((node) => {
                const opacity = 0.15 + (node.fob / maxFob) * 0.6;
                return (
                  <line
                    key={`line-${node.partnerCountry}`}
                    x1={brazilX}
                    y1={brazilY}
                    x2={node.x}
                    y2={node.y}
                    stroke={isImp ? "#f43f5e" : "#10b981"}
                    strokeWidth={1 + (node.fob / maxFob) * 3}
                    opacity={opacity}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Animated dots on lines */}
              {nodes.map((node) => (
                <circle
                  key={`dot-${node.partnerCountry}`}
                  r={2.5 + (node.fob / maxFob) * 3}
                  fill={isImp ? "#f43f5e" : "#10b981"}
                  opacity={0.8}
                >
                  <animateMotion
                    dur={`${2 + Math.random() * 3}s`}
                    repeatCount="indefinite"
                    path={`M${brazilX},${brazilY} L${node.x},${node.y}`}
                  />
                </circle>
              ))}

              {/* Brazil center */}
              <circle cx={brazilX} cy={brazilY} r="12" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <text x={brazilX} y={brazilY + 1} textAnchor="middle" dominantBaseline="central" fontSize="7" fontWeight="bold" fill="#cbd5e1">
                🇧🇷
              </text>

              {/* Country nodes */}
              {nodes.map((node) => (
                <g key={`node-${node.partnerCountry}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={8 + (node.fob / maxFob) * 6}
                    fill={isImp ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)"}
                    stroke={isImp ? "#f43f5e" : "#10b981"}
                    strokeWidth="1"
                    opacity={0.7}
                  />
                  <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central" fontSize="9">
                    {getCountryFlag(node.partnerCountry)}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 16}
                    textAnchor="middle"
                    fontSize="5"
                    fill="#94a3b8"
                    fontWeight="bold"
                  >
                    {node.partnerCountry.length > 12
                      ? node.partnerCountry.slice(0, 10) + "…"
                      : node.partnerCountry}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Fluxo de Rotas"
        subtitle="Visualize rotas comerciais entre países para qualquer NCM — origens, destinos e volumes por rota"
        badges={[
          { label: "ROTAS COMERCIAIS", className: "bg-emerald-500/20 text-emerald-300" },
          { label: "COMEXSTAT", className: "bg-sky-500/20 text-sky-300" },
        ]}
        variant="default"
      />

      {/* ── Search Card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Direction toggle */}
              <div className="lg:col-span-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Direção da Rota
                </Label>
                <div className="flex gap-1 mt-1">
                  {(["import", "export"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={cn(
                        "flex-1 h-9 text-xs font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5",
                        direction === d
                          ? d === "import"
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                            : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-800/50 border-slate-700/30 text-slate-400 hover:border-slate-600/40",
                      )}
                    >
                      {d === "import" ? (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          Importação
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-3 h-3" />
                          Exportação
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* NCM input */}
              <div className="lg:col-span-5 relative">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Código NCM
                </Label>
                <Input
                  ref={inputRef}
                  placeholder="Ex: 8471, 84, 2933..."
                  className="h-9 mt-1 border border-slate-700/30 bg-slate-800/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500"
                  value={searchNcm}
                  onChange={(e) => {
                    setSearchNcm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <AnimatePresence>
                  {showSuggestions && ncmSuggestions.length > 0 && (
                    <motion.div
                      ref={suggestionsRef}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700/50 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                    >
                      {ncmSuggestions.map((s) => (
                        <button
                          key={s.code}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-800/80 flex justify-between items-center transition-colors"
                          onClick={() => selectNcm(s.code)}
                        >
                          <span className="font-bold text-xs text-slate-200">
                            {formatNcmCode(s.code)}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[220px] ml-2">
                            {s.description}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search button */}
              <div className="lg:col-span-4 flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className={cn(
                    "h-9 w-full rounded-lg font-bold gap-1.5 text-xs shadow-lg",
                    direction === "import"
                      ? "bg-rose-600 hover:bg-rose-500 shadow-rose-900/30"
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30",
                  )}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Buscar Rotas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Loading state ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-slate-400 text-sm font-medium">
                Buscando rotas comerciais para NCM {formatNcmCode(searchNcm.replace(/\D/g, ""))}...
              </p>
              <p className="text-slate-500 text-[10px]">
                {direction === "import" ? "Importação" : "Exportação"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error banners ── */}
      <AnimatePresence>
        {!loading && importError && (
          <motion.div
            key="import-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="rounded-2xl border border-red-800/40 bg-red-900/20 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3 text-red-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-bold text-sm">Importação: {importError}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {!loading && exportError && (
          <motion.div
            key="export-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card className="rounded-2xl border border-red-800/40 bg-red-900/20 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3 text-red-300">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="font-bold text-sm">Exportação: {exportError}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state (before first search) ── */}
      {!loading && !hasSearched && renderEmptyState()}

      {/* ── No results ── */}
      {!loading &&
        hasSearched &&
        activeRoutes.length === 0 &&
        !importError &&
        !exportError &&
        renderNoResults()}

      {/* ── RESULTS ── */}
      {!loading &&
        hasSearched &&
        activeRoutes.length > 0 && (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* ── NCM Description ── */}
          {ncmDescription && (
            <GlassCard>
              <div className="p-4">
                <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] px-3 py-1 rounded-full">
                  NCM {formatNcmCode(searchNcm.replace(/\D/g, ""))}
                </Badge>
                <p className="mt-2 text-sm text-slate-300 font-medium">{ncmDescription}</p>
              </div>
            </GlassCard>
          )}

          {/* ── Summary KPIs ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassKpi
              label={direction === "import" ? "Total Rotas (Importação)" : "Total Rotas (Exportação)"}
              value={formatNumber(routeCount)}
              variant={direction === "import" ? "rose" : "emerald"}
              delay={0}
              icon={Route}
            />
            <GlassKpi
              label="Valor Total FOB"
              value={
                direction === "import" && importSummary
                  ? formatCurrency(importSummary.totalFob)
                  : direction === "export" && exportSummary
                  ? formatCurrency(exportSummary.totalFob)
                  : "—"
              }
              variant="blue"
              delay={0.05}
              icon={DollarSign}
            />
            <GlassKpi
              label="Peso Total"
              value={
                direction === "import" && importSummary
                  ? formatNumber(importSummary.totalKg) + " kg"
                  : direction === "export" && exportSummary
                  ? formatNumber(exportSummary.totalKg) + " kg"
                  : "—"
              }
              variant="cyan"
              delay={0.1}
              icon={Package}
            />
            <GlassKpi
              label={direction === "import" ? "Principal Origem" : "Principal Destino"}
              value={
                direction === "import" && importSummary
                  ? importSummary.topOrigin
                  : direction === "export" && exportSummary
                  ? exportSummary.topDestination
                  : "—"
              }
              variant="amber"
              delay={0.15}
              icon={Flag}
            />
          </div>

          {/* ── Detailed FOB breakdown ── */}
          {direction === "import" && importSummary && exportSummary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassKpi
                label="Total FOB — Importação (todas origens)"
                value={formatCurrency(importSummary.totalFob)}
                variant="rose"
                delay={0.2}
                icon={TrendingDown}
              />
              <GlassKpi
                label="Total FOB — Exportação (todos destinos)"
                value={formatCurrency(exportSummary.totalFob)}
                variant="emerald"
                delay={0.25}
                icon={TrendingUp}
              />
            </div>
          )}

          {/* ── SVG Network visualization ── */}
          {renderNetworkSvg()}

          {/* ── Route Cards Section ── */}
          <div>
            <GlassCard>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                    <Route className={cn(
                      "w-4 h-4",
                      direction === "import" ? "text-rose-400" : "text-emerald-400",
                    )} />
                    Rotas de {direction === "import" ? "Importação" : "Exportação"}
                    <Badge className="bg-slate-700/50 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                      {formatNumber(routeCount)} rotas
                    </Badge>
                  </h3>

                  {/* Direction summary */}
                  <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      {getCountryFlag(direction === "import" ? activeRoutes[0]?.partnerCountry : "Brasil")}
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      {getCountryFlag(direction === "import" ? "Brasil" : activeRoutes[0]?.partnerCountry)}
                    </span>
                  </div>
                </div>

                {/* Routes list */}
                <div className="space-y-2.5">
                  {topRoutes.map((route, index) => renderRouteCard(route, index))}
                </div>

                {/* Overflow indicator */}
                {routeCount > 30 && (
                  <div className="mt-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/20 text-center">
                    <p className="text-slate-400 text-[10px]">
                      Mostrando as 30 maiores rotas de {formatNumber(routeCount)} no total.
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Top Origin/Destination detail */}
            {routeCount > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {direction === "import" && importSummary && (
                  <GlassCard>
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-rose-400/80 mb-1">
                        🏆 Principal Origem
                      </p>
                      <p className="text-lg font-black text-slate-100">
                        {getCountryFlag(importSummary.topOrigin)} {importSummary.topOrigin}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatCurrency(importSummary.topFob)} FOB —{" "}
                        {importSummary.totalFob > 0
                          ? ((importSummary.topFob / importSummary.totalFob) * 100).toFixed(1)
                          : 0}% do total
                      </p>
                    </div>
                  </GlassCard>
                )}
                {direction === "export" && exportSummary && (
                  <GlassCard>
                    <div className="p-4">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80 mb-1">
                        🏆 Principal Destino
                      </p>
                      <p className="text-lg font-black text-slate-100">
                        {getCountryFlag(exportSummary.topDestination)} {exportSummary.topDestination}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatCurrency(exportSummary.topFob)} FOB —{" "}
                        {exportSummary.totalFob > 0
                          ? ((exportSummary.topFob / exportSummary.totalFob) * 100).toFixed(1)
                          : 0}% do total
                      </p>
                    </div>
                  </GlassCard>
                )}
              </div>
            )}
          </div>

          {/* ── Global Market Context ── */}
          {searchNcm.replace(/\D/g, "").length >= 4 && (
            <div className="mt-6">
              <GlobalMarketSection ncm={searchNcm.replace(/\D/g, "").slice(0, 6)} />
            </div>
          )}

          {/* ── Data source footer ── */}
          <div className="text-center">
            <p className="text-[10px] text-slate-500">
              Fonte: MDIC / COMEXSTAT — Dados oficiais do comércio exterior brasileiro.
              Rotas ordenadas por valor FOB.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
