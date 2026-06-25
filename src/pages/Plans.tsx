"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Zap, CheckCircle2, Crown, Star, ArrowRight, Loader2,
  Sparkles, Search, BarChart3, Calculator, Percent,
  Trophy, Bell, Globe, Building2, Ship, Anchor, BrainCircuit,
  Calendar, ArrowLeftRight, Code, Shield, Download, InfinityIcon,
  Database, Lock, X
} from "lucide-react";
import { motion } from "framer-motion";
import { showError, showSuccess, showInfo } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import type { PlanType } from "@/lib/plan-features";
import { PLAN_PRICES, PLAN_LABELS } from "@/lib/usage-costs";
import MercadoPagoBrick from "@/components/MercadoPagoBrick";

interface PlanDef {
  id: PlanType;
  name: string;
  price: number;
  popular?: boolean;
  color: string;
  description: string;
  features: string[];
  limits: string[];
  tools: { icon: React.ComponentType<{ className?: string }>; label: string }[];
  ctaLabel: string;
}

const PLANS: PlanDef[] = [
  {
    id: "essential",
    name: "Essencial",
    price: 0,
    color: "from-slate-500 to-slate-600",
    description: "Para conhecer a plataforma.",
    features: [
      "Classificador IA NCM — 2 consultas/mês",
      "Import/Export Intelligence — 3 consultas/mês",
      "Todas as ferramentas liberadas",
      "Dashboard com dados reais",
    ],
    limits: [
      "2 consultas IA NCM/mês",
      "3 visualizações Intel Data/mês",
      "Demais ferramentas: uso gratuito",
    ],
    tools: [
      { icon: Sparkles, label: "IA NCM (2×)" },
      { icon: Search, label: "HTS EUA" },
      { icon: BarChart3, label: "Comparar NCMs" },
      { icon: Calculator, label: "Simular Exportação" },
      { icon: Percent, label: "Alíquotas" },
    ],
    ctaLabel: "Começar Grátis",
  },
  {
    id: "growth",
    name: "Growth",
    price: 289,
    popular: true,
    color: "from-blue-600 to-cyan-600",
    description: "Para quem opera comércio exterior.",
    features: [
      "IA NCM ilimitada via tanque",
      "Intel Data ilimitado via tanque",
      "Todas as ferramentas liberadas",
      "Custo reduzido: 0.4× (2.5× mais ações)",
      "Suporte por email",
    ],
    limits: [
      "Tanque mensal de 100%",
      "Cada consulta IA gasta ~3.2%",
      "Intel Data gasta ~2% cada",
      "~25 consultas IA ou ~50 Intel/tanque",
    ],
    tools: [
      { icon: Sparkles, label: "IA NCM" },
      { icon: Search, label: "HTS EUA" },
      { icon: BarChart3, label: "Comparar NCMs" },
      { icon: Calculator, label: "Simular Exportação" },
      { icon: Percent, label: "Alíquotas" },
      { icon: Trophy, label: "Smart Rank" },
      { icon: Bell, label: "Alertas" },
      { icon: BrainCircuit, label: "Análise Avançada" },
      { icon: Globe, label: "Mapa Importadores" },
      { icon: Ship, label: "Frete Marítimo" },
    ],
    ctaLabel: "Assinar Growth",
  },
  {
    id: "business",
    name: "Business",
    price: 3200,
    color: "from-slate-800 to-slate-900",
    description: "Tudo ilimitado. Sem preocupações.",
    features: [
      "Tudo do Growth + ilimitado",
      "IA NCM — sem limites",
      "Intel Data — sem limites",
      "Exportação CSV e PDF liberada",
      "Suporte prioritário",
    ],
    limits: [
      "Sem tanque — uso ilimitado",
      "Sem contagem de consultas",
      "Sem restrições de exportação",
    ],
    tools: [
      { icon: Sparkles, label: "IA NCM" },
      { icon: Search, label: "HTS EUA" },
      { icon: BarChart3, label: "Comparar NCMs" },
      { icon: Calculator, label: "Simular Exportação" },
      { icon: Percent, label: "Alíquotas" },
      { icon: Trophy, label: "Smart Rank" },
      { icon: Bell, label: "Alertas" },
      { icon: BrainCircuit, label: "Análise Avançada" },
      { icon: Globe, label: "Mapa Importadores" },
      { icon: Calendar, label: "Calendário Sazonal" },
      { icon: Ship, label: "Frete Marítimo" },
      { icon: Anchor, label: "Port Intelligence" },
      { icon: Database, label: "CSV/PDF Export" },
    ],
    ctaLabel: "Assinar Business",
  },
];

const planPrices: Record<string, { price: number; usdPrice: number }> = {
  essential: { price: 0, usdPrice: 0 },
  growth: { price: 289, usdPrice: 48 },
  business: { price: 3200, usdPrice: 533 },
};

const planHierarchy: Record<string, number> = { essential: 0, growth: 1, business: 2 };

