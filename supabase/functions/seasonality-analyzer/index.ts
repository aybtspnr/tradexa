import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const COMEXSTAT_API = "https://api-comexstat.mdic.gov.br/general"

async function fetchWithRetry(url: string, body: any, maxRetries = 2) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
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
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { ncm, country, years, flow = 'export' } = await req.json();
    const targetYears = years || ['2024', '2025'];
    
    const monthlyData: Record<string, { value: number; qty: number; year: string; month: string }> = {};
    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    
    for (const year of targetYears) {
      for (const month of months) {
        const body: any = {
          flowType: flow === 'import' ? 'import' : 'export',
          period: { from: `${year}-${month}`, to: `${year}-${month}` },
          details: ['natureza' as any],
          filters: [{ field: "natureza", value: ncm || "1201" }],
          page: 1,
          perPage: 1
        };
        if (country) body.filters.push({ field: "country", value: country });
        
        const res = await fetchWithRetry(`${COMEXSTAT_API}/search`, body, 1);
        const data = res?.ok ? await res.json() : null;
        const record = data?.data?.list?.[0];
        const key = `${year}-${month}`;
        
        monthlyData[key] = {
          value: record?.value || 0,
          qty: record?.quantity || 0,
          year,
          month
        };
      }
    }

    // Calculate seasonality
    const values = Object.values(monthlyData).map(v => v.value).filter(v => v > 0);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const peakMonths = Object.entries(monthlyData)
      .filter(([_, v]) => v.value > avg * 1.5)
      .map(([k]) => k);

    const trend = values.length >= 6
      ? values.slice(-6).reduce((a, b) => a + b, 0) > values.slice(0, 6).reduce((a, b) => a + b, 0) ? 'up' : 'down'
      : 'stable';

    // Check cache (using simple in-memory structure for this session if needed)
    return new Response(JSON.stringify({
      ncm: ncm || "1201",
      flow,
      monthly_data: Object.entries(monthlyData).map(([key, v]) => ({
        period: key,
        value: v.value,
        qty: v.qty,
        month_label: `${v.month}/${v.year}`
      })),
      peak_months: peakMonths,
      trend,
      average_monthly: Math.round(avg),
      source: 'comexstat-api',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      monthly_data: [],
      peak_months: [],
      trend: 'stable',
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
