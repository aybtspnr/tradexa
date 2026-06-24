"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { showError } from "@/utils/toast";
import { calculateCost, PLAN_COST_MULTIPLIER, PLAN_TANK, PLAN_LABELS, type ActionType, type PlanType } from "@/lib/usage-costs";

const LS_KEY = "tradexa_usage";

interface UserUsage {
  id: string;
  user_id: string;
  plan_type: PlanType;
  used_percent: number;
  tank_percent: number;
  reset_date: string;
  updated_at: string;
  ai_queries_used?: number;
}

interface UsageContextValue {
  usage: UserUsage | null;
  loading: boolean;
  plan: PlanType;
  tank: number;
  used: number;
  percentUsed: number;
  remaining: number;
  isLimited: boolean;
  isNearLimit: boolean;
  isAtLimit: boolean;
  consume: (action: ActionType, opts?: { wordCount?: number }) => Promise<boolean>;
  consumePercent: (percent: number) => Promise<boolean>;
  consumeAiQuery: () => Promise<boolean>;
  refresh: () => void;
}

const UsageContext = createContext<UsageContextValue | null>(null);

function getLocalUsage(): { used_percent: number; tank_percent: number; reset_date: string } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.reset_date && new Date(data.reset_date) < new Date()) {
      localStorage.removeItem(LS_KEY);
      return null;
    }
    return data;
  } catch { return null; }
}

function saveLocalUsage(used_percent: number, tank_percent: number) {
  try {
    const now = new Date();
    const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    localStorage.setItem(LS_KEY, JSON.stringify({ used_percent, tank_percent, reset_date: reset.toISOString() }));
  } catch {}
}

