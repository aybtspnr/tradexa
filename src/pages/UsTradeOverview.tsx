"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Search, Loader2, Globe, TrendingUp, Package, ArrowRight,
  Flag, Activity, ArrowLeftRight, DollarSign, BarChart3, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { AVAILABLE_YEARS, DEFAULT_YEAR } from "@/lib/utils";

interface CensusRecord {
  commodity: string;
  country: string;
  value_month: number;
  value_year: number;
  qty_month: number;
  qty_year: number;
  year: string;
  month: string;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function UsTradeOverview() {
  const { consume } = useUsage();
  const [direction, setDirection] = useState<"br_to_usa" | "usa_to_br">("br_to_usa");
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<CensusRecord[]>([]);
  const [brasilRecords, setBrasilRecords] = useState<CensusRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [source, setSource] = useState("us-census-api");

  async function loadData() {
    const ok = await consume("search");
    if (!ok) return;
    setLoading(true);
    try {
      const modo = direction === "br_to_usa" ? "imports" : "exports";
      const { data, error } = await supabase.functions.invoke("us-census-trade", {
        body: { modo, cty_code: "3510", year, limit: "100" },
      });
      if (error) throw error;

      setRecords(data?.records || []);
      setBrasilRecords(data?.brasil_records || []);
      setSource(data?.source || "api");

      const count = (data?.brasil_records || []).length;
      if (count > 0) {
        if (data?.source === "us-census-api") {
          showSuccess(`${count} registros carregados`);
        } else {
          showSuccess(`${count} registros carregados`);
        }
      }
    } catch (e: any) {
      const msg = e.message || "";
      console.error("[UsTradeOverview] Erro:", msg);
      
      setRecords([]);
      setBrasilRecords([]);
      setSource("error");
      
      if (msg.includes("403") || msg.includes("Unauthorized") || msg.includes("API key")) {
        showError("Chave de API não configurada. Configure em Settings.");
      } else if (msg.includes("429")) {
        showError("Limite de requisições atingido. Tente novamente em alguns minutos.");
      } else {
        showError("Erro ao carregar dados. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [direction, year]);

  const filtered = brasilRecords.filter(r =>
    r.commodity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = brasilRecords.reduce((s, r) => s + r.value_month, 0);
  const totalQty = brasilRecords.reduce((s, r) => s + r.qty_month, 0);

  const top5 = filtered.slice(0, 5);
  const chartData = top5.map(r => ({
    name: r.commodity.substring(0, 25),
    value: r.value_month / 1_000_000,
  }));

  useSeo({
    title: "Brasil ↔ EUA — Análise de Fluxos Comerciais",
    description: "Cruzamento de dados de exportação brasileira e importação americana. Analise fluxos comerciais entre Brasil e Estados Unidos com dados atualizados atualizados.",
    keywords: "Brasil EUA comércio, cruzamento dados, exportação importação Brasil EUA",
  });

  return (
    
      <div className="space-y-6">
        <PageHeader
          title="Fluxo Comercial Brasil ↔ EUA"
          subtitle="Fluxo comercial Brasil ↔ EUA. Veja o que o Brasil exporta aos EUA e o que os EUA exportam ao Brasil."
          variant="red"
          badges={[
            { label: "Dados Oficiais", icon: <Flag className="w-3 h-3 mr-1" /> },
            { label: source === "us-census-api" ? "Dados Reais" : "Indisponível", icon: source === "us-census-api" ? <Activity className="w-3 h-3 mr-1 text-emerald-500" /> : <Activity className="w-3 h-3 mr-1 text-amber-500" /> },
          ]}
        />

        <Card className="border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setDirection("br_to_usa")}
                  className={`px-5 py-2.5 text-sm font-bold transition-all flex items-center gap-2 ${
                    direction === "br_to_usa" ? "bg-[#D80E16] text-white" : "bg-white text-slate-600"
                  }`}
                >
                  <Flag className="w-4 h-4" /> Brasil → EUA
                </button>
                <button
                  onClick={() => setDirection("usa_to_br")}
                  className={`px-5 py-2.5 text-sm font-bold transition-all flex items-center gap-2 ${
                    direction === "usa_to_br" ? "bg-blue-600 text-white" : "bg-white text-slate-600"
                  }`}
                >
                  <Flag className="w-4 h-4" /> EUA → Brasil
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600">Ano:</span>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-slate-200 bg-white font-medium text-sm"
                >
                  {AVAILABLE_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <Button onClick={loadData} disabled={loading} className="bg-[#D80E16] hover:bg-[#E50716] text-white rounded-xl h-10 px-4">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Valor Total (mês)</p>
                  <p className="text-xl font-black text-slate-900">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Quantidade (mês)</p>
                  <p className="text-xl font-black text-slate-900">{formatNumber(totalQty)} kg</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D80E16]/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#D80E16]" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Produtos</p>
                  <p className="text-xl font-black text-slate-900">{brasilRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {chartData.length > 0 && (
          <Card className="border border-slate-200 rounded-2xl shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D80E16]" />
                Top 5 Produtos — Valor em USD (milhões)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={180} />
                  <Tooltip
                    formatter={(value: any) => [`$${value.toFixed(2)}M`, "Valor"]}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="value" fill="#D80E16" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="border border-slate-200 rounded-2xl shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-[#D80E16]" />
                {direction === "br_to_usa" ? "Brasil exporta → EUA importa" : "EUA exporta → Brasil importa"}
              </h3>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar produto..."
                  className="pl-9 h-10 rounded-xl border-2"
                />
              </div>
            </div>

            {loading && !records.length && (
              <div className="flex items-center justify-center py-20 text-slate-600">
                <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando dados...
              </div>
            )}

            {source === "error" && (
              <Card className="border border-slate-200 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Nenhum dado disponível. Tente novamente mais tarde.</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {filtered.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#D80E16]/10 flex items-center justify-center text-[#D80E16] font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{r.commodity}</p>
                    <p className="text-xs text-slate-600">{r.country}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-600 text-sm">{formatCurrency(r.value_month)}</p>
                    <p className="text-xs text-slate-600">{formatNumber(r.qty_month)} {r.qty_month ? 'kg' : 'un'}/mês</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {!loading && filtered.length === 0 && (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-bold text-slate-700">Nenhum produto encontrado</p>
                <p className="text-sm text-slate-600">Ajuste os filtros ou tente outro período.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}