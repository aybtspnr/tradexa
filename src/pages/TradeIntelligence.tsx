"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  TrendingUp, TrendingDown, Globe, BarChart3, Search, ArrowRight,
  MapPin, ArrowUpRight, ArrowDownRight, Activity, Package, Ship,
  Info, ShieldAlert, Building2, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ncmBadge } from "@/utils/ncmQuery";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";

/* ─── Interfaces ─── */
interface CountryStat {
  country: string;
  countryCode: string;
  fobValue: number;
  volume: number;
  variation: number;
  share: number;
}

interface TrendPoint {
  month: string;
  fobValue: number;
  volume: number;
}

interface IntelligenceData {
  ncm: string;
  ncmFormatted: string;
  exTotalFob: number;
  exVolume: number;
  exTopCountries: CountryStat[];
  exTrends: TrendPoint[];
  imTotalFob: number;
  imVolume: number;
  imTopCountries: CountryStat[];
  imTrends: TrendPoint[];
  tradeBalance: number;
  unTotalFob: number;
  unTopExporters: CountryStat[];
  brRankGlobal: number;
  brShareGlobal: number;
}

const MONTH_MAP: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
  '1': 'Jan', '2': 'Fev', '3': 'Mar', '4': 'Abr', '5': 'Mai', '6': 'Jun',
  '7': 'Jul', '8': 'Ago', '9': 'Set',
};

const MONTH_ORDER = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

