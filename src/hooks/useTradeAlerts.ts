// src/hooks/useTradeAlerts.ts
// Hook completo para gerenciar regras de alerta e alertas gerados via Supabase

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

/* ═══════════════════ TYPES ═══════════════════ */

export type AlertRuleType =
  | "price_variation"
  | "volume_spike"
  | "new_country"
  | "country_growth"
  | "new_player"
  | "custom";

export type DirectionType = "import" | "export" | "both";

export interface AlertRule {
  id: string;
  user_id: string;
  name: string;
  type: AlertRuleType;
  direction: DirectionType;
  ncm: string | null;
  hs4: string | null;
  country_code: string | null;
  threshold_pct: number;
  enabled: boolean;
  last_checked_at: string | null;
  created_at: string;
}

export interface TradeAlert {
  id: string;
  user_id: string;
  rule_id: string | null;
  type: string;
  title: string;
  description: string;
  ncm: string | null;
  country_code: string | null;
  direction: string;
  old_value: number;
  new_value: number;
  variation_pct: number;
  read: boolean;
  dismissed: boolean;
  created_at: string;
}

export interface AlertFormData {
  name: string;
  type: AlertRuleType;
  direction: DirectionType;
  ncm: string;
  hs4: string;
  country_code: string;
  threshold_pct: number;
}

const DEFAULT_FORM: AlertFormData = {
  name: "",
  type: "price_variation",
  direction: "import",
  ncm: "",
  hs4: "",
  country_code: "",
  threshold_pct: 20,
};

const ALERT_TYPE_LABELS: Record<AlertRuleType, string> = {
  price_variation: "Variação de Preço",
  volume_spike: "Pico de Volume",
  new_country: "Novo País",
  country_growth: "Crescimento de País",
  new_player: "Novo Importador/Exportador",
  custom: "Personalizado",
};

const DIRECTION_LABELS: Record<DirectionType, string> = {
  import: "Importação",
  export: "Exportação",
  both: "Ambos",
};

export { ALERT_TYPE_LABELS, DIRECTION_LABELS, DEFAULT_FORM };
export type { AlertFormData };

/* ═══════════════════ HOOK ═══════════════════ */

export function useTradeAlerts() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [alerts, setAlerts] = useState<TradeAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Load rules + unread count ───
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [rulesRes, alertsRes, countRes] = await Promise.all([
        supabase
          .from("user_alert_rules")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("user_alerts")
          .select("*")
          .eq("dismissed", false)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .rpc("get_unread_alert_count", { p_user_id: supabase.auth.getUser().then(r => r.data.user?.id) }),
      ]);

      if (rulesRes.error && rulesRes.error.code !== "PGRST116") throw rulesRes.error;
      if (alertsRes.error && alertsRes.error.code !== "PGRST116") throw alertsRes.error;

      setRules(rulesRes.data || []);

      // Filter alerts for current user only
      const userAlerts = (alertsRes.data || []).filter(a => !a.dismissed);
      setAlerts(userAlerts);
      setUnreadCount(userAlerts.filter(a => !a.read).length);

    } catch (err: any) {
      if (err?.code === "PGRST301" || err?.message?.includes("relation") || err?.code === "42P01") {
        // Tabela não existe ainda — silencioso
        setRules([]);
        setAlerts([]);
        setUnreadCount(0);
      } else {
        console.error("[useTradeAlerts] load error:", err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Subscribe to realtime alerts
    const channel = supabase
      .channel("user_alerts_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_alerts" },
        async (payload) => {
          // Reload on new alert
          loadData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  // ─── Create rule ───
  const createRule = useCallback(async (formData: AlertFormData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const payload: Partial<AlertRule> = {
        name: formData.name,
        type: formData.type,
        direction: formData.direction,
        ncm: formData.ncm || null,
        hs4: formData.hs4 || null,
        country_code: formData.country_code || null,
        threshold_pct: formData.threshold_pct,
        enabled: true,
      };

      const { error: insertError } = await supabase
        .from("user_alert_rules")
        .insert(payload);

      if (insertError) throw insertError;
      showSuccess(`Regra "${formData.name}" criada!`);
      loadData();
      return true;
    } catch (err: any) {
      showError(err.message || "Erro ao criar regra");
      return false;
    }
  }, [loadData]);

  // ─── Update rule ───
  const updateRule = useCallback(async (ruleId: string, updates: Partial<AlertRule>) => {
    try {
      const { error: updateError } = await supabase
        .from("user_alert_rules")
        .update(updates)
        .eq("id", ruleId);

      if (updateError) throw updateError;
      loadData();
      return true;
    } catch (err: any) {
      showError(err.message || "Erro ao atualizar regra");
      return false;
    }
  }, [loadData]);

  // ─── Delete rule ───
  const deleteRule = useCallback(async (ruleId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("user_alert_rules")
        .delete()
        .eq("id", ruleId);

      if (deleteError) throw deleteError;
      showSuccess("Regra removida");
      loadData();
      return true;
    } catch (err: any) {
      showError(err.message || "Erro ao remover regra");
      return false;
    }
  }, [loadData]);

  // ─── Mark alert as read ───
  const markRead = useCallback(async (alertId: string) => {
    try {
      await supabase
        .from("user_alerts")
        .update({ read: true })
        .eq("id", alertId);

      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, read: true } : a
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }, []);

  // ─── Mark all as read ───
  const markAllRead = useCallback(async () => {
    try {
      const unreadIds = alerts.filter(a => !a.read).map(a => a.id);
      if (unreadIds.length === 0) return;

      await supabase
        .from("user_alerts")
        .update({ read: true })
        .in("id", unreadIds);

      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, [alerts]);

  // ─── Dismiss alert ───
  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      await supabase
        .from("user_alerts")
        .update({ dismissed: true })
        .eq("id", alertId);

      setAlerts(prev => prev.filter(a => a.id !== alertId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }, []);

  // ─── Check alerts (calls edge function) ───
  const checkAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-alerts`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao verificar alertas");
      }

      if (result.alerts && result.alerts.length > 0) {
        showSuccess(`${result.alerts.length} novo(s) alerta(s) detectado(s)!`);
      } else {
        showSuccess(`Nenhum alerta novo (${result.checked_rules || 0} regras verificadas)`);
      }

      loadData();
      return result;
    } catch (err: any) {
      showError(err.message || "Erro ao verificar alertas");
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  return {
    rules,
    alerts,
    unreadCount,
    loading,
    error,
    loadData,
    createRule,
    updateRule,
    deleteRule,
    markRead,
    markAllRead,
    dismissAlert,
    checkAlerts,
  };
}
