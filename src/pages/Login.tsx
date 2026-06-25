"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import Logo from "@/components/Logo";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useSeo } from "@/hooks/use-seo";

// Substitua pela Site Key real do Cloudflare Turnstile
const TURNSTILE_SITE_KEY = "0x4AAAAAADe_AYE8-7mYGcrX";

const Login = () => {
  useSeo({
    title: "Login — TRADEXA",
    description: "Faça login na plataforma TRADEXA de inteligência comercial. Acesse dashboards de importação e exportação, classificação NCM com IA e tarifário global.",
    keywords: "login tradexa, comércio exterior, inteligência comercial, importação, exportação",
  });
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return; // bot detected
    if (!turnstileToken) {
      showError("Complete a verificação de segurança.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      showError("Preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showSuccess("Login realizado!");
      navigate("/trade-intelligence");
    } catch (err: any) {
      showError(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#D80E16]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#D80E16]/3 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <Logo className="h-10 mx-auto mb-5" to="/" />
          <h1 className="text-2xl font-black text-white tracking-tight">Entrar</h1>
          <p className="text-[#666] text-sm mt-1.5 font-medium">Acesse sua conta TRADEXA</p>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#666]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 h-11 rounded-xl border border-white/[0.08] bg-[#1A1A1A] text-white font-medium placeholder:text-[#444] focus:border-[#D80E16] focus:ring-2 focus:ring-[#D80E16]/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#666]">Senha</Label>
                  <Link to="/forgot-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#666] hover:text-white transition-colors">
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 rounded-xl border border-white/[0.08] bg-[#1A1A1A] text-white font-medium placeholder:text-[#444] focus:border-[#D80E16] focus:ring-2 focus:ring-[#D80E16]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Honeypot — invisible to humans, bots auto-fill */}
              <div style={{ position: 'absolute', left: '-9999px', opacity: 0 }} aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              {/* Turnstile CAPTCHA */}
              <TurnstileWidget
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken("")}
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D80E16] hover:bg-[#E50716] text-white rounded-xl h-11 font-black gap-2 shadow-[0_0_20px_rgba(216,14,22,0.3)] hover:shadow-[0_0_30px_rgba(216,14,22,0.5)] transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                Entrar
              </Button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-sm text-[#666]">
                Não tem conta?{" "}
                <Link to="/register" className="text-white font-black hover:text-[#D80E16] transition-colors">
                  Criar conta grátis
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <Link to="/" className="text-xs text-[#666] hover:text-white font-bold transition-colors">
            ← Página inicial
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
