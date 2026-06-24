import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRADEMAP_BASE = "https://www.trademap.org/api";

const COUNTRY_MAP: Record<string, string> = {
  "USA": "842", "CHN": "156", "DEU": "276", "FRA": "250", "ITA": "380",
  "ESP": "724", "GBR": "826", "JPN": "392", "KOR": "410", "MEX": "484",
  "CAN": "124", "ARG": "032", "URY": "858", "BRA": "076", "CHL": "152",
  "COL": "170", "PER": "604", "IND": "356", "NLD": "528", "TUR": "792",
  "SAU": "682", "ARE": "784", "SGP": "702", "MYS": "458", "THA": "764",
  "VNM": "704", "IDN": "360", "PHL": "608", "EGY": "818", "ISR": "376",
};

async function fetchTradeMapAPI(
  countryCode: string,
  product: string,
  tradeFlow: string,
  page: number,
  token: string
) {
  const url = `${TRADEMAP_BASE}/companies?tradeFlow=${tradeFlow}&product=${product}&productType=p&country=${countryCode}&page=${page}&pageSize=100&sortBy=companyName&sortDir=asc`;

  try {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Origin": "https://beta.trademap.org",
        "Referer": "https://beta.trademap.org/",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${text.substring(0, 200)}` };
    }

    const data = await res.json();
    return {
      ok: true,
      companies: (data.records || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        city: r.city,
        countryCd: r.countryCd,
        activities: r.activities,
        website: r.website,
        annualTurnover: r.annualTurnover,
        numberOfEmployees: r.numberOfEmployees,
        productsTotal: r.productsTotal,
        productsTop: r.productsTop,
        partnersTotal: r.partnersTotal,
        partnersTop: r.partnersTop,
        sourceId: r.sourceId,
      })),
      totalRecords: data.nbRecords || 0,
      page: data.page || page,
      nbPages: data.nbPages || 1,
      nbRecordPerPage: data.nbRecordPerPage || 3,
      source: "trademap_api"
    };
  } catch (e: any) {
    return { ok: false, error: e.message || "Erro ao consultar TradeMap" };
  }
}

async function fetchFromSupabase(supabaseUrl: string, supabaseKey: string, countryCode: string, tradeFlow: string, page: number) {
  try {
    const limit = 25;
    const offset = (page - 1) * limit;
    let url = `${supabaseUrl}/rest/v1/trademap_companies?select=*&country_code=eq.${countryCode}&trade_flow=eq.${tradeFlow}&offset=${offset}&limit=${limit}`;
    const res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "apikey": supabaseKey,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return {
      ok: true,
      companies: data,
      page: page,
      nbPages: Math.ceil(1000 / limit), // dummy if unknown
      totalRecords: 1000,
      nbRecordPerPage: limit,
      source: "supabase_cache"
    };
  } catch {
    return { ok: false };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      country = "BRA",
      product = "ALL",
      tradeFlow = "I",
      page = 1,
      token = "",
    } = body;

    const countryCode = COUNTRY_MAP[country] || country;
    const effectiveToken = token.trim();

    // 1. Try TradeMap API if token provided
    if (effectiveToken.length > 50) {
      const result = await fetchTradeMapAPI(countryCode, product, tradeFlow, page, effectiveToken);
      if (result.ok) {
        return new Response(JSON.stringify({
          success: true,
          ...result,
          country,
          countryCode,
          tradeFlow,
          product,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // 2. Try Supabase cache
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const cached = await fetchFromSupabase(SUPABASE_URL, SUPABASE_ANON_KEY, countryCode, tradeFlow, page);
      if (cached.ok) {
        return new Response(JSON.stringify({
          success: true,
          cached: true,
          ...cached,
          country,
          countryCode,
          tradeFlow,
          product,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // 3. No data
    return new Response(JSON.stringify({
      success: false,
      error: "Dados indisponíveis",
      hint: token.length < 50
        ? "Token TradeMap não fornecido. Copie o Bearer token do DevTools (aba Network) na sessão ativa do TradeMap e cole no campo 'Token de Acesso'."
        : "Token inválido ou expirado. Atualize o token. O TradeMap requer login ativo na mesma sessão.",
      companies: [],
      totalRecords: 0,
      page: 1,
      nbPages: 0,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
