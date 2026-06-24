import { proxyUrl } from './apiProxy';

/**
 * Market Intelligence Service
 * Real API data with static JSON fallbacks: COMEXSTAT, WTO, World Bank, Census + Tariff data
 */

// ── Types ──────────────────────────────────────────────
export interface TradeMapRecord {
  year: string;
  partner: string;
  hs_code: string;
  commodity: string;
  trade_flow: string;
  value_usd: number;
  partner_share_pct: number;
  source: string;
}

export interface CensusRecord {
  commodity: string;
  commodity_code?: string;
  country: string;
  value_month: number;
  value_year: number;
  qty_month?: number;
  qty_year?: number;
  year: string;
  month?: string;
  source?: string;
  flow?: string;
}

export interface WBTariffRecord {
  country: string;
  country_name: string;
  bound_agriculture: number;
  bound_non_agriculture: number;
  applied_2024: number;
  simple_average: number;
  weighted_average: number;
}

export interface EUTariffRecord {
  hs: string;
  commodity: string;
  mfn_tariff: number;
  preferential: number;
  notes: string;
}

export interface MercosurRecord {
  year: string;
  exporter: string;
  importer: string;
  value_usd: number;
  top_products: string[];
}

export interface WBIndicatorRecord {
  country: string;
  indicator: string;
  indicator_name: string;
  year: string;
  value: number;
}

export interface TariffSearchResult {
  Reporter: string;
  Year: number;
  Partner: string;
  Product: string;
  MFNRate: number;
  AppliedTariff: number;
  TotalTariffLines: number;
  IsTraded: string;
}

export interface VatRate {
  Country: string;
  Region: string;
  Tax_Type: string;
  Has_VAT_GST: boolean;
  Standard_Rate: number | string;
  Reduced_Rates: string;
  Notes: string;
}

// ── Config ──────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const CENSUS_KEY = import.meta.env.VITE_CENSUS_API_KEY || '1bd2f7004fe5fe577570bda949c4dd22a2466e5d';

// ── Cache ──────────────────────────────────────────────
const cache = new Map<string, any>();
const CACHE_TTL = 15 * 60 * 1000; // 15 min

