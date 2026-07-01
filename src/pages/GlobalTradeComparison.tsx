"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Loader2, Globe, TrendingUp, TrendingDown,
  DollarSign, BarChart3, AlertCircle, Target, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import { useSeo } from "@/hooks/use-seo";
import { cn } from "@/lib/utils";

const API = "/api/intel/global";

interface BrazilMacro {
  gdp?: number; gdp_growth?: number; population?: number;
  exports?: number; imports?: number;
}

interface PartnerData {
  country: string; value: number; sharePct: number;
}

interface MarketShareData {
  ncm: string; year: number;
  brazil: { export_total: number };
  partners: PartnerData[];
}

interface CountryComparison {
  code: string; name: string; flag: string;
  gdp: number; gdp_growth: number; exports: number; imports: number;
  population: number;
}

const COMPETITORS = [
  { code: "BRA", name: "Brasil", flag: "🇧🇷", color: "#009c3b" },
  { code: "CHN", name: "China", flag: "🇨🇳", color: "#de2910" },
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", color: "#3b82f6" },
  { code: "DEU", name: "Alemanha", flag: "🇩🇪", color: "#f59e0b" },
];

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("pt-BR");
}

export default function GlobalTradeComparison() {
  useSeo({
    title: "Comparador Global — TRADEXA",
    description: "Compare o desempenho do Brasil em qualquer NCM com os principais concorrentes globais: China, EUA e Alemanha.",
    keywords: "comparação global, concorrência, market share, NCM, Brasil, China, EUA, Alemanha, tradexa",
  });

  const [ncm, setNcm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountryComparison[]>([]);
  const [marketShare, setMarketShare] = useState<MarketShareData | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [brazilMacro, setBrazilMacro] = useState<BrazilMacro | null>(null);

  const handleSearch = useCallback(async () => {
    const cleanNcm = ncm.replace(/\D/g, "").slice(0, 6);
    if (cleanNcm.length < 4) {
      setError("Digite pelo menos 4 dígitos do NCM"); return;
    }

    setLoading(true); setError(null);
    setCountries([]); setMarketShare(null);

    try {
      // Fetch all data in parallel
      const results = await Promise.allSettled([
        fetch(`${API}/market-share/${cleanNcm}`).then(r => r.json()),
        fetch(`${API}/worldbank/country/BRA`).then(r => r.json()),
        fetch(`${API}/worldbank/country/CHN`).then(r => r.json()),
        fetch(`${API}/worldbank/country/USA`).then(r => r.json()),
        fetch(`${API}/worldbank/country/DEU`).then(r => r.json()),
        fetch(`${API}/bcb/exchange-rate`).then(r => r.json()),
      ]);

      const ms = results[0].status === "fulfilled" ? results[0].value as MarketShareData : null;
      const bra = results[1].status === "fulfilled" ? results[1].value as BrazilMacro : null;
      const chn = results[2].status === "fulfilled" ? results[2].value as BrazilMacro : null;
      const usa = results[3].status === "fulfilled" ? results[3].value as BrazilMacro : null;
      const deu = results[4].status === "fulfilled" ? results[4].value as BrazilMacro : null;

      setMarketShare(ms);
      setBrazilMacro(bra);

      if (results[5].status === "fulfilled") {
        const d = results[5].value as any;
        setExchangeRate(typeof d === "object" ? Number(d.value || d.valor || 0) : null);
      }

      const comps: CountryComparison[] = [
        { code: "BRA", name: "Brasil", flag: "🇧🇷", gdp: bra?.gdp || 0, gdp_growth: bra?.gdp_growth || 0, exports: bra?.exports || 0, imports: bra?.imports || 0, population: bra?.population || 0 },
        { code: "CHN", name: "China", flag: "🇨🇳", gdp: chn?.gdp || 0, gdp_growth: chn?.gdp_growth || 0, exports: chn?.exports || 0, imports: chn?.imports || 0, population: chn?.population || 0 },
        { code: "USA", name: "Estados Unidos", flag: "🇺🇸", gdp: usa?.gdp || 0, gdp_growth: usa?.gdp_growth || 0, exports: usa?.exports || 0, imports: usa?.imports || 0, population: usa?.population || 0 },
        { code: "DEU", name: "Alemanha", flag: "🇩🇪", gdp: deu?.gdp || 0, gdp_growth: deu?.gdp_growth || 0, exports: deu?.exports || 0, imports: deu?.imports || 0, population: deu?.population || 0 },
      ];
      setCountries(comps);
    } catch (e: any) {
      setError(e.message || "Erro ao buscar dados");
    }
    setLoading(false);
  }, [ncm]);

  // Chart data for export comparison
  const exportChartData = countries.length > 0 ? countries.map(c => ({
    name: c.name,
    Exportações: c.exports,
    PIB: c.gdp,
    shortName: c.code,
  })) : [];

  // Partners data for bar chart
  const partnersChart = marketShare?.partners?.slice(0, 10) || [];

  // Brazil's share of top competitor exports
  const brazilExportShare = countries.length > 0 && marketShare?.brazil?.export_total
    ? countries.filter(c => c.code !== "BRA").map(c => ({
        country: c.name,
        flag: c.flag,
        totalExports: c.exports,
        brazilNcmExport: marketShare.brazil.export_total,
        brazilShareOfCompetitor: c.exports > 0
          ? ((marketShare.brazil.export_total / c.exports) * 100).toFixed(2)
          : "0.00",
      }))
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Globe className="w-6 h-6 text-[#D80E16]" />
          Comparador Global
        </h1>
        <p className="text-sm text-slate-600">
          Compare o desempenho do Brasil em qualquer NCM com China, EUA e Alemanha. Veja market share, indicadores macro e posicionamento competitivo.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="flex-1">
            <Input
              placeholder="NCM (ex: 3004, 8471)..."
              value={ncm}
              onChange={e => setNcm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="h-12 text-base font-mono"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#D80E16] hover:bg-[#b80c12] text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Comparar
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Results */}
      {countries.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Brazil Macro Bar */}
          {brazilMacro && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-medium text-slate-500">Câmbio USD/BRL</span>
                <div className={cn("text-lg font-bold", exchangeRate && exchangeRate > 5.5 ? "text-red-600" : "text-emerald-600")}>
                  R$ {exchangeRate?.toFixed(3) || "—"}
                </div>
                <span className="text-[10px] text-slate-400">PTAX BCB</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[10px] font-medium text-slate-500">Exportação NCM</span>
                <div className="text-lg font-bold text-slate-800">
                  {marketShare?.brazil?.export_total ? formatCurrency(marketShare.brazil.export_total) : "—"}
                </div>
                <span className="text-[10px] text-slate-400">{ncm}</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-emerald-50 p-3">
                <span className="text-[10px] font-medium text-emerald-600">Exportações Brasil</span>
                <div className="text-lg font-bold text-emerald-700">
                  {brazilMacro.exports ? formatCurrency(brazilMacro.exports) : "—"}
                </div>
                <span className="text-[10px] text-slate-400">total</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-blue-50 p-3">
                <span className="text-[10px] font-medium text-blue-600">Crescimento PIB</span>
                <div className={cn("text-lg font-bold", (brazilMacro.gdp_growth || 0) > 0 ? "text-emerald-600" : "text-red-600")}>
                  {brazilMacro.gdp_growth?.toFixed(1) || "—"}%
                </div>
                <span className="text-[10px] text-slate-400">Brasil</span>
              </div>
            </div>
          )}

          {/* Competitor Comparison Table */}
          <Card className="rounded-2xl border border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D80E16]" />
                Comparação entre Países
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 text-[10px] font-bold text-slate-500 uppercase">Indicador</th>
                      {COMPETITORS.map(c => (
                        <th key={c.code} className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase">
                          {c.flag} {c.code}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2.5 pr-4 text-xs text-slate-600 font-medium">PIB</td>
                      {countries.map(c => (
                        <td key={c.code} className="text-right py-2.5 px-3 text-xs font-bold text-slate-800">
                          {fmtNumber(c.gdp)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2.5 pr-4 text-xs text-slate-600 font-medium">Crescimento PIB</td>
                      {countries.map(c => (
                        <td key={c.code} className={cn("text-right py-2.5 px-3 text-xs font-bold",
                          c.gdp_growth > 0 ? "text-emerald-600" : "text-red-600"
                        )}>
                          {c.gdp_growth?.toFixed(1) || "—"}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2.5 pr-4 text-xs text-slate-600 font-medium">Exportações Totais</td>
                      {countries.map(c => (
                        <td key={c.code} className="text-right py-2.5 px-3 text-xs font-bold text-slate-800">
                          {fmtNumber(c.exports)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-2.5 pr-4 text-xs text-slate-600 font-medium">Importações Totais</td>
                      {countries.map(c => (
                        <td key={c.code} className="text-right py-2.5 px-3 text-xs font-bold text-slate-800">
                          {fmtNumber(c.imports)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 text-xs text-slate-600 font-medium">População</td>
                      {countries.map(c => (
                        <td key={c.code} className="text-right py-2.5 px-3 text-xs font-bold text-slate-800">
                          {fmtNumber(c.population)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Export Comparison Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl border border-slate-200">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  Exportações vs PIB
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={exportChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="shortName" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 9 }} tickFormatter={(v: number) => fmtNumber(v)} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(v: number) => [fmtNumber(v)]}
                    />
                    <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} />
                    <Bar dataKey="Exportações" fill="#D80E16" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="PIB" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Market Share Partners */}
            <Card className="rounded-2xl border border-slate-200">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  Top Destinos — NCM {ncm.replace(/\D/g, "").slice(0, 6)}
                </h3>
                {partnersChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={partnersChart} layout="vertical" margin={{ left: 0, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 9 }} tickFormatter={(v: number) => fmtNumber(v)} />
                      <YAxis dataKey="country" type="category" tick={{ fill: "#94a3b8", fontSize: 9 }} width={90} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        formatter={(v: number) => [formatCurrency(v), "Exportado"]}
                      />
                      <Bar dataKey="value" fill="#D80E16" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400 py-8 text-center">Sem dados de destino para este NCM</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Brazil's NCM share vs competitor exports */}
          {brazilExportShare.length > 0 && (
            <Card className="rounded-2xl border border-slate-200">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#D80E16]" />
                  Market Share Relativo
                  <span className="text-[10px] font-normal text-slate-400 ml-1">
                    (quanto as exportações brasileiras deste NCM representam das exportações totais de cada concorrente)
                  </span>
                </h3>
                <div className="space-y-2">
                  {brazilExportShare.map(item => (
                    <div key={item.country} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-50">
                      <span className="text-lg">{item.flag}</span>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-slate-800">{item.country}</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Exportações totais: {fmtNumber(item.totalExports)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-[#D80E16]">{item.brazilShareOfCompetitor}%</div>
                        <div className="text-[10px] text-slate-400">
                          vs export. {item.country === "China" ? "CHN" : item.country === "Alemanha" ? "DEU" : item.country === "Estados Unidos" ? "EUA" : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
