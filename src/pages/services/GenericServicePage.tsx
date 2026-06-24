"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Package, TrendingUp, Zap, BarChart3, BellRing, Map, Search, Database, MapPin, FileText, Shield, Bot, Globe, Scale, Target, Percent, Route, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";

const FEATURE_ICONS: Record<string, any> = { Database, Search, BarChart3, MapPin, BellRing, FileText, Bot, Globe, Scale, Target, Percent, Route, Truck, Shield };

export default function GenericServicePage({ badge, title, description, ctaRoute, ctaText, features, seoTitle, seoParagraphs }: any) {
  return (
    <SiteLayout>
      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.05),transparent)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />{badge}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6">{title}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto mb-10 leading-relaxed">{description}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-2xl px-8 h-14 font-bold" asChild><Link to={ctaRoute}>{ctaText} <ArrowRight className="w-5 h-5" /></Link></Button>
            <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 font-bold border-[#0F111A]/15" asChild><Link to="/register">Criar Conta Grátis</Link></Button>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-[#FAFAF9]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f: any, i: number) => {
              const Icon = FEATURE_ICONS[f.icon] || Package;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="rounded-2xl border border-black/[0.06] bg-white p-6 h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#D80E16]/[0.08] flex items-center justify-center mb-4"><Icon className="w-6 h-6 text-[#D80E16]" /></div>
                    <h3 className="text-lg font-bold text-[#0F111A] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#5E6278] leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F111A]">{seoTitle}</h2>
          {seoParagraphs.map((p: string, i: number) => (
            <p key={i} className="text-[#5E6278] leading-relaxed">{p}</p>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
