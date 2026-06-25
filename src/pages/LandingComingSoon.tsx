"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { Footer } from "./Index/components/Footer";
import { useSeo } from "@/hooks/use-seo";
import { 
  ArrowLeft, 
  Rocket, 
  Mail, 
  CheckCircle2, 
  Zap, 
  Globe, 
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { PremiumCard, PremiumButton } from "@/components/premium";
import { useState, useEffect } from "react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";

const ComingSoon = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useSeo({
    title: "Em Breve — Nova Plataforma TRADEXA | Comércio Exterior",
    description: "Algo extraordinário está chegando. A revolução da logística internacional começa em breve. Cadastre-se para ser notificado do lançamento.",
    keywords: "em breve, lançamento, tradexa, comércio exterior, logística internacional, plataforma",
  });

  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const launchDate = new Date("2026-06-01T00:00:00").getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      showError("Por favor, informe um email válido.");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("email_subscriptions")
        .insert([{ email, subscribed_at: new Date().toISOString() }]);

      if (error) {
        throw error;
      }

      // Also send notification to help@tradexa.com.br
      try {
        await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "coming_soon" }),
        });
      } catch (e) {
        console.error("[ComingSoon] Notification error:", e);
      }

      setSubscribed(true);
      showSuccess("Email cadastrado com sucesso! Você será notificado do lançamento.");
      setEmail("");
    } catch (err) {
      console.error("[ComingSoon] Error saving email:", err);
      showError("Erro ao cadastrar email. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, title: "Cotações Automáticas", desc: "IA que encontra o melhor frete em segundos" },
    { icon: Globe, title: "7 Países", desc: "Hubs de fulfillment em mercados estratégicos" },
    { icon: TrendingUp, title: "Market Intelligence", desc: "Dados reais para decisões inteligentes" },
  ];

  const countdownItems = [
    { value: timeLeft.days, label: "Dias" },
    { value: timeLeft.hours, label: "Horas" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Seg" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-red-600/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-red-600/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative z-50 fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Logo variant="white" className="h-7 sm:h-9" />
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="rounded-lg gap-1.5 sm:gap-2 font-bold text-white hover:bg-white/10 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-20 sm:pt-24">
        {/* Hero Section */}
        <section className="px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 sm:mb-6"
            >
              <Badge className="bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 inline" />
                Lançamento Exclusivo
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight text-white mb-3 sm:mb-4 leading-[1.1]">
                Algo{" "}
                <span className="text-[#D80E16]">
                  extraordinário
                </span>
                <br className="hidden sm:block" /> está chegando
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-medium leading-relaxed max-w-xl mx-auto px-2">
                A revolução da logística internacional começa em{" "}
                <span className="text-white font-black">1º de Junho de 2026</span>
              </p>
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 sm:mb-12"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4">
                {countdownItems.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 min-w-[65px] sm:min-w-[85px] lg:min-w-[110px]">
                      <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-0.5 sm:mb-1">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-[9px] sm:text-[10px] lg:text-xs font-black text-slate-600 uppercase tracking-wider">
                        {item.label}
                      </div>
                    </div>
                    {i < 3 && (
                      <div className="absolute -right-1.5 sm:-right-2.5 lg:-right-4 top-1/2 -translate-y-1/2 text-lg sm:text-xl lg:text-3xl font-black text-red-500">
                        :
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-1.5 mt-4 sm:mt-6 text-slate-600">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">Falta pouco para o lançamento</span>
              </div>
            </motion.div>

            {/* Email Capture */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-md mx-auto px-2"
            >
              {!subscribed ? (
                <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-600/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm sm:text-base font-black text-white">Seja o primeiro a saber</h3>
                        <p className="text-[11px] sm:text-xs text-slate-600 font-medium">Receba novidades e acesso antecipado</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubscribe} className="space-y-2.5 sm:space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          className="w-full h-11 sm:h-12 pl-9 sm:pl-11 pr-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all font-bold text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 sm:h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            Quero ser notificado
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-[10px] text-slate-600 font-medium mt-3 text-center">
                      Não enviamos spam. Você pode cancelar a qualquer momento.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-600/20 border border-green-500/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3"
                  >
                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>
                  <h3 className="text-base sm:text-lg font-black text-white mb-1">Email cadastrado!</h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    Você será um dos primeiros a saber quando lançarmos.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <Badge className="bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-sm mb-4 sm:mb-6">
                O Que Vem Por Aí
              </Badge>
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white mb-2 sm:mb-3">
                Uma nova era na logística
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium">
                Tecnologia que vai transformar sua operação internacional
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 lg:p-8 h-full hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600/20 to-rose-600/20 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                      <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white mb-1.5 sm:mb-2">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl sm:rounded-3xl overflow-hidden">
                <div className="p-6 sm:p-8 lg:p-12 text-center">
                  <Rocket className="w-10 h-10 sm:w-14 sm:h-14 text-white/80 mx-auto mb-3 sm:mb-5" />
                  <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-white mb-2 sm:mb-3">
                    Quer saber mais?
                  </h2>
                  <p className="text-xs sm:text-sm lg:text-base text-red-100 font-medium mb-5 sm:mb-8 max-w-lg mx-auto">
                    Enquanto o lançamento não chega, explore nosso site e conheça tudo o que estamos preparando para você.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center">
                    <Button 
                      onClick={() => navigate("/")}
                      className="bg-white text-red-600 hover:bg-slate-100 rounded-xl h-10 sm:h-11 px-5 sm:px-6 font-bold text-xs sm:text-sm"
                    >
                      Voltar para Home
                    </Button>
                    <Button 
                      onClick={() => navigate("/sobre")}
                      className="bg-red-800/50 text-white hover:bg-red-800 border border-white/20 rounded-xl h-10 sm:h-11 px-5 sm:px-6 font-bold text-xs sm:text-sm"
                    >
                      Conhecer a TRADEXA
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default ComingSoon;