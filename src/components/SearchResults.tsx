"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Package, Globe, MapPin, ChevronRight,
  BarChart3, ArrowUpRight, DollarSign, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Municipio {
  co_mun: string;
  mun_nome: string;
  kg_liquido: number;
  vl_fob: number;
}

interface Registro {
  co_ano: string;
  co_mes: string;
  mes_nome: string;
  co_pais: string;
  pais_nome: string;
  sg_uf: string;
  uf_nome: string;
  co_via: string;
  via_nome: string;
  co_urf: string;
  urf_nome: string;
  qt_estat: number;
  kg_liquido: number;
  vl_fob: number;
  municipios: Municipio[];
}

type TabKey = "resumo" | "paises" | "ufs" | "municipios" | "detalhes";

interface SearchResultsProps {
  registros: Registro[];
  ncm: string;
  tipo: "export" | "import";
  loading?: boolean;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const formatNumber = (v: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v);

const formatKg = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M kg`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k kg`;
  return `${v} kg`;
};

export default function SearchResults({ registros, ncm, tipo, loading }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("resumo");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const kpis = useMemo(() => {
    const totalFob = registros.reduce((s, r) => s + r.vl_fob, 0);
    const totalKg = registros.reduce((s, r) => s + r.kg_liquido, 0);
    const paises = new Set(registros.map(r => r.pais_nome)).size;
    const ufs = new Set(registros.map(r => r.sg_uf)).size;
    const municipios = new Set(registros.flatMap(r => r.municipios.map(m => m.mun_nome))).size;
    return { totalFob, totalKg, paises, ufs, municipios };
  }, [registros]);

  const topPaises = useMemo(() => {
    const map = new Map<string, number>();
    registros.forEach(r => map.set(r.pais_nome, (map.get(r.pais_nome) || 0) + r.vl_fob));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [registros]);

  const topUfs = useMemo(() => {
    const map = new Map<string, number>();
    registros.forEach(r => map.set(r.uf_nome, (map.get(r.uf_nome) || 0) + r.vl_fob));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [registros]);

  const topMunicipios = useMemo(() => {
    const map = new Map<string, { fob: number; kg: number; uf: string }>();
    registros.forEach(r => {
      r.municipios.forEach(m => {
        const existing = map.get(m.mun_nome) || { fob: 0, kg: 0, uf: r.sg_uf };
        existing.fob += m.vl_fob;
        existing.kg += m.kg_liquido;
        map.set(m.mun_nome, existing);
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].fob - a[1].fob).slice(0, 15);
  }, [registros]);

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { key: "resumo", label: "Resumo", icon: BarChart3 },
    { key: "paises", label: "Países", icon: Globe, count: kpis.paises },
    { key: "ufs", label: "UFs", icon: MapPin, count: kpis.ufs },
    { key: "municipios", label: "Municípios", icon: Layers, count: kpis.municipios },
    { key: "detalhes", label: "Registros", icon: TrendingUp, count: registros.length },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
            <div className="h-3 bg-slate-200 rounded-full w-1/3 mb-3" />
            <div className="h-4 bg-slate-100 rounded-full w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPIs minimalistas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "FOB Total", value: formatCurrency(kpis.totalFob), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Peso Total", value: formatKg(kpis.totalKg), icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Países", value: kpis.paises, icon: Globe, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Registros", value: registros.length, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="glass-card glow-border rounded-xl overflow-hidden">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", kpi.bg)}>
                  <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">{kpi.label}</p>
                  <p className="text-lg font-black text-foreground truncate">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-[0.12em] whitespace-nowrap transition-all shrink-0",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-brand)]"
                : "bg-white text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--brand-soft))]"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "text-[9px] px-1.5 py-0.5 rounded-full font-black",
                activeTab === tab.key ? "bg-white/20" : "bg-slate-100"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo das tabs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "resumo" && (
            <Card className="glass-card glow-border rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary text-primary-foreground font-black text-xs">{ncm}</Badge>
                  <span className="text-sm font-bold text-foreground">
                    {tipo === "export" ? "Exportação" : "Importação"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Valor total FOB", value: formatCurrency(kpis.totalFob) },
                    { label: "Peso líquido total", value: formatKg(kpis.totalKg) },
                    { label: "Países envolvidos", value: kpis.paises },
                    { label: "UFs envolvidas", value: kpis.ufs },
                    { label: "Municípios", value: kpis.municipios },
                    { label: "Registros", value: registros.length },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))]">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] mb-1">{item.label}</p>
                      <p className="text-base font-black text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "paises" && (
            <Card className="glass-card glow-border rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-[hsl(var(--border))]">
                  {topPaises.map(([pais, fob], i) => (
                    <div key={pais} className="flex items-center justify-between p-3.5 hover:bg-[hsl(var(--surface-elevated))] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-[hsl(var(--muted-foreground))] w-5">{i + 1}</span>
                        <span className="text-sm font-bold text-foreground">{pais}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-emerald-600">{formatCurrency(fob)}</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${(fob / topPaises[0][1]) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "ufs" && (
            <Card className="glass-card glow-border rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-[hsl(var(--border))]">
                  {topUfs.map(([uf, fob], i) => (
                    <div key={uf} className="flex items-center justify-between p-3.5 hover:bg-[hsl(var(--surface-elevated))] transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-[hsl(var(--muted-foreground))] w-5">{i + 1}</span>
                        <Badge className="bg-blue-100 text-blue-700 border-none font-black text-xs">{uf}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-emerald-600">{formatCurrency(fob)}</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(fob / topUfs[0][1]) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "municipios" && (
            <Card className="glass-card glow-border rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-[hsl(var(--border))]">
                  {topMunicipios.map(([mun, data], i) => (
                    <div key={mun} className="flex items-center justify-between p-3.5 hover:bg-[hsl(var(--surface-elevated))] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-black text-[hsl(var(--muted-foreground))] w-5 shrink-0">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{mun}</p>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{data.uf} · {formatKg(data.kg)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-emerald-600 shrink-0 ml-3">{formatCurrency(data.fob)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "detalhes" && (
            <Card className="glass-card glow-border rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-[hsl(var(--border))]">
                  {registros.slice(0, 20).map((r, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-[hsl(var(--surface-elevated))] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-black text-[hsl(var(--muted-foreground))] w-5 shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{r.pais_nome}</p>
                            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{r.mes_nome}/{r.co_ano} · {r.uf_nome}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          <span className="text-sm font-black text-emerald-600">{formatCurrency(r.vl_fob)}</span>
                          <ChevronRight className={cn("w-4 h-4 text-[hsl(var(--muted-foreground))] transition-transform", expandedRow === i && "rotate-90")} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedRow === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 bg-[hsl(var(--surface-elevated))]">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 rounded-lg bg-white border border-[hsl(var(--border))]">
                                  <span className="text-[hsl(var(--muted-foreground))]">Peso:</span>{" "}
                                  <span className="font-bold">{formatKg(r.kg_liquido)}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-white border border-[hsl(var(--border))]">
                                  <span className="text-[hsl(var(--muted-foreground))]">Via:</span>{" "}
                                  <span className="font-bold">{r.via_nome}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-white border border-[hsl(var(--border))]">
                                  <span className="text-[hsl(var(--muted-foreground))]">URF:</span>{" "}
                                  <span className="font-bold">{r.urf_nome || "—"}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-white border border-[hsl(var(--border))]">
                                  <span className="text-[hsl(var(--muted-foreground))]">Qtd. Estat:</span>{" "}
                                  <span className="font-bold">{formatNumber(r.qt_estat)}</span>
                                </div>
                              </div>
                              {r.municipios.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[hsl(var(--muted-foreground))] mb-2">Municípios</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {r.municipios.slice(0, 8).map((m, j) => (
                                      <Badge key={j} variant="secondary" className="text-[10px] bg-white border border-[hsl(var(--border))]">
                                        {m.mun_nome} · {formatCurrency(m.vl_fob)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}