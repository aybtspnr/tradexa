"use client";

import { useUsage } from "@/hooks/use-usage";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Zap, Info, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import { PLAN_LABELS } from "@/lib/usage-costs";

export default function MyUsage() {
  const { percentUsed, tank, used, plan, isNearLimit, isAtLimit, isLimited } = useUsage();

  useSeo({
    title: "Meu Uso",
    description: "Acompanhe seu consumo mensal da plataforma TRADEXA. Visualize créditos restantes e histórico de uso das ferramentas de inteligência comercial.",
  });

  const barColor = isAtLimit
    ? "bg-red-400"
    : isNearLimit
    ? "bg-amber-400"
    : "bg-emerald-400";

  const textColor = isAtLimit
    ? "text-red-500"
    : isNearLimit
    ? "text-amber-500"
    : "text-emerald-500";

  const planLabel = PLAN_LABELS[plan] || plan;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title="Meu Uso"
        subtitle="Acompanhe sua quota mensal na plataforma"
        badges={[
          {
            label: isLimited ? `${planLabel}` : "Ilimitado",
            icon: <Zap className="w-3 h-3 mr-1" />,
          },
        ]}
      />

      {/* ── Barra principal ── */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={cn("w-5 h-5", textColor)} />
              <h2 className="text-sm font-black text-slate-900">
                Percentagem usada este mês
              </h2>
            </div>
            <span className={cn("text-2xl font-black", textColor)}>
              {isLimited ? `${percentUsed.toFixed(1)}%` : "∞"}
            </span>
          </div>

          {isLimited && (
            <>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", barColor)}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </>
          )}

          <div className="p-3 rounded-xl bg-slate-50 flex items-start gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Seu plano <strong className="text-slate-900">{planLabel}</strong> tem uma barra mensal de
              <strong className="text-slate-900"> {tank}%</strong>.
              {" "}Quando chegar a{" "}
              <strong className="text-amber-600">80%</strong> o indicador fica amarelo. Aos{" "}
              <strong className="text-red-500">100%</strong> você precisa fazer upgrade ou esperar o reset mensal.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Detalhes do plano ── */}
      <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white">
        <CardContent className="p-6 space-y-3">
          <h2 className="text-sm font-black text-slate-900">Resumo do plano</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Plano</p>
              <p className="font-bold text-slate-900">{planLabel}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Tank mensal</p>
              <p className="font-bold text-slate-900">{isLimited ? `${tank}%` : "Ilimitado"}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Usado</p>
              <p className={cn("font-bold", textColor)}>{used.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
