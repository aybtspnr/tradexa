"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, AlertCircle, CheckCircle2, Loader2, Zap, Trophy, TrendingUp, Globe, ArrowRight, Database, XCircle, Lightbulb, PackageSearch, Ban } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { PremiumButton, PageTransition } from "@/components/premium";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useUsage } from "@/hooks/use-usage";
import { calculateCost } from "@/lib/usage-costs";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";

interface AiNcmSuggestion {
  ncm: string;
  descricao_ncm: string;
  justificativa: string;
  confianca: "alta" | "media" | "baixa";
  cadastrado: boolean;
  ii?: number | null;
  ipi?: number | null;
  pis?: number | null;
  cofins?: number | null;
  explicacao?: string | null;
  exemplos?: string[];
  nao_inclui?: string | null;
}

const ICMS_RATES: Record<string, number> = {
  "AC": 19, "AL": 19, "AP": 18, "AM": 20, "BA": 20.5,
  "CE": 20, "DF": 20, "ES": 17, "GO": 19, "MA": 22,
  "MT": 17, "MS": 17, "MG": 18, "PA": 19, "PB": 20,
  "PR": 19.5, "PE": 20.5, "PI": 21, "RJ": 20, "RN": 20,
  "RO": 19.5, "RR": 20, "RS": 17, "SC": 17, "SE": 19,
  "SP": 18, "TO": 20
};

const formatNcmCode = (code: string): string => {
  const digits = (code || '').replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  }
  return code;
};

