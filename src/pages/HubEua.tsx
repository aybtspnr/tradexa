"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Loader2, TrendingUp, TrendingDown, DollarSign, Globe,
  Package, AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ═══════════════════════ TYPES ═══════════════════════ */

interface TradeRegistro {
  co_ano: string;
  co_mes: string;
  mes_nome: string;
  co_pais: string;
  pais_nome: string;
  vl_fob: number;
  kg_liquido: number;
}

interface MonthlyPoint {
  mes: string;
  mesLabel: string;
  importFob: number;
  exportFob: number;
}

interface TopProduct {
  hs2: string;
  name: string;
  value_usd: number;
}

interface GlobalTradeSummary {
  exports_total_billion: number;
  imports_total_billion: number;
  trade_balance_billion: number;
  year_reference: number;
}

interface GlobalTradeResponse {
  summary: GlobalTradeSummary;
  top_products: TopProduct[];
}

/* ═══════════════════════ HELPERS ═══════════════════════ */

function formatFOB(n: number): string {
  if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `US$ ${(n / 1_000).toFixed(2)}K`;
  return `US$ ${n.toFixed(2)}`;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n);
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
  "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
};

const MONTH_ORDER = ["01","02","03","04","05","06","07","08","09","10","11","12"];

function buildMonthlyData(
  imp: TradeRegistro[],
  exp: TradeRegistro[],
): MonthlyPoint[] {
  const map = new Map<string, { importFob: number; exportFob: number }>();
  for (const r of imp) {
    const m = r.co_mes?.padStart(2, "0");
    if (m) {
      const prev = map.get(m) || { importFob: 0, exportFob: 0 };
      prev.importFob += r.vl_fob || 0;
      map.set(m, prev);
    }
  }
  for (const r of exp) {
    const m = r.co_mes?.padStart(2, "0");
    if (m) {
      const prev = map.get(m) || { importFob: 0, exportFob: 0 };
      prev.exportFob += r.vl_fob || 0;
      map.set(m, prev);
    }
  }
  return MONTH_ORDER.map((m) => ({
    mes: m,
    mesLabel: MONTH_LABELS[m] || m,
    importFob: map.get(m)?.importFob || 0,
    exportFob: map.get(m)?.exportFob || 0,
  }));
}

