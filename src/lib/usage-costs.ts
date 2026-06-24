/**
 * Sistema de Percentagem de Uso — TRADEXA
 * Tank fixo em 100% para todos os planos limitados.
 * O diferencial é o multiplicador de custo: planos mais caros "gastam menos" da barra.
 *
 * Planos:
 *   Essential    → Grátis. Tank 100%, custo 1.0×. Apenas 2 consultas IA NCM.
 *   Growth       → R$ 497. Tank 100%, custo 1.0×. Acesso a ferramentas básicas.
 *   Professional → R$ 1.297. Tank 100%, custo 0.4× (~2.5× mais ações).
 *   Business     → A partir de R$ 4.799. Tank 100%, custo 0.2× (~5× mais ações).
 */

export type PlanType = "essential" | "growth" | "professional" | "business";

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
  | "data_export";

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
  professional: 100,
  business: 100,
};

/** Multiplicador de custo por plano. Menor = mais econômico. */
export const PLAN_COST_MULTIPLIER: Record<PlanType, number> = {
  essential: 1.0,
  growth: 1.0,
  professional: 0.4,
  business: 0,
};

/** Labels dos planos */
export const PLAN_LABELS: Record<PlanType, string> = {
  essential: "Essential",
  growth: "Growth",
  professional: "Professional",
  business: "Business",
};

/** Preços dos planos (mensal, em reais) */
export const PLAN_PRICES: Record<PlanType, number> = {
  essential: 0,
  growth: 497,
  professional: 1297,
  business: 0,
};

/**
 * Custo de cada ação em percentagem (base Essential/Growth = 1.0×).
 * Professional aplica 0.4×, Business aplica 0.2×.
 */
export const ACTION_COSTS: Record<ActionType, ActionCost> = {
  page_view: {
    action: "page_view",
    label: "Acesso à página",
    basePercent: 0.8,
    description: "Cada página acessada consome 0.8%",
  },
  search: {
    action: "search",
    label: "Busca simples",
    basePercent: 2.0,
    description: "Consulta HS, HTS, alíquota, importador",
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
    basePercent: 4.0,
    description: "Simulador de custo de exportação",
  },
  country_click: {
    action: "country_click",
    label: "Clique em país",
    basePercent: 0.5,
    description: "Selecionar país no mapa/comparador",
  },
  importer_view: {
    action: "importer_view",
    label: "Ver importador",
    basePercent: 1.5,
    description: "Abrir detalhes de importador",
  },
  ranking_run: {
    action: "ranking_run",
    label: "Ranking/Smart Rank",
    basePercent: 6.0,
    description: "Comparar países ou ranquear mercados",
  },
  alert_create: {
    action: "alert_create",
    label: "Criar alerta",
    basePercent: 3.0,
    description: "Novo alerta de tarifa/preço",
  },
  data_export: {
    action: "data_export",
    label: "Exportar dados",
    basePercent: 4.0,
    description: "CSV, Excel, ou outra exportação",
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
