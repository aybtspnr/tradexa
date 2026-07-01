"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Loader2, BarChart3, TrendingUp, TrendingDown,
  DollarSign, Package, Globe, AlertCircle,
  CalendarRange, ArrowUpDown, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import { useSeo } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { GlassCard } from "@/components/GlassKpi";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";
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

interface PeriodMetrics {
  totalFob: number;
  totalKg: number;
  totalTransactions: number;
  countryCount: number;
  countriesMap: Map<string, { fob: number; kg: number }>;
  monthlyMap: Map<string, { fob: number }>;
}

interface CountryComparisonRow {
  pais_nome: string;
  co_pais: string;
  periodAFob: number;
  periodAKg: number;
  periodBFob: number;
  periodBKg: number;
  changeFob: number;
  changePct: number;
  fobTotal: number;
  sharePct: number;
}

interface MonthlyComparisonPoint {
  mes: string;
  mesLabel: string;
  periodAFob: number;
  periodBFob: number;
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

type Direction = "import" | "export";

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

function formatChangePct(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function aggregateRegistros(registros: Registro[]): PeriodMetrics {
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

    const paisKey = r.co_pais || "ZZ";
    if (r.pais_nome) {
      countriesSet.add(r.pais_nome);
      const prev = countriesMap.get(r.pais_nome) || { fob: 0, kg: 0 };
      prev.fob += fob;
      prev.kg += kg;
      countriesMap.set(r.pais_nome, prev);
    }

    const mes = r.co_mes?.padStart(2, "0") || "00";
    if (mes && mes !== "00") {
      const prev = monthlyMap.get(mes) || { fob: 0 };
      prev.fob += fob;
      monthlyMap.set(mes, prev);
    }
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

function buildCountryComparison(
  aggA: PeriodMetrics | null,
  aggB: PeriodMetrics | null,
): CountryComparisonRow[] {
  const mapA = aggA?.countriesMap || new Map();
  const mapB = aggB?.countriesMap || new Map();
  const allCountries = new Set([...mapA.keys(), ...mapB.keys()]);
  const rows: CountryComparisonRow[] = [];

  for (const country of allCountries) {
    const a = mapA.get(country) || { fob: 0, kg: 0 };
    const b = mapB.get(country) || { fob: 0, kg: 0 };
    const changeFob = b.fob - a.fob;
    const changePct = a.fob > 0 ? ((b.fob - a.fob) / a.fob) * 100 : (b.fob > 0 ? 100 : 0);
    rows.push({
      pais_nome: country,
      co_pais: "",
      periodAFob: a.fob,
      periodAKg: a.kg,
      periodBFob: b.fob,
      periodBKg: b.kg,
      changeFob,
      changePct,
      fobTotal: a.fob + b.fob,
      sharePct: 0,
    });
  }

  const grandTotal = rows.reduce((s, r) => s + r.fobTotal, 0);
  for (const r of rows) {
    r.sharePct = grandTotal > 0 ? (r.fobTotal / grandTotal) * 100 : 0;
  }

  return rows.sort((a, b) => b.fobTotal - a.fobTotal);
}

function buildMonthlyComparison(
  aggA: PeriodMetrics | null,
  aggB: PeriodMetrics | null,
): MonthlyComparisonPoint[] {
  const monthlyA = aggA?.monthlyMap || new Map();
  const monthlyB = aggB?.monthlyMap || new Map();
  return MONTH_ORDER.map((m) => ({
    mes: m,
    mesLabel: MONTH_LABELS[m] || m,
    periodAFob: monthlyA.get(m)?.fob || 0,
    periodBFob: monthlyB.get(m)?.fob || 0,
  }));
}

/* ═══════════════════ DELTA COMPONENT ═══════════════════ */

function DeltaBadge({ value, pct, reverseColors = false }: { value: number; pct: number; reverseColors?: boolean }) {
  const isPositive = reverseColors ? value < 0 : value > 0;
  const isZero = value === 0;
  const colorClass = isZero
    ? "text-slate-400 border-slate-600/30"
    : isPositive
    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
    : "text-rose-400 border-rose-500/30 bg-rose-500/10";

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border",
      colorClass,
    )}>
      {!isZero && (
        isPositive
          ? <TrendingUp className="w-3 h-3" />
          : <TrendingDown className="w-3 h-3" />
      )}
      <span className="tabular-nums">
        {formatCurrency(value)}
      </span>
      <span className="tabular-nums opacity-80">
        ({formatChangePct(pct)})
      </span>
    </span>
  );
}

