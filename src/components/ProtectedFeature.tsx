import { ReactNode, useEffect, useState } from "react";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { UpgradePrompt } from "./UpgradePrompt";

interface ProtectedFeatureProps {
  featureKey: string;
  children: ReactNode;
  /** Se true, mostra upgrade prompt inline. Se false, redireciona ou bloqueia. */
  inline?: boolean;
}

/**
 * Wrapper que bloqueia uma seção/página inteira se o usuário
 * não tem o plano necessário ou créditos suficientes.
 */
export function ProtectedFeature({ featureKey, children, inline = true }: ProtectedFeatureProps) {
  const { canAccess, lockedByPlan, upgradePlan, label, loading } = useFeatureAccess(featureKey);

  // Persist "had access" across loading cycles so tab wake-up doesn't nuke children
  const storageKey = `tradexa_feature_${featureKey}`;
  const [hadAccess, setHadAccess] = useState(() => {
    return localStorage.getItem(storageKey) === "true";
  });

  // Once access is confirmed, remember it
  useEffect(() => {
    if (canAccess && !loading && !hadAccess) {
      localStorage.setItem(storageKey, "true");
      setHadAccess(true);
    }
  }, [canAccess, loading, hadAccess, storageKey]);

  if (loading) {
    // First-ever load (no cached access) — show nothing
    if (!hadAccess) return null;
    // Re-auth loading — keep children mounted
    return <>{children}</>;
  }

  if (!canAccess) {
    if (inline && upgradePlan) {
      return <UpgradePrompt featureLabel={label} requiredPlan={upgradePlan} />;
    }
    return (
      <div className="flex items-center justify-center py-20 text-sm text-slate-600">
        Acesso negado. Faça upgrade em /plans
      </div>
    );
  }

  return <>{children}</>;
}
