/**
 * Landing Cost Calculator Service
 * Calculates total cost to export/import a product including:
 * - FOB value
 * - Freight (from COMEXSTAT real data)
 * - Insurance
 * - Tariff (from WITS 160 countries)
 * - VAT (destination country)
 * - Exchange rate (BCB PTAX)
 */

const API_BASE = '/api/intel/simulate';

export interface LandingCostInputs {
  ncm: string;
  hs6: string;
  pais_destino: string;
  pais_comex_code: string;
  pais_iso_numeric: string;
  pais_alpha2: string;
  pais_alpha3: string;
  vl_fob_usd: number;
  peso_kg: number;
  direction: 'export' | 'import';
}

export interface ExchangeRate {
  usd_brl: number;
  source: string;
}

export interface FreightData {
  avg_frete_usd_per_kg: number;
  avg_seguro_pct: number;
  frete_pct_of_fob: number;
  total_ops_reference: number;
  total_kg_reference: number;
  year_reference: string;
  table_used: string;
  confidence: 'high' | 'medium' | 'low';
  data_source_note: string;
}

export interface TariffData {
  rate_pct: number;
  source: string;
  year: string | null;
}

export interface VatData {
  rate_pct: number;
  reduced_rate: number | null;
}

export interface CostBreakdown {
  fob: number;
  freight: number;
  insurance: number;
  cif: number;
  tariff: number;
  base_vat: number;
  vat: number;
  total_landing_cost: number;
}

export interface CostBreakdownPct {
  freight_pct_of_fob: number;
  insurance_pct_of_fob: number;
  tariff_pct_of_cif: number;
  vat_pct_of_base: number;
}

export interface LandingCostResult {
  inputs: LandingCostInputs;
  exchange_rate: ExchangeRate;
  freight: FreightData;
  tariff_destination: TariffData;
  vat_destination: VatData;
  breakdown: CostBreakdown;
  breakdown_pct: CostBreakdownPct;
  notes: string[];
}

export interface LandingCostResponse {
  success: boolean;
  data: LandingCostResult;
}

/**
 * Calculate landing cost for a given NCM + country + FOB value
 */
export async function calculateLandingCost(params: {
  ncm: string;
  pais_destino: string;
  vl_fob: number;
  peso_kg?: number;
  direction?: 'export' | 'import';
  year?: string;
}): Promise<LandingCostResult> {
  const url = new URL(`${API_BASE}/landing-cost`, window.location.origin);
  url.searchParams.set('ncm', params.ncm);
  url.searchParams.set('pais_destino', params.pais_destino);
  url.searchParams.set('vl_fob', String(params.vl_fob));
  if (params.peso_kg) url.searchParams.set('peso_kg', String(params.peso_kg));
  if (params.direction) url.searchParams.set('direction', params.direction);
  if (params.year) url.searchParams.set('year', params.year);

  const res = await fetch(url.toString(), { credentials: 'include' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const body: LandingCostResponse = await res.json();
  if (!body.success) {
    throw new Error('API returned error');
  }
  return body.data;
}

/**
 * Format USD value
 */
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage
 */
export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get confidence badge variant
 */
export function getConfidenceVariant(confidence: 'high' | 'medium' | 'low'): 'default' | 'secondary' | 'outline' {
  switch (confidence) {
    case 'high': return 'default';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
  }
}
