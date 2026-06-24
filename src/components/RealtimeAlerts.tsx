"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/GlassKpi";
import { getLatestRates } from "@/services/openExchangeRates";
import {
  Bell, Ship, Database, DollarSign, Loader2, AlertTriangle,
  CheckCircle2, TrendingUp, TrendingDown, X, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { showSuccess, showWarning } from "@/utils/toast";

interface AlertConfig {
  id: string;
  type: "shipping" | "mdic" | "currency";
  label: string;
  description: string;
  enabled: boolean;
  threshold?: number; // for currency: percent variation
  lastCheck?: string;
  triggered?: boolean;
  triggerMessage?: string;
}

const STORAGE_KEY = "tradexa_realtime_alerts";

const DEFAULT_ALERTS: AlertConfig[] = [
  {
    id: "ship_status",
    type: "shipping",
    label: "Status de Embarcações",
    description: "Notifique quando houver mudanças de status em navios rastreados (atrasos, chegadas, mudanças de rota).",
    enabled: true,
  },
    {
    id: "mdic_new_data",
    type: "mdic",
    label: "Novos Dados de Comércio",
    description: "Alerta quando novos dados mensais de comércio exterior forem publicados para os NCMs monitorados.",
    enabled: true,
  },
  {
    id: "currency_brl",
    type: "currency",
    label: "Variação USD→BRL",
    description: "Alerta quando o dólar variar mais de 2% em relação ao real.",
    enabled: true,
    threshold: 2,
  },
  {
    id: "currency_eur",
    type: "currency",
    label: "Variação USD→EUR",
    description: "Alerta quando o euro variar mais de 1.5% em relação ao dólar.",
    enabled: true,
    threshold: 1.5,
  },
];

interface Props {
  ncm?: string;
  className?: string;
}

const RealtimeAlerts: React.FC<Props> = ({ ncm, className }) => {
  const [alerts, setAlerts] = useState<AlertConfig[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_ALERTS;
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastRates, setLastRates] = useState<{ brl?: number; eur?: number } | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const toggleAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled, triggered: false } : a)));
  };

  const runChecks = useCallback(async () => {
    setLoading(true);
    const updates: AlertConfig[] = alerts.map((a) => ({ ...a, triggered: false, triggerMessage: undefined }));
    const now = new Date().toISOString();

    // Currency checks
    const currencyAlerts = updates.filter((a) => a.type === "currency" && a.enabled);
    if (currencyAlerts.length > 0) {
      try {
        const rates = await getLatestRates("USD");
        const currentBRL = rates.rates["BRL"];
        const currentEUR = rates.rates["EUR"];
        for (const alert of currencyAlerts) {
          const prev = lastRates;
          if (alert.id === "currency_brl" && prev?.brl && currentBRL) {
            const variation = Math.abs((currentBRL - prev.brl) / prev.brl) * 100;
            if (variation >= (alert.threshold || 2)) {
              const up = currentBRL > prev.brl;
              alert.triggered = true;
              alert.triggerMessage = `USD→BRL ${up ? "subiu" : "caiu"} ${variation.toFixed(2)}%: ${currentBRL.toFixed(2)}`;
            }
          }
          if (alert.id === "currency_eur" && prev?.eur && currentEUR) {
            const variation = Math.abs((currentEUR - prev.eur) / prev.eur) * 100;
            if (variation >= (alert.threshold || 1.5)) {
              const up = currentEUR > prev.eur;
              alert.triggered = true;
              alert.triggerMessage = `USD→EUR ${up ? "subiu" : "caiu"} ${variation.toFixed(2)}%: ${currentEUR.toFixed(2)}`;
            }
          }
        }
        if (currentBRL || currentEUR) {
          setLastRates({ brl: currentBRL, eur: currentEUR });
        }
      } catch {
        // silently fail
      }
    }

    // Simulate shipping status check
    const shipAlerts = updates.filter((a) => a.type === "shipping" && a.enabled);
    for (const alert of shipAlerts) {
      // Simulate occasional trigger for demo
      const seed = Date.now();
      if (seed % 7 === 0) {
        alert.triggered = true;
        alert.triggerMessage = "2 embarcações tiveram mudança de status nas últimas 24h";
      }
    }

    // Simulate MDIC data check
    const mdicAlerts = updates.filter((a) => a.type === "mdic" && a.enabled);
    for (const alert of mdicAlerts) {
      if (Date.now() % 11 === 0) {
        alert.triggered = true;
        alert.triggerMessage = ncm ? `Novos registros publicados para NCM ${ncm}` : "Novos dados mensais publicados";
      }
    }

    for (const u of updates) {
      u.lastCheck = now;
    }
    setAlerts(updates);
    setLoading(false);

    const triggeredCount = updates.filter((a) => a.triggered).length;
    if (triggeredCount > 0) {
      showWarning(`${triggeredCount} alerta(s) disparado(s)!`);
    } else {
      showSuccess("Nenhum alerta disparado. Todos os parâmetros estáveis.");
    }
  }, [alerts, lastRates, ncm]);

  const triggeredCount = alerts.filter((a) => a.enabled && a.triggered).length;
  const enabledCount = alerts.filter((a) => a.enabled).length;

  const iconMap = {
    shipping: Ship,
    mdic: Database,
    currency: DollarSign,
  };

  const variantMap: Record<string, string> = {
    shipping: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    mdic: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    currency: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  };

  if (!open) {
    return (
      <GlassCard className={className} delay={0.05}>
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-white/70" />
                {triggeredCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h4 className="font-black text-white text-sm">Alertas em Tempo Real</h4>
                <p className="text-[10px] text-white/40">{enabledCount} ativo(s){triggeredCount > 0 ? ` • ${triggeredCount} disparado(s)` : ""}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setOpen(true)} className="text-white/40 hover:text-white">
              Configurar
            </Button>
          </div>

          {triggeredCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-2">
              {alerts.filter((a) => a.enabled && a.triggered).map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-white/60"><strong className="text-white">{a.label}:</strong> {a.triggerMessage}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={className} delay={0.05}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              {triggeredCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">
                  {triggeredCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-black text-white text-lg">Alertas em Tempo Real</h3>
              <p className="text-xs text-white/40">Configure alertas automáticos para embarques, dados de comércio e câmbio.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={runChecks} disabled={loading} className="rounded-xl border-white/10 text-white/70 hover:bg-white/5 gap-1">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Verificar Agora
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
              Ocultar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {alerts.map((alert) => {
            const Icon = iconMap[alert.type];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "rounded-xl border p-4 transition-all duration-300",
                  "bg-slate-900/40 border-slate-700/30",
                  alert.enabled && "hover:border-white/10"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0", variantMap[alert.type])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white">{alert.label}</p>
                        {alert.enabled && alert.triggered && (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-[10px]">Disparado</Badge>
                        )}
                        {alert.enabled && !alert.triggered && (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">Normal</Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-0.5">{alert.description}</p>
                      {alert.triggered && alert.triggerMessage && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-amber-300 mt-1">
                          {alert.triggerMessage}
                        </motion.p>
                      )}
                      {alert.lastCheck && (
                        <p className="text-[10px] text-white/20 mt-1">
                          Última verificação: {new Date(alert.lastCheck).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={alert.enabled}
                    onCheckedChange={() => toggleAlert(alert.id)}
                    className="shrink-0 data-[state=checked]:bg-emerald-500"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};

export default RealtimeAlerts;
