import React, { useMemo, useState } from "react";
import { ScatterChart, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountryData {
  nome_pais?: string;
  country?: string;
  cod_pais?: string;
  vl_fob?: number;
  kg_liquido?: number;
}

interface PriceVsVolumeChartProps {
  countries: CountryData[];
  limit?: number;
}

export function PriceVsVolumeChart({ countries, limit = 20 }: PriceVsVolumeChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const points = useMemo(() => {
    return countries
      .filter((c) => (c.kg_liquido || 0) > 0 && (c.vl_fob || 0) > 0)
      .map((c) => ({
        name: c.nome_pais || c.country || "Outros",
        codPais: c.cod_pais,
        volume: c.vl_fob || 0,
        price: (c.vl_fob || 0) / (c.kg_liquido || 1),
        kg: c.kg_liquido || 0,
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit);
  }, [countries, limit]);

  if (!points.length) return null;

  const maxVolume = Math.max(...points.map((p) => p.volume));
  const maxPrice = Math.max(...points.map((p) => p.price));
  const minPrice = Math.min(...points.map((p) => p.price));

  const fmtFob = (n: number) =>
    n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` :
    n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` :
    `$${(n / 1e3).toFixed(0)}K`;

  const fmtPrice = (n: number) => `$${n.toFixed(2)}/kg`;

  const fmtKg = (n: number) =>
    n >= 1e6 ? `${(n / 1e6).toFixed(1)}t` :
    `${(n / 1e3).toFixed(0)}kg`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
          <Target className="h-4 w-4 text-[#D80E16]" />
          Preço vs Volume por País
        </h3>
        <p className="text-[10px] text-slate-400 mt-1">
          Tamanho = volume FOB | Posição = preço/kg
        </p>
      </div>
      <div className="p-3 md:p-4">
        {/* Chart area */}
        <div className="relative h-[250px] border border-slate-100 rounded-lg bg-slate-50/50">
          {/* Y-axis label */}
          <div className="absolute -left-1 top-1/2 -rotate-90 text-[9px] font-semibold text-slate-400 whitespace-nowrap">
            Preço/kg (US$)
          </div>
          {/* X-axis label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-slate-400">
            Volume FOB
          </div>
          {/* Points */}
          {points.map((p, i) => {
            const x = maxVolume > 0 ? (p.volume / maxVolume) * 85 + 5 : 50;
            const priceRange = maxPrice - minPrice || 1;
            const y = 100 - ((p.price - minPrice) / priceRange) * 80 - 10;
            const size = Math.max(8, Math.min(30, (p.volume / maxVolume) * 30));
            const isHovered = hovered === p.name;
            return (
              <div
                key={p.codPais || p.name}
                className={cn(
                  "absolute rounded-full bg-[#D80E16] transition-all duration-200 cursor-pointer",
                  isHovered ? "bg-[#B80C12] z-10" : "opacity-80 hover:opacity-100"
                )}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => setHovered(p.name)}
                onMouseLeave={() => setHovered(null)}
                title={`${p.name}: ${fmtFob(p.volume)} | ${fmtPrice(p.price)}`}
              />
            );
          })}
          {/* Hovered tooltip */}
          {hovered && (() => {
            const p = points.find((pt) => pt.name === hovered);
            if (!p) return null;
            const x = maxVolume > 0 ? (p.volume / maxVolume) * 85 + 5 : 50;
            const priceRange = maxPrice - minPrice || 1;
            const y = 100 - ((p.price - minPrice) / priceRange) * 80 - 10;
            return (
              <div
                className="absolute z-20 bg-white border border-slate-200 rounded-lg shadow-lg p-2 pointer-events-none"
                style={{
                  left: `${x}%`,
                  top: `${y - 5}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <p className="text-xs font-bold text-slate-800">{p.name}</p>
                <p className="text-[10px] text-slate-500">{fmtFob(p.volume)} | {fmtPrice(p.price)}</p>
                <p className="text-[10px] text-slate-400">{fmtKg(p.kg)}</p>
              </div>
            );
          })()}
        </div>
        {/* Legend - Top 5 */}
        <div className="flex flex-wrap gap-2 mt-3">
          {points.slice(0, 5).map((p) => (
            <div key={p.name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D80E16]" />
              <span className="text-[10px] text-slate-600">{p.name}</span>
              <span className="text-[10px] font-mono text-slate-400">{fmtFob(p.volume)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
