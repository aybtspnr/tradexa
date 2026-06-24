import { useState, useEffect, useMemo } from "react";
import {
  Globe, ArrowLeftRight, Percent, DollarSign,
  Loader2, AlertTriangle, TrendingDown, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsage } from "@/hooks/use-usage";
import { useSeo } from "@/hooks/use-seo";

/* ── Types ── */
interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  tariffCount: number;
  avgTariff: number | null;
  vatRate: number | null;
}

interface TariffCountry {
  country: string;
  tariff_count: number;
}

/* ── Constants ── */
const FLAGS: Record<string, string> = {
  "Argentina": "🇦🇷", "Australia": "🇦🇺", "Bolivia, Plurinational State of": "🇧🇴",
  "Brazil": "🇧🇷", "Canada": "🇨🇦", "Chile": "🇨🇱", "China": "🇨🇳",
  "Colombia": "🇨🇴", "Ecuador": "🇪🇨", "Egypt": "🇪🇬", "European Union": "🇪🇺",
  "India": "🇮🇳", "Indonesia": "🇮🇩", "Israel": "🇮🇱", "Japan": "🇯🇵",
  "Korea, Republic of": "🇰🇷", "Mexico": "🇲🇽", "Morocco": "🇲🇦",
  "New Zealand": "🇳🇿", "Paraguay": "🇵🇾", "Peru": "🇵🇪",
  "Russian Federation": "🇷🇺", "South Africa": "🇿🇦", "Switzerland": "🇨🇭",
  "Türkiye": "🇹🇷", "United Kingdom": "🇬🇧", "United States of America": "🇺🇸",
  "Uruguay": "🇺🇾", "Viet Nam": "🇻🇳",
};

const COUNTRY_DISPLAY: Record<string, string> = {
  "Bolivia, Plurinational State of": "Bolívia",
  "Korea, Republic of": "Coreia do Sul",
  "Russian Federation": "Rússia",
  "Türkiye": "Turquia",
  "United States of America": "EUA",
  "Viet Nam": "Vietnã",
  "European Union": "União Europeia",
  "United Kingdom": "Reino Unido",
};

function displayName(name: string): string {
  return COUNTRY_DISPLAY[name] || name;
}

function flag(name: string): string {
  return FLAGS[name] || "";
}