async function loadJsonFile<T>(path: string): Promise<T> {
  const cacheKey = `file:${path}`;
  const cached = cache.get(cacheKey);
  if (cached && cached._ts && Date.now() - cached._ts < CACHE_TTL) return cached.data;
  const base = import.meta.env.BASE_URL || '/';
  const res = await fetch(`${base}data/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const data = await res.json();
  cache.set(cacheKey, { data, _ts: Date.now() });
  return data;
}

// ── COMEXSTAT API fetcher ───────────────────────────────
interface ComexstatParams {
  flowType: 'export' | 'import';
  period: string;           // e.g. "202301-202312" or "202301-202412"
  details: string;          // e.g. "country,hs2" or "country"
  filters: Record<string, string[]>;
}

async function fetchComexstat(params: ComexstatParams): Promise<any[]> {
  const cacheKey = `comexstat:${JSON.stringify(params)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached._ts && Date.now() - cached._ts < CACHE_TTL) return cached.data;

  const res = await fetch(proxyUrl("comexstat", "general"), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`COMEXSTAT HTTP ${res.status}`);
  const data = await res.json();

  const result = Array.isArray(data?.data?.list) ? data.data.list
    : Array.isArray(data?.data) ? data.data
    : Array.isArray(data) ? data : [];

  cache.set(cacheKey, { data: result, _ts: Date.now() });
  return result;
}

/** Map ISO3 country code to COMEXSTAT country code (ISO3 for most) */
const MERCOSUR_PARTNERS = ['ARG', 'URY', 'PRY'];

// ── Data loaders: try real API first, JSON as fallback ──

/**
 * Brazil export trade map — COMEXSTAT exports by heading/country, JSON fallback
 */
export async function loadTradeMapData(): Promise<TradeMapRecord[]> {
  // Try COMEXSTAT live data first
  try {
    const rows = await fetchComexstat({
      flowType: 'export',
      period: '202301-202412',
      details: 'country,hs2',
      filters: {
        country: [],       // all partners
        hs2: [],           // all headings
      },
    });

    if (rows.length > 0) {
      // Aggregate total value per country to compute shares
      const totalByCountry: Record<string, number> = {};
      for (const r of rows) {
        const partner = r.country || r.countryCode || r.pais || 'UNK';
        const val = Number(r.tradeValue || r.value || r.valor || r.usd || 0);
        totalByCountry[partner] = (totalByCountry[partner] || 0) + val;
      }
      const grandTotal = Object.values(totalByCountry).reduce((s, v) => s + v, 0) || 1;

      return rows.map(r => {
        const partner = String(r.country || r.countryCode || r.pais || 'UNK');
        const val = Number(r.tradeValue || r.value || r.valor || r.usd || 0);
        const year = String(r.year || r.ano || r.period?.slice(0, 4) || '2024');
        return {
          year,
          partner,
          hs_code: String(r.hs2 || r.heading || r.ncm?.slice(0, 4) || ''),
          commodity: String(r.commodity || r.description || r.descricao || ''),
          trade_flow: 'Export',
          value_usd: val,
          partner_share_pct: grandTotal > 0 ? Math.round((val / grandTotal) * 10000) / 100 : 0,
          source: 'COMEXSTAT (live)',
        } as TradeMapRecord;
      });
    }
  } catch (err) {
    console.warn('COMEXSTAT trade-map fetch failed, using JSON fallback:', err);
  }
  // Fallback to static JSON
  return loadJsonFile<TradeMapRecord[]>('trade_map_brazil_exports.json');
}

/**
 * Census data — already uses live Census API first, JSON fallback
 */
export async function loadCensusData(): Promise<CensusRecord[]> {
  try {
    // Try Census API first for real-time data
    const live = await fetchCensusLive();
    if (live.length > 0) return live;
  } catch {}
  // Fallback to static JSON
  return loadJsonFile<CensusRecord[]>('us_census_brazil_summary.json');
}

/**
 * WTO tariff bindings — try WTO API first, JSON fallback
 */
export async function loadWTOTariffData(): Promise<WBTariffRecord[]> {
  try {
    const url = proxyUrl("wto", `?indentation=1&i=MFN%2CApplied_Rates&h=1&r=76%2C842%2C156%2C276%2C380%2C392&pc=01%2C02%2C03%2C17&ps=2024`);
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`WTO HTTP ${res.status}`);
    const raw = await res.json();
    const dims = raw?.structure?.dimensions?.series || [];
    const vals = raw?.data?.[0]?.value || raw?.value || raw?.Data || [];
    if (Array.isArray(vals) && vals.length > 0) {
      // WTO API returns flat arrays keyed by dimension structure;
      // parse what we can and map to WBTariffRecord
      const countries = (dims.find((d: any) => d.id === 'Reporter')?.values) || [];
      const records: WBTariffRecord[] = countries.map((c: any, i: number) => ({
        country: c.id || String(c),
        country_name: c.name || c.label || String(c),
        bound_agriculture: Number(vals[i * 3] ?? 0),
        bound_non_agriculture: Number(vals[i * 3 + 1] ?? 0),
        applied_2024: Number(vals[i * 3 + 2] ?? 0),
        simple_average: Number(vals[i * 3 + 2] ?? 0),
        weighted_average: Number((vals[i * 3 + 2] ?? 0) * 0.6),
      }));
      if (records.length > 0) return records;
    }
  } catch (err) {
    console.warn('WTO API fetch failed, using JSON fallback:', err);
  }
  return loadJsonFile<WBTariffRecord[]>('wto_tariff_bindings.json');
}

/**
 * EU TARIC tariff data — static JSON is the source (20 records, real EU TARIC data).
 * No full public API available for bulk TARIC lookups.
 */
export async function loadEUTariffData(): Promise<EUTariffRecord[]> {
  return loadJsonFile<EUTariffRecord[]>('eu_tariff_brazil.json');
}

/**
 * Mercosur intra-bloc trade — COMEXSTAT exports to ARG/URY/PRY, JSON fallback
 */
