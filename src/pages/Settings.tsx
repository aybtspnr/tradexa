"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  User, Mail, Building2, Bell, Globe, Save, Loader2, LogOut,
  Gauge, CreditCard, TrendingUp, Phone, Key, ShieldCheck,
  CalendarDays, AlertTriangle, ExternalLink, Clock, Users, FileText
} from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { PLAN_LABELS } from "@/lib/usage-costs";

const planColors: Record<string, string> = {
  essential: "bg-slate-100 text-slate-700 border-slate-200",
  growth: "bg-blue-50 text-blue-700 border-blue-200",
  business: "bg-amber-50 text-amber-700 border-amber-200",
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const maskCnpj = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const maskPhone = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10)
    return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

const Settings = () => {
  const navigate = useNavigate();
  const { usage, loading: usageLoading, plan, tank, used, percentUsed, remaining } = useUsage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    company_name: "",
    email: "",
    role: "",
    cnpj: "",
    phone: "",
    notifications_enabled: true,
    language: "pt-BR",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setLastSignIn(user.last_sign_in_at || null);

      if (data) {
        setProfile({
          company_name: data.company_name || "",
          email: user.email || "",
          role: data.role || "",
          cnpj: data.cnpj || "",
          phone: data.phone || "",
          notifications_enabled: data.notifications_enabled ?? true,
          language: data.language || "pt-BR",
        });
      }
    } catch (err: any) {
      showError("Erro ao carregar perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: profile.company_name,
          cnpj: profile.cnpj,
          phone: profile.phone,
          notifications_enabled: profile.notifications_enabled,
          language: profile.language,
        })
        .eq("id", user.id);

      if (error) throw error;
      showSuccess("Configurações salvas com sucesso!");
    } catch (err: any) {
      showError("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!password.current || !password.new) {
      showError("Preencha a senha atual e a nova senha.");
      return;
    }
    if (password.new.length < 6) {
      showError("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password.new !== password.confirm) {
      showError("As senhas não conferem.");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password.new });
      if (error) throw error;
      showSuccess("Senha alterada com sucesso!");
      setPassword({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      showError("Erro ao alterar senha: " + err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const aiQueriesUsed = usage?.ai_queries_used ?? 0;
  const resetDate = usage?.reset_date || null;

  useSeo({
    title: "Minha Conta",
    description: "Gerencie sua conta TRADEXA. Configure perfil, empresa, CNPJ e preferências da plataforma de inteligência comercial.",
    keywords: "conta TRADEXA, configurações, créditos",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        subtitle="Gerencie seu perfil e preferências."
        variant="red"
        badges={[
          { label: "Perfil", icon: <User className="w-3 h-3 mr-1" /> },
        ]}
      />

      {/* ═══════ Plan & Usage ═══════ */}
      <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Plano e Consumo
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Plano */}
            <div className="p-4 rounded-xl bg-white border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Plano</p>
              <p className={cn(
                "inline-block text-xs font-bold px-3 py-1 rounded-full border",
                planColors[plan] || "bg-slate-100 text-slate-700"
              )}>
                {PLAN_LABELS?.[plan] || plan}
              </p>
            </div>

            {/* Tank */}
            <div className="p-4 rounded-xl bg-white border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Tank</p>
              <p className="text-lg font-black text-slate-900">{tank}%</p>
              <p className="text-xs text-slate-500">capacidade mensal</p>
            </div>

            {/* Consumo */}
            <div className="p-4 rounded-xl bg-white border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Consumido</p>
              <div className="flex items-baseline gap-1">
                <p className={cn(
                  "text-lg font-black",
                  percentUsed > 80 ? "text-red-600" : percentUsed > 50 ? "text-amber-600" : "text-emerald-600"
                )}>
                  {used.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-500">/ {tank}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    percentUsed > 80 ? "bg-red-500" : percentUsed > 50 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
            </div>

            {/* Consultas IA */}
            <div className="p-4 rounded-xl bg-white border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Consultas IA</p>
              <p className="text-lg font-black text-slate-900">{aiQueriesUsed}</p>
              <p className="text-xs text-slate-500">neste mês</p>
            </div>
          </div>

          {/* Reset + alerta */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Reset: {resetDate ? formatDate(resetDate) : "—"}
            </span>
            {percentUsed > 80 && (
              <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Créditos quase esgotados
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/plans")}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Ver Planos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/my-usage")}
              className="rounded-xl text-xs font-bold gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Detalhes de Uso
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ═══════ Profile ═══════ */}
      <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6 space-y-6">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Informações do Perfil
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nome da Empresa</Label>
              <Input
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Email</Label>
              <Input
                value={profile.email}
                disabled
                className="h-12 rounded-xl border-2 border-slate-200 font-medium bg-slate-50"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">CNPJ</Label>
              <Input
                value={profile.cnpj}
                onChange={(e) => setProfile({ ...profile, cnpj: maskCnpj(e.target.value) })}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Telefone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: maskPhone(e.target.value) })}
                placeholder="(11) 99999-9999"
                maxLength={15}
                className="h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Função</Label>
              <Input
                value={profile.role}
                disabled
                className="h-12 rounded-xl border-2 border-slate-200 font-medium bg-slate-50 capitalize"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════ Change Password ═══════ */}
      <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Alterar Senha
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Senha Atual</Label>
              <Input
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                placeholder="••••••••"
                className="h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nova Senha</Label>
              <Input
                type="password"
                value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                placeholder="mín. 6 caracteres"
                className="h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                placeholder="repita a nova senha"
                className="h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={changingPassword || !password.new || !password.current || !password.confirm}
              className="h-12 rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90"
            >
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Alterar Senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ═══════ Notifications ═══════ */}
      <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificações
          </h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100">
            <div>
              <p className="font-bold text-slate-900">Notificações por Email</p>
              <p className="text-xs text-slate-600">Receba alertas de mudanças nos NCMs monitorados.</p>
            </div>
            <Switch
              checked={profile.notifications_enabled}
              onCheckedChange={(checked) => setProfile({ ...profile, notifications_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ═══════ Support + Last Login ═══════ */}
      <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Suporte */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Precisa de ajuda?</p>
                <p className="text-xs text-slate-500">Fale com nossa equipe de suporte</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open("mailto:suporte@tradexa.com.br")}
              className="rounded-xl h-10 gap-2"
            >
              <Mail className="w-4 h-4" />
              suporte@tradexa.com.br
            </Button>
          </div>

          {/* Último login */}
          {lastSignIn && (
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <Clock className="w-3.5 h-3.5" />
              Último login: {formatDate(lastSignIn)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════ Actions ═══════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-primary hover:bg-primary/90 rounded-xl h-12 font-bold gap-2 shadow-[var(--shadow-brand)]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Alterações
        </Button>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="flex-1 rounded-xl h-12 font-bold gap-2 border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};

export default Settings;
