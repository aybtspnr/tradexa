"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { name: "Dashboard de Importações/Exportações", free: true, premium: true },
  { name: "Consulta NCM/HS", free: true, premium: true },
  { name: "Mapas Interativos", free: true, premium: true },
  { name: "Ranking de Empresas (top 20)", free: true, premium: true },
  { name: "Alertas Básicos (até 3)", free: true, premium: true },
  { name: "Relatórios Exportáveis (PDF/Excel)", free: false, premium: true },
  { name: "Análise de Tendências Avançada", free: false, premium: true },
  { name: "Dados Cruzados BR↔EUA", free: false, premium: true },
  { name: "Alertas Ilimitados", free: false, premium: true },
  { name: "API de Acesso", free: false, premium: true },
  { name: "Relatórios White-label", free: false, premium: true },
  { name: "Suporte Prioritário", free: false, premium: true },
];

export default function FreeVsPremiumSection() {
  return (
    <section className="relative py-24 md:py-32 bg-slate-50">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Escolha seu Plano
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Comece grátis e evolua conforme seu negócio cresce. Sem compromisso.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-white border border-slate-200 p-6 md:p-8"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Gratuito</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-900">R$ 0</span>
                <span className="text-slate-600">/mês</span>
              </div>
              <p className="text-slate-600 text-sm mt-2">Ideal para explorar a plataforma e pesquisas pontuais.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {f.free ? (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  )}
                  <span className={f.free ? "text-slate-700" : "text-slate-600"}>{f.name}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant="outline"
              className="w-full gap-2 border-slate-200 text-slate-900 hover:bg-slate-50 py-6 text-base font-semibold rounded-xl"
            >
              <Link to="/register">Criar Conta Gratuita</Link>
            </Button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl bg-gradient-to-br from-[#D80E16] to-[#b80b12] text-white p-6 md:p-8 relative shadow-xl shadow-[#D80E16]/20"
          >
            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              MAIS POPULAR
            </div>
            <div className="mb-6">
              <p className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-2">Premium</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">R$ 97</span>
                <span className="text-white/70">/mês</span>
              </div>
              <p className="text-white/80 text-sm mt-2">Para quem leva o comércio exterior a sério e precisa de dados avançados.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {f.premium ? (
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-white/30 flex-shrink-0" />
                  )}
                  <span className={f.premium ? "text-white" : "text-white/40"}>{f.name}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className="w-full gap-2 bg-white hover:bg-slate-100 text-[#D80E16] py-6 text-base font-semibold rounded-xl"
            >
              <Link to="/register">Começar 14 Dias Grátis</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
