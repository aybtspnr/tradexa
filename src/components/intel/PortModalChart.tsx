import React, { useMemo } from "react";
import { Ship, Plane, Truck, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortEntry {
  via: string;
  via_name: string;
  urf: string;
  urf_name: string;
  kg: number;
  fob: number;
}

interface PortModalChartProps {
  ports: PortEntry[];
}

const MODAL_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  MARITIMA: { icon: <Ship className="h-4 w-4" />, label: "Marítimo", color: "bg-blue-500" },
  AEREA: { icon: <Plane className="h-4 w-4" />, label: "Aéreo", color: "bg-purple-500" },
  RODOVIARIA: { icon: <Truck className="h-4 w-4" />, label: "Rodoviário", color: "bg-amber-500" },
};

function getModalKey(viaName: string): string {
  const name = viaName.toUpperCase();
  if (name.includes("MAR")) return "MARITIMA";
  if (name.includes("AER")) return "AEREA";
  if (name.includes("ROD")) return "RODOVIARIA";
  return "OUTROS";
}

export function PortModalChart({ ports }: PortModalChartProps) {
  const modalData = useMemo(() => {
    const grouped = new Map<string, { fob: number; kg: number; count: number }>();
    ports.forEach((p) => {
      const key = getModalKey(p.via_name);
      const existing = grouped.get(key) || { fob: 0, kg: 0, count: 0 };
      existing.fob += p.fob;
      existing.kg += p.kg;
      existing.count += 1;
      grouped.set(key, existing);
    });
    const total = [...grouped.values()].reduce((s, v) => s + v.fob, 0);
    return [...grouped.entries()]
      .map(([key, val]) => ({
        key,
        ...val,
        pct: total > 0 ? (val.fob / total) * 100 : 0,
      }))
      .sort((a, b) => b.fob - a.fob);
  }, [ports]);

  if (!modalData.length) return null;

  const fmtFob = (n: number) =>
    n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` :
    n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` :
    `$${(n / 1e3).toFixed(0)}K`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
          <Package className="h-4 w-4 text-[#D80E16]" />
          Modal de Transporte
        </h3>
      </div>
      <div className="p-3 md:p-4">
        {/* Progress bars */}
        <div className="space-y-3 mb-4">
          {modalData.map((modal) => {
            const config = MODAL_CONFIG[modal.key] || {
              icon: <Package className="h-4 w-4" />,
              label: modal.key,
              color: "bg-slate-500",
            };
            return (
              <div key={modal.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg text-white", config.color)}>
                      {config.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{config.label}</span>
                    <span className="text-[10px] text-slate-400">({modal.count} URFs)</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{fmtFob(modal.fob)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", config.color)}
                    style={{ width: `${modal.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 text-right">{modal.pct.toFixed(1)}%</p>
              </div>
            );
          })}
        </div>
        {/* Top URFs */}
        <div className="border-t border-slate-100 pt-3">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Principais URFs
          </p>
          <div className="space-y-1.5">
            {ports
              .sort((a, b) => b.fob - a.fob)
              .slice(0, 5)
              .map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 truncate flex-1">
                    {p.urf_name.replace(/^\d+\s*-\s*/, "")}
                  </span>
                  <span className="font-mono font-semibold text-slate-800 ml-2">
                    {fmtFob(p.fob)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