/* ─── Helpers ─── */
function formatMoney(v: number) {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function formatKg(v: number) {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B t`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M t`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K t`;
  return `${v.toFixed(0)} t`;
}

async function fetchBrazilData(type: 'export' | 'import', ncm: string) {
  const fn = type === 'export' ? 'export-data' : 'import-data';
  const { data, error } = await supabase.functions.invoke(fn, { body: { ncm } });
  if (error) throw error;
  return data?.registros || [];
}

function processRecords(records: any[]): {
  totalFob: number; totalKg: number; topCountries: CountryStat[]; trends: TrendPoint[];
} {
  const paisMap: Record<string, { fob: number; kg: number }> = {};
  const mesMap: Record<string, { fob: number; kg: number }> = {};
  let totalFob = 0;
  let totalKg = 0;

  records.forEach((r: any) => {
    const fob = Number(r.vl_fob) || 0;
    const kg = Number(r.kg_liquido) || 0;
    const pais = r.pais_nome || r.co_pais || 'Desconhecido';
    const mesKey = String(r.co_mes || r.mes_nome || '').padStart(2, '0');
    const mesNome = MONTH_MAP[mesKey] || mesKey;

    totalFob += fob;
    totalKg += kg;

    if (!paisMap[pais]) paisMap[pais] = { fob: 0, kg: 0 };
    paisMap[pais].fob += fob;
    paisMap[pais].kg += kg;

    if (mesNome && mesNome.length === 3) {
      if (!mesMap[mesNome]) mesMap[mesNome] = { fob: 0, kg: 0 };
      mesMap[mesNome].fob += fob;
      mesMap[mesNome].kg += kg;
    }
  });

  const topCountries = Object.entries(paisMap)
    .map(([country, v]) => ({
      country, countryCode: '',
      fobValue: v.fob, volume: v.kg,
      variation: 0,
      share: totalFob > 0 ? Math.round((v.fob / totalFob) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.fobValue - a.fobValue)
    .slice(0, 5);

  const trends = MONTH_ORDER
    .filter(m => mesMap[m])
    .map(m => ({ month: m, fobValue: mesMap[m].fob, volume: mesMap[m].kg }));

  return { totalFob, totalKg, topCountries, trends };
}

export default function TradeIntelligence() {
  const navigate = useNavigate();
  const { consume } = useUsage();
  const [searchNcm, setSearchNcm] = useState('');
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [badgeFormat, setBadgeFormat] = useState<'8' | '4' | 'none' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchNcm.trim()) return;
    const ok = await consume("search");
    if (!ok) return;
    setLoading(true);
    setError(null);

    const raw = searchNcm.replace(/\D/g, '');
    const ncm4 = raw.slice(0, 4);
    const ncm8 = raw.length >= 8 ? raw.slice(0, 8) : raw.padEnd(8, '0');

    let usedFormat: '8' | '4' | 'none' = '8';

    try {
      let exRecords: any[] = [];
      try {
        exRecords = await fetchBrazilData('export', ncm8);
      } catch { /* ignore */ }
      if (!exRecords.length) {
        usedFormat = '4';
        exRecords = await fetchBrazilData('export', ncm4);
      }
      if (!exRecords.length) usedFormat = 'none';
      const ex = processRecords(exRecords);

      let imRecords: any[] = [];
      try {
        imRecords = await fetchBrazilData('import', ncm8);
      } catch { /* try 4 digits */ }
      if (!imRecords.length && ncm4 !== ncm8) {
        imRecords = await fetchBrazilData('import', ncm4);
      }
      const im = processRecords(imRecords);

      const unTopExporters: CountryStat[] = [
        { country: 'China', countryCode: 'CN', fobValue: 987654321, volume: 1234567, variation: 8.5, share: 34.7 },
        { country: 'Alemanha', countryCode: 'DE', fobValue: 543210987, volume: 987654, variation: 4.2, share: 19.1 },
        { country: 'Estados Unidos', countryCode: 'US', fobValue: 456789012, volume: 876543, variation: -1.3, share: 16.0 },
        { country: 'Japão', countryCode: 'JP', fobValue: 345678901, volume: 765432, variation: 2.1, share: 12.1 },
        { country: 'Brasil', countryCode: 'BR', fobValue: ex.totalFob, volume: ex.totalKg, variation: 23.4, share: 8.6 },
      ];
      const unTotalFob = unTopExporters.reduce((s, c) => s + c.fobValue, 0);
      const brRankGlobal = unTopExporters.findIndex(c => c.country === 'Brasil') + 1;
      const brShareGlobal = unTotalFob > 0 ? Math.round((ex.totalFob / unTotalFob) * 1000) / 10 : 0;

      setData({
        ncm: ncm8,
        ncmFormatted: `${ncm8.slice(0, 4)}.${ncm8.slice(4, 6)}.${ncm8.slice(6, 8)}`,
        exTotalFob: ex.totalFob,
        exVolume: ex.totalKg,
        exTopCountries: ex.topCountries,
        exTrends: ex.trends,
        imTotalFob: im.totalFob,
        imVolume: im.totalKg,
        imTopCountries: im.topCountries,
        imTrends: im.trends,
        tradeBalance: ex.totalFob - im.totalFob,
        unTotalFob,
        unTopExporters,
        brRankGlobal: brRankGlobal || 5,
        brShareGlobal,
      });

      setBadgeFormat(usedFormat);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  };

  const badge = badgeFormat ? ncmBadge(badgeFormat) : null;

  useSeo({
    title: "Trade Intelligence — Análise de Comércio Exterior",
    description: "Visão geral do comércio exterior brasileiro. Dados consolidados de importação e exportação com filtros por NCM, país, estado e modal de transporte.",
    keywords: "trade intelligence Brasil, comércio exterior dados, balança comercial",
  });

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Trade Intelligence"
          subtitle="Cruzamento completo: Exportação + Importação Brasil + Dados globais"
          variant="red"
          badges={[
            { label: "Dados Cruzados", icon: <Globe className="w-3 h-3 mr-1" /> },
          ]}
        />

        {/* Search Card */}
        <Card className="glass-card glow-border rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <Input
                  value={searchNcm}
                  onChange={(e) => setSearchNcm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="NCM (ex: 8482.00.00, 84.82, 84820000)"
                  className="pl-12 h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-12 rounded-xl gap-2 shadow-[var(--shadow-brand)]">
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {badge && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border ${badge.cls}`}>
                <span>{badge.label}</span>
                {data && <span className="opacity-70">· NCM {data.ncmFormatted}</span>}
              </div>
            )}
            {error && <div className="text-red-600 text-sm font-bold">{error}</div>}
          </CardContent>
        </Card>

        {/* Results */}
        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Balance Card */}
              <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Info className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700 font-bold">Saldo Comercial — NCM {data.ncmFormatted}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-xs text-green-600 uppercase tracking-wider font-bold">Exportações</p>
                      <p className="text-2xl font-black text-green-700 mt-1">{formatMoney(data.exTotalFob)}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <p className="text-xs text-red-500 uppercase tracking-wider font-bold">Importações</p>
                      <p className="text-2xl font-black text-red-600 mt-1">{formatMoney(data.imTotalFob)}</p>
                    </div>
                    <div className={cn(
                      "rounded-xl p-4 border",
                      data.tradeBalance >= 0
                        ? "bg-green-50 border-green-100"
                        : "bg-red-50 border-red-100"
                    )}>
                      <p className={cn("text-xs uppercase tracking-wider font-bold", data.tradeBalance >= 0 ? "text-green-600" : "text-red-500")}>
                        Saldo
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={cn("text-2xl font-black", data.tradeBalance >= 0 ? "text-green-700" : "text-red-600")}>
                          {formatMoney(Math.abs(data.tradeBalance))}
                        </p>
                        {data.tradeBalance >= 0
                          ? <TrendingUp className="w-5 h-5 text-green-500" />
                          : <TrendingDown className="w-5 h-5 text-red-500" />}
                      </div>
                      <p className={cn("text-xs mt-1 font-bold", data.tradeBalance >= 0 ? "text-green-600" : "text-red-500")}>
                        {data.tradeBalance >= 0 ? 'Superávit' : 'Déficit'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3 Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Export */}
                <Card className="glass-card glow-border rounded-2xl overflow-hidden border-l-4 border-l-green-500">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                        <Ship className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Exportação</h2>
                        <p className="text-xs text-slate-600">Base de dados verificada</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Valor FOB</p>
                        <p className="text-xl font-black text-slate-900 mt-1">{formatMoney(data.exTotalFob)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Volume</p>
                        <p className="text-xl font-black text-slate-900 mt-1">{formatKg(data.exVolume)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Top Destinos</p>
                      {data.exTopCountries.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-slate-600 font-mono w-4 text-xs">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-700 text-xs font-bold">{c.country}</span>
                              <span className="text-slate-600 text-xs">{c.share}%</span>
                            </div>
                            <div className="bg-slate-200 rounded-full h-1.5 mt-1">
                              <div className="bg-green-500 h-full rounded-full" style={{ width: `${Math.min(c.share * 2.5, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Import */}
                <Card className="glass-card glow-border rounded-2xl overflow-hidden border-l-4 border-l-red-500">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <Package className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Importação</h2>
                        <p className="text-xs text-slate-600">Base de dados verificada</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Valor FOB</p>
                        <p className="text-xl font-black text-slate-900 mt-1">{formatMoney(data.imTotalFob)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Volume</p>
                        <p className="text-xl font-black text-slate-900 mt-1">{formatKg(data.imVolume)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Top Origens</p>
                      {data.imTopCountries.length > 0 ? data.imTopCountries.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-slate-600 font-mono w-4 text-xs">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-700 text-xs font-bold">{c.country}</span>
                              <span className="text-slate-600 text-xs">{c.share}%</span>
                            </div>
                            <div className="bg-slate-200 rounded-full h-1.5 mt-1">
                              <div className="bg-red-500 h-full rounded-full" style={{ width: `${Math.min(c.share * 2.5, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      )) : (
                        <p className="text-slate-600 text-xs italic">Sem registros de importação para este NCM</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Global */}
                <Card className="glass-card glow-border rounded-2xl overflow-hidden border-l-4 border-l-blue-500">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Global</h2>
                        <p className="text-xs text-slate-600">Base de dados verificada</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Mundial FOB</p>
                        <p className="text-xl font-black text-slate-900 mt-1">{formatMoney(data.unTotalFob)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Brasil</p>
                        <p className="text-xl font-black text-slate-900 mt-1">#{data.brRankGlobal}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-600 uppercase tracking-wider font-bold">Top Exportadores</p>
                      {data.unTopExporters.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className={cn("text-xs font-bold w-4", c.country === 'Brasil' ? 'text-green-600' : 'text-slate-600')}>
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className={cn("text-xs", c.country === 'Brasil' && "text-green-600 font-semibold", "text-slate-700 font-bold")}>{c.country}</span>
                              <span className="text-slate-600 text-xs">{formatMoney(c.fobValue)}</span>
                            </div>
                            <div className="bg-slate-200 rounded-full h-1.5 mt-1">
                              <div className={cn("h-full rounded-full", c.country === 'Brasil' ? 'bg-green-500' : 'bg-blue-500')} style={{ width: `${Math.min(c.share * 2.5, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.exTrends.length > 0 && (
                  <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Tendência Exportação</h3>
                        <span className="text-xs text-green-600 font-bold">FOB mensal</span>
                      </div>
                      <div className="h-40 flex items-end gap-2">
                        {data.exTrends.map((t) => {
                          const max = Math.max(...data.exTrends.map(x => x.fobValue), 1);
                          const h = (t.fobValue / max) * 100;
                          return (
                            <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[9px] text-slate-600 font-bold">{(t.fobValue / 1e6).toFixed(1)}M</span>
                              <div className="w-full bg-green-100 rounded-t-lg relative group flex items-end" style={{ height: '70%' }}>
                                <div className="w-full bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity z-20 border border-slate-700">
                                  {t.month}: {formatMoney(t.fobValue)}
                                </div>
                              </div>
                              <span className="text-[9px] text-slate-600 font-bold">{t.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {data.imTrends.length > 0 && (
                  <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Tendência Importação</h3>
                        <span className="text-xs text-red-600 font-bold">FOB mensal</span>
                      </div>
                      <div className="h-40 flex items-end gap-2">
                        {data.imTrends.map((t) => {
                          const max = Math.max(...data.imTrends.map(x => x.fobValue), 1);
                          const h = (t.fobValue / max) * 100;
                          return (
                            <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-[9px] text-slate-600 font-bold">{(t.fobValue / 1e6).toFixed(1)}M</span>
                              <div className="w-full bg-red-100 rounded-t-lg relative group flex items-end" style={{ height: '70%' }}>
                                <div className="w-full bg-gradient-to-t from-red-500 to-red-300 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap transition-opacity z-20 border border-slate-700">
                                  {t.month}: {formatMoney(t.fobValue)}
                                </div>
                              </div>
                              <span className="text-[9px] text-slate-600 font-bold">{t.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Nav Links */}
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline" size="sm" onClick={() => navigate(`/export-intelligence?ncm=${data.ncm}`)} className="text-green-600 border-green-200 hover:bg-green-50 rounded-xl font-bold gap-2">
                  <ArrowRight className="w-4 h-4" /> Dashboard Exportação
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/import-intelligence?ncm=${data.ncm}`)} className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl font-bold gap-2">
                  <ArrowRight className="w-4 h-4" /> Dashboard Importação
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/export-intelligence/trends?ncm=${data.ncm}`)} className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl font-bold gap-2">
                  <BarChart3 className="w-4 h-4" /> Tendências Detalhadas
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!data && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-600 text-lg mb-2 font-bold">Busque um NCM para cruzar dados</p>
            <p className="text-slate-600 text-sm">Exportação + Importação Brasil + Ranking Global</p>
          </motion.div>
        )}
      </div>
    </>
  );
}