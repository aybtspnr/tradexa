import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { useSeo } from "@/hooks/use-seo";
import { AVAILABLE_YEARS, DEFAULT_YEAR } from "@/lib/utils";

interface MonthlyData {
  period: string;
  value: number;
  qty: number;
  month_label: string;
}

interface SeasonalityResponse {
  monthly_data: MonthlyData[];
  trend: string;
  average_monthly: number;
  peak_months: string[];
  source?: string;
}

export default function SeasonalAlerts() {
  useEffect(() => { document.title = "Sazonalidade | Tradexa"; }, []);

  const [ncm, setNcm] = useState("");
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MonthlyData[]>([]);
  const [trend, setTrend] = useState("stable");
  const [average, setAverage] = useState(0);
  const [peakMonths, setPeakMonths] = useState<string[]>([]);
  const [source, setSource] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const sh4 = ncm.replace(/\D/g, "").slice(0, 4).padEnd(4, "0") || "1201";
      const { data: resp, error } = await supabase.functions.invoke("cross-analyzer", {
        body: { action: "seasonality", ncm: sh4, year },
      });
      if (error) throw error;
      const payload = resp as any;
      if (payload && Array.isArray(payload.monthly_data)) {
        setData(payload.monthly_data as MonthlyData[]);
        setTrend(payload.trend || "stable");
        setAverage(payload.average_monthly || 0);
        setPeakMonths(payload.peak_months || []);
        setSource(payload.source || "api");
      } else {
        throw new Error("Resposta inválida");
      }
    } catch (e: any) {
      showError(e.message || "Erro ao carregar sazonalidade.");
      setData([]);
      setTrend("stable");
      setAverage(0);
      setPeakMonths([]);
      setSource("error");
    } finally {
      setLoading(false);
    }
  }

  const chartData = data.filter((d) => d.value > 0);

  const trendIcon =
    trend === "up" ? <TrendingUp className="w-5 h-5 text-emerald-500" /> :
    trend === "down" ? <TrendingDown className="w-5 h-5 text-red-500" /> :
    <Minus className="w-5 h-5 text-slate-600" />;

  useSeo({
    title: "Sazonalidade de Exportação — Brasil para EUA",
    description: "Preveja picos de demanda sazonal no comércio exterior Brasil-EUA. Análise de sazonalidade por NCM e calendário de importação americana.",
    keywords: "sazonalidade exportação Brasil, pico demanda, previsão comércio exterior",
  });

  return (
    
      <div className="space-y-6">
        <PageHeader
          title="Sazonalidade de Exportação"
          subtitle="Análise de picos sazonais por NCM/SH4"
          variant="red"
        />

        <Card className="border border-slate-200 rounded-2xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-1 flex-1">
                <label htmlFor="ncm-seasonal" className="text-xs font-bold text-slate-600 uppercase tracking-wider">NCM / SH4</label>
                <Input id="ncm-seasonal" value={ncm} onChange={(e) => setNcm(e.target.value)} placeholder="1201 (4 dígitos) — deixe vazio para soja" className="h-11 rounded-xl border-2" />
              </div>
              <div className="space-y-1">
                <label htmlFor="ano-seasonal" className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ano</label>
                <select id="ano-seasonal" value={year} onChange={(e) => setYear(e.target.value)} className="h-11 px-3 rounded-xl border-2 border-slate-200 bg-white font-medium">
                    {AVAILABLE_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <Button type="button" onClick={loadData} disabled={loading} className="h-11 self-end rounded-xl bg-[#D80E16] hover:bg-[#E50716] text-white font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analisar"}
              </Button>
            </div>
            <p className="text-xs text-slate-600">Dica: informe os 4 primeiros dígitos do NCM (ex: 1201 para soja, 0901 para café).</p>
          </CardContent>
        </Card>

        {source === "error" && (
          <Card className="border border-slate-200 rounded-2xl">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Nenhum dado disponível. Tente novamente mais tarde.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-slate-200 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D80E16]/10 flex items-center justify-center">{trendIcon}</div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Tendência</p>
                  <p className="text-lg font-black text-slate-900">
                    {trend === "up" ? "Crescente" : trend === "down" ? "Declinante" : "Estável"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Meses de Pico</p>
                  <p className="text-lg font-black text-slate-900">{peakMonths.length > 0 ? peakMonths.join(", ") : "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Média Mensal (US$ FOB)</p>
                  <p className="text-lg font-black text-slate-900">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(average)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-slate-200 rounded-2xl">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Série Temporal — Valor Mensal FOB (US$)</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number) => [new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(v)), "Valor FOB"]} />
                  <Line type="monotone" dataKey="value" stroke="#D80E16" strokeWidth={2.5} dot={{ r: 3, fill: "#D80E16" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16 text-slate-600">Nenhum dado para o período selecionado. Clique em Analisar.</div>
            )}
          </CardContent>
        </Card>
      </div>
    
  );
}