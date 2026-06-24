"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Phone, Mail, Clock } from "lucide-react";
import { PremiumButton } from "@/components/premium";

export function CTASection() {
  const navigate = useNavigate();

  const handleComingSoon = () => {
    navigate("/coming-soon");
  };

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-600 via-rose-600 to-red-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                Pronto para transformar sua operação logística?
              </h2>
              <p className="text-xl text-red-100 font-medium leading-relaxed">
                Comece com uma cotação gratuita e descubra como a TRADEXA pode reduzir custos e prazos da sua operação internacional.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Cotação em até 4 horas",
                "Suporte dedicado 24/7",
                "Parceiros verificados",
                "Tracking em tempo real",
                "Sem taxa de adesão",
                "Cancelamento flexível"
              ].map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                  <span className="text-sm font-bold text-white">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <PremiumButton
                onClick={handleComingSoon}
                variant="secondary"
                size="xl"
                className="bg-white text-red-600 hover:bg-slate-100 shadow-2xl"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </PremiumButton>
              <PremiumButton
                onClick={handleComingSoon}
                variant="outline"
                size="xl"
                className="bg-red-700 text-white hover:bg-red-800 border-2 border-white/30"
              >
                Ver Plataforma
              </PremiumButton>
            </div>
          </motion.div>

          {/* Right Contact Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
          >
            <h3 className="text-2xl font-black text-white mb-6">
              Fale com um especialista
            </h3>

            <div className="space-y-6">
              <a
                href="tel:+5548988028025"
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-200 uppercase tracking-wide">Telefone</p>
                  <p className="text-lg font-black text-white group-hover:text-red-100 transition-colors">
                    +55 48 98802-8025
                  </p>
                </div>
              </a>

              <a
                href="mailto:contato@tradexa.com.br"
                className="flex items-center gap-4 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors group"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-200 uppercase tracking-wide">E-mail</p>
                  <p className="text-lg font-black text-white group-hover:text-red-100 transition-colors">
                    contato@tradexa.com.br
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 bg-white/10 rounded-xl">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-200 uppercase tracking-wide">Horário de Atendimento</p>
                  <p className="text-base font-bold text-white">
                    Seg-Sex: 8h às 18h (Brasília)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-sm font-medium text-red-100 text-center">
                Tempo médio de resposta: <span className="font-black text-white">15 minutos</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}