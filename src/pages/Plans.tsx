"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap, CheckCircle2, Crown, Star, ArrowRight, Loader2,
  Sparkles, Search, BarChart3, Calculator, Percent,
  Trophy, Bell, Globe, Building2, Ship, Anchor, BrainCircuit,
  Calendar, ArrowLeftRight, Code, Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { showError, showSuccess, showInfo } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import type { PlanType } from "@/lib/plan-features";
import { PLAN_PRICES, PLAN_LABELS } from "@/lib/usage-costs";

interface PlanDef {
  id: PlanType;
  name: string;
  price: number;
  popular?: boolean;
  color: string;
  features: string[];
  tools: { icon: React.ComponentType<{ className?: string }>; label: string }[];
}

const PLANS: PlanDef[] = [
  {
    id: "essential",
    name: "Essential",
    price: 0,
    color: "from-slate-500 to-slate-600",
    features: [
      "2 consultas IA NCM grátis",
      "Acesso ao dashboard",
      "Sem compromisso",
    ],
    tools: [
      { icon: Sparkles, label: "Classificar NCM (2×)" },
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 497,
    color: "from-blue-600 to-cyan-600",
    features: [
      "Consultas IA NCM",
      "Consultas HS/HTS",
      "Suporte por email",
      "Dados oficiais atualizados",
    ],
    tools: [
      { icon: Sparkles, label: "Classificar NCM" },
      { icon: Search, label: "Consulta HTS EUA" },
      { icon: BarChart3, label: "Comparar NCMs" },
      { icon: Calculator, label: "Simular Exportação" },
      { icon: Percent, label: "Alíquotas por País" },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 1297,
    color: "from-red-600 to-rose-600",
    features: [
      "Tudo do Growth",
      "Smart Rank, Alertas, Análise Avançada",
      "3x mais limite de uso",
      "Suporte prioritário",
    ],
    tools: [
      { icon: Sparkles, label: "Classificar NCM" },
      { icon: Search, label: "Consulta HTS EUA" },
      { icon: BarChart3, label: "Comparar NCMs" },
      { icon: Calculator, label: "Simular Exportação" },
      { icon: Percent, label: "Alíquotas por País" },
      { icon: Trophy, label: "Smart Rank" },
      { icon: Bell, label: "Alertas de Tarifas" },
      { icon: BrainCircuit, label: "Análise Avançada" },
      { icon: Globe, label: "Mapa de Importadores" },
      { icon: Calendar, label: "Calendário Sazonal" },
      { icon: Ship, label: "Frete Marítimo" },
      { icon: Anchor, label: "Port Intelligence" },
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 0,
    color: "from-slate-800 to-slate-900",
    features: [
      "Tudo do Professional",
      "API customizada",
      "Limites personalizados",
    ],
    tools: [
      { icon: Sparkles, label: "Classificar NCM" },
      { icon: Search, label: "Consulta HTS EUA" },
      { icon: BarChart3, label: "Comparar NCMs" },
      { icon: Calculator, label: "Simular Exportação" },
      { icon: Percent, label: "Alíquotas por País" },
      { icon: Trophy, label: "Smart Rank" },
      { icon: Bell, label: "Alertas de Tarifas" },
      { icon: BrainCircuit, label: "Análise Avançada" },
      { icon: Globe, label: "Mapa de Importadores" },
      { icon: Calendar, label: "Calendário Sazonal" },
      { icon: Ship, label: "Frete Marítimo" },
      { icon: Anchor, label: "Port Intelligence" },
      { icon: Code, label: "API customizada" },
    ],
  },
];

const planPrices: Record<string, { price: number; usdPrice: number }> = {
  essential: { price: 0, usdPrice: 0 },
  growth: { price: 497, usdPrice: 83 },
  professional: { price: 1297, usdPrice: 217 },
  business: { price: 4799, usdPrice: 800 },
};

const planHierarchy: Record<string, number> = { essential: 0, growth: 1, professional: 2, business: 3 };

const Plans = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [buyPlanId, setBuyPlanId] = useState<string | null>(null);

  const canUpgradeTo = (targetPlanId: string): boolean => {
    if (!currentPlan) return true;
    if (targetPlanId === currentPlan) return false;
    // Só pode fazer upgrade (nível maior), nunca downgrade
    const currentLevel = planHierarchy[currentPlan] ?? 0;
    const targetLevel = planHierarchy[targetPlanId] ?? 0;
    return targetLevel > currentLevel;
  };

  useEffect(() => {
    loadCurrentPlan();
    // Verifica retorno do Mercado Pago (ex: /plans?status=approved&plan=growth)
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const planId = params.get("plan");
    if (status === "approved" && planId) {
      handlePaymentSuccess(planId);
    } else if (status === "approved") {
      showSuccess("Pagamento aprovado! Seu plano será atualizado em instantes.");
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(() => loadCurrentPlan(), 3000);
    } else if (status === "rejected") {
      showError("Pagamento rejeitado. Verifique os dados do cartão e tente novamente.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "pending") {
      showInfo("Pagamento pendente. Aguarde a confirmação.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const loadCurrentPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_usage")
        .select("plan_type")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setCurrentPlan(data?.plan_type || "essential");
    } catch (err) {
      console.error("Erro ao carregar plano:", err);
    }
  };

  const handlePaymentSuccess = async (planId: string) => {
    // Limpa a URL imediatamente
    window.history.replaceState({}, "", window.location.pathname);

    // Aguarda a sessão ser restaurada (pode levar um tempo após redirect do MP)
    let user = null;
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase.auth.getUser();
      if (data.user) { user = data.user; break; }
      await new Promise(r => setTimeout(r, 800));
    }

    if (!user) {
      showError("Sessão expirada. Faça login novamente para ativar o plano.");
      return;
    }

    try {
      const resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from("user_usage")
        .upsert({
          user_id: user.id,
          plan_type: planId,
          used_percent: 0,
          tank_percent: 100,
          reset_date: resetDate,
          ai_queries_used: 0,
        }, { onConflict: "user_id" });

      if (error) throw error;

      setCurrentPlan(planId);
      showSuccess(`Plano ${PLAN_LABELS[planId] || planId} ativado!`);
      await loadCurrentPlan();
    } catch (err: any) {
      showError("Erro ao ativar plano: " + err.message);
    }
  };

  const handleSelectPlan = async (planId: string, provider?: string) => {
    if (planId === currentPlan) {
      showError("Você já está neste plano.");
      return;
    }

    if (planId === "essential") {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const resetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error } = await supabase
          .from("user_usage")
          .upsert({
            user_id: user.id,
            plan_type: planId,
            used_percent: 0,
            tank_percent: 100,
            reset_date: resetDate,
            ai_queries_used: 0,
          }, { onConflict: "user_id" });

        if (error) throw error;

        setCurrentPlan(planId);
        showSuccess("Plano Essential ativado com sucesso!");
      } catch (err: any) {
        showError("Erro ao ativar plano: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Planos pagos — redireciona para o Mercado Pago
    setBuyPlanId(planId);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const planInfo = planPrices[planId];
      if (!planInfo) throw new Error("Plano inválido");

      // Ambos Mercado Pago e Stripe usam BRL
      const isStripe = provider === "stripe";
      const priceCents = planInfo.price * 100;

      // tradexa.com.br redireciona 307 → www.tradexa.com.br (derruba o hash #/plans)
      const origin = window.location.origin.replace(/^https:\/\/tradexa\.com\.br$/, "https://www.tradexa.com.br");

      const { data, error } = await supabase.functions.invoke("payment-gateway", {
        body: {
          plan_id: planId,
          user_id: user.id,
          price_cents: priceCents,
          provider: isStripe ? "stripe" : undefined,
          title: planId === "professional" ? "TRADEXA Professional" : planId === "business" ? "TRADEXA Business" : "TRADEXA Growth",
          description: `Plano ${planId} — Acesso completo à plataforma TRADEXA`,
          back_urls: {
            success: `${origin}/plans?status=approved&plan=${planId}`,
            failure: `${origin}/plans?status=rejected`,
            pending: `${origin}/plans?status=pending`,
          },
        },
      })

      if (error) throw new Error(error.message)

      if (data?.url) {
        // Stripe checkout URL ou Mercado Pago sandbox/production URL
        showInfo("Redirecionando para checkout seguro...");
        setTimeout(() => { window.location.href = data.url }, 800)
      } else {
        throw new Error("URL de pagamento não retornada")
      }
    } catch (err: any) {
      showError("Erro ao gerar pagamento: " + err.message);
      setBuyPlanId(null);
    } finally {
      setLoading(false);
    }
  };

  useSeo({
    title: "Planos e Preços",
    description: "Escolha seu plano TRADEXA. Planos de inteligência comercial para exportadores e importadores com acesso a dados reais de comércio exterior.",
    keywords: "planos TRADEXA, preços inteligência comercial, assinatura comércio exterior",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planos e Preços"
        subtitle="Escolha o plano ideal para o seu negócio."
        variant="red"
        badges={[
          { label: "Preços em BRL", icon: <Zap className="w-3 h-3 mr-1" /> },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={cn(
              "relative rounded-3xl p-6 border-2 transition-all h-full flex flex-col",
              plan.popular
                ? "border-primary bg-[hsl(var(--brand-soft))] shadow-[var(--shadow-brand)]"
                : "border-[hsl(var(--border))] bg-white shadow-[var(--shadow-soft)]"
            )}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                  Mais Popular
                </div>
              )}

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                {plan.id === "business" ? <Shield className="w-6 h-6 text-white" /> :
                 plan.popular ? <Crown className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white" />}
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">{plan.name}</h3>

              <p className="text-3xl font-black text-slate-900 mb-2">
                {plan.id === "business"
                  ? "R$ 4.799+/mês"
                  : plan.price === 0
                    ? "Grátis"
                    : `R$ ${plan.price}/mês`}
              </p>

              <ul className="space-y-2 mb-4 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Ferramentas inclusas
                </p>
                <div className="flex flex-wrap gap-2">
                  {plan.tools.map((tool) => (
                    <Badge key={tool.label} variant="secondary" className="text-[10px] font-medium gap-1 px-2 py-0.5 rounded-md">
                      <tool.icon className="w-3 h-3" />
                      {tool.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                className={cn(
                  "w-full rounded-xl font-bold h-11 mt-auto",
                  currentPlan === plan.id
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : plan.popular
                      ? "bg-primary hover:bg-primary/90 text-white shadow-[var(--shadow-brand)]"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                )}
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading || !canUpgradeTo(plan.id)}
              >
                {currentPlan === plan.id ? (
                  <><CheckCircle2 className="w-4 h-4 mr-2" /> Plano Atual</>
                ) : buyPlanId === plan.id ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin [animation-duration:2.5s]" /> Gerando Pagamento...</>
                ) : (
                  <><ArrowRight className="w-4 h-4 mr-2" /> {plan.id === "essential" ? "Começar Grátis" : "Assinar"}</>
                )}
              </Button>
              {/* Stripe payment option */}
              {planPrices[plan.id]?.price > 0 && canUpgradeTo(plan.id) && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-bold h-9 mt-2 border-slate-300 text-slate-600 hover:bg-slate-50 text-xs"
                  onClick={() => handleSelectPlan(plan.id, "stripe")}
                  disabled={loading}
                >
                  Stripe — R$ {plan.id === "business" ? "4.799" : plan.id === "professional" ? "1.297" : "497"}
                </Button>
              )}
              {/* Business: botão de contato */}
              {plan.id === "business" && canUpgradeTo(plan.id) && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-bold h-9 mt-2 border-slate-300 text-slate-600 hover:bg-slate-50 text-xs"
                  onClick={() => window.open("mailto:help@tradexa.com.br?subject=Plano Business TRADEXA", "_blank")}
                  disabled={loading}
                >
                  Entrar em contato
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Todos os planos pagos incluem acesso a dados atualizados e atualizações em tempo real.
        </p>
      </div>
    </div>
  );
};

export default Plans;
