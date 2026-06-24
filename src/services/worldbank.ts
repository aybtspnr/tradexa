import { getCached } from './cache';
import { proxyUrl } from './apiProxy';

export const worldbank = {
  getGDP: (iso2: string) =>
    getCached(proxyUrl("worldbank", `country/${iso2}/indicator/NY.GDP.MKTP.CD?format=json&mrv=1`), 86400000),

  getImports: (iso2: string) =>
    getCached(proxyUrl("worldbank", `country/${iso2}/indicator/TM.VAL.MRCH.WL.CD?format=json&mrv=1`), 86400000),

  getGDPPerCapita: (iso2: string) =>
    getCached(proxyUrl("worldbank", `country/${iso2}/indicator/NY.GDP.PCAP.CD?format=json&mrv=1`), 86400000),
};

export function extractIndicatorValue(data: any): number | null {
  try {
    return data?.[1]?.[0]?.value || null;
  } catch {
    return null;
  }
}