/* ═══════════════════ COMPONENT ═══════════════════ */

export default function PeriodComparison() {
  const params = useParams();
  const urlNcm = params?.ncm || "";

  /* ── Search form state ── */
  const [searchNcm, setSearchNcm] = useState(urlNcm ? formatNcmCode(urlNcm) : "");
  const [ncmDescription, setNcmDescription] = useState("");
  const [direction, setDirection] = useState<Direction>("export");

  /* ── Period A ── */
  const [anoDeA, setAnoDeA] = useState("2024");
  const [mesDeA, setMesDeA] = useState("01");
  const [anoAteA, setAnoAteA] = useState("2024");
  const [mesAteA, setMesAteA] = useState("12");

  /* ── Period B ── */
  const [anoDeB, setAnoDeB] = useState("2025");
  const [mesDeB, setMesDeB] = useState("01");
  const [anoAteB, setAnoAteB] = useState("2025");
  const [mesAteB, setMesAteB] = useState("12");

  /* ── NCM autocomplete ── */
  const [ncmSuggestions, setNcmSuggestions] = useState<NcmSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /* ── Data state ── */
  const [loading, setLoading] = useState(false);
  const [registrosA, setRegistrosA] = useState<Registro[]>([]);
  const [registrosB, setRegistrosB] = useState<Registro[]>([]);
  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  /* ── Derived aggregates ── */
  const [aggA, setAggA] = useState<PeriodMetrics | null>(null);
  const [aggB, setAggB] = useState<PeriodMetrics | null>(null);
  const [countryRows, setCountryRows] = useState<CountryComparisonRow[]>([]);
  const [monthlySeries, setMonthlySeries] = useState<MonthlyComparisonPoint[]>([]);

  /* ── Active view tab ── */
  const [viewTab, setViewTab] = useState("overview");

  /* ── Period labels ── */
  const periodALabel = useMemo(() => {
    if (mesDeA === "01" && mesAteA === "12") return `${anoDeA}`;
    return `${MONTH_LABELS[mesDeA] || mesDeA}/${anoDeA} — ${MONTH_LABELS[mesAteA] || mesAteA}/${anoAteA}`;
  }, [anoDeA, mesDeA, anoAteA, mesAteA]);

  const periodBLabel = useMemo(() => {
    if (mesDeB === "01" && mesAteB === "12") return `${anoDeB}`;
    return `${MONTH_LABELS[mesDeB] || mesDeB}/${anoDeB} — ${MONTH_LABELS[mesAteB] || mesAteB}/${anoAteB}`;
  }, [anoDeB, mesDeB, anoAteB, mesAteB]);

  /* ── SEO ── */
  useSeo({
    title: `Comparador de Períodos — ${direction === "export" ? "Exportação" : "Importação"} | TRADEXA`,
    description: `Compare dados ${direction === "export" ? "de exportação" : "de importação"} brasileira entre períodos distintos por NCM. Veja evolução, sazonalidade e crescimento.`,
    keywords: "comparador períodos, exportação, importação, evolução, sazonalidade, comércio exterior, TRADEXA, NCM, comexstat",
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

  /* ── Build edge function name ── */
  const edgeFunctionName = direction === "import" ? "import-data" : "export-data";
  const edgeTipo = direction === "import" ? "IMP" : "EXP";

  /* ── Fetch period data ── */
  const fetchPeriod = useCallback(async (
    ncmClean: string,
    anoDe: string,
    mesDe: string,
    anoAte: string,
    mesAte: string,
  ): Promise<{ registros: Registro[]; description: string; error: string | null }> => {
    try {
      const { data, error: funcError } = await supabase.functions.invoke(edgeFunctionName, {
        body: {
          ncm: ncmClean,
          anoDe,
          mesDe,
          anoAte,
          mesAte,
          tipo: edgeTipo,
        },
      });

      if (funcError) return { registros: [], description: "", error: funcError.message };
      if (data?.error) return { registros: [], description: "", error: data.error };

      return {
        registros: data?.registros || [],
        description: data?.ncm_description || "",
        error: null,
      };
    } catch (err: any) {
      return { registros: [], description: "", error: err.message || "Erro inesperado" };
    }
  }, [edgeFunctionName, edgeTipo]);

  /* ── Main search ── */
  const handleSearch = useCallback(async () => {
    if (!searchNcm.trim()) {
      showError("Digite um código NCM.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setErrorA(null);
    setErrorB(null);
    setRegistrosA([]);
    setRegistrosB([]);
    setAggA(null);
    setAggB(null);
    setCountryRows([]);
    setMonthlySeries([]);

    const ncmClean = searchNcm.replace(/\D/g, "");

    try {
      const [resultA, resultB] = await Promise.all([
        fetchPeriod(ncmClean, anoDeA, mesDeA, anoAteA, mesAteA),
        fetchPeriod(ncmClean, anoDeB, mesDeB, anoAteB, mesAteB),
      ]);

      // Period A
      if (resultA.error) setErrorA(resultA.error);
      setRegistrosA(resultA.registros);
      if (resultA.description) setNcmDescription(resultA.description);

      // Period B
      if (resultB.error) setErrorB(resultB.error);
      setRegistrosB(resultB.registros);
      if (!resultA.description && resultB.description) setNcmDescription(resultB.description);

      // Compute aggregates
      const periodAagg = resultA.registros.length > 0 ? aggregateRegistros(resultA.registros) : null;
      const periodBagg = resultB.registros.length > 0 ? aggregateRegistros(resultB.registros) : null;

      setAggA(periodAagg);
      setAggB(periodBagg);

      // Build country comparison
      const countries = buildCountryComparison(periodAagg, periodBagg);
      setCountryRows(countries);

      // Build monthly comparison
      const monthly = buildMonthlyComparison(periodAagg, periodBagg);
      setMonthlySeries(monthly);

      // Show success
      const countA = resultA.registros.length;
      const countB = resultB.registros.length;
      showSuccess(
        `${formatNumber(countA)} registros no Período A e ${formatNumber(countB)} registros no Período B encontrados!`,
      );
    } catch (err: any) {
      const msg = err.message || "Erro inesperado";
      showError("Erro: " + msg);
      setErrorA(msg);
    } finally {
      setLoading(false);
    }
  }, [searchNcm, anoDeA, mesDeA, anoAteA, mesAteA, anoDeB, mesDeB, anoAteB, mesAteB, fetchPeriod]);

  /* ── Handle Enter key ── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  }, [handleSearch]);

  /* ── Quick period presets ── */
  const applyPreset = useCallback((preset: "yoy" | "sem1" | "sem2" | "q1" | "q2") => {
    switch (preset) {
      case "yoy":
        // Last 12 months vs same period previous year
        setAnoDeA("2024"); setMesDeA("01"); setAnoAteA("2024"); setMesAteA("12");
        setAnoDeB("2025"); setMesDeB("01"); setAnoAteB("2025"); setMesAteB("12");
        break;
      case "sem1":
        setAnoDeA("2024"); setMesDeA("01"); setAnoAteA("2024"); setMesAteA("06");
        setAnoDeB("2025"); setMesDeB("01"); setAnoAteB("2025"); setMesAteB("06");
        break;
      case "sem2":
        setAnoDeA("2024"); setMesDeA("07"); setAnoAteA("2024"); setMesAteA("12");
        setAnoDeB("2025"); setMesDeB("07"); setAnoAteB("2025"); setMesAteB("12");
        break;
      case "q1":
        setAnoDeA("2024"); setMesDeA("01"); setAnoAteA("2024"); setMesAteA("03");
        setAnoDeB("2025"); setMesDeB("01"); setAnoAteB("2025"); setMesAteB("03");
        break;
      case "q2":
        setAnoDeA("2024"); setMesDeA("04"); setAnoAteA("2024"); setMesAteA("06");
        setAnoDeB("2025"); setMesDeB("04"); setAnoAteB("2025"); setMesAteB("06");
        break;
    }
  }, []);

  /* ── KPI values ── */
  const kpisA = aggA
    ? {
        fob: formatCurrency(aggA.totalFob),
        kg: formatNumber(aggA.totalKg) + " kg",
        transacoes: formatNumber(aggA.totalTransactions),
        paises: formatNumber(aggA.countryCount),
      }
    : null;

  const kpisB = aggB
    ? {
        fob: formatCurrency(aggB.totalFob),
        kg: formatNumber(aggB.totalKg) + " kg",
        transacoes: formatNumber(aggB.totalTransactions),
        paises: formatNumber(aggB.countryCount),
      }
    : null;

  /* ── Computed deltas ── */
  const deltaFob = aggA && aggB ? aggB.totalFob - aggA.totalFob : null;
  const deltaKg = aggA && aggB ? aggB.totalKg - aggA.totalKg : null;
  const deltaTrans = aggA && aggB ? aggB.totalTransactions - aggA.totalTransactions : null;
  const deltaFobPct = aggA && aggA.totalFob > 0 ? ((aggB?.totalFob || 0) - aggA.totalFob) / aggA.totalFob * 100 : null;
  const deltaKgPct = aggA && aggA.totalKg > 0 ? ((aggB?.totalKg || 0) - aggA.totalKg) / aggA.totalKg * 100 : null;
  const deltaTransPct = aggA && aggA.totalTransactions > 0
    ? ((aggB?.totalTransactions || 0) - aggA.totalTransactions) / aggA.totalTransactions * 100
    : null;

  /* ── YoY growth ── */
  const yoyGrowth = deltaFobPct !== null ? deltaFobPct : null;

  /* ═══════════════════ RENDER ═══════════════════ */

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Comparador de Períodos"
        subtitle="Compare dados comerciais brasileiros entre períodos distintos. Analise evolução, sazonalidade e crescimento ano a ano."
        badges={[
          { label: "DADOS OFICIAIS", className: "bg-emerald-500/20 text-emerald-300" },
          { label: "MDIC / COMEXSTAT", className: "bg-sky-500/20 text-sky-300" },
          { label: "COMPARAÇÃO PERÍODOS", className: "bg-violet-500/20 text-violet-300" },
        ]}
        variant="default"
      />

      {/* ── Search Card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            {/* Direction + NCM row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Direction selector */}
              <div className="lg:col-span-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Direção
                </Label>
                <div className="flex gap-1 mt-1">
                  {(["export", "import"] as const).map((d) => (
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
                      {d === "export" ? "Exportação" : "Importação"}
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
                  onKeyDown={handleKeyDown}
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
                  Comparar
                </Button>
              </div>
            </div>

            {/* ── Period selectors side by side ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Period A */}
              <div className="rounded-xl border border-sky-500/20 bg-sky-900/10 p-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-sky-400 flex items-center gap-1.5 mb-2">
                  <CalendarRange className="w-3 h-3" />
                  Período A — Base
                </Label>
                <div className="flex gap-1.5">
                  <div className="flex-1 flex gap-1">
                    <Select value={anoDeA} onValueChange={setAnoDeA}>
                      <SelectTrigger className="h-8 text-xs rounded-lg border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {ANOS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={mesDeA} onValueChange={setMesDeA}>
                      <SelectTrigger className="h-8 text-xs rounded-lg w-20 border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {MESES_FULL.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-slate-500 self-center text-xs">até</span>
                  <div className="flex-1 flex gap-1">
                    <Select value={anoAteA} onValueChange={setAnoAteA}>
                      <SelectTrigger className="h-8 text-xs rounded-lg border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {ANOS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={mesAteA} onValueChange={setMesAteA}>
                      <SelectTrigger className="h-8 text-xs rounded-lg w-20 border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {MESES_FULL.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Period B */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-3">
                <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-400 flex items-center gap-1.5 mb-2">
                  <CalendarRange className="w-3 h-3" />
                  Período B — Comparação
                </Label>
                <div className="flex gap-1.5">
                  <div className="flex-1 flex gap-1">
                    <Select value={anoDeB} onValueChange={setAnoDeB}>
                      <SelectTrigger className="h-8 text-xs rounded-lg border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {ANOS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={mesDeB} onValueChange={setMesDeB}>
                      <SelectTrigger className="h-8 text-xs rounded-lg w-20 border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {MESES_FULL.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-slate-500 self-center text-xs">até</span>
                  <div className="flex-1 flex gap-1">
                    <Select value={anoAteB} onValueChange={setAnoAteB}>
                      <SelectTrigger className="h-8 text-xs rounded-lg border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {ANOS.map((a) => (
                          <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={mesAteB} onValueChange={setMesAteB}>
                      <SelectTrigger className="h-8 text-xs rounded-lg w-20 border-slate-700/30 bg-slate-800/50 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700/50 bg-slate-900 text-slate-200">
                        {MESES_FULL.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Quick presets ── */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 self-center mr-1">
                Presets:
              </span>
              {([
                { key: "yoy", label: "YoY 24/25" },
                { key: "sem1", label: "1° Sem 24/25" },
                { key: "sem2", label: "2° Sem 24/25" },
                { key: "q1", label: "Q1 24/25" },
                { key: "q2", label: "Q2 24/25" },
              ] as const).map((p) => (
                <button
                  key={p.key}
                  onClick={() => applyPreset(p.key)}
                  className="px-2.5 h-7 text-[10px] font-bold rounded-lg border border-slate-700/30 bg-slate-800/30 text-slate-400 hover:border-slate-500/40 hover:text-slate-200 transition-all"
                >
                  {p.label}
                </button>
              ))}
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
              Buscando dados para ambos os períodos...
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Error banners ── */}
      {!loading && errorA && (
        <Card className="rounded-2xl border border-red-800/40 bg-red-900/20 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">Período A: {errorA}</p>
          </CardContent>
        </Card>
      )}
      {!loading && errorB && (
        <Card className="rounded-2xl border border-red-800/40 bg-red-900/20 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">Período B: {errorB}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Empty state (before first search) ── */}
      {!loading && !hasSearched && (
        <GlassCard>
          <div className="p-10 text-center">
            <BarChart3 className="w-14 h-14 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-200 mb-1">
              Compare Períodos Comerciais
            </h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Selecione um NCM, dois períodos distintos e visualize a evolução
              das exportações ou importações brasileiras lado a lado.
            </p>
          </div>
        </GlassCard>
      )}

      {/* ── No results ── */}
      {!loading && hasSearched && registrosA.length === 0 && registrosB.length === 0 && !errorA && !errorB && (
        <GlassCard>
          <div className="p-10 text-center">
            <Package className="w-14 h-14 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-200 mb-1">
              Nenhum registro encontrado
            </h3>
            <p className="text-slate-400 text-xs">
              Nenhum dado disponível para o NCM e períodos selecionados.
            </p>
          </div>
        </GlassCard>
      )}

      {/* ── RESULTS ── */}
      {!loading && hasSearched && (registrosA.length > 0 || registrosB.length > 0) && (
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
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] px-3 py-1 rounded-full">
                    NCM {formatNcmCode(searchNcm.replace(/\D/g, ""))}
                  </Badge>
                  <Badge className="bg-sky-500/10 text-sky-300 border-sky-500/20 text-[10px] px-3 py-1 rounded-full">
                    {direction === "export" ? "Exportação" : "Importação"}
                  </Badge>
                  {yoyGrowth !== null && (
                    <Badge className={cn(
                      "text-[10px] px-3 py-1 rounded-full border",
                      yoyGrowth >= 0
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/20",
                    )}>
                      YoY: {formatChangePct(yoyGrowth)}
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-300 font-medium">{ncmDescription}</p>
              </div>
            </GlassCard>
          )}

          {/* ── YoY Growth Banner ── */}
          {yoyGrowth !== null && (
            <GlassCard>
              <div className="p-4 flex items-center gap-3">
                {yoyGrowth >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <div>
                  <p className={cn(
                    "text-sm font-black",
                    yoyGrowth >= 0 ? "text-emerald-400" : "text-rose-400",
                  )}>
                    {direction === "export" ? "Exportação" : "Importação"} {
                      yoyGrowth >= 0 ? "cresceu" : "caiu"
                    } {Math.abs(yoyGrowth).toFixed(1)}% no período
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {periodALabel} → {periodBLabel}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* ── Comparison KPI Cards ── */}
          <div className="grid grid-cols-1 gap-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 px-1">
              <div className="col-span-4">Métrica</div>
              <div className="col-span-3 text-center text-sky-400">Período A</div>
              <div className="col-span-3 text-center text-amber-400">Período B</div>
              <div className="col-span-2 text-center text-slate-300">Variação</div>
            </div>

            {/* FOB */}
            <GlassCard>
              <div className="grid grid-cols-12 gap-3 items-center p-4">
                <div className="col-span-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-200">Valor FOB</span>
                </div>
                <div className="col-span-3 text-center">
                  <p className="text-sm font-black tabular-nums text-sky-300">
                    {kpisA?.fob || "—"}
                  </p>
                </div>
                <div className="col-span-3 text-center">
                  <p className="text-sm font-black tabular-nums text-amber-300">
                    {kpisB?.fob || "—"}
                  </p>
                </div>
                <div className="col-span-2 text-center">
                  {deltaFob !== null && deltaFobPct !== null ? (
                    <DeltaBadge value={deltaFob} pct={deltaFobPct} />
                  ) : (
                    <span className="text-slate-500 text-xs">—</span>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* KG */}
            <GlassCard>
              <div className="grid grid-cols-12 gap-3 items-center p-4">
                <div className="col-span-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-200">Peso (KG)</span>
                </div>
                <div className="col-span-3 text-center">
                  <p className="text-sm font-black tabular-nums text-sky-300">
                    {kpisA?.kg || "—"}
                  </p>
                </div>
                <div className="col-span-3 text-center">
                  <p className="text-sm font-black tabular-nums text-amber-300">
                    {kpisB?.kg || "—"}
                  </p>
                </div>
                <div className="col-span-2 text-center">
                  {deltaKg !== null && deltaKgPct !== null ? (
                    <DeltaBadge value={deltaKg} pct={deltaKgPct} />
                  ) : (
                    <span className="text-slate-500 text-xs">—</span>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Transactions */}
            <GlassCard>
              <div className="grid grid-cols-12 gap-3 items-center p-4">
                <div className="col-span-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-200">Transações</span>
                </div>
                <div className="col-span-3 text-center">
                  <p className="text-sm font-black tabular-nums text-sky-300">
                    {kpisA?.transacoes || "—"}
                  </p>
                </div>
                <div className="col-span-3 text-center">
                  <p className="text-sm font-black tabular-nums text-amber-300">
                    {kpisB?.transacoes || "—"}
                  </p>
                </div>
                <div className="col-span-2 text-center">
                  {deltaTrans !== null && deltaTransPct !== null ? (
                    <DeltaBadge value={deltaTrans} pct={deltaTransPct} />
                  ) : (
                    <span className="text-slate-500 text-xs">—</span>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Countries */}
            <GlassCard>
              <div className="grid grid-cols-12 gap-3 items-center p-4">
                <div className="col-span-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-sm font-bold text-slate-200">Países</span>
                </div>
                <div className="col-span-3 text-center">
                  <p className="text-sm font-black tabular-nums text-sky-300">
                    {kpisA?.paises || "—"}
                  </p>
                </div>
                <div className="col-span-3 text-center">
                  <p className="text-sm font-black tabular-nums text-amber-300">
                    {kpisB?.paises || "—"}
                  </p>
                </div>
                <div className="col-span-2 text-center">
                  {aggA && aggB && (
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      aggB.countryCount > aggA.countryCount ? "text-emerald-400" :
                      aggB.countryCount < aggA.countryCount ? "text-rose-400" : "text-slate-400",
                    )}>
                      {aggB.countryCount - aggA.countryCount > 0 ? "+" : ""}
                      {aggB.countryCount - aggA.countryCount}
                    </span>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ── Tabs: Overview / Countries ── */}
          <Tabs value={viewTab} onValueChange={setViewTab} className="space-y-4">
            <TabsList className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-slate-100 text-slate-400 rounded-lg text-xs font-bold"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Comparativo Mensal
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
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                Análise
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Overview (Monthly Comparison) ── */}
            <TabsContent value="overview">
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Comparativo Mensal — FOB (USD)
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
                            formatter={(value: number) => [formatCurrencyFull(value)]}
                          />
                          <Legend
                            formatter={(value: string) => (
                              <span style={{ color: "#cbd5e1", fontSize: "11px" }}>
                                {value === "periodAFob" ? `Período A (${periodALabel})` : `Período B (${periodBLabel})`}
                              </span>
                            )}
                          />
                          <Bar
                            dataKey="periodAFob"
                            name="periodAFob"
                            fill="#38bdf8"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="periodBFob"
                            name="periodBFob"
                            fill="#fbbf24"
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
                    Países — Comparação entre Períodos
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
                              Período A (FOB)
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Período B (FOB)
                            </th>
                            <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                              Variação
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
                              <td className="py-2.5 text-right text-sky-300 tabular-nums font-medium">
                                {formatCurrencyFull(row.periodAFob)}
                              </td>
                              <td className="py-2.5 text-right text-amber-300 tabular-nums font-medium">
                                {formatCurrencyFull(row.periodBFob)}
                              </td>
                              <td className="py-2.5 text-right tabular-nums font-bold">
                                <span
                                  className={cn(
                                    row.changeFob >= 0 ? "text-emerald-400" : "text-rose-400",
                                  )}
                                >
                                  {row.changeFob >= 0 ? "+" : ""}
                                  {formatCurrencyFull(row.changeFob)}
                                </span>
                              </td>
                              <td className="py-2.5 text-right tabular-nums font-bold">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1",
                                    row.changePct >= 0 ? "text-emerald-400" : "text-rose-400",
                                  )}
                                >
                                  {row.changePct >= 0
                                    ? <TrendingUp className="w-3 h-3" />
                                    : <TrendingDown className="w-3 h-3" />
                                  }
                                  {formatChangePct(row.changePct)}
                                </span>
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

            {/* ── Tab: Analysis ── */}
            <TabsContent value="timeline">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GlassCard>
                  <div className="p-5">
                    <h3 className="text-sm font-black text-slate-200 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Período A — {periodALabel}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">FOB Total</span>
                        <span className="text-sky-300 font-bold tabular-nums">{kpisA?.fob || "—"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Peso Total</span>
                        <span className="text-slate-300 font-bold tabular-nums">{kpisA?.kg || "—"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Transações</span>
                        <span className="text-slate-300 font-bold tabular-nums">{kpisA?.transacoes || "—"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Países</span>
                        <span className="text-slate-300 font-bold tabular-nums">{kpisA?.paises || "—"}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="p-5">
                    <h3 className="text-sm font-black text-slate-200 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      Período B — {periodBLabel}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">FOB Total</span>
                        <span className="text-amber-300 font-bold tabular-nums">{kpisB?.fob || "—"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Peso Total</span>
                        <span className="text-slate-300 font-bold tabular-nums">{kpisB?.kg || "—"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Transações</span>
                        <span className="text-slate-300 font-bold tabular-nums">{kpisB?.transacoes || "—"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Países</span>
                        <span className="text-slate-300 font-bold tabular-nums">{kpisB?.paises || "—"}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* ── Summary ── */}
              <GlassCard>
                <div className="p-5">
                  <h3 className="text-sm font-black text-slate-200 mb-3 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-violet-400" />
                    Resumo da Comparação
                  </h3>
                  {deltaFob !== null && deltaFobPct !== null && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/20">
                        <span className="text-xs text-slate-300 font-medium">Valor FOB</span>
                        <DeltaBadge value={deltaFob} pct={deltaFobPct} />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/20">
                        <span className="text-xs text-slate-300 font-medium">Peso (KG)</span>
                        {deltaKg !== null && deltaKgPct !== null ? (
                          <DeltaBadge value={deltaKg} pct={deltaKgPct} />
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-slate-700/20">
                        <span className="text-xs text-slate-300 font-medium">Transações</span>
                        {deltaTrans !== null && deltaTransPct !== null ? (
                          <DeltaBadge value={deltaTrans} pct={deltaTransPct} />
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>

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
              Atualizado mensalmente. Período A: {periodALabel} | Período B: {periodBLabel}.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
