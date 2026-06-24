"use client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Zap, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  { step: "01", title: "Busque", desc: "Digite NCM, país ou produto. Nosso motor cruza milhões de registros em segundos.", icon: Zap },
  { step: "02", title: "Analise", desc: "Visualize mapas, rankings, tendências e comparações. A IA destaca oportunidades automaticamente.", icon: BarChart3 },
  { step: "03", title: "Aja", desc: "Monitore concorrentes, configure alertas e tome decisões baseadas em dados de comércio exterior.", icon: ArrowRight },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="bg-[#D80E16]/10 text-[#D80E16] border-[#D80E16]/20 mb-4 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            Como Funciona
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900">
            De dados brutos a <span className="text-[#D80E16]">decisões em 3 passos</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#D80E16]/30 hover:shadow-lg transition-all">
                <div className="text-5xl font-black text-gray-200 mb-4">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-[#D80E16]/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#D80E16]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
