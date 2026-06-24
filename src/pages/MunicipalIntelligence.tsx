"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, MapPin, TrendingUp, Package, Award, Factory, ChevronLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { fetchMunicipalRanking, fetchMunicipalDetail, guessCompaniesForCity, type MunicipalCity, type MunicipalDetail, type CityCompanyGuess } from "@/services/municipalService";
import { showError } from "@/utils/toast";
import { useSeo } from "@/hooks/use-seo";

const UF_OPTIONS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA",
  "MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN",
  "RO","RR","RS","SC","SE","SP","TO"
];

const SH4_CNAE: Record<string, string> = {
  "2009": "CNAE 10.3 — Sucos",
  "0901": "CNAE 10.7 — Torrefação e moagem de café",
  "1201": "CNAE 11.2 — Soja",
  "1701": "CNAE 10.7 — Açúcar",
  "2709": "CNAE 06.0 — Petróleo",
  "2710": "CNAE 19.3 — Combustíveis",
  "4703": "CNAE 21.7 — Celulose",
  "7601": "CNAE 24.4 — Alumínio",
  "7202": "CNAE 24.1 — Siderurgia",
  "0201": "CNAE 10.1 — Carnes",
  "0207": "CNAE 10.1 — Carnes",
  "3004": "CNAE 21.2 — Medicamentos",
  "3901": "CNAE 20.1 — Química",
  "9403": "CNAE 31.0 — Móveis",
  "8415": "CNAE 28.2 — Máquinas",
  "8471": "CNAE 26.2 — Eletrônicos",
  "8703": "CNAE 29.1 — Automóveis",
  "2208": "CNAE 11.0 — Bebidas",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

export default function MunicipalIntelligence() {
  const [ranking, setRanking] = useState<MunicipalCity[] | null>(null);
  const [detail, setDetail] = useState<MunicipalDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [ufFilter, setUfFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tipo, setTipo] = useState<"EXP" | "IMP">("EXP");
  const [selectedCity, setSelectedCity] = useState<MunicipalCity | null>(null);
  const [guesses, setGuesses] = useState<CityCompanyGuess[] | null>(null);
  const [guessing, setGuessing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  async function loadRanking() {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await fetchMunicipalRanking(tipo, ufFilter || undefined, 50);
      setRanking(data.cidades);
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
        showError("Servidor temporariamente ocupado. Tente novamente em alguns segundos.");
      } else {
        showError(msg || "Erro ao carregar ranking");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(city: MunicipalCity) {
    setLoading(true);
    setGuessing(true);
    setGuesses(null);
    try {
      // Busca detalhes + top NCMs reais da API
      const data = await fetchMunicipalDetail(tipo, city.mun_nome, city.uf);
      setDetail(data);
      setSelectedCity(city);

      // Usa o NCM real para adivinhar empresas (não fixo "8482")
      const realNcm = data.top_ncms?.[0] || "";

      const guessData = await guessCompaniesForCity(tipo, city.mun_nome, city.uf, realNcm);
      setGuesses(guessData.empresas);
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
        showError("Servidor temporariamente ocupado. Tente novamente em alguns segundos.");
      } else {
        showError(msg || "Erro ao carregar detalhes");
      }
    } finally {
      setLoading(false);
      setGuessing(false);
    }
  }

  const filtered = (ranking || []).filter(c =>
    (c.mun_nome || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  useSeo({
    title: "Hubs Municipais — Comércio Exterior por Cidade",
    description: "Descubra as cidades brasileiras que mais exportam e importam. Hubs comerciais por município com dados atualizados de comércio exterior.",
    keywords: "cidades exportadoras Brasil, ranking municipal comércio exterior, hubs exportação",
  });

  return (
    
      <div className="space-y-6">
        {!detail ? (
          <>
            <PageHeader
              title={`Hubs de ${tipo === "EXP" ? "Exportação" : "Importação"} — Inteligência Municipal`}
              subtitle="Ranking das cidades brasileiras que mais exportam. Selecione um estado e clique em Buscar para começar."
              variant="blue"
              badges={[
                { label: "Dados Oficiais", icon: <Factory className="w-3 h-3 mr-1" /> },
              ]}
            />

            <Card className="glass-card glow-border rounded-2xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Operação:</span>
                  <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                    <button onClick={() => { setTipo("EXP"); setRanking(null); setHasSearched(false); }} className={`px-4 py-1.5 text-xs font-bold uppercase transition-all ${tipo === "EXP" ? "bg-[#D80E16] text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>Exportação</button>
                    <button onClick={() => { setTipo("IMP"); setRanking(null); setHasSearched(false); }} className={`px-4 py-1.5 text-xs font-bold uppercase transition-all ${tipo === "IMP" ? "bg-[#2563EB] text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>Importação</button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar cidade..." className="pl-12 h-12 rounded-xl border-2" />
                  </div>
                  <select value={ufFilter} onChange={e => setUfFilter(e.target.value)} className="h-12 px-4 rounded-xl border-2 border-slate-200 bg-white font-medium">
                    <option value="">Todos os estados</option>
                    {UF_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <Button onClick={loadRanking} disabled={loading} className="h-12 px-6 bg-[#D80E16] hover:bg-[#E50716] text-white rounded-xl font-bold">
                    {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Buscar
                  </Button>
                </div>
                <p className="text-xs text-slate-600">
                  Selecione um estado (ou deixe "Todos") e clique em Buscar para carregar os municípios com dados atualizados.
                </p>
              </CardContent>
            </Card>

            {loading && !ranking && (
              <div className="flex items-center justify-center py-20 text-slate-600">
                <Loader2 className="w-8 h-8 animate-spin mr-3" /> Carregando ranking...
              </div>
            )}

            {hasSearched && !loading && filtered.length === 0 && (
              <Card className="p-12 text-center rounded-2xl">
                <MapPin className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-bold text-slate-700">Nenhuma cidade encontrada</p>
                <p className="text-sm text-slate-600 mt-1">Tente outro estado ou verifique os filtros.</p>
              </Card>
            )}

            {filtered.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((city, idx) => (
                  <motion.div key={city.co_mun || `${city.mun_nome}-${idx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card className="glass-card glow-border rounded-2xl overflow-hidden cursor-pointer hover:border-primary/40 transition-colors" onClick={() => loadDetail(city)}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className="bg-primary/10 text-primary text-[10px] font-black">#{idx + 1}</Badge>
                              <h3 className="text-lg font-bold text-slate-900 truncate">{city.mun_nome}</h3>
                              <Badge variant="outline" className="text-[10px]">{city.uf}</Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                              <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4 text-emerald-500" /> {formatCurrency(city.fob_total)}</span>
                              <span className="flex items-center gap-1"><Package className="w-4 h-4 text-amber-500" /> {formatNumber(city.kg_total)} kg</span>
                              <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-slate-600" /> {city.envios} envios</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {city.top_products.slice(0, 3).map(p => (
                                <Badge key={p.sh4} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                                  {p.descricao} ({formatCurrency(p.fob)})
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ChevronLeft className="w-5 h-5 text-slate-300 -rotate-180 shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => { setDetail(null); setSelectedCity(null); setGuesses(null); }} className="gap-2 mb-2">
              <ChevronLeft className="w-4 h-4" /> Voltar ao ranking
            </Button>

            <PageHeader
              title={detail.mun_nome}
              subtitle={`${detail.uf} — Ranking Brasil #${detail.brasil_rank} | Ranking UF #${detail.uf_rank}`}
              variant="blue"
              badges={[
                { label: formatCurrency(detail.fob_total), icon: <TrendingUp className="w-3 h-3 mr-1" />, className: "bg-emerald-500/90 text-white" },
                { label: `${detail.envios} envios` },
              ]}
            />

            <Card className="glass-card glow-border rounded-2xl">
              <CardContent className="p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Package className="w-5 h-5 text-primary" /> Produtos ({detail.total_products})</h3>
                <div className="space-y-3">
                  {detail.products.slice(0, 10).map((p, i) => (
                    <div key={`${p.sh4}-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{p.descricao}</p>
                        <p className="text-xs text-slate-600">SH4: {p.sh4} | {formatNumber(p.envios)} envios</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-emerald-600 text-sm">{formatCurrency(p.fob)}</p>
                        <p className="text-[10px] text-slate-600">{formatNumber(p.kg)} kg</p>
                      </div>
                      {SH4_CNAE[p.sh4] && (
                        <Badge className="bg-amber-100 text-amber-700 text-[10px] shrink-0">
                          <Factory className="w-3 h-3 mr-1" />{SH4_CNAE[p.sh4]}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Empresas Prováveis {tipo === "EXP" ? "Exportadoras" : "Importadoras"} {detail.top_ncms?.[0] ? `- NCM ${detail.top_ncms[0]}` : ""}</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Por questões de privacidade, CNPJs individuais não são divulgados. Nossa IA analisa os produtos e volume para sugerir empresas prováveis.
                  </p>
                  {guessing && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analisando empresas prováveis...
                    </div>
                  )}
                  {guesses && guesses.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {guesses.map((g, i) => (
                        <div key={`${g.nome}-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                          <div className="w-8 h-8 rounded-lg bg-[#D80E16]/10 flex items-center justify-center text-[#D80E16] font-bold text-sm">{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm">{g.nome}</p>
                            <p className="text-xs text-slate-600">{g.segmento} • {g.porte}</p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">{Math.round(g.confianca * 100)}% match</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {guesses && guesses.length === 0 && !guessing && (
                    <p className="text-sm text-slate-600">Nenhuma empresa identificada com alta confiança para esta cidade. Tente buscar no <a href={`https://cnpj.biz/busca/${encodeURIComponent(detail.mun_nome)}`} target="_blank" rel="noopener" className="text-primary font-bold underline">CNPJ.biz</a>.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    
  );
}