const AiSearch = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { usage, loading: usageLoading, consume, consumePercent, consumeAiQuery, percentUsed, isAtLimit, plan } = useUsage();
  
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    sugestoes: AiNcmSuggestion[];
    confianca_geral?: "alta" | "media" | "baixa";
    total_sugestoes?: number;
    cadastrados_no_banco?: number;
  } | null>(null);
  const [selectedNcm, setSelectedNcm] = useState<AiNcmSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [descricao, setDescricao] = useState("");
  const [ncmCount, setNcmCount] = useState<number | null>(null);
  const [explicandoNcm, setExplicandoNcm] = useState<string | null>(null); // ncm sendo explicado
  const [explicacoesMap, setExplicacoesMap] = useState<Record<string, any>>({});

  // Cost per NCM detail click by plan
  const detailCost = plan === "business" ? 0 : plan === "growth" ? 2 : 5;

  // SEO hook must be called unconditionally at the top level
  useSeo({
    title: "Classificador IA de NCM e HS Codes",
    description: "Classificação automática de NCM e HS codes com inteligência artificial. Descubra os códigos tarifários corretos para seus produtos em segundos.",
    keywords: "classificação NCM IA, NCM automático, HS code AI, classificador mercadoria",
  });

  // Add noindex for search pages (dynamic content)
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    const checkNcms = async () => {
      const { count } = await supabase
        .from("ncms")
        .select("*", { count: "exact", head: true });
      setNcmCount(count || 0);
    };
    checkNcms();
  }, []);

  const handleAiSearch = async () => {
    if (!descricao.trim()) {
      showError("Por favor, descreva o produto.");
      return;
    }
    setLoading(true);
    setError(null);
    setSearchResult(null);
    setSelectedNcm(null);
    setSelectedState("");

    try {
      const wordCount = descricao.trim().split(/\s+/).length;
      // Consumo via sistema de tanque (consumeAiQuery já gerencia limite de 2 p/ Essential)
      const consumed = await consumeAiQuery();
      if (!consumed) {
        showError("Limite de uso atingido.");
        setLoading(false);
        return;
      }

      const { data, error: funcError } = await supabase.functions.invoke('ai-ncm-search', {
        body: { descricao: descricao }
      });

      if (funcError) throw new Error(funcError.message || "Erro na comunicação com o servidor");
      if (!data) throw new Error("Resposta vazia do servidor");
      if (data.error) throw new Error(data.error);

      if (data.sugestoes && Array.isArray(data.sugestoes) && data.sugestoes.length > 0) {
        setSearchResult(data);
        const firstValid = data.sugestoes.find((s: AiNcmSuggestion) => s.cadastrado) || data.sugestoes[0];
        setSelectedNcm(firstValid);
        showSuccess(`${data.cadastrados_no_banco || 0} de ${data.total_sugestoes || data.sugestoes.length} NCMs encontrados na base!`);
      } else {
        throw new Error("A IA não retornou sugestões válidas. Verifique se há NCMs importados na base.");
      }
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao processar a consulta.";
      setError(errorMsg);
      showError("Erro na classificação: " + errorMsg);
      
      if (true) {
        try {
          await supabase.from("user_usage").update({ 
            used_percent: Math.max(0, (usage?.used_percent || 0) - calculateCost("ai_query", { wordCount: descricao.trim().split(/\s+/).length }))
          }).eq("user_id", profile?.id);
        } catch (refundErr) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExplicarNcm = async (sug: AiNcmSuggestion, index: number) => {
    // Seleciona o NCM (mostra alíquotas)
    setSelectedNcm(sug);
    setSelectedState("");

    // Se já tem explicação em cache, usa direto
    if (explicacoesMap[sug.ncm]) {
      setSelectedNcm({ ...sug, ...explicacoesMap[sug.ncm] });
      return;
    }

    // Consome % do plano silenciosamente
    const ok = await consumePercent(detailCost);
    if (!ok) return;

    setExplicandoNcm(sug.ncm);
    try {
      const { data, error: funcError } = await supabase.functions.invoke('ai-ncm-search', {
        body: { explicar_ncm: sug.ncm }
      });

      if (funcError || !data || data.error) {
        throw new Error(data?.error || "Erro ao carregar explicação");
      }

      // Salva no cache e atualiza selectedNcm
      const explData = { explicacao: data.explicacao, exemplos: data.exemplos, nao_inclui: data.nao_inclui };
      setExplicacoesMap(prev => ({ ...prev, [sug.ncm]: explData }));
      setSelectedNcm(prev => prev?.ncm === sug.ncm ? { ...prev, ...explData } : prev);
    } catch (err: any) {
      showError(err.message || "Erro ao carregar explicação");
    } finally {
      setExplicandoNcm(null);
    }
  };



  const handleNewSearch = () => {
    setSearchResult(null);
    setSelectedNcm(null);
    setError(null);
    setDescricao("");
    setSelectedState("");
  };

  const calculateTotalTax = () => {
    if (!selectedNcm) return 0;

    // Alíquotas percentuais do NCM (ex: 15 = 15%)
    const iiRate = (selectedNcm.ii || 0) / 100;
    const ipiRate = (selectedNcm.ipi || 0) / 100;
    const pisRate = (selectedNcm.pis || 0) / 100;
    // COFINS de importação é 10,25%
    const cofinsRate = 10.25 / 100;
    const icmsRate = selectedState ? (ICMS_RATES[selectedState] || 0) / 100 : 0;

    // Base CIF = 100 para cálculo da carga tributária efetiva percentual
    const base = 100;

    // 1. II sobre o CIF
    const ii = base * iiRate;

    // 2. IPI sobre (CIF + II)
    const baseIPI = base + ii;
    const ipi = baseIPI * ipiRate;

    // 3. PIS/COFINS sobre (CIF + II + IPI)
    const basePISCOFINS = base + ii + ipi;
    const pis = basePISCOFINS * pisRate;
    const cofins = basePISCOFINS * cofinsRate;

    // 4. ICMS = (CIF + II + IPI + PIS + COFINS) / (1 - ICMS_RATE) - baseICMS
    const baseICMS = base + ii + ipi + pis + cofins;
    const icms = icmsRate > 0 ? (baseICMS / (1 - icmsRate)) - baseICMS : 0;

    // Valor total de impostos sobre a base de 100
    const totalTaxValue = ii + ipi + pis + cofins + icms;

    // Retorna a taxa efetiva total percentual
    return (totalTaxValue / base) * 100;
  };

  const formatTaxRate = (rate?: number | null): string => {
    if (rate === undefined || rate === null) return "-";
    return rate.toFixed(2) + "%";
  };

  if (usageLoading) {
    return (
      
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      
    );
  }

  return (
    
      <PageTransition>
        <div className="w-full max-w-7xl mx-auto space-y-6">
          <PageHeader
            title="Classificador IA NCM"
            subtitle="Nossa IA analisa seu produto e encontra o código NCM correto em segundos."
            variant="red"
            badges={[
              { label: "IA Avançada", icon: <Sparkles className="w-3 h-3 mr-1" /> },
              { label: "NCM 8 dígitos", icon: <Trophy className="w-3 h-3 mr-1" />, className: "bg-yellow-400/90 text-yellow-900" },
            ]}
          />

          {/* Aviso sobre HS Code */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
              <CardContent className="p-4 flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-blue-800 mb-1">Código HS incluso</h3>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    O código HS é o padrão internacional de 6 dígitos. Para obter seu código HS, use os <strong>6 primeiros dígitos</strong> do NCM sugerido. 
                    <br />
                    <span className="text-blue-500">Exemplo: NCM 6106.10.00 → HS 6106.10</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {ncmCount !== null && ncmCount === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <CardContent className="p-4 flex items-center gap-3">
                  <Database className="w-6 h-6 text-white" />
                  <div className="flex-1">
                    <h3 className="font-black text-sm">Base NCM Vazia</h3>
                    <p className="text-amber-100 text-xs font-medium">
                      Nenhum código NCM encontrado na base. Importe NCMs primeiro para usar a classificação IA.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/admin/ncm")} className="bg-white text-orange-600 hover:bg-amber-50 rounded-xl font-bold h-9 text-xs">
                    Importar NCMs
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {searchResult === null ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                <CardContent className="p-6 lg:p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <motion.div 
                      className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mb-2 shadow-xl shadow-red-200"
                      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Search className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-black text-slate-900">Descrição do Produto</h2>
                    <p className="text-slate-600 font-medium">
                      Descreva seu produto para receber as 5 melhores opções de NCM
                    </p>
                  </div>
                  
                  <div className="space-y-4 max-w-3xl mx-auto">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">
                        Descrição Completa do Produto
                      </Label>
                      <div className="relative">
                        <Input 
                          placeholder="Ex: Blusa feminina de manga longa, 100% algodão, para uso casual" 
                          className="rounded-xl h-14 border-2 border-slate-200 font-medium text-base pl-4 pr-4 focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all" 
                          value={descricao} 
                          onChange={(e) => setDescricao(e.target.value)} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <PremiumButton 
                      onClick={handleAiSearch} 
                      disabled={!descricao.trim() || loading || (ncmCount === 0)} 
                      size="lg" 
                      className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 gap-2 shadow-xl shadow-red-200 h-12 px-8 disabled:opacity-50"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
                      ) : (
                        <><Search className="w-4 h-4" /> Classificar Produto</>
                      )}
                    </PremiumButton>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[9px] font-black uppercase px-3 py-1 rounded-full border">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {searchResult.cadastrados_no_banco || 0} de {searchResult.total_sugestoes || searchResult.sugestoes.length} na base
                          </Badge>
                        </div>
                        <h2 className="text-xl lg:text-2xl font-black tracking-tight mb-1">
                          TOP {searchResult.sugestoes.length} Opções de NCM
                        </h2>
                        <p className="text-slate-400 font-medium text-sm">
                          Selecione uma opção para visualizar as alíquotas
                        </p>
                      </div>
                      <Button variant="ghost" onClick={handleNewSearch} className="text-slate-400 hover:text-white rounded-xl h-9 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-xs">
                        <Search className="w-4 h-4 mr-1" /> Nova Busca
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-3">
                  <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Opções ({searchResult.sugestoes.length})
                  </h3>
                  {searchResult.sugestoes.map((sug: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                      <Card 
                        className={cn(
                          "border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg",
                          selectedNcm?.ncm === sug.ncm 
                            ? "border-red-600 bg-gradient-to-br from-red-50 to-rose-50 shadow-md p-4" 
                            : "border-slate-200 bg-white hover:border-red-300 p-3"
                        )}
                        onClick={() => handleExplicarNcm(sug, i)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <Badge className={cn(
                                "text-[7px] font-black uppercase",
                                sug.confianca === "alta" ? "bg-green-100 text-green-700" : 
                                sug.confianca === "media" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                              )}>{sug.confianca}</Badge>
                              {!sug.cadastrado && (
                                <Badge className="bg-slate-100 text-slate-600 border-none text-[7px] font-black uppercase">
                                  <XCircle className="w-3 h-3 mr-0.5" /> Não cadastrado
                                </Badge>
                              )}
                              {i === 0 && sug.cadastrado && (
                                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-none text-[7px] font-black uppercase shadow">
                                  <Trophy className="w-3 h-3 mr-0.5" /> Melhor
                                </Badge>
                              )}
                            </div>
                            <p className="text-xl font-black text-red-600 mb-0.5">{formatNcmCode(sug.ncm)}</p>
                            <p className="text-xs font-bold text-slate-600 line-clamp-2">{sug.descricao_ncm}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {explicandoNcm === sug.ncm && <Loader2 className="w-4 h-4 text-red-500 animate-spin" />}
                            {selectedNcm?.ncm === sug.ncm && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                          </div>
                        </div>
                        {/* Detalhes do NCM */}
                        {selectedNcm?.ncm === sug.ncm && selectedNcm?.explicacao && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: "auto" }} 
                            transition={{ duration: 0.3 }}
                            className="mt-3 pt-3 border-t border-red-200"
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedNcm.explicacao}</p>
                            </div>
                            {selectedNcm.exemplos && (selectedNcm.exemplos as string[]).length > 0 && (
                              <div className="flex items-start gap-2 mb-1.5">
                                <PackageSearch className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                <div className="flex flex-wrap gap-1">
                                  {(selectedNcm.exemplos as string[]).map((ex: string, j: number) => (
                                    <Badge key={j} className="bg-green-50 text-green-700 text-[9px] border-green-200">{ex}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selectedNcm.nao_inclui && (
                              <div className="flex items-start gap-2">
                                <Ban className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-red-500 leading-relaxed font-medium">{selectedNcm.nao_inclui as string}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="lg:col-span-2">
                  {selectedNcm && (
                    <div className="space-y-6">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-700 text-white">
                          <CardContent className="p-6">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NCM Selecionado</p>
                                {!selectedNcm.cadastrado && (
                                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] font-black uppercase">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Sem alíquotas na base
                                  </Badge>
                                )}
                              </div>
                              <p className="text-4xl font-black text-red-400 mb-2">
                                {formatNcmCode(selectedNcm.ncm)}
                              </p>
                              <p className="text-base text-slate-300 font-medium leading-relaxed">{selectedNcm.descricao_ncm}</p>
                              {selectedNcm.justificativa && (
                                <p className="text-sm text-slate-400 mt-2 italic">{selectedNcm.justificativa}</p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
                                <TrendingUp className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-900">Alíquotas de Importação</h3>
                                <p className="text-slate-600 font-medium text-sm">Da base oficial de NCMs</p>
                              </div>
                            </div>

                            {!selectedNcm.cadastrado ? (
                              <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-200 mb-6">
                                <div className="flex items-start gap-3">
                                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <h4 className="font-black text-amber-900 mb-1 text-sm">NCM não cadastrado na base</h4>
                                    <p className="text-xs text-amber-800 font-medium">
                                      Este código foi sugerido pela IA com base no conhecimento técnico, mas não possui alíquotas cadastradas no banco de dados. Importe a base NCM para visualizar as alíquotas.
                                    </p>
                                    <Button onClick={() => navigate("/admin/ncm")} className="mt-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold gap-2 h-9 text-xs">
                                      <Database className="w-4 h-4" /> Importar Base NCM
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                                  {[
                                    { label: "II", name: "Importação", value: selectedNcm.ii, color: "from-blue-500 to-cyan-600" },
                                    { label: "IPI", name: "IPI", value: selectedNcm.ipi, color: "from-purple-500 to-pink-600" },
                                    { label: "PIS", name: "PIS", value: selectedNcm.pis, color: "from-green-500 to-blue-600" },
                                    { label: "COFINS", name: "COFINS", value: 10.25, color: "from-orange-500 to-red-600" },
                                  ].map(tax => (
                                    <motion.div key={tax.label} className={"p-4 rounded-xl bg-gradient-to-br " + tax.color + " text-white shadow-lg"} whileHover={{ scale: 1.05, y: -3 }}>
                                      <p className="text-[8px] font-black uppercase tracking-widest opacity-80 mb-1">{tax.label}</p>
                                      <p className="text-[9px] font-bold opacity-70 mb-1">{tax.name}</p>
                                      <p className="text-2xl font-black">{formatTaxRate(tax.value)}</p>
                                    </motion.div>
                                  ))}
                                </div>

                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 mb-6 border-2 border-slate-200">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-5 h-5 text-slate-600" />
                                    <div>
                                      <h4 className="font-black text-slate-900 text-base">ICMS Estadual</h4>
                                      <p className="text-xs text-slate-600 font-medium">Selecione o estado</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="flex-1 rounded-xl h-10 bg-white border-2 border-slate-200 text-sm px-3 font-medium">
                                      <option value="">Selecione o Estado</option>
                                      {Object.entries(ICMS_RATES).map(([state, rate]) => (
                                        <option key={state} value={state}>{state} - {rate}%</option>
                                      ))}
                                    </select>
                                    {selectedState && <Badge className="bg-green-100 text-green-700 border-none text-xs font-bold">{ICMS_RATES[selectedState]}% ICMS</Badge>}
                                  </div>
                                </div>

                                <motion.div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 text-white" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                      <p className="text-3xl font-black text-red-400">{formatTaxRate(calculateTotalTax())}</p>
                                    </div>
                                    <TrendingUp className="w-16 h-16 text-green-500 opacity-20" />
                                  </div>
                                </motion.div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>


                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-100">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-black text-red-900 mb-1 text-base">Erro</h4>
                      <p className="text-sm text-red-700 font-medium mb-3">{error}</p>
                      {error.includes("Base NCM vazia") || error.includes("Nenhum NCM") ? (
                        <Button onClick={() => navigate("/admin/ncm")} className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold h-9 px-4 gap-2 text-xs">
                          <Database className="w-4 h-4" /> Ir para Importação de NCMs
                        </Button>
                      ) : (
                        <Button onClick={handleNewSearch} variant="outline" className="rounded-xl border-2 border-red-200 text-red-700 hover:bg-red-100 font-bold h-9 px-4 text-xs">
                          Tentar Novamente
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    
  );
};

export default AiSearch;