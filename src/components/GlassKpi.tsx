import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassKpiProps {
  label: string;
  value: string;
  variant?: "emerald" | "blue" | "violet" | "amber" | "rose" | "cyan";
  delay?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

const variantMap = {
  emerald: {
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
    glow: "hover:shadow-emerald-500/20",
    text: "text-emerald-400",
    label: "text-emerald-300/80",
  },
  blue: {
    border: "border-sky-500/20",
    bg: "bg-sky-500/5",
    glow: "hover:shadow-sky-500/20",
    text: "text-sky-400",
    label: "text-sky-300/80",
  },
  violet: {
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    glow: "hover:shadow-violet-500/20",
    text: "text-violet-400",
    label: "text-violet-300/80",
  },
  amber: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    glow: "hover:shadow-amber-500/20",
    text: "text-amber-400",
    label: "text-amber-300/80",
  },
  rose: {
    border: "border-rose-500/20",
    bg: "bg-rose-500/5",
    glow: "hover:shadow-rose-500/20",
    text: "text-rose-400",
    label: "text-rose-300/80",
  },
  cyan: {
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
    glow: "hover:shadow-cyan-500/20",
    text: "text-cyan-400",
    label: "text-cyan-300/80",
  },
};

export const GlassKpi: React.FC<GlassKpiProps> = ({ label, value, variant = "emerald", delay = 0, icon: Icon }) => {
  const v = variantMap[variant];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-xl",
        "bg-slate-900/40 backdrop-blur-xl",
        "transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1",
        v.border,
        v.glow,
        "p-5"
      )}
    >
      <div className={cn(
        "absolute -top-3 -right-3 w-16 h-16 rounded-full opacity-20 blur-2xl",
        v.bg.replace("/5", "/40")
      )} />
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-xs font-black uppercase tracking-wider mb-1", v.label)}>{label}</p>
          <p className={cn("text-xl font-black tabular-nums", v.text)}>{value}</p>
        </div>
        {Icon && <Icon className={cn("w-5 h-5 mt-1 opacity-60", v.text)} />}
      </div>
    </motion.div>
  );
};

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-slate-700/30",
        "bg-slate-900/30 backdrop-blur-xl",
        "transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/5 hover:border-slate-600/40",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassKpi;