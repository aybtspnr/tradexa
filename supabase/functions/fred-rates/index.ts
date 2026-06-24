// FRED API proxy — exchange rates & interest rates
const BASE = "https://api.stlouisfed.org/fred";
const FRED_KEY = Deno.env.get("FRED_API_KEY") || "";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

const SERIES: Record<string, { label: string; unit: string }> = {
  DEXBZUS: { label: "BRL/USD", unit: "USD" },
  FEDFUNDS: { label: "Fed Funds Rate", unit: "%" },
  CPIAUCSL: { label: "US CPI", unit: "Index" },
  TB3MS: { label: "US T-Bill 3M", unit: "%" },
};

async function fetchSeries(seriesId: string, limit: number) {
  if (!FRED_KEY) {
    return [];
  }
  const url = `${BASE}/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&limit=${limit}&sort_order=desc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED error: ${res.status}`);
  const data = await res.json();
  return data.observations || [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });
  try {
    let seriesId = "DEXBZUS";
    let limit = 30;

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      seriesId = body.series || seriesId;
      limit = body.limit || limit;
    } else {
      const { searchParams } = new URL(req.url);
      seriesId = searchParams.get("series") || seriesId;
      limit = parseInt(searchParams.get("limit") || "30", 10);
    }

    if (!SERIES[seriesId]) {
      return new Response(JSON.stringify({ error: "Unknown series" }), {
        status: 400,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      });
    }

    const observations = await fetchSeries(seriesId, limit);

    return new Response(
      JSON.stringify({
        series: seriesId,
        label: SERIES[seriesId].label,
        unit: SERIES[seriesId].unit,
        observations: observations.map((o: any) => ({ date: o.date, value: parseFloat(o.value) })),
      }),
      { headers: { ...corsHeaders(), "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }
});
