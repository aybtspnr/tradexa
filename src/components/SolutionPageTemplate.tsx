/**
 * SolutionPageTemplate — landing page que agrupa múltiplos serviços/soluções
 * para um público-alvo específico (importadores, exportadores, operadores logísticos).
 * Versão premium com glassmorphism, gradientes e hover effects.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, CheckCircle, ChevronRight, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

export interface SolutionTool {
  title: string;
  route: string;
  icon: React.ElementType;
  color: string;
  desc: string;
}

export interface SolutionPainPoint {
  pain: string;
  solution: string;
}

export interface SolutionPageData {
  slug: string;
  audience: string;
  title: string;
  subtitle: string;
  heroDesc: string;
  color: string;
  painPoints: SolutionPainPoint[];
  tools: SolutionTool[];
  benefits: string[];
  ctaRoute: string;
}

/* ═══════════════════════════════════════
   PAIN POINT CARD — Premium
   ═══════════════════════════════════════ */
function PainPointCard({ pp, index, color }: { pp: SolutionPainPoint; index: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div className="relative rounded-2xl border border-black/[0.06] bg-white p-6 md:p-8 shadow-sm
        hover:shadow-[0_8px_40px_-16px_rgba(15,17,26,0.12)] hover:border-[#D80E16]/10
        transition-all duration-500 overflow-hidden"
      >
        {/* Hover gradient accent */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse 100% 80% at 0% 50%, ${color}06 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 grid md:grid-cols-2 gap-6 items-start">
          {/* LEFT: Problem */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Problema</span>
            </div>
            <p className="text-base md:text-lg font-bold text-[#0F111A] leading-relaxed">{pp.pain}</p>
          </div>

          {/* RIGHT: Solution */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute -left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#D80E16]/20 via-[#D80E16]/10 to-transparent" />

            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}15` }}
              >
                <CheckCircle className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <span
                className="text-[10px] font-black uppercase tracking-[0.2em]"
                style={{ color }}
              >
                Solução TRADEXA
              </span>
            </div>
            <p className="text-sm text-[#5E6278] leading-relaxed">{pp.solution}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   TOOL CARD — Premium
   ═══════════════════════════════════════ */
function ToolCard({ tool, index }: { tool: SolutionTool; index: number }) {
  const TIcon = tool.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={tool.route}
        className="group block relative rounded-xl border border-black/[0.06] bg-white p-5 md:p-6 h-full
          hover:shadow-[0_8px_32px_-12px_rgba(15,17,26,0.15)] hover:border-[#D80E16]/15
          transition-all duration-400 overflow-hidden"
      >
        {/* Glass reflection on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
          bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.8),transparent_60%)]" />

        {/* Colored gradient accent */}
        <div
          className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-700"
          style={{ background: `radial-gradient(circle, ${tool.color}, transparent 70%)` }}
        />

        <div className="relative z-10">
          {/* Icon with glow */}
          <div className="relative mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm
                group-hover:shadow-md group-hover:scale-105 transition-all duration-400"
              style={{ background: tool.color }}
            >
              <TIcon className="w-6 h-6" />
            </div>
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500"
              style={{ background: tool.color }}
            />
          </div>

          <h3 className="font-extrabold text-sm md:text-base text-[#0F111A] mb-1.5
            group-hover:text-[#D80E16] transition-colors duration-300">
            {tool.title}
          </h3>
          <p className="text-xs text-[#5E6278] leading-relaxed">{tool.desc}</p>
        </div>

        {/* Arrow indicator */}
        <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 text-[#5E6278]/20
          group-hover:text-[#D80E16] group-hover:translate-x-0.5 transition-all duration-300" />
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════ */
export function SolutionPageTemplate({ data }: { data: SolutionPageData }) {
  useSeo({
    title: `Solução para ${data.audience} | TRADEXA`,
    description: data.subtitle,
    canonical: `https://www.tradexa.com.br/solucoes/${data.slug}`,
  });

  return (
    <SiteLayout>
      {/* ─── Hero Premium ─── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0">
          <ParticleCanvasThemed opacity={0.3} particleCount={30} color="216, 14, 22" connectionDist={150} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.05),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D80E16]/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] mb-6 border"
              style={{
                background: `${data.color}10`,
                color: data.color,
                borderColor: `${data.color}25`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Solução para {data.audience}
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-[3.8rem] font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              {data.title}
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed mb-10">
              {data.heroDesc}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white px-8 py-6 text-base font-bold rounded-2xl shadow-[0_0_40px_rgba(216,14,22,0.25)] hover:shadow-[0_0_60px_rgba(216,14,22,0.35)] transition-all border-0 btn-glow"
                asChild
              >
                <Link to={data.ctaRoute}>
                  <Sparkles className="w-5 h-5" />
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-[#0F111A]/15 text-[#0F111A] hover:bg-[#0F111A]/[0.03] hover:border-[#D80E16]/20 px-8 py-6 text-base font-bold rounded-2xl"
                asChild
              >
                <Link to="/servicos">Ver Serviços</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          {/* ─── Pain Points ─── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
              <AlertTriangle className="w-3.5 h-3.5" />
              Desafios
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#0F111A] mb-4">Problemas que resolvemos</h2>
            <p className="text-[#5E6278] max-w-xl mx-auto">
              Cada desafio tem uma solução na TRADEXA.
            </p>
          </motion.div>

          <div className="space-y-5 mb-20">
            {data.painPoints.map((pp, i) => (
              <PainPointCard key={i} pp={pp} index={i} color={data.color} />
            ))}
          </div>

          {/* ─── Tools Grid ─── */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Ferramentas
              </div>
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#0F111A] mb-4">Tudo que você precisa</h2>
              <p className="text-[#5E6278] max-w-xl mx-auto">
                Ferramentas e serviços integrados em uma plataforma.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {data.tools.map((tool, i) => (
                <ToolCard key={tool.route} tool={tool} index={i} />
              ))}
            </div>
          </div>

          {/* ─── Benefits Premium ─── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl border border-black/[0.06] bg-white p-8 md:p-10 shadow-sm overflow-hidden">
              {/* Decorative gradient */}
              <div
                className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.03] pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${data.color}, transparent 70%)`,
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${data.color}12` }}
                  >
                    <CheckCircle className="w-5 h-5" style={{ color: data.color }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#0F111A]">Por que escolher a TRADEXA?</h2>
                    <p className="text-xs text-[#5E6278] mt-0.5">Diferenciais que fazem a diferença no seu dia a dia</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                  {data.benefits.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative rounded-xl border border-black/[0.04] bg-[#FAFAF9] p-4
                        hover:bg-white hover:border-[#D80E16]/10 hover:shadow-[0_4px_20px_-8px_rgba(15,17,26,0.08)]
                        transition-all duration-400 overflow-hidden"
                    >
                      {/* Hover gradient accent */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                          bg-[radial-gradient(ellipse_at_left,rgba(216,14,22,0.03),transparent_60%)]"
                      />

                      <div className="relative z-10 flex gap-3 items-start">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                            group-hover:scale-110 transition-transform duration-300"
                          style={{ background: `${data.color}12` }}
                        >
                          <CheckCircle className="w-4 h-4" style={{ color: data.color }} />
                        </div>
                        <p className="text-sm text-[#5E6278] leading-relaxed
                          group-hover:text-[#0F111A] transition-colors duration-300">
                          {b}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── CTA Premium ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mt-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Comece Grátis
            </div>
            <h3 className="text-xl md:text-2xl font-extrabold text-[#0F111A] mb-3">
              Pronto para simplificar suas operações?
            </h3>
            <p className="text-[#5E6278] mb-6 max-w-md mx-auto">
              Crie sua conta gratuita. Sem cartão de crédito. Acesso a todas as ferramentas da TRADEXA.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white px-8 py-6 text-base font-bold rounded-2xl shadow-[0_0_40px_rgba(216,14,22,0.25)] hover:shadow-[0_0_60px_rgba(216,14,22,0.35)] transition-all border-0 btn-glow"
              asChild
            >
              <Link to={data.ctaRoute}>
                <Sparkles className="w-5 h-5" />
                Criar Conta Grátis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
