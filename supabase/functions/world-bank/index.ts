// World Bank API proxy — macro indicators by country
const BASE = "https://api.worldbank.org/v2";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

const INDICATORS: Record<string, string> = {
  NY_GDP_MKTP_CD: "GDP (current USD)",
  NY_GDP_PCAP_CD: "GDP per capita (current USD)",
  SP_POP_TOTL: "Population",
  NE_EXP_GNFS_ZS: "Exports of goods/services (% GDP)",
  NE_IMP_GNFS_ZS: "Imports of goods/services (% GDP)",
  FP_CPI_TOTL_ZG: "Inflation (CPI annual %)",
  BX_KLT_DINV_WD_GD_ZS: "FDI (% GDP)",
};

async function fetchIndicator(countryCode: string, indicator: string, year: string) {
  const url = `${BASE}/country/${countryCode}/indicator/${indicator}?date=${year}&format=json&per_page=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`World Bank error: ${res.status}`);
  const data = await res.json();
  // World Bank returns [pageInfo, [data]]
  const records = Array.isArray(data) && data.length > 1 ? data[1] : [];
  return records[0] || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders() });
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "BRA";
    const year = searchParams.get("year") || "2023";
    const indicatorsParam = searchParams.get("indicators") || "";
    const indicatorList = indicatorsParam ? indicatorsParam.split(",") : Object.keys(INDICATORS);

    const results: Record<string, any> = {};
    for (const ind of indicatorList) {
      if (!INDICATORS[ind]) continue;
      const record = await fetchIndicator(country, ind, year);
      results[ind] = {
        label: INDICATORS[ind],
        value: record?.value ?? null,
        year: record?.date || year,
        unit: record?.unit || "",
      };
    }

    return new Response(JSON.stringify({ country, year, indicators: results }), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  }
});
