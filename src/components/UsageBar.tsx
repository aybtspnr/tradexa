"use client";

import { useUsage } from "@/hooks/use-usage";
import { cn } from "@/lib/utils";
import { Zap, AlertTriangle } from "lucide-react";

export function UsageBar({ showLabel = true, className }: { showLabel?: boolean; className?: string }) {
  const { loading, percentUsed, used, tank, isLimited, isNearLimit, isAtLimit } = useUsage();

  if (loading || !isLimited) return null;

  const barColor =
    percentUsed >= 95 ? "bg-red-500" :
    percentUsed >= 80 ? "bg-amber-500" :
    "bg-emerald-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
          <Zap className="w-3 h-3" />
          {isAtLimit ? (
            <span className="text-red-600 flex items-center gap-0.5">
              <AlertTriangle className="w-3 h-3" /> LIMITE
            </span>
          ) : (
            <span>{percentUsed.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[9px] text-slate-400">{used.toFixed(1)}/{tank}</span>
      )}
    </div>
  );
}
