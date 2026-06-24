/**
 * Sistema de Percentagem de Uso — TRADEXA
 * Tank fixo em 100% para todos os planos limitados.
 * O diferencial é o multiplicador de custo: planos mais caros "gastam menos" da barra.
 *
 * Planos:
 *   Essencial    → Grátis. Tank 100%, custo 1.0×. 2 consultas IA NCM, 3 vis. Import/Export Data.
 *   Growth       → R$ 289. Tank 100%, custo 0.4× (~2.5× mais ações).
 *   Business     → R$ 3.200. Tudo ilimitado (bypass do tank).
 *
 * Ferramentas gratuitas (0% do tanque): HTS, Comparador, Simulador, Alíquotas,
 * Smart Rank, Alertas, Trade Intelligence, Mapa Importadores, Frete, Port Intel, etc.
 * Apenas consultas IA NCM e visualizações Import/Export Data consomem tanque.
 */

export type PlanType = "essential" | "growth" | "business";

export type ActionType =
  | "page_view"
  | "search"
  | "ai_query"
  | "ai_word"
  | "simulator_run"
  | "country_click"
  | "importer_view"
  | "ranking_run"
  | "alert_create"
  | "data_export"
  | "intel_view";

export interface ActionCost {
  action: ActionType;
  label: string;
  basePercent: number;
  description: string;
}

/** Tank (limite máximo) por plano. Sempre 100. */
export const PLAN_TANK: Record<PlanType, number> = {
  essential: 100,
  growth: 100,
  business: 100,
};

/** Multiplicador de custo por plano. Menor = mais econômico. */
export const PLAN_COST_MULTIPLIER: Record<PlanType, number> = {
  essential: 1.0,
  growth: 0.4,
  business: 0,
};

/** Labels dos planos */
export const PLAN_LABELS: Record<PlanType, string> = {
  essential: "Essencial",
  growth: "Growth",
  business: "Business",
};

/** Preços dos planos (mensal, em reais) */
export const PLAN_PRICES: Record<PlanType, number> = {
  essential: 0,
  growth: 289,
  business: 3200,
};

/**
 * Custo de cada ação em percentagem (base Essential/Growth = 1.0×).
 * Growth aplica 0.4×, Business aplica 0 (bypass).
 * Ferramentas gratuitas (HTS, Comparador, Simulador, Alíquotas, etc.) = 0%.
 */
export const ACTION_COSTS: Record<ActionType, ActionCost> = {
  page_view: {
    action: "page_view",
    label: "Acesso à página",
    basePercent: 0,
    description: "Navegação na plataforma (grátis)",
  },
  search: {
    action: "search",
    label: "Busca simples",
    basePercent: 0,
    description: "Consulta HS, HTS, alíquota, importador (grátis)",
  },
  ai_query: {
    action: "ai_query",
    label: "Consulta com IA",
    basePercent: 8.0,
    description: "Classificador IA NCM, análise com IA",
  },
  ai_word: {
    action: "ai_word",
    label: "Palavra em consulta IA",
    basePercent: 0.5,
    description: "Cada palavra digitada em consulta IA (+ base)",
  },
  simulator_run: {
    action: "simulator_run",
    label: "Simulação",
    basePercent: 0,
    description: "Simulador de custo de exportação (grátis)",
  },
  country_click: {
    action: "country_click",
    label: "Clique em país",
    basePercent: 0,
    description: "Selecionar país no mapa/comparador (grátis)",
  },
  importer_view: {
    action: "importer_view",
    label: "Ver importador",
    basePercent: 0,
    description: "Abrir detalhes de importador (grátis)",
  },
  ranking_run: {
    action: "ranking_run",
    label: "Ranking/Smart Rank",
    basePercent: 0,
    description: "Comparar países ou ranquear mercados (grátis)",
  },
  alert_create: {
    action: "alert_create",
    label: "Criar alerta",
    basePercent: 0,
    description: "Novo alerta de tarifa/preço (grátis)",
  },
  data_export: {
    action: "data_export",
    label: "Exportar dados",
    basePercent: 0,
    description: "CSV, PDF — Business apenas",
  },
  intel_view: {
    action: "intel_view",
    label: "Visualizar Intel Data",
    basePercent: 5.0,
    description: "Cada consulta em Import/Export Intelligence",
  },
};

/** Cálculo do custo total considerando palavras extras na IA */
export function calculateCost(
  action: ActionType,
  opts?: { wordCount?: number }
): number {
  const cost = ACTION_COSTS[action];
  if (!cost) return 0;

  let total = cost.basePercent;

  if (action === "ai_query" && opts?.wordCount && opts.wordCount > 3) {
    const extraWords = opts.wordCount - 3;
    total += extraWords * ACTION_COSTS.ai_word.basePercent;
  }

  return Math.round(total * 10) / 10;
}

/** Custo final já aplicando o multiplicador do plano */
export function calculateFinalCost(
  action: ActionType,
  plan: PlanType,
  opts?: { wordCount?: number }
): number {
  const base = calculateCost(action, opts);
  const multiplier = PLAN_COST_MULTIPLIER[plan] ?? 1.0;
  return Math.round(base * multiplier * 10) / 10;
}

export function costLabel(action: ActionType, opts?: { wordCount?: number }): string {
  const pct = calculateCost(action, opts);
  return pct <= 1 ? `${pct}%` : `${pct}% do plano`;
}

/** Mapa de planos legados para o novo sistema (backward compat) */
const LEGACY_PLAN_MAP: Record<string, PlanType> = {
  professional: "growth",
  enterprise: "business",
  starter: "essential",
};

/** Sanitiza plan_type do banco para o novo sistema de planos */
export function sanitizePlan(plan: string | undefined | null): PlanType {
  if (!plan) return "essential";
  const known: PlanType[] = ["essential", "growth", "business"];
  if (known.includes(plan as PlanType)) return plan as PlanType;
  return LEGACY_PLAN_MAP[plan] || "essential";
}
