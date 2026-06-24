"use client";

import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap, Globe, BarChart3, ArrowRight, Star, Shield, Clock, Users } from "lucide-react";
import { PageTransition, PremiumButton } from "@/components/premium";
import { showSuccess } from "@/utils/toast";
import { motion } from "framer-motion";

const Plans = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "R$ 297",
      period: "/mês",
      description: "Para empresas iniciando no comércio exterior",
      features: [
        "Até 5 consultas NCM/mês",
        "Calculadora de impostos",
        "Suporte por email",
        "1 usuário",
      ],
      color: "from-slate-500 to-slate-600",
      popular: false,
    },
    {
      name: "Professional",
      price: "R$ 597",
      period: "/mês",
      description: "Para empresas com operação ativa",
      features: [
        "Consultas NCM ilimitadas",
        "Calculadora de impostos avançada",
        "Estatísticas de mercado",
        "Até 5 usuários",
        "Suporte prioritário",
        "API de integração",
      ],
      color: "from-red-600 to-rose-600",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Sob Consulta",
      period: "",
      description: "Para grandes operações e múltiplas filiais",
      features: [
        "Tudo do Professional",
        "Usuários ilimitados",
        "Consultoria dedicada",
        "Integrações customizadas",
        "SLA garantido",
        "Treinamentos",
      ],
      color: "from-slate-800 to-slate-900",
      popular: false,
    },
  ];

  const handleSubscribe = (planName: string) => {
    showSuccess(`Plano ${planName} selecionado! Em breve estará disponível.`);
  };

  return (
    <DashboardLayout title="Planos e Preços">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <Badge className="bg-red-100 text-red-700 border-none px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              <Zap className="w-3 h-3 mr-1" />
              Escolha seu plano
            </Badge>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Planos flexíveis para cada necessidade</h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Tenha acesso completo ao Market Intelligence, calculadora de impostos e todas as ferramentas para otimizar sua operação de comércio exterior.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`border-none shadow-xl rounded-[2.5rem] overflow-hidden relative ${plan.popular ? 'ring-4 ring-red-500/20 scale-105' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-red-600 text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <Star className="w-3 h-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                      {plan.popular ? <Zap className="w-8 h-8 text-white" /> : <Globe className="w-8 h-8 text-white" />}
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-500 font-medium mb-6">{plan.description}</p>
                    
                    <div className="mb-8">
                      <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-slate-400 font-bold">{plan.period}</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-sm font-bold text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <PremiumButton 
                      onClick={() => handleSubscribe(plan.name)} 
                      className={`w-full gap-2 ${plan.popular ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                      size="lg"
                    >
                      Assinar {plan.name}
                      <ArrowRight className="w-4 h-4" />
                    </PremiumButton>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black">Precisa de um plano customizado?</h3>
                    <p className="text-slate-300 font-medium max-w-xl">
                      Entre em contato com nosso time comercial para criar uma solução sob medida para sua operação.
                    </p>
                  </div>
                  <PremiumButton onClick={() => window.open('https://wa.me/5548988028025', '_blank')} variant="white" size="xl" className="bg-white text-slate-900 gap-2">
                    Falar com Consultor
                    <ArrowRight className="w-5 h-5" />
                  </PremiumButton>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Plans;