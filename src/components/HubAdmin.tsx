// src/components/HubAdmin.tsx
// Admin dos dados de Inteligência — status, refresh, logs

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Database, RefreshCw, CheckCircle2, XCircle, Clock,
  Loader2, BarChart3, Globe, Activity, AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataSource {
  name: string;
  status: "ok" | "error" | "unknown";
  label: string;
  description: string;
  lastUpdate?: string;
  recordCount?: number;
}

function fmt$(v: number): string {
  if (!v) return "$0";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export default function HubAdmin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const ts = Date.now();
      const res = await fetch(`/api/comex-intelligence?_=${ts}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Clear cache and reload
    await fetch("/api/comex-intelligence?refresh=1&_=" + Date.now())
      .catch(() => {});
    await loadData(false);
  };

  const sources: DataSource[] = [
    {
      name: "comexstat",
      status: data ? "ok" : "error",
      label: "Comex Stat",
      description: "Dados de importação e exportação do Brasil",
      lastUpdate: data?.meta?.period || "—",
      recordCount: data?.meta?.total_lines || 0,
    },
    {
      name: "trade_insights",
      status: "ok",
      label: "Trade Insights",
      description: "Dados Brasil ↔ EUA",
      lastUpdate: "2026",
    },
    {
      name: "alertas",
      status: "ok",
      label: "Alertas Inteligentes",
      description: "Regras e alertas configurados pelos usuários",
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>;
  }

  const exportData = data?.export;
  const importData = data?.import;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800">Admin — Dados de Inteligência</h2>
                <p className="text-[10px] text-slate-500">Status das fontes de dados e informações do sistema</p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="h-9 rounded-xl text-xs font-bold"
            >
              {refreshing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <RefreshCw className="w-3 h-3 mr-1" />}
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs font-medium text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Data Sources Status */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-400" />
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-500" />Fontes de Dados
          </h3>
          <div className="space-y-3">
            {sources.map(src => (
              <div key={src.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-100 hover:bg-slate-50">
                <div className="shrink-0">
                  {src.status === "ok" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : src.status === "error" ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">{src.label}</span>
                    <Badge className={cn(
                      "text-[8px] px-1.5",
                      src.status === "ok" ? "bg-emerald-50 text-emerald-700" :
                      src.status === "error" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    )}>
                      {src.status === "ok" ? "Online" : src.status === "error" ? "Offline" : "Desconhecido"}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500">{src.description}</p>
                  {src.lastUpdate && (
                    <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      Última atualização: {src.lastUpdate}
                      {src.recordCount ? ` · ${(src.recordCount / 1e6).toFixed(1)}M registros` : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      {data && (
        <Card className="border-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-red-500" />
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-amber-500" />Resumo dos Dados
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Período", data?.meta?.period || "—", "text-slate-700", "bg-slate-50"],
                ["Total de Linhas", data?.meta?.total_lines?.toLocaleString("pt-BR") || "—", "text-purple-600", "bg-purple-50"],
                ["Importações (FOB)", fmt$(importData?.total_fob || 0), "text-red-600", "bg-red-50"],
                ["Exportações (FOB)", fmt$(exportData?.total_fob || 0), "text-emerald-600", "bg-emerald-50"],
                ["NCMs (Importação)", (importData?.ncm_count || 0).toLocaleString("pt-BR"), "text-blue-600", "bg-blue-50"],
                ["NCMs (Exportação)", (exportData?.ncm_count || 0).toLocaleString("pt-BR"), "text-cyan-600", "bg-cyan-50"],
                ["Países (Importação)", (importData?.country_count || 0).toLocaleString("pt-BR"), "text-orange-600", "bg-orange-50"],
                ["Países (Exportação)", (exportData?.country_count || 0).toLocaleString("pt-BR"), "text-teal-600", "bg-teal-50"],
              ].map(([l, v, tc, bg]) => (
                <div key={String(l)} className={`px-3 py-2 rounded-xl ${bg} border border-slate-100`}>
                  <p className="text-[9px] text-slate-500 uppercase font-bold">{String(l)}</p>
                  <p className={`text-sm font-black ${tc}`}>{String(v)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dica */}
      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="p-4">
          <p className="text-[11px] text-slate-500 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            Os dados são atualizados automaticamente conforme publicações oficiais. Clique em "Atualizar" para forçar o refresh do cache.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