function nextResetDate(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseOk, setSupabaseOk] = useState(true);
  const refreshTimer = useRef<NodeJS.Timeout | null>(null);

  const plan: PlanType = (usage?.plan_type as PlanType) || (profile?.plan_type as PlanType) || "essential";
  const multiplier = PLAN_COST_MULTIPLIER[plan] ?? 1.0;
  const tank = PLAN_TANK[plan] ?? 100;

  const localUsage = getLocalUsage();
  const supabaseUsed = usage?.used_percent || 0;
  const localUsed = localUsage?.used_percent || 0;
  const used = Math.max(supabaseUsed, localUsed);

  const isLimited = true;
  const percentUsed = tank > 0 ? Math.min(100, (used / tank) * 100) : 0;
  const remaining = isLimited ? Math.max(0, tank - used) : 999999;
  const isNearLimit = isLimited && tank > 0 && used >= tank * 0.8;
  const isAtLimit = isLimited && used >= tank;

  const fetchUsage = useCallback(async () => {
    if (!profile) { setLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from("user_usage")
        .select("*")
        .eq("user_id", profile.id)
        .maybeSingle();
      if (error) { setSupabaseOk(false); setUsage(null); setLoading(false); return; }
      setSupabaseOk(true);
      if (!data) {
        const defaults = { user_id: profile.id, plan_type: (profile.plan_type as PlanType) || "essential", used_percent: 0, tank_percent: tank, ai_queries_used: 0, reset_date: nextResetDate() };
        try {
          const { data: created, error: createError } = await supabase.from("user_usage").upsert(defaults, { onConflict: "user_id" }).select().single();
          if (createError) { setSupabaseOk(false); }
          setUsage(created || null);
        } catch { setSupabaseOk(false); setUsage(null); }
      } else {
        // If Supabase was reset externally (e.g. admin reset), clear stale localStorage
        const supabaseUsed = data.used_percent || 0;
        const local = getLocalUsage();
        if (local && supabaseUsed < local.used_percent) {
          localStorage.removeItem(LS_KEY);
        }
        setUsage(data);
      }
    } catch { setSupabaseOk(false); setUsage(null); }
    finally { setLoading(false); }
  }, [profile, tank]);

  useEffect(() => { fetchUsage(); }, [fetchUsage]);

  // Poll localStorage every 2 seconds to pick up changes from other tabs/components
  useEffect(() => {
    refreshTimer.current = setInterval(() => {
      const local = getLocalUsage();
      if (local && local.used_percent > (usage?.used_percent || 0)) {
        setUsage(prev => prev ? { ...prev, used_percent: local.used_percent } : null);
      }
    }, 2000);
    return () => { if (refreshTimer.current) clearInterval(refreshTimer.current); };
  }, [usage]);

  const refresh = useCallback(() => { fetchUsage(); }, [fetchUsage]);

  const consume = useCallback(async (action: ActionType, opts?: { wordCount?: number }): Promise<boolean> => {
    const baseCost = calculateCost(action, opts);
    const cost = Math.round(baseCost * multiplier * 10) / 10;
    const local = getLocalUsage();
    const currentLocalUsed = local?.used_percent || 0;
    const effectiveUsed = Math.max(currentLocalUsed, used);
    if (effectiveUsed + cost > tank) {
      const label = PLAN_LABELS[plan] || plan;
      showError(`Limite ${label} atingido (${effectiveUsed.toFixed(1)}% / ${tank}%). Faça upgrade!`);
      return false;
    }
    // Always save to localStorage (works even without auth)
    saveLocalUsage(currentLocalUsed + cost, tank);
    setUsage(prev => prev ? { ...prev, used_percent: currentLocalUsed + cost } : { used_percent: currentLocalUsed + cost } as any);
    // Try Supabase only if authenticated
    if (profile && supabaseOk) {
      try {
        const currentSupabaseUsed = usage?.used_percent || 0;
        if (!usage?.id) {
          const { data: created } = await supabase.from("user_usage").upsert({ user_id: profile.id, plan_type: (profile.plan_type as PlanType) || "essential", used_percent: Math.max(currentSupabaseUsed + cost, currentLocalUsed + cost), tank_percent: tank, ai_queries_used: action === "ai_query" ? 1 : 0, reset_date: nextResetDate() }, { onConflict: "user_id" }).select().single();
          if (created) setUsage(created);
        } else {
          const updates: Record<string, any> = { used_percent: Math.max(currentSupabaseUsed + cost, currentLocalUsed + cost), updated_at: new Date().toISOString() };
          if (action === "ai_query") updates.ai_queries_used = (usage.ai_queries_used || 0) + 1;
          const { data } = await supabase.from("user_usage").update(updates).eq("user_id", profile.id).select().single();
          if (data) setUsage(data);
        }
      } catch {}
    }
    return true;
  }, [profile, multiplier, tank, used, plan, usage, supabaseOk]);

  const consumePercent = useCallback(async (percent: number): Promise<boolean> => {
    const cost = Math.round(percent * multiplier * 10) / 10;
    const local = getLocalUsage();
    const currentLocalUsed = local?.used_percent || 0;
    const effectiveUsed = Math.max(currentLocalUsed, used);
    if (effectiveUsed + cost > tank) {
      const label = PLAN_LABELS[plan] || plan;
      showError(`Limite ${label} atingido (${effectiveUsed.toFixed(1)}% / ${tank}%). Faça upgrade!`);
      return false;
    }
    saveLocalUsage(currentLocalUsed + cost, tank);
    setUsage(prev => prev ? { ...prev, used_percent: currentLocalUsed + cost } : { used_percent: currentLocalUsed + cost } as any);
    // Sync to Supabase if authenticated
    if (profile && supabaseOk) {
      try {
        const currentSupabaseUsed = usage?.used_percent || 0;
        if (!usage?.id) {
          const { data: created } = await supabase.from("user_usage").upsert({ user_id: profile.id, plan_type: (profile.plan_type as PlanType) || "essential", used_percent: Math.max(currentSupabaseUsed + cost, currentLocalUsed + cost), tank_percent: tank, ai_queries_used: 0, reset_date: nextResetDate() }, { onConflict: "user_id" }).select().single();
          if (created) setUsage(created);
        } else {
          const { data } = await supabase.from("user_usage").update({ used_percent: Math.max(currentSupabaseUsed + cost, currentLocalUsed + cost), updated_at: new Date().toISOString() }).eq("user_id", profile.id).select().single();
          if (data) setUsage(data);
        }
      } catch {}
    }
    return true;
  }, [profile, multiplier, tank, used, plan, usage, supabaseOk]);

  const consumeAiQuery = useCallback(async (): Promise<boolean> => {
    const currentAi = usage?.ai_queries_used ?? 0;
    if (plan === "essential" && currentAi >= 2) {
      showError("Limite de 2 consultas IA atingido no plano Essential. Faça upgrade!");
      return false;
    }
    const cost = 8.0 * multiplier;
    const local = getLocalUsage();
    const currentLocalUsed = local?.used_percent || 0;
    const effectiveUsed = Math.max(currentLocalUsed, used);
    if (effectiveUsed + cost > tank) { showError("Limite do plano atingido."); return false; }
    saveLocalUsage(currentLocalUsed + cost, tank);
    setUsage(prev => prev ? { ...prev, used_percent: currentLocalUsed + cost, ai_queries_used: currentAi + 1 } : { used_percent: currentLocalUsed + cost, ai_queries_used: currentAi + 1 } as any);
    // Sync to Supabase if authenticated
    if (profile && supabaseOk) {
      try {
        const currentSupabaseUsed = usage?.used_percent || 0;
        if (!usage?.id) {
          const { data: created } = await supabase.from("user_usage").upsert({ user_id: profile.id, plan_type: (profile.plan_type as PlanType) || "essential", used_percent: Math.max(currentSupabaseUsed + cost, currentLocalUsed + cost), tank_percent: tank, ai_queries_used: currentAi + 1, reset_date: nextResetDate() }, { onConflict: "user_id" }).select().single();
          if (created) setUsage(created);
        } else {
          const { data } = await supabase.from("user_usage").update({ used_percent: Math.max(currentSupabaseUsed + cost, currentLocalUsed + cost), ai_queries_used: currentAi + 1, updated_at: new Date().toISOString() }).eq("user_id", profile.id).select().single();
          if (data) setUsage(data);
        }
      } catch {}
    }
    return true;
  }, [profile, multiplier, tank, used, plan, usage, supabaseOk]);

  return (
    <UsageContext.Provider value={{ usage, loading, plan, tank, used, percentUsed, remaining, isLimited, isNearLimit, isAtLimit, consume, consumePercent, consumeAiQuery, refresh }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  const ctx = useContext(UsageContext);
  if (!ctx) throw new Error("useUsage must be used within UsageProvider");
  return ctx;
}

export { PLAN_TANK, PLAN_COST_MULTIPLIER, PLAN_LABELS };
export type { PlanType, ActionType };
