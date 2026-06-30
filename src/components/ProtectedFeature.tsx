import { ReactNode, useEffect, useRef, useState } from "react";
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
 * 
 * 🔧 Fix: não desmonta children durante re-auth/loading para evitar
 * que a página de import-export-data reinicie ao trocar de aba.
 */
export function ProtectedFeature({ featureKey, children, inline = true }: ProtectedFeatureProps) {
  const { canAccess, lockedByPlan, upgradePlan, label, loading } = useFeatureAccess(featureKey);

  // Persist "had access" across loading cycles so tab wake-up doesn't nuke children
  const storageKey = `tradexa_feature_${featureKey}`;
  const [hadAccess, setHadAccess] = useState(() => {
    return localStorage.getItem(storageKey) === "true";
  });
  // Track if we've ever successfully mounted with access (survives loading flashes)
  const everHadAccess = useRef(hadAccess);

  // Once access is confirmed, remember it
  useEffect(() => {
    if (canAccess && !loading && !hadAccess) {
      localStorage.setItem(storageKey, "true");
      setHadAccess(true);
      everHadAccess.current = true;
    }
  }, [canAccess, loading, hadAccess, storageKey]);

  if (loading) {
    // First-ever load (no cached access, never had access) — show nothing
    if (!everHadAccess.current && !hadAccess) return null;
    // Re-auth loading — keep children mounted to prevent page reset
    return <>{children}</>;
  }

  if (!canAccess) {
    // Clear cached access if access was revoked
    if (hadAccess) {
      // ⚠️ NUNCA setState durante render — causa React error #301
      setTimeout(() => {
        localStorage.removeItem(storageKey);
        setHadAccess(false);
        everHadAccess.current = false;
      }, 0);
    }
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
