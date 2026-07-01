/**
 * WITS Tariffs — Serviço de consulta de tarifas WITS (World Integrated Trade Solution).
 *
 * Endpoints da API interna:
 *   GET /api/v1/intel/wits/countries
 *   GET /api/v1/intel/wits/search?hs=X&limit=N
 *   GET /api/v1/intel/wits/compare?hs=X&top=N
 *   GET /api/v1/intel/wits/country/{iso3}
 *
 * Uso:
 *   import { getCountries, searchWits, compareWits, getWitsCountry } from "@/services/witsTariffs";
 *
 *   const countries = await getCountries();
 *   const results   = await searchWits("8471", 20);
 *   const compare   = await compareWits("8471", 10);
 *   const country   = await getWitsCountry("BRA");
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/**
 * Base URL da API interna.
 * Em runtime usa NEXT_PUBLIC_API_URL (se definido) ou fallback para proxy relativo.
 */
const API_BASE =
  (typeof process !== "undefined" &&
    (process.env as Record<string, string | undefined>).NEXT_PUBLIC_API_URL) ||
  "/api/intel";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** País retornado por GET /countries */
export interface WitsCountry {
  /** Código ISO 3166-1 alpha-3 (ex: "BRA", "USA") */
  iso3: string;
  /** Nome do país em português */
  nome: string;
  /** Nome do país em inglês (opcional) */
  nome_en?: string;
  /** Continente / região (opcional) */
  regiao?: string;
}

/** Item de tarifa retornado por /search e /compare */
export interface WitsTariffItem {
  /** Código HS (nível 6 dígitos) */
  hs_code: string;
  /** Descrição do produto */
  descricao: string;
  /** País de destino/origem (ISO3) */
  pais_iso3: string;
  /** Nome do país */
  pais_nome: string;
  /** Tarifa NMF aplicada (MFN applied rate) */
  tariff_mfn: number | null;
  /** Tarifa preferencial (se houver) */
  tariff_preferential: number | null;
  /** Tarifa efetivamente aplicada */
  tariff_applied: number | null;
  /** Unidade da tarifa (ex: "%", "US$/kg") */
  tariff_unit?: string;
  /** Ano de referência da tarifa */
  ano_ref: number;
  /** Flag indicando se há restrições quantitativas */
  has_quota?: boolean;
  /** Volume comercializado (FOB USD) para o par produto-país (opcional) */
  trade_volume?: number;
}

/** Resumo de comparação entre países para um mesmo HS */
export interface WitsCompareItem {
  pais_iso3: string;
  pais_nome: string;
  /** Tarifa NMF */
  tariff_mfn: number | null;
  /** Tarifa preferencial */
  tariff_preferential: number | null;
  /** Tarifa aplicada */
  tariff_applied: number | null;
  /** Variação percentual em relação à média */
  diff_from_avg_pct?: number;
  /** Volume de comércio bilateral para o HS */
  trade_volume?: number;
  /** Ano de referência */
  ano_ref: number;
}

/** Dados detalhados de um país específico */
export interface WitsCountryDetail {
  pais: WitsCountry;
  /** Número total de tarifas registradas para este país */
  total_tariffs: number;
  /** Tarifa NMF média */
  avg_tariff_mfn: number | null;
  /** Tarifa preferencial média */
  avg_tariff_preferential: number | null;
  /** Data da última atualização dos dados */
  ultima_atualizacao: string | null;
  /** Top N produtos por volume (opcional) */
  top_products?: WitsTariffItem[];
  /** Estatísticas agregadas por ano (opcional) */
  stats_by_year?: Record<number, {
    count: number;
    avg_mfn: number | null;
    avg_pref: number | null;
  }>;
}

/** Envelope de resposta padrão da API */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class WitsTariffsError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string,
  ) {
    super(message);
    this.name = "WitsTariffsError";
  }
}

async function request<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}/intel/wits${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new WitsTariffsError(
      `WITS API error: ${res.statusText}`,
      res.status,
      path,
    );
  }

  const body: ApiResponse<T> = await res.json();

  if (!body.success) {
    throw new WitsTariffsError(
      body.message ?? "WITS API returned unsuccessful response",
      res.status,
      path,
    );
  }

  return body.data;
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * Lista todos os países disponíveis no dataset WITS.
 */
export async function getCountries(): Promise<WitsCountry[]> {
  return request<WitsCountry[]>("/countries");
}

/**
 * Busca tarifas WITS por código HS.
 *
 * @param hs    Código HS (4 ou 6 dígitos).
 * @param limit Máximo de resultados (padrão: 20).
 */
export async function searchWits(hs: string, limit: number = 20): Promise<WitsTariffItem[]> {
  return request<WitsTariffItem[]>("/search", { hs, limit });
}

/**
 * Compara tarifas de um determinado HS entre os principais países.
 *
 * @param hs  Código HS (4 ou 6 dígitos).
 * @param top Número de países no ranking (padrão: 10).
 */
export async function compareWits(hs: string, top: number = 10): Promise<WitsCompareItem[]> {
  return request<WitsCompareItem[]>("/compare", { hs, top });
}

/**
 * Obtém detalhes de tarifas WITS para um país específico.
 *
 * @param iso3 Código ISO 3166-1 alpha-3 do país (ex: "BRA", "USA", "CHN").
 */
export async function getWitsCountry(iso3: string): Promise<WitsCountryDetail> {
  return request<WitsCountryDetail>(`/country/${encodeURIComponent(iso3)}`);
}
