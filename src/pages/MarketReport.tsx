"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Loader2, TrendingUp, TrendingDown, DollarSign,
  Package, Globe, AlertCircle, FileText, BarChart3,
  LineChart as LineChartIcon, Printer, MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { GlassKpi, GlassCard } from "@/components/GlassKpi";
import GlobalMarketSection from "@/components/intel/GlobalMarketSection";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";
import { saveSearchHistory } from "@/hooks/use-search-history";
import { AVAILABLE_YEARS } from "@/lib/utils";

/* ═══════════════════════════════ TYPES ═══════════════════════════════ */

interface Municipio {
  co_mun: string;
  mun_nome: string;
  kg_liquido: number;
  vl_fob: number;
}

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
  municipios: Municipio[];
}

interface NcmSuggestion {
  code: string;
  description: string;
}

interface CountryRow {
  pais_nome: string;
  co_pais: string;
  fob: number;
  kg: number;
  sharePct: number;
}

interface MonthlyPoint {
  mes: string;
  mesLabel: string;
  importFob: number;
  exportFob: number;
}

interface PricePoint {
  mes: string;
  mesLabel: string;
  importPrice: number;
  exportPrice: number;
}

/* ═══════════════════════════════ CONSTANTS ═══════════════════════════════ */

const ANOS = [...AVAILABLE_YEARS].reverse().map((v) => ({ value: v, label: v }));

const MESES_FULL = Array.from({ length: 12 }, (_, i) => {
  const num = String(i + 1).padStart(2, "0");
  const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return { value: num, label: names[i] };
});

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

const MONTH_ORDER = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

/* ═══════════════════════════════ HELPERS ═══════════════════════════════ */

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

function formatDecimal(n: number, digits = 2): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
}

function aggregateRegistros(registros: Registro[]) {
  let totalFob = 0;
  let totalKg = 0;
  const countriesMap = new Map<string, { fob: number; kg: number }>();
  const monthlyMap = new Map<string, { fob: number; kg: number }>();

  for (const r of registros) {
    const fob = Number(r.vl_fob) || 0;
    const kg = Number(r.kg_liquido) || 0;
    totalFob += fob;
    totalKg += kg;

    // Country aggregation
    if (r.pais_nome) {
      const prev = countriesMap.get(r.pais_nome) || { fob: 0, kg: 0 };
      prev.fob += fob;
      prev.kg += kg;
      countriesMap.set(r.pais_nome, prev);
    }

    // Monthly aggregation
    const mes = r.co_mes?.padStart(2, "0") || "00";
    if (mes && mes !== "00") {
      const prev = monthlyMap.get(mes) || { fob: 0, kg: 0 };
      prev.fob += fob;
      prev.kg += kg;
      monthlyMap.set(mes, prev);
    }
  }

  return {
    totalFob,
    totalKg,
    countryCount: countriesMap.size,
    countriesMap,
    monthlyMap,
  };
}

function buildTopCountries(countriesMap: Map<string, { fob: number; kg: number }>): CountryRow[] {
  const rows: CountryRow[] = [];
  let grandTotal = 0;

  for (const [name, data] of countriesMap) {
    grandTotal += data.fob;
    rows.push({
      pais_nome: name,
      co_pais: "",
      fob: data.fob,
      kg: data.kg,
      sharePct: 0,
    });
  }

  rows.sort((a, b) => b.fob - a.fob);
  for (const r of rows) {
    r.sharePct = grandTotal > 0 ? (r.fob / grandTotal) * 100 : 0;
  }

  return rows;
}

function buildMonthlySeries(
  importMonthly: Map<string, { fob: number; kg: number }>,
  exportMonthly: Map<string, { fob: number; kg: number }>,
): MonthlyPoint[] {
  return MONTH_ORDER.map((m) => ({
    mes: m,
    mesLabel: MONTH_LABELS[m] || m,
    importFob: importMonthly.get(m)?.fob || 0,
    exportFob: exportMonthly.get(m)?.fob || 0,
  }));
}

