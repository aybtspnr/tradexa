import { proxyUrl } from './apiProxy';

/**
 * CTS (Consolidated Tariff Schedule) data service
 * WTO Final Bound Duty rates for 31 countries
 * Data source: WTO CTS files processed into optimized JSON
 */

interface CTSData {
  source: string;
  description: string;
  data: Record<string, (string | number)[]>; // country -> [hs6, rate, hs6, rate, ...]
}

let cachedData: CTSData | null = null;
let fetchPromise: Promise<CTSData> | null = null;

async function loadCTSData(): Promise<CTSData> {
  if (cachedData) return cachedData;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(proxyUrl("supabaseStorage", "trade-data/cts_tariffs.json"))
    .then(r => r.json())
    .then(data => {
      cachedData = data;
      fetchPromise = null;
      return data;
    })
    .catch(err => {
      fetchPromise = null;
      throw err;
    });

  return fetchPromise;
}

/**
 * Lookup tariff rate for a country and HS prefix
 * @param countryName - Country name as it appears in the CTS data (e.g. "South Korea", "European Union")
 * @param hsPrefix - HS code prefix (e.g. "0901", "8471")
 * @returns Average tariff rate for matching HS codes, or 0 if no data found
 */
export async function lookupCTSTariff(
  countryName: string,
  hsPrefix: string
): Promise<{ rate: number; hasData: boolean }> {
  try {
    const data = await loadCTSData();
    const arr = data.data[countryName];
    if (!arr || arr.length === 0) return { rate: 0, hasData: false };

    const matches: number[] = [];
    for (let i = 0; i < arr.length; i += 2) {
      const hs = String(arr[i]);
      if (hs.startsWith(hsPrefix)) {
        matches.push(arr[i + 1]);
      }
    }

    if (matches.length === 0) return { rate: 0, hasData: false };

    const avg = matches.reduce((a, b) => a + b, 0) / matches.length;
    return { rate: Math.round(avg * 10) / 10, hasData: true };
  } catch {
    return { rate: 0, hasData: false };
  }
}

/**
 * Get list of all countries available in CTS data
 */
export async function getCTSCountries(): Promise<string[]> {
  try {
    const data = await loadCTSData();
    return Object.keys(data.data).sort();
  } catch {
    return [];
  }
}

export { loadCTSData };

/**
 * Lookup detailed tariff entries for a country and HS prefix
 * Returns all matching {hs_code, rate} pairs
 */
export async function lookupCTSTariffDetails(
  countryName: string,
  hsPrefix: string
): Promise<{ hs_code: string; rate: number }[]> {
  try {
    const data = await loadCTSData();
    const arr = data.data[countryName];
    if (!arr || arr.length === 0) return [];

    const results: { hs_code: string; rate: number }[] = [];
    for (let i = 0; i < arr.length; i += 2) {
      const hs = String(arr[i]);
      if (hs.startsWith(hsPrefix)) {
        results.push({ hs_code: hs, rate: Number(arr[i + 1]) });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Get HS code counts per country
 */
export async function getCTSCountryCounts(): Promise<Record<string, number>> {
  try {
    const data = await loadCTSData();
    const counts: Record<string, number> = {};
    for (const [country, arr] of Object.entries(data.data)) {
      counts[country] = arr.length / 2;
    }
    return counts;
  } catch {
    return {};
  }
}

/**
 * Get average tariff rate for a country (across all HS codes)
 */
export async function getCTSCountryAvg(
  countryName: string
): Promise<{ avgRate: number; count: number; hasData: boolean }> {
  try {
    const data = await loadCTSData();
    const arr = data.data[countryName];
    if (!arr || arr.length === 0) return { avgRate: 0, count: 0, hasData: false };

    let sum = 0;
    const count = arr.length / 2;
    for (let i = 1; i < arr.length; i += 2) {
      sum += Number(arr[i]);
    }
    return { avgRate: Math.round((sum / count) * 10) / 10, count, hasData: true };
  } catch {
    return { avgRate: 0, count: 0, hasData: false };
  }
}
