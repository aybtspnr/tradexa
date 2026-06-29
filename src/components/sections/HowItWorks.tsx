"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Layers,
  MessageSquareQuote,
  Truck,
  PackageCheck,
  ArrowRight,
  BadgeCheck,
  Zap,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { PremiumCard, PremiumButton } from "@/components/premium";

const steps = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Entrada de Demanda",
    description:
      "O cliente registra sua necessidade logística na plataforma — seja frete internacional, importação, courier, e-commerce ou fulfillment.",
    details: [
      "Formulário inteligente por tipo de operação",
      "Upload de documentos e especificações",
      "Classificação automática de prioridade",
    ],
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
  },
  {
    step: "02",
    icon: Layers,
    title: "Combinação de Módulos",
    description:
      "A plataforma analisa a demanda e combina os módulos necessários — fretes, impostos, representação, hubs e distribuição.",
    details: [
      "Match inteligente de serviços complementares",
      "Visão unificada de modal, rota e prazo",
      "Sugestão de jornada otimizada por perfil",
    ],
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50",
  },
  {
    step: "03",
    icon: MessageSquareQuote,
    title: "Cotação e Propostas",
    description:
      "Parceiros operacionais verificados enviam propostas competitivas. O cliente compara preços, prazos e avaliações em um só lugar.",
    details: [
      "Múltiplas propostas em tempo real",
      "Benchmark transparente de custos",
      "Parceiros verificados por modal",
    ],
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
  },
  {
    step: "04",
    icon: Truck,
    title: "Execução e Tracking",
    description:
      "Após aprovação, a operação é executada com rastreamento em tempo real, atualizações automáticas e visibilidade total.",
    details: [
      "Tracking GPS em tempo real",
      "Atualizações de status automáticas",
      "Comunicação direta com operadores",
    ],
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50",
  },
  {
    step: "05",
    icon: PackageCheck,
    title: "Entrega e Documentação",
    description:
      "Entrega confirmada com compliance completo — documentação fiscal, regulatória e financeira integrada na plataforma.",
    details: [
      "Confirmação de entrega digital",
      "Documentação fiscal e aduaneira",
      "Fechamento financeiro automatizado",
    ],
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50",
  },
];

const highlights = [
  {
    icon: Zap,
    title: "Resposta em até 4h",
    description: "Cotações de frete marítimo em 2-4h, aéreo em 1h, rodoviário em 30min",
  },
  {
    icon: Globe,
    title: "7 Países Conectados",
    description: "Brasil, Alemanha, Romênia, Turquia, EUA, México e Chile",
  },
  {
    icon: ShieldCheck,
    title: "Parceiros Verificados",
    description: "Rede curada de transportadores, armadores e operadores logísticos",
  },
];

export function HowItWorksSection() {
  const navigate = useNavigate();

  const handleComingSoon = () => {
    navigate("/");
  };

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Como Funciona
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6">
            Da demanda à operação em{" "}
            <span className="text-[#D80E16]">
              5 etapas
            </span>
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            A Tradexa transforma intenção comercial em operação executável — conectando
            demanda, módulos, parceiros e execução em um único ecossistema.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 via-amber-200 via-red-200 to-green-200" />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((item, i) => {
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center"
                >
                  {/* Step Number Circle (desktop center) */}
                  <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div
                      className={`w-14 h-14 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-xl`}
                    >
                      <span className="text-lg font-black text-white">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div
                    className={`${isEven ? "lg:pr-20" : "lg:col-start-2 lg:pl-20"}`}
                  >
                    <PremiumCard className="h-full" hoverEffect="lift">
                      <div className="p-6 lg:p-8">
                        {/* Mobile Step Badge */}
                        <div className="flex items-center gap-3 mb-4 lg:hidden">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                          >
                            <span className="text-sm font-black text-white">
                              {item.step}
                            </span>
                          </div>
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}
                          >
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        {/* Desktop Icon */}
                        <div
                          className={`hidden lg:flex w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} items-center justify-center shadow-lg mb-5`}
                        >
                          <item.icon className="w-7 h-7 text-white" />
                        </div>

                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-3">
                          {item.title}
                        </h3>
                        <p className="text-slate-600 font-medium leading-relaxed mb-5">
                          {item.description}
                        </p>

                        <div className={`${item.bgColor} rounded-xl p-4 space-y-2.5`}>
                          {item.details.map((detail, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3"
                            >
                              <BadgeCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                              <span className="text-sm font-bold text-slate-700">
                                {detail}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PremiumCard>
                  </div>

                  {/* Empty column for alternating layout */}
                  {!isEven && <div className="hidden lg:block" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 lg:mt-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((highlight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 text-center h-full border border-slate-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <highlight.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">
                    {highlight.title}
                  </h4>
                  <p className="text-sm text-slate-600 font-medium">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <PremiumButton
            onClick={handleComingSoon}
            size="lg"
            className="gap-2"
          >
            Abrir uma Demanda
            <ArrowRight className="w-5 h-5" />
          </PremiumButton>
        </motion.div>
      </div>
    </section>
  );
}