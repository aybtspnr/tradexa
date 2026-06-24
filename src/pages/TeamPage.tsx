"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  UserPlus,
  Mail,
  Trash2,
  Loader2,
  Plus,
  Shield,
  User,
  CalendarDays,
  AlertTriangle,
  Gauge,
  Ban,
} from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";

/* ─── Types ─── */
interface Company {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: "admin" | "member";
  status: "active" | "invited" | "declined";
  invited_by: string;
  joined_at: string | null;
  created_at: string;
  user_id_data?: {
    id: string;
    email: string;
    full_name?: string;
    company_name?: string;
  };
}

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  company_id?: string;
  company_name?: string;
}

/* ─── Helpers ─── */
const statusConfig: Record<
  string,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  active: {
    label: "Ativo",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <Users className="w-3 h-3" />,
  },
  invited: {
    label: "Convidado",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Mail className="w-3 h-3" />,
  },
  declined: {
    label: "Recusado",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: <Ban className="w-3 h-3" />,
  },
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

/* ─── Component ─── */
const TeamPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);

  /* user & profile */
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  /* company */
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [creatingCompany, setCreatingCompany] = useState(false);

  /* members */
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  /* shared usage */
  const [sharedUsage, setSharedUsage] = useState<number>(0);
  const [sharedUsageTotal, setSharedUsageTotal] = useState<number>(0);

  /* ─── Load ─── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Load profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof) setProfile(prof as Profile);

      if (prof?.company_id) {
        await loadCompany(prof.company_id);
      }
    } catch (err: any) {
      showError("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCompany = async (companyId: string) => {
    // Load company
    const { data: comp } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (comp) setCompany(comp as Company);

    // Load members with user data
    const { data: mbrs } = await supabase
      .from("company_members")
      .select("*, user_id(*)")
      .eq("company_id", companyId);

    if (mbrs) setMembers(mbrs as unknown as CompanyMember[]);

    // Load shared usage — sum user_usage.used_percent of all members
    if (mbrs && mbrs.length > 0) {
      const activeMemberIds = mbrs
        .filter((m: any) => m.status === "active")
        .map((m: any) => m.user_id);

      if (activeMemberIds.length > 0) {
        const { data: usages } = await supabase
          .from("user_usage")
          .select("used_percent")
          .in("user_id", activeMemberIds);

        if (usages) {
          const total = usages.reduce(
            (acc: number, u: any) => acc + (u.used_percent || 0),
            0,
          );
          setSharedUsage(total);
          setSharedUsageTotal(activeMemberIds.length);
        }
      }
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  /* ─── Create Company ─── */
  const handleCreateCompany = async () => {
    if (!companyName.trim() || !userId) return;
    setCreatingCompany(true);
    try {
      // Insert company
      const { data: comp, error: compErr } = await supabase
        .from("companies")
        .insert({ name: companyName.trim(), owner_id: userId })
        .select()
        .single();

      if (compErr) throw compErr;
      if (!comp) throw new Error("Erro ao criar empresa");

      // Update profile with company_id
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ company_id: comp.id })
        .eq("id", userId);

      if (profErr) throw profErr;

      // Add owner as admin member
      const { error: memErr } = await supabase
        .from("company_members")
        .insert({
          company_id: comp.id,
          user_id: userId,
          role: "admin",
          status: "active",
          invited_by: userId,
          joined_at: new Date().toISOString(),
        });

      if (memErr) throw memErr;

      setCompany(comp as Company);
      setProfile((prev) => (prev ? { ...prev, company_id: comp.id } : prev));
      showSuccess("Empresa criada com sucesso!");
      setCompanyName("");

      // Reload members
      await loadCompany(comp.id);
    } catch (err: any) {
      showError("Erro ao criar empresa: " + err.message);
    } finally {
      setCreatingCompany(false);
    }
  };

  /* ─── Invite Member ─── */
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !company?.id || !userId) return;
    setInviting(true);
    try {
      // Find user by email
      const { data: targetUser, error: searchErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", inviteEmail.trim())
        .single();

      if (searchErr || !targetUser) {
        showError("Usuário não encontrado com este email.");
        return;
      }

      // Check if already a member
      const alreadyMember = members.some(
        (m) => m.user_id === targetUser.id && m.status !== "declined",
      );
      if (alreadyMember) {
        showError("Este usuário já é membro da empresa.");
        return;
      }

      // Insert member as invited
      const { error: insErr } = await supabase.from("company_members").insert({
        company_id: company.id,
        user_id: targetUser.id,
        role: "member",
        status: "invited",
        invited_by: userId,
      });

      if (insErr) throw insErr;

      showSuccess("Convite enviado com sucesso!");
      setInviteEmail("");

      // Reload
      await loadCompany(company.id);
    } catch (err: any) {
      showError("Erro ao convidar: " + err.message);
    } finally {
      setInviting(false);
    }
  };

  /* ─── Remove Member ─── */
  const handleRemoveMember = async (memberId: string) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("company_members")
        .update({ status: "declined" })
        .eq("id", memberId);

      if (error) throw error;
      showSuccess("Membro removido.");

      // Reload
      if (company) await loadCompany(company.id);
    } catch (err: any) {
      showError("Erro ao remover membro: " + err.message);
    }
  };

  /* ─── Derived ─── */
  const isOwner = company?.owner_id === userId;
  const isAdmin = members.some(
    (m) => m.user_id === userId && m.role === "admin",
  );
  const canManage = isOwner || isAdmin;

  const activeMembers = members.filter((m) => m.status === "active");

  useSeo({
    title: "Equipe",
    description:
      "Gerencie sua equipe multiusuário na TRADEXA. Convide membros, configure permissões e acompanhe o uso compartilhado.",
    keywords:
      "equipe TRADEXA, multiusuário, convidar membros, gestão de equipe",
  });

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ─── No Company ─── */
  if (!company) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Equipe"
          subtitle="Gerencie sua equipe multiusuário."
          variant="red"
          badges={[
            { label: "Equipe", icon: <Users className="w-3 h-3 mr-1" /> },
          ]}
        />

        <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                Você ainda não tem uma empresa
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                Crie sua empresa para começar a gerenciar sua equipe e convidar
                membros. Todos os integrantes compartilharão os créditos do
                plano contratado.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 block text-left">
                Nome da Empresa
              </Label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Tradexa Comércio Exterior Ltda."
                className="h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
              />
              <Button
                onClick={handleCreateCompany}
                disabled={
                  creatingCompany || !companyName.trim()
                }
                className="w-full h-12 rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 shadow-[var(--shadow-brand)]"
              >
                {creatingCompany ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Criar Empresa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─── Has Company ─── */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe"
        subtitle="Gerencie sua equipe multiusuário."
        variant="red"
        badges={[
          { label: "Equipe", icon: <Users className="w-3 h-3 mr-1" /> },
        ]}
      />

      {/* ═══════ Company Info ═══════ */}
      <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {company.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Criada em {formatDate(company.created_at)}
                </p>
              </div>
            </div>
            <Badge
              className={cn(
                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                "bg-blue-50 text-blue-700 border-blue-200",
              )}
            >
              {activeMembers.length}{" "}
              {activeMembers.length === 1 ? "membro" : "membros"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ═══════ Shared Usage ═══════ */}
      <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            Uso Compartilhado
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Consumo Total da Equipe
              </p>
              <p
                className={cn(
                  "text-2xl font-black",
                  sharedUsage > 80
                    ? "text-red-600"
                    : sharedUsage > 50
                      ? "text-amber-600"
                      : "text-emerald-600",
                )}
              >
                {sharedUsage.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500">
                soma de {sharedUsageTotal} membro
                {sharedUsageTotal !== 1 ? "s" : ""} ativo
                {sharedUsageTotal !== 1 ? "s" : ""}
              </p>
              <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    sharedUsage > 80
                      ? "bg-red-500"
                      : sharedUsage > 50
                        ? "bg-amber-500"
                        : "bg-emerald-500",
                  )}
                  style={{ width: `${Math.min(sharedUsage, 100)}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Membros Ativos
              </p>
              <p className="text-2xl font-black text-slate-900">
                {activeMembers.length}
              </p>
              <p className="text-xs text-slate-500">
                de {members.length} total
                {members.length !== 1 ? "is" : ""} convidado
                {members.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {sharedUsage > 80 && (
            <div className="flex items-center gap-2 text-xs text-red-600 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              Créditos compartilhados quase esgotados
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══════ Invite Form ═══════ */}
      {canManage && (
        <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Convidar Membro
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1.5 block">
                  Email do usuário
                </Label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  type="email"
                  className="h-12 rounded-xl border-2 border-slate-200 font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="h-12 rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 shadow-[var(--shadow-brand)] px-6"
                >
                  {inviting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Convidar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════ Members List ═══════ */}
      <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Membros da Equipe
            <Badge className="ml-2 bg-slate-100 text-slate-700 border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest">
              {members.length}
            </Badge>
          </h3>

          {members.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              Nenhum membro encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const userData = member.user_id_data || {};
                const statusCfg = statusConfig[member.status] || statusConfig.invited;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-100"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">
                          {userData.full_name || userData.email || "Usuário"}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {userData.email || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                      {/* Role */}
                      <Badge
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          member.role === "admin"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-slate-100 text-slate-600 border-slate-200",
                        )}
                      >
                        {member.role === "admin" ? (
                          <Shield className="w-3 h-3 mr-1" />
                        ) : (
                          <User className="w-3 h-3 mr-1" />
                        )}
                        {member.role === "admin" ? "Admin" : "Membro"}
                      </Badge>

                      {/* Status */}
                      <Badge
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                          statusCfg.className,
                        )}
                      >
                        {statusCfg.icon}
                        <span className="ml-1">{statusCfg.label}</span>
                      </Badge>

                      {/* Joined at */}
                      {member.joined_at && (
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          {formatDate(member.joined_at)}
                        </span>
                      )}

                      {/* Remove — only for owner/admin, not self */}
                      {canManage && member.user_id !== userId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Remover membro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamPage;

