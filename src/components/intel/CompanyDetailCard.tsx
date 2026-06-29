import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, MapPin, Calendar, ShieldCheck, AlertTriangle, Factory, FileText, TrendingUp, Globe, Loader2, Users } from "lucide-react";
import { CompanyLogo } from "./CompanyLogo";
import { StateBadge } from "./StateBadge";
import { UrfIcon, getTransportLabel, getTransportMode } from "./icons/TransportIcons";

export interface CompanyData {
  nome: string;
  cnae: string;
  cnae_desc: string;
  uf: string;
  municipio: string;
  nome_municipio?: string;
  capital_social?: number;
  likely_flow?: string;
  confidence_score?: number;
  confidence_label?: string;
  flow_type?: string;
  cnaes_secundarios?: string[];
  recof?: boolean;
  recof_date?: string;
  cnpj_basico?: string;
  cnpj?: string;
  razao_social?: string;
  bloco?: string;
  situacao_cadastral?: string;
  data_inicio_atividade?: string;
  estimated_fob_import?: number;
  estimated_kg_import?: number;
  estimated_fob_export?: number;
  estimated_kg_export?: number;
  price_per_kg_import?: number;
  price_per_kg_export?: number;
  city_trade?: { import_fob: number; import_kg: number; export_fob: number; export_kg: number };
  _score?: number;
  _scoreLabel?: string;
  evidence?: string[];
  telefone?: string;
  email?: string;
  endereco?: string;
}

export interface PartnerInfo {
  name: string;
  country: string;
  score: number;
  score_label: string;
  source: string;
  shared_bols: number;
  direction: string;
  evidence: string;
}

interface Props {
  company: CompanyData;
  scoreInfo: { score: number; label: string };
  tab: "import" | "export";
  cityUf: string;
  cityName: string;
  portInfo?: { via_name: string; urf_name?: string; urf: string; kg: number; fob: number } | null;
  transportMode?: { viaKey: string; label: string; pct: number | null } | null;
  showOppositeData?: boolean;
  onViewOnMap?: () => void;
  fmtUSD: (n: number) => string;
  fmtKg: (n: number) => string;
  fmtCnpj: (c: string | undefined) => string;
  ncm?: string;
  cityCountryNames?: string[];
}

// Portuguese → English country name mapping for partner filtering
const PT_TO_EN: Record<string, string> = {
  "estados unidos": "united states",
  "eua": "united states",
  "reino unido": "united kingdom",
  "argentina": "argentina",
  "venezuela": "venezuela",
  "canadá": "canada",
  "alemanha": "germany",
  "frança": "france",
  "itália": "italy",
  "espanha": "spain",
  "china": "china",
  "índia": "india",
  "japão": "japan",
  "méxico": "mexico",
  "chile": "chile",
  "colômbia": "colombia",
  "peru": "peru",
  "austrália": "australia",
  "arábia saudita": "saudi arabia",
  "emirados árabes unidos": "united arab emirates",
  "holanda": "netherlands",
  "bélgica": "belgium",
  "suíça": "switzerland",
  "suécia": "sweden",
  "noruega": "norway",
  "dinamarca": "denmark",
  "polônia": "poland",
  "portugal": "portugal",
  "rússia": "russia",
  "turquia": "turkey",
  "coreia do sul": "south korea",
  "singapura": "singapore",
  "indonésia": "indonesia",
  "taiwan": "taiwan",
  "áfrica do sul": "south africa",
  "egito": "egypt",
  "nigéria": "nigeria",
  "marrocos": "morocco",
  "argélia": "algeria",
  "jordânia": "jordan",
  "catar": "qatar",
  "kuwait": "kuwait",
  "omã": "oman",
  "barém": "bahrain",
  "vietna": "vietnam",
};

