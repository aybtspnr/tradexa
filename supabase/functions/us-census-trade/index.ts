import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CENSUS_API = "https://api.census.gov/data/timeseries/intltrade";

// === Retry helper ===
async function fetchWithRetry(url: string, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.log(`[CENSUS API] 429 — retry ${attempt + 1}/${maxRetries} in ${delay}ms`);
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
        modo: url.searchParams.get('modo') || 'imports',
        cty_code: url.searchParams.get('cty_code') || '',
        ibrd: url.searchParams.get('ibrd') || '',
        hts: url.searchParams.get('hts') || '',
        year: url.searchParams.get('year') || '2025',
        month: url.searchParams.get('month') || '',
        port: url.searchParams.get('port') || '',
        distrito: url.searchParams.get('distrito') || '',
        limit: url.searchParams.get('limit') || '100',
      };
    }

    const modo = body.modo || 'imports'; // imports | exports
    const cty_code = body.cty_code || '';
    const ibrd = body.ibrd || '';
    const hts = body.hts || '';
    const year = body.year || '2025';
    const month = body.month || '';
    const port = body.port || '';
    const distrito = body.distrito || '';
    const limit = body.limit || '100';

    const CENSUS_KEY = Deno.env.get('CENSUS_API_KEY') || '';

    // If no key configured, still serve demo data — UI works even without API key
    let censusKeyMissing = !CENSUS_KEY;

    // Endpoint selection
    const base = modo === 'imports'
      ? `${CENSUS_API}/imports`
      : `${CENSUS_API}/exports`;

    // Dynamic query building
    const getVars = ['ALL_VAL_MO', 'ALL_VAL_YR', 'QTY_1_MO', 'QTY_1_YR', 'CTY_NAME'];
    const forVar = distrito ? `DISTRICT=${distrito}` : 'CTY_CODE';
    const timeVar = month ? `${year}-${month.padStart(2, '0')}` : year;

    let url = `${base}/enduse/get?get=${getVars.join(',')}&${forVar}=${cty_code || '*'}&time=${timeVar}&key=${CENSUS_KEY}`;

    // Filter by HTS if provided
    if (hts && hts !== 'all') {
      url += `&E_ENDUSE=${hts.substring(0, 4)}*`;
    }

    console.log(`[CENSUS API] ${modo} query: ${url.substring(0, 200)}...`);

    const response = await fetchWithRetry(url);
    if (!response || !response.ok) {
      const text = response ? await response.text() : 'No response';
      console.error(`[CENSUS API] Error ${response?.status || 'null'}: ${text}`);

      // Fallback: return mock/demo data so the UI works even without API key
      const demoRecords = DEMO_DATA[modo] || [];
      return new Response(JSON.stringify({
        records: demoRecords,
        brasil_records: demoRecords,
        total: demoRecords.length,
        brasil_total: demoRecords.length,
        source: 'demo-fallback',
        hint: 'Configure CENSUS_API_KEY no Supabase para dados reais da US Census Bureau.',
        config_url: 'https://api.census.gov/data/key_signup.html',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const headers = data[0] || [];
    const rows = data.slice(1);

    const records = rows.map((row: any[]) => {
      const obj: Record<string, any> = {};
      headers.forEach((h: string, i: number) => { obj[h] = row[i]; });
      return {
        commodity: obj.E_ENDUSE || obj.HS || 'Unknown',
        country: obj.CTY_NAME || 'Unknown',
        value_month: Number(obj.ALL_VAL_MO) || 0,
        value_year: Number(obj.ALL_VAL_YR) || 0,
        qty_month: Number(obj.QTY_1_MO) || 0,
        qty_year: Number(obj.QTY_1_YR) || 0,
        year: obj.time?.split('-')[0] || year,
        month: obj.time?.split('-')[1] || '',
        distrito: obj.DISTRICT || '',
        port: obj.PORT || '',
      };
    });

    // Filter Brasil specifically if in imports mode
    const brasilRecords = cty_code === '3510' || cty_code.toString().startsWith('3510')
      ? records
      : records.filter((r: any) => r.country.toLowerCase().includes('brazil') || r.country.toLowerCase().includes('brasil'));

    return new Response(JSON.stringify({
      records,
      brasil_records: brasilRecords,
      total: records.length,
      brasil_total: brasilRecords.length,
      modo,
      periodo: { year, month },
      source: 'us-census-api',
      config_hint: 'Dados oficiais US Census Bureau. Para mais granularidade, configure sua própria API key em https://api.census.gov/data/key_signup.html',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[ERROR]', error.message);
    return new Response(JSON.stringify({
      error: error.message,
      records: [],
      total: 0,
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

// Demo data — falls back when API key or Census is unavailable
const DEMO_DATA: Record<string, any[]> = {
  imports: [
    { commodity: 'Iron and steel (7201-7217)', country: 'Brazil', value_month: 185420000, value_year: 2213400000, qty_month: 340000, qty_year: 4100000, year: '2025', month: '10' },
    { commodity: 'Soybeans and prepar. (1201)', country: 'Brazil', value_month: 420100000, value_year: 5100200000, qty_month: 1200000, qty_year: 14500000, year: '2025', month: '10' },
    { commodity: 'Coffee, tea, mate (0901)', country: 'Brazil', value_month: 45100000, value_year: 540000000, qty_month: 18000, qty_year: 220000, year: '2025', month: '10' },
    { commodity: 'Mineral fuels (2709)', country: 'Brazil', value_month: 89000000, value_year: 1080000000, qty_month: 145000, qty_year: 1750000, year: '2025', month: '10' },
    { commodity: 'Aircraft parts (8803)', country: 'Brazil', value_month: 21500000, value_year: 258000000, qty_month: 0, qty_year: 0, year: '2025', month: '10' },
    { commodity: 'Paper and paperboard (4703)', country: 'Brazil', value_month: 18000000, value_year: 216000000, qty_month: 35000, qty_year: 420000, year: '2025', month: '10' },
    { commodity: 'Wood and articles (4403)', country: 'Brazil', value_month: 12500000, value_year: 150000000, qty_month: 45000, qty_year: 540000, year: '2025', month: '10' },
    { commodity: 'Organic chemicals (2905)', country: 'Brazil', value_month: 9800000, value_year: 117600000, qty_month: 18000, qty_year: 216000, year: '2025', month: '10' },
  ],
  exports: [
    { commodity: 'Machinery (8471)', country: 'United States to Brazil', value_month: 210000000, value_year: 2520000000, qty_month: 54000, qty_year: 648000, year: '2025', month: '10' },
    { commodity: 'Electrical machinery (8544)', country: 'United States to Brazil', value_month: 185000000, value_year: 2220000000, qty_month: 42000, qty_year: 504000, year: '2025', month: '10' },
    { commodity: 'Aircraft (8802)', country: 'United States to Brazil', value_month: 145000000, value_year: 1740000000, qty_month: 8, qty_year: 96, year: '2025', month: '10' },
    { commodity: 'Vehicles (8703)', country: 'United States to Brazil', value_month: 98000000, value_year: 1176000000, qty_month: 18000, qty_year: 216000, year: '2025', month: '10' },
    { commodity: 'Medical instruments (9018)', country: 'United States to Brazil', value_month: 42000000, value_year: 504000000, qty_month: 5500, qty_year: 66000, year: '2025', month: '10' },
    { commodity: 'Pharmaceuticals (3004)', country: 'United States to Brazil', value_month: 38000000, value_year: 456000000, qty_month: 1200, qty_year: 14400, year: '2025', month: '10' },
    { commodity: 'Plastics (3901)', country: 'United States to Brazil', value_month: 28000000, value_year: 336000000, qty_month: 35000, qty_year: 420000, year: '2025', month: '10' },
  ],
};
