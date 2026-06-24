const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export async function fetchUnComtrade(params: {
  ps?: string;          // period e.g. '2024' or '2024,2023'
  r?: string;           // reporter country code (76 = BR, 842 = USA)
  p?: string;           // partner (842 = USA, ALL = all)
  rg?: string;          // 1=import, 2=export
  hs?: string;
  limit?: number;
}) {
  const url = new URL(`${SUPABASE_URL}/functions/v1/un-comtrade`);
  if (params.ps) url.searchParams.set('ps', params.ps);
  if (params.r) url.searchParams.set('r', params.r);
  if (params.p) url.searchParams.set('p', params.p);
  if (params.rg) url.searchParams.set('rg', params.rg);
  if (params.hs) url.searchParams.set('hs', params.hs);
  if (params.limit) url.searchParams.set('limit', String(params.limit));

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`UN Comtrade error: ${res.status}`);
  return res.json();
}

export async function fetchUnComtradeBrasilExports(ps = '2024') {
  return fetchUnComtrade({ ps, r: '76', rg: '2', limit: 500 });
}

export async function fetchUnComtradeBrasilToUSA(ps = '2024') {
  return fetchUnComtrade({ ps, r: '76', p: '842', rg: '2', limit: 500 });
}

export async function fetchUnComtradeUSAImports(ps = '2024') {
  return fetchUnComtrade({ ps, r: '842', rg: '1', limit: 500 });
}
