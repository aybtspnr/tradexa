"use client";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, Globe, Building2,
  Loader2, AlertTriangle, Hash, BarChart3, Percent,
  Sparkles, ArrowUpRight, Radio, Briefcase,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface KpiCard {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral"; trendLabel?: string;
  color: "red" | "blue" | "green" | "amber"; loading?: boolean;
}

const COLOR_MAP: Record<string, { bg: string; text: string; icon: string; ring: string }> = {
  red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500", ring: "ring-red-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500", ring: "ring-blue-100" },
  green: { bg: "bg-green-50", text: "text-green-600", icon: "text-green-500", ring: "ring-green-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "text-amber-500", ring: "ring-amber-100" },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

const API = "/api/intel/global";

/* ── Component ── */
export default function HubDashboard() {
  const [loading, setLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [selic, setSelic] = useState<number | null>(null);
  const [ipca, setIpca] = useState<number | null>(null);
  const [brazilData, setBrazilData] = useState<any>(null);
  const [marketShare, setMarketShare] = useState<any>(null);
  const [exchangeHistory, setExchangeHistory] = useState<any[]>([]);
  const [localData, setLocalData] = useState<{ importers: number; tariffCountries: number }>({ importers: 0, tariffCountries: 0 });

  useEffect(() => {
    let cancelled = false;
    
    async function loadAll() {
      const results = await Promise.allSettled([
        fetch(`${API}/bcb/exchange-rate`).then(r => r.json()),
        fetch(`${API}/bcb/selic`).then(r => r.json()),
        fetch(`${API}/bcb/ipca`).then(r => r.json()),
        fetch(`${API}/worldbank/country/BRA`).then(r => r.json()),
        fetch(`${API}/market-share/3004?year=2025`).then(r => r.json()),
        fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/30?formato=json").then(r => r.json()),
        fetch("/cts_tariffs_summary.json").then(r => r.json()),
      ]);

      if (cancelled) return;

      // BCB Exchange Rate
      if (results[0].status === "fulfilled") {
        const d = results[0].value;
        setExchangeRate(typeof d === "object" ? (d.value || d.valor) : null);
      }
      // SELIC
      if (results[1].status === "fulfilled") {
        const d = results[1].value;
        setSelic(typeof d === "object" ? (d.value || d.valor) : null);
      }
      // IPCA
      if (results[2].status === "fulfilled") {
        const d = results[2].value;
        setIpca(typeof d === "object" ? (d.value || d.valor) : null);
      }
      // World Bank
      if (results[3].status === "fulfilled") {
        setBrazilData(results[3].value);
      }
      // Market Share
      if (results[4].status === "fulfilled") {
        setMarketShare(results[4].value);
      }
      // Exchange History
      if (results[5].status === "fulfilled" && Array.isArray(results[5].value)) {
        setExchangeHistory(results[5].value.reverse());
      }
      // Local data
      if (results[6].status === "fulfilled") {
        setLocalData(prev => ({ ...prev, tariffCountries: Array.isArray(results[6].value) ? results[6].value.length : 0 }));
      }

      setLoading(false);
    }

    loadAll();
    return () => { cancelled = true; };
  }, []);

  const kpis = useMemo<KpiCard[]>(() => [
    {
      label: "USD/BRL Câmbio",
      value: exchangeRate ? `R$ ${Number(exchangeRate).toFixed(3)}` : "—",
      sub: "PTAX BCB",
      icon: DollarSign,
      trend: exchangeRate && Number(exchangeRate) > 5.5 ? "up" : "down",
      trendLabel: "hoje",
      color: exchangeRate && Number(exchangeRate) > 5.5 ? "red" : "green",
      loading,
    },
    {
      label: "SELIC",
      value: selic ? `${selic}%` : "—",
      sub: "taxa básica de juros",
      icon: Percent,
      trend: selic && selic > 13 ? "up" : "down",
      trendLabel: "BCB",
      color: selic && selic > 13 ? "red" : "amber",
      loading,
    },
    {
      label: "IPCA",
      value: ipca ? `${ipca}%` : "—",
      sub: "inflação acumulada 12m",
      icon: TrendingUp,
      trend: ipca && ipca > 4 ? "up" : "down",
      trendLabel: "anual",
      color: ipca && ipca > 4 ? "red" : "green",
      loading,
    },
    {
      label: "PIB Brasil",
      value: brazilData?.gdp ? formatNumber(brazilData.gdp) : "—",
      sub: `crescimento ${brazilData?.gdp_growth?.toFixed(1) || "—"}%`,
      icon: BarChart3,
      trend: brazilData?.gdp_growth > 0 ? "up" : "down",
      trendLabel: "World Bank",
      color: "green",
      loading,
    },
    {
      label: "Exportações NCM 3004",
      value: marketShare?.brazil?.export_total ? formatNumber(marketShare.brazil.export_total) : "—",
      sub: "medicamentos",
      icon: Globe,
      trend: "up",
      trendLabel: "2025",
      color: "blue",
      loading,
    },
    {
      label: "Países com Tarifas",
      value: String(localData.tariffCountries || "—"),
      sub: "alíquotas disponíveis",
      icon: Building2,
      trend: "neutral",
      trendLabel: "cobertura",
      color: "amber",
      loading,
    },
  ], [exchangeRate, selic, ipca, brazilData, marketShare, localData, loading]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0F111A]">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Indicadores econômicos e dados de comércio exterior
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border">
          Dados de referência
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {kpis.map((kpi) => {
          const colors = COLOR_MAP[kpi.color];
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={cn(
                "rounded-xl p-4 border transition-all duration-300",
                "hover:shadow-md hover:-translate-y-0.5",
                kpi.loading ? "animate-pulse bg-slate-50" : "bg-white"
              )}
            >
              {kpi.loading ? (
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("p-1.5 rounded-lg", colors.bg)}>
                      <Icon className={cn("w-4 h-4", colors.icon)} />
                    </div>
                    {kpi.trend && (
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                        kpi.trend === "up" ? "bg-green-50 text-green-600" :
                        kpi.trend === "down" ? "bg-red-50 text-red-600" :
                        "bg-slate-50 text-slate-500"
                      )}>
                        {kpi.trendLabel}
                      </span>
                    )}
                  </div>
                  <div className={cn("text-lg font-bold text-[#0F111A]")}>{kpi.value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{kpi.sub}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Exchange Rate History */}
        <div className="bg-white rounded-xl border p-4 md:p-5">
          <h3 className="text-sm font-bold text-[#0F111A] mb-4">Evolução do Câmbio (USD/BRL)</h3>
          {exchangeHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={exchangeHistory.map((d: any) => ({ date: d.data, value: parseFloat(d.valor) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} tick={{ fontSize: 10 }} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip formatter={(v: number) => [`R$ ${v.toFixed(3)}`, "USD/BRL"]} />
                <Line type="monotone" dataKey="value" stroke="#D80E16" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
              Carregando histórico...
            </div>
          )}
        </div>

        {/* Top Export Partners - NCM 3004 */}
        <div className="bg-white rounded-xl border p-4 md:p-5">
          <h3 className="text-sm font-bold text-[#0F111A] mb-4">Top Parceiros — NCM 3004</h3>
          {marketShare?.partners?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={marketShare.partners.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatNumber(v)} />
                <YAxis dataKey="country" type="category" tick={{ fontSize: 10 }} width={100} tickLine={false} />
                <Tooltip formatter={(v: number) => [formatNumber(v), "FOB"]} />
                <Bar dataKey="value" fill="#D80E16" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
              Busque um NCM para ver parceiros
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickStat label="População Brasil" value={brazilData?.population ? `${(brazilData.population / 1_000_000).toFixed(1)}M` : "—"} />
        <QuickStat label="Exportações Total" value={brazilData?.exports ? formatNumber(brazilData.exports) : "—"} />
        <QuickStat label="Importações Total" value={brazilData?.imports ? formatNumber(brazilData.imports) : "—"} />
        <QuickStat label="Balança Comercial" value={brazilData?.exports && brazilData?.imports ? formatNumber(brazilData.exports - brazilData.imports) : "—"} />
      </div>

      {/* Quick Access — Novas Ferramentas */}
      <div>
        <h3 className="text-sm font-bold text-[#0F111A] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Acesso Rápido
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/company-global-profile" className="block group">
            <div className="bg-white rounded-xl border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-violet-200">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center mb-2">
                <Building2 className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-[13px] font-bold text-[#0F111A] group-hover:text-violet-600 transition-colors">Perfil Global</div>
              <div className="text-[10px] text-slate-500 mt-0.5">CNPJ com contexto global</div>
            </div>
          </Link>
          <Link to="/radar-concorrencia" className="block group">
            <div className="bg-white rounded-xl border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-red-200">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mb-2">
                <Radio className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-[13px] font-bold text-[#0F111A] group-hover:text-red-600 transition-colors">Radar Concorrência</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Concorrentes por NCM</div>
            </div>
          </Link>
          <Link to="/global-trade-comparison" className="block group">
            <div className="bg-white rounded-xl border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-blue-200">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-[13px] font-bold text-[#0F111A] group-hover:text-blue-600 transition-colors">Comparador Global</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Brasil vs China, EUA, DEU</div>
            </div>
          </Link>
          <Link to="/ncm-global-dashboard" className="block group">
            <div className="bg-white rounded-xl border p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-emerald-200">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[13px] font-bold text-[#0F111A] group-hover:text-emerald-600 transition-colors">NCM Dashboard</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Análise global do NCM</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Data Sources */}
      <div className="text-[10px] text-slate-400 text-center border-t pt-4">
        Fontes de referência
      </div>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border p-3 text-center">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-bold text-[#0F111A]">{value}</div>
    </div>
  );
}
