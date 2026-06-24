"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParticleCanvasThemed } from "@/components/3d";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";

interface LandingSection {
  title: string;
  content: string;
  bullets?: string[];
}

interface ModuleLandingProps {
  icon: React.ElementType;
  color: string;
  title: string;
  subtitle: string;
  heroDesc: string;
  features: { name: string; desc: string }[];
  sections: LandingSection[];
  ctaRoute: string;
  relatedModules?: { label: string; route: string }[];
  seoTitle?: string;
  seoDescription?: string;
}

export function ModuleLandingTemplate({
  icon: Icon,
  color,
  title,
  subtitle,
  heroDesc,
  features,
  sections,
  ctaRoute,
  relatedModules,
  seoTitle,
  seoDescription,
}: ModuleLandingProps) {
  useSeo({
    title: seoTitle || `${title} — TRADEXA`,
    description: seoDescription || heroDesc,
    keywords: `comércio exterior, ${title.toLowerCase()}, TRADEXA, importação, exportação`,
  });
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.15} particleCount={30} color="216, 14, 22" connectionDist={120} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: color + "15" }}
            >
              <Icon className="w-8 h-8" style={{ color }} />
            </div>

            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              {subtitle}
            </Badge>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              {title}
            </h1>

            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed mb-10">
              {heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 px-8 py-6 text-base font-bold rounded-2xl shadow-[0_0_40px_rgba(216,14,22,0.25)] border-0 btn-glow"
                style={{ background: color }}
                asChild
              >
                <Link to={ctaRoute}>
                  <Sparkles className="w-5 h-5" />
                  Acessar Agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 border-[#0F111A]/15 text-[#0F111A] px-8 py-6 text-base font-bold rounded-2xl" asChild>
                <Link to="/register">Criar Conta Grátis</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F111A] mb-4">Principais Funcionalidades</h2>
            <p className="text-[#5E6278] text-lg">Tudo que você precisa em uma única ferramenta</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative rounded-2xl border border-black/[0.06] bg-white p-6 hover:shadow-[0_4px_24px_-8px_rgba(15,17,26,0.1)] hover:border-[#D80E16]/10 transition-all duration-300"
              >
                <Check className="w-5 h-5 mb-3" style={{ color }} />
                <h3 className="text-base font-bold text-[#0F111A] mb-2">{feat.name}</h3>
                <p className="text-sm text-[#5E6278] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      {sections.map((section, i) => (
        <section
          key={i}
          className={`py-20 md:py-24 px-4 sm:px-6 lg:px-8 ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAF9]"}`}
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-6">{section.title}</h2>
              <p className="text-[#5E6278] text-lg leading-relaxed mb-6">{section.content}</p>
              {section.bullets && (
                <ul className="space-y-3">
                  {section.bullets.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-3 text-[#5E6278]">
                      <Star className="w-4 h-4 mt-1 flex-shrink-0" style={{ color }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </section>
      ))}

      {/* Related Modules */}
      {relatedModules && relatedModules.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-8">Explore também</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {relatedModules.map((mod) => (
                <Link
                  key={mod.route}
                  to={mod.route}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold border border-black/[0.08] text-[#0F111A] hover:bg-black/[0.02] hover:border-[#D80E16]/20 transition-all"
                >
                  {mod.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Aprofunde-se — links para blog e recursos */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-extrabold text-[#0F111A] mb-3">Aprofunde seus conhecimentos</h2>
          <p className="text-[#5E6278] text-sm mb-8 max-w-xl mx-auto">
            Explore nossos guias, tutoriais e artigos sobre comércio exterior.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/blog" className="px-5 py-2.5 rounded-xl text-sm font-bold border border-black/[0.08] text-[#0F111A] hover:bg-black/[0.02] hover:border-[#D80E16]/20 transition-all">
              Blog — 100+ artigos
            </Link>
            <Link to="/guia-importacao" className="px-5 py-2.5 rounded-xl text-sm font-bold border border-black/[0.08] text-[#0F111A] hover:bg-black/[0.02] hover:border-[#D80E16]/20 transition-all">
              Guia de Importação
            </Link>
            <Link to="/guia-exportacao" className="px-5 py-2.5 rounded-xl text-sm font-bold border border-black/[0.08] text-[#0F111A] hover:bg-black/[0.02] hover:border-[#D80E16]/20 transition-all">
              Guia de Exportação
            </Link>
            <Link to="/glossario" className="px-5 py-2.5 rounded-xl text-sm font-bold border border-black/[0.08] text-[#0F111A] hover:bg-black/[0.02] hover:border-[#D80E16]/20 transition-all">
              Glossário COMEX
            </Link>
            <Link to="/recursos" className="px-5 py-2.5 rounded-xl text-sm font-bold border border-black/[0.08] text-[#0F111A] hover:bg-black/[0.02] hover:border-[#D80E16]/20 transition-all">
              Central de Recursos
            </Link>
          </div>
        </div>
      </section>


    </SiteLayout>
  );
}
