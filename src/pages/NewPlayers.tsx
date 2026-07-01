"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Loader2, Users, TrendingUp, Globe, Building2,
  AlertCircle, Package, Sparkles,
  DollarSign, UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { GlassKpi, GlassCard } from "@/components/GlassKpi";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";
import { saveSearchHistory } from "@/hooks/use-search-history";
import { AVAILABLE_YEARS } from "@/lib/utils";
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

interface PlayerEntry {
  id: string;
  /** Deterministic company-like identifier derived from registro fields */
  entityKey: string;
  /** Human-readable entity name */
  entityName: string;
  /** Country of origin/destination */
  country: string;
  countryCode: string;
  /** Brazilian state (UF) */
  state: string;
  stateName: string;
  /** Customs unit (URF) */
  urf: string;
  urfName: string;
  /** First date this entity appeared (YYYY-MM) */
  firstSeen: string;
  /** First seen month label */
  firstSeenLabel: string;
  /** Total trade volume (FOB) */
  totalFob: number;
  /** Total weight (kg) */
  totalKg: number;
  /** Transaction count */
  transactionCount: number;
  /** Whether this is a "new" player (detected in current period) */
  isNew: boolean;
  /** Direction */
  direction: "import" | "export";
}

type Direction = "import" | "export" | "both";

/* ═══════════════════ CONSTANTS ═══════════════════ */

const ANOS = [...AVAILABLE_YEARS].reverse().map((v) => ({ value: v, label: v }));

const MESES_FULL = [
  { value: "01", label: "Jan" }, { value: "02", label: "Fev" }, { value: "03", label: "Mar" },
  { value: "04", label: "Abr" }, { value: "05", label: "Mai" }, { value: "06", label: "Jun" },
  { value: "07", label: "Jul" }, { value: "08", label: "Ago" }, { value: "09", label: "Set" },
  { value: "10", label: "Out" }, { value: "11", label: "Nov" }, { value: "12", label: "Dez" },
];

const MONTH_NAMES: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

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
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

/**
 * Generate a deterministic entity key from registro fields.
 * Derives a "company-like" identifier from the available fields
 * since the raw COMEXSTAT data doesn't contain CNPJ.
 */
function deriveEntityKey(r: Registro): string {
  // Use country + state + customs unit + first municipality (if any) as a unique entity
  const munKey = r.municipios?.[0]?.co_mun || "0000000";
  return `${r.co_pais}_${r.sg_uf}_${r.co_urf}_${munKey}`;
}

function deriveEntityName(r: Registro): string {
  const munName = r.municipios?.[0]?.mun_nome || "";
  const parts: string[] = [];
  if (munName) parts.push(munName);
  parts.push(r.urf_nome || r.sg_uf);
  parts.push(r.pais_nome);
  return parts.join(" · ");
}

/** Simple hash-based country code for flag emoji */
const COUNTRY_FLAG: Record<string, string> = {
  "Estados Unidos": "🇺🇸", "China": "🇨🇳", "Argentina": "🇦🇷",
  "Alemanha": "🇩🇪", "Itália": "🇮🇹", "França": "🇫🇷",
  "Japão": "🇯🇵", "Reino Unido": "🇬🇧", "Bélgica": "🇧🇪",
  "Canadá": "🇨🇦", "Chile": "🇨🇱", "México": "🇲🇽",
  "Espanha": "🇪🇸", "Países Baixos (Holanda)": "🇳🇱", "Portugal": "🇵🇹",
  "Índia": "🇮🇳", "Coreia do Sul": "🇰🇷", "Rússia": "🇷🇺",
  "Austrália": "🇦🇺", "Suíça": "🇨🇭", "Suécia": "🇸🇪",
  "Paraguai": "🇵🇾", "Uruguai": "🇺🇾", "Bolívia": "🇧🇴",
  "Peru": "🇵🇪", "Colômbia": "🇨🇴", "Equador": "🇪🇨",
  "Arábia Saudita": "🇸🇦", "Emirados Árabes Unidos": "🇦🇪",
  "Tailândia": "🇹🇭", "Indonésia": "🇮🇩", "Turquia": "🇹🇷",
  "Vietnã": "🇻🇳", "Taiwan (Formosa)": "🇹🇼",
};

function getFlag(country: string): string {
  return COUNTRY_FLAG[country] || "🌐";
}

