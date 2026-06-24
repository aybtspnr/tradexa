import { useState, useEffect } from "react";
import { Mail, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const STORAGE_KEY = "tradexa_newsletter_subscribed";

export function NewsletterGate() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setIsSubscribed(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setIsSubmitting(true);

    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "blog" }),
      });
      localStorage.setItem(STORAGE_KEY, email);
      setIsSubscribed(true);
    } catch (err) {
      console.error("Newsletter subscribe error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative my-10 rounded-2xl overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
      >
        <div className="relative z-10 p-8 md:p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-2">
            Você já está inscrito!
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Continue aproveitando nossas análises semanais de comércio exterior.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative my-10 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm"
    >
      {/* Red accent bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D80E16] to-[#b80c12]" />

      <div className="relative z-10 p-8 md:p-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-[#D80E16]/5 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-[#D80E16]" />
          </div>

          {/* Headline */}
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-3 leading-tight">
            Receba análises semanais de comércio exterior
          </h3>

          <p className="text-slate-500 text-sm md:text-base mb-6 max-w-lg mx-auto">
            Resumo semanal com tendências, alertas regulatórios, movimentações de
            mercados e oportunidades de importação/exportação.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#D80E16]/30 focus:border-[#D80E16] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3.5 rounded-xl bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Inscrever-se
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-slate-500 text-[11px] mt-4">
            Sem spam. Cancele quando quiser. Enviamos apenas conteúdo relevante.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
