"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Loader2, BarChart3, TrendingUp, TrendingDown, DollarSign,
  Package, Globe, AlertCircle, LineChart as LineChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { GlassKpi, GlassCard } from "@/components/GlassKpi";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";
import { saveSearchHistory } from "@/hooks/use-search-history";
import { AVAILABLE_YEARS } from "@/lib/utils";

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

interface CountryRow {
  pais_nome: string;
  co_pais: string;
  importFob: number;
  importKg: number;
  exportFob: number;
  exportKg: number;
  fobTotal: number;
  sharePct: number;
}

interface MonthlyPoint {
  mes: string;
  mesLabel: string;
  importFob: number;
  exportFob: number;
}

interface NcmItem {
  ncm: string;
  descricao: string;
  importFob: number;
  exportFob: number;
}

/* ═══════════════════ CONSTANTS ═══════════════════ */

const ANOS = [...AVAILABLE_YEARS].reverse().map((v) => ({ value: v, label: v }));

const MESES = [
  { value: "_all", label: "Todos" },
  { value: "01", label: "Jan" }, { value: "02", label: "Fev" }, { value: "03", label: "Mar" },
  { value: "04", label: "Abr" }, { value: "05", label: "Mai" }, { value: "06", label: "Jun" },
  { value: "07", label: "Jul" }, { value: "08", label: "Ago" }, { value: "09", label: "Set" },
  { value: "10", label: "Out" }, { value: "11", label: "Nov" }, { value: "12", label: "Dez" },
];

const MESES_FULL = MESES.filter((m) => m.value !== "_all");

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

const MONTH_ORDER = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

type Direction = "import" | "export" | "both";

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

function aggregateRegistros(registros: Registro[]) {
  let totalFob = 0;
  let totalKg = 0;
  let totalTransactions = 0;
  const countriesSet = new Set<string>();
  const countriesMap = new Map<string, { fob: number; kg: number }>();
  const monthlyMap = new Map<string, { fob: number }>();

  for (const r of registros) {
    const fob = Number(r.vl_fob) || 0;
    const kg = Number(r.kg_liquido) || 0;
    totalFob += fob;
    totalKg += kg;
    totalTransactions += Number(r.qt_estat) || 0;

    // Country aggregation
    const paisKey = r.co_pais || "ZZ";
    if (r.pais_nome) {
      countriesSet.add(r.pais_nome);
      const prev = countriesMap.get(r.pais_nome) || { fob: 0, kg: 0 };
      prev.fob += fob;
      prev.kg += kg;
      countriesMap.set(r.pais_nome, prev);
    }

    // Monthly aggregation
    const mes = r.co_mes?.padStart(2, "0") || "00";
    if (mes && mes !== "00") {
      const prev = monthlyMap.get(mes) || { fob: 0 };
      prev.fob += fob;
      monthlyMap.set(mes, prev);
    }

    // NCM aggregation is done from the search — but the edge function
    // returns data for a single NCM, so we track it manually
    // Real top-NCM data would need a different endpoint; we approximate
  }

  return {
    totalFob,
    totalKg,
    totalTransactions,
    countryCount: countriesSet.size,
    countriesMap,
    monthlyMap,
  };
}

function mergeCountryRows(
  importMap: Map<string, { fob: number; kg: number }>,
  exportMap: Map<string, { fob: number; kg: number }>,
): CountryRow[] {
  const allCountries = new Set([...importMap.keys(), ...exportMap.keys()]);
  const rows: CountryRow[] = [];

  for (const country of allCountries) {
    const imp = importMap.get(country) || { fob: 0, kg: 0 };
    const exp = exportMap.get(country) || { fob: 0, kg: 0 };
    rows.push({
      pais_nome: country,
      co_pais: "",
      importFob: imp.fob,
      importKg: imp.kg,
      exportFob: exp.fob,
      exportKg: exp.kg,
      fobTotal: imp.fob + exp.fob,
      sharePct: 0,
    });
  }

  const grandTotal = rows.reduce((s, r) => s + r.fobTotal, 0);
  for (const r of rows) {
    r.sharePct = grandTotal > 0 ? (r.fobTotal / grandTotal) * 100 : 0;
  }

  return rows.sort((a, b) => b.fobTotal - a.fobTotal);
}

