"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/premium";
import { platformModules } from "../landingData";

export function PlatformVisionSection() {
  return (
    <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 space-y-4 lg:space-y-6"
        >
          <Badge className="bg-red-100 text-red-700 border-none px-4 py-2 rounded-full text-xs font-bold">
            Visão de Plataforma
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            Boot Operacional Tradexa
          </h2>
          <p className="text-base lg:text-lg text-slate-600 font-medium">
            Uma visão única para captar demanda, combinar módulos e transformar intenção comercial em operação executável
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformModules.map((module, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <PremiumCard className="h-full">
                <div className="p-6 space-y-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{module.title}</h3>
                    <Badge className="mt-2 bg-green-100 text-green-700 border-none text-[10px] font-bold uppercase tracking-wide">
                      {module.status}
                    </Badge>
                  </div>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}