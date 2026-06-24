const memCache = new Map<string, { data: any; ts: number }>();

import { proxyUrl } from './apiProxy';

async function cachedFetch(url: string, ttl = 3600000): Promise<any> {
  const cached = memCache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  memCache.set(url, { data, ts: Date.now() });
  return data;
}

export interface BcbResult {
  rate: number | null;
  error: string | null;
}

export const bcb = {
  getCotacaoDolar: async (): Promise<BcbResult> => {
    const hoje = new Date();
    const ontem = new Date(hoje.getTime() - 86400000);
    const fmt = (d: Date) =>
      `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}-${d.getFullYear()}`;

    // Try AwesomeAPI first (CORS-friendly, free, no auth)
    try {
      const data = await cachedFetch(proxyUrl("awesomeapi", "json/last/USD-BRL"), 300000);
      const rate = parseFloat(data?.USDBRL?.bid);
      if (rate && rate > 0) return { rate, error: null };
    } catch {}

    // Try BCB API via olinda (CORS may block)
    try {
      const url = proxyUrl("bcb", `olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@i,dataFinalCotacao=@f)?@i='${fmt(ontem)}'&@f='${fmt(hoje)}'&$top=1&$orderby=dataHoraCotacao desc&$format=json&$select=cotacaoVenda`);
      const data = await cachedFetch(url, 86400000);
      const rate = data?.value?.[0]?.cotacaoVenda;
      if (rate) return { rate, error: null };
    } catch {}

    // Try Exchange Rate API (open-source, CORS-friendly)
    try {
      const data = await cachedFetch(proxyUrl("erapi", "v6/latest/USD"), 3600000);
      const rate = data?.rates?.BRL;
      if (rate) return { rate, error: null };
    } catch {}

    return { rate: null, error: "Não foi possível obter a cotação. Tente novamente." };
  },
};
