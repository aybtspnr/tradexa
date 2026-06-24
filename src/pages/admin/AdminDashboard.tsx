"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Shield, TrendingUp, DollarSign,
  Activity, PieChart, BarChart3, Loader2,
  CalendarDays, Crown, UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { showError } from "@/utils/toast";

interface KpiData {
  total_users: number;
  total_admins: number;
  plan_distribution: { plan: string; count: number }[];
  total_api_calls_30d: number;
  total_payments_cents: number;
  avg_usage_percent: number;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "admin") {
      showError("Acesso negado.");
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    try {
      // KPIs via RPC
      const { data: kpiData, error: kpiError } = await supabase.rpc("admin_get_dashboard_kpis");
      if (kpiError) {
        console.warn("RPC admin_get_dashboard_kpis failed, falling back to direct queries:", kpiError);
        // Fallback: query tables directly
        await loadDataFallback();
        return;
      }
      setKpis(kpiData);

      // Recent users via the admin_user_plans view
      const { data: users, error: usersError } = await supabase
        .from("admin_user_plans")
        .select("*")
        .order("user_created_at", { ascending: false })
        .limit(10);

      if (!usersError) setRecentUsers(users || []);
    } catch (err: any) {
      console.error(err);
      await loadDataFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadDataFallback = async () => {
    try {
      // Direct queries (need RLS to allow admin)
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: totalAdmins } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      const { data: planDist } = await supabase
        .from("user_usage")
        .select("plan_type");

      const planDistribution: Record<string, number> = {};
      (planDist || []).forEach((u: any) => {
        const p = u.plan_type || "essential";
        planDistribution[p] = (planDistribution[p] || 0) + 1;
      });

      setKpis({
        total_users: totalUsers || 0,
        total_admins: totalAdmins || 0,
        plan_distribution: Object.entries(planDistribution).map(([plan, count]) => ({ plan, count })),
        total_api_calls_30d: 0,
        total_payments_cents: 0,
        avg_usage_percent: 0,
      });

      const { data: users } = await supabase
        .from("profiles")
        .select("id, email, company_name, role, plan_type, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentUsers(users || []);
    } catch (err: any) {
      showError(err.message || "Erro ao carregar dados");
    }
  };

  const planColors: Record<string, string> = {
    essential: "bg-slate-100 text-slate-700 border-slate-200",
    growth: "bg-blue-50 text-blue-700 border-blue-200",
    professional: "bg-amber-50 text-amber-700 border-amber-200",
    business: "bg-purple-50 text-purple-700 border-purple-200",
    enterprise: "bg-slate-800 text-white border-slate-700",
  };

  const totalUsers = kpis?.plan_distribution?.reduce((sum, p) => sum + p.count, 0) || kpis?.total_users || 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-[#D80E16]" />
          <h1 className="text-2xl font-black text-slate-900">Painel Admin</h1>
        </div>
        <p className="text-slate-600 text-sm">
          Gerencie usuários, planos, uso e monitore a plataforma.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D80E16]" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={Users} label="Total Usuários" value={String(totalUsers)} color="bg-slate-50 text-slate-700" />
            <KpiCard icon={Crown} label="Admins" value={String(kpis?.total_admins || 0)} color="bg-amber-50 text-amber-700" />
            <KpiCard icon={Activity} label="Chamadas API (30d)" value={String(kpis?.total_api_calls_30d || 0)} color="bg-blue-50 text-blue-700" />
            <KpiCard icon={TrendingUp} label="Uso Médio" value={`${kpis?.avg_usage_percent || 0}%`} color="bg-emerald-50 text-emerald-700" />
          </div>

          {/* Plan Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-slate-200 shadow-sm lg:col-span-2">
              <div className="h-1 bg-gradient-to-r from-[#D80E16] to-amber-400" />
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                  <PieChart className="w-4 h-4 text-[#D80E16]" />
                  Distribuição de Planos
                </h3>
                {kpis?.plan_distribution && kpis.plan_distribution.length > 0 ? (
                  <div className="space-y-3">
                    {kpis.plan_distribution.sort((a, b) => b.count - a.count).map((p) => {
                      const pct = totalUsers > 0 ? ((p.count / totalUsers) * 100).toFixed(1) : "0";
                      return (
                        <div key={p.plan} className="flex items-center gap-3">
                          <Badge className={`text-[10px] font-bold uppercase ${planColors[p.plan] || "bg-slate-100 text-slate-700"}`}>
                            {p.plan}
                          </Badge>
                          <div className="flex-1">
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#D80E16] transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-16 text-right">
                            {p.count} ({pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Nenhum dado disponível</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card className="border-slate-200 shadow-sm">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  Últimos Usuários
                </h3>
                <div className="space-y-2">
                  {recentUsers.length === 0 ? (
                    <p className="text-sm text-slate-400">Nenhum usuário</p>
                  ) : (
                    recentUsers.slice(0, 8).map((u: any) => (
                      <div key={u.id || u.user_id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50">
                        <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 truncate">
                            {u.email || "—"}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {u.company_name || "Sem empresa"} • {u.role || "client"}
                          </p>
                        </div>
                        <Badge className={`text-[8px] font-bold uppercase ${planColors[u.plan_type || "essential"]} shrink-0`}>
                          {u.plan_type || "essential"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-slate-200 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-emerald-500" />
                Acesso Rápido
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickAction
                  icon={Users}
                  label="Usuários"
                  desc="Gerenciar cadastros"
                  href="/admin/users"
                  navigate={navigate}
                />
                <QuickAction
                  icon={Activity}
                  label="Uso"
                  desc="Monitorar serviços"
                  href="/admin/usage"
                  navigate={navigate}
                />
                <QuickAction
                  icon={CalendarDays}
                  label="Logs"
                  desc="Atividade recente"
                  href="/admin/logs"
                  navigate={navigate}
                />
                <QuickAction
                  icon={DollarSign}
                  label="NCM"
                  desc="Gerenciar NCMs"
                  href="/admin/ncm"
                  navigate={navigate}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <Card className={`border-slate-200 shadow-sm`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace("text-", "bg-").replace("slate-700", "slate-100").replace("amber-700", "amber-100").replace("blue-700", "blue-100").replace("emerald-700", "emerald-100")}`}>
          <Icon className={`w-5 h-5 ${color.split(" ").find(c => c.startsWith("text-")) || "text-slate-600"}`} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`text-lg font-black ${color.split(" ").find(c => c.startsWith("text-")) || "text-slate-700"}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, desc, href, navigate }: { icon: any; label: string; desc: string; href: string; navigate: any }) {
  return (
    <button
      onClick={() => navigate(href)}
      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#D80E16]/30 hover:shadow-md transition-all text-left group"
    >
      <Icon className="w-5 h-5 text-slate-400 group-hover:text-[#D80E16] mb-2 transition-colors" />
      <p className="text-sm font-bold text-slate-700 group-hover:text-[#D80E16] transition-colors">{label}</p>
      <p className="text-[10px] text-slate-400">{desc}</p>
    </button>
  );
}
