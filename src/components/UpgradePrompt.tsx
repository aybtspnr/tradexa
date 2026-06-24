import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Zap, Shield, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanType } from "@/lib/plan-features";

interface UpgradePromptProps {
  featureLabel: string;
  requiredPlan: PlanType;
  className?: string;
}

const PLAN_META: Record<PlanType, { icon: typeof Crown; color: string; label: string; desc: string; price: string }> = {
  essential: {
    icon: Star,
    color: "from-slate-500 to-slate-600",
    label: "Essential",
    desc: "Plano gratuito com 2 consultas IA NCM.",
    price: "Grátis",
  },
  growth: {
    icon: Zap,
    color: "from-blue-600 to-cyan-600",
    label: "Growth",
    desc: "Ferramentas básicas: IA NCM, HTS, Comparador, Simulador, Alíquotas.",
    price: "R$ 397/mês",
  },
  professional: {
    icon: Crown,
    color: "from-red-500 to-rose-600",
    label: "Professional",
    desc: "Desbloqueie análises avançadas, alertas de tarifas, Smart Rank e mapa de importadores.",
    price: "R$ 797/mês",
  },
  business: {
    icon: Shield,
    color: "from-slate-700 to-slate-900",
    label: "Business",
    desc: "Acesso total + API customizada, limites personalizáveis e suporte prioritário.",
    price: "Sob demanda",
  },
};

export function UpgradePrompt({ featureLabel, requiredPlan, className }: UpgradePromptProps) {
  const navigate = useNavigate();
  const meta = PLAN_META[requiredPlan];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50",
        className
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg",
          meta.color
        )}
      >
        <Lock className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-black text-slate-900 mb-1">
        {featureLabel} — {meta.label}
      </h3>
      <p className="text-sm text-slate-600 max-w-sm mb-5">{meta.desc}</p>
      <button
        onClick={() => navigate("/plans")}
        className={cn(
          "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105",
          "bg-gradient-to-r",
          meta.color
        )}
      >
        <Icon className="w-4 h-4" />
        Fazer Upgrade — {meta.price}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
