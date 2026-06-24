"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { motion } from "framer-motion";
import { Shield, Users, Search, Save, Loader2, Crown } from "lucide-react";
import { PLAN_LABELS } from "@/lib/usage-costs";

interface UserRow {
  id: string;
  email: string;
  company_name: string | null;
  role: string | null;
  plan_type: string;
  used_percent: number;
  tank_percent: number;
  reset_date: string | null;
  ai_queries_used: number | null;
}

const PLANS = [
  { value: "essential", label: "Essencial" },
  { value: "growth", label: "Growth" },
  { value: "business", label: "Business" },
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editedPlans, setEditedPlans] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "admin") {
      showError("Acesso negado.");
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, company_name, role")
        .order("created_at", { ascending: false })
        .limit(500);

      if (profilesError) throw profilesError;

      // Buscar user_usage
      const { data: usageData, error: usageError } = await supabase
        .from("user_usage")
        .select("user_id, plan_type, used_percent, tank_percent, reset_date, ai_queries_used")
        .limit(500);

      if (usageError) throw usageError;

      const usageMap = new Map(usageData?.map((u) => [u.user_id, u]) || []);

      const merged: UserRow[] = (profilesData || []).map((p: any) => {
        const u = usageMap.get(p.id);
        return {
          id: p.id,
          email: p.email || "—",
          company_name: p.company_name,
          role: p.role,
          plan_type: u?.plan_type || p.plan_type || "essential",
          used_percent: Number(u?.used_percent || 0),
          tank_percent: Number(u?.tank_percent || 100),
          reset_date: u?.reset_date || null,
          ai_queries_used: u?.ai_queries_used || null,
        };
      });

      setUsers(merged);
    } catch (err: any) {
      showError(err.message || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (userId: string, newPlan: string) => {
    setEditedPlans((prev) => ({ ...prev, [userId]: newPlan }));
  };

  const savePlan = async (userId: string) => {
    const newPlan = editedPlans[userId];
    if (!newPlan) return;

    setSavingId(userId);
    try {
      const { data, error } = await supabase.rpc("set_user_plan", {
        target_user_id: userId,
        new_plan_type: newPlan,
      });

      if (error) throw error;

      showSuccess(`Plano atualizado para ${PLAN_LABELS[newPlan as keyof typeof PLAN_LABELS] || newPlan}`);
      setEditedPlans((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      // Atualiza localmente
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan_type: newPlan, used_percent: 0 } : u))
      );
    } catch (err: any) {
      showError(err.message || "Erro ao atualizar plano");
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.company_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    essential: users.filter((u) => u.plan_type === "essential" || u.plan_type === "starter").length,
    growth: users.filter((u) => u.plan_type === "growth" || u.plan_type === "professional").length,
    business: users.filter((u) => u.plan_type === "business" || u.plan_type === "enterprise").length,
  };

  if (!profile || (profile.role !== "admin" && profile.email !== "aybtspnr@gmail.com")) {
    return null;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-[#D80E16]" />
          <h1 className="text-2xl font-black text-slate-900">Gerenciamento de Usuários e Planos</h1>
        </div>
        <p className="text-slate-600 text-sm">
          Visualize e edite planos de todos os usuários da plataforma.
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Total" value={String(stats.total)} color="bg-slate-100 text-slate-700" />
        <KpiCard label="Essencial" value={String(stats.essential)} color="bg-slate-100 text-slate-600" />
        <KpiCard label="Growth" value={String(stats.growth)} color="bg-blue-50 text-blue-700" />
        <KpiCard label="Business" value={String(stats.business)} color="bg-purple-50 text-purple-700" />
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por email ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#D80E16] focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D80E16]" /> Usuários ({filteredUsers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-slate-600 text-xs font-black uppercase tracking-wider">Email</TableHead>
                <TableHead className="text-slate-600 text-xs font-black uppercase tracking-wider">Empresa</TableHead>
                <TableHead className="text-slate-600 text-xs font-black uppercase tracking-wider">Plano</TableHead>
                <TableHead className="text-slate-600 text-xs font-black uppercase tracking-wider">Uso</TableHead>
                <TableHead className="text-slate-600 text-xs font-black uppercase tracking-wider">Reset</TableHead>
                <TableHead className="text-slate-600 text-xs font-black uppercase tracking-wider w-24">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                  const isEdited = editedPlans[u.id] !== undefined;
                  const currentPlan = isEdited ? editedPlans[u.id] : u.plan_type;
                  const planLabel = PLAN_LABELS[currentPlan as keyof typeof PLAN_LABELS] || currentPlan;
                  const usagePct = Math.min((u.used_percent / Math.max(u.tank_percent, 1)) * 100, 100);

                  return (
                    <TableRow key={u.id} className="border-slate-100 hover:bg-slate-50">
                      <TableCell className="text-slate-900 font-medium text-sm">
                        <div className="flex items-center gap-2">
                          {u.email}
                          {u.role === "admin" && (
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{u.company_name || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <select
                            value={currentPlan}
                            onChange={(e) => handlePlanChange(u.id, e.target.value)}
                            className={`h-8 rounded-lg border px-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 ${
                              isEdited
                                ? "border-[#D80E16] bg-red-50 text-[#D80E16]"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {PLANS.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                          {isEdited && (
                            <Button
                              size="sm"
                              className="h-8 px-2 text-xs bg-[#D80E16] hover:bg-[#b00b12] text-white"
                              onClick={() => savePlan(u.id)}
                              disabled={savingId === u.id}
                            >
                              {savingId === u.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                usagePct > 90 ? "bg-red-500" : usagePct > 70 ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{u.used_percent.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        {u.reset_date
                          ? new Date(u.reset_date).toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-black uppercase ${
                            u.plan_type === "business" || u.plan_type === "enterprise"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : u.plan_type === "growth" || u.plan_type === "professional"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {planLabel}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 p-4 ${color.split(" ")[0]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <p className={`text-2xl font-black mt-1 ${color.split(" ").slice(1).join(" ")}`}>{value}</p>
    </div>
  );
}
