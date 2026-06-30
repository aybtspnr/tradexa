import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, Globe, Building2, Anchor,
  ArrowRight, Percent, Ship, Search, BarChart3, Calendar, Sparkles,
  AlertTriangle, Loader2, MapPin, Navigation, ArrowLeftRight, Zap, Bell, Crown,
} from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { PLAN_LABELS } from "@/lib/usage-costs";
import type { PlanType } from "@/lib/usage-costs";
import GlobalAlertsPanel from "@/components/GlobalAlertsPanel";

/* ── Types ── */
interface KpiCard {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color: "red" | "blue" | "green" | "amber";
  loading?: boolean;
}

interface QuickAction {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  color: string;
}

/* ── Constants ── */
const QUICK_ACTIONS: QuickAction[] = [
  { to: "/ai-search", icon: Sparkles, label: "Classificar NCM", desc: "IA classifica qualquer produto", color: "#D80E16" },
  { to: "/global-tariff", icon: Percent, label: "Alíquotas", desc: "Tarifas de 30+ países", color: "#2563EB" },
  { to: "/importadores", icon: Building2, label: "Importadores", desc: "730K+ empresas globais", color: "#059669" },
  { to: "/maritime-freight-map", icon: Ship, label: "Frete Marítimo", desc: "Cotações CN→BR / BR→US", color: "#D97706" },
  { to: "/track-trace", icon: Navigation, label: "Track & Trace", desc: "Navios e aviões ao vivo", color: "#0891B2" },
  { to: "/us-trade", icon: ArrowLeftRight, label: "Brasil ↔ EUA", desc: "Análise bilateral completa", color: "#7C3AED" },
  { to: "/trade-intelligence", icon: BarChart3, label: "Análise Avançada", desc: "Dados de comércio exterior", color: "#0891B2" },
];