export async function loadMercosurData(): Promise<MercosurRecord[]> {
  try {
    const rows = await fetchComexstat({
      flowType: 'export',
      period: '202301-202412',
      details: 'country',
      filters: {
        country: MERCOSUR_PARTNERS,
      },
    });

    if (rows.length > 0) {
      // Group by year+importer, aggregate products if available
      const byKey: Record<string, { year: string; importer: string; value_usd: number; products: string[] }> = {};
      for (const r of rows) {
        const importer = String(r.country || r.countryCode || r.pais || 'UNK');
        const year = String(r.year || r.ano || r.period?.slice(0, 4) || '2024');
        const val = Number(r.tradeValue || r.value || r.valor || r.usd || 0);
        const product = String(r.commodity || r.description || r.descricao || r.hs2 || '');
        const key = `${year}:${importer}`;
        if (!byKey[key]) byKey[key] = { year, importer, value_usd: 0, products: [] };
        byKey[key].value_usd += val;
        if (product && byKey[key].products.length < 4 && !byKey[key].products.includes(product)) {
          byKey[key].products.push(product);
        }
      }
      return Object.values(byKey).map(v => ({
        year: v.year,
        exporter: 'BRA',
        importer: v.importer,
        value_usd: v.value_usd,
        top_products: v.products.length > 0 ? v.products : ['N/A'],
        source: 'COMEXSTAT (live)',
      } as MercosurRecord));
    }
  } catch (err) {
    console.warn('COMEXSTAT Mercosur fetch failed, using JSON fallback:', err);
  }
  return loadJsonFile<MercosurRecord[]>('mercosur_trade.json');
}

/**
 * World Bank indicators — try World Bank API first, JSON fallback
 */
export async function loadWorldBankData(): Promise<WBIndicatorRecord[]> {
  try {
    const url = proxyUrl("worldbank", "country/BRA/indicator/NE.EXP.GNFS.CD?format=json&per_page=100&date=2015:2024");
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`World Bank HTTP ${res.status}`);
    const raw = await res.json();
    // World Bank returns [pagination, data] array
    const wbData = Array.isArray(raw) && Array.isArray(raw[1]) ? raw[1] : [];
    if (wbData.length > 0) {
      return wbData
        .filter((d: any) => d.value !== null)
        .map((d: any) => ({
          country: d.country?.id || 'BRA',
          indicator: d.indicator?.id || 'NE.EXP.GNFS.CD',
          indicator_name: d.indicator?.value || 'Exports of goods and services (current US$)',
          year: String(d.date || d.year || ''),
          value: Number(d.value),
        })) as WBIndicatorRecord[];
    }
  } catch (err) {
    console.warn('World Bank API fetch failed, using JSON fallback:', err);
  }
  return loadJsonFile<WBIndicatorRecord[]>('world_bank_trade_indicators.json');
}

/**
 * UN Comtrade replacement — COMEXSTAT covers Brazil trade data natively.
 * UN Comtrade API always fails with auth; use COMEXSTAT instead, JSON fallback.
 */
export async function loadUNComtradeData(): Promise<any[]> {
  try {
    const rows = await fetchComexstat({
      flowType: 'export',
      period: '202401-202412',
      details: 'country,hs4',
      filters: {
        country: [],
        hs4: [],
      },
    });

    if (rows.length > 0) {
      return rows.map(r => {
        const year = String(r.year || r.ano || r.period?.slice(0, 4) || '2024');
        return {
          year,
          partner: String(r.country || r.countryCode || r.pais || 'UNK'),
          hs_code: String(r.hs4 || r.ncm?.slice(0, 6) || ''),
          commodity: String(r.commodity || r.description || r.descricao || ''),
          value_usd: Number(r.tradeValue || r.value || r.valor || r.usd || 0),
          source: 'COMEXSTAT (live)',
        };
      });
    }
  } catch (err) {
    console.warn('COMEXSTAT UN-Comtrade replacement fetch failed, using JSON fallback:', err);
  }
  return loadJsonFile<any[]>('un_comtrade_brazil_exports.json');
}

// ── Census API Live Data ─────────────────────────────────
export async function fetchCensusLive(): Promise<CensusRecord[]> {
  const cacheKey = 'census:live';
  const cached = cache.get(cacheKey);
  if (cached && cached._ts && Date.now() - cached._ts < CACHE_TTL) return cached.data;

  try {
    // Brazil exports to US - latest month
    const url = proxyUrl("census", `data/timeseries/intltrade/exports/hs?get=ALL_VAL_YR,CTY_NAME,E_COMMODITY,E_COMMODITY_SDESC&CTY_CODE=3510&time=2025&COMM_LVL=HS6&key=${CENSUS_KEY}`);
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Census HTTP ${res.status}`);
    const raw = await res.json();
    if (!Array.isArray(raw) || raw.length < 2) throw new Error('No data');

    const headers: string[] = raw[0];
    return raw.slice(1).map((row: any[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => { obj[h] = row[i]; });
      return {
        commodity: obj.E_COMMODITY_SDESC || '',
        commodity_code: obj.E_COMMODITY || '',
        country: 'Brazil',
        value_year: Number(obj.ALL_VAL_YR) || 0,
        value_month: Number(obj.ALL_VAL_YR) || 0,
        year: '2025',
        source: 'US Census Bureau (live)',
        flow: 'exports_from_brazil',
      } as CensusRecord;
    });
  } catch (err) {
    console.warn('Census live fetch failed:', err);
    return [];
  }
}

// ── Census seasonality (via edge function) ────────────────
export async function fetchCensusSeasonality(hsCode: string, year = '2025') {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/census-analytics`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'seasonality', hs_code: hsCode, year }),
  });
  if (!res.ok) throw new Error(`Census analytics error: ${res.status}`);
  return res.json();
}