function buildPriceSeries(
  importMonthly: Map<string, { fob: number; kg: number }>,
  exportMonthly: Map<string, { fob: number; kg: number }>,
): PricePoint[] {
  return MONTH_ORDER.map((m) => {
    const imp = importMonthly.get(m);
    const exp = exportMonthly.get(m);
    return {
      mes: m,
      mesLabel: MONTH_LABELS[m] || m,
      importPrice: imp && imp.kg > 0 ? imp.fob / imp.kg : 0,
      exportPrice: exp && exp.kg > 0 ? exp.fob / exp.kg : 0,
    };
  });
}

/* ═══════════════════════════════ COMPONENT ═══════════════════════════════ */

export default function MarketReport() {
  const { consume } = useUsage();

  /* ── Search form state ── */
  const [searchNcm, setSearchNcm] = useState("");
  const [ncmDescription, setNcmDescription] = useState("");
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
  const [importCountries, setImportCountries] = useState<CountryRow[]>([]);
  const [exportCountries, setExportCountries] = useState<CountryRow[]>([]);
  const [monthlySeries, setMonthlySeries] = useState<MonthlyPoint[]>([]);
  const [priceSeries, setPriceSeries] = useState<PricePoint[]>([]);

  /* ── Report view ── */
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  /* ── SEO ── */
  useSeo({
    title: "Relatório de Mercado — TRADEXA",
    description:
      "Relatório completo de análise de mercado para qualquer NCM. Importação, exportação, preços, países e tendências do comércio exterior brasileiro.",
    keywords:
      "relatório de mercado, NCM, análise de importação, análise de exportação, comexstat, comércio exterior, inteligência de mercado, preços FOB",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Relatório de Mercado — TRADEXA",
      description:
        "Relatório completo de análise de mercado para qualquer NCM. Dados oficiais do COMEXSTAT/MDIC.",
      provider: {
        "@type": "Organization",
        name: "TRADEXA",
      },
    },
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
    setShowReport(false);
    setImportError(null);
    setExportError(null);
    setImportRegistros([]);
    setExportRegistros([]);
    setImportAgg(null);
    setExportAgg(null);
    setImportCountries([]);
    setExportCountries([]);
    setMonthlySeries([]);
    setPriceSeries([]);

    const ncmClean = searchNcm.replace(/\D/g, "");
    const params = { ncm: ncmClean, anoDe, mesDe, anoAte, mesAte };

    try {
      const results = await Promise.allSettled([
        supabase.functions.invoke("import-data", { body: { ...params, tipo: "IMP" } }),
        supabase.functions.invoke("export-data", { body: { ...params, tipo: "EXP" } }),
      ]);

      let importData: Registro[] = [];
      let exportData: Registro[] = [];
      let importDesc = "";
      let exportDesc = "";

      // Handle import result
      if (results[0].status === "fulfilled") {
        const { data, error: funcError } = results[0].value;
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
        setImportError(results[0].reason?.message || "Erro ao buscar dados de importação");
      }

      // Handle export result
      if (results[1].status === "fulfilled") {
        const { data, error: funcError } = results[1].value;
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
        setExportError(results[1].reason?.message || "Erro ao buscar dados de exportação");
      }

      // Set NCM description
      if (importDesc) setNcmDescription(importDesc);
      else if (exportDesc) setNcmDescription(exportDesc);

      // Compute aggregates
      const impAgg = importData.length > 0 ? aggregateRegistros(importData) : null;
      const expAgg = exportData.length > 0 ? aggregateRegistros(exportData) : null;

      setImportAgg(impAgg);
      setExportAgg(expAgg);

      // Build country tables
      const impCountryMap = impAgg?.countriesMap || new Map();
      const expCountryMap = expAgg?.countriesMap || new Map();
      setImportCountries(buildTopCountries(impCountryMap));
      setExportCountries(buildTopCountries(expCountryMap));

      // Build monthly series
      const impMonthly = impAgg?.monthlyMap || new Map();
      const expMonthly = expAgg?.monthlyMap || new Map();
      setMonthlySeries(buildMonthlySeries(impMonthly, expMonthly));
      setPriceSeries(buildPriceSeries(impMonthly, expMonthly));

      // Show success
      const msgParts: string[] = [];
      if (importData.length > 0) msgParts.push(`${formatNumber(importData.length)} registros de importação`);
      if (exportData.length > 0) msgParts.push(`${formatNumber(exportData.length)} registros de exportação`);
      if (msgParts.length > 0) {
        showSuccess(msgParts.join(" e ") + " encontrados!");
      }
      saveSearchHistory("Relatório de Mercado", `NCM ${searchNcm}`, "trade_balance");
    } catch (err: any) {
      const msg = err.message || "Erro inesperado";
      showError("Erro: " + msg);
      setImportError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchNcm, anoDe, mesDe, anoAte, mesAte, consume]);

  /* ── KPI values ── */
  const importKpis = importAgg
    ? {
        fob: formatCurrency(importAgg.totalFob),
        kg: formatNumber(importAgg.totalKg) + " kg",
        paises: formatNumber(importAgg.countryCount),
        price: importAgg.totalKg > 0 ? importAgg.totalFob / importAgg.totalKg : 0,
      }
    : null;

  const exportKpis = exportAgg
    ? {
        fob: formatCurrency(exportAgg.totalFob),
        kg: formatNumber(exportAgg.totalKg) + " kg",
        paises: formatNumber(exportAgg.countryCount),
        price: exportAgg.totalKg > 0 ? exportAgg.totalFob / exportAgg.totalKg : 0,
      }
    : null;

  const tradeBalance =
    importAgg && exportAgg ? exportAgg.totalFob - importAgg.totalFob : null;

  /* ── Generate printable report ── */
  const handleGenerateReport = useCallback(() => {
    setShowReport(true);
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  /* ── Render ── */
  return (
    <div className="space-y-6 p-6">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Relatório de Mercado — TRADEXA",
            description:
              "Relatório completo de análise de mercado para qualquer NCM. Dados oficiais do COMEXSTAT/MDIC.",
            provider: {
              "@type": "Organization",
              name: "TRADEXA",
            },
          }),
        }}
      />

      <PageHeader
        title="Relatório de Mercado"
        subtitle="Análise completa de mercado para qualquer NCM — importação, exportação, preços e tendências com dados oficiais COMEXSTAT"
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* NCM input */}
              <div className="lg:col-span-4 relative">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Código NCM
                </Label>
                <Input
                  ref={inputRef}
                  placeholder="Ex: 8471, 84, 1006..."
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
              <div className="lg:col-span-5">
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
              <div className="lg:col-span-3 flex items-end gap-2">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-9 flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold gap-1.5 text-xs shadow-lg shadow-emerald-900/30"
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

      {/* ── Loading state ── */}
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
              Relatório de Mercado
            </h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Digite um código NCM e selecione o período para gerar um relatório completo
              de mercado com dados de importação, exportação, preços e tendências.
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
              Nenhum dado disponível para o NCM e período selecionados. Tente alterar o período ou o código NCM.
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
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] px-3 py-1 rounded-full">
                      NCM {formatNcmCode(searchNcm.replace(/\D/g, ""))}
                    </Badge>
                    <p className="mt-2 text-sm text-slate-300 font-medium">{ncmDescription}</p>
                  </div>
                  <Button
                    onClick={handleGenerateReport}
                    className="bg-amber-600 hover:bg-amber-500 rounded-lg font-bold gap-1.5 text-xs h-9 shadow-lg shadow-amber-900/30"
                  >
                    <FileText className="w-4 h-4" />
                    Gerar Relatório
                  </Button>
                </div>
              </div>
            </GlassCard>
          )}

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Trade Balance */}
            <GlassKpi
              label="Balança Comercial"
              value={tradeBalance !== null ? formatCurrency(tradeBalance) : "—"}
              variant={tradeBalance !== null && tradeBalance >= 0 ? "emerald" : tradeBalance !== null && tradeBalance < 0 ? "rose" : "blue"}
              delay={0}
              icon={tradeBalance !== null && tradeBalance >= 0 ? TrendingUp : TrendingDown}
            />
            {/* Import Value */}
            <GlassKpi
              label="Valor Total FOB — Importação"
              value={importKpis?.fob || "—"}
              variant="rose"
              delay={0.05}
              icon={TrendingDown}
            />
            {/* Export Value */}
            <GlassKpi
              label="Valor Total FOB — Exportação"
              value={exportKpis?.fob || "—"}
              variant="emerald"
              delay={0.1}
              icon={TrendingUp}
            />
            {/* Countries */}
            <GlassKpi
              label="Países"
              value={
                importKpis && exportKpis
                  ? `${importKpis.paises} (Imp) / ${exportKpis.paises} (Exp)`
                  : importKpis?.paises || exportKpis?.paises || "—"
              }
              variant="amber"
              delay={0.15}
              icon={Globe}
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Import KG */}
            <GlassKpi
              label="Peso Total (KG) — Importação"
              value={importKpis?.kg || "—"}
              variant="cyan"
              delay={0.2}
              icon={Package}
            />
            {/* Export KG */}
            <GlassKpi
              label="Peso Total (KG) — Exportação"
              value={exportKpis?.kg || "—"}
              variant="cyan"
              delay={0.2}
              icon={Package}
            />
            {/* Unit Price */}
            <GlassKpi
              label="Preço Unitário Médio (FOB/KG)"
              value={
                importKpis && exportKpis
                  ? `Imp: US$ ${formatDecimal(importKpis.price)} / Exp: US$ ${formatDecimal(exportKpis.price)}`
                  : importKpis
                  ? `US$ ${formatDecimal(importKpis.price)}`
                  : exportKpis
                  ? `US$ ${formatDecimal(exportKpis.price)}`
                  : "—"
              }
              variant="violet"
              delay={0.25}
              icon={DollarSign}
            />
          </div>

          {/* ── Charts & Tables ── */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger
                value="import-countries"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Países — Importação
              </TabsTrigger>
              <TabsTrigger
                value="export-countries"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Países — Exportação
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <LineChartIcon className="w-3.5 h-3.5 mr-1.5" />
                Tendência Mensal
              </TabsTrigger>
              <TabsTrigger
                value="prices"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                Análise de Preços
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
                  {monthlySeries.some((p) => p.importFob > 0 || p.exportFob > 0) ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlySeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="mesLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v)} width={80} />
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

            {/* ── Tab: Import Countries ── */}
            <TabsContent value="import-countries">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-rose-400" />
                    Principais Países de Origem (Importação)
                  </h3>
                  {importCountries.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-700/30">
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">#</th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">País</th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">Valor FOB</th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">Peso (KG)</th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">Participação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importCountries.slice(0, 20).map((row, idx) => (
                            <tr
                              key={row.pais_nome + idx}
                              className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="py-2.5 text-slate-500 font-bold">{idx + 1}</td>
                              <td className="py-2.5 font-medium text-slate-200">{row.pais_nome}</td>
                              <td className="py-2.5 text-right text-rose-400 tabular-nums">{formatCurrencyFull(row.fob)}</td>
                              <td className="py-2.5 text-right text-slate-400 tabular-nums">{formatNumber(row.kg)}</td>
                              <td className="py-2.5 text-right text-slate-400 tabular-nums">{row.sharePct.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importCountries.length > 20 && (
                        <p className="text-slate-500 text-[10px] text-center mt-3">
                          Mostrando 20 de {formatNumber(importCountries.length)} países
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">Nenhum país encontrado.</p>
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            {/* ── Tab: Export Countries ── */}
            <TabsContent value="export-countries">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Principais Países de Destino (Exportação)
                  </h3>
                  {exportCountries.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-700/30">
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">#</th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">País</th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">Valor FOB</th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">Peso (KG)</th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">Participação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exportCountries.slice(0, 20).map((row, idx) => (
                            <tr
                              key={row.pais_nome + idx}
                              className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="py-2.5 text-slate-500 font-bold">{idx + 1}</td>
                              <td className="py-2.5 font-medium text-slate-200">{row.pais_nome}</td>
                              <td className="py-2.5 text-right text-emerald-400 tabular-nums">{formatCurrencyFull(row.fob)}</td>
                              <td className="py-2.5 text-right text-slate-400 tabular-nums">{formatNumber(row.kg)}</td>
                              <td className="py-2.5 text-right text-slate-400 tabular-nums">{row.sharePct.toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {exportCountries.length > 20 && (
                        <p className="text-slate-500 text-[10px] text-center mt-3">
                          Mostrando 20 de {formatNumber(exportCountries.length)} países
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">Nenhum país encontrado.</p>
                  )}
                </div>
              </GlassCard>
            </TabsContent>

            {/* ── Tab: Timeline ── */}
            <TabsContent value="timeline">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4 text-emerald-400" />
                    Tendência Mensal — FOB (USD)
                  </h3>
                  {monthlySeries.some((p) => p.importFob > 0 || p.exportFob > 0) ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="mesLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v: number) => formatCurrency(v)} width={80} />
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

            {/* ── Tab: Price Analysis ── */}
            <TabsContent value="prices">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-violet-400" />
                    Análise de Preços — Valor Unitário (FOB/KG)
                  </h3>

                  {/* Price summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                      <p className="text-[10px] font-black uppercase tracking-wider text-rose-400 mb-1">
                        Preço Médio — Importação
                      </p>
                      <p className="text-lg font-black text-slate-100">
                        {importKpis ? `US$ ${formatDecimal(importKpis.price)} / KG` : "—"}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1">
                        Preço Médio — Exportação
                      </p>
                      <p className="text-lg font-black text-slate-100">
                        {exportKpis ? `US$ ${formatDecimal(exportKpis.price)} / KG` : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Price chart */}
                  {priceSeries.some((p) => p.importPrice > 0 || p.exportPrice > 0) ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceSeries}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="mesLabel" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                          <YAxis
                            tick={{ fill: "#94a3b8", fontSize: 11 }}
                            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
                            width={80}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1e293b",
                              border: "1px solid #334155",
                              borderRadius: "8px",
                              color: "#e2e8f0",
                              fontSize: "12px",
                            }}
                            formatter={(value: number) => [`US$ ${formatDecimal(value)}/KG`]}
                          />
                          <Legend
                            formatter={(value: string) => (
                              <span style={{ color: "#cbd5e1", fontSize: "11px" }}>
                                {value === "importPrice" ? "Preço Importação" : "Preço Exportação"}
                              </span>
                            )}
                          />
                          <Line
                            type="monotone"
                            dataKey="importPrice"
                            name="importPrice"
                            stroke="#f43f5e"
                            strokeWidth={2}
                            dot={{ r: 3, fill: "#f43f5e" }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="exportPrice"
                            name="exportPrice"
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
                      Dados de preço não disponíveis para este período.
                    </p>
                  )}
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>

          {/* ── Generate Report Button ── */}
          {!showReport && (
            <div className="text-center">
              <Button
                onClick={handleGenerateReport}
                size="lg"
                className="bg-amber-600 hover:bg-amber-500 rounded-xl font-bold gap-2 shadow-lg shadow-amber-900/30"
              >
                <FileText className="w-5 h-5" />
                Gerar Relatório Completo
              </Button>
            </div>
          )}

          {/* ── Printable Report ── */}
          {showReport && (
            <motion.div
              ref={reportRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="print-area"
            >
              <GlassCard className="print:!bg-white print:!border print:!border-slate-200 print:shadow-none">
                <div className="p-6 print:p-4">
                  {/* Report Header */}
                  <div className="flex items-center justify-between mb-6 print:mb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-100 print:text-slate-900">
                        Relatório de Mercado
                      </h2>
                      <p className="text-xs text-slate-400 print:text-slate-500 mt-1">
                        NCM {formatNcmCode(searchNcm.replace(/\D/g, ""))}
                        {ncmDescription && ` — ${ncmDescription}`}
                      </p>
                      <p className="text-[10px] text-slate-500 print:text-slate-400 mt-0.5">
                        Período: {mesDe}/{anoDe} a {mesAte}/{anoAte} | Fonte: MDIC/COMEXSTAT
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg gap-1.5 text-xs print:hidden"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir
                    </Button>
                  </div>

                  {/* Report Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 print:mb-4 print:grid-cols-4">
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 print:bg-slate-50 print:border-slate-200">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 print:text-slate-500">Balança Comercial</p>
                      <p className={`text-sm font-black mt-1 ${tradeBalance !== null && tradeBalance >= 0 ? "text-emerald-400 print:text-emerald-600" : tradeBalance !== null && tradeBalance < 0 ? "text-rose-400 print:text-rose-600" : "text-slate-300 print:text-slate-700"}`}>
                        {tradeBalance !== null ? formatCurrency(tradeBalance) : "—"}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 print:bg-slate-50 print:border-slate-200">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 print:text-slate-500">Total Importação</p>
                      <p className="text-sm font-black mt-1 text-rose-400 print:text-rose-600">{importKpis?.fob || "—"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 print:bg-slate-50 print:border-slate-200">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 print:text-slate-500">Total Exportação</p>
                      <p className="text-sm font-black mt-1 text-emerald-400 print:text-emerald-600">{exportKpis?.fob || "—"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 print:bg-slate-50 print:border-slate-200">
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 print:text-slate-500">Preço Médio (FOB/KG)</p>
                      <p className="text-sm font-black mt-1 text-violet-400 print:text-violet-600">
                        {importKpis && exportKpis
                          ? `Imp: US$ ${formatDecimal(importKpis.price)} / Exp: US$ ${formatDecimal(exportKpis.price)}`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Report Tables */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:gap-4">
                    {/* Top Importing Countries */}
                    <div>
                      <h4 className="text-xs font-black text-slate-200 print:text-slate-800 mb-3 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 print:text-rose-600" />
                        Principais Países de Origem (Importação)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px]">
                          <thead>
                            <tr className="border-b border-slate-700/30 print:border-slate-300">
                              <th className="pb-1.5 font-black text-slate-400 print:text-slate-500 uppercase tracking-wider">País</th>
                              <th className="pb-1.5 font-black text-slate-400 print:text-slate-500 uppercase tracking-wider text-right">FOB</th>
                              <th className="pb-1.5 font-black text-slate-400 print:text-slate-500 uppercase tracking-wider text-right">KG</th>
                              <th className="pb-1.5 font-black text-slate-400 print:text-slate-500 uppercase tracking-wider text-right">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importCountries.slice(0, 10).map((row, idx) => (
                              <tr key={row.pais_nome + idx} className="border-b border-slate-800/50 print:border-slate-200">
                                <td className="py-1.5 font-medium text-slate-200 print:text-slate-700">{row.pais_nome}</td>
                                <td className="py-1.5 text-right text-rose-400 print:text-rose-600 tabular-nums">{formatCurrencyFull(row.fob)}</td>
                                <td className="py-1.5 text-right text-slate-400 print:text-slate-500 tabular-nums">{formatNumber(row.kg)}</td>
                                <td className="py-1.5 text-right text-slate-400 print:text-slate-500 tabular-nums">{row.sharePct.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Exporting Countries */}
                    <div>
                      <h4 className="text-xs font-black text-slate-200 print:text-slate-800 mb-3 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-600" />
                        Principais Países de Destino (Exportação)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[10px]">
                          <thead>
                            <tr className="border-b border-slate-700/30 print:border-slate-300">
                              <th className="pb-1.5 font-black text-slate-400 print:text-slate-500 uppercase tracking-wider">País</th>
                              <th className="pb-1.5 font-black text-slate-400 print:text-slate-500 uppercase tracking-wider text-right">FOB</th>
                              <th className="pb-1.5 font-black text-slate-400 print:text-slate-500 uppercase tracking-wider text-right">KG</th>
                              <th className="pb-1.5 font-black text-slate-400 print:text-slate-500 uppercase tracking-wider text-right">%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {exportCountries.slice(0, 10).map((row, idx) => (
                              <tr key={row.pais_nome + idx} className="border-b border-slate-800/50 print:border-slate-200">
                                <td className="py-1.5 font-medium text-slate-200 print:text-slate-700">{row.pais_nome}</td>
                                <td className="py-1.5 text-right text-emerald-400 print:text-emerald-600 tabular-nums">{formatCurrencyFull(row.fob)}</td>
                                <td className="py-1.5 text-right text-slate-400 print:text-slate-500 tabular-nums">{formatNumber(row.kg)}</td>
                                <td className="py-1.5 text-right text-slate-400 print:text-slate-500 tabular-nums">{row.sharePct.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Report Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-700/30 print:border-slate-300">
                    <p className="text-[9px] text-slate-500 print:text-slate-400 text-center">
                      Relatório gerado em {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}.
                      Fonte: MDIC / COMEXSTAT — Dados oficiais do comércio exterior brasileiro.
                      TRADEXA Market Intelligence.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

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
