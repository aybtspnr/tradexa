import React, { useState, useMemo } from "react";
import { BarChart3, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyEntry {
  year: string;
  month: string;
  fob: number;
  kg: number;
}

interface CompareChartProps {
  importData: MonthlyEntry[];
  exportData: MonthlyEntry[];
}

export function CompareChart({ importData, exportData }: CompareChartProps) {
  const [metric, setMetric] = useState<"fob" | "kg">("fob");

  const merged = useMemo(() => {
    const map = new Map<string, { imp: number; exp: number }>();
    importData.forEach((m) => {
      const key = `${m.year}-${m.month}`;
      const existing = map.get(key) || { imp: 0, exp: 0 };
      existing.imp += metric === "fob" ? m.fob : m.kg;
      map.set(key, existing);
    });
    exportData.forEach((m) => {
      const key = `${m.year}-${m.month}`;
      const existing = map.get(key) || { imp: 0, exp: 0 };
      existing.exp += metric === "fob" ? m.fob : m.kg;
      map.set(key, existing);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12);
  }, [importData, exportData, metric]);

  if (!merged.length) return null;

  const maxVal = Math.max(
    ...merged.map(([, v]) => Math.max(v.imp, v.exp))
  );
  const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  const fmtVal = (n: number) =>
    metric === "fob"
      ? n >= 1e9
        ? `$${(n / 1e9).toFixed(1)}B`
        : n >= 1e6
        ? `$${(n / 1e6).toFixed(1)}M`
        : `$${(n / 1e3).toFixed(0)}K`
      : n >= 1e6
      ? `${(n / 1e6).toFixed(1)}t`
      : `${(n / 1e3).toFixed(0)}kg`;

  const totalImp = merged.reduce((s, [, v]) => s + v.imp, 0);
  const totalExp = merged.reduce((s, [, v]) => s + v.exp, 0);
  const balance = totalExp - totalImp;
  const balancePct = totalImp > 0 ? ((balance / totalImp) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <ArrowLeftRight className="h-4 w-4 text-[#D80E16]" />
            Importação vs Exportação
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setMetric("fob")}
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                  metric === "fob"
                    ? "bg-[#D80E16] text-white"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                FOB
              </button>
              <button
                onClick={() => setMetric("kg")}
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                  metric === "kg"
                    ? "bg-[#D80E16] text-white"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                KG
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3 md:p-4">
        {/* Summary */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#D80E16]" />
            <span className="text-xs font-semibold text-slate-600">
              Importação: {fmtVal(totalImp)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="text-xs font-semibold text-slate-600">
              Exportação: {fmtVal(totalExp)}
            </span>
          </div>
          <div className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            balance >= 0
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          )}>
            Saldo: {balance >= 0 ? "+" : ""}{balancePct}%
          </div>
        </div>
        {/* Chart */}
        <div className="flex items-end gap-1 h-[180px]">
          {merged.map(([key, val]) => {
            const [, month] = key.split("-");
            const impHeight = maxVal > 0 ? (val.imp / maxVal) * 100 : 0;
            const expHeight = maxVal > 0 ? (val.exp / maxVal) * 100 : 0;
            return (
              <div key={key} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-[2px] w-full h-[150px]">
                  <div
                    className="flex-1 bg-[#D80E16] rounded-t-sm transition-all duration-300"
                    style={{ height: `${impHeight}%` }}
                    title={`Import: ${fmtVal(val.imp)}`}
                  />
                  <div
                    className="flex-1 bg-[#10B981] rounded-t-sm transition-all duration-300"
                    style={{ height: `${expHeight}%` }}
                    title={`Export: ${fmtVal(val.exp)}`}
                  />
                </div>
                <span className="text-[9px] font-medium text-slate-400">
                  {monthNames[parseInt(month)] || month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