/* ── Component ── */
export default function CountryComparison() {
  useSeo({
    title: "Comparar Países — Análise de Comércio Bilateral",
    description: "Compare dados de importação e exportação entre países. Análise bilateral de fluxos comerciais, tarifas e oportunidades de mercado.",
    keywords: "comparar países, comércio bilateral, análise países, tradexa",
  });

  const { consume } = useUsage();
  const [countries, setCountries] = useState<TariffCountry[]>([]);
  const [vatData, setVatData] = useState<any[]>([]);
  const [countryA, setCountryA] = useState<string>("");
  const [countryB, setCountryB] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Load available countries + VAT ── */
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/vps/tariffs/countries").then(r => r.ok ? r.json() : []),
      fetch("https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/world_vat_rates.json").then(r => r.ok ? r.json() : []),
    ])
      .then(async ([tariffCountries, vats]: [TariffCountry[], any[]]) => {
        await consume("search");
        if (!cancelled) {
          setCountries(tariffCountries);
          setVatData(Array.isArray(vats) ? vats : []);
          if (tariffCountries.length >= 2) {
            setCountryA(tariffCountries[0].country);
            setCountryB(tariffCountries[1].country);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Erro ao carregar dados. Verifique a conexão com o VPS.");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  /* ── Build country info ── */
  const infoA = useMemo((): CountryInfo | null => {
    if (!countryA) return null;
    const tc = countries.find(c => c.country === countryA);
    
    // Find VAT
    const vatName = countryA === "United States of America" ? "USA" :
      countryA === "United Kingdom" ? "United Kingdom" :
      countryA === "European Union" ? "European Union" :
      countryA === "Korea, Republic of" ? "South Korea" :
      countryA === "Russian Federation" ? "Russia" :
      countryA === "Bolivia, Plurinational State of" ? "Bolivia" :
      countryA === "Türkiye" ? "Turkey" :
      countryA === "Viet Nam" ? "Vietnam" : countryA;

    const vatEntry = vatData.find((v: any) =>
      v.Country?.toLowerCase() === vatName.toLowerCase()
    );
    const vatRate = vatEntry ? parseFloat(vatEntry["Standard Rate (%)"] || "0") : null;

    return {
      code: countryA,
      name: countryA,
      flag: flag(countryA),
      tariffCount: tc?.tariff_count || 0,
      avgTariff: null, // Would need per-HS lookup; simplified for now
      vatRate: vatRate && vatRate > 0 ? vatRate : null,
    };
  }, [countryA, countries, vatData]);

  const infoB = useMemo((): CountryInfo | null => {
    if (!countryB) return null;
    const tc = countries.find(c => c.country === countryB);
    
    const vatName = countryB === "United States of America" ? "USA" :
      countryB === "United Kingdom" ? "United Kingdom" :
      countryB === "European Union" ? "European Union" :
      countryB === "Korea, Republic of" ? "South Korea" :
      countryB === "Russian Federation" ? "Russia" :
      countryB === "Bolivia, Plurinational State of" ? "Bolivia" :
      countryB === "Türkiye" ? "Turkey" :
      countryB === "Viet Nam" ? "Vietnam" : countryB;

    const vatEntry = vatData.find((v: any) =>
      v.Country?.toLowerCase() === vatName.toLowerCase()
    );
    const vatRate = vatEntry ? parseFloat(vatEntry["Standard Rate (%)"] || "0") : null;

    return {
      code: countryB,
      name: countryB,
      flag: flag(countryB),
      tariffCount: tc?.tariff_count || 0,
      avgTariff: null,
      vatRate: vatRate && vatRate > 0 ? vatRate : null,
    };
  }, [countryB, countries, vatData]);

  /* ── Comparison rows ── */
  const rows = useMemo(() => {
    if (!infoA || !infoB) return [];
    return [
      {
        label: "VAT / IVA",
        valueA: infoA.vatRate ? `${infoA.vatRate}%` : "—",
        valueB: infoB.vatRate ? `${infoB.vatRate}%` : "—",
        better: infoA.vatRate && infoB.vatRate
          ? (infoA.vatRate < infoB.vatRate ? "A" : infoA.vatRate > infoB.vatRate ? "B" : null) : null,
        icon: DollarSign,
        lowerIsBetter: true,
      },
    ];
  }, [infoA, infoB]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
        <span className="ml-2 text-slate-600">Carregando países...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* ── Country Selectors ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { value: countryA, setter: setCountryA, label: "País A" },
          { value: countryB, setter: setCountryB, label: "País B" },
        ].map(({ value, setter, label }) => (
          <div key={label} className="relative">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              {label}
            </label>
            <div className="relative">
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10
                           text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]
                           transition-all cursor-pointer"
              >
                {countries.map((c) => (
                  <option key={c.country} value={c.country}>
                    {flag(c.country)} {displayName(c.country)} ({c.tariff_count.toLocaleString("pt-BR")} tarifas)
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Country Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[infoA, infoB].map((info, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl border bg-white p-6",
              i === 0 ? "border-[#D80E16]/20 ring-1 ring-[#D80E16]/10" : "border-blue-200 ring-1 ring-blue-100",
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{info?.flag || ""}</span>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {info ? displayName(info.name) : "—"}
                </h3>
                <p className="text-xs text-slate-600">
                  {info?.tariffCount ? `${info.tariffCount.toLocaleString("pt-BR")} alíquotas` : "—"}
                </p>
              </div>
            </div>
            {info && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">VAT / IVA</span>
                  <span className="font-bold text-slate-800">
                    {info.vatRate ? `${info.vatRate}%` : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-slate-600">Registros</span>
                  <span className="font-bold text-slate-800">
                    {info.tariffCount?.toLocaleString("pt-BR") || "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Comparison Table ── */}
      {infoA && infoB && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Comparativo
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4">
                {/* Country A value */}
                <div className={cn(
                  "text-right",
                  row.better === "A" && "font-black text-green-600",
                )}>
                  <p className="text-sm">{row.valueA}</p>
                </div>

                {/* Label center */}
                <div className="flex flex-col items-center text-center">
                  <row.icon className="w-4 h-4 text-slate-600 mb-1" />
                  <span className="text-[10px] font-medium text-slate-600 uppercase leading-tight">
                    {row.label}
                  </span>
                  {row.better && (
                    <span className={cn(
                      "text-[9px] font-black mt-0.5 px-1.5 py-0.5 rounded-full",
                      row.lowerIsBetter
                        ? (row.better === "A" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")
                        : (row.better === "A" ? "bg-[#D80E16]/10 text-[#D80E16]" : "bg-blue-100 text-blue-700"),
                    )}>
                      {row.lowerIsBetter ? "MENOR" : "MAIOR"}
                    </span>
                  )}
                </div>

                {/* Country B value */}
                <div className={cn(
                  "text-left",
                  row.better === "B" && "font-black text-blue-600",
                )}>
                  <p className="text-sm">{row.valueB}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
