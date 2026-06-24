"use client";

import { useMemo } from "react";
import { useAuth } from "./use-auth";
import { useUsage } from "./use-usage";
import {
  canAccessFeature,
  getFeatureLimit,
  getFeatureCost,
  getUpgradePlanForFeature,
  type PlanType,
  FEATURE_MAP,
} from "@/lib/plan-features";
import { sanitizePlan } from "@/lib/usage-costs";

export interface FeatureAccessResult {
  canAccess: boolean;
  hasQuota: boolean;
  usageCost: number;
  monthlyLimit: number | null;
  usedPercent: number;
  upgradePlan: PlanType | null;
  currentPlan: PlanType;
  badge?: string;
  label: string;
  lockedByPlan: boolean;
  lockedByQuota: boolean;
}

export function useFeatureAccess(featureKey: string): FeatureAccessResult {
  const { profile } = useAuth();
  const { usage, loading: usageLoading, isAtLimit } = useUsage();

  const plan: PlanType = sanitizePlan(profile?.plan_type || "essential");
  const featureConfig = FEATURE_MAP[featureKey];

  return useMemo(() => {
    const access = canAccessFeature(featureKey, plan);
    const limit = getFeatureLimit(featureKey, plan);
    const cost = getFeatureCost(featureKey);
    const upgrade = getUpgradePlanForFeature(featureKey, plan);

    const usageCost = cost;
    // Tem quota se: custo 0, ou não atingiu limite geral, e (sem limite mensal ou ainda não esgotou)
    const hasMonthlyQuota = limit === null || (limit > 0 && (usage?.used_percent ?? 0) < limit * 100); // simplificado
    const hasQuota = cost === 0 || (!isAtLimit);
    const lockedByPlan = !access;
    const lockedByQuota = access && cost > 0 && !hasQuota;

    return {
      canAccess: access && hasQuota && !usageLoading,
      hasQuota,
      usageCost,
      monthlyLimit: limit,
      usedPercent: usage?.used_percent ?? 0,
      upgradePlan: upgrade,
      currentPlan: plan,
      badge: featureConfig?.badge,
      label: featureConfig?.label ?? featureKey,
      lockedByPlan,
      lockedByQuota,
      loading: usageLoading,
    };
  }, [plan, usage, usageLoading, isAtLimit, featureKey, featureConfig]);
}

export function useFeaturesStatus(featureKeys: string[]) {
  const { profile } = useAuth();
  const { usage, loading, isAtLimit } = useUsage();
  const plan: PlanType = sanitizePlan(profile?.plan_type || "essential");

  return useMemo(() => {
    const result: Record<string, FeatureAccessResult> = {};
    for (const key of featureKeys) {
      const config = FEATURE_MAP[key];
      const access = canAccessFeature(key, plan);
      const limit = getFeatureLimit(key, plan);
      const cost = getFeatureCost(key);
      const upgrade = getUpgradePlanForFeature(key, plan);
      const usageCost = cost;
      const hasQuota = cost === 0 || (!isAtLimit);

      result[key] = {
        canAccess: access && hasQuota && !loading,
        hasQuota,
        usageCost,
        monthlyLimit: limit,
        usedPercent: usage?.used_percent ?? 0,
        upgradePlan: upgrade,
        currentPlan: plan,
        badge: config?.badge,
        label: config?.label ?? key,
        lockedByPlan: !access,
        lockedByQuota: access && cost > 0 && !hasQuota,
      };
    }
    return result;
  }, [plan, usage, loading, isAtLimit, featureKeys]);
}