function normalizeCountry(name?: string): string {
  return (name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function partnerMatchesCity(partnerCountry: string, cityCountries: string[]): boolean {
  const pn = normalizeCountry(partnerCountry);
  return cityCountries.some(cc => {
    const cn = normalizeCountry(cc);
    if (pn === cn) return true;
    if (PT_TO_EN[cn] === pn) return true;
    // Check reversed
    for (const [pt, en] of Object.entries(PT_TO_EN)) {
      if (cn === pt && en === pn) return true;
      if (en === cn && pt === pn) return true;
    }
    return false;
  });
}

function DetailField({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className={`h-3 w-3 ${color || "text-slate-400"}`} />
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      </div>
      <div className="text-xs font-semibold text-slate-700 truncate">{value}</div>
    </div>
  );
}

export const CompanyDetailCard: React.FC<Props> = ({
  company: c, scoreInfo, tab, cityUf, cityName,
  portInfo, transportMode, showOppositeData,
  onViewOnMap, fmtUSD, fmtKg, fmtCnpj, ncm, cityCountryNames,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [partners, setPartners] = useState<PartnerInfo[] | null>(null);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState<string | null>(null);

  // Fetch partners when expanded
  useEffect(() => {
    if (!expanded || partners !== null || partnersLoading || !ncm) return;
    const companyName = c.razao_social || c.nome;
    if (!companyName) return;
    setPartnersLoading(true);
    setPartnersError(null);
    const apiBase = "/api/intel";
    fetch(`${apiBase}/ncm/${ncm}/company-partners?company_name=${encodeURIComponent(companyName)}&limit=10`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && d.partners) {
          setPartners(d.partners);
        } else {
          setPartners([]);
        }
        setPartnersLoading(false);
      })
      .catch(() => {
        setPartners([]);
        setPartnersLoading(false);
        setPartnersError("Erro ao carregar parceiros");
      });
  }, [expanded, ncm, c.razao_social, c.nome, partners, partnersLoading]);

  // Filter partners: only show those whose country matches the city's trade destinations
  const filteredPartners = useMemo(() => {
    if (!partners || !cityCountryNames || cityCountryNames.length === 0) return partners;
    return partners.filter(p => partnerMatchesCity(p.country, cityCountryNames));
  }, [partners, cityCountryNames]);

  const estFob = tab === "import" ? c.estimated_fob_import : c.estimated_fob_export;
  const estKg = tab === "import" ? c.estimated_kg_import : c.estimated_kg_export;
  const pricePerKg = tab === "import" ? c.price_per_kg_import : c.price_per_kg_export;

  return (
    <div
      className={cn(
        "group rounded-xl border transition-all duration-200 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] hover:border-slate-300 bg-white border-l-2 overflow-hidden",
        scoreInfo.label === "Alta" ? "border-l-emerald-400" : scoreInfo.label === "Media" ? "border-l-amber-400" : "border-l-slate-300",
        expanded && "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] border-slate-300"
      )}
    >
      {/* Clickable header */}
      <div
        className="flex max-md:flex-col items-start max-md:py-3 gap-3 py-2.5 px-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <CompanyLogo nome={c.nome} cnpj={c.cnpj || c.cnpj_basico} size="md" className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 truncate flex items-center gap-1.5 flex-wrap text-sm">
            {c.nome}
            <span className="inline-flex items-center justify-center text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 shrink-0 min-w-[22px]"
              title={`Confiança: ${scoreInfo.score}/100`}>
              {scoreInfo.score}
            </span>
            {c.recof && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 shrink-0">RECOF</span>
            )}
            {c.situacao_cadastral && (
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                c.situacao_cadastral === "02" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200")}>
                {c.situacao_cadastral === "02" ? "Ativa" : "Inativa"}
              </span>
            )}
            {c.likely_flow && (
              <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                c.likely_flow === "import" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                c.likely_flow === "export" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                "bg-purple-50 text-purple-600 border border-purple-200")}>
                {c.likely_flow === "import" ? "Importador" : c.likely_flow === "export" ? "Exportador" : "Ambos"}
              </span>
            )}
            <svg className={cn("h-3.5 w-3.5 text-slate-300 transition-transform ml-auto shrink-0", expanded && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]">
            <span className="text-slate-400">CNPJ:</span>
            <code className="font-mono text-slate-500">{fmtCnpj(c.cnpj || c.cnpj_basico)}</code>
            {c.nome_municipio && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-medium">{c.nome_municipio}/{c.uf}</span>
              </>
            )}
            {c.capital_social ? (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">Capital:</span>
                <span className="text-emerald-600 font-semibold">R$ {(c.capital_social / 1e6).toFixed(1)}M</span>
              </>
            ) : null}
            {pricePerKg ? (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">Preço:</span>
                <span className="text-purple-600 font-semibold">US$ {pricePerKg.toFixed(2)}/kg</span>
              </>
            ) : null}
            {estFob ? (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-400">FOB Est.:</span>
                <span className="text-slate-500 font-mono">{fmtUSD(estFob)}</span>
              </>
            ) : null}
          </div>
          {/* Port/transport info */}
          {portInfo ? (
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
              <UrfIcon viaName={portInfo.via_name} size={14} />
              <span className="truncate max-w-[100px]">{portInfo.urf_name || portInfo.urf}</span>
              <span className="text-slate-300">|</span>
              <span>{getTransportLabel(portInfo.via_name)}</span>
              <span className="text-slate-300 ml-auto font-mono">{fmtKg(portInfo.kg)}</span>
            </div>
          ) : transportMode ? (
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-400">
              <UrfIcon viaName={transportMode.viaKey} size={14} />
              <span>{transportMode.label}</span>
              {transportMode.pct != null && (
                <span className="text-slate-300 font-mono">({transportMode.pct.toFixed(0)}%)</span>
              )}
              {showOppositeData && (
                <span className="text-slate-300 ml-0.5">(dados de {tab === "import" ? "exportação" : "importação"})</span>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-100">
              {/* Detail grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                <DetailField icon={FileText} label="CNPJ" value={fmtCnpj(c.cnpj || c.cnpj_basico)} />
                <DetailField icon={Building2} label="Razão Social" value={c.razao_social || c.nome} />
                <DetailField icon={Factory} label="CNAE Principal" value={`${c.cnae} — ${c.cnae_desc || "N/I"}`} color="text-[#D80E16]" />
                {c.data_inicio_atividade && (
                  <DetailField icon={Calendar} label="Início Atividade" value={new Date(c.data_inicio_atividade).toLocaleDateString("pt-BR")} />
                )}
                {c.situacao_cadastral && (
                  <DetailField
                    icon={c.situacao_cadastral === "02" ? ShieldCheck : AlertTriangle}
                    label="Situação Cadastral"
                    value={c.situacao_cadastral === "02" ? "Ativa" : "Inativa/Baixa"}
                    color={c.situacao_cadastral === "02" ? "text-emerald-500" : "text-red-500"}
                  />
                )}
                {c.capital_social ? (
                  <DetailField icon={TrendingUp} label="Capital Social" value={`R$ ${(c.capital_social / 1e6).toFixed(2)}M`} color="text-emerald-500" />
                ) : null}
                {c.telefone && <DetailField icon={FileText} label="Telefone" value={c.telefone} />}
                {c.email && <DetailField icon={FileText} label="Email" value={c.email} />}
              </div>

              {/* Partners */}
              {ncm && (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Users className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Parceiros no Exterior
                    </span>
                    {partnersLoading && <Loader2 className="h-3 w-3 text-slate-400 animate-spin ml-1" />}
                    {filteredPartners && filteredPartners.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400 ml-auto">({filteredPartners.length})</span>
                    )}
                  </div>

                  {partnersLoading && (
                    <div className="bg-slate-50 rounded-lg p-4 text-center text-xs text-slate-400">
                      <Loader2 className="h-4 w-4 mx-auto animate-spin mb-1" />
                      Buscando parceiros...
                    </div>
                  )}

                  {partnersError && (
                    <div className="bg-red-50 rounded-lg p-3 text-[11px] text-red-600">{partnersError}</div>
                  )}

                  {filteredPartners && filteredPartners.length > 0 && (
                    <div className="space-y-1.5">
                      {filteredPartners.map((p, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 hover:border-slate-200 transition-colors">
                          <div className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0",
                            p.score >= 80 ? "bg-emerald-100 text-emerald-700" :
                            p.score >= 60 ? "bg-blue-100 text-blue-700" :
                            p.score >= 40 ? "bg-amber-100 text-amber-600" :
                            "bg-slate-100 text-slate-400"
                          )}>
                            {p.score}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-semibold text-slate-800 truncate">{p.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-400">{p.country}</span>
                              {p.shared_bols > 0 && (
                                <span className="text-[10px] text-slate-400">• {p.shared_bols} BOLs</span>
                              )}
                              {p.direction === "export" && (
                                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Exporta</span>
                              )}
                              {p.direction === "import" && (
                                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Importa</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredPartners && filteredPartners.length === 0 && !partnersLoading && partners !== null && (
                    <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-400 text-center">
                      Nenhum parceiro internacional encontrado para esta empresa neste NCM.
                    </div>
                  )}
                </div>
              )}

              {/* City trade info */}
              {c.city_trade && (
                <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Comércio da Cidade ({c.nome_municipio || cityName}/{c.uf || cityUf})
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Imp. FOB:</span><span className="font-semibold text-blue-600">{fmtUSD(c.city_trade.import_fob)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Exp. FOB:</span><span className="font-semibold text-emerald-600">{fmtUSD(c.city_trade.export_fob)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Imp. KG:</span><span className="font-semibold text-slate-600">{fmtKg(c.city_trade.import_kg)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Exp. KG:</span><span className="font-semibold text-slate-600">{fmtKg(c.city_trade.export_kg)}</span></div>
                  </div>
                </div>
              )}

              {/* RECOF info */}
              {c.recof && (
                <div className="mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">RECOF — Regime Aduaneiro Especial</h4>
                  <p className="text-xs text-emerald-700">Entreposto Industrial{c.recof_date && ` — Desde ${c.recof_date}`}</p>
                </div>
              )}

              {/* Action buttons */}
              {onViewOnMap && (
                <button
                  onClick={(e) => { e.stopPropagation(); onViewOnMap(); }}
                  className="mt-3 w-full text-xs font-bold text-[#D80E16] hover:text-[#b00c12] bg-[#D80E16]/10 hover:bg-[#D80E16]/20 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  Ver no mapa
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default CompanyDetailCard;
