// supabase/functions/global-tariff-lookup/index.ts
// Consulta alíquotas/tarifas por país e HS code
// Fontes: WITS (World Bank), TARIC (UE), Local tariff data (14 países), fallback

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Load real tariff data from JSON ──
interface TariffRecord {
  Reporter: string;
  Year: number;
  Partner: string;
  Product: string;
  MFNRate: number;
  AppliedTariff: number;
  TotalTariffLines: number;
  IsTraded: string;
}

const TARIFF_DATA_URL = "https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/tariff_data.json";

let tariffCache: TariffRecord[] | null = null;

async function loadTariffData(): Promise<TariffRecord[]> {
  if (tariffCache) return tariffCache;
  try {
    const res = await fetch(TARIFF_DATA_URL, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      tariffCache = await res.json();
      return tariffCache!;
    }
  } catch {}
  return [];
}

// ── Known trade agreements (override local data) ──
const KNOWN_AGREEMENTS: Record<string, Record<string, { mfn: number; pref?: number; agreement?: string }>> = {
  "BRA": {
    "ARG": { mfn: 35, pref: 0, agreement: "Mercosul — isenção total" },
    "URY": { mfn: 35, pref: 0, agreement: "Mercosul — isenção total" },
    "PRY": { mfn: 35, pref: 0, agreement: "Mercosul — isenção total" },
    "CHN": { mfn: 35, pref: 0, agreement: "ECA Brasil-China (seletivo: soja 0%, café 0%)" },
    "USA": { mfn: 3.4, pref: 0, agreement: "GSP — café e sucos 0%, aço Section 232 +25%, média MFN 3.4%" },
    "EU":  { mfn: 0, pref: 0, agreement: "Acordo UE-Mercosul (em ratificação: 91% isenção)" },
    "TUR": { mfn: 0, pref: 0, agreement: "Acordo MERCOSUL-Turquia (industrial 0%)" },
  },
  "USA": {
    "BRA": { mfn: 0, pref: 0, agreement: "GSP / ATPA — café 0%, sucos 0%, aço Section 232 +25%" },
    "CHN": { mfn: 25, pref: 25, agreement: "Section 301 — tarifas adicionais em produtos chineses" },
    "MEX": { mfn: 0, pref: 0, agreement: "USMCA (ex-NAFTA) — isenção total" },
    "CAN": { mfn: 0, pref: 0, agreement: "USMCA — isenção total" },
  },
  "EU": {
    "BRA": { mfn: 0, pref: 0, agreement: "GSP+ / Acordo UE-Mercosul: café 0%, carne quota 0%" },
    "TUR": { mfn: 0, pref: 0, agreement: "União Aduaneira UE-Turquia — industrial 0%" },
  },
  "CHN": {
    "BRA": { mfn: 3, pref: 0, agreement: "ECA Brasil-China: soja 0%, café 0%" },
  },
  "TUR": {
    "BRA": { mfn: 0, pref: 0, agreement: "Acordo MERCOSUL-Turquia: industrial 0%" },
  },
};

// ── Country name normalization ──
const COUNTRY_MAP: Record<string, string> = {
  "argentina": "Argentina", "bolivia": "Bolivia", "chile": "Chile",
  "china": "China", "colombia": "Colombia", "united states": "United States",
  "ecuador": "Ecuador", "mexico": "Mexico", "paraguay": "Paraguay",
  "peru": "Peru", "united kingdom": "United Kingdom", "turkey": "Turkey",
  "uruguay": "Uruguay", "brazil": "Brazil", "european union": "European Union",
};

function lookupCountry(input: string): string {
  const norm = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const CODE_MAP: Record<string, string> = {
    "br": "Brazil", "bra": "Brazil",
    "us": "United States", "usa": "United States",
    "ar": "Argentina", "arg": "Argentina",
    "uy": "Uruguay", "ury": "Uruguay",
    "py": "Paraguay", "pry": "Paraguay",
    "cn": "China", "chn": "China",
    "eu": "European Union",
    "de": "Germany", "deu": "Germany",
    "mx": "Mexico", "mex": "Mexico",
    "tr": "Turkey", "tur": "Turkey",
    "jp": "Japan", "jpn": "Japan",
    "kr": "South Korea", "kor": "South Korea",
    "gb": "United Kingdom", "gbr": "United Kingdom",
    "cl": "Chile", "chl": "Chile",
    "co": "Colombia", "col": "Colombia",
    "pe": "Peru", "per": "Peru",
    "bo": "Bolivia", "bol": "Bolivia",
    "ec": "Ecuador", "ecu": "Ecuador",
    "ca": "Canada", "can": "Canada",
  };
  return CODE_MAP[norm] || COUNTRY_MAP[norm] || input;
}

