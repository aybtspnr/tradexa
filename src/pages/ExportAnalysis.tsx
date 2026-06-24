import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowUpDown,
  MapPin,
  Package,
  Loader2,
  Info,
} from "lucide-react";

/* ── Countries (COMEXSTAT numeric codes) ── */
const COUNTRIES = [
  { name: "Estados Unidos", code: "249" },
  { name: "China", code: "243" },
  { name: "Argentina", code: "160" },
  { name: "Alemanha", code: "105" },
  { name: "Itália", code: "400" },
  { name: "França", code: "309" },
  { name: "Japão", code: "411" },
  { name: "Reino Unido", code: "538" },
  { name: "Bélgica", code: "196" },
  { name: "Canadá", code: "226" },
  { name: "Chile", code: "239" },
  { name: "México", code: "452" },
];

const UF_NAMES: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AM: "Amazonas", AP: "Amapá", BA: "Bahia",
  CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás",
  MA: "Maranhão", MG: "Minas Gerais", MS: "Mato Grosso do Sul", MT: "Mato Grosso",
  PA: "Pará", PB: "Paraíba", PE: "Pernambuco", PI: "Piauí", PR: "Paraná",
  RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RO: "Rondônia", RR: "Roraima",
  RS: "Rio Grande do Sul", SC: "Santa Catarina", SE: "Sergipe", SP: "São Paulo",
  TO: "Tocantins",
};

const COMEX_BASE = "https://api-comexstat.mdic.gov.br/general";

/* ── Helpers ── */
function fmtUSD(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

function monthLabel(m: string): string {
  const map: Record<string, string> = {
    "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
    "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
    "09": "Set", "10": "Out", "11": "Nov", "12": "Dez",
  };
  return map[m] || m;
}

/* ── Types ── */
interface NcmData {
  ncm: string;
  ncmDesc: string;
  fob: number;
}

interface StateData {
  state: string;
  stateName: string;
  fob: number;
}

interface MonthData {
  month: string;
  fob: number;
}

interface AnalysisData {
  country: string;
  topNcms: NcmData[];
  states: StateData[];
  monthly: MonthData[];
  trend: "up" | "down" | "stable";
  trendPct: number;
}

/* ── COMEXSTAT fetcher with retry ── */
async function fetchComex(
  details: string[],
  countryCode: string,
  year: string
): Promise<any[]> {
  const body = {
    flow: "export",
    period: { from: `${year}-01`, to: `${year}-12` },
    details,
    filters: [{ filter: "country", values: [countryCode] }],
  };

  const res = await fetch(COMEX_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `COMEXSTAT ${res.status}`);
  }

  const data = await res.json();
  return data?.data?.list || [];
}

/* ── Parse NCM ── */
function parseNcm(rows: any[]): NcmData[] {
  const map: Record<string, { desc: string; fob: number }> = {};
  for (const r of rows) {
    const ncm = String(r.ncm || r.coNcm || "").trim();
    const desc = String(r.ncmDescription || r.ncm_description || r.ncmDesc || r.ncm || "").trim();
    const fob = Number(r.metricFOB || 0);
    if (!ncm || fob <= 0) continue;
    if (!map[ncm]) map[ncm] = { desc: desc || ncm, fob: 0 };
    map[ncm].fob += fob;
  }
  return Object.entries(map)
    .map(([ncm, v]) => ({ ncm, ncmDesc: v.desc, fob: v.fob }))
    .sort((a, b) => b.fob - a.fob)
    .slice(0, 10);
}

/* ── Parse State ── */
function parseState(rows: any[]): StateData[] {
  const map: Record<string, number> = {};
  for (const r of rows) {
    const st = String(r.state || r.uf || "").trim().toUpperCase();
    const fob = Number(r.metricFOB || 0);
    if (!st || fob <= 0) continue;
    map[st] = (map[st] || 0) + fob;
  }
  return Object.entries(map)
    .map(([state, fob]) => ({
      state,
      stateName: UF_NAMES[state] || state,
      fob,
    }))
    .sort((a, b) => b.fob - a.fob);
}

/* ── Parse Monthly ── */
function parseMonthly(rows: any[]): MonthData[] {
  const map: Record<string, number> = {};
  for (const r of rows) {
    const m = String(r.month || "").padStart(2, "0");
    const fob = Number(r.metricFOB || 0);
    if (!m || fob <= 0) continue;
    map[m] = (map[m] || 0) + fob;
  }
  const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  return sorted.map(([month, fob]) => ({
    month: monthLabel(month),
    fob,
  }));
}

