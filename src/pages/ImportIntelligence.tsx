"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ImportIntelligenceLayout from "@/components/ImportIntelligenceLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassCard } from "@/components/GlassKpi";
import SearchResults from "@/components/SearchResults";
import {
  Search, Loader2, AlertCircle, Globe, Sparkles, ArrowRight, Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { showError, showSuccess } from "@/utils/toast";
import { saveSearchHistory } from "@/hooks/use-search-history";
import CompanyEstimatorPanel from "@/components/CompanyEstimatorPanel";
import BillOfLadingPanel from "@/components/BillOfLadingPanel";
import RealtimeAlerts from "@/components/RealtimeAlerts";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { AVAILABLE_YEARS } from "@/lib/utils";

interface Municipio {
  co_mun: string;
  mun_nome: string;
  kg_liquido: number;
  vl_fob: number;
}

interface Registro {
  co_ano: string;
  co_mes: string;
  mes_nome: string;
  co_pais: string;
  pais_nome: string;
  sg_uf: string;
  uf_nome: string;
  co_via: string;
  via_nome: string;
  co_urf: string;
  urf_nome: string;
  co_unid: string;
  unid_nome: string;
  qt_estat: number;
  kg_liquido: number;
  vl_fob: number;
  municipios: Municipio[];
}

interface NcmSuggestion {
  code: string;
  description: string;
}

const ANOS = [...AVAILABLE_YEARS].reverse().map(v => ({ value: v, label: v }));

const MESES = [
  { value: "_all", label: "Todos" },
  { value: "01", label: "Jan" }, { value: "02", label: "Fev" }, { value: "03", label: "Mar" },
  { value: "04", label: "Abr" }, { value: "05", label: "Mai" }, { value: "06", label: "Jun" },
  { value: "07", label: "Jul" }, { value: "08", label: "Ago" }, { value: "09", label: "Set" },
  { value: "10", label: "Out" }, { value: "11", label: "Nov" }, { value: "12", label: "Dez" },
];

const formatNcmCode = (code: string): string => {
  const digits = (code || "").replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  return code;
};

const ImportIntelligence = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ncmFromUrl = searchParams.get("ncm") || "";

  const [searchNcm, setSearchNcm] = useState(ncmFromUrl);
  const [ncmDescription, setNcmDescription] = useState("");
  const [anoDe, setAnoDe] = useState("2024");
  const [mesDe, setMesDe] = useState("01");
  const [anoAte, setAnoAte] = useState("2026");
  const [mesAte, setMesAte] = useState("12");

  const [loading, setLoading] = useState(false);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCompanies, setShowCompanies] = useState(false);

  const [ncmSuggestions, setNcmSuggestions] = useState<NcmSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useSeo({
    title: "Inteligência de Importação — Dados do Brasil",
    description: "Análise completa de importações brasileiras. Descubra produtos, origens, tendências e oportunidades de negócio com dados atualizados atualizados.",
    keywords: "importação Brasil, inteligência importação, fornecedores internacionais",
  });

  useEffect(() => {
    const fetchSuggestions = async () => {
      const digits = searchNcm.replace(/\D/g, "");
      if (digits.length < 2) { setNcmSuggestions([]); setShowSuggestions(false); return; }
      try {
        const { data } = await supabase.from("ncms").select("code, description").like("code", `${digits}%`).limit(10);
        setNcmSuggestions(data || []);
        setShowSuggestions((data || []).length > 0);
      } catch { setNcmSuggestions([]); setShowSuggestions(false); }
    };
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [searchNcm]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node) && !suggestionsRef.current?.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectNcm = (code: string) => { setSearchNcm(formatNcmCode(code)); setShowSuggestions(false); };

  const handleSearch = async () => {
    if (!searchNcm.trim()) { showError("Digite um código NCM."); return; }
    const ok = await consume("search");
    if (!ok) return;
    setLoading(true); setError(null); setRegistros([]);
    try {
      const params: Record<string, string> = { ncm: searchNcm.replace(/\D/g, ""), anoDe, mesDe, anoAte, mesAte, tipo: "IMP" };
      const { data, error: funcError } = await supabase.functions.invoke("import-data", { body: params });
      if (funcError) throw new Error(funcError.message);
      if (data?.error) throw new Error(data.error);
      if (data?.registros) {
        setRegistros(data.registros);
        showSuccess(`${data.registros.length} registros encontrados!`);
        saveSearchHistory("Busca Importação", `NCM ${searchNcm}`, "import_search");
        if (data?.ncm_description) setNcmDescription(data.ncm_description);
      }
    } catch (err: any) { setError(err.message); showError("Erro: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <ImportIntelligenceLayout title="Dashboard">
      <div className="space-y-6">
        <PageHeader title="Import Intelligence" subtitle="Dados oficiais de importação brasileira" variant="blue" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 text-white cursor-pointer" onClick={() => navigate("/import-intelligence/search")}>
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center"><Sparkles className="w-6 h-6 text-white" /></div>
                <div>
                  <h3 className="text-lg font-black">Pesquisa com IA</h3>
                  <p className="text-purple-100 text-xs">Descreva seu produto e a IA encontra o NCM</p>
                </div>
              </div>
              <Button className="bg-white text-purple-700 rounded-xl font-bold gap-1.5 text-xs h-9"><ArrowRight className="w-3.5 h-3.5" /> Pesquisar</Button>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="glass-card glow-border rounded-2xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="relative">
                <Input ref={inputRef} placeholder="Código NCM..." className="h-11 border-2 border-[hsl(var(--border))] rounded-xl text-sm" value={searchNcm} onChange={(e) => { setSearchNcm(e.target.value); setShowSuggestions(true); }} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                {showSuggestions && ncmSuggestions.length > 0 && (
                  <div ref={suggestionsRef} className="absolute z-50 w-full mt-1 bg-white border border-[hsl(var(--border))] rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    {ncmSuggestions.map((s) => (
                      <button key={s.code} className="w-full px-4 py-2.5 text-left hover:bg-[hsl(var(--brand-soft))] flex justify-between" onClick={() => selectNcm(s.code)}>
                        <span className="font-bold text-xs">{formatNcmCode(s.code)}</span>
                        <span className="text-[10px] text-[hsl(var(--muted-foreground))] truncate max-w-[180px]">{s.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">De</Label>
                  <div className="flex gap-1.5">
                    <Select value={anoDe} onValueChange={setAnoDe}>
                      <SelectTrigger className="h-9 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>{ANOS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={mesDe} onValueChange={setMesDe}>
                      <SelectTrigger className="h-9 text-xs rounded-lg w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>{MESES.filter(m => m.value !== "_all").map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex-1">
                  <Label className="text-[9px] font-black uppercase tracking-[0.15em] text-[hsl(var(--muted-foreground))]">Até</Label>
                  <div className="flex gap-1.5">
                    <Select value={anoAte} onValueChange={setAnoAte}>
                      <SelectTrigger className="h-9 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>{ANOS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={mesAte} onValueChange={setMesAte}>
                      <SelectTrigger className="h-9 text-xs rounded-lg w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>{MESES.filter(m => m.value !== "_all").map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={handleSearch} disabled={loading} className="h-11 bg-primary hover:bg-primary/90 rounded-xl font-black gap-1.5 shadow-[var(--shadow-brand)] text-xs self-end">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-red-50 border-2 border-red-100">
            <CardContent className="p-4 flex items-center gap-3 text-red-700"><AlertCircle className="w-5 h-5" /><p className="font-bold text-sm">{error}</p></CardContent>
          </Card>
        )}

        {registros.length > 0 && (
          <>
            <SearchResults registros={registros} ncm={searchNcm.replace(/\D/g, "")} tipo="import" loading={loading} />

            <GlassCard>
              <div className="p-5">
                {!showCompanies ? (
                  <div className="text-center py-4">
                    <Building2 className="w-10 h-10 text-[hsl(var(--muted-foreground))] mx-auto mb-2" />
                    <h3 className="font-black text-foreground mb-1 text-sm">Empresas Estimadas</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mb-3 max-w-sm mx-auto">Use IA para descobrir quais empresas provavelmente operam neste NCM.</p>
                    <Button onClick={() => setShowCompanies(true)} className="bg-primary hover:bg-primary/90 rounded-xl font-bold gap-1.5 text-xs h-9"><Sparkles className="w-3.5 h-3.5" /> Ver Empresas</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-foreground flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-primary" /> Empresas Estimadas</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCompanies(false)} className="text-[hsl(var(--muted-foreground))] font-bold text-[10px]">Ocultar</Button>
                    </div>
                    <CompanyEstimatorPanel registros={registros} ncm={searchNcm.replace(/\D/g, "")} descricaoNcm={ncmDescription} tipo="import" accentColor="amber" />
                  </div>
                )}
              </div>
            </GlassCard>

            <BillOfLadingPanel registros={registros} ncm={searchNcm.replace(/\D/g, "")} type="import" />
            <RealtimeAlerts ncm={searchNcm.replace(/\D/g, "")} />
          </>
        )}

        {!loading && registros.length === 0 && !error && (
          <GlassCard><div className="p-10 text-center"><Globe className="w-14 h-14 text-[hsl(var(--muted-foreground))] mx-auto mb-3" /><h3 className="text-lg font-black text-foreground mb-1">Busque por NCM</h3><p className="text-[hsl(var(--muted-foreground))] text-xs">Digite um código NCM para visualizar dados de importação</p></div></GlassCard>
        )}
      </div>
    </ImportIntelligenceLayout>
  );
};

export default function ImportIntelligence() {
  const { consume } = useUsage();