/**
 * Map country name to ISO 2-letter code (used for flag emoji fallback)
 */
function getCountryCode(country: string): string {
  const map: Record<string, string> = {
    "Estados Unidos": "US", "China": "CN", "Argentina": "AR",
    "Alemanha": "DE", "Itália": "IT", "França": "FR",
    "Japão": "JP", "Reino Unido": "GB", "Bélgica": "BE",
    "Canadá": "CA", "Chile": "CL", "México": "MX",
    "Espanha": "ES", "Países Baixos (Holanda)": "NL", "Portugal": "PT",
    "Índia": "IN", "Coreia do Sul": "KR", "Rússia": "RU",
    "Austrália": "AU", "Suíça": "CH", "Suécia": "SE",
    "Paraguai": "PY", "Uruguai": "UY", "Bolívia": "BO",
    "Peru": "PE", "Colômbia": "CO", "Equador": "EC",
    "Tailândia": "TH", "Indonésia": "ID", "Turquia": "TR",
    "Vietnã": "VN",
  };
  return map[country] || "";
}

/* ═══════════════════ COMPONENT ═══════════════════ */

export default function NewPlayers() {
  const { consume } = useUsage();

  /* ── Search form state ── */
  const [searchNcm, setSearchNcm] = useState("");
  const [ncmDescription, setNcmDescription] = useState("");
  const [direction, setDirection] = useState<Direction>("import");
  const [anoDe, setAnoDe] = useState("2024");
  const [mesDe, setMesDe] = useState("01");
  const [anoAte, setAnoAte] = useState("2026");
  const [mesAte, setMesAte] = useState("12");

  /* ── NCM autocomplete ── */
  const [ncmSuggestions, setNcmSuggestions] = useState<NcmSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /* ── Data state ── */
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [importRegistros, setImportRegistros] = useState<Registro[]>([]);
  const [exportRegistros, setExportRegistros] = useState<Registro[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  useSeo({
    title: "Novos Players — Detecte Novos Importadores e Exportadores",
    description:
      "Identifique novos importadores e exportadores entrando no mercado brasileiro por NCM. Detecte oportunidades comerciais com empresas que começaram a operar recentemente.",
    keywords:
      "novos importadores, novos exportadores, novos players, comércio exterior, NCM, oportunidades comerciais, novos entrantes",
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

  /* ═══════════════════ DETECT NEW PLAYERS ═══════════════════ */

  /**
   * Analyze registros to detect "new players" — entities that appear
   * in the current period but were not present in a prior reference
   * period. Since raw COMEXSTAT data doesn't contain CNPJ, we derive
   * unique entity keys from (country + state + customs unit + municipality)
   * and check their first occurrence date.
   */
  function detectNewPlayers(
    importData: Registro[],
    exportData: Registro[],
    refYear: string,
  ): { players: PlayerEntry[]; allImportPlayers: PlayerEntry[]; allExportPlayers: PlayerEntry[] } {
    // Map entity key → aggregated player data
    const playerMap = new Map<string, {
      entityKey: string;
      entityName: string;
      country: string;
      co_pais: string;
      state: string;
      stateName: string;
      urf: string;
      urfName: string;
      firstAno: string;
      firstMes: string;
      totalFob: number;
      totalKg: number;
      count: number;
      direction: "import" | "export";
    }>();

    // Process import registros
    for (const r of importData) {
      const key = deriveEntityKey(r);
      const existing = playerMap.get(key);
      const monthStr = `${r.co_ano}-${r.co_mes}`;
      const fob = Number(r.vl_fob) || 0;
      const kg = Number(r.kg_liquido) || 0;

      if (existing) {
        existing.totalFob += fob;
        existing.totalKg += kg;
        existing.count += Number(r.qt_estat) || 1;
        // Update first seen if this occurrence is earlier
        const existingDate = `${existing.firstAno}-${existing.firstMes}`;
        if (monthStr < existingDate) {
          existing.firstAno = r.co_ano;
          existing.firstMes = r.co_mes;
        }
      } else {
        playerMap.set(key, {
          entityKey: key,
          entityName: deriveEntityName(r),
          country: r.pais_nome || "N/I",
          co_pais: r.co_pais || "ZZ",
          state: r.sg_uf || "XX",
          stateName: r.uf_nome || "",
          urf: r.co_urf || "",
          urfName: r.urf_nome || "",
          firstAno: r.co_ano,
          firstMes: r.co_mes,
          totalFob: fob,
          totalKg: kg,
          count: Number(r.qt_estat) || 1,
          direction: "import",
        });
      }
    }

    // Process export registros
    for (const r of exportData) {
      const key = `exp_${deriveEntityKey(r)}`;
      const existing = playerMap.get(key);
      const monthStr = `${r.co_ano}-${r.co_mes}`;
      const fob = Number(r.vl_fob) || 0;
      const kg = Number(r.kg_liquido) || 0;

      if (existing) {
        existing.totalFob += fob;
        existing.totalKg += kg;
        existing.count += Number(r.qt_estat) || 1;
        const existingDate = `${existing.firstAno}-${existing.firstMes}`;
        if (monthStr < existingDate) {
          existing.firstAno = r.co_ano;
          existing.firstMes = r.co_mes;
        }
      } else {
        playerMap.set(key, {
          entityKey: key,
          entityName: deriveEntityName(r),
          country: r.pais_nome || "N/I",
          co_pais: r.co_pais || "ZZ",
          state: r.sg_uf || "XX",
          stateName: r.uf_nome || "",
          urf: r.co_urf || "",
          urfName: r.urf_nome || "",
          firstAno: r.co_ano,
          firstMes: r.co_mes,
          totalFob: fob,
          totalKg: kg,
          count: Number(r.qt_estat) || 1,
          direction: "export",
        });
      }
    }

    // Build player entries with isNew flag
    const players: PlayerEntry[] = [];
    const importPlayers: PlayerEntry[] = [];
    const exportPlayers: PlayerEntry[] = [];

    for (const p of playerMap.values()) {
      const monthLabel = `${MONTH_NAMES[p.firstMes] || p.firstMes}/${p.firstAno}`;
      const isNew = p.firstAno >= refYear;
      const entry: PlayerEntry = {
        id: p.entityKey,
        entityKey: p.entityKey,
        entityName: p.entityName,
        country: p.country,
        countryCode: getCountryCode(p.country),
        state: p.state,
        stateName: p.stateName,
        urf: p.urf,
        urfName: p.urfName,
        firstSeen: `${p.firstAno}-${p.firstMes}`,
        firstSeenLabel: monthLabel,
        totalFob: p.totalFob,
        totalKg: p.totalKg,
        transactionCount: p.count,
        isNew,
        direction: p.direction,
      };
      players.push(entry);
      if (p.direction === "import") importPlayers.push(entry);
      else exportPlayers.push(entry);
    }

    return { players, allImportPlayers: importPlayers, allExportPlayers: exportPlayers };
  }

  /* ═══════════════════ MAIN SEARCH ═══════════════════ */

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

    const ncmClean = searchNcm.replace(/\D/g, "");
    const params = { ncm: ncmClean, anoDe, mesDe, anoAte, mesAte };

    const promises: Promise<any>[] = [];
    const labels: string[] = [];

    if (direction === "import" || direction === "both") {
      promises.push(
        supabase.functions.invoke("import-data", { body: { ...params, tipo: "IMP" } }),
      );
      labels.push("import");
    }
    if (direction === "export" || direction === "both") {
      promises.push(
        supabase.functions.invoke("export-data", { body: { ...params, tipo: "EXP" } }),
      );
      labels.push("export");
    }

    try {
      const results = await Promise.allSettled(promises);

      let importData: Registro[] = [];
      let exportData: Registro[] = [];
      let importDesc = "";
      let exportDesc = "";

      for (let i = 0; i < results.length; i++) {
        const label = labels[i];
        const result = results[i];

        if (result.status === "fulfilled") {
          const value = result.value;
          const { data, error: funcError } = value;
          if (funcError) {
            if (label === "import") setImportError(funcError.message);
            else setExportError(funcError.message);
            continue;
          }
          if (data?.error) {
            if (label === "import") setImportError(data.error);
            else setExportError(data.error);
            continue;
          }
          const registros = data?.registros || [];
          if (label === "import") {
            importData = registros;
            setImportRegistros(registros);
            if (data?.ncm_description) importDesc = data.ncm_description;
          } else {
            exportData = registros;
            setExportRegistros(registros);
            if (data?.ncm_description) exportDesc = data.ncm_description;
          }
        } else {
          const reason = result.reason;
          const msg = reason?.message || "Erro ao buscar dados";
          if (label === "import") setImportError(msg);
          else setExportError(msg);
        }
      }

      // Set NCM description
      if (importDesc) setNcmDescription(importDesc);
      else if (exportDesc) setNcmDescription(exportDesc);

      // Show success
      const impCount = importData.length;
      const expCount = exportData.length;
      const msgParts: string[] = [];
      let totalRegistros = 0;
      if (direction === "both" || direction === "import") {
        msgParts.push(`${formatNumber(impCount)} registros de importação`);
        totalRegistros += impCount;
      }
      if (direction === "both" || direction === "export") {
        msgParts.push(`${formatNumber(expCount)} registros de exportação`);
        totalRegistros += expCount;
      }
      if (totalRegistros > 0) {
        showSuccess(msgParts.join(" e ") + " encontrados!");
        saveSearchHistory(
          "Novos Players",
          `NCM ${searchNcm} — ${direction === "import" ? "Importação" : direction === "export" ? "Exportação" : "Ambos"}`,
          "new_players",
        );
      } else {
        showError("Nenhum registro encontrado para o NCM e período selecionados.");
      }
    } catch (err: any) {
      const msg = err.message || "Erro inesperado";
      showError("Erro: " + msg);
      setImportError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchNcm, anoDe, mesDe, anoAte, mesAte, direction, consume]);

  /* ═══════════════════ DERIVED DATA ═══════════════════ */

  const { players, allImportPlayers, allExportPlayers } = useMemo(() => {
    if (!importRegistros.length && !exportRegistros.length) {
      return { players: [], allImportPlayers: [], allExportPlayers: [] };
    }
    // Reference year for "newness" — use the search end year
    const refYear = anoAte;
    return detectNewPlayers(importRegistros, exportRegistros, refYear);
  }, [importRegistros, exportRegistros, anoAte]);

  /** Players sorted by firstSeen descending (newest first) */
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      // Newest first
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return b.firstSeen.localeCompare(a.firstSeen);
    });
  }, [players]);

  /** Only "new" players */
  const newPlayers = useMemo(() => players.filter((p) => p.isNew), [players]);

  /* ── KPI calculations ── */
  const kpis = useMemo(() => {
    const totalNew = newPlayers.length;
    const totalVolume = newPlayers.reduce((s, p) => s + p.totalFob, 0);
    // Top country among new players
    const countryCount = new Map<string, number>();
    for (const p of newPlayers) {
      countryCount.set(p.country, (countryCount.get(p.country) || 0) + 1);
    }
    const topCountry = countryCount.size > 0
      ? [...countryCount.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : "—";
    return { totalNew, totalVolume, topCountry };
  }, [newPlayers]);

  /* ── Table view filter ── */
  const [showOnlyNew, setShowOnlyNew] = useState(true);
  const displayedPlayers = showOnlyNew ? newPlayers : sortedPlayers;

  /* ═══════════════════ RENDER ═══════════════════ */

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Novos Players"
        subtitle="Detecte novos importadores e exportadores entrando no mercado por NCM"
        badges={[
          { label: "ANÁLISE DE MERCADO", className: "bg-violet-500/20 text-violet-300" },
          { label: "COMEXSTAT", className: "bg-sky-500/20 text-sky-300" },
        ]}
        variant="default"
      />

      {/* ── Search Card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            {/* Direction toggle + NCM row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Direction selector */}
              <div className="lg:col-span-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Direção
                </Label>
                <div className="flex gap-1 mt-1">
                  {(["import", "export", "both"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={cn(
                        "flex-1 h-9 text-[10px] font-bold rounded-lg border transition-all",
                        direction === d
                          ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                          : "bg-slate-800/50 border-slate-700/30 text-slate-400 hover:border-slate-600/40",
                      )}
                    >
                      {d === "import" ? "Importação" : d === "export" ? "Exportação" : "Ambos"}
                    </button>
                  ))}
                </div>
              </div>

              {/* NCM input */}
              <div className="lg:col-span-4 relative">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Código NCM
                </Label>
                <Input
                  ref={inputRef}
                  placeholder="Ex: 8471, 84..."
                  className="h-9 mt-1 border border-slate-700/30 bg-slate-800/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500"
                  value={searchNcm}
                  onChange={(e) => {
                    setSearchNcm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {showSuggestions && ncmSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700/50 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                  >
                    {ncmSuggestions.map((s) => (
                      <button
                        key={s.code}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-800/80 flex justify-between items-center"
                        onClick={() => selectNcm(s.code)}
                      >
                        <span className="font-bold text-xs text-slate-200">
                          {formatNcmCode(s.code)}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[200px] ml-2">
                          {s.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date range */}
              <div className="lg:col-span-4">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Período
                </Label>
                <div className="flex gap-1.5 mt-1">
                  <div className="flex-1 flex gap-1">
                    <Select value={anoDe} onValueChange={setAnoDe}>
                      <SelectTrigger className="h-9 text-xs rounded-lg border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {ANOS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={mesDe} onValueChange={setMesDe}>
                      <SelectTrigger className="h-9 text-xs rounded-lg w-20 border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {MESES_FULL.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-slate-500 self-end pb-1.5 text-xs">até</span>
                  <div className="flex-1 flex gap-1">
                    <Select value={anoAte} onValueChange={setAnoAte}>
                      <SelectTrigger className="h-9 text-xs rounded-lg border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {ANOS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={mesAte} onValueChange={setMesAte}>
                      <SelectTrigger className="h-9 text-xs rounded-lg w-20 border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {MESES_FULL.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Search button */}
              <div className="lg:col-span-2 flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full h-9 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs gap-1.5"
                >
                  {loading ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando...</>
                  ) : (
                    <><UserPlus className="w-3.5 h-3.5" /> Detectar Players</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Errors ── */}
      {importError && (
        <div className="p-4 rounded-xl bg-red-900/30 border border-red-800/40 text-sm text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-xs">Erro importação:</p>
            <p className="text-xs">{importError}</p>
          </div>
        </div>
      )}
      {exportError && (
        <div className="p-4 rounded-xl bg-red-900/30 border border-red-800/40 text-sm text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-xs">Erro exportação:</p>
            <p className="text-xs">{exportError}</p>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto" />
            <p className="text-sm text-slate-400">
              Analisando registros para detectar novos players...
            </p>
            <p className="text-[10px] text-slate-500">
              {direction === "both"
                ? "Buscando dados de importação e exportação"
                : direction === "import"
                ? "Buscando dados de importação"
                : "Buscando dados de exportação"}
            </p>
          </div>
        </div>
      )}

      {/* ── Initial state (no search yet) ── */}
      {!hasSearched && !loading && (
        <div className="rounded-2xl border border-slate-700/30 bg-slate-900/20 backdrop-blur-sm p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto">
            <UserPlus className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-lg font-black text-slate-200">
            Detecte Novos Entrantes no Mercado
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Selecione um NCM, direção e período para identificar empresas e
            entidades que começaram a importar ou exportar recentemente.
            Detectamos novos players comparando registros dentro do período
            selecionado.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mt-4">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/20">
              <p className="text-[10px] font-bold text-violet-400 uppercase">NCM</p>
              <p className="text-xs text-slate-300 mt-1">Digite o código do produto</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/20">
              <p className="text-[10px] font-bold text-violet-400 uppercase">Período</p>
              <p className="text-xs text-slate-300 mt-1">Defina o intervalo de análise</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/20">
              <p className="text-[10px] font-bold text-violet-400 uppercase">Direção</p>
              <p className="text-xs text-slate-300 mt-1">Importação ou exportação</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {hasSearched && !loading && players.length > 0 && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassKpi
              label="Novos Players Detectados"
              value={formatNumber(kpis.totalNew)}
              variant="violet"
              delay={0}
              icon={UserPlus}
            />
            <GlassKpi
              label="Volume Total (FOB)"
              value={formatCurrency(kpis.totalVolume)}
              variant="amber"
              delay={0.1}
              icon={DollarSign}
            />
            <GlassKpi
              label="Principal País de Origem"
              value={kpis.topCountry !== "—"
                ? `${getFlag(kpis.topCountry)} ${kpis.topCountry}`
                : "—"}
              variant="cyan"
              delay={0.2}
              icon={Globe}
            />
          </div>

          {/* NCM info + toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-200">
                NCM {formatNcmCode(searchNcm.replace(/\D/g, ""))}
                {ncmDescription && (
                  <span className="font-normal text-slate-400 ml-2">
                    — {ncmDescription}
                  </span>
                )}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {formatNumber(players.length)} players únicos encontrados
                {players.length !== newPlayers.length && (
                  <span className="text-violet-400">
                    {" · "}{formatNumber(newPlayers.length)} novos
                  </span>
                )}
                {" · "}Período: {MONTH_NAMES[mesDe]}/{anoDe} a{" "}
                {MONTH_NAMES[mesAte]}/{anoAte}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOnlyNew(true)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap",
                  showOnlyNew
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:border-slate-600/40",
                )}
              >
                <UserPlus className="w-3 h-3 inline mr-1" />
                Apenas Novos ({newPlayers.length})
              </button>
              <button
                onClick={() => setShowOnlyNew(false)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap",
                  !showOnlyNew
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:border-slate-600/40",
                )}
              >
                <Users className="w-3 h-3 inline mr-1" />
                Todos ({players.length})
              </button>
            </div>
          </div>

          {/* Player Table */}
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Player
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      País
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      UF
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      URF / Porto
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Direção
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      1ª Aparição
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Volume FOB
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Transações
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 w-20">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPlayers.map((player, idx) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02, duration: 0.25 }}
                      className={cn(
                        "border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors",
                        player.isNew ? "bg-violet-900/5" : "",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-800/60 flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                              {player.entityName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[180px] font-mono">
                              {player.entityKey}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-300 whitespace-nowrap">
                          {getFlag(player.country)} {player.country}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-300">
                          {player.stateName || player.state}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-300 truncate max-w-[120px] block">
                          {player.urfName || player.urf || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          className={cn(
                            "text-[9px] font-black uppercase tracking-wider px-2 py-0.5",
                            player.direction === "import"
                              ? "bg-sky-500/15 text-sky-400 border border-sky-500/20"
                              : "bg-amber-500/15 text-amber-400 border border-amber-500/20",
                          )}
                        >
                          {player.direction === "import" ? "IMP" : "EXP"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-slate-300 font-mono">
                          {player.firstSeenLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-bold text-slate-200 font-mono">
                          {formatCurrency(player.totalFob)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs text-slate-400 font-mono">
                          {formatNumber(player.transactionCount)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {player.isNew ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 animate-pulse">
                            ★ NOVO
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-slate-500">Estabelecido</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state for filter */}
            {displayedPlayers.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">
                  Nenhum player novo detectado neste período.
                </p>
                <p className="text-xs mt-1">
                  Tente expandir o período ou selecionar um NCM diferente.
                </p>
              </div>
            )}
          </GlassCard>

          {/* Direction summary chips */}
          {allImportPlayers.length > 0 && allExportPlayers.length > 0 && (
            <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-900/20 border border-sky-800/30 text-sky-300">
                <Package className="w-3 h-3" />
                {formatNumber(allImportPlayers.length)} importadores
                {" · "}
                {formatNumber(newPlayers.filter(p => p.direction === "import").length)} novos
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900/20 border border-amber-800/30 text-amber-300">
                <TrendingUp className="w-3 h-3" />
                {formatNumber(allExportPlayers.length)} exportadores
                {" · "}
                {formatNumber(newPlayers.filter(p => p.direction === "export").length)} novos
              </span>
            </div>
          )}

          {/* Re-search */}
          <div className="text-center pt-2">
            <Button
              onClick={handleSearch}
              disabled={loading}
              variant="outline"
              className="border-slate-700/30 text-slate-300 hover:bg-slate-800/50 text-xs font-bold gap-1.5 rounded-xl"
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando...</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Nova Detecção</>
              )}
            </Button>
          </div>
        </>
      )}

      {/* ── No results ── */}
      {hasSearched && !loading && players.length === 0 && !importError && !exportError && (
        <div className="rounded-2xl border border-slate-700/30 bg-slate-900/20 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-300">
            Nenhum registro encontrado
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não foram encontrados registros de {direction === "import"
              ? "importação"
              : direction === "export"
              ? "exportação"
              : "importação ou exportação"} para o NCM{" "}
            <strong className="text-slate-300">{formatNcmCode(searchNcm.replace(/\D/g, ""))}</strong>{" "}
            no período selecionado. Tente um NCM diferente ou expanda o período.
          </p>
        </div>
      )}

      {/* ── Global Market Context ── */}
      {searchNcm.replace(/\D/g, "").length >= 4 && (
        <div className="mt-6">
          <GlobalMarketSection ncm={searchNcm.replace(/\D/g, "").slice(0, 6)} />
        </div>
      )}
    </div>
  );
}
