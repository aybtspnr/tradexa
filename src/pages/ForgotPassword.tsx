"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import Logo from "@/components/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!email) throw new Error("Preencha o e-mail.");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      showSuccess("Instruções enviadas para seu e-mail!");
    } catch (err: any) {
      showError(err.message || "Erro ao enviar e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--canvas))] flex items-center justify-center p-4 mesh-gradient">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Logo className="h-9 mx-auto mb-5" to="/" />
        </div>

        <Card className="glass-card glow-border rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            {!sent ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex h-11 w-11 rounded-xl bg-[hsl(var(--brand-soft))] items-center justify-center mx-auto mb-3">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="text-xl font-black text-foreground">Recuperar senha</h1>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1.5">Digite seu e-mail</p>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-11 rounded-xl border-2 border-[hsl(var(--border))] bg-white font-medium focus:border-primary focus:ring-4 focus:ring-[hsl(var(--brand-soft))] transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 font-black shadow-[var(--shadow-brand)] transition-all"
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar instruções"}
                  </Button>
                </form>

                <div className="mt-5 text-center">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-primary transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para login
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex h-11 w-11 rounded-xl bg-green-100 items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h1 className="text-xl font-black text-foreground">E-mail enviado!</h1>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1.5">
                    Verifique sua caixa de entrada.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => setSent(false)}
                    variant="outline"
                    className="w-full rounded-xl h-11 font-bold border-[hsl(var(--border))]"
                  >
                    Enviar novamente
                  </Button>
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-primary-foreground font-black shadow-[var(--shadow-brand)] transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para login
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;