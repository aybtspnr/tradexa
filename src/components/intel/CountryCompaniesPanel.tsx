import React, { useState, useEffect } from "react";
import { Loader2, Building2, ChevronDown, ChevronUp, Ship, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyResult {
  name: string;
  country: string;
  city?: string;
  flow: string;
  bol_count: number;
  total_records?: number;
  records_90d?: number;
  commodities: string[];
  ports: string[];
  source: string;
  score: number;
  score_label: string;
  slug?: string;
  related_br_company?: string;
  first_bol?: string;
  last_bol?: string;
}

interface CountryCompaniesResponse {
  ncm: string;
  country: string;
  country_en: string;
  flow: string;
  companies: CompanyResult[];
  total: number;
  sources: {
    bol_confirmed: number;
    ncm_classification: number;
    name_similarity: number;
  };
}

interface CountryCompaniesPanelProps {
  ncm: string;
  country: string;
  flow: "import" | "export";
}

export function CountryCompaniesPanel({ ncm, country, flow }: CountryCompaniesPanelProps) {
  const [data, setData] = useState<CountryCompaniesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(`/api/intel/ncm/${ncm}/companies-by-country?country=${encodeURIComponent(country)}&flow=${flow}&limit=15`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [ncm, country, flow]);

  if (loading) {
    return (
      <div className="ml-6 pl-4 border-l-2 border-slate-200 py-2 flex items-center gap-2 text-xs text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Buscando empresas em {country}...
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-6 pl-4 border-l-2 border-red-200 py-2 text-xs text-red-500">
        {error}
      </div>
    );
  }

  if (!data || data.companies.length === 0) {
    return (
      <div className="ml-6 pl-4 border-l-2 border-slate-200 py-2 text-xs text-slate-400">
        Nenhuma empresa encontrada em {country} para este NCM.
      </div>
    );
  }

  const fmtKg = (kg: number | null) => {
    if (!kg) return "-";
    if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)}K t`;
    if (kg >= 1_000) return `${(kg / 1_000).toFixed(0)}K kg`;
    return `${kg.toFixed(0)} kg`;
  };

  return (
    <div className="ml-6 pl-4 border-l-2 border-[#2563EB]/30 py-2 space-y-1.5">
      {/* Source summary */}
      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
        <Building2 className="h-3 w-3" />
        <span>{data.total} empresas</span>
        {data.sources.bol_confirmed > 0 && (
          <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
            {data.sources.bol_confirmed} confirmadas
          </span>
        )}
        {data.sources.ncm_classification > 0 && (
          <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
            {data.sources.ncm_classification} prováveis
          </span>
        )}
        {data.sources.name_similarity > 0 && (
          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
            {data.sources.name_similarity} similares
          </span>
        )}
      </div>

      {data.companies.map((company, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div
            className="flex items-center gap-2 p-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
          >
            {/* Score badge */}
            <div className={cn(
              "w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
              company.score >= 70 ? "bg-emerald-100 text-emerald-700" :
              company.score >= 50 ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-500"
            )}>
              {company.score}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{company.name}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "text-[9px] px-1 rounded font-medium",
                  company.source === "bol_confirmed" ? "bg-emerald-50 text-emerald-600" :
                  company.source === "ncm_classification" ? "bg-amber-50 text-amber-600" :
                  "bg-slate-50 text-slate-500"
                )}>
                  {company.score_label}
                </span>
                {company.city && (
                  <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                    <MapPin className="h-2 w-2" />{company.city}
                  </span>
                )}
                {company.bol_count > 0 && (
                  <span className="text-[9px] text-slate-400">{company.bol_count} BOLs</span>
                )}
              </div>
            </div>

            {company.commodities.length > 0 && (
              <span className="hidden md:block text-[9px] text-slate-400 max-w-[180px] truncate">
                {company.commodities[0]}
              </span>
            )}

            {company.bol_count > 0 && (expandedIdx === i ? (
              <ChevronUp className="h-3.5 w-3.5 text-[#D80E16] shrink-0" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            ))}
          </div>

          {/* Expanded: commodity details */}
          {expandedIdx === i && company.commodities.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50 p-2.5 space-y-1">
              {company.first_bol && company.last_bol && (
                <div className="text-[9px] text-slate-400">
                  Embarques: {company.first_bol} → {company.last_bol}
                </div>
              )}
              {company.commodities.map((comm, k) => (
                <div key={k} className="text-[10px] text-slate-600 bg-white rounded px-2 py-1 border border-slate-100">
                  {comm}
                </div>
              ))}
              {company.ports.length > 0 && (
                <div className="text-[9px] text-slate-400 mt-1">
                  <Ship className="h-2.5 w-2.5 inline mr-1" />
                  {company.ports.join(" · ")}
                </div>
              )}
              {company.related_br_company && (
                <div className="text-[9px] text-slate-500 mt-1 italic">
                  Relacionada: {company.related_br_company}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
