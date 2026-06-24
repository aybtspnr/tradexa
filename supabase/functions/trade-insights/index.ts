// supabase/functions/trade-insights/index.ts
// Unified trade dashboard — Census Bureau + COMTRADE

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CENSUS = "https://api.census.gov/data/timeseries/intltrade";
const CKEY = "1bd2f7004fe5fe577570bda949c4dd22a2466e5d";
const COMTRADE = "https://comtradeapi.un.org/public/v1/preview/C/A/HS";

function parse(data: any) {
  if (!Array.isArray(data) || data.length < 2) return [];
  const headers: string[] = data[0];
  return data.slice(1).map((row: any[]) => {
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

async function fetchJson(url: string) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!contentType.includes("json") && !text.trimStart().startsWith("[")) {
    throw new Error(`Unexpected response format from Census API (expected JSON, got ${contentType || "non-JSON"})`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse Census API response as JSON — API may be returning HTML or an error page`);
  }
}

// Country code mapping
const CTY_MAP: Record<string, string> = {
  "3510": "Brasil", "2010": "México", "1240": "Canadá", "5700": "China",
  "4759": "Alemanha", "5880": "Japão", "5800": "Coreia do Sul", "5330": "Índia",
  "3010": "Colômbia", "3330": "Peru", "3370": "Chile", "4120": "Reino Unido",
  "4279": "França", "4750": "Itália", "4700": "Países Baixos", "4230": "Espanha",
  "5170": "Argentina", "5600": "Indonésia", "5570": "Vietnã", "5650": "Tailândia",
  "5579": "Malásia", "5360": "Cingapura", "7910": "África do Sul", "7530": "Nigéria",
  "6021": "Austrália",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body.action || "overview";
    const hsCode = body.hs_code || "";
    const year = body.year || "2025";
    const month = body.month || "";

    // ══ OVERVIEW: resumo bilateral BR↔USA ══
    if (action === "overview") {
      const timeP = month ? `${year}-${month.padStart(2, "0")}` : year;
      const [expData, impData] = await Promise.all([
        fetchJson(`${CENSUS}/exports/hs?get=ALL_VAL_MO,ALL_VAL_YR,CTY_NAME,QTY_1_MO&COMM_LVL=HS6&CTY_CODE=3510&time=${timeP}&key=${CKEY}`),
        fetchJson(`${CENSUS}/imports/hs?get=GEN_VAL_MO,GEN_VAL_YR,CTY_NAME,GEN_QY1_MO&COMM_LVL=HS6&CTY_CODE=3510&time=${timeP}&key=${CKEY}`),
      ]);

      const expRows = parse(expData);
      const impRows = parse(impData);

      const totalExp = expRows.reduce((s, r) => s + (Number(r.ALL_VAL_MO) || 0), 0);
      const totalImp = impRows.reduce((s, r) => s + (Number(r.GEN_VAL_MO) || 0), 0);
      const expProducts = expRows.length;
      const impProducts = impRows.length;

      // Top 5 export/import products
      const topExp = expRows
        .sort((a, b) => (Number(b.ALL_VAL_MO) || 0) - (Number(a.ALL_VAL_MO) || 0))
        .slice(0, 5)
        .map(r => ({ name: r.CTY_NAME, value: Number(r.ALL_VAL_MO) || 0 }));

      const topImp = impRows
        .sort((a, b) => (Number(b.GEN_VAL_MO) || 0) - (Number(a.GEN_VAL_MO) || 0))
        .slice(0, 5)
        .map(r => ({ name: r.CTY_NAME, value: Number(r.GEN_VAL_MO) || 0 }));

      return new Response(JSON.stringify({
        export_total: totalExp,
        import_total: totalImp,
        balance: totalExp - totalImp,
        export_products: expProducts,
        import_products: impProducts,
        top_exports: topExp,
        top_imports: topImp,
        period: timeP,
        source: "us-census-bureau",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ══ TRENDS: evolução mensal ══
    if (action === "trends") {
      const months = [];
      for (let m = 1; m <= 12; m++) {
        const mm = String(m).padStart(2, "0");
        try {
          const [eData, iData] = await Promise.all([
            fetchJson(`${CENSUS}/exports/hs?get=ALL_VAL_MO&COMM_LVL=HS6&CTY_CODE=3510&time=${year}-${mm}&key=${CKEY}`),
            fetchJson(`${CENSUS}/imports/hs?get=GEN_VAL_MO&COMM_LVL=HS6&CTY_CODE=3510&time=${year}-${mm}&key=${CKEY}`),
          ]);
          const eRows = parse(eData);
          const iRows = parse(iData);
          months.push({
            month: mm,
            label: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][m-1],
            exports: eRows.reduce((s: number, r: any) => s + (Number(r.ALL_VAL_MO) || 0), 0),
            imports: iRows.reduce((s: number, r: any) => s + (Number(r.GEN_VAL_MO) || 0), 0),
          });
        } catch { /* skip */ }
      }
      return new Response(JSON.stringify({ monthly: months, year, source: "us-census-bureau" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ══ RANKING: top parceiros (COMTRADE) ══
    if (action === "ranking") {
      const flow = body.flow === "imports" ? "M" : "X";
      const reporterCode = flow === "X" ? "076" : "842"; // Brazil or USA

      const data = await fetchJson(`${COMTRADE}?reporterCode=${reporterCode}&period=${year}&cmdCode=TOTAL&flowCode=${flow}`);
      const records = data?.data || [];

      const partnerMap: Record<number, number> = {};
      for (const r of records) {
        const code = r.partnerCode;
        const val = r.fobvalue || r.primaryValue || 0;
        partnerMap[code] = (partnerMap[code] || 0) + val;
      }

      const totalVal = Object.values(partnerMap).reduce((a: number, b: number) => a + b, 0);
      const sorted = Object.entries(partnerMap)
        .filter(([code]) => parseInt(code) > 0)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15)
        .map(([code, val]) => ({
          partner_code: parseInt(code),
          partner_name: CTY_MAP[code] || `Código ${code}`,
          value_usd: val,
          share_pct: totalVal > 0 ? (val / totalVal) * 100 : 0,
        }));

      return new Response(JSON.stringify({
        records: sorted,
        total_value: totalVal,
        flow: flow === "X" ? "exports" : "imports",
        year,
        source: "un-comtrade",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ══ SEARCH: por HS code ══
    if (action === "search") {
      const mode = body.mode || "exports";
      const isExport = mode === "exports";
      const vs = isExport ? "ALL_VAL_MO,QTY_1_MO,E_COMMODITY_SDESC" : "GEN_VAL_MO,GEN_QY1_MO,I_COMMODITY_SDESC";
      const dataset = isExport ? "exports/hs" : "imports/hs";
      const filterVar = isExport ? "E_COMMODITY" : "I_COMMODITY";
      const url = `${CENSUS}/${dataset}?get=${vs}&COMM_LVL=HS6&CTY_CODE=3510&${filterVar}=${hsCode}&time=${year}&key=${CKEY}`;
      const data = await fetchJson(url);
      const records = parse(data).map((r: any) => ({
        commodity: r.E_COMMODITY_SDESC || r.I_COMMODITY_SDESC || "Unknown",
        value_usd: Number(r.ALL_VAL_MO || r.GEN_VAL_MO || 0),
        qty: Number(r.QTY_1_MO || r.GEN_QY1_MO || 0),
      }));

      return new Response(JSON.stringify({
        hs_code: hsCode,
        mode,
        records,
        total: records.reduce((s: number, r: any) => s + r.value_usd, 0),
        year,
        source: "us-census-bureau",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
