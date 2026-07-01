import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, DollarSign, Globe, Building2, Anchor,
  ArrowRight, Percent, Ship, Search, BarChart3, Calendar, Sparkles,
  AlertTriangle, Loader2, MapPin, Navigation, ArrowLeftRight, Zap, Bell, Crown,
  Radio, Briefcase, Clock,
} from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUsage } from "@/hooks/use-usage";
import { UsageBar } from "@/components/UsageBar";
import { supabase } from "@/integrations/supabase/client";
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
  icon: React.ElementType;
  label: string;
  desc: string;
  color: string;
}

interface RecentSearch {
  id: string;
  product_description: string;
  ncm_code: string;
  created_at: string;
  confianca_geral?: string;
}

/* ── Constants ── */
const QUICK_ACTIONS: QuickAction[] = [
  { to: "/ai-search", icon: Sparkles, label: "Classificar NCM", desc: "IA classifica qualquer produto", color: "#D80E16" },
  { to: "/global-tariff", icon: Percent, label: "Alíquotas", desc: "Tarifas de 160+ países", color: "#2563EB" },
  { to: "/importadores", icon: Building2, label: "Importadores", desc: "730K+ empresas globais", color: "#059669" },
  { to: "/maritime-freight-map", icon: Ship, label: "Frete Marítimo", desc: "Cotações CN→BR / BR→US", color: "#D97706" },
  { to: "/track-trace", icon: Navigation, label: "Track & Trace", desc: "Navios e aviões ao vivo", color: "#0891B2" },
  { to: "/supply-chain", icon: Radio, label: "Supply Chain", desc: "Mapa logístico global ao vivo", color: "#D80E16" },
  { to: "/intelligence", icon: BarChart3, label: "Dashboard Inteligência", desc: "Dados de comércio exterior", color: "#7C3AED" },
  { to: "/services", icon: Briefcase, label: "Serviços", desc: "Consultoria e despacho aduaneiro", color: "#E11D48" },
];

