import React from "react";
import { CountryFlag, comexToIso2 } from "./CountryFlag";
import { cn } from "@/lib/utils";

export interface TradeDataRow {
  coNcm?: string;
  country?: string;
  cod_pais?: string;
  metricFOB?: number | string;
  metricKg?: number | string;
}

interface Props {
  data: TradeDataRow[];
  fmtUSD: (n: number) => string;
  fmtKg: (n: number) => string;
  flowType: "import" | "export";
}

/**
 * Mobile-optimized data table.
 * - Desktop (md+): renders a standard <table> with sortable columns
 * - Mobile (<md): renders card-based layout — each row becomes a card
 */
export const MobileDataTable: React.FC<Props> = ({ data, fmtUSD, fmtKg, flowType }) => {
  const rows = data.slice(0, 100);

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left py-3 px-5 font-semibold text-slate-500">NCM</th>
              <th className="text-left py-3 px-5 font-semibold text-slate-500">País</th>
              <th className="text-right py-3 px-5 font-semibold text-slate-500">FOB</th>
              <th className="text-right py-3 px-5 font-semibold text-slate-500">Peso</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-5 font-mono text-slate-700">{r.coNcm || "-"}</td>
                <td className="py-2.5 px-5 text-slate-600 truncate max-w-[180px]">{r.country || "-"}</td>
                <td className="py-2.5 px-5 text-right font-medium text-slate-800">
                  {fmtUSD(Number(r.metricFOB || 0))}
                </td>
                <td className="py-2.5 px-5 text-right text-slate-500">
                  {fmtKg(Number(r.metricKg || 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        {rows.map((r, i) => {
          const fob = Number(r.metricFOB || 0);
          const kg = Number(r.metricKg || 0);
          const ppk = kg > 0 ? fob / kg : 0;
          return (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              {/* Country flag */}
              <CountryFlag
                codPais={r.cod_pais || ""}
                nome={r.country || ""}
                size="sm"
              />
              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-bold text-[#D80E16] shrink-0">
                    {r.coNcm || "-"}
                  </code>
                  <span className="text-sm text-slate-700 truncate">{r.country || "-"}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs font-bold text-slate-800">
                    {fmtUSD(fob)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {fmtKg(kg)}{ppk > 0 && ` · $${ppk.toFixed(2)}/kg`}
                  </span>
                </div>
              </div>
              {/* Flow badge */}
              <span
                className={cn(
                  "text-[9px] font-bold px-2 py-1 rounded uppercase shrink-0",
                  flowType === "import"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-emerald-50 text-emerald-600"
                )}
              >
                {flowType === "import" ? "IMP" : "EXP"}
              </span>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">Sem registros</div>
        )}
      </div>
    </>
  );
};

export default MobileDataTable;
