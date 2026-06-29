"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight } from "lucide-react";
import { PremiumButton } from "@/components/premium";

export function HeroSection() {
  const navigate = useNavigate();

  const handleComingSoon = () => {
    navigate("/");
  };

  return (
    <section id="ecossistema" className="pt-24 lg:pt-32 pb-16 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-red-50/30">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto space-y-6 lg:space-y-8"
        >
          <Badge className="bg-red-100 text-red-700 border-none px-4 py-2 rounded-full text-xs font-bold shadow-lg shadow-red-100">
            <Zap className="w-4 h-4 mr-2 inline" />
            Ecossistema Tradexa
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Fretes, importações, couriers, e-commerce e fulfillment em{" "}
            <span className="text-[#D80E16]">
              uma só plataforma
            </span>
          </h1>
          
          <p className="text-base lg:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            A Tradexa reposiciona a operação internacional como um ecossistema integrado: fretes internacionais, radar, remessas com desconto via couriers B2B/B2C, e-commerce, hubs de fulfillment, representação no exterior e no Brasil, clientes nacionais, operação rodoviária, tracking e financeiro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <PremiumButton 
              onClick={handleComingSoon}
              size="lg"
              className="gap-2 shadow-xl shadow-red-200"
            >
              Solicitar Atendimento
              <ArrowRight className="w-5 h-5" />
            </PremiumButton>
            <PremiumButton 
              onClick={handleComingSoon}
              variant="outline"
              size="lg"
              className="border-2"
            >
              Ver a Plataforma Conectada
            </PremiumButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}