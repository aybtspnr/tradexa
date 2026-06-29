"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search, Save, Loader2, Users, Shield,
  Crown, UserX, Filter, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import { PLAN_LABELS } from "@/lib/usage-costs";

interface UserRow {
  id: string;
  email: string;
  company_name: string | null;
  role: string;
  plan_type: string;
  used_percent: number;
  tank_percent: number;
  reset_date: string | null;
  ai_queries_used: number | null;
  user_created_at: string | null;
}

const PLAN_OPTIONS = [
  { value: "essential", label: "Essencial", color: "bg-slate-100 text-slate-700" },
  { value: "growth", label: "Growth", color: "bg-blue-50 text-blue-700" },
  { value: "business", label: "Business", color: "bg-purple-50 text-purple-700" },
];

const ROLE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "client_national", label: "Client Nacional" },
  { value: "partner", label: "Partner" },
  { value: "admin", label: "Admin" },
  { value: "trucker", label: "Trucker" },
];

export default function UserManagement() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<UserRow>>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!profile || profile.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsers();
  }, [profile]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Try admin view first
      const { data, error } = await supabase
        .from("admin_user_plans")
        .select("*")
        .order("user_created_at", { ascending: false })
        .limit(500);

      if (!error && data) {
        // Map user_id → id (view returns user_id, code expects id)
        setUsers(data.map((u: any) => ({ ...u, id: u.user_id })) as UserRow[]);
      } else {
        // Fallback: join manually
        await fetchUsersFallback();
      }
    } catch (err) {
      await fetchUsersFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersFallback = async () => {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);

    const { data: usage } = await supabase
      .from("user_usage")
      .select("*")
      .limit(500);

    const usageMap = new Map((usage || []).map((u: any) => [u.user_id, u]));

    const merged = (profiles || []).map((p: any) => {
      const u = usageMap.get(p.id);
      return {
        id: p.id,
        email: p.email || "—",
        company_name: p.company_name,
        role: p.role || "client",
        plan_type: u?.plan_type || p.plan_type || "essential",
        used_percent: Number(u?.used_percent || 0),
        tank_percent: Number(u?.tank_percent || 100),
        reset_date: u?.reset_date || null,
        ai_queries_used: u?.ai_queries_used || 0,
        user_created_at: p.updated_at,
      };
    });

    setUsers(merged);
  };

  const handleEdit = (userId: string, field: string, value: any) => {
    setEdits((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  const saveUser = async (userId: string) => {
    const edit = edits[userId];
    if (!edit || Object.keys(edit).length === 0) return;

    setSaving(userId);
    try {
      // Try using the admin RPC
      const { data, error } = await supabase.rpc("admin_update_user_usage", {
        target_user_id: userId,
        new_plan_type: edit.plan_type || null,
        new_used_percent: edit.used_percent != null ? Number(edit.used_percent) : null,
        new_tank_percent: edit.tank_percent != null ? Number(edit.tank_percent) : null,
        new_reset_date: edit.reset_date || null,
        new_role: edit.role || null,
      });

      if (error) {
        // Fallback: direct update
        await saveUserFallback(userId, edit);
        return;
      }

      // Also update company_name if changed
      if (edit.company_name !== undefined) {
        await supabase
          .from("profiles")
          .update({ company_name: edit.company_name, updated_at: new Date().toISOString() })
          .eq("id", userId);
      }

      showSuccess("Usuário atualizado!");
      setEdits((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      // Refresh user list
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...edit } : u))
      );
    } catch (err: any) {
      showError(err.message || "Erro ao salvar");
    } finally {
      setSaving(null);
    }
  };

  const saveUserFallback = async (userId: string, edit: Partial<UserRow>) => {
    try {
      if (edit.plan_type || edit.role) {
        await supabase.rpc("set_user_plan", {
          target_user_id: userId,
          new_plan_type: edit.plan_type,
        });
      }

      if (edit.used_percent != null || edit.tank_percent != null || edit.reset_date != null) {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (edit.used_percent != null) updateData.used_percent = Number(edit.used_percent);
        if (edit.tank_percent != null) updateData.tank_percent = Number(edit.tank_percent);
        if (edit.reset_date != null) updateData.reset_date = edit.reset_date;

        await supabase
          .from("user_usage")
          .update(updateData)
          .eq("user_id", userId);
      }

      if (edit.company_name !== undefined) {
        await supabase
          .from("profiles")
          .update({ company_name: edit.company_name, updated_at: new Date().toISOString() })
          .eq("id", userId);
      }

      showSuccess("Usuário atualizado!");
      setEdits((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...edit } : u))
      );
    } catch (err: any) {
      showError(err.message || "Erro ao salvar");
    }
  };

  const getPlanColor = (plan: string) => {
    return PLAN_OPTIONS.find((p) => p.value === plan)?.color || "bg-slate-100 text-slate-700";
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-[#D80E16]" />
          <h1 className="text-2xl font-black text-slate-900">Gerenciar Usuários</h1>
        </div>
        <p className="text-slate-600 text-sm">
          Edite planos, roles, uso e dados dos usuários.
        </p>
      </motion.div>

      {/* Search + Stats */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por email ou empresa..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#D80E16] focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">{filteredUsers.length}</span> usuários
              {search && <span>(filtrados de {users.length})</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#D80E16]" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Usuário</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Empresa</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Role</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Plano</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Uso</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Tank</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Reset</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase w-20">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-slate-400">Nenhum usuário encontrado</td></tr>
                ) : (
                  pagedUsers.map((u) => {
                    const isEdited = edits[u.id] && Object.keys(edits[u.id]).length > 0;
                    const edit = edits[u.id] || {};
                    const currentPlan = edit.plan_type ?? u.plan_type;
                    const currentRole = edit.role ?? u.role;
                    const currentTank = edit.tank_percent ?? u.tank_percent;
                    const currentUsed = edit.used_percent ?? u.used_percent;
                    const usagePct = u.tank_percent > 0 ? (currentUsed / u.tank_percent) * 100 : 0;
                    const isExpanded = expandedId === u.id;

                    return (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{u.email}</p>
                              {u.user_created_at && (
                                <p className="text-[9px] text-slate-400">
                                  {new Date(u.user_created_at).toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                            {u.role === "admin" && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            value={edit.company_name ?? u.company_name ?? ""}
                            onChange={(e) => handleEdit(u.id, "company_name", e.target.value)}
                            className="h-8 w-full max-w-[160px] rounded-lg border border-slate-200 px-2 text-xs text-slate-700 bg-white focus:border-[#D80E16] focus:outline-none"
                            placeholder="—"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={currentRole}
                            onChange={(e) => handleEdit(u.id, "role", e.target.value)}
                            className={`h-8 rounded-lg border px-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 ${
                              edit.role ? "border-[#D80E16] bg-red-50 text-[#D80E16]" : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={currentPlan}
                            onChange={(e) => handleEdit(u.id, "plan_type", e.target.value)}
                            className={`h-8 rounded-lg border px-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 ${
                              edit.plan_type ? "border-[#D80E16] bg-red-50 text-[#D80E16]" : "border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {PLAN_OPTIONS.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            value={currentUsed}
                            onChange={(e) => handleEdit(u.id, "used_percent", e.target.value)}
                            className="h-8 w-20 rounded-lg border border-slate-200 px-2 text-xs font-bold text-right text-slate-700 bg-white focus:border-[#D80E16] focus:outline-none"
                            min={0}
                            max={999}
                            step={0.1}
                          />
                          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${usagePct > 90 ? "bg-red-500" : usagePct > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${Math.min(usagePct, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            value={currentTank}
                            onChange={(e) => handleEdit(u.id, "tank_percent", e.target.value)}
                            className="h-8 w-20 rounded-lg border border-slate-200 px-2 text-xs font-bold text-right text-slate-700 bg-white focus:border-[#D80E16] focus:outline-none"
                            min={0}
                            max={999999}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="date"
                            value={edit.reset_date ? edit.reset_date.slice(0, 10) : (u.reset_date ? u.reset_date.slice(0, 10) : "")}
                            onChange={(e) => handleEdit(u.id, "reset_date", e.target.value ? `${e.target.value}T00:00:00Z` : null)}
                            className="h-8 rounded-lg border border-slate-200 px-2 text-xs text-slate-700 bg-white focus:border-[#D80E16] focus:outline-none"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center gap-1 justify-center">
                            {isEdited && (
                              <Button
                                size="sm"
                                className="h-8 px-2 text-xs bg-[#D80E16] hover:bg-[#b00b12] text-white"
                                onClick={() => saveUser(u.id)}
                                disabled={saving === u.id}
                              >
                                {saving === u.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                              </Button>
                            )}
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : u.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Anterior
          </button>
          <span className="text-xs text-slate-500">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Próximo
          </button>
        </div>
      )}
    </div>
  );
}
