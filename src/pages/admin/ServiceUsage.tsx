"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity, Search, Loader2, Filter,
  Clock, BarChart3, Globe, Shield, RotateCcw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";

interface UsageRow {
  user_id: string;
  email: string;
  company_name: string;
  total_calls: number;
  unique_endpoints: number;
  last_activity: string;
  plan_type: string;
  used_percent: number;
  tank_percent: number;
}

interface EndpointDetail {
  endpoint: string;
  method: string;
  count: number;
  last_used: string;
  status: string;
}

export default function ServiceUsage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [usageRows, setUsageRows] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [endpointDetails, setEndpointDetails] = useState<EndpointDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [daysFilter, setDaysFilter] = useState(30);
  const [resettingId, setResettingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || profile.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchUsage();
  }, [profile, daysFilter]);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      // Try RPC first
      const { data, error } = await supabase.rpc("admin_get_usage_summary", {
        days_limit: daysFilter,
      });

      if (!error && data) {
        setUsageRows(data as UsageRow[]);
      } else {
        // Fallback: aggregrate directly
        await fetchUsageFallback();
      }
    } catch {
      await fetchUsageFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageFallback = async () => {
    try {
      // Get all profiles + usage
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, company_name")
        .limit(500);

      const { data: usage } = await supabase
        .from("user_usage")
        .select("*")
        .limit(500);

      const { data: logs } = await supabase
        .from("api_usage_logs")
        .select("user_id, endpoint, created_at, status")
        .gte("created_at", new Date(Date.now() - daysFilter * 86400000).toISOString())
        .limit(10000);

      const usageMap = new Map((usage || []).map((u: any) => [u.user_id, u]));

      // Aggregate logs per user
      const logAgg: Record<string, { calls: number; endpoints: Set<string>; last: string }> = {};
      (logs || []).forEach((l: any) => {
        if (!logAgg[l.user_id]) {
          logAgg[l.user_id] = { calls: 0, endpoints: new Set(), last: l.created_at };
        }
        logAgg[l.user_id].calls++;
        logAgg[l.user_id].endpoints.add(l.endpoint);
        if (l.created_at > logAgg[l.user_id].last) logAgg[l.user_id].last = l.created_at;
      });

      const rows: UsageRow[] = (profiles || []).map((p: any) => {
        const u = usageMap.get(p.id);
        const la = logAgg[p.id];
        return {
          user_id: p.id,
          email: p.email || "—",
          company_name: p.company_name || "",
          total_calls: la?.calls || 0,
          unique_endpoints: la?.endpoints.size || 0,
          last_activity: la?.last || null,
          plan_type: u?.plan_type || "essential",
          used_percent: Number(u?.used_percent || 0),
          tank_percent: Number(u?.tank_percent || 100),
        };
      });

      rows.sort((a, b) => b.total_calls - a.total_calls);
      setUsageRows(rows);
    } catch (err: any) {
      showError(err.message || "Erro ao carregar dados");
    }
  };

  const loadEndpointDetails = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetails(true);
    try {
      const cutoff = new Date(Date.now() - daysFilter * 86400000).toISOString();
      const { data, error } = await supabase
        .from("api_usage_logs")
        .select("endpoint, method, created_at, status")
        .eq("user_id", userId)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(5000);

      if (error) throw error;

      // Aggregate
      const agg: Record<string, { endpoint: string; method: string; count: number; last_used: string; status: string }> = {};
      (data || []).forEach((l: any) => {
        const key = `${l.method}:${l.endpoint}`;
        if (!agg[key]) {
          agg[key] = { endpoint: l.endpoint, method: l.method || "GET", count: 0, last_used: l.created_at, status: l.status || "success" };
        }
        agg[key].count++;
        if (l.created_at > agg[key].last_used) agg[key].last_used = l.created_at;
      });

      setEndpointDetails(Object.values(agg).sort((a, b) => b.count - a.count));
    } catch (err: any) {
      showError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredRows = usageRows.filter(
    (r) =>
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.company_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalCalls = usageRows.reduce((s, r) => s + r.total_calls, 0);

  const resetUsage = async (userId: string, email: string) => {
    setResettingId(userId);
    try {
      const { error } = await supabase
        .from("user_usage")
        .update({ used_percent: 0, updated_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;

      showSuccess(`Uso zerado para ${email}`);
      // Refresh
      setUsageRows((prev) =>
        prev.map((r) => (r.user_id === userId ? { ...r, used_percent: 0 } : r))
      );
    } catch (err: any) {
      showError(err.message || "Erro ao zerar uso");
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-[#D80E16]" />
          <h1 className="text-2xl font-black text-slate-900">Uso por Serviço</h1>
        </div>
        <p className="text-slate-600 text-sm">
          Monitore quais serviços cada usuário está utilizando.
        </p>
      </motion.div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por email ou empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#D80E16] focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {[7, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    daysFilter === d ? "bg-[#D80E16] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {d}d
                </button>
              ))}
              <span className="text-xs text-slate-400 ml-2 font-bold">{totalCalls.toLocaleString("pt-BR")} total</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User list */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Usuário</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Chamadas</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Endpoints</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Uso %</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Última Ativ.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Plano</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase w-16">Zerar</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D80E16]" /></td></tr>
                  ) : filteredRows.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400">Nenhum dado encontrado</td></tr>
                  ) : (
                    filteredRows.map((r) => (
                      <tr
                        key={r.user_id}
                        onClick={() => loadEndpointDetails(r.user_id)}
                        className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-all ${
                          selectedUserId === r.user_id ? "bg-red-50" : ""
                        }`}
                      >
                        <td className="px-3 py-2">
                          <p className="text-xs font-bold text-slate-800">{r.email}</p>
                          <p className="text-[9px] text-slate-400">{r.company_name || "—"}</p>
                        </td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-blue-700">{r.total_calls}</td>
                        <td className="px-3 py-2 text-right text-xs text-slate-600">{r.unique_endpoints}</td>
                        <td className="px-3 py-2 text-right">
                          <span className={`text-xs font-bold ${r.used_percent > 90 ? "text-red-600" : r.used_percent > 70 ? "text-amber-600" : "text-emerald-600"}`}>
                            {r.used_percent}%
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500">
                          {r.last_activity
                            ? new Date(r.last_activity).toLocaleDateString("pt-BR") + " " + new Date(r.last_activity).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <Badge className="text-[9px] font-bold uppercase bg-slate-100 text-slate-700 border-0">
                            {r.plan_type}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); resetUsage(r.user_id, r.email); }}
                            disabled={resettingId === r.user_id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-[#D80E16] transition-colors disabled:opacity-50"
                            title="Zerar uso"
                          >
                            {resettingId === r.user_id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Endpoint details sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-sm h-full">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                Endpoints Detalhados
              </h3>

              {!selectedUserId ? (
                <p className="text-xs text-slate-400">Clique em um usuário para ver detalhes</p>
              ) : loadingDetails ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#D80E16]" /></div>
              ) : endpointDetails.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum endpoint encontrado</p>
              ) : (
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {endpointDetails.slice(0, 30).map((ep, i) => (
                    <div key={i} className="px-2 py-1.5 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-slate-700 truncate">{ep.endpoint}</p>
                          <p className="text-[8px] text-slate-400">{ep.method}</p>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-bold text-blue-700">{ep.count}</p>
                          <Badge className={`text-[7px] font-bold uppercase px-1 py-0 ${
                            ep.status === "success" ? "bg-emerald-100 text-emerald-700" :
                            ep.status === "failed" ? "bg-red-100 text-red-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {ep.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
