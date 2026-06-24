import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Comexstat MDIC API aberta (v1)
const COMEXSTAT_API = "https://api-comexstat.mdic.gov.br/general/search";

async function fetchWithRetry(url: string, body: any, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`[COMEXSTAT] 429 — retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
      }
      return res;
    } catch (e) {
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      throw e;
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      const url = new URL(req.url);
      body = {
        periodo_inicio: url.searchParams.get('periodo_inicio') || '2024-01',
        periodo_fim: url.searchParams.get('periodo_fim') || '2024-12',
        tipo: url.searchParams.get('tipo') || 'EXP',         // EXP = exportação, IMP = importação
        ncm: url.searchParams.get('ncm') || '',
        pais: url.searchParams.get('pais') || '',             // país parceiro (ex: '160' = Estados Unidos)
        uf: url.searchParams.get('uf') || '',
        via: url.searchParams.get('via') || '',
        urf: url.searchParams.get('urf') || '',
        limit: url.searchParams.get('limit') || '500',
      };
    }

    const periodo_inicio = body.periodo_inicio || '2024-01';
    const periodo_fim = body.periodo_fim || '2024-12';
    const tipo = body.tipo || 'EXP';
    const ncm = body.ncm || '';
    const pais = body.pais || '';
    const uf = body.uf || '';
    const via = body.via || '';
    const urf = body.urf || '';
    const limit = parseInt(body.limit || '500', 10);

    // Build Comexstat query body
    const queryBody: any = {
      period: {
        start: periodo_inicio,
        end: periodo_fim,
      },
      flow: tipo,  // EXP ou IMP
      detail: {
        level: 'ncm',
      },
    };

    // NCM filter
    if (ncm) {
      queryBody.filters = queryBody.filters || [];
      queryBody.filters.push({
        name: 'ncm',
        value: ncm,
        op: 'startswith', // se for ncm completo mudar para 'eq'
      });
    }

    // País filter
    if (pais) {
      queryBody.filters = queryBody.filters || [];
      queryBody.filters.push({
        name: 'country',
        value: pais,
        op: 'eq',
      });
    }

    // UF filter
    if (uf) {
      queryBody.filters = queryBody.filters || [];
      queryBody.filters.push({
        name: 'state',
        value: uf,
        op: 'eq',
      });
    }

    // Via transporte
    if (via) {
      queryBody.filters = queryBody.filters || [];
      queryBody.filters.push({
        name: 'transportation',
        value: via,
        op: 'eq',
      });
    }

    // URF (Unidade da Receita Federal)
    if (urf) {
      queryBody.filters = queryBody.filters || [];
      queryBody.filters.push({
        name: 'urf',
        value: urf,
        op: 'eq',
      });
    }

    console.log(`[COMEXSTAT] Query body:`, JSON.stringify(queryBody));

    const response = await fetchWithRetry(COMEXSTAT_API, queryBody);
    if (!response || !response.ok) {
      const text = response ? await response.text() : 'No response';
      console.error(`[COMEXSTAT] Error ${response?.status || 'null'}: ${text}`);

      return new Response(JSON.stringify({
        data: DEMO_DATA,
        source: 'demo-fallback',
        hint: 'Comexstat API indisponível. Retornando dados demonstrativos.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const json = await response.json();
    const data = json.data || [];

    // Format for frontend
    const records = data.slice(0, limit).map((d: any) => ({
      ncm: d.ncm?.code || d.ncm || 'n/a',
      ncm_description: d.ncm?.name || d.name || d.ncmName || 'Unknown',
      country: d.country?.name || d.countryName || d.country || 'Unknown',
      country_code: d.country?.id || d.country || '',
      state: d.state?.name || d.state || '',
      state_code: d.state?.id || d.state || '',
      via: d.transportation?.name || d.transportation || '',
      urf: d.urf?.name || d.urf || '',
      metric: d.metric || 'FOB',
      value_usd: Number(d.fobValue) || Number(d.cifValue) || Number(d.metricValue) || 0,
      net_weight_kg: Number(d.netWeight) || 0,
      quantity: Number(d.statisticalQuantity) || Number(d.quantity) || 0,
      year: d.year || periodo_inicio.split('-')[0],
      month: d.month || periodo_inicio.split('-')[1] || '',
    }));

    // Aggregate by NCM
    const ncmAggregate: Record<string, any> = {};
    for (const rec of records) {
      const key = rec.ncm;
      if (!ncmAggregate[key]) {
        ncmAggregate[key] = {
          ncm: rec.ncm,
          ncm_description: rec.ncm_description,
          total_value_usd: 0,
          total_weight_kg: 0,
          total_quantity: 0,
          countries: new Set(),
          states: new Set(),
          periods: new Set(),
        };
      }
      ncmAggregate[key].total_value_usd += rec.value_usd;
      ncmAggregate[key].total_weight_kg += rec.net_weight_kg;
      ncmAggregate[key].total_quantity += rec.quantity;
      ncmAggregate[key].countries.add(rec.country);
      ncmAggregate[key].states.add(rec.state);
      ncmAggregate[key].periods.add(`${rec.year}-${rec.month}`);
    }

    const aggregated = Object.values(ncmAggregate).map((a: any) => ({
      ...a,
      countries: Array.from(a.countries),
      states: Array.from(a.states),
      periods: Array.from(a.periods).sort(),
      avg_value_per_kg: a.total_weight_kg > 0 ? a.total_value_usd / a.total_weight_kg : 0,
      avg_value_per_unit: a.total_quantity > 0 ? a.total_value_usd / a.total_quantity : 0,
    })).sort((a: any, b: any) => b.total_value_usd - a.total_value_usd);

    return new Response(JSON.stringify({
      records,
      aggregated,
      total_records: records.length,
      total_aggregated: aggregated.length,
      params: { periodo_inicio, periodo_fim, tipo, ncm, pais, uf, limit },
      source: 'comexstat-mdic',
      hint: 'Dados oficiais Comexstat (MDIC - Ministério do Desenvolvimento, Indústria, Comércio e Serviços).',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[ERROR]', error.message);
    return new Response(JSON.stringify({
      error: error.message,
      records: [],
      aggregated: [],
      total: 0,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

// Demo data fallback
const DEMO_DATA = [
  { ncm: '0901.11.10', ncm_description: 'Café arábica não torrado', country: 'Estados Unidos', country_code: '160', state: 'São Paulo', value_usd: 425000000, net_weight_kg: 145000000, year: '2024', month: '10' },
  { ncm: '1201.00.00', ncm_description: 'Soja', country: 'Estados Unidos', country_code: '160', state: 'Mato Grosso', value_usd: 380000000, net_weight_kg: 89000000, year: '2024', month: '10' },
  { ncm: '1701.12.00', ncm_description: 'Açúcar refinado', country: 'Estados Unidos', country_code: '160', state: 'São Paulo', value_usd: 125000000, net_weight_kg: 31000000, year: '2024', month: '10' },
  { ncm: '0207.14.00', ncm_description: 'Cortes de frango', country: 'Estados Unidos', country_code: '160', state: 'Paraná', value_usd: 98000000, net_weight_kg: 15000000, year: '2024', month: '10' },
  { ncm: '2009.80.00', ncm_description: 'Suco de laranja', country: 'Estados Unidos', country_code: '160', state: 'São Paulo', value_usd: 65000000, net_weight_kg: 42000000, year: '2024', month: '10' },
  { ncm: '2709.00.20', ncm_description: 'Petróleo cru', country: 'Estados Unidos', country_code: '160', state: 'Rio de Janeiro', value_usd: 89000000, net_weight_kg: 120000000, year: '2024', month: '10' },
];
