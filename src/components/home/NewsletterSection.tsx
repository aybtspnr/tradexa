"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      });
    } catch (err) {
      console.error("Newsletter subscribe error:", err);
    }
    setSubmitted(true);
    // TODO: connect to actual newsletter service
  };

  return (
    <section className="relative py-16 md:py-24 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(216,14,22,0.04),transparent)]" />
      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#D80E16]/10 text-[#D80E16] mb-6">
            <Mail className="w-7 h-7" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Receba Alertas Semanais
          </h2>
          <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
            Fique por dentro das últimas tendências de comércio exterior, oportunidades de mercado e atualizações tarifárias — direto no seu e-mail.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu e-mail"
                  className="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#D80E16]/30 focus:border-[#D80E16] transition-all text-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="gap-2 bg-[#D80E16] hover:bg-[#E50716] text-white px-8 py-4 text-base font-semibold rounded-xl shadow-lg shadow-[#D80E16]/20"
              >
                
                Inscrever
                <Send className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-4"
            >
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-green-600 font-medium">
                Inscrição confirmada! Em breve você receberá nossas análises.
              </span>
            </motion.div>
          )}

          <p className="text-xs text-slate-600 mt-4">
            Não enviamos spam. Você pode cancelar a inscrição a qualquer momento.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
