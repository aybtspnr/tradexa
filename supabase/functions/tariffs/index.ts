// supabase/functions/tariffs/index.ts
// Serve real tariff data from 14 countries (WITS-based) + VAT rates
// Allows searching by country, product, HS code

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface VatRecord {
  Country: string;
  Region: string;
  "Tax Type": string;
  "Has VAT/GST": string;
  "Standard Rate (%)": number | string;
  "Reduced Rates (%)": string;
  Notes: string;
}

let tariffCache: TariffRecord[] | null = null;
let vatCache: VatRecord[] | null = null;

const TARIFF_URL = "https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/tariff_data.json";
const VAT_URL = "https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/world_vat_rates.json";

async function loadTariffData(): Promise<TariffRecord[]> {
  if (tariffCache) return tariffCache;
  try {
    const res = await fetch(TARIFF_URL, { signal: AbortSignal.timeout(15000) });
    if (res.ok) {
      tariffCache = await res.json();
      return tariffCache!;
    }
  } catch {}
  return [];
}

async function loadVatData(): Promise<VatRecord[]> {
  if (vatCache) return vatCache;
  try {
    const res = await fetch(VAT_URL, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      vatCache = await res.json();
      return vatCache!;
    }
  } catch {}
  return [];
}

function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

const COUNTRY_MAP: Record<string, string> = {
  "argentina": "Argentina", "bolivia": "Bolivia", "chile": "Chile",
  "china": "China", "colombia": "Colombia", "usa": "United States",
  "eu": "European Union", "europe": "European Union", "europa": "European Union",
  "united states": "United States", "us": "United States", "eua": "United States",
  "equador": "Ecuador", "ecuador": "Ecuador", "mexico": "Mexico",
  "paraguay": "Paraguay", "peru": "Peru",
  "reino unido": "United Kingdom", "uk": "United Kingdom",
  "turquia": "Turkey", "turkey": "Turkey", "uruguay": "Uruguay",
  "brasil": "Brazil", "brazil": "Brazil",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action || "search";
    
    // ── Load data ──
    const [tariffs, vatRates] = await Promise.all([
      loadTariffData(),
      loadVatData(),
    ]);

    // ── SEARCH: tariff data by reporter/partner/product ──
    if (action === "search") {
      const { reporter, partner, product, hs_code, is_traded, limit = 50 } = body;
      let results = [...tariffs];

      if (reporter) {
        const norm = normalize(reporter);
        const mapped = COUNTRY_MAP[norm] || reporter;
        results = results.filter(r =>
          normalize(r.Reporter).includes(norm) || r.Reporter === mapped
        );
      }
      if (partner) {
        const norm = normalize(partner);
        results = results.filter(r =>
          normalize(r.Partner).includes(norm) || r.Partner === norm
        );
      }
      if (product) {
        const norm = normalize(product);
        results = results.filter(r => normalize(r.Product).includes(norm));
      }
      if (hs_code) {
        const hs = String(hs_code).replace(/\./g, "").slice(0, 6);
        results = results.filter(r => String(r.Product).startsWith(hs));
      }
      if (is_traded !== undefined) {
        results = results.filter(r => r.IsTraded === (is_traded ? "Yes" : "No"));
      }

      return new Response(
        JSON.stringify({
          total: results.length,
          limit,
          results: results.slice(0, limit),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── SUMMARY: aggregated tariff averages by reporter ──
    if (action === "summary") {
      const byReporter = new Map<string, { count: number; avg_mfn: number; avg_applied: number; traded_yes: number; traded_no: number }>();
      
      for (const t of tariffs) {
        const key = t.Reporter;
        if (!byReporter.has(key)) {
          byReporter.set(key, { count: 0, avg_mfn: 0, avg_applied: 0, traded_yes: 0, traded_no: 0 });
        }
        const entry = byReporter.get(key)!;
        entry.count++;
        entry.avg_mfn += Number(t.MFNRate) || 0;
        entry.avg_applied += Number(t.AppliedTariff) || 0;
        if (t.IsTraded === "Yes") entry.traded_yes++;
        else entry.traded_no++;
      }

      const results = [...byReporter.entries()].map(([reporter, data]) => ({
        reporter,
        total_products: data.count,
        avg_mfn_rate: Math.round((data.avg_mfn / data.count) * 100) / 100,
        avg_applied_rate: Math.round((data.avg_applied / data.count) * 100) / 100,
        traded_products: data.traded_yes,
        non_traded_products: data.traded_no,
      }));

      return new Response(
        JSON.stringify({ reporters: results, total_records: tariffs.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── VAT: get VAT rates by country/region ──
    if (action === "vat") {
      const { country, region } = body;
      let results = [...vatRates];

      if (country) {
        const norm = normalize(country);
        results = results.filter(r => normalize(r.Country).includes(norm));
      }
      if (region) {
        const norm = normalize(region);
        results = results.filter(r => normalize(r.Region).includes(norm));
      }

      return new Response(
        JSON.stringify({ total: results.length, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── COUNTRIES: list available reporters ──
    if (action === "countries") {
      const reporters = [...new Set(tariffs.map(t => t.Reporter))].sort();
      return new Response(
        JSON.stringify({ countries: reporters }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action. Use: search, summary, vat, countries" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});