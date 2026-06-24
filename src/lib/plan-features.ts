/**
 * Sistema de Feature Flags por Plano — Tradexa
 * Define quais funcionalidades cada plano pode acessar.
 *
 * Planos: essential | growth | professional | business
 */

export type PlanType = "essential" | "growth" | "professional" | "business";

export interface FeatureConfig {
  key: string;
  label: string;
  description: string;
  icon: string;
  /** Créditos consumidos por uso (0 = grátis) */
  creditCost: number;
  /** Planos que podem usar (se vazio = todos) */
  allowedPlans: PlanType[];
  /** Limite mensal por plano (null = ilimitado, 0 = bloqueado) */
  monthlyLimit: Record<PlanType, number | null>;
  /** Mostrar no menu lateral? */
  showInMenu: boolean;
  /** Badge no menu: "GRÁTIS", "PRO", "BUSINESS" */
  badge?: string;
}

export const FEATURE_MAP: Record<string, FeatureConfig> = {
  // ── Essential (apenas 2 consultas IA) ──
  "ai_search": {
    key: "ai_search",
    label: "Classificador IA NCM",
    description: "IA classifica produtos em NCM",
    icon: "Sparkles",
    creditCost: 1,
    allowedPlans: ["essential", "growth", "professional", "business"],
    monthlyLimit: { essential: 2, growth: null, professional: null, business: null },
    showInMenu: true,
    badge: "IA",
  },

  // ── Growth (ferramentas básicas) ──
  "hts_lookup": {
    key: "hts_lookup",
    label: "Consulta HTS EUA",
    description: "Tarifas dos EUA",
    icon: "Search",
    creditCost: 0,
    allowedPlans: ["growth", "professional", "business"],
    monthlyLimit: { essential: 0, growth: null, professional: null, business: null },
    showInMenu: true,
  },
  "ncm_comparison": {
    key: "ncm_comparison",
    label: "Comparar NCMs",
    description: "Compare classificações",
    icon: "BarChart3",
    creditCost: 0,
    allowedPlans: ["growth", "professional", "business"],
    monthlyLimit: { essential: 0, growth: null, professional: null, business: null },
    showInMenu: true,
  },
  "export_simulator": {
    key: "export_simulator",
    label: "Simulador de Exportação",
    description: "Calcule custo total de exportação",
    icon: "Calculator",
    creditCost: 1,
    allowedPlans: ["growth", "professional", "business"],
    monthlyLimit: { essential: 0, growth: null, professional: null, business: null },
    showInMenu: true,
  },
  "global_tariff": {
    key: "global_tariff",
    label: "Alíquotas por País",
    description: "Alíquotas de 30+ países",
    icon: "Percent",
    creditCost: 0,
    allowedPlans: ["growth", "professional", "business"],
    monthlyLimit: { essential: 0, growth: null, professional: null, business: null },
    showInMenu: true,
  },

  // ── Professional+ (tudo, com limites padrão) ──
  "dashboard": {
    key: "dashboard",
    label: "Dashboard",
    description: "Visão geral da plataforma",
    icon: "BarChart3",
    creditCost: 0,
    allowedPlans: ["essential", "growth", "professional", "business"],
    monthlyLimit: { essential: null, growth: null, professional: null, business: null },
    showInMenu: true,
  },
  "country_comparison": {
    key: "country_comparison",
    label: "Comparador de Países",
    description: "Compare indicadores",
    icon: "ArrowLeftRight",
    creditCost: 0,
    allowedPlans: ["essential", "growth", "professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "us_trade": {
    key: "us_trade",
    label: "Brasil ↔ EUA",
    description: "Análise bilateral",
    icon: "ArrowLeftRight",
    creditCost: 0,
    allowedPlans: ["essential", "growth", "professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "smart_rank": {
    key: "smart_rank",
    label: "Smart Rank",
    description: "Melhores destinos para seu produto",
    icon: "Trophy",
    creditCost: 2,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "tariff_alerts": {
    key: "tariff_alerts",
    label: "Alertas de Tarifas",
    description: "Monitore variações de alíquotas",
    icon: "Bell",
    creditCost: 0,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "trade_intelligence": {
    key: "trade_intelligence",
    label: "Análise Avançada",
    description: "Dados de comércio exterior",
    icon: "BarChart3",
    creditCost: 1,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "importers_map": {
    key: "importers_map",
    label: "Mapa de Importadores",
    description: "Visualize no mapa",
    icon: "MapPin",
    creditCost: 1,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "seasonal_calendar": {
    key: "seasonal_calendar",
    label: "Calendário Sazonal",
    description: "Melhor época para exportar",
    icon: "Calendar",
    creditCost: 1,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "maritime_freight": {
    key: "maritime_freight",
    label: "Frete Marítimo",
    description: "Cotações marítimas",
    icon: "Ship",
    creditCost: 0,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "port_intelligence": {
    key: "port_intelligence",
    label: "Port Intelligence EUA",
    description: "Dados de portos americanos",
    icon: "Anchor",
    creditCost: 0,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  "importadores": {
    key: "importadores",
    label: "Diretório de Importadores",
    description: "Base de importadores globais",
    icon: "Building2",
    creditCost: 0,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
  },
  "potential_importers": {
    key: "potential_importers",
    label: "Importadores Potenciais",
    description: "Encontre leads com IA",
    icon: "Target",
    creditCost: 2,
    allowedPlans: ["professional", "business"],
    monthlyLimit: { essential: 0, growth: 0, professional: null, business: null },
    showInMenu: true,
    badge: "PRO",
  },
  // ── Business+ (API dedicada) ──
  "import_export_data": {
    key: "import_export_data",
    label: "Importação/Exportação",
    description: "Dados detalhados de importação e exportação por NCM",
    icon: "BarChart3",
    creditCost: 0,
    allowedPlans: ["business"],
    monthlyLimit: { essential: 0, growth: 0, professional: 0, business: null },
    showInMenu: true,
    badge: "BETA",
  },
  "api_access": {
    key: "api_access",
    label: "API de Integração",
    description: "Acesso à API REST dedicada",
    icon: "Code",
    creditCost: 0,
    allowedPlans: ["business"],
    monthlyLimit: { essential: 0, growth: 0, professional: 0, business: null },
    showInMenu: true,
    badge: "BUSINESS",
  },

  // ── Enterprise only ──
  "admin": {
    key: "admin",
    label: "Painel Admin",
    description: "Gerenciamento do sistema",
    icon: "Shield",
    creditCost: 0,
    allowedPlans: ["business"],
    monthlyLimit: { essential: 0, growth: 0, professional: 0, business: null },
    showInMenu: false,
  },
};

/** Verifica se um plano tem acesso a uma feature */
export function canAccessFeature(featureKey: string, plan: PlanType): boolean {
  const feat = FEATURE_MAP[featureKey];
  if (!feat) return true;
  return feat.allowedPlans.includes(plan);
}

/** Retorna o limite mensal de uma feature para um plano */
export function getFeatureLimit(featureKey: string, plan: PlanType): number | null {
  const feat = FEATURE_MAP[featureKey];
  if (!feat) return null;
  return feat.monthlyLimit[plan];
}

/** Retorna o custo em créditos de uma feature */
export function getFeatureCost(featureKey: string): number {
  return FEATURE_MAP[featureKey]?.creditCost ?? 0;
}

/** Lista todas as features visíveis no menu para um plano */
export function getMenuFeatures(plan: PlanType) {
  return Object.values(FEATURE_MAP).filter(
    (f) => f.showInMenu && f.allowedPlans.includes(plan)
  );
}

/** Features bloqueadas para um plano */
export function getLockedFeatures(plan: PlanType) {
  return Object.values(FEATURE_MAP).filter(
    (f) => f.showInMenu && !f.allowedPlans.includes(plan)
  );
}

/** Retorna o próximo plano que desbloqueia uma feature */
export function getUpgradePlanForFeature(featureKey: string, currentPlan: PlanType): PlanType | null {
  const feat = FEATURE_MAP[featureKey];
  if (!feat || feat.allowedPlans.includes(currentPlan)) return null;
  const tier: Record<PlanType, number> = { essential: 1, growth: 2, professional: 3, business: 4 };
  const unlocked = feat.allowedPlans.filter((p) => tier[p] > tier[currentPlan]);
  if (unlocked.length === 0) return null;
  return unlocked.sort((a, b) => tier[a] - tier[b])[0];
}
