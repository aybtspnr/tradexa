import React, { useState, useMemo } from "react";
import { StateBadge } from "./StateBadge";
import { cn } from "@/lib/utils";

interface CityPriceData {
  name: string;
  uf: string;
  codMun?: string;
  pricePerKg: number;
  fob: number;
  kg: number;
}

interface Props {
  cities: CityPriceData[];
  avgPrice: number;
  fmtUSD: (n: number) => string;
  fmtKg: (n: number) => string;
  onCityClick?: (codMun: string) => void;
}

type SortMode = "price" | "volume";

export const CityPriceChart: React.FC<Props> = ({
  cities, avgPrice, fmtUSD, fmtKg, onCityClick,
}) => {
  const [sortMode, setSortMode] = useState<SortMode>("volume");

  const sorted = useMemo(() => {
    const filtered = cities.filter(c => c.kg >= 50 && c.pricePerKg > 0);
    return [...filtered].sort((a, b) =>
      sortMode === "price" ? a.pricePerKg - b.pricePerKg : b.fob - a.fob
    ).slice(0, 15);
  }, [cities, sortMode]);

  if (sorted.length < 3) return null;

  const maxPrice = Math.max(...sorted.map(c => c.pricePerKg), avgPrice);
  const maxWidth = 100; // percentage

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <svg className="h-4 w-4 text-[#D80E16]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            Preço/kg por Cidade
          </h3>
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setSortMode("volume")}
              className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md transition-all",
                sortMode === "volume" ? "bg-[#D80E16] text-white" : "text-slate-500 hover:text-slate-700")}
            >Por Volume</button>
            <button
              onClick={() => setSortMode("price")}
              className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md transition-all",
                sortMode === "price" ? "bg-[#D80E16] text-white" : "text-slate-500 hover:text-slate-700")}
            >Por Preço</button>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-5">
        <div className="space-y-2">
          {sorted.map((c, i) => {
            const diff = avgPrice > 0 ? ((c.pricePerKg - avgPrice) / avgPrice) * 100 : 0;
            const barWidth = (c.pricePerKg / maxPrice) * maxWidth;
            const isAbove = diff > 5;
            const isBelow = diff < -5;

            return (
              <div
                key={i}
                className={cn("flex items-center gap-2 py-1.5 px-2 rounded-lg transition-colors",
                  onCityClick && c.codMun ? "cursor-pointer hover:bg-slate-50" : "")}
                onClick={() => c.codMun && onCityClick?.(c.codMun)}
              >
                <span className="text-[10px] font-bold text-slate-400 w-5 text-right shrink-0">{i + 1}</span>
                <StateBadge uf={c.uf} size="xs" badge />
                <span className="text-xs font-medium text-slate-700 w-24 truncate shrink-0">{c.name}</span>
                <div className="flex-1 relative h-5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  {/* Average line */}
                  {avgPrice > 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                      style={{ left: `${(avgPrice / maxPrice) * maxWidth}%` }}
                      title={`Média: US$ ${avgPrice.toFixed(2)}/kg`}
                    />
                  )}
                  {/* Bar */}
                  <div
                    className={cn("h-full rounded-full transition-all",
                      isAbove ? "bg-red-400/70" : isBelow ? "bg-emerald-400/70" : "bg-indigo-400/70")}
                    style={{ width: `${barWidth}%` }}
                  />
                  {/* Price label inside bar */}
                  <span className="absolute top-0 left-2 h-full flex items-center text-[10px] font-bold text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                    US$ {c.pricePerKg.toFixed(2)}
                  </span>
                </div>
                <span className={cn("text-[10px] font-bold w-12 text-right shrink-0",
                  isAbove ? "text-red-500" : isBelow ? "text-emerald-600" : "text-slate-500")}>
                  {diff > 0 ? "▲" : "▼"}{Math.abs(diff).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-400 w-16 text-right shrink-0">{fmtUSD(c.fob)}</span>
              </div>
            );
          })}
        </div>

        {/* Average indicator */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-0.5 h-3 bg-slate-400" />
            Média NCM: <span className="font-bold text-slate-600">US$ {avgPrice.toFixed(2)}/kg</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-400/70" />
            Abaixo da média
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-400/70" />
            Acima da média
          </span>
        </div>
      </div>
    </div>
  );
};

export default CityPriceChart;
