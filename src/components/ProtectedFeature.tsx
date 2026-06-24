import { ReactNode } from "react";
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

  if (loading) {
    return null;
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
