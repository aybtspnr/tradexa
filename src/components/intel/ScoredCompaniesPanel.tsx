import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Globe, Ship, Package, ExternalLink, ChevronDown, ChevronUp, Loader2, Building2, MapPin } from "lucide-react";
import { CountryFlag } from "@/components/intel/CountryFlag";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface ScoredCompany {
  name: string;
  slug: string;
  country: string;
  city: string;
  flow: string;
  bol_count: number;
  total_records: number;
  records_90d: number;
  records_30d: number;
  partners: string[];
  commodities: string[];
  ports: string[];
  score: number;
  score_breakdown: Record<string, number>;
  source: string;
}

interface ScoredResponse {
  ncm: string;
  companies: ScoredCompany[];
  total: number;
  sources: { bol: number; br_match: number };
}

interface BolDetail {
  run_date: string;
  master_bol: string;
  vessel: string;
  shipper: string;
  consignee: string;
  commodity: string;
  foreign_port: string;
  us_port: string;
  weight: string;
  weight_kg: number;
  quantity: string;
  container_number: string;
}

interface BolResponse {
  company: { name: string; country: string; city: string; total_records: number };
  bols: BolDetail[];
  bol_count: number;
  partners: { name: string; country: string; shared_bols: number; direction: string }[];
}

/* ═══════════════════════════════════════════
   SCORED COMPANIES PANEL
   ═══════════════════════════════════════════ */

interface ScoredCompaniesPanelProps {
  ncm: string;
  country: string;
  flow: "import" | "export";
  isOpen: boolean;
  onToggle: () => void;
}

export function ScoredCompaniesPanel({ ncm, country, flow, isOpen, onToggle }: ScoredCompaniesPanelProps) {
  const [data, setData] = useState<ScoredResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // BOL detail state
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [bolData, setBolData] = useState<Record<string, BolResponse>>({});
  const [bolLoading, setBolLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen || !ncm || !country) return;
    
    setLoading(true);
    setError(null);
    
    const apiBase = "/api/intel";
    
    fetch(`${apiBase}/ncm/${ncm}/scored-companies?country=${encodeURIComponent(country)}&flow=${flow}&limit=20`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [isOpen, ncm, country, flow]);

  const loadBolDetails = async (slug: string) => {
    if (bolData[slug]) {
      setExpandedSlug(expandedSlug === slug ? null : slug);
      return;
    }
    
    setBolLoading(prev => ({ ...prev, [slug]: true }));
    const apiBase = "/api/intel";
    
    try {
      const r = await fetch(`${apiBase}/company/${slug}/bols?limit=10`);
      const d = await r.json();
      setBolData(prev => ({ ...prev, [slug]: d }));
      setExpandedSlug(slug);
    } catch (e) {
      // ignore
    }
    setBolLoading(prev => ({ ...prev, [slug]: false }));
  };

  const fmtKg = (kg: number | null) => {
    if (!kg) return "-";
    if (kg >= 1_000_000) return `${(kg / 1_000_000).toFixed(1)}K t`;
    if (kg >= 1_000) return `${(kg / 1_000).toFixed(0)}K kg`;
    return `${kg.toFixed(0)} kg`;
  };

  if (!isOpen) return null;

  return (
    <div className="mt-3 ml-8 pl-4 border-l-2 border-[#D80E16]/20 space-y-3 py-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#D80E16]" />
          Empresas com Score Combinado
          {data && <span className="text-xs font-normal text-slate-400">({data.total} empresas)</span>}
        </h4>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando empresas...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 py-2">{error}</div>
      )}

      {data && data.companies.length === 0 && (
        <div className="text-sm text-slate-400 py-4">
          Nenhuma empresa encontrada para {country} neste NCM.
        </div>
      )}

      {data && data.companies.length > 0 && (
        <div className="space-y-2">
          {data.companies.map((company, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {/* Company header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => company.slug && loadBolDetails(company.slug)}
              >
                {/* Score badge */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  company.score >= 70 ? "bg-emerald-100 text-emerald-700" :
                  company.score >= 50 ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-500"
                )}>
                  {company.score}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800 truncate">{company.name}</span>
                    {company.country && (
                      <span className="text-[10px] text-slate-400 shrink-0">{company.country}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {company.city && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="h-2.5 w-2.5" />
                        {company.city}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {company.flow === "export" ? "Exportador" : company.flow === "import" ? "Importador" : "Ambos"}
                    </span>
                    {company.total_records > 0 && (
                      <span className="text-[10px] text-slate-400">{company.total_records} registros</span>
                    )}
                  </div>
                  {/* Score breakdown */}
                  <div className="flex items-center gap-1 mt-1">
                    {Object.entries(company.score_breakdown).map(([key, val]) => (
                      <span key={key} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                </div>

                {company.commodities.length > 0 && (
                  <span className="hidden md:block text-[10px] text-slate-500 max-w-[200px] truncate">
                    {company.commodities[0]}
                  </span>
                )}

                {company.slug && (bolLoading[company.slug] ? (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />
                ) : (
                  expandedSlug === company.slug ? (
                    <ChevronUp className="h-4 w-4 text-[#D80E16] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )
                ))}
              </div>

              {/* Expanded BOL details */}
              {expandedSlug === company.slug && bolData[company.slug] && (
                <div className="border-t border-slate-100 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Ship className="h-3 w-3" />
                    <span className="font-semibold">Bills of Lading ({bolData[company.slug].bol_count} disponíveis)</span>
                    {bolData[company.slug].company.total_records > 0 && (
                      <span className="text-slate-400">de {bolData[company.slug].company.total_records} total</span>
                    )}
                  </div>
                  
                  {bolData[company.slug].bols.slice(0, 3).map((bol, j) => (
                    <div key={j} className="bg-white border border-slate-100 rounded p-2 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">{bol.vessel || "Navio não informado"}</span>
                        <span className="text-slate-400">{bol.run_date}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                        <div>
                          <span className="text-slate-400">De:</span> {bol.foreign_port}
                        </div>
                        <div>
                          <span className="text-slate-400">Para:</span> {bol.us_port}
                        </div>
                        <div>
                          <span className="text-slate-400">Peso:</span> {fmtKg(bol.weight_kg)}
                        </div>
                        <div>
                          <span className="text-slate-400">Qtd:</span> {bol.quantity || "-"}
                        </div>
                      </div>
                      {bol.commodity && (
                        <div className="text-[10px] text-slate-500 truncate">{bol.commodity}</div>
                      )}
                    </div>
                  ))}

                  {/* Partners */}
                  {bolData[company.slug].partners.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase">Parceiros Comerciais</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bolData[company.slug].partners.map((p, k) => (
                          <span key={k} className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 rounded px-2 py-0.5">
                            {p.name} 
                            <span className="text-slate-400">({p.shared_bols} BOLs)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
