"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Loader2, Globe, DollarSign, BarChart3,
  MapPin, AlertCircle, Target, Users, TrendingUp,
  Award, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useSeo } from "@/hooks/use-seo";
import { cn } from "@/lib/utils";
import GlobalMarketSection from "@/components/intel/GlobalMarketSection";

const API = "/api/intel";

interface CompanyCompact {
  nome: string;
  cnpj?: string;
  cnpj_basico?: string;
  cidade?: string;
  uf?: string;
  score: number;
  estimated_fob?: number;
  estimated_kg?: number;
  flow?: string;
}

interface CountryShare {
  country: string;
  companies: number;
  fobTotal: number;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export default function RadarConcorrencia() {
  useSeo({
    title: "Radar de Concorrência — TRADEXA",
    description: "Identifique concorrentes brasileiros por NCM e mercado de destino. Análise de market share, players e oportunidades.",
    keywords: "concorrência, análise competitiva, NCM, exportadores, importadores, market share, tradexa",
  });

  const [ncm, setNcm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyCompact[]>([]);
  const [marketData, setMarketData] = useState<{ partners: { country: string; value: number }[]; total: number } | null>(null);

  const handleSearch = useCallback(async () => {
    const cleanNcm = ncm.replace(/\D/g, "").slice(0, 8);
    if (cleanNcm.length < 4) {
      setError("Digite pelo menos 4 dígitos do NCM");
      return;
    }

    setLoading(true);
    setError(null);
    setCompanies([]);
    setMarketData(null);

    try {
      // Fetch companies from scored-companies + real-companies
      const [scoredRes, realRes, shareRes] = await Promise.allSettled([
        fetch(`${API}/ncm/${cleanNcm}/scored-companies?flow=export&limit=50`),
        fetch(`${API}/ncm/${cleanNcm}/real-companies?flow=export&limit=50`),
        fetch(`/api/intel/global/market-share/${cleanNcm}`),
      ]);

      // Merge companies
      const allCompanies: CompanyCompact[] = [];

      if (scoredRes.status === "fulfilled" && scoredRes.value.ok) {
        const data = await scoredRes.value.json();
        if (data.companies) allCompanies.push(...data.companies.map((c: any) => ({
          nome: c.nome || c.razao_social || "N/A",
          cnpj: c.cnpj || c.cnpj_basico,
          cnpj_basico: c.cnpj_basico,
          cidade: c.municipio || c.nome_municipio,
          uf: c.uf,
          score: c.confidence_score || c.score || 0,
          estimated_fob: c.estimated_fob_export || 0,
          estimated_kg: c.estimated_kg_export || 0,
          flow: "export",
        })));
      }

      if (realRes.status === "fulfilled" && realRes.value.ok) {
        const data = await realRes.value.json();
        if (data.companies) allCompanies.push(...data.companies.map((c: any) => ({
          nome: c.nome || c.razao_social || "N/A",
          cnpj: c.cnpj || c.cnpj_basico,
          cnpj_basico: c.cnpj_basico,
          cidade: c.municipio || c.nome_municipio,
          uf: c.uf,
          score: data.confidence_score || c.score || 100,
          estimated_fob: c.estimated_fob_export || 0,
          estimated_kg: c.estimated_kg_export || 0,
          flow: "export",
        })));
      }

      // Deduplicate by CNPJ
      const seen = new Set<string>();
      const deduped = allCompanies.filter(c => {
        const key = c.cnpj || c.nome;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setCompanies(deduped.sort((a, b) => b.score - a.score).slice(0, 30));

      // Market share data
      if (shareRes.status === "fulfilled" && shareRes.value.ok) {
        const data = await shareRes.value.json();
        if (data?.partners?.length) {
          setMarketData({
            partners: data.partners.slice(0, 15),
            total: data.brazil?.export_total || 0,
          });
        }
      }
    } catch (e: any) {
      setError(e.message || "Erro ao buscar dados");
    }
    setLoading(false);
  }, [ncm]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Target className="w-6 h-6 text-[#D80E16]" />
          Radar de Concorrência
        </h1>
        <p className="text-sm text-slate-600">
          Identifique quem são os exportadores brasileiros por NCM, para quais países vendem e qual o market share de cada um.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="flex-1">
            <Input
              placeholder="NCM (ex: 3004, 3926, 8471)..."
              value={ncm}
              onChange={e => setNcm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="h-12 text-base font-mono"
              maxLength={10}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#D80E16] hover:bg-[#b80c12] text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Analisar
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Results */}
      {companies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-medium text-slate-500 mb-1">Exportadores</div>
              <div className="text-lg font-black text-slate-900">{companies.length}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-emerald-50 p-3">
              <div className="text-[10px] font-medium text-emerald-600 mb-1">Score Médio</div>
              <div className="text-lg font-black text-emerald-700">
                {Math.round(companies.reduce((s, c) => s + c.score, 0) / companies.length)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-blue-50 p-3">
              <div className="text-[10px] font-medium text-blue-600 mb-1">Mercados</div>
              <div className="text-lg font-black text-blue-700">
                {marketData?.partners?.length || "—"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-amber-50 p-3">
              <div className="text-[10px] font-medium text-amber-600 mb-1">Volume Total</div>
              <div className="text-lg font-black text-amber-700">
                {marketData?.total ? formatCurrency(marketData.total) : "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Companies List */}
            <Card className="rounded-2xl border border-slate-200 lg:col-span-2">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D80E16]" />
                  Concorrentes — NCM {ncm.replace(/\D/g, "").slice(0, 8)}
                </h3>
                <div className="space-y-1">
                  {companies.slice(0, 20).map((c, i) => (
                    <div
                      key={c.cnpj || i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <span className={cn(
                        "w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center",
                        i < 3 ? "bg-[#D80E16]/10 text-[#D80E16]" : "bg-slate-100 text-slate-500"
                      )}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{c.nome}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          {c.cidade && <span>{c.cidade}{c.uf && ` - ${c.uf}`}</span>}
                          {c.estimated_fob && c.estimated_fob > 0 && (
                            <span className="font-bold text-slate-500">{formatCurrency(c.estimated_fob)}</span>
                          )}
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[10px] font-bold",
                        c.score >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        c.score >= 60 ? "bg-blue-50 text-blue-600 border-blue-200" :
                        "bg-slate-50 text-slate-500 border-slate-200"
                      )}>
                        {c.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Destinations */}
            <Card className="rounded-2xl border border-slate-200">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#D80E16]" />
                  Mercados de Destino
                </h3>
                {marketData?.partners ? (
                  <div className="space-y-1">
                    {marketData.partners.slice(0, 10).map((p, i) => (
                      <div key={p.country} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="flex-1 text-slate-700">{p.country}</span>
                        <span className="font-bold text-slate-800">{formatCurrency(p.value)}</span>
                        <span className="text-[9px] text-slate-400 w-10 text-right">
                          {marketData.total > 0 ? ((p.value / marketData.total) * 100).toFixed(1) : "—"}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">Sem dados de mercado para este NCM</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Market Chart */}
          {marketData?.partners && (
            <Card className="rounded-2xl border border-slate-200">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#D80E16]" />
                  Distribuição por Mercado
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={marketData.partners.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v: number) => formatCurrency(v)} />
                    <YAxis dataKey="country" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={100} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                      formatter={(v: number) => [formatCurrency(v), "Exportado"]}
                    />
                    <Bar dataKey="value" fill="#D80E16" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Global Market Context */}
          {ncm.replace(/\D/g, "").length >= 4 && (
            <GlobalMarketSection ncm={ncm.replace(/\D/g, "").slice(0, 6) || "3004"} />
          )}
        </motion.div>
      )}
    </div>
  );
}
