"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TrxaCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  dark?: boolean;
  onClick?: () => void;
}

export function TrxaCard({ children, className, hover = true, glow = false, dark = false, onClick }: TrxaCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "rounded-2xl overflow-hidden transition-all duration-300",
        dark ? "bg-[#111111] border-white/[0.06]" : "bg-white border-slate-200/60",
        hover && "hover:shadow-lg hover:-translate-y-0.5",
        glow && "shadow-[0_0_40px_rgba(216,14,22,0.08)]",
        className,
      )}
    >
      {children}
    </Card>
  );
}

interface TrxaSectionProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  id?: string;
}

export function TrxaSection({ children, className, dark = false, id }: TrxaSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 sm:py-20 lg:py-24",
        dark ? "bg-[#0A0A0A]" : "bg-white",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

interface TrxaButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function TrxaButton({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled,
  type = "button",
}: TrxaButtonProps) {
  const sizeClasses = {
    sm: "h-9 px-4 text-xs",
    md: "h-12 px-6 text-sm",
    lg: "h-14 px-8 text-base",
  };

  const variantClasses = {
    primary: cn(
      "bg-[#D80E16] text-white font-bold rounded-xl",
      "hover:bg-[#E50716] hover:shadow-[0_0_30px_rgba(216,14,22,0.3)]",
      "active:scale-[0.98] transition-all duration-200",
      disabled && "opacity-50 cursor-not-allowed hover:shadow-none",
    ),
    secondary: cn(
      "bg-white text-[#222222] font-bold rounded-xl border border-slate-200",
      "hover:border-[#D80E16]/30 hover:text-[#D80E16]",
      "active:scale-[0.98] transition-all duration-200",
    ),
    ghost: cn(
      "bg-transparent text-[#666666] font-semibold rounded-xl",
      "hover:bg-slate-50 hover:text-[#222222]",
      "active:scale-[0.98] transition-all duration-200",
    ),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(sizeClasses[size], variantClasses[variant], className)}
    >
      {children}
    </button>
  );
}

interface TrxaKpiProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: ReactNode;
  dark?: boolean;
}

export function TrxaKpi({ label, value, trend, trendUp, icon, dark = false }: TrxaKpiProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-5 border backdrop-blur-sm",
        dark
          ? "bg-white/[0.03] border-white/[0.06]"
          : "bg-white border-slate-200/60 shadow-sm",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", dark ? "text-white/40" : "text-slate-600")}>
          {label}
        </span>
        {icon && <div className={cn("p-1.5 rounded-lg", dark ? "bg-white/[0.06]" : "bg-slate-50")}>{icon}</div>}
      </div>
      <p className={cn("text-2xl font-black tracking-tight", dark ? "text-white" : "text-[#222222]")}>{value}</p>
      {trend && (
        <p className={cn("text-xs font-bold mt-1", trendUp ? "text-emerald-500" : "text-red-500")}>
          {trendUp ? "↑" : "↓"} {trend}
        </p>
      )}
    </motion.div>
  );
}