/* ── Trend calc ── */
function calcTrend(monthly: MonthData[]): { trend: "up" | "down" | "stable"; pct: number } {
  if (monthly.length < 3) return { trend: "stable", pct: 0 };
  const last = monthly[monthly.length - 1].fob;
  const prev = monthly[monthly.length - 2].fob;
  const older = monthly[monthly.length - 3].fob;
  const avgPrev = (prev + older) / 2;
  if (avgPrev === 0) return { trend: "stable", pct: 0 };
  const pct = ((last - avgPrev) / avgPrev) * 100;
  if (pct > 5) return { trend: "up", pct };
  if (pct < -5) return { trend: "down", pct };
  return { trend: "stable", pct };
}

export default function ExportAnalysis() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year] = useState("2025");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      /* Sequential calls to respect rate limit (COMEXSTAT is strict) */
      const rowsNcm = await fetchComex(["country", "ncm"], selectedCountry.code, year);
      await new Promise((r) => setTimeout(r, 15000));
      const rowsState = await fetchComex(["country", "state"], selectedCountry.code, year);
      await new Promise((r) => setTimeout(r, 15000));
      const rowsMonth = await fetchComex(["country", "month"], selectedCountry.code, year);

      const topNcms = parseNcm(rowsNcm);
      const states = parseState(rowsState);
      const monthly = parseMonthly(rowsMonth);
      const { trend, pct } = calcTrend(monthly);

      setData({
        country: selectedCountry.name,
        topNcms,
        states,
        monthly,
        trend,
        trendPct: pct,
      });
    } catch (e: any) {
      setError(e.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, year]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Análise de Exportação
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Produtos, estados e tendências das exportações brasileiras por
            destino.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedCountry.code}
            onValueChange={(v) => {
              const c = COUNTRIES.find((x) => x.code === v);
              if (c) setSelectedCountry(c);
            }}
          >
            <SelectTrigger className="w-[200px] rounded-xl border-slate-200">
              <SelectValue placeholder="Selecione o país" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={load}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              O serviço possui limitação de requisições. Aguarde alguns
              segundos e tente novamente.
            </p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Trend alert */}
          <Card
            className={`rounded-2xl border-l-4 shadow-sm ${
              data.trend === "up"
                ? "border-l-emerald-500 bg-emerald-50"
                : data.trend === "down"
                ? "border-l-red-500 bg-red-50"
                : "border-l-slate-400 bg-slate-50"
            }`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              {data.trend === "up" ? (
                <TrendingUp className="h-6 w-6 text-emerald-600 shrink-0" />
              ) : data.trend === "down" ? (
                <TrendingDown className="h-6 w-6 text-red-600 shrink-0" />
              ) : (
                <Info className="h-6 w-6 text-slate-500 shrink-0" />
              )}
              <div>
                <p className="text-sm font-black text-slate-900">
                  Tendência: {" "}
                  {data.trend === "up"
                    ? "Em alta"
                    : data.trend === "down"
                    ? "Em queda"
                    : "Estável"}
                  {data.trendPct !== 0 && (
                    <span className="ml-1">
                      ({data.trendPct > 0 ? "+" : ""}
                      {data.trendPct.toFixed(1)}%)
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Comparação do último mês disponível com a média dos 2 meses
                  anteriores.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Monthly chart */}
          {data.monthly.length > 0 && (
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#D80E16]" />
                  Evolução Mensal — Brasil → {data.country}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={data.monthly}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis
                        tickFormatter={(v: number) => fmtUSD(v)}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        width={80}
                      />
                      <Tooltip
                        formatter={(value: number) => [fmtUSD(value), "FOB"]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="fob"
                        stroke="#D80E16"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#D80E16" }}
                        activeDot={{ r: 5 }}
                        name="Exportação FOB"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top NCMs */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#D80E16]" />
                  Top 10 Produtos Exportados
                </CardTitle>
                <p className="text-xs text-slate-600">
                  Brasil → {data.country} por valor FOB
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {data.topNcms.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Nenhum dado disponível.
                    </p>
                  )}
                  {data.topNcms.map((item, i) => (
                    <div
                      key={item.ncm}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black shrink-0 ${
                          i === 0
                            ? "bg-amber-100 text-amber-700"
                            : i === 1
                            ? "bg-slate-200 text-slate-700"
                            : i === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.ncmDesc}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          NCM {item.ncm}
                        </p>
                      </div>
                      <p className="text-xs font-black text-slate-900 shrink-0">
                        {fmtUSD(item.fob)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top States */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#D80E16]" />
                  Estados Exportadores
                </CardTitle>
                <p className="text-xs text-slate-600">
                  Brasil → {data.country} por valor FOB
                </p>
              </CardHeader>
              <CardContent>
                {data.states.length > 0 && (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={data.states.slice(0, 15)}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          type="number"
                          tickFormatter={(v: number) => fmtUSD(v)}
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="stateName"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={{ stroke: "#e2e8f0" }}
                          width={75}
                        />
                        <Tooltip
                          formatter={(value: number) => [fmtUSD(value), "FOB"]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="fob"
                          fill="#D80E16"
                          radius={[0, 6, 6, 0]}
                          name="Exportação"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {data.states.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Nenhum dado disponível.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
