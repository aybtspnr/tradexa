import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Globe, Ship, Building2, BarChart3, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { CountryFlag, comexToIso2 } from "./CountryFlag";
import { StateBadge } from "./StateBadge";
import { UrfIcon, getTransportLabel } from "./icons/TransportIcons";
import { cn } from "@/lib/utils";

export interface CityPortData {
  via_name: string;
  via: string;
  urf: string;
  urf_name?: string;
  kg: number;
  fob: number;
  countries?: { cod_pais: string; nome_pais: string; kg: number; fob: number }[];
}

export interface CityCountryData {
  cod_pais: string;
  nome_pais: string;
  vl_fob: number;
  kg_liquido: number;
}

export interface CityCompanyData {
  nome: string;
  score: number;
  likely_flow: string;
  cnpj?: string;
  cnpj_basico?: string;
  capital_social?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  cityName: string;
  cityUf: string;
  cityCodMun: string;
  fob: number;
  kg: number;
  ops?: number;
  avgPrice?: number;
  ncmAvgPrice?: number;
  companyCount: number;
  topCompanies: CityCompanyData[];
  countries: CityCountryData[];
  ports: CityPortData[];
  flowType: "import" | "export";
  freight?: number;
  onCountryClick?: (codPais: string) => void;
  fmtUSD: (n: number) => string;
  fmtKg: (n: number) => string;
}

type TabKey = "countries" | "ports" | "companies" | "prices";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "countries", label: "Países", icon: Globe },
  { key: "ports", label: "Portos", icon: Ship },
  { key: "companies", label: "Empresas", icon: Building2 },
  { key: "prices", label: "Preços", icon: BarChart3 },
];