function buildMonthlySeries(
  importMonthly: Map<string, { fob: number }>,
  exportMonthly: Map<string, { fob: number }>,
): MonthlyPoint[] {
  return MONTH_ORDER.map((m) => ({
    mes: m,
    mesLabel: MONTH_LABELS[m] || m,
    importFob: importMonthly.get(m)?.fob || 0,
    exportFob: exportMonthly.get(m)?.fob || 0,
  }));
}

/* ═══════════════════ COMPONENT ═══════════════════ */

export default function ExportImportData() {
  const { consume } = useUsage();

  /* ── Search form state ── */
  const [searchNcm, setSearchNcm] = useState("");
  const [ncmDescription, setNcmDescription] = useState("");
  const [direction, setDirection] = useState<Direction>("both");
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
  const [importRegistros, setImportRegistros] = useState<Registro[]>([]);
  const [exportRegistros, setExportRegistros] = useState<Registro[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  /* ── Derived aggregates ── */
  const [importAgg, setImportAgg] = useState<ReturnType<typeof aggregateRegistros> | null>(null);
  const [exportAgg, setExportAgg] = useState<ReturnType<typeof aggregateRegistros> | null>(null);
  const [countryRows, setCountryRows] = useState<CountryRow[]>([]);
  const [monthlySeries, setMonthlySeries] = useState<MonthlyPoint[]>([]);
  const [topNcms, setTopNcms] = useState<NcmItem[]>([]);

  /* ── Active view tab ── */
  const [viewTab, setViewTab] = useState("overview");

  useSeo({
    title: "Exportação e Importação — Dados Brasil",
    description:
      "Compare dados de exportação e importação brasileira por NCM. Visualize métricas, países, séries temporais e mais.",
    keywords:
      "exportação Brasil, importação Brasil, balança comercial, NCM, comexstat, comércio exterior",
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
    setImportAgg(null);
    setExportAgg(null);
    setCountryRows([]);
    setMonthlySeries([]);
    setTopNcms([]);

    const ncmClean = searchNcm.replace(/\D/g, "");
    const params = { ncm: ncmClean, anoDe, mesDe, anoAte, mesAte };

    // Build promises based on direction
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

      // Set NCM description (prefer import description)
      if (importDesc) setNcmDescription(importDesc);
      else if (exportDesc) setNcmDescription(exportDesc);

      // Compute aggregates
      const impAgg = importData.length > 0 ? aggregateRegistros(importData) : null;
      const expAgg = exportData.length > 0 ? aggregateRegistros(exportData) : null;

      setImportAgg(impAgg);
      setExportAgg(expAgg);

      // Build country rows
      const impCountryMap = impAgg?.countriesMap || new Map();
      const expCountryMap = expAgg?.countriesMap || new Map();
      const merged = mergeCountryRows(impCountryMap, expCountryMap);
      setCountryRows(merged);

      // Build monthly series
      const impMonthly = impAgg?.monthlyMap || new Map();
      const expMonthly = expAgg?.monthlyMap || new Map();
      const series = buildMonthlySeries(impMonthly, expMonthly);
      setMonthlySeries(series);

      // Build top NCMs — from the search itself we only have one NCM
      // But the response may contain ncm-related info in some fields
      // We show the searched NCM and related codes
      const topList: NcmItem[] = [];
      if (ncmClean) {
        topList.push({
          ncm: formatNcmCode(ncmClean),
          descricao: importDesc || exportDesc || "Código pesquisado",
          importFob: impAgg?.totalFob || 0,
          exportFob: expAgg?.totalFob || 0,
        });
      }
      setTopNcms(topList);

      // Show success message
      const impCount = importData.length;
      const expCount = exportData.length;
      const msgParts: string[] = [];
      if (direction === "both" || direction === "import") {
        msgParts.push(`${formatNumber(impCount)} registros de importação`);
      }
      if (direction === "both" || direction === "export") {
        msgParts.push(`${formatNumber(expCount)} registros de exportação`);
      }
      showSuccess(msgParts.join(" e ") + " encontrados!");
      saveSearchHistory("Busca Exportação/Importação", `NCM ${searchNcm}`, "trade_balance");
    } catch (err: any) {
      const msg = err.message || "Erro inesperado";
      showError("Erro: " + msg);
      setImportError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchNcm, anoDe, mesDe, anoAte, mesAte, direction, consume]);

  /* ── KPI values ── */
  const importKpis = importAgg
    ? {
        fob: formatCurrency(importAgg.totalFob),
        kg: formatNumber(importAgg.totalKg) + " kg",
        transacoes: formatNumber(importAgg.totalTransactions),
        paises: formatNumber(importAgg.countryCount),
      }
    : null;

  const exportKpis = exportAgg
    ? {
        fob: formatCurrency(exportAgg.totalFob),
        kg: formatNumber(exportAgg.totalKg) + " kg",
        transacoes: formatNumber(exportAgg.totalTransactions),
        paises: formatNumber(exportAgg.countryCount),
      }
    : null;

  /* ── Trade balance ── */
  const balance =
    importAgg && exportAgg
      ? exportAgg.totalFob - importAgg.totalFob
      : null;

  /* ── Render ── */
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Exportação vs Importação"
        subtitle="Compare dados oficiais de exportação e importação brasileira por NCM — COMEXSTAT"
        badges={[
          { label: "DADOS OFICIAIS", className: "bg-emerald-500/20 text-emerald-300" },
          { label: "MDIC / COMEXSTAT", className: "bg-sky-500/20 text-sky-300" },
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
              <div className="lg:col-span-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Direção
                </Label>
                <div className="flex gap-1 mt-1">
                  {(["import", "export", "both"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDirection(d)}
                      className={cn(
                        "flex-1 h-9 text-xs font-bold rounded-lg border transition-all",
                        direction === d
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
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
              <div className="lg:col-span-3">
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
                  <span className="text-slate-500 self-end pb-2">—</span>
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
                  className="h-9 w-full bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold gap-1.5 text-xs shadow-lg shadow-emerald-900/30"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Loading overlay ── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-slate-400 text-sm font-medium">
              Buscando dados de importação e exportação...
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Error banners ── */}
      {!loading && importError && (
        <Card className="rounded-2xl border border-red-800/40 bg-red-900/20 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">Importação: {importError}</p>
          </CardContent>
        </Card>
      )}
      {!loading && exportError && (
        <Card className="rounded-2xl border border-red-800/40 bg-red-900/20 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">Exportação: {exportError}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Empty state (before first search) ── */}
      {!loading && !hasSearched && (
        <GlassCard>
          <div className="p-10 text-center">
            <BarChart3 className="w-14 h-14 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-200 mb-1">
              Compare Exportação e Importação
            </h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Digite um código NCM e selecione o período para visualizar dados comparativos
              de exportação e importação brasileira lado a lado.
            </p>
          </div>
        </GlassCard>
      )}

      {/* ── No results ── */}
      {!loading && hasSearched && importRegistros.length === 0 && exportRegistros.length === 0 && !importError && !exportError && (
        <GlassCard>
          <div className="p-10 text-center">
            <Package className="w-14 h-14 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-200 mb-1">
              Nenhum registro encontrado
            </h3>
            <p className="text-slate-400 text-xs">
              Nenhum dado disponível para o NCM e período selecionados.
            </p>
          </div>
        </GlassCard>
      )}

      {/* ── RESULTS ── */}
      {!loading && hasSearched && (importRegistros.length > 0 || exportRegistros.length > 0) && (
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

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total FOB */}
            <GlassKpi
              label={direction === "import" ? "Valor Total FOB (Importação)" : direction === "export" ? "Valor Total FOB (Exportação)" : "Balança Comercial"}
              value={
                direction === "both" && balance !== null
                  ? formatCurrency(balance)
                  : direction === "import" && importKpis
                  ? importKpis.fob
                  : direction === "export" && exportKpis
                  ? exportKpis.fob
                  : importKpis && exportKpis
                  ? `${importKpis.fob} / ${exportKpis.fob}`
                  : importKpis?.fob || exportKpis?.fob || "—"
              }
              variant={balance !== null && balance >= 0 ? "emerald" : balance !== null && balance < 0 ? "rose" : "blue"}
              delay={0}
              icon={balance !== null ? (balance >= 0 ? TrendingUp : TrendingDown) : DollarSign}
            />
            {/* Total KG */}
            <GlassKpi
              label="Peso Total (KG)"
              value={
                importKpis && exportKpis
                  ? `${importKpis.kg} / ${exportKpis.kg}`
                  : importKpis?.kg || exportKpis?.kg || "—"
              }
              variant="cyan"
              delay={0.05}
              icon={Package}
            />
            {/* Transactions */}
            <GlassKpi
              label="Transações"
              value={
                importKpis && exportKpis
                  ? `${importKpis.transacoes} / ${exportKpis.transacoes}`
                  : importKpis?.transacoes || exportKpis?.transacoes || "—"
              }
              variant="violet"
              delay={0.1}
              icon={BarChart3}
            />
            {/* Countries */}
            <GlassKpi
              label="Países"
              value={
                importKpis && exportKpis
                  ? `${importKpis.paises} / ${exportKpis.paises}`
                  : importKpis?.paises || exportKpis?.paises || "—"
              }
              variant="amber"
              delay={0.15}
              icon={Globe}
            />
          </div>

          {/* ── Detailed KPIs for import vs export ── */}
          {direction === "both" && importKpis && exportKpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassKpi
                label="Total FOB — Importação"
                value={importKpis.fob}
                variant="rose"
                delay={0.2}
                icon={TrendingDown}
              />
              <GlassKpi
                label="Total FOB — Exportação"
                value={exportKpis.fob}
                variant="emerald"
                delay={0.25}
                icon={TrendingUp}
              />
            </div>
          )}

          {/* ── Tabs: Country Breakdown / Time Series / Top NCMs ── */}
          <Tabs value={viewTab} onValueChange={setViewTab} className="space-y-4">
            <TabsList className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="countries"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Países
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <LineChartIcon className="w-3.5 h-3.5 mr-1.5" />
                Série Temporal
              </TabsTrigger>
              <TabsTrigger
                value="ncms"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <Package className="w-3.5 h-3.5 mr-1.5" />
                NCMs
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Overview ── */}
            <TabsContent value="overview">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Comparativo Mensal — Importação vs Exportação (FOB)
                  </h3>
                  {monthlySeries.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlySeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="mesLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                              color: "#e2e8f0",
                              fontSize: "12px",
                            }}
                          />
                          <Legend
                            formatter={(value: string) => (
                              <span style={{ color: "#cbd5e1", fontSize: "11px" }}>
                                {value === "importFob" ? "Importação" : "Exportação"}
                              </span>
                            )}
                          />
                          <Bar
                            dataKey="importFob"
                            name="importFob"
                            fill="#f43f5e"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="exportFob"
                            name="exportFob"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">
                      Dados mensais não disponíveis para este período.
                    </p>
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            {/* ── Tab: Countries ── */}
            <TabsContent value="countries">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    Países — Importação vs Exportação
                  </h3>
                  {countryRows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-700/30">
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">
                              País
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Imp. FOB
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Imp. KG
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Exp. FOB
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Exp. KG
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Total FOB
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              %
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {countryRows.slice(0, 20).map((row, idx) => (
                            <tr
                              key={row.pais_nome + idx}
                              className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="py-2.5 font-medium text-slate-200">
                                {row.pais_nome}
                              </td>
                              <td className="py-2.5 text-right text-rose-400 tabular-nums">
                                {formatCurrencyFull(row.importFob)}
                              </td>
                              <td className="py-2.5 text-right text-slate-400 tabular-nums">
                                {formatNumber(row.importKg)}
                              </td>
                              <td className="py-2.5 text-right text-emerald-400 tabular-nums">
                                {formatCurrencyFull(row.exportFob)}
                              </td>
                              <td className="py-2.5 text-right text-slate-400 tabular-nums">
                                {formatNumber(row.exportKg)}
                              </td>
                              <td className="py-2.5 text-right text-slate-200 font-bold tabular-nums">
                                {formatCurrencyFull(row.fobTotal)}
                              </td>
                              <td className="py-2.5 text-right text-slate-400 tabular-nums">
                                {row.sharePct.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {countryRows.length > 20 && (
                        <p className="text-slate-500 text-[10px] text-center mt-3">
                          Mostrando 20 de {formatNumber(countryRows.length)} países
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">
                      Nenhum país encontrado.
                    </p>
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            {/* ── Tab: Time Series ── */}
            <TabsContent value="timeline">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-emerald-400" />
                    Evolução Mensal — FOB (USD)
                  </h3>
                  {monthlySeries.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="mesLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                              color: "#e2e8f0",
                              fontSize: "12px",
                            }}
                            formatter={(value: number) => [formatCurrencyFull(value)]}
                          />
                          <Legend
                            formatter={(value: string) => (
                              <span style={{ color: "#cbd5e1", fontSize: "11px" }}>
                                {value === "importFob" ? "Importação" : "Exportação"}
                              </span>
                            )}
                          />
                          <Line
                            type="monotone"
                            dataKey="importFob"
                            name="importFob"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#f43f5e" }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="exportFob"
                            name="exportFob"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#10b981" }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">
                      Dados mensais não disponíveis para este período.
                    </p>
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            {/* ── Tab: Top NCMs ── */}
            <TabsContent value="ncms">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-violet-400" />
                    Códigos NCM
                  </h3>
                  {topNcms.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-700/30">
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">
                              NCM
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">
                              Descrição
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Imp. FOB
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Exp. FOB
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Saldo
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {topNcms.map((item, idx) => {
                            const saldo = item.exportFob - item.importFob;
                            return (
                              <tr
                                key={item.ncm + idx}
                                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                              >
                                <td className="py-2.5 font-mono font-bold text-slate-200">
                                  {item.ncm}
                                </td>
                                <td className="py-2.5 text-slate-400 max-w-[200px] truncate">
                                  {item.descricao}
                                </td>
                                <td className="py-2.5 text-right text-rose-400 tabular-nums">
                                  {formatCurrencyFull(item.importFob)}
                                </td>
                                <td className="py-2.5 text-right text-emerald-400 tabular-nums">
                                  {formatCurrencyFull(item.exportFob)}
                                </td>
                                <td className="py-2.5 text-right tabular-nums font-bold">
                                  <span
                                    className={
                                      saldo >= 0
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                    }
                                  >
                                    {formatCurrencyFull(saldo)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">
                      Dados de NCM não disponíveis.
                    </p>
                  )}

                  {/* Hint for multi-NCM search */}
                  <div className="mt-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/20">
                    <p className="text-slate-400 text-[10px] flex items-start gap-2">
                      <Package className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                      Para uma análise mais completa de múltiplos NCMs, utilize o relatório
                      completo de importação ou exportação nas páginas dedicadas.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>

          {/* ── Data source footer ── */}
          <div className="text-center">
            <p className="text-[10px] text-slate-500">
              Fonte: MDIC / COMEXSTAT — Dados oficiais do comércio exterior brasileiro.
              Atualizado mensalmente.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
