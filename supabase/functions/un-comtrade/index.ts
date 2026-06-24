import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// UN Comtrade free API — https://comtrade.un.org/api/
const COMTRADE_API = "https://comtrade.un.org/api/get";

async function fetchWithRetry(url: string, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`[UN COMTRADE] 429 — retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
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
        ps: url.searchParams.get('ps') || '2024',
        r: url.searchParams.get('r') || '76',      // reporter — Brasil
        p: url.searchParams.get('p') || '842',       // partner — USA
        rg: url.searchParams.get('rg') || '2',       // 1=import, 2=export
        hs: url.searchParams.get('hs') || '',         // HS code
        limit: url.searchParams.get('limit') || '100',
      };
    }

    const ps = body.ps || '2024';           // period(s)
    const r = body.r || '76';                // reporter country
    const p = body.p || '842';               // partner country
    const rg = body.rg || '2';               // 1=import, 2=export
    const hs = body.hs || '';
    const limit = parseInt(body.limit || '100', 10);

    // Build UN Comtrade query
    // Format: ?ps=2024&r=76&p=842&rg=2&fmt=json
    let url = `${COMTRADE_API}?ps=${ps}&r=${r}&p=${p}&rg=${rg}&p=ALL&rg=ALL&fmt=json`;
    if (hs) {
      url += `&hs=${hs}`;
    }
    // Limit by pagination
    url += `&px=H6`; // Classification: HS6 digit

    console.log(`[UN COMTRADE] Query: ${url.substring(0, 200)}...`);

    const response = await fetchWithRetry(url);
    if (!response || !response.ok) {
      const text = response ? await response.text() : 'No response';
      console.error(`[UN COMTRADE] Error ${response?.status || 'null'}: ${text}`);

      return new Response(JSON.stringify({
        data: [],
        validation: null,
        source: 'un-comtrade-api',
        hint: 'Dados da ONU Comtrade estão indisponíveis no momento. Tente novamente em alguns minutos.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const json = await response.json();
    const dataset = json.dataset || [];
    const validation = json.validation || null;

    // Format for frontend consumption
    const records = dataset.map((d: any) => ({
      hs: d.cmdCode || d.cmdCode || 'n/a',
      hs_description: d.cmdDescE || d.cmdDesc || 'Unknown',
      reporter: d.rtTitle || d.reporterDesc || 'Brasil',
      reporter_code: d.rtCode || '76',
      partner: d.ptTitle || d.partnerDesc || 'Global',
      partner_code: d.ptCode || '0',
      flow: d.rgDesc || (d.rgCode === '1' ? 'Import' : d.rgCode === '2' ? 'Export' : 'Unknown'),
      trade_value_usd: Number(d.netWgt) || Number(d.PrimaryValue) || 0,
      weight_kg: Number(d.netWgt) || 0,
      quantity: Number(d.qty) || 0,
      quantity_unit: d.qtyUnitCode || '',
      year: d.period || ps,
      period: d.period,
    })).slice(0, limit);

    // Aggregation by HS
    const hsAggregate: Record<string, any> = {};
    for (const rec of records) {
      const key = rec.hs;
      if (!hsAggregate[key]) {
        hsAggregate[key] = {
          hs: rec.hs,
          hs_description: rec.hs_description,
          total_value_usd: 0,
          total_weight_kg: 0,
          partners: new Set(),
          periods: new Set(),
        };
      }
      hsAggregate[key].total_value_usd += rec.trade_value_usd;
      hsAggregate[key].total_weight_kg += rec.weight_kg;
      hsAggregate[key].partners.add(rec.partner);
      hsAggregate[key].periods.add(rec.period);
    }

    const aggregated = Object.values(hsAggregate).map((a: any) => ({
      ...a,
      partners: Array.from(a.partners),
      periods: Array.from(a.periods).sort(),
      avg_value_per_kg: a.total_weight_kg > 0 ? a.total_value_usd / a.total_weight_kg : 0,
    })).sort((a: any, b: any) => b.total_value_usd - a.total_value_usd);

    return new Response(JSON.stringify({
      records,
      aggregated,
      total_records: records.length,
      total_aggregated: aggregated.length,
      params: { ps, r, p, rg, hs, limit },
      source: 'un-comtrade-api',
      validation,
      hint: 'Dados oficiais UN Comtrade (Organização das Nações Unidas). Cobertura global de comércio internacional.',
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
