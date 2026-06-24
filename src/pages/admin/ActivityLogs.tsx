"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock, Search, Loader2, Filter,
  ChevronDown, ChevronUp, Shield,
  Terminal, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { showError } from "@/utils/toast";

interface LogEntry {
  id: string;
  user_id: string;
  email?: string;
  endpoint: string;
  method: string;
  credits_used: number;
  status: string;
  metadata: any;
  created_at: string;
}

export default function ActivityLogs() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    if (!profile || profile.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchLogs();
  }, [profile, page, statusFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("api_usage_logs")
        .select("*, profiles!inner(email)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error, count } = await query;

      if (error) {
        // Fallback without join
        await fetchLogsFallback();
        return;
      }

      const mapped = (data || []).map((l: any) => ({
        id: l.id,
        user_id: l.user_id,
        email: l.profiles?.email,
        endpoint: l.endpoint,
        method: l.method || "GET",
        credits_used: l.credits_used || 1,
        status: l.status || "success",
        metadata: l.metadata,
        created_at: l.created_at,
      }));

      setLogs(mapped);
      setTotalCount(count || 0);
    } catch {
      await fetchLogsFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchLogsFallback = async () => {
    try {
      const { data, error, count } = await supabase
        .from("api_usage_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (error) throw error;

      // Try to get user emails
      const userIds = [...new Set((data || []).map((l: any) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const emailMap = new Map((profiles || []).map((p: any) => [p.id, p.email]));

      const mapped = (data || []).map((l: any) => ({
        ...l,
        email: emailMap.get(l.user_id),
        method: l.method || "GET",
      }));

      setLogs(mapped);
      setTotalCount(count || 0);
    } catch (err: any) {
      showError(err.message || "Erro ao carregar logs");
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.endpoint.toLowerCase().includes(search.toLowerCase()) ||
      l.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const statusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      case "failed": return <XCircle className="w-3 h-3 text-red-500" />;
      case "blocked": return <AlertCircle className="w-3 h-3 text-amber-500" />;
      default: return <Terminal className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6 text-[#D80E16]" />
          <h1 className="text-2xl font-black text-slate-900">Logs de Atividade</h1>
        </div>
        <p className="text-slate-600 text-sm">
          Timeline completa de todas as chamadas de API da plataforma.
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
                placeholder="Buscar por email, endpoint ou user_id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#D80E16] focus:outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              {[
                { value: "all", label: "Todos" },
                { value: "success", label: "Sucesso" },
                { value: "failed", label: "Falha" },
                { value: "blocked", label: "Bloqueado" },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => { setStatusFilter(s.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === s.value ? "bg-[#D80E16] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <span className="text-xs text-slate-400 ml-2">Total: {totalCount.toLocaleString("pt-BR")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs table */}
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
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Data/Hora</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Usuário</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Endpoint</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Método</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase">Créditos</th>
                  <th className="text-center px-3 py-2.5 text-[10px] font-bold text-slate-500 uppercase w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Terminal className="w-8 h-8 text-slate-300" />
                      <span className="text-sm">Nenhum log de API encontrado</span>
                      <span className="text-xs text-slate-300">Os logs aparecerão aqui quando usuários começarem a usar as APIs da plataforma</span>
                    </div>
                  </td></tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isExpanded = expandedId === log.id;
                    return (
                      <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleDateString("pt-BR")}
                          <br />
                          <span className="text-[9px] text-slate-400">
                            {new Date(log.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <p className="text-xs font-bold text-slate-700">{log.email || "—"}</p>
                          <p className="text-[8px] text-slate-400 font-mono">{log.user_id.slice(0, 8)}...</p>
                        </td>
                        <td className="px-3 py-2">
                          <p className="text-xs font-mono text-slate-800 max-w-[200px] truncate" title={log.endpoint}>
                            {log.endpoint}
                          </p>
                        </td>
                        <td className="px-3 py-2">
                          <Badge className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border-0">
                            {log.method}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {statusIcon(log.status)}
                            <span className={`text-[10px] font-bold ${
                              log.status === "success" ? "text-emerald-600" :
                              log.status === "failed" ? "text-red-600" :
                              "text-amber-600"
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-xs font-bold text-slate-600">
                          {log.credits_used}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : log.id)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
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
