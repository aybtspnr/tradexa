"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe, TrendingUp, TrendingDown, DollarSign, BarChart3,
  Loader2, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const API = "/api/intel/global";

interface MarketShareData {
  ncm: string;
  year: number;
  brazil: { export_total: number };
  partners: { country: string; value: number }[];
}

interface BrazilMacro {
  gdp?: number;
  population?: number;
  gdp_growth?: number;
  inflation?: number;
  exports?: number;
  imports?: number;
}

interface Props {
  ncm: string;
  year?: number;
  className?: string;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("pt-BR");
}

export default function GlobalMarketSection({ ncm, year = 2025, className }: Props) {
  const [marketShare, setMarketShare] = useState<MarketShareData | null>(null);
  const [brazilMacro, setBrazilMacro] = useState<BrazilMacro | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      fetch(`${API}/market-share/${ncm}?year=${year}`).then(r => r.json()),
      fetch(`${API}/worldbank/country/BRA`).then(r => r.json()),
      fetch(`${API}/bcb/exchange-rate`).then(r => r.json()),
    ]).then((results) => {
      if (cancelled) return;

      if (results[0].status === "fulfilled") setMarketShare(results[0].value as MarketShareData);
      else setError("Não foi possível carregar dados de market share");

      if (results[1].status === "fulfilled") setBrazilMacro(results[1].value as BrazilMacro);
      if (results[2].status === "fulfilled") {
        const d = results[2].value as any;
        setExchangeRate(typeof d === "object" ? Number(d.value || d.valor || 0) : null);
      }

      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [ncm, year]);

  if (loading) {
    return (
      <Card className={cn("rounded-2xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-xl", className)}>
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#c9a84c] mx-auto mb-2" />
            <p className="text-sm text-slate-400">Carregando dados globais...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !marketShare) {
    return (
      <Card className={cn("rounded-2xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-xl", className)}>
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="text-center text-slate-500">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#D80E16]" />
          <h3 className="text-sm font-bold text-slate-200">Mercado Global</h3>
        </div>
        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-600">
          BCB · World Bank · COMEXSTAT
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MacroKpi
          label="Exportações NCM"
          value={marketShare?.brazil?.export_total ? formatCurrency(marketShare.brazil.export_total) : "—"}
          sub={ncm}
          icon={BarChart3}
          color="emerald"
        />
        <MacroKpi
          label="PIB Brasil"
          value={brazilMacro?.gdp ? formatCurrency(brazilMacro.gdp) : "—"}
          sub={`cresc. ${brazilMacro?.gdp_growth?.toFixed(1) || "—"}%`}
          icon={TrendingUp}
          color={brazilMacro?.gdp_growth && brazilMacro.gdp_growth > 0 ? "emerald" : "red"}
        />
        <MacroKpi
          label="USD/BRL"
          value={exchangeRate ? `R$ ${exchangeRate.toFixed(3)}` : "—"}
          sub="PTAX BCB"
          icon={DollarSign}
          color={exchangeRate && exchangeRate > 5.5 ? "red" : "emerald"}
        />
        <MacroKpi
          label="Balança"
          value={
            brazilMacro?.exports && brazilMacro?.imports
              ? formatCurrency(brazilMacro.exports - brazilMacro.imports)
              : "—"
          }
          sub={brazilMacro?.exports && brazilMacro?.imports ? "superávit" : "—"}
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Chart: Top Partners */}
      {marketShare?.partners && marketShare.partners.length > 0 && (
        <Card className="rounded-2xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-xl">
          <CardContent className="p-4">
            <h4 className="text-xs font-bold text-slate-300 mb-3">Top Parceiros Comerciais</h4>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={marketShare.partners.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <YAxis
                  dataKey="country"
                  type="category"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  width={110}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v: number) => [formatCurrency(v), "FOB"]}
                />
                <Bar dataKey="value" fill="#D80E16" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Countries Table */}
      {marketShare?.partners && marketShare.partners.length > 0 && (
        <Card className="rounded-2xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-xl">
          <CardContent className="p-4">
            <h4 className="text-xs font-bold text-slate-300 mb-3">Detalhamento por País</h4>
            <div className="space-y-1">
              {marketShare.partners.slice(0, 10).map((p, i) => (
                <div
                  key={p.country}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-slate-200">{p.country}</span>
                  <span className="text-sm font-bold text-slate-100">{formatCurrency(p.value)}</span>
                  <span className="text-[10px] text-slate-500 w-12 text-right">
                    {marketShare.brazil?.export_total
                      ? ((p.value / marketShare.brazil.export_total) * 100).toFixed(1)
                      : "—"}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

function MacroKpi({
  label, value, sub, icon: Icon, color,
}: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "red" | "blue" | "amber";
}) {
  const colorMap = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  };
  const c = colorMap[color];

  return (
    <div className={cn("rounded-xl border p-3 bg-slate-900/50", c.border)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-slate-400">{label}</span>
        <Icon className={cn("w-3.5 h-3.5", c.text)} />
      </div>
      <div className={cn("text-base font-bold", c.text)}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}
