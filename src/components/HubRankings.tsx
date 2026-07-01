// src/components/HubRankings.tsx
// Rankings de NCMs e Países — FOB, volume, crescimento

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy, TrendingUp, TrendingDown, Globe, Package, DollarSign,
  Loader2, BarChart3, ChevronDown, ChevronUp, Hash
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RankItem {
  rank: number;
  name: string;
  code?: string;
  value: number;
  secondary?: number;
  share: number;
}

function fmt$(v: number): string {
  if (!v) return "$0";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

type RankMetric = "fob" | "kg" | "count";
type RankScope = "ncms" | "countries";

const METRIC_LABELS: Record<RankMetric, string> = {
  fob: "FOB Total",
  kg: "Peso Líquido",
  count: "Nº de Linhas",
};

const METRIC_ICONS: Record<RankMetric, any> = {
  fob: DollarSign,
  kg: Package,
  count: BarChart3,
};

function RankBar({ item, maxVal, color }: { item: RankItem; maxVal: number; color: string }) {
  const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
      <span className={cn(
        "text-xs font-bold w-6 text-center",
        item.rank <= 3 ? "text-amber-500" : "text-slate-400"
      )}>
        {item.rank <= 3 ? ["🥇", "🥈", "🥉"][item.rank - 1] : `${item.rank}º`}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700 truncate">{item.name}</span>
          {item.code && <Badge className="text-[8px] bg-slate-100 text-slate-500 font-mono">{item.code}</Badge>}
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-1">
          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${Math.max(pct, 1)}%` }} />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black text-slate-700">{fmt$(item.value)}</p>
        <p className="text-[10px] text-slate-500">{item.share.toFixed(1)}%</p>
      </div>
    </div>
  );
}

export default function HubRankings() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [flow, setFlow] = useState<"import" | "export">("import");
  const [metric, setMetric] = useState<RankMetric>("fob");
  const [scope, setScope] = useState<RankScope>("ncms");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const ts = Date.now();
    fetch(`/api/comex-intelligence?_=${ts}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setData)
      .catch(() => {
        fetch(`/data/comex_intelligence.json?_=${ts}`)
          .then(r => r.json())
          .then(setData)
          .catch(() => setData(null))
          .finally(() => setLoading(false));
      })
      .finally(() => setLoading(false));
  }, []);

  const trade = data?.[flow];

  const rankings = useMemo((): RankItem[] => {
    if (!trade) return [];

    const items = scope === "ncms"
      ? (trade.all_ncms || trade.top_ncms || [])
      : (trade.all_countries?.length ? trade.all_countries : trade.top_countries || []);

    return items
      .map((item: any, i: number) => ({
        rank: i + 1,
        name: scope === "ncms" ? item.ncm : (item.name || `País ${item.code}`),
        code: scope === "ncms" ? undefined : item.code,
        value: item[metric] || item.fob || 0,
        secondary: item.kg || 0,
        share: trade.total_fob > 0 ? ((item[metric] || item.fob || 0) / trade.total_fob) * 100 : 0,
      }))
      .filter(item => item.value > 0)
      .sort((a: RankItem, b: RankItem) => b.value - a.value)
      .map((item: RankItem, i: number) => ({ ...item, rank: i + 1 }));
  }, [trade, scope, metric]);

  const displayed = showAll ? rankings : rankings.slice(0, 15);
  const maxVal = Math.max(...displayed.map(i => i.value), 1);

  const color = flow === "import"
    ? (metric === "fob" ? "bg-red-500" : metric === "kg" ? "bg-blue-500" : "bg-purple-500")
    : (metric === "fob" ? "bg-emerald-500" : metric === "kg" ? "bg-cyan-500" : "bg-teal-500");

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Flow toggle */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100">
              <button onClick={() => setFlow("import")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${flow === "import" ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}>
                <TrendingDown className="w-3 h-3 inline mr-1" />Importação
              </button>
              <button onClick={() => setFlow("export")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${flow === "export" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>
                <TrendingUp className="w-3 h-3 inline mr-1" />Exportação
              </button>
            </div>

            {/* Scope toggle */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100">
              <button onClick={() => setScope("ncms")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${scope === "ncms" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
                <Hash className="w-3 h-3 inline mr-1" />NCMs
              </button>
              <button onClick={() => setScope("countries")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${scope === "countries" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
                <Globe className="w-3 h-3 inline mr-1" />Países
              </button>
            </div>

            {/* Metric toggle */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100">
              {(["fob", "kg", "count"] as RankMetric[]).map(m => {
                const Icon = METRIC_ICONS[m];
                return (
                  <button key={m} onClick={() => setMetric(m)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${metric === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
                    <Icon className="w-3 h-3 inline mr-1" />{METRIC_LABELS[m].split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-red-500" />
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-500" />
            Ranking de {scope === "ncms" ? "NCMs" : "Países"} por {METRIC_LABELS[metric].toLowerCase()}
            <span className="text-xs font-normal text-slate-400 ml-1">({rankings.length} total)</span>
          </h3>

          <div className="space-y-0.5">
            {displayed.map(item => (
              <RankBar key={scope === "ncms" ? item.name : item.code} item={item} maxVal={maxVal} color={color} />
            ))}
          </div>

          {rankings.length > 15 && (
            <button onClick={() => setShowAll(!showAll)}
              className="w-full mt-3 text-xs font-bold text-red-500 hover:text-red-700 py-2 flex items-center justify-center gap-1">
              {showAll ? <><ChevronUp className="w-3 h-3" /> Mostrar top 15</> : <><ChevronDown className="w-3 h-3" /> Ver todos os {rankings.length}</>}
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
