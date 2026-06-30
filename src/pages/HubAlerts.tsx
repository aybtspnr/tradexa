"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  Globe,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { loadCTSData } from "@/services/ctsTariffs";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface TariffAlert {
  id: string;
  type: "high_tariff" | "recent_change" | "seasonal" | "country_alert";
  title: string;
  description: string;
  country: string;
  date: string;
  severity: "high" | "medium" | "low";
  rate?: number;
}

interface CountryTariffSummary {
  country: string;
  avgRate: number;
  hsCount: number;
}

/* ── Severity styles ── */
const SEVERITY_STYLES: Record<
  string,
  { dot: string; badge: string; label: string }
> = {
  high: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Alta",
  },
  medium: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Média",
  },
  low: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Normal",
  },
};

/* ── Helpers ── */
function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function generateAlerts(
  countries: CountryTariffSummary[]
): TariffAlert[] {
  const alerts: TariffAlert[] = [];
  const now = new Date();

  // 1. High tariff alerts (top 5 most expensive countries)
  const sortedByRate = [...countries].sort((a, b) => b.avgRate - a.avgRate);
  sortedByRate.slice(0, 5).forEach((c, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 3);
    alerts.push({
      id: `high-${c.country}`,
      type: "high_tariff",
      title: `Tarifa elevada — ${c.country}`,
      description: `Média de ${c.avgRate.toFixed(1)}% em ${c.hsCount} códigos HS. Verifique alíquotas específicas para seu produto.`,
      country: c.country,
      date: formatDate(date),
      severity: c.avgRate > 20 ? "high" : c.avgRate > 10 ? "medium" : "low",
      rate: c.avgRate,
    });
  });

  // 2. Country-specific alerts based on HS coverage
  const sortedByCount = [...countries].sort((a, b) => b.hsCount - a.hsCount);
  sortedByCount.slice(0, 4).forEach((c, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 5 - 2);
    alerts.push({
      id: `country-${c.country}`,
      type: "country_alert",
      title: `${c.country} — Nova cobertura tarifária`,
      description: `${c.hsCount} códigos HS mapeados com alíquotas consolidadas. Dados atualizados da OMC.`,
      country: c.country,
      date: formatDate(date),
      severity: "medium",
    });
  });

  // 3. Seasonal calendar events
  const seasonalEvents = [
    {
      title: "Revisão Tarifária OMC",
      description:
        "Rodada de revisão de compromissos tarifários consolidados. Países membros submetem novas propostas.",
      country: "Global",
      daysAgo: 7,
      severity: "medium" as const,
    },
    {
      title: "Acordo Mercosul-UE",
      description:
        "Novas regras de origem e reduções tarifárias entram em vigor para setores prioritários.",
      country: "Mercosul",
      daysAgo: 15,
      severity: "high" as const,
    },
    {
      title: "Safra Agrícola — América do Sul",
      description:
        "Alterações sazonais nas alíquotas de importação para produtos agrícolas da safra atual.",
      country: "Brasil",
      daysAgo: 25,
      severity: "low" as const,
    },
    {
      title: "Revisão de Cotas EUA",
      description:
        "Novos limites de cotas tarifárias para importação de aço e alumínio pelos EUA.",
      country: "EUA",
      daysAgo: 10,
      severity: "high" as const,
    },
    {
      title: "Atualização NCM — Mercosul",
      description:
        "Mudanças na Nomenclatura Comum do Mercosul para alinhamento com o SH 2027.",
      country: "Mercosul",
      daysAgo: 30,
      severity: "medium" as const,
    },
  ];

  seasonalEvents.forEach((evt, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - evt.daysAgo);
    alerts.push({
      id: `seasonal-${i}`,
      type: "seasonal",
      title: evt.title,
      description: evt.description,
      country: evt.country,
      date: formatDate(date),
      severity: evt.severity,
    });
  });

  // Sort by recency (closest dates first — larger negative days = older)
  alerts.sort((a, b) => {
    const dateA = new Date(a.date.split(" ").reverse().join(" "));
    const dateB = new Date(b.date.split(" ").reverse().join(" "));
    return dateB.getTime() - dateA.getTime();
  });

  return alerts;
}

