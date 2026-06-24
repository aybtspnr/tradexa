"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface Commodity {
  name: string; symbol: string; price: number | null;
  unit: string; change: number | null; changePercent: number | null;
}

interface Props { commodities: Commodity[]; }

export function CommodityBar({ commodities }: Props) {
  if (!commodities.length) return null;

  return (
    <div className="bg-white border-b border-slate-200 overflow-x-auto">
      <div className="flex items-center px-3 py-2 gap-0">
        {/* Label */}
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#D80E16] mr-2 flex-shrink-0">
          Commodities
        </span>
        <div className="w-px h-5 bg-slate-200 mr-2 flex-shrink-0" />
        {commodities.map((c) => (
          <div
            key={c.symbol}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 border-r border-slate-100 last:border-r-0"
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{c.name}</span>
            {c.price !== null ? (
              <>
                <span className="text-xs font-extrabold text-slate-900 tabular-nums">{c.price.toFixed(2)}</span>
                <span className="text-[9px] text-slate-400">{c.unit}</span>
                {c.changePercent !== null && (
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${c.changePercent >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {c.changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(c.changePercent).toFixed(2)}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-[10px] text-slate-300">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