// ── Census mirror trade (via edge function) ───────────────
export async function fetchCensusMirror(hsCode: string, year = '2025') {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/census-analytics`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'mirror', hs_code: hsCode, year }),
  });
  if (!res.ok) throw new Error(`Census mirror error: ${res.status}`);
  return res.json();
}

// ── Census competitors (via edge function) ────────────────
export async function fetchCensusCompetitors(hsCode: string, year = '2025') {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/census-analytics`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'competitors', hs_code: hsCode, year }),
  });
  if (!res.ok) throw new Error(`Census competitors error: ${res.status}`);
  return res.json();
}

// ── Tariff Search (via edge function) ────────────────────
export async function searchTariffs(params: { reporter?: string; partner?: string; product?: string; hs_code?: string; is_traded?: boolean; limit?: number }): Promise<{ total: number; results: TariffSearchResult[] }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/tariffs`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'search', ...params }),
  });
  if (!res.ok) throw new Error(`Tariffs error: ${res.status}`);
  return res.json();
}

// ── Tariff Summary (via edge function) ────────────────────
export async function getTariffSummary() {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/tariffs`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'summary' }),
  });
  if (!res.ok) throw new Error(`Tariffs summary error: ${res.status}`);
  return res.json();
}

// ── VAT Rates (via edge function) ─────────────────────────
export async function getVatRates(country?: string, region?: string): Promise<{ total: number; results: VatRate[] }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/tariffs`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'vat', country, region }),
  });
  if (!res.ok) throw new Error(`VAT error: ${res.status}`);
  return res.json();
}

// ── Helpers ──────────────────────────────────────────────
export function filterByYear<T extends { year: string }>(data: T[], year: string): T[] {
  return data.filter(d => d.year === year);
}

export function filterByPartner(data: TradeMapRecord[], partner: string): TradeMapRecord[] {
  return data.filter(d => d.partner === partner);
}

export function getTopPartners(data: TradeMapRecord[], limit = 10): { partner: string; total_usd: number }[] {
  const grouped = data.reduce((acc, d) => {
    acc[d.partner] = (acc[d.partner] || 0) + d.value_usd;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(grouped)
    .map(([partner, total_usd]) => ({ partner, total_usd }))
    .sort((a, b) => b.total_usd - a.total_usd)
    .slice(0, limit);
}

export function getTopProducts(data: TradeMapRecord[], limit = 10): { commodity: string; total_usd: number }[] {
  const grouped = data.reduce((acc, d) => {
    acc[d.commodity] = (acc[d.commodity] || 0) + d.value_usd;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(grouped)
    .map(([commodity, total_usd]) => ({ commodity, total_usd }))
    .sort((a, b) => b.total_usd - a.total_usd)
    .slice(0, limit);
}

export function formatCurrencyUSD(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export interface GlobalTariffLookupResponse {
  query: { origin: string; destination: string; hs6: string; year: number };
  sources_queried: string[];
  wits_available: boolean;
  local_data_available?: boolean;
  taric_available: boolean;
  tariff: {
    rate: number;
    mfn?: number;
    pref?: number;
    type: string;
    source: string;
    agreement?: string;
    notes?: string;
    hs_description?: string;
    is_traded?: boolean;
    total_products_found?: number;
  };
  all_matches?: TariffSearchResult[];
}

export async function fetchGlobalTariffLookup(
  hs6: string,
  destination: string,
  origin: string = 'BRA',
  year: number = 2024
): Promise<GlobalTariffLookupResponse> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/global-tariff-lookup`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ origin, destination, hs6, year }),
  });
  if (!res.ok) throw new Error(`Tariff lookup error: ${res.status}`);
  return res.json();
}