/* ═══════════════════════ CHART TOOLTIP ═══════════════════════ */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs shadow-md">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p
          key={p.name}
          className="flex items-center gap-2"
          style={{ color: p.color }}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name === "exportFob" ? "Exportação" : "Importação"}:
          <span className="font-semibold">{formatFOB(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function HubEua() {
  useSeo({
    title: "Comércio Brasil-EUA — TRADEXA",
    description:
      "Dados bilaterais de comércio exterior entre Brasil e Estados Unidos: importação, exportação, saldo, principais produtos e tendências mensais.",
    keywords:
      "Brasil, EUA, Estados Unidos, comércio bilateral, exportação, importação, balança comercial, tradexa",
  });

  const [importRegistros, setImportRegistros] = useState<TradeRegistro[]>([]);
  const [exportRegistros, setExportRegistros] = useState<TradeRegistro[]>([]);
  const [globalTrade, setGlobalTrade] = useState<GlobalTradeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState("2025");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const calls = [
      supabase.functions.invoke("import-data", {
        body: { pais: "300", anoDe: year, mesDe: "01", anoAte: year, mesAte: "12", tipo: "IMP" },
      }),
      supabase.functions.invoke("export-data", {
        body: { pais: "300", anoDe: year, mesDe: "01", anoAte: year, mesAte: "12", tipo: "EXP" },
      }),
      supabase.functions.invoke("global-trade-data", {
        body: { origin: "BRA", destination: "USA" },
      }),
    ];

    Promise.allSettled(calls)
      .then(([impResult, expResult, globalResult]) => {
        if (cancelled) return;

        const errs: string[] = [];

        if (impResult.status === "fulfilled") {
          const d = impResult.value.data;
          if (d?.error) errs.push(`Import: ${d.error}`);
          else if (d?.registros) setImportRegistros(d.registros);
        } else errs.push("Importação");

        if (expResult.status === "fulfilled") {
          const d = expResult.value.data;
          if (d?.error) errs.push(`Export: ${d.error}`);
          else if (d?.registros) setExportRegistros(d.registros);
        } else errs.push("Exportação");

        if (globalResult.status === "fulfilled") {
          const d = globalResult.value.data;
          if (d?.summary) setGlobalTrade(d);
        }

        if (errs.length) setError(errs.join("; "));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Erro ao carregar dados");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [year]);

  /* ── Derived KPIs ── */
  const importTotal = useMemo(
    () => importRegistros.reduce((s, r) => s + (r.vl_fob || 0), 0),
    [importRegistros],
  );
  const exportTotal = useMemo(
    () => exportRegistros.reduce((s, r) => s + (r.vl_fob || 0), 0),
    [exportRegistros],
  );
  const balance = exportTotal - importTotal;
  const totalVolume = importTotal + exportTotal;

  /* ── Monthly series ── */
  const monthlyData = useMemo(
    () => buildMonthlyData(importRegistros, exportRegistros),
    [importRegistros, exportRegistros],
  );

  /* ── Top products ── */
  const topProducts = (globalTrade?.top_products || []) as TopProduct[];

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a84c] mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Carregando dados Brasil-EUA...</p>
        </div>
      </div>
    );
  }

  const hasData = importRegistros.length > 0 || exportRegistros.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Alguns dados não carregaram: {error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#c9a84c]" />
            Comércio Brasil — EUA
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dados bilaterais de importação e exportação entre Brasil e Estados Unidos
          </p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30"
        >
          {["2026","2025","2024","2023","2022","2021","2020"].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              Importação
            </div>
            <div className="text-lg font-bold text-slate-800">{formatFOB(importTotal)}</div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {formatNumber(importRegistros.length)} registros
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              Exportação
            </div>
            <div className="text-lg font-bold text-slate-800">{formatFOB(exportTotal)}</div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {formatNumber(exportRegistros.length)} registros
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Saldo Comercial
            </div>
            <div className={cn("text-lg font-bold", balance >= 0 ? "text-green-600" : "text-red-600")}>
              {balance >= 0 ? "+" : ""}{formatFOB(balance)}
            </div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {balance >= 0 ? "Superávit" : "Déficit"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              Volume Total
            </div>
            <div className="text-lg font-bold text-slate-800">{formatFOB(totalVolume)}</div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{year}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#c9a84c]" />
            Tendência Mensal {year}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mesLabel" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94a3b8"
                  tickFormatter={(v: number) => `$${(v / 1e6).toFixed(0)}M`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="exportFob"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="importFob"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-green-500 rounded" />
              Exportação
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-red-500 rounded" />
              Importação
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#c9a84c]" />
            Principais Produtos (Exportação Brasil → EUA)
          </h3>
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 pr-3 font-semibold text-slate-500">HS2</th>
                    <th className="text-left py-2 pr-3 font-semibold text-slate-500">Produto</th>
                    <th className="text-right py-2 font-semibold text-slate-500">
                      Valor (US$ Bi)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr
                      key={p.hs2}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2.5 pr-3">
                        <Badge variant="outline" className="font-mono text-[10px]">{p.hs2}</Badge>
                      </td>
                      <td className="py-2.5 pr-3 font-medium text-slate-700">{p.name}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-800">
                        US$ {p.value_usd.toFixed(1)}B
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              Dados de produtos indisponíveis no momento.
            </p>
          )}
          <p className="text-[10px] text-slate-400 mt-3 italic">
            Fonte: MDIC/ComexStat • Dados de referência {globalTrade?.summary?.year_reference || 2023}
          </p>
        </CardContent>
      </Card>

      {/* No data fallback */}
      {!hasData && !error && (
        <div className="text-center py-8 text-slate-500">
          <Globe className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-medium">Nenhum dado disponível para {year}</p>
          <p className="text-xs mt-1">Tente selecionar outro ano.</p>
        </div>
      )}
    </div>
  );
}