export const CityDetailPanel: React.FC<Props> = ({
  open, onClose, cityName, cityUf, cityCodMun,
  fob, kg, ops, avgPrice, ncmAvgPrice,
  companyCount, topCompanies, countries, ports,
  flowType, freight, onCountryClick, fmtUSD, fmtKg,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("countries");

  const priceDiff = avgPrice && ncmAvgPrice && ncmAvgPrice > 0
    ? ((avgPrice - ncmAvgPrice) / ncmAvgPrice) * 100
    : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 hidden md:block"
            onClick={onClose}
          />

          {/* Side panel (desktop) / Bottom sheet (mobile) */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-white shadow-2xl flex flex-col",
              "inset-x-0 bottom-0 top-auto max-h-[92vh] rounded-t-2xl",
              "md:inset-y-0 md:left-auto md:right-0 md:w-[480px] md:rounded-none md:max-h-none"
            )}
          >
            {/* Drag handle — mobile only */}
            <div className="md:hidden flex justify-center pt-2.5 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#D80E16] to-[#b00c12] text-white shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <StateBadge uf={cityUf} size="md" badge />
                  <div className="min-w-0">
                    <h2 className="font-bold text-lg truncate">{cityName}</h2>
                    <p className="text-xs text-white/70">{cityUf} — {flowType === "import" ? "Importação" : "Exportação"}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                <div className="bg-white/10 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">FOB</p>
                  <p className="text-sm font-bold">{fmtUSD(fob)}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Peso</p>
                  <p className="text-sm font-bold">{fmtKg(kg)}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Ops</p>
                  <p className="text-sm font-bold">{ops || "-"}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Preço/kg</p>
                  <p className="text-sm font-bold">{avgPrice ? `$${avgPrice.toFixed(2)}` : "-"}</p>
                </div>
                <div className="bg-white/10 rounded-lg px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">Frete</p>
                  <p className="text-sm font-bold">{freight != null && freight > 0 ? fmtUSD(freight) : "-"}</p>
                </div>
              </div>
            </div>

            {/* Price diff badge */}
            {priceDiff !== null && (
              <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-3 text-xs">
                <span className="text-slate-500 font-medium">VS Média NCM:</span>
                <span className={cn("font-bold px-2 py-0.5 rounded-full",
                  priceDiff > 5 ? "bg-emerald-100 text-emerald-700" :
                  priceDiff < -5 ? "bg-red-100 text-red-700" :
                  "bg-slate-200 text-slate-600")}>
                  {priceDiff > 0 ? "▲" : "▼"} {Math.abs(priceDiff).toFixed(0)}%
                </span>
                <span className="text-slate-400">({ncmAvgPrice ? `$${ncmAvgPrice.toFixed(2)}/kg` : "-"})</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-100 shrink-0 overflow-x-auto">
              {TABS.map(tab => {
                const count = tab.key === "countries" ? countries.length :
                  tab.key === "ports" ? ports.length :
                  tab.key === "companies" ? companyCount : 0;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap min-h-[44px]",
                      activeTab === tab.key
                        ? "border-[#D80E16] text-[#D80E16]"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {count > 0 && <span className="text-[10px] text-slate-400">({count})</span>}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Countries tab */}
              {activeTab === "countries" && (
                <div className="space-y-1.5">
                  {countries.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-8">Sem dados de países para esta cidade.</p>
                  ) : (
                    countries.map((cc, i) => {
                      const ppk = cc.kg_liquido > 0 ? cc.vl_fob / cc.kg_liquido : 0;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                          onClick={() => onCountryClick?.(cc.cod_pais)}
                        >
                          <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                          <CountryFlag codPais={cc.cod_pais} nome={cc.nome_pais} size="sm" />
                          <span className="flex-1 text-sm font-medium text-slate-700 truncate">{cc.nome_pais}</span>
                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-slate-800">{fmtUSD(cc.vl_fob)}</div>
                            <div className="text-[10px] text-slate-400">{fmtKg(cc.kg_liquido)}{ppk > 0 && ` · $${ppk.toFixed(2)}/kg`}</div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Ports tab */}
              {activeTab === "ports" && (
                <div className="space-y-2">
                  {ports.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-8">Sem dados de portos para esta cidade.</p>
                  ) : (
                    ports.map((p, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                          <UrfIcon viaName={p.via_name} size={20} />
                          <span className="font-semibold text-sm text-slate-800 flex-1 truncate">{p.urf_name || p.urf}</span>
                          <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{getTransportLabel(p.via_name)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div><span className="text-slate-400">FOB:</span> <span className="font-bold text-slate-700">{fmtUSD(p.fob)}</span></div>
                          <div><span className="text-slate-400">Peso:</span> <span className="font-bold text-slate-700">{fmtKg(p.kg)}</span></div>
                        </div>
                        {p.countries && p.countries.length > 1 && (
                          <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Países atendidos</p>
                            {p.countries.filter(c => c.kg > 0).map((ct, j) => (
                              <div key={j} className="flex items-center gap-2 text-xs py-0.5">
                                <CountryFlag codPais={ct.cod_pais} nome={ct.nome_pais} size="xs" />
                                <span className="text-slate-600 flex-1 truncate">{ct.nome_pais}</span>
                                <span className="text-slate-400">{fmtKg(ct.kg)}</span>
                                <span className="font-semibold text-slate-700">{fmtUSD(ct.fob)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Companies tab */}
              {activeTab === "companies" && (
                <div className="space-y-1.5">
                  {topCompanies.length === 0 ? (
                    <p className="text-sm text-slate-400 italic text-center py-8">Sem empresas cadastradas para esta cidade.</p>
                  ) : (
                    topCompanies.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                          {c.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="flex-1 text-sm font-medium text-slate-700 truncate">{c.nome}</span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{c.score}</span>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0",
                          c.likely_flow === "import" ? "bg-blue-50 text-blue-600" :
                          c.likely_flow === "export" ? "bg-emerald-50 text-emerald-600" :
                          "bg-purple-50 text-purple-600")}>
                          {c.likely_flow === "import" ? "IMP" : c.likely_flow === "export" ? "EXP" : "AMB"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Prices tab */}
              {activeTab === "prices" && (
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Preço/kg desta cidade</p>
                    <p className="text-2xl font-black text-slate-900">{avgPrice ? `US$ ${avgPrice.toFixed(2)}` : "-"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Média do NCM</p>
                    <p className="text-2xl font-black text-slate-700">{ncmAvgPrice ? `US$ ${ncmAvgPrice.toFixed(2)}` : "-"}</p>
                  </div>
                  {priceDiff !== null && (
                    <div className={cn("rounded-lg p-4 border text-center",
                      priceDiff > 5 ? "bg-emerald-50 border-emerald-200" :
                      priceDiff < -5 ? "bg-red-50 border-red-200" :
                      "bg-slate-50 border-slate-200")}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Diferença</p>
                      <p className={cn("text-2xl font-black",
                        priceDiff > 5 ? "text-emerald-600" :
                        priceDiff < -5 ? "text-red-500" : "text-slate-600")}>
                        {priceDiff > 0 ? "▲" : "▼"} {Math.abs(priceDiff).toFixed(1)}%
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {priceDiff > 5 ? "Acima da média — preço premium" :
                         priceDiff < -5 ? "Abaixo da média — preço competitivo" :
                         "Próximo da média"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CityDetailPanel;