const COLOR_MAP: Record<string, { bg: string; text: string; icon: string; ring: string }> = {
  red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500", ring: "ring-red-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500", ring: "ring-blue-100" },
  green: { bg: "bg-green-50", text: "text-green-600", icon: "text-green-500", ring: "ring-green-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "text-amber-500", ring: "ring-amber-100" },
};

/* ── Helpers ── */
function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

/* ── Component ── */
export default function Dashboard() {
  useSeo({
    title: "Dashboard — Visão Geral do Comércio Exterior",
    description: "Dashboard completo com métricas de importação e exportação. Acompanhe tendências, variações e oportunidades do comércio exterior brasileiro.",
    keywords: "dashboard comércio exterior, métricas importação exportação, tradexa",
  });

  const navigate = useNavigate();
  const { profile } = useAuth();
  const plan = (profile?.plan_type || "essential") as PlanType;
  const planLabel = PLAN_LABELS[plan] || plan;

  const [totalImporters, setTotalImporters] = useState<number | null>(null);
  const [tariffCountries, setTariffCountries] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [hsChapters, setHsChapters] = useState<number | null>(null);
  const [topChapters, setTopChapters] = useState<{hs_chapter: string; description: string; count: number}[]>([]);
  const [topTariffCountries, setTopTariffCountries] = useState<{country: string; tariff_count: number}[]>([]);
  const [exchangeHistory, setExchangeHistory] = useState<{data: string; valor: string}[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const loading = totalImporters === null || tariffCountries === null || exchangeRate === null;

  /* ── Fetch KPIs ── */
  useEffect(() => {
    let cancelled = false;
    const errs: string[] = [];

    // 1. Importers count from VPS
    fetch("/api/vps/importadores/index")
      .then(r => r.json())
      .then((data: any[]) => {
        if (!cancelled) {
          const total = data.reduce((sum: number, c: any) => sum + (c.count || 0), 0);
          setTotalImporters(total);
          setHsChapters(data.length);
          setTopChapters(data.sort((a: any, b: any) => (b.count || 0) - (a.count || 0)).slice(0, 5));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTotalImporters(0);
          setHsChapters(0);
          errs.push("Importadores");
        }
      });

    // 2a. Tariff countries from VPS (detalhado com counts)
    fetch("/api/vps/tariffs/countries")
      .then(r => r.json())
      .then((vpsData: any[]) => {
        if (!cancelled) {
          setTopTariffCountries(vpsData.slice(0, 5));
        }
      })
      .catch(() => {});

    // 2b. CTS tariff countries from local data (cobertura total 30 países)
    fetch("/cts_tariffs_summary.json")
      .then(r => r.json())
      .then((ctsData: any[]) => {
        if (!cancelled) {
          setTariffCountries(ctsData.length);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback: usar VPS count se CTS falhar
          setTariffCountries(null);
        }
      });

    // 3. Exchange rate from BCB
    fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json")
      .then(r => r.json())
      .then((data: any[]) => {
        if (!cancelled && data?.length > 0) {
          setExchangeRate(parseFloat(data[0].valor));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExchangeRate(0);
          errs.push("Câmbio");
        }
      });

    // 3b. Exchange rate history (last 20 days)
    fetch("https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/20?formato=json")
      .then(r => r.json())
      .then((data: any[]) => {
        if (!cancelled && Array.isArray(data)) {
          setExchangeHistory(data);
        }
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (errors.length > 0) setErrors(errors); }, [errors.length]);

  /* ── Derived KPIs ── */
  const kpis = useMemo<KpiCard[]>(() => [
    {
      label: "Importadores",
      value: totalImporters ? formatNumber(totalImporters) : "—",
      sub: `${hsChapters || "—"} capítulos HS`,
      icon: Building2,
      trend: "up",
      trendLabel: "base global",
      color: "green",
      loading: totalImporters === null,
    },
    {
      label: "Países com Tarifas",
      value: tariffCountries ? String(tariffCountries) : "—",
      sub: "alíquotas reais",
      icon: Globe,
      trend: "up",
      trendLabel: "cobertura",
      color: "blue",
      loading: tariffCountries === null,
    },
    {
      label: "USD/BRL",
      value: exchangeRate ? `R$ ${exchangeRate.toFixed(2)}` : "—",
      sub: "cotação BCB",
      icon: DollarSign,
      trend: exchangeRate && exchangeRate > 5.5 ? "up" : exchangeRate ? "down" : "neutral",
      trendLabel: "hoje",
      color: exchangeRate && exchangeRate > 5.5 ? "red" : "blue",
      loading: exchangeRate === null,
    },
    {
      label: "VAT/Impostos",
      value: "92",
      sub: "países mapeados",
      icon: Percent,
      trend: "neutral",
      trendLabel: "cobertura global",
      color: "amber",
      loading: false,
    },
  ], [totalImporters, tariffCountries, exchangeRate, hsChapters]);

  return (
    <div className="space-y-6">
      {/* ── Error banner ── */}
      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Alguns dados não puderam ser carregados: {errors.join(", ")}. 
            Mostrando dados disponíveis.
          </span>
        </div>
      )}

      {/* ── Plano Ativo ── */}
      <div className={cn(
        "rounded-2xl border p-5 flex items-center justify-between",
        "bg-gradient-to-r",
        plan === "business" ? "from-slate-800 to-slate-900 border-slate-700 text-white"
        : plan === "growth" ? "from-blue-50 to-cyan-50 border-blue-200"
        : "from-slate-50 to-slate-100 border-slate-200"
      )}>
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2.5 rounded-xl",
            plan === "business" ? "bg-white/10"
            : plan === "business" ? "bg-slate-800"
            : plan === "growth" ? "bg-blue-100"
            : "bg-slate-200"
          )}>
            <Crown className={cn("w-5 h-5",
              plan === "business" ? "text-amber-300"
              : plan === "business" ? "text-white"
              : plan === "growth" ? "text-blue-600"
              : "text-slate-600"
            )} />
          </div>
          <div>
            <p className={cn("text-xs font-black uppercase tracking-wider",
              plan === "business" ? "text-white/60" : "text-slate-500"
            )}>
              Plano Ativo
            </p>
            <p className={cn("text-lg font-black",
              plan === "business" ? "text-white" : "text-slate-900"
            )}>
              {planLabel}
              {plan === "business" && <span className="ml-2 text-xs font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Sob demanda</span>}
            </p>
            <p className={cn("text-xs mt-0.5",
              plan === "business" ? "text-white/60" : "text-slate-600"
            )}>
              Plano ativo
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/plans")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all",
            plan === "business"
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm"
          )}
        >
          Ver Planos
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const c = COLOR_MAP[kpi.color];
          return (
            <div
              key={kpi.label}
              className={cn(
                "relative rounded-2xl border border-slate-200 bg-white p-5",
                "hover:shadow-md transition-shadow duration-200",
                "ring-1 ring-inset", c.ring,
              )}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">{kpi.label}</p>
                  {kpi.loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                      <span className="text-slate-600 text-sm">Carregando...</span>
                    </div>
                  ) : (
                    <>
                      <p className={cn("text-2xl font-black tracking-tight", c.text)}>
                        {kpi.value}
                      </p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {kpi.sub}
                        {kpi.trendLabel && (
                          <span className={cn("ml-1.5 inline-flex items-center gap-0.5", 
                            kpi.trend === "up" ? "text-green-600" : 
                            kpi.trend === "down" ? "text-red-600" : "text-slate-600"
                          )}>
                            {kpi.trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                             kpi.trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
                            {kpi.trendLabel}
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>
                <div className={cn("p-2.5 rounded-xl", c.bg)}>
                  <kpi.icon className={cn("w-5 h-5", c.icon)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            Acesso Rápido
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.to}
              onClick={() => navigate(action.to)}
              className="group relative flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white 
                         hover:shadow-md hover:border-slate-300 transition-all duration-200 text-left"
            >
              <div
                className="p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${action.color}10` }}
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">{action.label}</p>
                <p className="text-[11px] text-slate-600 mt-0.5">{action.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Exchange Rate Chart ── */}
      {exchangeHistory.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                Câmbio USD/BRL
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">Últimos 20 dias úteis</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-800">
                R$ {parseFloat(exchangeHistory[exchangeHistory.length - 1].valor).toFixed(4)}
              </p>
              <p className="text-[10px] text-slate-600">
                {exchangeHistory[exchangeHistory.length - 1].data}
              </p>
            </div>
          </div>
          <div className="px-2 py-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={exchangeHistory.map(d => ({ data: d.data, valor: parseFloat(d.valor) }))}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D80E16" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#D80E16" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="data" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `R$${v.toFixed(2)}`}
                />
                <Tooltip 
                  formatter={(v: number) => [`R$ ${v.toFixed(4)}`, 'USD/BRL']}
                  labelFormatter={(l: string) => l}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#D80E16" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Data Sections ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top HS Chapters */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Top Categorias de Importadores
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">Capítulos HS com maior volume de empresas</p>
          </div>
          <div className="divide-y divide-slate-100">
            {topChapters.length > 0 ? topChapters.map((ch, i) => (
              <div key={ch.hs_chapter} className="flex items-center gap-3 px-5 py-3">
                <div className="w-6 h-6 rounded-full bg-[#D80E16]/10 flex items-center justify-center text-[10px] font-black text-[#D80E16]">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{ch.description}</p>
                  <p className="text-[10px] text-slate-600">Capítulo {ch.hs_chapter}</p>
                </div>
                <span className="text-sm font-black text-slate-800">{formatNumber(ch.count)}</span>
              </div>
            )) : (
              <div className="px-5 py-6 text-center text-sm text-slate-600">Carregando...</div>
            )}
          </div>
        </div>

        {/* Top Tariff Countries */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Maior Cobertura Tarifária
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">Países com mais alíquotas mapeadas</p>
          </div>
          <div className="divide-y divide-slate-100">
            {topTariffCountries.length > 0 ? topTariffCountries.map((c, i) => (
              <div key={c.country} className="flex items-center gap-3 px-5 py-3">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{c.country}</p>
                </div>
                <span className="text-sm font-black text-slate-800">{formatNumber(c.tariff_count)}</span>
              </div>
            )) : (
              <div className="px-5 py-6 text-center text-sm text-slate-600">Carregando...</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Global Alerts & Port Weather ── */}
      <div className="mt-6">
        <GlobalAlertsPanel />
      </div>
    </div>
  );
}
