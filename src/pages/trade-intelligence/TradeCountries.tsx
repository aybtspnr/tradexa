"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import TradeIntelligenceLayout, { TradeDirection } from "@/components/TradeIntelligenceLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Globe, DollarSign, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { showError } from "@/utils/toast";

const DIR_COLORS = { export: "#D80E16", import: "#2563EB" };
const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(v);
const formatNumber = (v: number) => v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : v >= 1e3 ? (v / 1e3).toFixed(1) + "K" : Math.round(v).toLocaleString("pt-BR");

interface Registro { pais_nome: string; vl_fob: number; kg_liquido: number; }

const TradeIntelligenceCountries = () => {
  const [direction, setDirection] = useState<TradeDirection>("export");
  const [searchNcm, setSearchNcm] = useState("");
  const [loading, setLoading] = useState(false);
  const [registros, setRegistros] = useState<Registro[]>([]);

  const edgeFn = direction === "export" ? "export-data" : "import-data";
  const color = DIR_COLORS[direction];

  const handleSearch = async () => {
    if (!searchNcm.trim()) { showError("Digite um código NCM."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(edgeFn, { body: { ncm: searchNcm.replace(/\D/g, "") } });
      if (error) throw error;
      setRegistros(data?.registros || []);
    } catch (err: any) { showError("Erro: " + err.message); }
    finally { setLoading(false); }
  };

  const countryData = useMemo(() => {
    const map = new Map<string, { fob: number; kg: number }>();
    registros.forEach(r => {
      const existing = map.get(r.pais_nome) || { fob: 0, kg: 0 };
      existing.fob += r.vl_fob;
      existing.kg += r.kg_liquido;
      map.set(r.pais_nome, existing);
    });
    return Array.from(map.entries())
      .map(([pais, val]) => ({ pais, fob: Math.round(val.fob), kg: Math.round(val.kg), share: 0 }))
      .sort((a, b) => b.fob - a.fob);
  }, [registros]);

  const totalFob = countryData.reduce((s, c) => s + c.fob, 0);
  const top10 = countryData.slice(0, 10).map(c => ({ ...c, share: totalFob > 0 ? (c.fob / totalFob) * 100 : 0 }));

  return (
    <TradeIntelligenceLayout title="Países" direction={direction} onDirectionChange={setDirection} showDirectionToggle>
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="NCM (ex: 09011110)" value={searchNcm} onChange={(e) => setSearchNcm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="h-11 rounded-xl border-slate-200 text-sm" />
              <Button onClick={handleSearch} disabled={loading} className="h-11 rounded-xl font-black text-sm gap-2" style={{ backgroundColor: color }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Buscando..." : "Analisar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {top10.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" /> Top 10 Países por Valor FOB
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top10} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"} />
                    <YAxis type="category" dataKey="pais" tick={{ fontSize: 10, fontWeight: 700 }} width={95} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="fob" fill={color} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {top10.map((c, i) => (
                <Card key={c.pais} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-600">#{i + 1}</span>
                          <p className="text-sm font-black text-slate-900">{c.pais}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-black" style={{ color }}>{formatCurrency(c.fob)}</span>
                          <span className="text-[10px] text-slate-600">{formatNumber(c.kg)} kg</span>
                        </div>
                      </div>
                      <Badge className="font-black text-xs" style={{ backgroundColor: `${color}15`, color }}>{c.share.toFixed(1)}%</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {registros.length === 0 && !loading && (
          <Card className="border-dashed border-slate-300 bg-slate-50 rounded-2xl">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Globe className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-black text-slate-700">Países de {direction === "export" ? "Destino" : "Origem"}</h3>
              <p className="text-sm text-slate-600 mt-2 max-w-md">Busque um NCM para ver a distribuição por país.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </TradeIntelligenceLayout>
  );
};

export default TradeIntelligenceCountries;
