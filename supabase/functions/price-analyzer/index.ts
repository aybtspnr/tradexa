import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const COMEXSTAT_API = "https://api-comexstat.mdic.gov.br/general"
const CENSUS_API = "https://api.census.gov/data/timeseries/intltrade/imports/enduse"

async function fetchComexstat(ncm: string, year: string) {
  const res = await fetch(`${COMEXSTAT_API}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      flowType: "export",
      period: { from: `${year}-01`, to: `${year}-12` },
      details: ["natureza" as any],
      filters: [{ field: "natureza", value: ncm }],
      page: 1,
      perPage: 1
    })
  });
  const data = await res.json();
  const record = data?.data?.list?.[0];
  return { value: record?.value || 0, qty: record?.quantity || 1 };
}

async function fetchCensus(htsPrefix: string, year: string, censusKey: string) {
  const url = `${CENSUS_API}/get?get=ALL_VAL_MO,QTY_1_MO&MONTH=*&E_ENDUSE=${htsPrefix}*&time=${year}&key=${censusKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const rows = data.slice(1);
  let totalVal = 0, totalQty = 0;
  rows.forEach((r: any) => {
    totalVal += Number(r[1]) || 0;
    totalQty += Number(r[2]) || 0;
  });
  return { value: totalVal, qty: totalQty || 1 };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { ncm, htsPrefix, year, commodity_name } = await req.json();
    const censusKey = Deno.env.get('CENSUS_API_KEY') || '';

    // Fallback: use demo data if census key missing
    const brData = await fetchComexstat(ncm, year);
    const brPrice = brData.value / (brData.qty || 1);

    let usPrice = 0, diff = 0, diffPct = 0;
    let source = 'demo-fallback';

    if (censusKey && htsPrefix) {
      const usData = await fetchCensus(htsPrefix, year, censusKey);
      if (usData) {
        usPrice = usData.value / usData.qty;
        diff = Math.abs(brPrice - usPrice);
        diffPct = brPrice > 0 ? ((usPrice - brPrice) / brPrice) * 100 : 0;
        source = 'us-census-api';
      }
    }

    // Demo fallback
    if (!usPrice) {
      usPrice = brPrice * (0.85 + Math.random() * 0.3);
      diff = Math.abs(brPrice - usPrice);
      diffPct = brPrice > 0 ? ((usPrice - brPrice) / brPrice) * 100 : 0;
    }

    return new Response(JSON.stringify({
      ncm,
      htsPrefix,
      commodity_name: commodity_name || 'Commodity',
      br_price_kg: Math.round(brPrice * 100) / 100,
      us_price_kg: Math.round(usPrice * 100) / 100,
      diff: Math.round(diff * 100) / 100,
      diff_pct: Math.round(diffPct * 10) / 10,
      opportunity_flag: Math.abs(diffPct) > 20,
      year,
      source,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[PRICE ANALYZER]', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
