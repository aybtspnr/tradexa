"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Search, Ship, Calculator, FileText,
  Shield, ArrowRight, Sparkles, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ═══════════════════════════════════════
   TYPES
   ═══════════════════════════════════════ */
interface BentoBlockData {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgClass: string;
  spanClass: string;
  cta?: { label: string; route: string };
  highlights?: { label: string; value: string }[];
}

/* ═══════════════════════════════════════
   BENTO BLOCK — single unit in the grid
   ═══════════════════════════════════════ */
function BentoBlock({ block, index }: { block: BentoBlockData; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border p-5 md:p-6 lg:p-7 overflow-hidden transition-all duration-300 hover:shadow-lg group ${block.bgClass} ${block.spanClass}`}
    >
      {/* Subtle gradient accent on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${block.color}10 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col">
        {/* Icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mb-4"
          style={{ background: block.color + "15" }}
        >
          <block.icon className="w-5 h-5" style={{ color: block.color }} />
        </div>

        {/* Title */}
        <h3 className="text-base md:text-lg font-extrabold text-[#0F111A] mb-2 leading-tight">
          {block.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#5E6278] leading-relaxed mb-4 flex-1">
          {block.description}
        </p>

        {/* Highlights (stat pills) */}
        {block.highlights && block.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {block.highlights.map((h) => (
              <div
                key={h.label}
                className="flex items-baseline gap-1 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: block.color + "10", color: block.color }}
              >
                <span className="text-base leading-none">{h.value}</span>
                <span className="opacity-70 font-medium">{h.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {block.cta && (
          <div className="mt-auto">
            {block.cta.label === "Criar Conta Grátis" ? (
              <Button
                className="w-full gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-xl h-11 font-bold text-sm border-0"
                asChild
              >
                <Link to={block.cta.route}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {block.cta.label}
                </Link>
              </Button>
            ) : (
              <Link
                to={block.cta.route}
                className="inline-flex items-center gap-1.5 text-sm font-bold hover:gap-2 transition-all"
                style={{ color: block.color }}
              >
                {block.cta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   BENTO BLOCKS DATA
   ═══════════════════════════════════════ */
const BLOCKS: BentoBlockData[] = [
  {
    id: "plataforma",
    icon: Globe,
    title: "Plataforma de Inteligência de Mercado para Comércio Exterior",
    description: "A TRADEXA unifica dados de comércio exterior de 31 países, classificação fiscal com IA, diretório global de importadores e logística ao vivo.",
    color: "#D80E16",
    bgClass: "bg-white border-[#D80E16]/[0.10]",
    spanClass: "md:col-span-2 md:row-span-1",
    highlights: [
      { label: "Países", value: "31" },
      { label: "NCM/HS", value: "8.700+" },
      { label: "Importadores", value: "3.8M+" },
      { label: "Registros", value: "12M+" },
    ],
  },
  {
    id: "ia",
    icon: Search,
    title: "Classificação com IA",
    description:
      "Descreva qualquer produto em português e receba o código NCM, HS e HTS em segundos — com alíquotas completas de II, IPI, PIS, COFINS e ICMS por estado.",
    color: "#10b981",
    bgClass: "bg-[#10b981]/[0.04] border-[#10b981]/[0.10]",
    spanClass: "md:col-span-1",
    cta: { label: "Classificar produto", route: "/landing/ncm-classifier" },
  },
  {
    id: "gratis",
    icon: Sparkles,
    title: "Ferramentas gratuitas",
    description:
      "Supply Chain Map, Track & Trace e Rastreamento de Carga são 100% gratuitos e abertos. Sem cadastro, sem cartão — use à vontade.",
    color: "#f59e0b",
    bgClass: "bg-[#f59e0b]/[0.04] border-[#f59e0b]/[0.10]",
    spanClass: "md:col-span-1",
    cta: { label: "Criar Conta Grátis", route: "/register" },
  },
  {
    id: "logistica",
    icon: Ship,
    title: "Logística ao vivo",
    description: "Navios de carga monitorados via satélite AIS, aviões cargueiros via ADS-B, rastreamento de containers (DHL, FedEx, UPS, Maersk, ZIM).",
    color: "#0ea5e9",
    bgClass: "bg-[#0ea5e9]/[0.04] border-[#0ea5e9]/[0.10]",
    spanClass: "md:col-span-2",
    cta: { label: "Ver Supply Chain Map", route: "/landing/supply-chain" },
  },
  {
    id: "calculadoras",
    icon: Calculator,
    title: "Calculadoras e ferramentas",
    description: "Simule Incoterms, Drawback, ACC/ACE, Precificação de Exportação, Pegada de Carbono e Acordos Comerciais.",
    color: "#8b5cf6",
    bgClass: "bg-[#8b5cf6]/[0.04] border-[#8b5cf6]/[0.10]",
    spanClass: "md:col-span-1",
    cta: { label: "Ver ferramentas", route: "/ferramentas" },
  },
  {
    id: "documentos",
    icon: FileText,
    title: "Documentos e conformidade",
    description: "Declaração de Importação (DI), Licença de Importação (LI), certificações ANVISA, INMETRO, MAPA e IBAMA.",
    color: "#ef4444",
    bgClass: "bg-[#ef4444]/[0.04] border-[#ef4444]/[0.10]",
    spanClass: "md:col-span-1",
    cta: { label: "Ver serviços", route: "/servicos" },
  },
];

/* ═══════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════ */
export function BentoGridSection() {
  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D80E16]/15 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-[11px] font-bold uppercase tracking-[0.2em] mb-5">
            O que é a TRADEXA
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-5">
            Uma plataforma.{" "}
            <span className="text-[#D80E16]">
              Todo o comércio exterior.
            </span>
          </h2>
          <p className="text-base md:text-lg text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
            Da classificação fiscal à logística internacional — tudo integrado,
            atualizado e descomplicado.{" "}
            <span className="font-semibold text-[#0F111A]">
              Sem planilhas, sem complexidade.
            </span>
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 auto-rows-auto">
          {BLOCKS.map((block, i) => (
            <BentoBlock key={block.id} block={block} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
