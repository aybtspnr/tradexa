"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { toast } from "sonner";
import { ArrowRight, Mail, MapPin, Send, MessageSquare, Clock, CheckCircle2, Loader2 } from "lucide-react";

export default function ContatoPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  useSeo({
    title: "Contato — Fale com a TRADEXA",
    description: "Dúvidas sobre planos, funcionalidades ou suporte? Entre em contato com a TRADEXA. Email help@tradexa.com.br. Resposta em até 24 horas úteis.",
    keywords: "contato tradexa, suporte tradexa, ajuda comércio exterior, falar com tradexa",
    canonical: "https://www.tradexa.com.br/contato",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao enviar");

      setSent(true);
      toast.success("Mensagem enviada com sucesso!", {
        description: "Responderemos em até 24 horas úteis.",
      });
    } catch (err: any) {
      toast.error("Erro ao enviar", {
        description: err.message || "Tente novamente mais tarde.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Fale com a TRADEXA</h2>
        <p>Entre em contato com a equipe da TRADEXA para tirar dúvidas sobre a plataforma, solicitar uma demonstração personalizada ou falar sobre planos Business. Nosso time de especialistas em comércio exterior está pronto para ajudar sua empresa a aproveitar ao máximo as ferramentas de market intelligence. Respondemos em até 24 horas úteis. Para suporte técnico, utilize o chat dentro da plataforma após fazer login.</p>
      </div>
      {/* Hero */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">Contato</Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4">Fale com a gente</h1>
            <p className="text-lg text-[#5E6278] max-w-xl mx-auto">Dúvidas sobre planos, funcionalidades ou precisa de ajuda? Estamos aqui.</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl p-10 border border-black/[0.06] text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-[#10b981] mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#0F111A] mb-2">Mensagem enviada!</h3>
                  <p className="text-[#5E6278] mb-6">Responderemos em até 24 horas úteis.</p>
                  <div className="flex gap-3 justify-center">
                    <Button className="bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-xl" asChild>
                      <Link to="/">Voltar ao início <ArrowRight className="w-4 h-4" /></Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl border-[#0F111A]/15"
                      onClick={() => setSent(false)}
                    >
                      Nova mensagem
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl p-8 border border-black/[0.06] space-y-5"
                >
                  <div>
                    <label className="text-sm font-bold text-[#0F111A] mb-1.5 block">Nome</label>
                    <Input
                      placeholder="Seu nome completo"
                      required
                      className="rounded-xl"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#0F111A] mb-1.5 block">Email</label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      required
                      className="rounded-xl"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#0F111A] mb-1.5 block">Assunto</label>
                    <Input
                      placeholder="Dúvida, sugestão, parceria..."
                      required
                      className="rounded-xl"
                      value={form.subject}
                      onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#0F111A] mb-1.5 block">Mensagem</label>
                    <Textarea
                      placeholder="Descreva sua dúvida ou solicitação..."
                      rows={5}
                      required
                      className="rounded-xl"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-xl h-12 font-bold disabled:opacity-70"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Enviar Mensagem
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-black/[0.06]">
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-[#D80E16] mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#0F111A] mb-1">Email</h3>
                  <a href="mailto:help@tradexa.com.br" className="text-[#D80E16] hover:underline text-sm">help@tradexa.com.br</a>
                  <p className="text-xs text-[#5E6278] mt-1">Resposta em até 24h úteis</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-black/[0.06]">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-[#D80E16] mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#0F111A] mb-1">Horário</h3>
                  <p className="text-sm text-[#5E6278]">Segunda a Sexta, 9h às 18h (horário de Brasília)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-black/[0.06]">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#D80E16] mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#0F111A] mb-1">Localização</h3>
                  <p className="text-sm text-[#5E6278]">Florianópolis, Santa Catarina</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-black/[0.06]">
              <div className="flex gap-3">
                <MessageSquare className="w-5 h-5 text-[#D80E16] mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#0F111A] mb-1">FAQ</h3>
                  <ul className="text-sm text-[#5E6278] space-y-2">
                    <li>• <Link to="/pricing" className="text-[#D80E16] hover:underline">Qual plano escolher?</Link></li>
                    <li>• <Link to="/landing/ncm-classifier" className="text-[#D80E16] hover:underline">Como funciona o classificador IA?</Link></li>
                    <li>• <Link to="/landing/importadores" className="text-[#D80E16] hover:underline">Como encontrar importadores?</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