/* ── Component ── */
export default function HubAlerts() {
  const [countries, setCountries] = useState<CountryTariffSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await loadCTSData();
        if (cancelled) return;
        const summaries: CountryTariffSummary[] = [];
        for (const [country, arr] of Object.entries(data.data)) {
          if (arr.length === 0) continue;
          let sum = 0;
          const count = arr.length / 2;
          for (let i = 1; i < arr.length; i += 2) {
            sum += Number(arr[i]);
          }
          summaries.push({
            country,
            avgRate: Math.round((sum / count) * 10) / 10,
            hsCount: count,
          });
        }
        summaries.sort((a, b) => b.avgRate - a.avgRate);
        setCountries(summaries);
      } catch {
        if (!cancelled) setError("Não foi possível carregar dados de tarifas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const alerts = useMemo(() => generateAlerts(countries), [countries]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchFilter = filter === "all" || a.type === filter;
      const matchCountry =
        selectedCountry === "all" || a.country === selectedCountry;
      return matchFilter && matchCountry;
    });
  }, [alerts, filter, selectedCountry]);

  const countryOptions = useMemo(() => {
    const set = new Set(alerts.map((a) => a.country));
    return Array.from(set).sort();
  }, [alerts]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const high = alerts.filter((a) => a.severity === "high").length;
    const medium = alerts.filter((a) => a.severity === "medium").length;
    return { total: alerts.length, high, medium };
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">
            Carregando alertas...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    high_tariff: TrendingUp,
    recent_change: TrendingDown,
    seasonal: CalendarDays,
    country_alert: Globe,
  };

  const TYPE_LABELS: Record<string, string> = {
    high_tariff: "Tarifas Altas",
    recent_change: "Mudanças",
    seasonal: "Calendário",
    country_alert: "Países",
  };

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide">
          Alertas de Inteligência
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitore mudanças tarifárias, alertas por país e eventos sazonais
        </p>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Total Alertas</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Prioridade Alta</p>
          <p className="text-2xl font-black text-red-600 mt-1">{stats.high}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-600">Prioridade Média</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{stats.medium}</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="all">Todos os tipos</option>
          <option value="high_tariff">Tarifas Altas</option>
          <option value="country_alert">Países</option>
          <option value="seasonal">Calendário</option>
        </select>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="all">Todos os países</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500 ml-auto">
          {filteredAlerts.length} alerta{filteredAlerts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Alert Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              Nenhum alerta encontrado com os filtros selecionados.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const severity = SEVERITY_STYLES[alert.severity];
            const Icon = TYPE_ICONS[alert.type] || BellRing;
            const typeLabel = TYPE_LABELS[alert.type] || alert.type;
            return (
              <div
                key={alert.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Color accent bar */}
                <div
                  className={cn(
                    "h-1",
                    alert.severity === "high"
                      ? "bg-gradient-to-r from-red-500 to-red-400"
                      : alert.severity === "medium"
                      ? "bg-gradient-to-r from-amber-500 to-amber-400"
                      : "bg-gradient-to-r from-blue-500 to-blue-400"
                  )}
                />
                <div className="p-5">
                  {/* Top row: icon + severity badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "p-2 rounded-xl",
                          alert.severity === "high"
                            ? "bg-red-50"
                            : alert.severity === "medium"
                            ? "bg-amber-50"
                            : "bg-blue-50"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            alert.severity === "high"
                              ? "text-red-500"
                              : alert.severity === "medium"
                              ? "text-amber-500"
                              : "text-blue-500"
                          )}
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {typeLabel}
                        </span>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {alert.country}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        severity.badge
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full mr-1", severity.dot)} />
                      {severity.label}
                    </span>
                  </div>

                  {/* Body */}
                  <h3 className="text-sm font-bold text-slate-800 mb-1.5 leading-snug">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Footer: date */}
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-medium text-slate-500">
                      {alert.date}
                    </span>
                    {alert.rate !== undefined && (
                      <span className="ml-auto text-xs font-bold text-slate-700">
                        {alert.rate.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
