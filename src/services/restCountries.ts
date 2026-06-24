import { proxyUrl } from './apiProxy';

export interface RestCountryData {
  cca2: string;
  name: { common: string; official: string };
  capital?: string[];
  population: number;
  currency?: Record<string, { name: string; symbol: string }>;
  languages?: Record<string, string>;
  region: string;
  subregion?: string;
  flag: string; // emoji flag
  flags: { svg: string; png: string };
  latlng?: [number, number];
  area?: number;
  borders?: string[];
}

export async function getCountryByCode(
  code: string
): Promise<RestCountryData | null> {
  try {
    const res = await fetch(proxyUrl("restcountries", `alpha/${code}?fields=name,capital,population,currencies,languages,region,subregion,flags,latlng,area,borders,cca2`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("REST Countries error:", e);
    return null;
  }
}

export async function getCountryByName(
  name: string
): Promise<RestCountryData | null> {
  try {
    const res = await fetch(
      proxyUrl("restcountries", `name/${encodeURIComponent(name)}?fields=name,capital,population,currencies,languages,region,subregion,flags,latlng,area,borders,cca2`)
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data[0] || null;
  } catch (e) {
    console.error("REST Countries error:", e);
    return null;
  }
}
