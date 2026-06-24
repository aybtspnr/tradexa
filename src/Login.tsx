"use client";

import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { showError, showSuccess } from "@/utils/toast";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react";
import Logo from "@/components/Logo";
import { trackEvent } from "@/lib/analytics";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const redirect = searchParams.get("redirect") || "/ai-search";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!email || !password) throw new Error("Preencha todos os campos.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      trackEvent("Login", { email_domain: email.split("@")[1] });
      showSuccess("Bem-vindo!");
      setTimeout(() => navigate(redirect), 1000);
    } catch (err: any) {
      showError(err.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D80E16]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/50 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-10" to="/" />
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-[#D80E16] text-sm font-bold hover:bg-[#D80E16]/5 hover:border-[#D80E16]/20 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Criar conta
          </Link>
        </div>

        {/* White card */}
        <motion.div
          className="rounded-2xl border border-slate-200 bg-white p-8 lg:p-10 shadow-xl shadow-slate-200/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex h-14 w-14 rounded-2xl bg-[#D80E16]/10 items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-[#D80E16]" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Bem-vindo de volta</h1>
              <p className="text-sm text-slate-600">Acesse sua conta para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-slate-200 bg-white pl-10 font-medium text-slate-900 placeholder:text-slate-600 focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Senha</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[#D80E16] hover:text-[#E50716]">
                    Esqueceu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 rounded-xl border-2 border-slate-200 bg-white pl-10 pr-10 font-medium text-slate-900 placeholder:text-slate-600 focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#D80E16] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="h-4 w-4 border-slate-300 data-[state=checked]:bg-[#D80E16] data-[state=checked]:border-[#D80E16]"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">Lembrar de mim</label>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#D80E16] hover:bg-[#E50716] text-white font-bold shadow-lg shadow-[#D80E16]/20 hover:shadow-[#D80E16]/30 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Entrar<ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-600">
              Ainda não tem conta?{" "}
              <Link to="/register" className="font-bold text-[#D80E16] hover:text-[#E50716]">
                Cadastre-se
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Voltar para página inicial */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#D80E16] transition-colors font-medium"
          >
            ← Página inicial
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
