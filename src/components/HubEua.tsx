// src/components/HubEua.tsx
// Análise Brasil ↔ EUA — dados Census Bureau + Comex Stat

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Globe, DollarSign, Package, Loader2,
  BarChart3, Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EuaData {
  export_total: number;
  import_total: number;
  balance: number;
  export_products: number;
  import_products: number;
  top_exports: { name: string; value: number }[];
  top_imports: { name: string; value: number }[];
  period: string;
}

interface MonthlyPoint {
  month: string;
  label: string;
  exports: number;
  imports: number;
}

function fmt$(v: number): string {
  if (!v) return "$0";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function MiniBar({ val, max, color }: { val: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max((val / max) * 100, 1) : 0;
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function HubEua() {
  const [data, setData] = useState<EuaData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [overviewRes, trendsRes] = await Promise.all([
          fetch(
            "https://ocivkbocmywinwqmaqac.supabase.co/functions/v1/trade-insights",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "overview", year: "2026" }),
            }
          ),
          fetch(
            "https://ocivkbocmywinwqmaqac.supabase.co/functions/v1/trade-insights",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "trends", year: "2026" }),
            }
          ),
        ]);

        if (overviewRes.ok) {
          const overview = await overviewRes.json();
          setData(overview);
        }

        if (trendsRes.ok) {
          const trends = await trendsRes.json();
          setMonthly(trends.monthly || []);
        }
      } catch (err) {
        console.error("[HubEua] Error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Dados Brasil ↔ EUA indisponíveis</p>
        <p className="text-xs text-slate-400 mt-1">A API do Census Bureau pode estar temporariamente inacessível</p>
      </div>
    );
  }

  const maxTop = Math.max(
    ...(data.top_exports || []).map(i => i.value),
    ...(data.top_imports || []).map(i => i.value),
    1
  );

  const maxMonthly = Math.max(...monthly.map(m => Math.max(m.exports, m.imports)), 1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-slate-200 overflow-hidden bg-gradient-to-r from-blue-50 to-red-50">
        <div className="h-1 bg-gradient-to-r from-blue-500 via-white to-red-500" />
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Brasil ↔ Estados Unidos</h2>
              <p className="text-[10px] text-slate-500">Período: {data.period} · Fonte de referência</p>
            </div>
          </div>

          {/* Balance */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Exportações BR→EUA", fmt$(data.export_total), "text-emerald-600", "bg-emerald-50"],
              ["Importações EUA→BR", fmt$(data.import_total), "text-red-600", "bg-red-50"],
              ["Saldo", fmt$(data.balance), data.balance >= 0 ? "text-emerald-600" : "text-red-600", "bg-slate-50"],
            ].map(([l, v, tc, bg]) => (
              <div key={String(l)} className={`px-3 py-2 rounded-xl ${bg} border border-slate-100`}>
                <p className="text-[9px] text-slate-500 uppercase font-bold">{String(l)}</p>
                <p className={`text-sm font-black ${tc}`}>{String(v)}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-3 text-[10px] text-slate-500">
            <span>{data.export_products} produtos exportados</span>
            <span>·</span>
            <span>{data.import_products} produtos importados</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-400 to-red-400" />
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-red-500" />Evolução Mensal 2026
          </h3>
          <div className="space-y-3">
            {monthly.map(m => (
              <div key={m.month} className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-slate-600 w-8">{m.label}</span>
                  <span className="text-emerald-600 font-bold">{fmt$(m.exports)}</span>
                  <span className="text-red-600 font-bold">{fmt$(m.imports)}</span>
                </div>
                <div className="space-y-0.5">
                  <MiniBar val={m.exports} max={maxMonthly} color="bg-emerald-500" />
                  <MiniBar val={m.imports} max={maxMonthly} color="bg-red-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Top Exportações BR→EUA
            </h3>
            <div className="space-y-2">
              {(data.top_exports || []).slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5">{i + 1}º</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                    <MiniBar val={item.value} max={maxTop} color="bg-emerald-500" />
                  </div>
                  <p className="text-xs font-black text-emerald-600">{fmt$(item.value)}</p>
                </div>
              ))}
              {(!data.top_exports || data.top_exports.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-4">Dados não disponíveis</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-400 to-red-500" />
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Top Importações EUA→BR
            </h3>
            <div className="space-y-2">
              {(data.top_imports || []).slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5">{i + 1}º</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{item.name}</p>
                    <MiniBar val={item.value} max={maxTop} color="bg-red-500" />
                  </div>
                  <p className="text-xs font-black text-red-600">{fmt$(item.value)}</p>
                </div>
              ))}
              {(!data.top_imports || data.top_imports.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-4">Dados não disponíveis</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