const COLOR_MAP: Record<string, { bg: string; text: string; icon: string; ring: string }> = {
  red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500", ring: "ring-red-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-500", ring: "ring-blue-100" },
  green: { bg: "bg-green-50", text: "text-green-600", icon: "text-green-500", ring: "ring-green-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "text-amber-500", ring: "ring-amber-100" },
};

const CONFIDENCE_COLORS: Record<string, string> = {
  alta: "text-emerald-600 bg-emerald-50",
  media: "text-amber-600 bg-amber-50",
  baixa: "text-red-600 bg-red-50",
};

/* ── Helpers ── */
function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString("pt-BR");
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
  const { plan, percentUsed, used, tank, isLimited, isNearLimit, isAtLimit, loading: usageLoading } = useUsage();
  const planLabel = PLAN_LABELS[plan] || plan;

  const [totalImporters, setTotalImporters] = useState<number | null>(null);
  const [tariffCountries, setTariffCountries] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [hsChapters, setHsChapters] = useState<number | null>(null);
  const [topChapters, setTopChapters] = useState<{hs_chapter: string; description: string; count: number}[]>([]);
  const [topTariffCountries, setTopTariffCountries] = useState<{country: string; tariff_count: number}[]>([]);
  const [exchangeHistory, setExchangeHistory] = useState<{data: string; valor: string}[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Recent activity state
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [searchesLoading, setSearchesLoading] = useState(true);
  const [searchesError, setSearchesError] = useState(false);

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

    // 2b. WITS tariff countries from local data (cobertura total 160 países)
    fetch("/wits_tariffs_summary.json")
      .then(r => r.json())
      .then((witsData: any[]) => {
        if (!cancelled) {
          setTariffCountries(witsData.length);
          // Use WITS data for top countries too if VPS fails
          if (topTariffCountries.length === 0) {
            setTopTariffCountries(
              witsData.slice(0, 5).map((c: any) => ({
                country: c.country,
                tariff_count: c.hs6,
              }))
            );
          }
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

  /* ── Fetch Recent Activity ── */
  useEffect(() => {
    let cancelled = false;
    setSearchesLoading(true);

    const fetchRecent = async () => {
      try {
        if (!profile) {
          if (!cancelled) { setSearchesLoading(false); setSearchesError(true); }
          return;
        }
        const { data, error } = await supabase
          .from("ncm_searches")
          .select("id, product_description, ncm_code, created_at, confianca_geral")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(8);
        if (error) throw error;
        if (!cancelled) {
          setRecentSearches(data || []);
          setSearchesLoading(false);
        }
      } catch {
        if (!cancelled) {
          setSearchesError(true);
          setSearchesLoading(false);
        }
      }
    };
    fetchRecent();
    return () => { cancelled = true; };
  }, [profile]);

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

      {/* ── Plano Ativo + Usage Bar ── */}
      <div className={cn(
        "rounded-2xl border p-5",
        "bg-gradient-to-r",
        plan === "business" ? "from-slate-800 to-slate-900 border-slate-700 text-white"
        : plan === "growth" ? "from-blue-50 to-cyan-50 border-blue-200"
        : "from-slate-50 to-slate-100 border-slate-200"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2.5 rounded-xl",
              plan === "business" ? "bg-white/10"
              : plan === "growth" ? "bg-blue-100"
              : "bg-slate-200"
            )}>
              <Crown className={cn("w-5 h-5",
                plan === "business" ? "text-amber-300"
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

        {/* Usage bar */}
        {!usageLoading && isLimited && (
          <div className="mt-4 pt-4 border-t border-slate-200/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={cn("w-3.5 h-3.5",
                  isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-emerald-500"
                )} />
                <span className={cn("text-xs font-bold",
                  plan === "business" ? "text-white/70" : "text-slate-600"
                )}>
                  Uso do plano
                </span>
              </div>
              <span className={cn("text-[11px] font-black",
                isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : plan === "business" ? "text-white/60" : "text-slate-500"
              )}>
                {percentUsed.toFixed(1)}% usado ({used.toFixed(0)}/{tank})
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/60 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            {isAtLimit && (
              <p className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Limite do plano atingido. Faça upgrade para continuar usando.
              </p>
            )}
            {isNearLimit && !isAtLimit && (
              <p className="mt-2 text-xs text-amber-500 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Você está próximo do limite do seu plano.
              </p>
            )}
          </div>
        )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* ── Recent Activity ── */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Atividade Recente
            </h2>
          </div>
          {recentSearches.length > 0 && (
            <button
              onClick={() => navigate("/ai-search")}
              className="text-[11px] font-bold text-[#D80E16] hover:text-red-700 transition-colors"
            >
              Ver Todas
            </button>
          )}
        </div>
        <div className="divide-y divide-slate-100">
          {searchesLoading ? (
            <div className="px-5 py-6 text-center text-sm text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Carregando atividades...
            </div>
          ) : searchesError || recentSearches.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Nenhuma atividade recente</p>
              <p className="text-xs text-slate-400 mt-1">Suas classificações NCM e consultas aparecerão aqui</p>
              <button
                onClick={() => navigate("/ai-search")}
                className="mt-3 px-4 py-2 bg-[#D80E16] text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Classificar Produto
              </button>
            </div>
          ) : (
            recentSearches.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <Search className="w-4 h-4 text-[#D80E16]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {s.product_description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {s.ncm_code}
                    </span>
                    {s.confianca_geral && (
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded",
                        CONFIDENCE_COLORS[s.confianca_geral] || "text-slate-500 bg-slate-50"
                      )}>
                        {s.confianca_geral}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">{timeAgo(s.created_at)}</span>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Global Alerts & Port Weather ── */}
      <div className="mt-6">
        <GlobalAlertsPanel />
      </div>
    </div>
  );
}
