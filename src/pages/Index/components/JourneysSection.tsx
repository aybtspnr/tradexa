"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { PremiumCard, PremiumButton } from "@/components/premium";
import { journeys } from "../landingData";

export function JourneysSection() {
  const navigate = useNavigate();

  const handleComingSoon = () => {
    navigate("/");
  };

  return (
    <section id="jornadas" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 space-y-4 lg:space-y-6"
        >
          <Badge className="bg-red-100 text-red-700 border-none px-4 py-2 rounded-full text-xs font-bold">
            Jornadas por Perfil
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            A mesma plataforma, múltiplas entradas
          </h2>
          <p className="text-base lg:text-lg text-slate-600 font-medium">
            Em vez de deixar o usuário descobrir sozinho qual página visitar, a Tradexa oferece jornadas orientadas por perfil
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {journeys.map((journey, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <PremiumCard className="h-full" hoverEffect="lift">
                <div className="p-6 space-y-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${journey.color} rounded-2xl flex items-center justify-center`}>
                    <journey.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{journey.title}</h3>
                    <p className="text-sm text-slate-600 font-medium mt-2">{journey.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {journey.modules.map((module, idx) => (
                      <Badge key={idx} className="bg-slate-100 text-slate-700 border-none text-[10px] font-bold uppercase tracking-wide">
                        {module}
                      </Badge>
                    ))}
                  </div>
                  <PremiumButton
                    onClick={handleComingSoon}
                    variant="outline"
                    className="w-full mt-4"
                    size="md"
                  >
                    Abrir Jornada
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}