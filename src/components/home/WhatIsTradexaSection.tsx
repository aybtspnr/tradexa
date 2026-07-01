"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Database, Brain, Ship, ArrowRight, Sparkles,
  Globe, BarChart3, Search, Shield, Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════
   TYPES
   ═══════════════════════════════════════ */
interface PillarData {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  gradientFrom: string;
  gradientVia: string;
  highlight: { value: string; label: string }[];
  features: { icon: React.ElementType; text: string }[];
  description: string;
}

/* ═══════════════════════════════════════
   PILLAR CARD
   ═══════════════════════════════════════ */
function PillarCard({ pillar, index }: { pillar: PillarData; index: number }) {
  const Icon = pillar.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      {/* Gradient background card */}
      <div
        className="relative rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 h-full
          hover:shadow-[0_8px_40px_-16px_rgba(15,17,26,0.12)] hover:border-[#D80E16]/10
          transition-all duration-500 overflow-hidden"
      >
        {/* Gradient accent on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse 120% 80% at 50% -20%, ${pillar.color}08 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10">
          {/* Icon + Title row */}
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: pillar.color + "12" }}
            >
              <Icon className="w-7 h-7" style={{ color: pillar.color }} />
            </div>
            <div className="min-w-0">
              <div
                className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                style={{ color: pillar.color }}
              >
                {pillar.title}
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-[#0F111A] leading-tight">
                {pillar.subtitle}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-[#5E6278] leading-relaxed mb-6">
            {pillar.description}
          </p>

          {/* Feature pills */}
          <div className="space-y-2.5 mb-6">
            {pillar.features.map((f) => {
              const FIcon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-2.5">
                  <FIcon className="w-4 h-4 shrink-0" style={{ color: pillar.color }} />
                  <span className="text-sm font-medium text-[#0F111A]">{f.text}</span>
                </div>
              );
            })}
          </div>

          {/* Highlight stats */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-black/[0.04]">
            {pillar.highlight.map((h) => (
              <div
                key={h.label}
                className="flex items-baseline gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: pillar.color + "0d", color: pillar.color }}
              >
                <span className="text-base leading-none">{h.value}</span>
                <span className="opacity-70 font-medium">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   PILLARS DATA
   ═══════════════════════════════════════ */
const PILLARS: PillarData[] = [
  {
    icon: Database,
    title: "Pilar 1",
    subtitle: "Dados Completos",
    color: "#0ea5e9",
    gradientFrom: "#0ea5e9",
    gradientVia: "#06b6d4",
    description:
      "A maior base de dados de comércio exterior do Brasil. Registros oficiais, tarifas atualizadas e diretório global de importadores — tudo em um só lugar.",
    highlight: [
      { value: "12M+", label: "Registros" },
      { value: "31", label: "Países" },
    ],
    features: [
      { icon: Globe, text: "Dados de importação e exportação de 31 países" },
      { icon: BarChart3, text: "Tarifas, alíquotas e acordos comerciais atualizados" },
      { icon: Globe, text: "Diretório com 3.8M+ importadores globais por código HS" },
    ],
  },
  {
    icon: Brain,
    title: "Pilar 2",
    subtitle: "Inteligência com IA",
    color: "#D80E16",
    gradientFrom: "#D80E16",
    gradientVia: "#b80c12",
    description:
      "Transforme dados brutos em decisões estratégicas. Classificação automática de produtos, rankings de mercado e análises preditivas com inteligência artificial.",
    highlight: [
      { value: "8.700+", label: "Códigos NCM/HS" },
      { value: "99%", label: "Precisão na classificação" },
    ],
    features: [
      { icon: Search, text: "Classifique qualquer produto em NCM/HS/HTS por linguagem natural" },
      { icon: BarChart3, text: "Trade Intelligence com análises de mercado e concorrência" },
      { icon: Navigation, text: "Smart Rank: score automático de oportunidade por país" },
    ],
  },
  {
    icon: Ship,
    title: "Pilar 3",
    subtitle: "Execução Integrada",
    color: "#10b981",
    gradientFrom: "#10b981",
    gradientVia: "#059669",
    description:
      "Da cotação de frete ao despacho aduaneiro. Serviços operacionais integrados com a inteligência da plataforma — você pesquisa, analisa e executa sem sair do ecossistema.",
    highlight: [
      { value: "7+", label: "Serviços" },
      { value: "20+", label: "Armadores" },
    ],
    features: [
      { icon: Ship, text: "Cotação de frete com 20+ armadores e agentes internacionais" },
      { icon: Shield, text: "Despacho aduaneiro, fulfillment e representação comercial" },
      { icon: Navigation, text: "Rastreamento ao vivo de navios, aviões e containers" },
    ],
  },
];

/* ═══════════════════════════════════════
   TRUST BANNER — marcas/parceiros
   ═══════════════════════════════════════ */
const TRUST_POINTS = [
  { value: "175+", label: "Páginas de conteúdo técnico" },
  { value: "141", label: "Artigos no blog" },
  { value: "36", label: "Ferramentas disponíveis" },
  { value: "Grátis", label: "Para começar" },
];

/* ═══════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════ */
export function WhatIsTradexaSection() {
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9] overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D80E16]/15 to-transparent" />

      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-10 w-72 h-72 rounded-full bg-[#D80E16]/[0.02] blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#0ea5e9]/[0.02] blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            O que é a TRADEXA
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-5xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-5">
            Dados, inteligência e{" "}
            <span className="text-[#D80E16]">execução</span>
            {" "}— em uma plataforma
          </h2>
          <p className="text-base md:text-lg text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
            A TRADEXA conecta dados de comércio exterior, classificação
            fiscal com IA e serviços operacionais integrados.{" "}
            <span className="font-semibold text-[#0F111A]">
              Da pesquisa de mercado ao desembaraço aduaneiro.
            </span>
          </p>
        </motion.div>

        {/* ─── 3 Pillars Grid ─── */}
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6 mb-12 md:mb-16">
          {PILLARS.map((pillar, i) => (
            <React.Fragment key={pillar.title}>
              <PillarCard pillar={pillar} index={i} />
            </React.Fragment>
          ))}
        </div>

        {/* ─── Connector narrative ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 md:gap-6 flex-wrap justify-center">
            {["📊 Dados", "→", "🧠 Análise", "→", "🚢 Execução"].map((item, i) => (
              <span
                key={i}
                className={`text-sm font-extrabold tracking-wider ${
                  i % 2 === 0
                    ? "text-[#0F111A] px-3 py-1.5 rounded-lg bg-white border border-black/[0.06] shadow-sm"
                    : "text-[#D80E16] text-lg"
                }`}
              >
                {item}
              </span>
            ))}
          </div>
          <p className="text-sm text-[#5E6278] mt-4 max-w-md mx-auto">
            Um ecossistema completo onde a inteligência de dados vira operação real.
          </p>
        </motion.div>

        {/* ─── Trust Banner ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {TRUST_POINTS.map((p) => (
                <div key={p.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-extrabold text-[#0F111A]">
                    {p.value}
                  </div>
                  <div className="text-xs text-[#5E6278] font-medium mt-1">
                    {p.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── CTA ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-10"
        >
          <Button
            size="lg"
            className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white px-8 py-6 text-base font-bold rounded-2xl shadow-[0_0_40px_rgba(216,14,22,0.2)] hover:shadow-[0_0_60px_rgba(216,14,22,0.3)] transition-all border-0 btn-glow"
            asChild
          >
            <Link to="/register">
              <Sparkles className="w-5 h-5" />
              Explorar a Plataforma
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
