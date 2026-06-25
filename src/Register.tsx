"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { showError, showSuccess } from "@/utils/toast";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Building2,
  CreditCard,
  Phone,
  LogIn,
  User,
} from "lucide-react";
import Logo from "@/components/Logo";
import { useFormatters } from "@/hooks/use-formatters";
import { usePasswordStrength } from "@/hooks/use-password-strength";
import { useSeo } from "@/hooks/use-seo";

const Register = () => {
  useSeo({
    title: "Criar Conta Grátis — TRADEXA",
    description: "Crie sua conta grátis na TRADEXA. Acesse classificação NCM com IA, tarifário global de 31 países e dashboards de comércio exterior.",
    keywords: "cadastro tradexa, conta grátis, comércio exterior, importação, exportação, classificação NCM",
  });
  const [accountType, setAccountType] = useState<"individual" | "company">(
    "individual"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const navigate = useNavigate();
  const { formatDocument, formatPhone } = useFormatters();
  const { strength, strengthInfo } = usePasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!email || !password)
        throw new Error("Preencha todos os campos obrigatórios.");
      if (password.length < 6)
        throw new Error("A senha deve ter pelo menos 8 caracteres.");
      if (!acceptTerms)
        throw new Error("Você precisa aceitar os termos de uso.");

      const metadata: Record<string, any> = {
        role: "client",
        account_type: accountType,
        full_name: accountType === "individual" ? fullName : "",
        company_name: accountType === "company" ? companyName : "",
        document: document || "",
      };

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/client`,
        },
      });

      if (authError) {
        let errorMsg = authError.message;
        if (authError.code === "unexpected_failure")
          errorMsg = "Erro no servidor. Tente novamente em alguns instantes.";
        else if (authError.code === "user_already_exists")
          errorMsg = "Este e-mail já está cadastrado.";
        else if (authError.code === "weak_password")
          errorMsg = "A senha deve ter pelo menos 8 caracteres.";
        throw new Error(errorMsg);
      }

      if (data.user) {
        trackEvent("Sign Up", {
          account_type: accountType,
          email_domain: email.split("@")[1],
        });
        showSuccess("Cadastro realizado! Verifique seu e-mail.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err: any) {
      showError(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#D80E16]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-slate-200/50 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo className="h-10" to="/" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-[#D80E16] text-sm font-bold hover:bg-[#D80E16]/5 hover:border-[#D80E16]/20 transition-all"
          >
            <LogIn className="h-4 w-4" />
            Entrar
          </Link>
        </div>

        <motion.div
          className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-10 shadow-xl shadow-slate-200/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex h-14 w-14 rounded-2xl bg-[#D80E16]/10 items-center justify-center mx-auto mb-4">
                <Building2 className="h-7 w-7 text-[#D80E16]" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                Criar conta
              </h1>
              <p className="text-sm text-slate-600">
                Comece sua jornada no comércio exterior
              </p>
            </div>

            {/* Account type toggle */}
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 p-1 bg-slate-50/80">
              <button
                type="button"
                onClick={() => setAccountType("individual")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all ${
                  accountType === "individual"
                    ? "bg-white text-[#D80E16] shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-700"
                }`}
              >
                <User className="h-4 w-4" /> Pessoa Física
              </button>
              <button
                type="button"
                onClick={() => setAccountType("company")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-bold transition-all ${
                  accountType === "company"
                    ? "bg-white text-[#D80E16] shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-700"
                }`}
              >
                <Building2 className="h-4 w-4" /> Empresa
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {accountType === "individual" ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Nome completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome"
                      className="h-12 rounded-xl border-2 border-slate-200 bg-white pl-10 font-medium text-slate-900 placeholder:text-slate-600 focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Nome da empresa
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Empresa Ltda"
                      className="h-12 rounded-xl border-2 border-slate-200 bg-white pl-10 font-medium text-slate-900 placeholder:text-slate-600 focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                    className="h-12 rounded-xl border-2 border-slate-200 bg-white pl-10 font-medium text-slate-900 placeholder:text-slate-600 focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    {accountType === "individual" ? "CPF" : "CNPJ"}
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <Input
                      value={document}
                      onChange={(e) =>
                        setDocument(formatDocument(e.target.value))
                      }
                      maxLength={18}
                      placeholder={
                        accountType === "individual"
                          ? "000.000.000-00"
                          : "00.000.000/0000-00"
                      }
                      className="h-12 rounded-xl border-2 border-slate-200 bg-white pl-10 font-medium text-slate-900 placeholder:text-slate-600 focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                    <Input
                      value={phone}
                      onChange={(e) =>
                        setPhone(formatPhone(e.target.value))
                      }
                      maxLength={15}
                      placeholder="(00) 00000-0000"
                      className="h-12 rounded-xl border-2 border-slate-200 bg-white pl-10 font-medium text-slate-900 placeholder:text-slate-600 focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Senha
                  </label>
                  {strengthInfo && (
                    <span
                      className={`text-xs font-bold ${strengthInfo.color}`}
                    >
                      {strengthInfo.text}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    className="h-12 rounded-xl border-2 border-slate-200 bg-white pl-10 pr-10 font-medium text-slate-900 placeholder:text-slate-600 focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#D80E16] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      strength <= 1
                        ? "bg-red-500 w-1/4"
                        : strength <= 2
                        ? "bg-amber-400 w-2/4"
                        : strength <= 3
                        ? "bg-amber-400 w-3/4"
                        : "bg-emerald-500 w-full"
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                  className="h-4 w-4 border-slate-300 data-[state=checked]:bg-[#D80E16] data-[state=checked]:border-[#D80E16] mt-0.5"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                  Aceito os{" "}
                  <Link to="/termos" className="text-[#D80E16] font-bold hover:underline cursor-pointer">
                    termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/privacidade" className="text-[#D80E16] font-bold hover:underline cursor-pointer">
                    política de privacidade
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[#D80E16] hover:bg-[#E50716] text-white font-bold shadow-lg shadow-[#D80E16]/20 hover:shadow-[#D80E16]/30 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Criar conta
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-600">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="font-bold text-[#D80E16] hover:text-[#E50716]"
              >
                Entrar
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

export default Register;
