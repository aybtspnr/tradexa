"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/premium";
import { markets } from "../landingData";

export function MarketsSection() {
  return (
    <section id="mercados" className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16 space-y-4 lg:space-y-6"
        >
          <Badge className="bg-red-100 text-red-700 border-none px-4 py-2 rounded-full text-xs font-bold">
            Mercados Prioritários
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
            Hubs onde operação, distribuição e expansão já conversam
          </h2>
          <p className="text-base lg:text-lg text-slate-600 font-medium">
            A nova experiência deixa explícito que a Tradexa não vende apenas páginas de serviço — ela combina mercado, modal, presença local e execução em rede
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <PremiumCard className="h-full" hoverEffect="scale">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl">{market.flag}</span>
                    <Badge className="bg-green-100 text-green-700 border-none text-[10px] font-bold uppercase tracking-wide">
                      {market.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{market.country}</h3>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mt-1">{market.region}</p>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{market.description}</p>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}