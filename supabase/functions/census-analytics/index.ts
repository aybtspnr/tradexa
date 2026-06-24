// supabase/functions/census-analytics/index.ts
// Analytics from Census Bureau: seasonality, mirror trade, competitors

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CENSUS_API = "https://api.census.gov/data/timeseries/intltrade";
const CENSUS_KEY = "1bd2f7004fe5fe577570bda949c4dd22a2466e5d";

async function fetchCensus(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Census HTTP ${res.status}`);
  const text = await res.text();
  if (!text || text.trim().length === 0) throw new Error("Census returned empty body");
  return JSON.parse(text);
}

// Parse array-of-arrays into objects
function parse(data: any) {
  if (!Array.isArray(data) || data.length < 2) return [];
  const headers: string[] = data[0];
  const rows: any[][] = data.slice(1);
  return rows.map(row => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action || "seasonality";
    const hsCode = body.hs_code || "090111";
    const year = body.year || "2025";

    // Determine HS level from code length
    const hsLen = hsCode.replace(/\D/g, "").length;
    let COMM_LVL = "HS6";
    if (hsLen <= 4) COMM_LVL = "HS4";
    else if (hsLen <= 6) COMM_LVL = "HS6";
    else COMM_LVL = "HS10";

    // ══ SEASONALITY: dados mensais de exportação BR→USA ══
    if (action === "seasonality") {
      const vars = ["ALL_VAL_MO", "QTY_1_MO", "E_COMMODITY_SDESC"];
      const monthly: any[] = [];
      const errors: string[] = [];

      for (let m = 1; m <= 12; m++) {
        const mm = String(m).padStart(2, "0");
        try {
          const url = `${CENSUS_API}/exports/hs?get=${vars.join(",")}&COMM_LVL=${COMM_LVL}&CTY_CODE=3510&E_COMMODITY=${hsCode}&time=${year}-${mm}&key=${CENSUS_KEY}`;
          const data = await fetchCensus(url);
          const records = parse(data);
          if (records.length > 0) {
            const r = records[0];
            const val = Number(r.ALL_VAL_MO) || 0;
            const qty = Number(r.QTY_1_MO) || 0;
            monthly.push({
              month: mm,
              label: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][m-1],
              value_usd: val,
              qty: qty,
              price_per_unit: qty > 0 ? val / qty : 0,
            });
          }
        } catch (e: any) {
          errors.push(`${mm}: ${e.message}`);
        }
      }

      const values = monthly.map(m => m.value_usd).filter((v: number) => v > 0);
      const avgVal = values.length ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
      const peakMonths = monthly.filter(m => m.value_usd > avgVal * 1.2).map(m => m.label);

      // Try to get product name, fallback gracefully
      let productName = `HS ${hsCode}`;
      try {
        const prodUrl = `${CENSUS_API}/exports/hs?get=E_COMMODITY_SDESC&COMM_LVL=${COMM_LVL}&CTY_CODE=3510&E_COMMODITY=${hsCode}&time=${year}-01&key=${CENSUS_KEY}`;
        const prodData = await fetchCensus(prodUrl);
        const prodRecords = parse(prodData);
        if (prodRecords[0]?.E_COMMODITY_SDESC) {
          productName = prodRecords[0].E_COMMODITY_SDESC;
        }
      } catch { /* fallback to HS code */ }

      return new Response(JSON.stringify({
        product: productName,
        hs_code: hsCode,
        year,
        monthly_data: monthly,
        peak_months: peakMonths,
        average_monthly: Math.round(avgVal),
        source: "us-census-bureau",
        errors: errors.length > 0 ? errors : undefined,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ══ MIRROR TRADE: comparação BR export → US import ══
    if (action === "mirror-trade") {
      const [brExpData, usImpData] = await Promise.all([
        fetchCensus(`${CENSUS_API}/exports/hs?get=ALL_VAL_MO,ALL_VAL_YR,QTY_1_MO,E_COMMODITY_SDESC&COMM_LVL=HS6&CTY_CODE=3510&E_COMMODITY=${hsCode}&time=${year}&key=${CENSUS_KEY}`),
        fetchCensus(`${CENSUS_API}/imports/hs?get=GEN_VAL_MO,GEN_VAL_YR,GEN_QY1_MO,I_COMMODITY_SDESC&COMM_LVL=HS6&I_COMMODITY=${hsCode}&time=${year}&key=${CENSUS_KEY}`),
      ]);

      const brExp = parse(brExpData);
      const usImp = parse(usImpData);

      const brRecord = brExp[0] || {};
      const usRecord = usImp[0] || {};

      const brValMo = Number(brRecord.ALL_VAL_MO) || 0;
      const brValYr = Number(brRecord.ALL_VAL_YR) || 0;
      const brQty = Number(brRecord.QTY_1_MO) || 0;
      const usValMo = Number(usRecord.GEN_VAL_MO) || 0;
      const usValYr = Number(usRecord.GEN_VAL_YR) || 0;

      const diffMo = usValMo - brValMo;
      const diffPct = brValMo > 0 ? ((diffMo / brValMo) * 100) : 0;

      let status = "Consistente";
      if (Math.abs(diffPct) > 20) status = "Gap identificado";
      if (diffPct < -10) status = "Inversão";

      return new Response(JSON.stringify({
        hs_code: hsCode,
        product: brRecord.E_COMMODITY_SDESC || usRecord.I_COMMODITY_SDESC || `HS ${hsCode}`,
        year,
        br_export: { value_month: brValMo, value_year: brValYr, qty: brQty },
        us_import: { value_month: usValMo, value_year: usValYr },
        diff_month: diffMo,
        diff_pct: Math.round(diffPct * 10) / 10,
        status,
        source: "us-census-bureau",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ══ COMPETITORS: market share do produto nos EUA ══
    if (action === "competitors") {
      const vars = ["I_COMMODITY_SDESC", "CTY_NAME", "GEN_VAL_MO", "GEN_VAL_YR"];
      const url = `${CENSUS_API}/imports/hs?get=${vars.join(",")}&COMM_LVL=HS6&I_COMMODITY=${hsCode}&time=${year}&key=${CENSUS_KEY}`;
      const data = await fetchCensus(url);
      const records = parse(data);

      const realCountries = records.filter((r: any) => {
        const n = r.CTY_NAME || "";
        return !n.toUpperCase().includes("TOTAL") && !n.toUpperCase().includes("REPUBLICS")
          && !n.toUpperCase().includes("LAFTA") && !n.toUpperCase().includes("OECD")
          && !n.toUpperCase().includes("APEC") && !n.toUpperCase().includes("ASEAN")
          && !n.toUpperCase().includes("SOUTH AMERICA") && !n.toUpperCase().includes("CENTRAL AMERICA")
          && !n.toUpperCase().includes("PACIFIC") && !n.toUpperCase().includes("CAFTA")
          && !n.toUpperCase().includes("WORLD") && !n.toUpperCase().includes("EUROPE");
      });

      const totalAll = realCountries.reduce((s: number, r: any) => s + (Number(r.GEN_VAL_MO) || 0), 0);
      const sorted = realCountries
        .map((r: any) => ({
          country: r.CTY_NAME,
          value_usd: Number(r.GEN_VAL_MO) || 0,
          share_pct: totalAll > 0 ? ((Number(r.GEN_VAL_MO) || 0) / totalAll) * 100 : 0,
        }))
        .sort((a: any, b: any) => b.value_usd - a.value_usd)
        .slice(0, 15);

      const product = records[0]?.I_COMMODITY_SDESC || `HS ${hsCode}`;

      return new Response(JSON.stringify({
        product,
        hs_code: hsCode,
        year,
        total_market: totalAll,
        competitors: sorted,
        source: "us-census-bureau",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error("[census-analytics] ERROR:", error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
