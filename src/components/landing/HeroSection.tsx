"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Play, ChevronRight } from "lucide-react";
import Logo from "@/components/Logo";
import Globe3D from "@/components/globe/Globe3D";
import TrxaGlobeVideo from "@/components/premium/TrxaGlobeVideo";

const stats = [
  { value: "300", label: "Bilhões em Exportações", suffix: "B+", prefix: "$" },
  { value: "195", label: "Países Mapeados", suffix: "" },
  { value: "8.2", label: "Milhões de Registros", suffix: "M+", delay: 0.1 },
  { value: "15", label: "Anos de Dados", suffix: "+", delay: 0.2 },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <Globe3D />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-gray-50 pointer-events-none" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-gray-50 opacity-60 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex justify-center"
        >
          <Badge className="bg-[#D80E16]/10 text-[#D80E16] border-[#D80E16]/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Market Intelligence em Tempo Real
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.1]"
        >
          Inteligência de Mercado{" "}
          <span className="inline-block text-[#D80E16]">
            em Tempo Real
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Dados de comércio exterior Brasil↔Mundo. Análise por IA, mapas interativos e tarifas em uma plataforma única.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="https://tradexa-auth-1m2euhgl4-sdasdas-7718s-projects.vercel.app/register">
            <Button size="lg" className="bg-[#D80E16] hover:bg-[#B00C12] text-white font-bold rounded-xl px-8 py-6 text-base shadow-[0_0_30px_rgba(216,14,22,0.25)] hover:shadow-[0_0_40px_rgba(216,14,22,0.35)] transition-all">
              Cadastro <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <a href="https://tradexa-export-deploy-hwltijksk-sdasdas-7718s-projects.vercel.app">
            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-xl px-8 py-6 text-base font-semibold">
              <Play className="mr-2 w-5 h-5" />
              Ver Demo
            </Button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-gray-900">
                {s.prefix}{s.value}{s.suffix}
              </div>
              <p className="text-sm font-medium text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400">
        <ChevronRight className="w-6 h-6 rotate-90" />
      </motion.div>
    </section>
  );
}