async function fetchWitsTariff(reporter: string, partner: string, hs6: string, year = 2024) {
  const endpoints = [
    `https://wits.worldbank.org/API/V1/TRAITS/AHS/${reporter}/${year}/${partner}/${hs6}.json`,
    `https://wits.worldbank.org/API/V1/TRAITS/MFN/${reporter}/${year}/${partner}/${hs6}.json`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data && data.TariffLine) return data;
      }
    } catch {}
  }
  return null;
}

function searchLocalTariffs(tariffs: TariffRecord[], reporter: string, partner: string, hs6?: string) {
  // Try forward direction first (Reporter=origin, Partner=destination)
  const forwardResults = tariffs.filter(t => {
    const reporterMatch = t.Reporter === reporter || t.Reporter === lookupCountry(reporter);
    const partnerMatch = t.Partner === partner || t.Partner === lookupCountry(partner);
    return reporterMatch && partnerMatch;
  });

  // Also try reverse direction (Reporter=destination, Partner=origin)
  // The tariff_data.json has Partner=Brazil always, Reporter=the other country.
  // A tariff for USA→Brazil on product X is still relevant for Brazil→USA exports of product X.
  const reverseResults = tariffs.filter(t => {
    const reporterMatch = t.Reporter === partner || t.Reporter === lookupCountry(partner);
    const partnerMatch = t.Partner === reporter || t.Partner === lookupCountry(reporter);
    return reporterMatch && partnerMatch;
  });

  // Merge results, avoiding duplicates by Reporter+Partner+Product key
  const seen = new Set<string>();
  const results: TariffRecord[] = [];
  for (const r of [...forwardResults, ...reverseResults]) {
    const key = `${r.Reporter}|${r.Partner}|${r.Product}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(r);
    }
  }

  if (hs6) {
    const clean = hs6.replace(/\./g, "").slice(0, 6);
    const hsMatch = results.filter(r => String(r.Product).startsWith(clean));
    if (hsMatch.length > 0) return hsMatch;
  }

  return results;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { origin, destination, hs6, year = 2024 } = await req.json();

    if (!origin || !destination || !hs6) {
      return new Response(
        JSON.stringify({ error: "origin, destination, hs6 obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const originUpper = origin.toUpperCase();
    const destUpper = destination.toUpperCase();
    const hs6Clean = hs6.replace(/[^0-9]/g, "").padStart(6, "0").slice(0, 6);

    // ── Load local tariff data ──
    const tariffs = await loadTariffData();
    const localMatches = searchLocalTariffs(tariffs, lookupCountry(origin), lookupCountry(destination), hs6Clean);

    // ── Try external sources ──
    let witsData = null;
    try { witsData = await fetchWitsTariff(originUpper, destUpper, hs6Clean, year); } catch {}

    // ── Known agreements override ──
    const agreementRates = KNOWN_AGREEMENTS[originUpper]?.[destUpper] || null;

    const response: any = {
      query: { origin: originUpper, destination: destUpper, hs6: hs6Clean, year },
      sources_queried: ["WITS", "LOCAL_TARIFF_DATA", "KNOWLEDGE_BASE"],
      wits_available: !!witsData,
      local_data_available: localMatches.length > 0,
    };

    // Priority: WITS > Local data > Known agreements > Unknown
    if (witsData && witsData.TariffLine) {
      const line = Array.isArray(witsData.TariffLine) ? witsData.TariffLine[0] : witsData.TariffLine;
      response.tariff = {
        rate: line.SimpleAverage || line.Tariff || 0,
        type: "AHS",
        source: "WITS World Bank",
        notes: "Média aplicada ponderada",
      };
      if (localMatches.length > 0) {
        response.local_matches = localMatches.slice(0, 5);
      }
    } else if (localMatches.length > 0) {
      const best = localMatches.find(m => m.IsTraded === "Yes") || localMatches[0];
      response.tariff = {
        rate: best.AppliedTariff ?? best.MFNRate,
        mfn: best.MFNRate,
        pref: best.AppliedTariff,
        type: best.IsTraded === "Yes" ? "APPLIED (traded)" : "APPLIED",
        source: `TRADEXA Tariff Data — ${best.Reporter} (WITS ${best.Year})`,
        hs_description: best.Product,
        is_traded: best.IsTraded === "Yes",
        total_products_found: localMatches.length,
      };
      response.all_matches = localMatches.slice(0, 10);
    } else if (agreementRates) {
      response.tariff = {
        rate: agreementRates.pref ?? agreementRates.mfn,
        mfn: agreementRates.mfn,
        pref: agreementRates.pref,
        type: agreementRates.pref !== undefined ? "PREFERENCIAL" : "MFN",
        source: "Base de conhecimento TRADEXA",
        agreement: agreementRates.agreement,
      };
    } else {
      response.tariff = {
        rate: 0,
        type: "DESCONHECIDO",
        source: "Nenhuma fonte retornou dados",
        notes: `Sem dados para ${originUpper} → ${destUpper} com HS ${hs6Clean}.`,
      };
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});