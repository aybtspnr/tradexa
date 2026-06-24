import { cn } from "@/lib/utils";
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, MapPin, TrendingUp, Package, ChevronLeft, Building2,
  Factory, Award, ArrowRight, Globe, BarChart3, Sparkles, Ship, Plane, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { TrxaButton, TrxaCard, TrxaKpi } from "@/components/premium";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const UF_OPTIONS = [
  { code: "AC", name: "Acre" }, { code: "AL", name: "Alagoas" }, { code: "AM", name: "Amazonas" },
  { code: "AP", name: "Amapá" }, { code: "BA", name: "Bahia" }, { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" }, { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" }, { code: "MA", name: "Maranhão" }, { code: "MG", name: "Minas Gerais" },
  { code: "MS", name: "Mato Grosso do Sul" }, { code: "MT", name: "Mato Grosso" },
  { code: "PA", name: "Pará" }, { code: "PB", name: "Paraíba" }, { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" }, { code: "PR", name: "Paraná" }, { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" }, { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" }, { code: "RS", name: "Rio Grande do Sul" },
  { code: "SC", name: "Santa Catarina" }, { code: "SE", name: "Sergipe" },
  { code: "SP", name: "São Paulo" }, { code: "TO", name: "Tocantins" },
];

interface CityRecord {
  mun_nome: string;
  uf: string;
  fob_total: number;
  kg_total: number;
  envios: number;
  top_paises: { pais: string; fob: number }[];
  top_ncms: { ncm: string; descricao: string; fob: number }[];
}

interface CompanyGuess {
  nome: string;
  cidade: string;
  uf: string;
  segmento: string;
  porte: string;
  confianca: number;
}

interface CityDetail {
  top_paises: { pais: string; fob: number; kg: number }[];
  top_ncms: { ncm: string; fob: number; kg: number }[];
  via_stats: { via: string; fob: number }[];
  total_fob: number;
  total_kg: number;
  envios: number;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

export default function CitySearch() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tipo, setTipo] = useState<"EXP" | "IMP">("EXP");
  const [selectedUf, setSelectedUf] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<CityRecord[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityRecord | null>(null);
  const [selectedNcm, setSelectedNcm] = useState<string | null>(null);
  const [ncmGuesses, setNcmGuesses] = useState<CompanyGuess[]>([]);
  const [ncmGuessing, setNcmGuessing] = useState(false);
  const [cityDetail, setCityDetail] = useState<CityDetail | null>(null);
  const [guesses, setGuesses] = useState<CompanyGuess[]>([]);
  const [guessing, setGuessing] = useState(false);

  // Step 2: fetch cities from edge function
  const fetchCities = useCallback(async () => {
    if (!selectedUf) return;
    setLoading(true);
    try {
      const fn = tipo === "EXP" ? "export-data" : "import-data";
      const { data, error } = await supabase.functions.invoke(fn, {
        body: { tipo, modo: "dados", uf: selectedUf, ncm: "", pais: "", via: "", anoDe: "2025", anoAte: "2025", mesDe: "10", mesAte: "12" },
      });
      if (error) throw error;

      // Aggregate municipios from all records
      const cityMap = new Map<string, CityRecord>();
      for (const r of data?.registros || []) {
        const municipios = r.municipios || [];
        for (const m of municipios) {
          const key = `${m.mun_nome}|${r.sg_uf}`;
          const existing = cityMap.get(key);
          if (existing) {
            existing.fob_total += m.vl_fob || 0;
            existing.kg_total += m.kg_liquido || 0;
            existing.envios += 1;
          } else {
            cityMap.set(key, {
              mun_nome: m.mun_nome,
              uf: r.sg_uf,
              fob_total: m.vl_fob || 0,
              kg_total: m.kg_liquido || 0,
              envios: 1,
              top_paises: [],
              top_ncms: [],
            });
          }
        }
      }

      let list = Array.from(cityMap.values()).sort((a, b) => b.fob_total - a.fob_total);
      setCities(list);
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
        showError("Servidor temporariamente ocupado. Tente novamente em alguns segundos.");
      } else {
        showError(msg || "Erro ao carregar cidades");
      }
    } finally {
      setLoading(false);
    }
  }, [selectedUf, tipo]);

  useEffect(() => {
    if (step === 2) fetchCities();
  }, [step, fetchCities]);

  // Step 3: fetch REAL data for this city + guess companies using real NCMs
  async function loadCityDetail(city: CityRecord) {
    setSelectedCity(city);
    setStep(3);
    setGuessing(true);
    setCityDetail(null);
    setGuesses([]);

    try {
      const fn = tipo === "EXP" ? "export-data" : "import-data";
      // Fetch data for this UF to extract city-specific metrics
      const { data, error } = await supabase.functions.invoke(fn, {
        body: {
          tipo,
          modo: "dados",
          uf: city.uf,
          ncm: "",
          pais: "",
          via: "",
          anoDe: "2025",
          anoAte: "2025",
          mesDe: "10",
          mesAte: "12",
        },
      });
      if (error) throw error;

      // Extract records matching this city
      const cityLower = city.mun_nome.toLowerCase();
      const cityRecords = (data?.registros || []).filter((r: any) => {
        const municipios = r.municipios || [];
        return municipios.some((m: any) =>
          m.mun_nome?.toLowerCase().includes(cityLower) ||
          cityLower.includes(m.mun_nome?.toLowerCase())
        );
      });

      // Build real city detail from API data
      const paisMap = new Map<string, { fob: number; kg: number }>();
      const ncmMap = new Map<string, { fob: number; kg: number }>();
      const viaMap = new Map<string, number>();
      let totalFob = 0;
      let totalKg = 0;
      let envios = 0;

      for (const r of cityRecords) {
        totalFob += r.vl_fob || 0;
        totalKg += r.kg_liquido || 0;
        envios += 1;

        // Aggregate by country
        const pais = r.pais_nome || "Desconhecido";
        const existingPais = paisMap.get(pais) || { fob: 0, kg: 0 };
        existingPais.fob += r.vl_fob || 0;
        existingPais.kg += r.kg_liquido || 0;
        paisMap.set(pais, existingPais);

        // Aggregate by NCM (from SH4 heading if available, else from records)
        const ncm = r.co_ncm || r.heading || "N/A";
        const existingNcm = ncmMap.get(ncm) || { fob: 0, kg: 0 };
        existingNcm.fob += r.vl_fob || 0;
        existingNcm.kg += r.kg_liquido || 0;
        ncmMap.set(ncm, existingNcm);

        // Via
        const via = r.via_nome || "Não declarada";
        viaMap.set(via, (viaMap.get(via) || 0) + (r.vl_fob || 0));
      }

      // If no records matched, fall back to using the original city data
      if (cityRecords.length === 0) {
        totalFob = city.fob_total;
        totalKg = city.kg_total;
        envios = city.envios;
      }

      const topPaises = Array.from(paisMap.entries())
        .sort((a, b) => b[1].fob - a[1].fob)
        .slice(0, 5)
        .map(([pais, v]) => ({ pais, fob: v.fob, kg: v.kg }));

      const topNcms = Array.from(ncmMap.entries())
        .sort((a, b) => b[1].fob - a[1].fob)
        .slice(0, 5)
        .map(([ncm, v]) => ({ ncm, fob: v.fob, kg: v.kg }));

      const viaStats = Array.from(viaMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([via, fob]) => ({ via, fob }));

      setCityDetail({
        top_paises: topPaises,
        top_ncms: topNcms,
        via_stats: viaStats,
        total_fob: totalFob,
        total_kg: totalKg,
        envios,
      });

      // Now guess companies using the TOP NCM from this city (real data!)
      const topNcm = topNcms[0]?.ncm || city.top_ncms?.[0]?.ncm || "8482";

      const { data: guessData, error: guessError } = await supabase.functions.invoke(fn, {
        body: {
          tipo,
          modo: "buscar_cnpjs",
          ncm: topNcm.replace(/\D/g, "").substring(0, 4),
          uf: city.uf,
          pais: "",
          via: "",
          anoDe: "2025",
          anoAte: "2025",
          mesDe: "10",
          mesAte: "12",
        },
      });
      if (guessError) throw guessError;

      // Filter companies matching this city
      const cityNameLower = city.mun_nome.toLowerCase();
      const empresas = (guessData?.empresas || [])
        .filter((e: any) =>
          e.cidade?.toLowerCase().includes(cityNameLower) ||
          cityNameLower.includes(e.cidade?.toLowerCase())
        )
        .map((e: any) => ({
          nome: e.nome,
          cidade: e.cidade,
          uf: e.cidade?.split("-")?.[1]?.trim() || city.uf,
          segmento: e.segmento || "Não informado",
          porte: e.porte || "médio",
          confianca: e.fonte ? 0.85 : 0.6,
        }));
      setGuesses(empresas);
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
        showError("Servidor temporariamente ocupado. Tente novamente em alguns segundos.");
      } else {
        showError(msg || "Erro ao carregar detalhes da cidade");
      }
    } finally {
      setGuessing(false);
    }
  }

  // Step 4: select NCM to filter companies
  async function selectNcmAndSearch(ncm: string) {
    if (!selectedCity || !cityDetail) return;
    setSelectedNcm(ncm);
    setNcmGuessing(true);
    setNcmGuesses([]);

    try {
      const fn = tipo === "EXP" ? "export-data" : "import-data";
      const { data, error } = await supabase.functions.invoke(fn, {
        body: {
          tipo,
          modo: "buscar_cnpjs",
          ncm: ncm.replace(/\D/g, "").substring(0, 4),
          uf: selectedCity.uf,
          pais: "",
          via: "",
          anoDe: "2025",
          anoAte: "2025",
          mesDe: "10",
          mesAte: "12",
        },
      });
      if (error) throw error;

      const cityNameLower = selectedCity.mun_nome.toLowerCase();
      const empresas = (data?.empresas || [])
        .filter((e: any) =>
          e.cidade?.toLowerCase().includes(cityNameLower) ||
          cityNameLower.includes(e.cidade?.toLowerCase())
        )
        .map((e: any) => ({
          nome: e.nome,
          cidade: e.cidade,
          uf: e.cidade?.split("-")?.[1]?.trim() || selectedCity.uf,
          segmento: e.segmento || "Não informado",
          porte: e.porte || "médio",
          confianca: e.fonte ? 0.9 : 0.7,
        }));
      setNcmGuesses(empresas);
    } catch (e: any) {
      showError(e.message || "Erro ao buscar empresas por NCM");
    } finally {
      setNcmGuessing(false);
    }
  }
  const filteredCities = cities.filter(c =>
    c.mun_nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    
      <div className="space-y-6">
        {/* Progress stepper */}
        <div className="flex items-center gap-3 mb-4">
          {[
            { n: 1, label: "Estado" },
            { n: 2, label: "Cidade" },
            { n: 3, label: "Empresas" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                step >= s.n ? "bg-[#D80E16] text-white" : "bg-slate-200 text-slate-600"
              )}>
                {s.n}
              </div>
              <span className={cn("text-xs font-bold hidden sm:inline", step >= s.n ? "text-[#222222]" : "text-slate-600")}>{s.label}</span>
              {i < 2 && <ArrowRight className="w-4 h-4 text-slate-300" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <PageHeader
                title="Pesquisa por Cidade"
                subtitle="Selecione um estado brasileiro para descobrir as cidades que mais exportam ou importam."
                variant="trxa"
                badges={[{ label: "Dados Oficiais", icon: <Factory className="w-3 h-3 mr-1" /> }]}
              />

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase text-slate-600">Operação:</span>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button onClick={() => setTipo("EXP")} className={cn("px-4 py-2 text-xs font-bold uppercase transition-all", tipo === "EXP" ? "bg-[#D80E16] text-white" : "bg-white text-slate-600")}>Exportação</button>
                  <button onClick={() => setTipo("IMP")} className={cn("px-4 py-2 text-xs font-bold uppercase transition-all", tipo === "IMP" ? "bg-[#2563EB] text-white" : "bg-white text-slate-600")}>Importação</button>
                </div>
              </div>

              <TrxaCard className="p-6">
                <CardContent className="p-0 space-y-4">
                  <p className="text-sm font-medium text-slate-600">Escolha o estado para listar as cidades com movimentação de {tipo === "EXP" ? "exportação" : "importação"}:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {UF_OPTIONS.map((uf) => (
                      <button
                        key={uf.code}
                        onClick={() => { setSelectedUf(uf.code); setStep(2); }}
                        className={cn(
                          "p-4 rounded-xl border-2 text-center transition-all hover:shadow-md",
                          selectedUf === uf.code
                            ? "border-[#D80E16] bg-[#D80E16]/5 text-[#D80E16]"
                            : "border-slate-100 hover:border-slate-300 bg-white"
                        )}
                      >
                        <span className="text-lg font-black">{uf.code}</span>
                        <p className="text-[10px] font-medium text-slate-600 mt-1">{uf.name}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </TrxaCard>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
                <Badge className="bg-[#D80E16]/10 text-[#D80E16]">{UF_OPTIONS.find(u => u.code === selectedUf)?.name} — {tipo === "EXP" ? "Exportação" : "Importação"}</Badge>
              </div>

              <PageHeader
                title={`Cidades de ${UF_OPTIONS.find(u => u.code === selectedUf)?.name}`}
                subtitle={`${cities.length} cidades com movimentação identificada`}
                variant={tipo === "EXP" ? "red" : "blue"}
              />

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cidade..."
                  className="pl-12 h-12 rounded-xl border-2 text-base"
                />
              </div>

              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-600 mr-3" />
                  <span className="text-slate-600 font-medium">Carregando cidades...</span>
                </div>
              )}

              {!loading && filteredCities.length === 0 && (
                <Card className="p-12 text-center">
                  <MapPin className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-lg font-bold text-slate-700">Nenhuma cidade encontrada</p>
                  <p className="text-sm text-slate-600 mt-1">Tente outro estado ou verifique os filtros.</p>
                </Card>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCities.map((city, idx) => (
                  <motion.div
                    key={`${city.mun_nome}-${city.uf}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <TrxaCard hover className="cursor-pointer" onClick={() => loadCityDetail(city)}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-[#D80E16]/10 text-[#D80E16] text-[10px] font-black">#{idx + 1}</Badge>
                              <h3 className="text-lg font-bold text-[#222222] truncate">{city.mun_nome}</h3>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-emerald-500" /> {formatCurrency(city.fob_total)}</span>
                              <span className="flex items-center gap-1"><Package className="w-4 h-4 text-amber-500" /> {formatNumber(city.kg_total)} kg</span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-300 shrink-0" />
                        </div>
                      </CardContent>
                    </TrxaCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && selectedCity && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Voltar às cidades
                </Button>
              </div>

              <PageHeader
                title={selectedCity.mun_nome}
                subtitle={`${selectedCity.uf} — ${tipo === "EXP" ? "Exportação" : "Importação"} identificada`}
                variant="trxa"
                badges={[
                  { label: formatCurrency(cityDetail?.total_fob || selectedCity.fob_total), icon: <TrendingUp className="w-3 h-3 mr-1" />, className: "bg-emerald-500/90 text-white" },
                  { label: `${cityDetail?.envios || selectedCity.envios} envios` },
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TrxaKpi label="Valor Total" value={formatCurrency(cityDetail?.total_fob || selectedCity.fob_total)} />
                <TrxaKpi label="Peso Total" value={`${formatNumber(cityDetail?.total_kg || selectedCity.kg_total)} kg`} />
                <TrxaKpi label="Envios" value={String(cityDetail?.envios || selectedCity.envios)} />
              </div>

              {/* Real Data from API — Top Countries */}
              {cityDetail && cityDetail.top_paises.length > 0 && (
                <TrxaCard className="p-6">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#D80E16]" />
                      Top Países — Dados Reais
                    </h3>
                    <div className="space-y-3">
                      {cityDetail.top_paises.map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#D80E16]/10 flex items-center justify-center text-[#D80E16] font-bold text-sm">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm">{p.pais}</p>
                            <p className="text-xs text-slate-600">{formatNumber(p.kg)} kg</p>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                            {formatCurrency(p.fob)}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </TrxaCard>
              )}

              {/* Real Data from API — Top NCMs */}
              {cityDetail && cityDetail.top_ncms.length > 0 && (
                <TrxaCard className="p-6">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#D80E16]" />
                      Top Produtos (NCM) — Dados Reais
                    </h3>
                    <div className="space-y-3">
                      {cityDetail.top_ncms.map((n, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedNcm === n.ncm
                              ? "border-[#D80E16] bg-[#D80E16]/5"
                              : "border-slate-100 bg-slate-50 hover:border-slate-300"
                          }`}
                          onClick={() => selectNcmAndSearch(n.ncm)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#D80E16]/10 flex items-center justify-center text-[#D80E16] font-bold text-sm">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm font-mono">{n.ncm}</p>
                            <p className="text-xs text-slate-600">{formatNumber(n.kg)} kg</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                              {formatCurrency(n.fob)}
                            </Badge>
                            <ArrowRight className={`w-4 h-4 transition-all ${selectedNcm === n.ncm ? "text-[#D80E16] -rotate-90" : "text-slate-300"}`} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </TrxaCard>
              )}

              {/* AI Company Guesses */}
              <TrxaCard className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardContent className="p-0">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D80E16]" />
                    Empresas Prováveis — IA
                  </h3>
                  <p className="text-sm text-slate-300 mb-4">
                    Com base nos produtos e volume da cidade, nossa IA sugere empresas que provavelmente {tipo === "EXP" ? "exportam" : "importam"} deste município.
                    {cityDetail?.top_ncms?.[0] && (
                      <> Usando NCM real: <span className="text-[#D80E16] font-mono font-bold">{cityDetail.top_ncms[0].ncm}</span>.</>
                    )}
                  </p>

                  {guessing && (
                    <div className="flex items-center gap-3 py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#D80E16]" />
                      <span className="text-slate-600 text-sm">Analisando padrões de comércio exterior...</span>
                    </div>
                  )}

                  {!guessing && guesses.length > 0 && (
                    <div className="space-y-3">
                      {guesses.map((g, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#D80E16]/10 flex items-center justify-center text-[#D80E16] font-bold">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm">{g.nome}</p>
                            <p className="text-xs text-white/40">{g.segmento} • {g.porte}</p>
                          </div>
                          <Badge className="bg-[#D80E16]/10 text-[#D80E16] text-[10px] font-black">
                            {Math.round(g.confianca * 100)}% match
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {!guessing && guesses.length === 0 && (
                    <div className="text-center py-8">
                      <Building2 className="w-12 h-12 text-white/20 mx-auto mb-3" />
                      <p className="text-white/50 text-sm">Nenhuma empresa identificada com alta confiança.</p>
                      <p className="text-white/30 text-xs mt-1">
                        Sugestão: busque no <a href={`https://cnpj.biz/busca/${encodeURIComponent(selectedCity.mun_nome)}`} target="_blank" rel="noopener" className="text-[#D80E16] font-bold underline">CNPJ.biz</a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </TrxaCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    
  );
}
