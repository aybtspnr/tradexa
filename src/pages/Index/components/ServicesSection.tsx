"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ChevronDown, ArrowRight } from "lucide-react";
import { PremiumCard, PremiumButton } from "@/components/premium";
import { services } from "../landingData";

export function ServicesSection() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleComingSoon = () => {
    navigate("/");
  };

  return (
    <section id="servicos" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 space-y-4 lg:space-y-6"
        >
          <Badge className="bg-red-100 text-red-700 border-none px-4 py-2 rounded-full text-xs font-bold">
            O Que Fazemos
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            Cada frente comercial entra como módulo de uma plataforma única
          </h2>
          <p className="text-base lg:text-lg text-slate-600 font-medium">
            Os cards abaixo já funcionam como porta de entrada de demanda. Cada um explica o serviço, mostra benefícios e indica como ele se conecta ao restante do ecossistema Tradexa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => {
            const isExpanded = expandedId === service.id;
            
            return (
              <div key={service.id} className="h-full">
                <PremiumCard 
                  className={`h-full transition-all duration-300 ${isExpanded ? 'ring-2 ring-red-500 shadow-xl' : ''}`} 
                  hoverEffect="lift"
                >
                  <div className="p-6 lg:p-8 space-y-4 lg:space-y-6">
                    {/* Header - Clickable Area */}
                    <div 
                      className="cursor-pointer select-none"
                      onClick={() => toggleExpanded(service.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleExpanded(service.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
                          <service.icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                        </div>
                        <ChevronDown 
                          className={`w-6 h-6 text-slate-600 transition-all duration-300 ${isExpanded ? 'rotate-180 text-red-600' : ''}`}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="text-xl lg:text-2xl font-black text-slate-900">{service.title}</h3>
                        <p className="text-sm lg:text-base text-slate-600 font-medium">{service.shortDesc}</p>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key={`content-${service.id}`}
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-4 lg:space-y-6 pt-4 border-t border-slate-100">
                            <div>
                              <p className="text-sm lg:text-base text-slate-600 font-medium leading-relaxed">
                                {service.fullDesc}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className={`p-4 ${service.bgColor} rounded-xl border border-slate-200`}>
                                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wide mb-2">Benefício</h4>
                                <p className="text-xs font-bold text-slate-700">{service.benefits}</p>
                              </div>
                              <div className={`p-4 ${service.bgColor} rounded-xl border border-slate-200`}>
                                <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wide mb-2">Integração</h4>
                                <p className="text-xs font-bold text-slate-700">{service.integration}</p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Recursos Incluídos:</h4>
                              <ul className="space-y-2">
                                {service.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                                    <span className="text-sm text-slate-700 font-bold">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <PremiumButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComingSoon();
                                }}
                                className="flex-1 gap-2"
                                size="md"
                              >
                                Ver Detalhes
                                <ArrowRight className="w-4 h-4" />
                              </PremiumButton>
                              <PremiumButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComingSoon();
                                }}
                                variant="outline"
                                className="flex-1"
                                size="md"
                              >
                                Abrir Demanda
                              </PremiumButton>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </PremiumCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}