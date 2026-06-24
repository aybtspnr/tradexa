import { getCached } from './cache';
import { proxyUrl } from './apiProxy';

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export async function getLatestRates(base = 'USD'): Promise<ExchangeRates> {
  const url = proxyUrl("erapi", `v6/latest/${base}`);
  const data = await getCached(url, 3600000); // 1h cache
  return {
    base: data?.base_code || base,
    date: data?.time_last_update_utc || new Date().toISOString(),
    rates: data?.rates || {},
  };
}

export async function convertCurrency(amount: number, from: string, to: string): Promise<number> {
  const rates = await getLatestRates(from);
  const rate = rates.rates[to];
  if (!rate) throw new Error(`Taxa não encontrada para ${to}`);
  return amount * rate;
}

export async function getBRLRate(): Promise<number> {
  const rates = await getLatestRates('USD');
  const rate = rates.rates['BRL'];
  if (!rate) throw new Error('Taxa BRL não encontrada — API não retornou dados de câmbio');
  return rate;
}

export async function getEURRate(): Promise<number> {
  const rates = await getLatestRates('USD');
  const rate = rates.rates['EUR'];
  if (!rate) throw new Error('Taxa EUR não encontrada — API não retornou dados de câmbio');
  return rate;
}
