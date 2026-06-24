"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import Logo from "@/components/Logo";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        showError("Sessão expirada. Solicite um novo reset.");
        navigate("/forgot-password");
      }
    });
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!password || !confirmPassword) throw new Error("Preencha todos os campos.");
      if (password.length < 6) throw new Error("A senha deve ter pelo menos 8 caracteres.");
      if (password !== confirmPassword) throw new Error("As senhas não coincidem.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      showSuccess("Senha alterada com sucesso!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      showError(err.message || "Erro ao alterar senha.");
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
            <div className="text-center mb-6">
              <div className="inline-flex h-11 w-11 rounded-xl bg-[hsl(var(--brand-soft))] items-center justify-center mx-auto mb-3">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl font-black text-foreground">Nova senha</h1>
              <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1.5">Crie uma senha forte</p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-10 pr-10 h-11 rounded-xl border-2 border-[hsl(var(--border))] bg-white font-medium focus:border-primary focus:ring-4 focus:ring-[hsl(var(--brand-soft))] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-10 h-11 rounded-xl border-2 border-[hsl(var(--border))] bg-white font-medium focus:border-primary focus:ring-4 focus:ring-[hsl(var(--brand-soft))] transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 font-black shadow-[var(--shadow-brand)] transition-all"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Alterar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;