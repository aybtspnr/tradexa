import React, { useMemo, useState } from "react";
import { MapPin, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityData {
  cod_mun: string;
  nome_mun?: string;
  uf?: string;
  vl_fob: number;
  kg_liquido: number;
}

interface CityHeatmapProps {
  cities: CityData[];
  metric?: "fob" | "kg";
  limit?: number;
}

function getHeatColor(value: number, max: number): string {
  const ratio = max > 0 ? value / max : 0;
  if (ratio >= 0.8) return "bg-red-500 text-white";
  if (ratio >= 0.6) return "bg-orange-400 text-white";
  if (ratio >= 0.4) return "bg-amber-400 text-white";
  if (ratio >= 0.2) return "bg-yellow-300 text-slate-800";
  return "bg-slate-100 text-slate-600";
}

export function CityHeatmap({ cities, metric = "fob", limit = 20 }: CityHeatmapProps) {
  const [sortMetric, setSortMetric] = useState<"fob" | "kg">(metric);

  const sorted = useMemo(() => {
    const filtered = cities
      .filter((c) => (sortMetric === "fob" ? c.vl_fob : c.kg_liquido) > 0)
      .sort((a, b) =>
        sortMetric === "fob"
          ? b.vl_fob - a.vl_fob
          : b.kg_liquido - a.kg_liquido
      )
      .slice(0, limit);
    return filtered;
  }, [cities, sortMetric, limit]);

  if (!sorted.length) return null;

  const maxValue = Math.max(
    ...sorted.map((c) => (sortMetric === "fob" ? c.vl_fob : c.kg_liquido))
  );

  const fmtVal = (n: number) =>
    sortMetric === "fob"
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
            <MapPin className="h-4 w-4 text-[#D80E16]" />
            Mapa de Calor — Cidades
          </h3>
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setSortMetric("fob")}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                sortMetric === "fob"
                  ? "bg-[#D80E16] text-white"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              FOB
            </button>
            <button
              onClick={() => setSortMetric("kg")}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                sortMetric === "kg"
                  ? "bg-[#D80E16] text-white"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              KG
            </button>
          </div>
        </div>
      </div>
      <div className="p-3 md:p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {sorted.map((city, i) => {
            const val = sortMetric === "fob" ? city.vl_fob : city.kg_liquido;
            const colorClass = getHeatColor(val, maxValue);
            return (
              <div
                key={city.cod_mun}
                className={cn(
                  "rounded-lg p-3 text-center transition-all hover:scale-105 cursor-pointer",
                  colorClass
                )}
                title={`${city.nome_mun || city.cod_mun} (${city.uf}): ${fmtVal(val)}`}
              >
                <p className="text-[10px] font-bold opacity-70">#{i + 1}</p>
                <p className="text-xs font-bold truncate">
                  {city.nome_mun || city.cod_mun}
                </p>
                <p className="text-[10px] font-medium opacity-80">{city.uf}</p>
                <p className="text-sm font-bold mt-1">{fmtVal(val)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
