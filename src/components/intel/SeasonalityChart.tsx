import React, { useMemo, useState } from "react";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlyEntry {
  year: string;
  month: string;
  fob: number;
  kg: number;
}

interface SeasonalityChartProps {
  importData: MonthlyEntry[];
  exportData: MonthlyEntry[];
}

export function SeasonalityChart({ importData, exportData }: SeasonalityChartProps) {
  const [metric, setMetric] = useState<"fob" | "kg">("fob");
  const [flow, setFlow] = useState<"import" | "export">("import");

  const seasonality = useMemo(() => {
    const data = flow === "import" ? importData : exportData;
    const byMonth = new Map<string, { total: number; count: number }>();
    data.forEach((m) => {
      const month = parseInt(m.month);
      if (month < 1 || month > 12) return;
      const existing = byMonth.get(m.month) || { total: 0, count: 0 };
      existing.total += metric === "fob" ? m.fob : m.kg;
      existing.count += 1;
      byMonth.set(m.month, existing);
    });
    return [...byMonth.entries()]
      .map(([month, val]) => ({
        month: parseInt(month),
        avg: val.count > 0 ? val.total / val.count : 0,
        total: val.total,
        count: val.count,
      }))
      .sort((a, b) => a.month - b.month);
  }, [importData, exportData, metric, flow]);

  if (!seasonality.length) return null;

  const maxVal = Math.max(...seasonality.map((s) => s.avg));
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  // Calculate trend
  const firstHalf = seasonality.filter((s) => s.month <= 6);
  const secondHalf = seasonality.filter((s) => s.month > 6);
  const avgFirst = firstHalf.length > 0 ? firstHalf.reduce((s, v) => s + v.avg, 0) / firstHalf.length : 0;
  const avgSecond = secondHalf.length > 0 ? secondHalf.reduce((s, v) => s + v.avg, 0) / secondHalf.length : 0;
  const trendPct = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-[#D80E16]" />
            Sazonalidade
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setFlow("import")}
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                  flow === "import"
                    ? "bg-[#D80E16] text-white"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Import
              </button>
              <button
                onClick={() => setFlow("export")}
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                  flow === "export"
                    ? "bg-[#10B981] text-white"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                Export
              </button>
            </div>
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
        {/* Trend indicator */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500">Tendência 1º→2º semestre:</span>
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full",
            trendPct >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}>
            {trendPct >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trendPct >= 0 ? "+" : ""}{trendPct.toFixed(1)}%
          </div>
        </div>
        {/* Chart */}
        <div className="flex items-end gap-1 h-[150px]">
          {seasonality.map((s) => {
            const height = maxVal > 0 ? (s.avg / maxVal) * 100 : 0;
            const isHigh = s.avg >= maxVal * 0.8;
            const isLow = s.avg <= maxVal * 0.3;
            return (
              <div key={s.month} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-full rounded-t-sm transition-all duration-300",
                    flow === "import" ? "bg-[#D80E16]" : "bg-[#10B981]",
                    isHigh && "opacity-100",
                    isLow && "opacity-50",
                    !isHigh && !isLow && "opacity-75"
                  )}
                  style={{ height: `${height}%` }}
                  title={`${monthNames[s.month - 1]}: ${fmtVal(s.avg)}`}
                />
                <span className="text-[9px] font-medium text-slate-400">
                  {monthNames[s.month - 1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
