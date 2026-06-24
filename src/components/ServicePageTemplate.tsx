/**
 * ServicePageTemplate — Template premium para páginas de serviço
 * com glassmorphism, hover effects e gradientes.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle, ArrowRight, Mail, Building2, Phone,
  Globe, FileText, Send, Sparkles, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";

export interface ServicePageData {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  benefits: string[];
  howItWorks: { step: string; desc: string }[];
  faq: { q: string; a: string }[];
}

/* ═══════════════════════════════════════
   BENEFIT CARD — Premium
   ═══════════════════════════════════════ */
function BenefitCard({ benefit, index }: { benefit: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group relative rounded-xl border border-black/[0.06] bg-white p-5 shadow-sm
        hover:shadow-[0_6px_24px_-10px_rgba(15,17,26,0.1)] hover:border-[#D80E16]/10
        transition-all duration-400 overflow-hidden"
    >
      {/* Hover gradient accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-[radial-gradient(ellipse_at_top_right,rgba(216,14,22,0.03),transparent_60%)]" />
      <div className="relative z-10 flex gap-3 items-start">
        <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5
          group-hover:scale-110 transition-transform duration-300">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <p className="text-sm text-[#5E6278] leading-relaxed">{benefit}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   STEP CARD — Premium
   ═══════════════════════════════════════ */
function StepCard({ step, index, color }: { step: { step: string; desc: string }; index: number; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <div className="relative rounded-xl border border-black/[0.06] bg-white p-5 md:p-6 shadow-sm
        hover:shadow-[0_8px_32px_-12px_rgba(15,17,26,0.12)] hover:border-[#D80E16]/10
        transition-all duration-400 overflow-hidden flex gap-5 items-start"
      >
        {/* Hover gradient */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
          bg-[radial-gradient(ellipse_at_left,rgba(216,14,22,0.03),transparent_60%)]" />

        {/* Step number */}
        <div className="relative z-10 flex gap-5 items-start w-full">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 text-white shadow-sm
              group-hover:scale-110 group-hover:shadow-md transition-all duration-400"
            style={{ background: color }}
          >
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#0F111A] mb-1 group-hover:text-[#D80E16] transition-colors duration-300">
              {step.step}
            </h3>
            <p className="text-sm text-[#5E6278] leading-relaxed">{step.desc}</p>
          </div>

          <ChevronRight className="hidden md:block w-5 h-5 text-[#5E6278]/20 group-hover:text-[#D80E16] group-hover:translate-x-1 transition-all duration-300 shrink-0 self-center" />
        </div>
      </div>

      {/* Connector line */}
      {index < 4 && (
        <div className="hidden md:block absolute -bottom-4 left-5 w-0.5 h-4 bg-gradient-to-b from-[#D80E16]/15 to-transparent" />
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   FAQ ITEM — Premium
   ═══════════════════════════════════════ */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <details className="group rounded-xl border border-black/[0.06] bg-white shadow-sm
        hover:shadow-[0_4px_16px_-8px_rgba(15,17,26,0.08)] hover:border-[#D80E16]/10
        transition-all duration-300 overflow-hidden
        [&[open]]:border-[#D80E16]/15 [&[open]]:shadow-md"
      >
        <summary className="cursor-pointer list-none flex items-center justify-between p-5 md:p-6 gap-4
          [&::-webkit-details-marker]:hidden">
          <span className="font-bold text-[#0F111A] text-sm md:text-base leading-snug pr-2">{q}</span>
          <span className="w-6 h-6 rounded-lg bg-[#D80E16]/[0.08] flex items-center justify-center shrink-0
            group-open:bg-[#D80E16] group-open:text-white transition-all duration-300">
            <span className="text-lg leading-none group-open:rotate-45 transition-transform duration-300">+</span>
          </span>
        </summary>
        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
          <div className="h-px bg-gradient-to-r from-[#D80E16]/10 via-[#D80E16]/5 to-transparent mb-4" />
          <p className="text-sm text-[#5E6278] leading-relaxed">{a}</p>
        </div>
      </details>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════ */
export function ServicePageTemplate({ data }: { data: ServicePageData }) {
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", mensagem: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useSeo({
    title: `${data.title} | TRADEXA`,
    description: data.subtitle,
    canonical: `https://www.tradexa.com.br/servicos/${data.slug}`,
  });

  const Icon = data.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, servico: data.title, source: `servico_${data.slug}` }),
      });
      setSent(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      {/* ─── Hero Premium ─── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.05),transparent)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#D80E16]/5 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D80E16]/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"
              style={{ background: `${data.color}15` }}
            >
              <Icon className="w-8 h-8" style={{ color: data.color }} />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              {data.title}
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              {data.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="pb-16 md:pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-black/[0.06] bg-white p-8 md:p-10 shadow-sm mb-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-[0.03] pointer-events-none"
              style={{ background: `radial-gradient(circle, ${data.color}, transparent 70%)` }} />
            <p className="relative z-10 text-[#5E6278] leading-relaxed text-lg">{data.description}</p>
          </motion.div>

          {/* Benefits Grid */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${data.color}12` }}
              >
                <CheckCircle className="w-4.5 h-4.5" style={{ color: data.color }} />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0F111A]">O que está incluído</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
              {data.benefits.map((b, i) => (
                <BenefitCard key={i} benefit={b} index={i} />
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${data.color}12` }}
              >
                <Sparkles className="w-4.5 h-4.5" style={{ color: data.color }} />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0F111A]">Como funciona</h2>
            </div>
            <div className="space-y-4 md:space-y-5">
              {data.howItWorks.map((step, i) => (
                <StepCard key={i} step={step} index={i} color={data.color} />
              ))}
            </div>
          </div>

          {/* FAQ */}
          {data.faq.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${data.color}12` }}
                >
                  <FileText className="w-4.5 h-4.5" style={{ color: data.color }} />
                </div>
                <h2 className="text-2xl font-extrabold text-[#0F111A]">Perguntas Frequentes</h2>
              </div>
              <div className="space-y-3">
                {data.faq.map((item, i) => (
                  <FaqItem key={i} q={item.q} a={item.a} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Contact Form Premium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            id="contato"
            className="relative rounded-2xl border border-black/[0.06] bg-white p-8 md:p-10 shadow-sm overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.03] pointer-events-none"
              style={{ background: `radial-gradient(circle, ${data.color}, transparent 70%)` }} />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${data.color}12` }}
                >
                  <Mail className="w-5 h-5" style={{ color: data.color }} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#0F111A]">Solicitar Orçamento</h2>
                  <p className="text-xs text-[#5E6278]">Preencha e responderemos em até 24h úteis</p>
                </div>
              </div>

              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0F111A] mb-2">Recebemos sua solicitação!</h3>
                  <p className="text-[#5E6278]">Entraremos em contato em até 24 horas úteis.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      required
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm
                        focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10
                        transition-all placeholder:text-[#5E6278]/50"
                    />
                    <input
                      type="email"
                      placeholder="Email corporativo"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm
                        focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10
                        transition-all placeholder:text-[#5E6278]/50"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Telefone (opcional)"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm
                      focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10
                      transition-all placeholder:text-[#5E6278]/50"
                  />
                  <textarea
                    placeholder={`Descreva sua necessidade com ${data.title.toLowerCase()}...`}
                    required
                    rows={4}
                    value={form.mensagem}
                    onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-[#0F111A] text-sm
                      focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10
                      transition-all placeholder:text-[#5E6278]/50 resize-none"
                  />
                  <Button
                    type="submit"
                    disabled={sending}
                    size="lg"
                    className="w-full gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold rounded-xl h-12
                      shadow-[0_4px_20px_rgba(216,14,22,0.2)] hover:shadow-[0_6px_30px_rgba(216,14,22,0.3)]
                      transition-all border-0 disabled:opacity-60"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Solicitação
                      </>
                    )}
                  </Button>
                </form>
              )}

              <div className="mt-6 pt-6 border-t border-black/[0.04] text-center">
                <p className="text-xs text-[#5E6278] mb-3">Ou fale diretamente com nossa equipe</p>
                <a
                  href="mailto:contato@tradexa.com.br"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#D80E16] hover:text-[#b80c12] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  contato@tradexa.com.br
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