const Plans = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [buyPlanId, setBuyPlanId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingPreferenceId, setPendingPreferenceId] = useState<string | null>(null);
  const [pendingPublicKey, setPendingPublicKey] = useState<string>("");
  const [pendingPlanName, setPendingPlanName] = useState<string>("");
  const [brickReady, setBrickReady] = useState(false);

  const canUpgradeTo = (targetPlanId: string): boolean => {
    if (!currentPlan) return true;
    if (targetPlanId === currentPlan) return false;
    const currentLevel = planHierarchy[currentPlan] ?? 0;
    const targetLevel = planHierarchy[targetPlanId] ?? 0;
    return targetLevel > currentLevel;
  };

  useEffect(() => {
    loadCurrentPlan();
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
      // Sanitize legacy plans
      const raw = data?.plan_type || "essential";
      const sanitized = raw === "professional" ? "growth" : raw === "enterprise" ? "business" : raw;
      setCurrentPlan(sanitized);
    } catch (err) {
      console.error("Erro ao carregar plano:", err);
    }
  };

  const handlePaymentSuccess = async (planId: string) => {
    window.history.replaceState({}, "", window.location.pathname);

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
      showSuccess(`Plano ${PLAN_LABELS[planId as PlanType] || planId} ativado!`);
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
        showSuccess("Plano Essencial ativado com sucesso!");
      } catch (err: any) {
        showError("Erro ao ativar plano: " + err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Planos pagos — abre Wallet Brick com Mercado Pago
    setBuyPlanId(planId);
    setLoading(true);
    setBrickReady(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const planInfo = planPrices[planId];
      if (!planInfo) throw new Error("Plano inválido");

      const isStripe = provider === "stripe";
      const priceCents = planInfo.price * 100;

      const origin = window.location.origin.replace(/^https:\/\/tradexa\.com\.br$/, "https://www.tradexa.com.br");

      const { data, error } = await supabase.functions.invoke("payment-gateway", {
        body: {
          plan_id: planId,
          user_id: user.id,
          price_cents: priceCents,
          provider: isStripe ? "stripe" : undefined,
          title: planId === "business" ? "TRADEXA Business" : "TRADEXA Growth",
          description: `Plano ${planId} — Acesso completo à plataforma TRADEXA`,
          back_urls: {
            success: `${origin}/plans?status=approved&plan=${planId}`,
            failure: `${origin}/plans?status=rejected`,
            pending: `${origin}/plans?status=pending`,
          },
        },
      });

      if (error) throw new Error(error.message);

      if (data?.preference_id) {
        // Wallet Brick — show inline payment dialog
        setPendingPreferenceId(data.preference_id);
        setPendingPublicKey(data.public_key || "");
        setPendingPlanName(planId === "business" ? "Business" : "Growth");
        setShowPaymentDialog(true);
      } else if (data?.url) {
        // Fallback: redirect (Stripe or no public key)
        showInfo("Redirecionando para checkout seguro...");
        setTimeout(() => { window.location.href = data.url; }, 800);
      } else {
        throw new Error("URL de pagamento não retornada");
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
                {plan.id === "business" ? <Crown className="w-6 h-6 text-white" /> :
                 plan.id === "growth" ? <Zap className="w-6 h-6 text-white" /> :
                 <Star className="w-6 h-6 text-white" />}
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-500 mb-3">{plan.description}</p>

              <p className="text-3xl font-black text-slate-900 mb-2">
                {plan.price === 0 ? "Grátis" : `R$ ${plan.price.toLocaleString("pt-BR")}/mês`}
              </p>

              {/* Destaque "Tudo Ilimitado" no Business */}
              {plan.id === "business" && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 rounded-lg px-3 py-1.5 mb-3">
                  <InfinityIcon className="w-3.5 h-3.5" />
                  Tudo ilimitado — sem limites de uso
                </div>
              )}

              {/* Feature list */}
              <ul className="space-y-2 mb-3 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Limits info */}
              <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  {plan.id === "business" ? "SEM LIMITES" : "LIMITES"}
                </p>
                <ul className="space-y-1">
                  {plan.limits.map((limit) => (
                    <li key={limit} className="flex items-start gap-1.5 text-[11px] text-slate-500">
                      <span className="text-slate-300 mt-0.5">•</span>
                      {limit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tools badges */}
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Ferramentas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {plan.tools.map((tool) => (
                    <Badge key={tool.label} variant="secondary" className="text-[10px] font-medium gap-1 px-2 py-0.5 rounded-md">
                      <tool.icon className="w-3 h-3" />
                      {tool.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
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
                  <><ArrowRight className="w-4 h-4 mr-2" /> {plan.ctaLabel}</>
                )}
              </Button>

              {/* Stripe alternate payment */}
              {planPrices[plan.id]?.price > 0 && canUpgradeTo(plan.id) && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl font-bold h-9 mt-2 border-slate-300 text-slate-600 hover:bg-slate-50 text-xs"
                  onClick={() => handleSelectPlan(plan.id, "stripe")}
                  disabled={loading}
                >
                  Stripe — R$ {plan.id === "business" ? "3.200" : "289"}
                </Button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Payment Dialog — Mercado Pago Wallet Brick */}
      <Dialog open={showPaymentDialog} onOpenChange={(open) => {
        if (!open) {
          setShowPaymentDialog(false);
          setPendingPreferenceId(null);
          setBuyPlanId(null);
          setBrickReady(false);
        }
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
          <div className="relative p-6 pb-4 border-b border-slate-100">
            <button
              onClick={() => {
                setShowPaymentDialog(false);
                setPendingPreferenceId(null);
                setBuyPlanId(null);
                setBrickReady(false);
              }}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <DialogHeader className="text-left">
              <DialogTitle className="text-lg font-black text-slate-900">
                Plano {pendingPlanName}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Escolha a forma de pagamento abaixo
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6">
            {pendingPreferenceId && (
              <MercadoPagoBrick
                preferenceId={pendingPreferenceId}
                publicKey={pendingPublicKey}
                onReady={() => setBrickReady(true)}
                onError={(err) => {
                  showError(err);
                  setBrickReady(false);
                }}
              />
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Pagamento processado com segurança pelo Mercado Pago.
                Seu plano é ativado automaticamente após a confirmação.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-center">
        <p className="text-sm text-slate-500">
          Todos os planos pagos incluem acesso a dados atualizados e atualizações em tempo real.
        </p>
      </div>
    </div>
  );
};

export default Plans;
