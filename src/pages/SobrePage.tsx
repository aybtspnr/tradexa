"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import {
  ArrowRight, ShieldCheck, Zap, Globe, BarChart3,
  TrendingUp, Search, Sparkles, Target, CheckCircle2,
  Database, Users, Ship, BellRing, Award, Star,
} from "lucide-react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    let animFrame: number;
    const duration = 2000;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      start = Math.floor(eased * target);
      setCount(start);
      if (progress < 1) animFrame = requestAnimationFrame(step);
    };
    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString("pt-BR")}{suffix}
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function SobrePage() {
  useSeo({
    title: "Sobre a TRADEXA — Inteligência Comercial Brasileira",
    description: "Plataforma brasileira de inteligência comercial. Dados de 31 países, IA para NCM/HS, milhões de importadores e mapas logísticos.",
    keywords: "tradexa, inteligência comercial, comércio exterior, plataforma exportação, classificação NCM",
    canonical: "https://www.tradexa.com.br/sobre",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "TRADEXA",
      "description": "Plataforma de Market Intelligence para Comércio Exterior",
      "url": "https://www.tradexa.com.br",
    },
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.05),transparent)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              Quem Somos
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              A plataforma que está{" "}
              <span className="text-[#D80E16]">revolucionando</span>
              {" "}o comércio exterior brasileiro
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              Milhares de profissionais já confiam na TRADEXA para encontrar compradores, comparar tarifas, classificar produtos e tomar decisões baseadas em dados reais — não em achismos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { value: 31, suffix: "", label: "Países com tarifas oficiais", icon: Globe, color: "#10b981" },
              { value: 3800000, suffix: "+", label: "Importadores no diretório", icon: Database, color: "#D80E16" },
              { value: 8700, suffix: "+", label: "Códigos NCM/HS cadastrados", icon: Search, color: "#8b5cf6" },
              { value: 12, suffix: "M+", label: "Registros SISCOMEX processados", icon: BarChart3, color: "#06b6d4" },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="p-6 rounded-2xl bg-white border border-black/[0.04]">
                <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: stat.color + "15" }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#0F111A]">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs text-[#5E6278] mt-1 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Missão */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">Nossa Missão</Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#0F111A] mb-6">Democratizar a inteligência de comércio exterior</h2>
            <p className="text-lg text-[#5E6278] leading-relaxed max-w-2xl mx-auto">
              O comércio exterior brasileiro movimenta centenas de bilhões de dólares por ano. Mas a informação sempre esteve trancada em sistemas caros, complexos e inacessíveis para pequenas e médias empresas. A TRADEXA nasceu para mudar isso.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Target, title: "Precisão", text: "Cada número na plataforma é rastreável até sua fonte oficial. Zero estimativas. Zero dados inventados.", color: "#D80E16" },
              { icon: Zap, title: "Velocidade", text: "Consultas que levariam horas em sistemas tradicionais são respondidas em segundos. Classificação IA de NCM em tempo real.", color: "#f59e0b" },
              { icon: ShieldCheck, title: "Confiança", text: "Metodologia auditável. Relatórios com fontes e datas de atualização. Conformidade LGPD.", color: "#10b981" },
              { icon: TrendingUp, title: "Crescimento", text: "Nossos clientes descobrem mercados que não estavam no radar. De cafés especiais para a Ásia a autopeças para o México.", color: "#8b5cf6" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex gap-4 p-6 rounded-2xl bg-[#FAFAF9]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color + "15" }}>
                  <item.icon className="w-6 h-6" style={{ color: item.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-[#0F111A] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#5E6278] leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* O que oferecemos */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">O Que Oferecemos</Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#0F111A] mb-4">Tudo que você precisa em um só lugar</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Search, title: "Classificador IA", desc: "Descreva o produto, a IA classifica em segundos", route: "/landing/ncm-classifier", color: "#D80E16" },
              { icon: Globe, title: "Tarifário 31 Países", desc: "Alíquotas oficiais OMC + VAT", route: "/landing/tariff-calculator", color: "#f59e0b" },
              { icon: BarChart3, title: "Trade Intelligence", desc: "Dados SISCOMEX completos", route: "/landing/import-dashboard", color: "#10b981" },
              { icon: TrendingUp, title: "Smart Rank", desc: "Ranking de países por oportunidade", route: "/landing/export-opportunities", color: "#8b5cf6" },
              { icon: Database, title: "Diretório Importadores", desc: "3.8M+ empresas mundiais", route: "/landing/importadores", color: "#ef4444" },
              { icon: Ship, title: "Frete Marítimo", desc: "Cotações FCL/LCL entre portos", route: "/landing/maritime-freight", color: "#0ea5e9" },
              { icon: BellRing, title: "Alertas de Tarifas", desc: "Notificações de mudanças", route: "/landing/smart-alerts", color: "#D80E16" },
              { icon: Users, title: "Mapa de Importadores", desc: "Geolocalização de operações", route: "/landing/import-map", color: "#06b6d4" },
            ].map((item, i) => (
              <motion.a key={i} href={item.route} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-white border border-black/[0.04] hover:border-[#D80E16]/20 hover:shadow-[0_4px_24px_-8px_rgba(216,14,22,0.1)] transition-all group"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: item.color + "15" }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <h3 className="font-bold text-[#0F111A] mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-[#5E6278]">{item.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">Por que TRADEXA</Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#0F111A] mb-4">O que nos torna diferentes</h2>
          </motion.div>
          <div className="space-y-4">
            {[
              "Dados 100% oficiais — nada de estimativas ou projeções",
              "Classificação NCM com IA em segundos, não em horas",
              "Tarifas de importação para 31 países com alíquotas reais da OMC",
              "Diretório com 3.8 milhões de importadores globais verificados",
              "Atualização mensal dos dados de comércio exterior brasileiro",
              "Planos acessíveis — do gratuito ao enterprise, sem letras miúdas",
              "Suporte em português por especialistas em comércio exterior",
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-[#FAFAF9]"
              >
                <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                <span className="text-[#0F111A] font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </SiteLayout>
  );
}
