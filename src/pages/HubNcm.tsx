"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, TrendingUp, TrendingDown, DollarSign,
  Globe, Package, FileSearch, AlertTriangle, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";

/* ═══════════════════════ TYPES ═══════════════════════ */

interface NcmSuggestion {
  code: string;
  description: string;
}

interface Registro {
  co_ano: string;
  co_mes: string;
  pais_nome: string;
  co_pais: string;
  vl_fob: number;
  kg_liquido: number;
  qt_estat: number;
}

interface CountryRow {
  pais_nome: string;
  importFob: number;
  importKg: number;
  exportFob: number;
  exportKg: number;
  fobTotal: number;
  sharePct: number;
}

interface KpiData {
  importFob: number;
  exportFob: number;
  importKg: number;
  exportKg: number;
  importTransactions: number;
  exportTransactions: number;
  countryCount: number;
}

/* ═══════════════════════ HELPERS ═══════════════════════ */

function formatNcmCode(code: string): string {
  const digits = (code || "").replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  if (digits.length === 6) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}`;
  return digits;
}

function formatFOB(n: number): string {
  if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `US$ ${(n / 1_000).toFixed(1)}K`;
  return `US$ ${n.toFixed(0)}`;
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

  for (const r of registros) {
    const fob = Number(r.vl_fob) || 0;
    const kg = Number(r.kg_liquido) || 0;
    totalFob += fob;
    totalKg += kg;
    totalTransactions += Number(r.qt_estat) || 0;

    const key = r.pais_nome || r.co_pais || "ZZ";
    if (r.pais_nome) {
      countriesSet.add(r.pais_nome);
      const prev = countriesMap.get(r.pais_nome) || { fob: 0, kg: 0 };
      prev.fob += fob;
      prev.kg += kg;
      countriesMap.set(r.pais_nome, prev);
    }
  }

  return { totalFob, totalKg, totalTransactions, countryCount: countriesSet.size, countriesMap };
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
      importFob: imp.fob,
      importKg: imp.kg,
      exportFob: exp.fob,
      exportKg: exp.kg,
      fobTotal: imp.fob + exp.fob,
      sharePct: 0,
    });
  }

  const grandTotal = rows.reduce((s, r) => s + r.fobTotal, 0);
  for (const r of rows) r.sharePct = grandTotal > 0 ? (r.fobTotal / grandTotal) * 100 : 0;

  return rows.sort((a, b) => b.fobTotal - a.fobTotal);
}

/* ═══════════════════════ KPI CARD ═══════════════════════ */

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "amber" | "emerald" | "rose" | "blue" | "violet";
}) {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    amber: { bg: "bg-amber-50", text: "text-amber-700", icon: "text-amber-500" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "text-emerald-500" },
    rose: { bg: "bg-rose-50", text: "text-rose-700", icon: "text-rose-500" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
    violet: { bg: "bg-violet-50", text: "text-violet-700", icon: "text-violet-500" },
  };
  const c = colorMap[color];

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5 truncate">
              {label}
            </p>
            <p className={cn("text-lg font-black tabular-nums", c.text)}>
              {value}
            </p>
            {sub && (
              <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg shrink-0 ml-3", c.bg)}>
            <Icon className={cn("w-4 h-4", c.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════ COMPONENT ═══════════════════════ */

export default function HubNcm() {
  useSeo({
    title: "NCM — Classificação e Dados TRADEXA",
    description: "Consulte e analise produtos por código NCM com dados de importação, exportação e parceiros comerciais.",
    keywords: "ncm, classificação fiscal, importação, exportação, comércio exterior, tradexa",
  });

  /* ── NCM Search ── */
  const [searchNcm, setSearchNcm] = useState("");
  const [ncmDescription, setNcmDescription] = useState("");
  const [ncmSuggestions, setNcmSuggestions] = useState<NcmSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /* ── Period ── */
  const [ano, setAno] = useState("2025");

  /* ── Data ── */
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [countryRows, setCountryRows] = useState<CountryRow[]>([]);

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

  /* ── NCM autocomplete ── */
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

  /* ── Select suggestion ── */
  const selectNcm = useCallback((code: string, description: string) => {
    setSearchNcm(formatNcmCode(code));
    setNcmDescription(description);
    setShowSuggestions(false);
  }, []);

  /* ── Main search ── */
  const handleSearch = useCallback(async () => {
    const ncmClean = searchNcm.replace(/\D/g, "");
    if (!ncmClean) {
      setError("Digite um código NCM.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    const params = { ncm: ncmClean, anoDe: ano, mesDe: "_all", anoAte: ano, mesAte: "_all" };

    try {
      const [importResult, exportResult] = await Promise.allSettled([
        supabase.functions.invoke("import-data", { body: { ...params, tipo: "IMP" } }),
        supabase.functions.invoke("export-data", { body: { ...params, tipo: "EXP" } }),
      ]);

      let importRegistros: Registro[] = [];
      let exportRegistros: Registro[] = [];
      let importDesc = "";
      let exportDesc = "";

      if (importResult.status === "fulfilled") {
        const v = importResult.value;
        const d = v.data;
        if (!d?.error && d?.registros) {
          importRegistros = d.registros;
          if (d.ncm_description) importDesc = d.ncm_description;
        }
      }
      if (exportResult.status === "fulfilled") {
        const v = exportResult.value;
        const d = v.data;
        if (!d?.error && d?.registros) {
          exportRegistros = d.registros;
          if (d.ncm_description) exportDesc = d.ncm_description;
        }
      }

      // Set description
      if (importDesc || exportDesc) {
        setNcmDescription(importDesc || exportDesc);
      }

      // Aggregate
      const impAgg = aggregateRegistros(importRegistros);
      const expAgg = aggregateRegistros(exportRegistros);

      setKpis({
        importFob: impAgg.totalFob,
        exportFob: expAgg.totalFob,
        importKg: impAgg.totalKg,
        exportKg: expAgg.totalKg,
        importTransactions: impAgg.totalTransactions,
        exportTransactions: expAgg.totalTransactions,
        countryCount: impAgg.countryCount + expAgg.countryCount,
      });

      // Country rows
      const merged = mergeCountryRows(impAgg.countriesMap, expAgg.countriesMap);
      setCountryRows(merged);

      if (importRegistros.length === 0 && exportRegistros.length === 0) {
        setError("Nenhum registro encontrado para este NCM e ano.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  }, [searchNcm, ano]);

  /* ── Derived balance ── */
  const balance = kpis ? kpis.exportFob - kpis.importFob : null;

  /* ── Years for select ── */
  const years = useMemo(() => {
    const arr: string[] = [];
    for (let y = 2026; y >= 2015; y--) arr.push(String(y));
    return arr;
  }, []);

  /* ── Render ── */
  return (
    <div className="p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-[#c9a84c]" />
            Classificação NCM
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Consulte dados de importação e exportação por código NCM
          </p>
        </div>
      </div>

      {/* ── Search card ── */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-violet-400" />
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* NCM Input */}
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder="Digite o código NCM (ex: 8471, 84...)"
                value={searchNcm}
                onChange={(e) => {
                  setSearchNcm(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 bg-white border-slate-200 h-10 text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && ncmSuggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
                  >
                    {ncmSuggestions.map((s) => (
                      <button
                        key={s.code}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between gap-3 border-b border-slate-100 last:border-b-0 transition-colors"
                        onClick={() => selectNcm(s.code, s.description)}
                      >
                        <span className="font-mono font-bold text-xs text-slate-700">
                          {formatNcmCode(s.code)}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[280px]">
                          {s.description}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Year selector */}
            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Search button */}
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="h-10 px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm gap-1.5 shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Consultar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">
              Buscando dados comerciais...
            </p>
          </div>
        </div>
      )}

      {/* ── Error / Empty state ── */}
      {!loading && error && (
        <Card className="border-amber-200 bg-amber-50 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
            <p className="text-sm font-semibold text-amber-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Empty state (before first search) ── */}
      {!loading && !hasSearched && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <FileSearch className="w-14 h-14 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">
              Pesquise um código NCM
            </h3>
            <p className="text-sm text-slate-400 max-w-md">
              Digite um código NCM para visualizar dados de importação, exportação,
              principais parceiros comerciais e indicadores.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── RESULTS ── */}
      {!loading && hasSearched && !error && kpis && (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* NCM Description badge */}
          {ncmDescription && (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] px-3 py-1 rounded-full font-bold shrink-0">
                  NCM {formatNcmCode(searchNcm.replace(/\D/g, ""))}
                </Badge>
                <p className="text-sm text-slate-600 font-medium leading-snug">
                  {ncmDescription}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ── KPI Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              label="Importação FOB"
              value={formatFOB(kpis.importFob)}
              sub={`${formatNumber(kpis.importTransactions)} transações`}
              icon={TrendingDown}
              color="rose"
            />
            <KpiCard
              label="Exportação FOB"
              value={formatFOB(kpis.exportFob)}
              sub={`${formatNumber(kpis.exportTransactions)} transações`}
              icon={TrendingUp}
              color="emerald"
            />
            <KpiCard
              label="Balança Comercial"
              value={balance !== null ? formatFOB(Math.abs(balance)) : "—"}
              sub={balance !== null ? (balance >= 0 ? "Superávit" : "Déficit") : ""}
              icon={DollarSign}
              color={balance !== null && balance >= 0 ? "emerald" : "rose"}
            />
            <KpiCard
              label="Países Parceiros"
              value={String(kpis.countryCount)}
              sub={`${formatNumber(kpis.importKg + kpis.exportKg)} kg`}
              icon={Globe}
              color="blue"
            />
          </div>

          {/* ── Country Table ── */}
          {countryRows.length > 0 ? (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-500" />
                  Principais Países Parceiros
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-4 pb-2 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        #
                      </th>
                      <th className="px-4 pb-2 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                        País
                      </th>
                      <th className="px-4 pb-2 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-right">
                        Importação (FOB)
                      </th>
                      <th className="px-4 pb-2 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-right">
                        Exportação (FOB)
                      </th>
                      <th className="px-4 pb-2 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-right">
                        Total (FOB)
                      </th>
                      <th className="px-4 pb-2 font-bold text-slate-400 uppercase tracking-wider text-[10px] text-right">
                        %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {countryRows.slice(0, 15).map((row, idx) => (
                      <tr
                        key={row.pais_nome + idx}
                        className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-slate-300 font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-slate-700">
                          {row.pais_nome}
                        </td>
                        <td className="px-4 py-2.5 text-right text-rose-600 tabular-nums font-medium">
                          {formatFOB(row.importFob)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-emerald-600 tabular-nums font-medium">
                          {formatFOB(row.exportFob)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-800 font-bold tabular-nums">
                          {formatFOB(row.fobTotal)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-500 tabular-nums">
                          {row.sharePct.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {countryRows.length > 15 && (
                <div className="px-4 py-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 text-center">
                    Mostrando 15 de {formatNumber(countryRows.length)} países
                  </p>
                </div>
              )}
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Dados por país não disponíveis para este NCM.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
