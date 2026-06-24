"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badges?: { label: string; icon?: ReactNode; className?: string }[];
  actions?: ReactNode;
  className?: string;
  variant?: "default" | "emerald" | "red" | "slate" | "blue" | "violet" | "trxa";
}

const variantStyles = {
  default: "from-[#222222] via-[#333333] to-[#222222]",
  emerald: "from-[#0A3D2E] via-[#0F6E56] to-[#1D9E75]",
  red: "from-[#D80E16] via-[#E50716] to-[#B50C12]",
  slate: "from-slate-700 via-slate-600 to-slate-700",
  blue: "from-[#1A1A2E] via-[#16213E] to-[#0F3460]",
  violet: "from-violet-600 via-purple-600 to-indigo-600",
  trxa: "from-[#D80E16] via-[#222222] to-[#111111]",
};

const PageHeader = ({
  title,
  subtitle,
  badges,
  actions,
  className,
  variant = "default",
}: PageHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white p-4 lg:p-6",
        variantStyles[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {badges && badges.length > 0 && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {badges.map((badge, i) => (
                <Badge
                  key={i}
                  className={cn(
                    "bg-white/20 text-white border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-sm",
                    badge.className,
                  )}
                >
                  {badge.icon}
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          <h1 className="text-xl lg:text-2xl font-black tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/70 text-sm font-medium mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader;