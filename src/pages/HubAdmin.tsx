"use client";

import { useState, useEffect, useCallback } from "react";
import { useSeo } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Shield,
  Server,
  Database,
  Activity,
  Route,
  Link2,
  RefreshCw,
  Wifi,
  Clock,
  HardDrive,
  Cpu,
} from "lucide-react";

/* ══════ TYPES ══════ */

interface ServiceStatus {
  name: string;
  key: string;
  icon: typeof Server;
  status: "online" | "offline" | "checking";
  latencyMs: number | null;
}

interface RouteInfo {
  path: string;
  label: string;
  description: string;
}

interface CacheStats {
  localStorageKeys: number;
  localStorageSize: string;
  sessionStorageKeys: number;
  sessionStorageSize: string;
}

/* ══════ CONSTANTS ══════ */

const ADMIN_ROUTES: RouteInfo[] = [
  { path: "/admin", label: "Painel Admin", description: "Visão geral da plataforma" },
  { path: "/admin/users", label: "Usuários", description: "Gerenciar cadastros" },
  { path: "/admin/usage", label: "Uso", description: "Monitorar serviços" },
  { path: "/admin/logs", label: "Logs", description: "Atividade recente" },
  { path: "/admin/ncm", label: "NCMs", description: "Gerenciar códigos NCM" },
  { path: "/admin/hs", label: "HS", description: "Gerenciar códigos HS" },
];

const SERVICES: Omit<ServiceStatus, "status" | "latencyMs">[] = [
  { name: "VPS (Servidor)", key: "vps", icon: Server },
  { name: "Supabase", key: "supabase", icon: Database },
  { name: "BCB (PTAX)", key: "bcb", icon: Activity },
];

/* ══════ HELPERS ══════ */

async function checkService(key: string): Promise<{ status: "online" | "offline"; latencyMs: number }> {
  const start = performance.now();
  try {
    if (key === "vps") {
      await fetch(window.location.origin, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    } else if (key === "supabase") {
      const { error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      if (error) throw error;
    } else if (key === "bcb") {
      await fetch(
        "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/",
        { method: "HEAD", signal: AbortSignal.timeout(5000) },
      );
    }
    return { status: "online", latencyMs: Math.round(performance.now() - start) };
  } catch {
    return { status: "offline", latencyMs: Math.round(performance.now() - start) };
  }
}

function getCacheStats(): CacheStats {
  let localStorageKeys = 0, localStorageBytes = 0;
  let sessionStorageKeys = 0, sessionStorageBytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null) {
        localStorageKeys++;
        localStorageBytes += (localStorage.getItem(k)?.length || 0) * 2;
      }
    }
  } catch { /* storage restricted */ }
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k !== null) {
        sessionStorageKeys++;
        sessionStorageBytes += (sessionStorage.getItem(k)?.length || 0) * 2;
      }
    }
  } catch { /* storage restricted */ }
  const fmt = (bytes: number) =>
    bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : bytes > 1024
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${bytes} B`;
  return {
    localStorageKeys,
    localStorageSize: fmt(localStorageBytes),
    sessionStorageKeys,
    sessionStorageSize: fmt(sessionStorageBytes),
  };
}

/* ══════ COMPONENT ══════ */

export default function HubAdmin() {
  useSeo({ title: "Admin — Intelligence Hub — TradeXA" });
  const { profile, loading } = useAuth();
  // Supports both `role === "admin"` (type-safe) and `is_admin` (runtime field)
  const isAdmin = !!(profile as any)?.is_admin || (profile?.role === "admin");

  const [services, setServices] = useState<ServiceStatus[]>(
    SERVICES.map((s) => ({ ...s, status: "checking", latencyMs: null })),
  );
  const [cacheStats, setCacheStats] = useState<CacheStats>(getCacheStats());
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const runChecks = useCallback(async () => {
    setServices((prev) => prev.map((s) => ({ ...s, status: "checking" as const })));
    const results = await Promise.all(SERVICES.map((s) => checkService(s.key)));
    setServices((prev) =>
      prev.map((s, i) => ({
        ...s,
        status: results[i].status,
        latencyMs: results[i].latencyMs,
      })),
    );
    setCacheStats(getCacheStats());
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    runChecks();
    const interval = setInterval(runChecks, 30_000);
    return () => clearInterval(interval);
  }, [isAdmin, runChecks]);

  /* ── Not admin guard ── */
  if (loading) return null;
  if (!isAdmin) {
    return (
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center text-slate-500">
            <Shield className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Acesso restrito a administradores.</p>
            <p className="text-xs mt-1">Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[#D80E16]" />
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide">Admin</h2>
            <p className="text-xs text-slate-500">Monitoramento e gestão do hub</p>
          </div>
        </div>
        <button
          onClick={runChecks}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Verificar
        </button>
      </div>

      {/* ── API Status ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
          <Wifi className="w-4 h-4 text-[#c9a84c]" />
          Status das APIs
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {services.map((svc) => {
            const Icon = svc.icon;
            const isOnline = svc.status === "online";
            const isChecking = svc.status === "checking";
            return (
              <Card key={svc.key} className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-bold text-slate-700">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isChecking ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                      ) : (
                        <>
                          <div className={cn("w-2.5 h-2.5 rounded-full", isOnline ? "bg-green-500" : "bg-red-500")} />
                          <span className={cn("text-[10px] font-bold uppercase", isOnline ? "text-green-600" : "text-red-600")}>
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {svc.latencyMs !== null && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{svc.latencyMs} ms</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── Registered Routes ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
          <Route className="w-4 h-4 text-blue-500" />
          Rotas Registradas
        </h3>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0 divide-y divide-slate-100">
            {ADMIN_ROUTES.map((route) => (
              <div
                key={route.path}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Link2 className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {route.path}
                    </code>
                    <Badge className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 border-slate-200">
                      admin
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{route.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Section 3: Cache Stats ── */}
      <div>
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
          <HardDrive className="w-4 h-4 text-emerald-500" />
          Cache do Navegador
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">localStorage</p>
                <p className="text-base font-black text-slate-800">
                  {cacheStats.localStorageKeys} <span className="text-xs font-normal text-slate-500">itens</span>
                </p>
                <p className="text-[11px] text-slate-500">{cacheStats.localStorageSize}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">sessionStorage</p>
                <p className="text-base font-black text-slate-800">
                  {cacheStats.sessionStorageKeys} <span className="text-xs font-normal text-slate-500">itens</span>
                </p>
                <p className="text-[11px] text-slate-500">{cacheStats.sessionStorageSize}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
