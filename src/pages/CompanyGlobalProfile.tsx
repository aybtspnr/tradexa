"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Loader2, Building2, Globe, DollarSign, BarChart3,
  MapPin, Package, TrendingUp, AlertCircle, Target, ArrowRight,
  FileText, ShieldCheck, Factory,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useSeo } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import GlobalMarketSection from "@/components/intel/GlobalMarketSection";

/* ── Types ── */
interface EvidenceEntry {
  cnpj: string;
  company_name: string;
  ncm_code: string;
  score: number;
  source: string;
  source_data: any;
}

interface PartnerData {
  company_name: string;
  country: string;
  relationship: string;
  score: number;
}

interface CompanyInfo {
  cnpj: string;
  company_name: string;
  ncms: { code: string; score: number }[];
  score: number;
  source: string;
}

/* ── Helpers ── */
function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, "");
  if (d.length !== 14) return cnpj;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-slate-600 bg-slate-50 border-slate-200";
}

export default function CompanyGlobalProfile() {
  useSeo({
    title: "Perfil Global da Empresa — TRADEXA",
    description: "Perfil completo de empresas com dados de comércio exterior, parceiros globais e indicadores macroeconômicos.",
    keywords: "perfil empresa, comércio exterior, parceiros globais, CNPJ, market share, tradexa",
  });

  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [selectedNcm, setSelectedNcm] = useState<string>("");
  const [partners, setPartners] = useState<PartnerData[] | null>(null);
  const [partnersLoading, setPartnersLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14 && clean.length !== 8) {
      setError("Digite um CNPJ válido (14 dígitos)");
      return;
    }

    setLoading(true);
    setError(null);
    setCompany(null);
    setPartners(null);
    setSelectedNcm("");

    try {
      // Query evidence_cache from Supabase
      const { data, error: supabaseError } = await supabase
        .from("evidence_cache")
        .select("cnpj, company_name, ncm_code, score, source, source_data")
        .or(`cnpj.eq.${clean}, cnpj.cs.${clean.slice(0, 8)}`);

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        // Fallback: try the API
        throw new Error("Erro ao consultar banco de dados");
      }

      if (!data || data.length === 0) {
        setError("Empresa não encontrada. Tente outro CNPJ.");
        setLoading(false);
        return;
      }

      // Group by company name
      const entries = data as EvidenceEntry[];
      const companyName = entries[0].company_name || "Empresa sem nome";
      const ncmsMap = new Map<string, number>();
      let maxScore = 0;
      let bestSource = "";

      for (const e of entries) {
        if (e.ncm_code) ncmsMap.set(e.ncm_code, Math.max(ncmsMap.get(e.ncm_code) || 0, e.score));
        if (e.score > maxScore) { maxScore = e.score; bestSource = e.source; }
      }

      const ncms = Array.from(ncmsMap.entries())
        .map(([code, score]) => ({ code, score }))
        .sort((a, b) => b.score - a.score);

      setCompany({
        cnpj: clean,
        company_name: companyName,
        ncms,
        score: maxScore,
        source: bestSource,
      });

      // Select first NCM and fetch partners
      if (ncms.length > 0) {
        setSelectedNcm(ncms[0].code);
        fetchPartners(companyName, ncms[0].code);
      }
    } catch (e: any) {
      setError(e.message || "Erro ao buscar empresa");
    }
    setLoading(false);
  }, [cnpj]);

  const fetchPartners = useCallback(async (companyName: string, ncm: string) => {
    setPartnersLoading(true);
    setPartners(null);
    try {
      const res = await fetch(`/api/intel/ncm/${ncm}/company-partners?company_name=${encodeURIComponent(companyName)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setPartners(data.partners || []);
      } else {
        setPartners([]);
      }
    } catch {
      setPartners([]);
    }
    setPartnersLoading(false);
  }, []);

  const handleNcmSelect = useCallback((ncm: string) => {
    setSelectedNcm(ncm);
    if (company) fetchPartners(company.company_name, ncm);
  }, [company, fetchPartners]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Globe className="w-6 h-6 text-[#D80E16]" />
          Perfil Global da Empresa
        </h1>
        <p className="text-sm text-slate-600">
          Consulte o perfil completo de uma empresa: dados cadastrais, NCMs, parceiros comerciais e contexto global de mercado.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="flex-1">
            <Input
              placeholder="Digite o CNPJ (14 dígitos)..."
              value={cnpj}
              onChange={e => setCnpj(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="h-12 text-base"
              maxLength={18}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#D80E16] hover:bg-[#b80c12] text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Company Profile */}
      {company && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Company Card */}
          <Card className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white/80" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">{company.company_name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/60">
                    <span className="font-mono">{fmtCnpj(company.cnpj)}</span>
                    <Badge className={cn("text-[10px] font-bold border", getScoreColor(company.score))}>
                      Score {company.score}
                    </Badge>
                    <span className="capitalize">{company.source.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-xl bg-slate-50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">NCMs</p>
                  <p className="text-xl font-black text-slate-900">{company.ncms.length}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-emerald-50">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Score Máx</p>
                  <p className="text-xl font-black text-emerald-700">{company.score}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-50">
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Fonte</p>
                  <p className="text-xs font-bold text-blue-700 uppercase break-words">
                    {company.source === "comexstat" ? "Importação" :
                     company.source === "bol" ? "BOL" :
                     company.source === "relationship" ? "Relação" :
                     company.source === "cluster" ? "Cluster" : company.source}
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50">
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Evidências</p>
                  <p className="text-xl font-black text-amber-700">{company.ncms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NCMs + Partners + Global Context */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* NCMs List */}
            <Card className="rounded-2xl border border-slate-200 lg:col-span-1">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#D80E16]" />
                  NCMs Vinculados
                </h3>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {company.ncms.map((ncm) => (
                    <button
                      key={ncm.code}
                      onClick={() => handleNcmSelect(ncm.code)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm",
                        selectedNcm === ncm.code
                          ? "bg-[#D80E16]/10 border border-[#D80E16]/30 text-[#D80E16]"
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className="font-mono font-bold text-xs">{ncm.code}</span>
                      <span className={cn(
                        "ml-auto text-[10px] font-bold px-2 py-0.5 rounded",
                        ncm.score >= 80 ? "bg-emerald-50 text-emerald-600" :
                        ncm.score >= 60 ? "bg-blue-50 text-blue-600" :
                        "bg-slate-50 text-slate-500"
                      )}>
                        {ncm.score}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Partners + Global Context */}
            <div className="lg:col-span-2 space-y-4">
              {/* Partners */}
              <Card className="rounded-2xl border border-slate-200">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#D80E16]" />
                    Parceiros Comerciais — NCM {selectedNcm}
                    {partnersLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                  </h3>
                  {!partners && !partnersLoading && (
                    <p className="text-xs text-slate-400 py-4 text-center">Carregando parceiros...</p>
                  )}
                  {partnersLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                    </div>
                  )}
                  {partners && partners.length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">Nenhum parceiro encontrado para este NCM.</p>
                  )}
                  {partners && partners.length > 0 && (
                    <div className="space-y-1">
                      {partners.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="flex-1 text-sm text-slate-700 truncate">{p.company_name}</span>
                          {p.country && (
                            <Badge variant="outline" className="text-[10px] text-slate-500">
                              {p.country}
                            </Badge>
                          )}
                          <span className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            p.score >= 80 ? "text-emerald-600 bg-emerald-50" :
                            p.score >= 60 ? "text-blue-600 bg-blue-50" :
                            "text-slate-500 bg-slate-50"
                          )}>
                            {p.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Global Market Context */}
              {selectedNcm && (
                <GlobalMarketSection ncm={selectedNcm} />
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
