"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, BarChart3, TrendingUp, ChevronDown, ChevronRight, ArrowRight,
  Loader2, AlertCircle, BarChart2, Globe, Filter, ArrowLeftRight,
  Zap, MapPin,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import PageHeader from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import { DEFAULT_YEAR, AVAILABLE_YEARS } from "@/lib/utils";
import { useUsage } from "@/hooks/use-usage";

// ── types ──────────────────────────
interface Registro {
  co_ano: string; co_mes: string; mes_nome: string;
  co_ncm: string; co_pais: string; pais_nome: string;
  sg_uf: string; uf_nome: string;
  vl_fob: number; kg_liquido: number;
}
interface SearchResult {
  registros: Registro[];
  total: number;
}

// ── constants ──────────────────────
const ANOS = [...AVAILABLE_YEARS].reverse().map(v => ({ value:v, label:v }));
const MESES = [
  { value: "_all", label: "Todos" },
  { value: "01", label: "Jan" }, { value: "02", label: "Fev" }, { value: "03", label: "Mar" },
  { value: "04", label: "Abr" }, { value: "05", label: "Mai" }, { value: "06", label: "Jun" },
  { value: "07", label: "Jul" }, { value: "08", label: "Ago" }, { value: "09", label: "Set" },
  { value: "10", label: "Out" }, { value: "11", label: "Nov" }, { value: "12", label: "Dez" },
];
const UFS = [
  { value: "_all", label: "Todas" }, { value: "AC", label: "AC" }, { value: "AL", label: "AL" },
  { value: "AM", label: "AM" }, { value: "AP", label: "AP" }, { value: "BA", label: "BA" },
  { value: "CE", label: "CE" }, { value: "DF", label: "DF" }, { value: "ES", label: "ES" },
  { value: "GO", label: "GO" }, { value: "MA", label: "MA" }, { value: "MG", label: "MG" },
  { value: "MS", label: "MS" }, { value: "MT", label: "MT" }, { value: "PA", label: "PA" },
  { value: "PB", label: "PB" }, { value: "PE", label: "PE" }, { value: "PI", label: "PI" },
  { value: "PR", label: "PR" }, { value: "RJ", label: "RJ" }, { value: "RN", label: "RN" },
  { value: "RO", label: "RO" }, { value: "RR", label: "RR" }, { value: "RS", label: "RS" },
  { value: "SC", label: "SC" }, { value: "SE", label: "SE" }, { value: "SP", label: "SP" },
  { value: "TO", label: "TO" },
];

// ── helpers ────────────────────────
const fmtUSD = (v: number) => new Intl.NumberFormat('pt-BR', {
  style:'currency', currency:'USD', notation:'compact', compactDisplay:'short', maximumFractionDigits:1}).format(v);
const fmtNUM = (v: number) => new Intl.NumberFormat('pt-BR').format(Math.round(v));

// ── component ──────────────────────
export default function NcmComparison() {
  // Query A
  const [ncmA, setNcmA] = useState("8703");
  const [resultA, setResultA] = useState<SearchResult | null>(null);

  // Query B
  const [ncmB, setNcmB] = useState("8517");
  const [resultB, setResultB] = useState<SearchResult | null>(null);

  // Shared filters
  const [ano, setAno] = useState(DEFAULT_YEAR);
  const [mes, setMes] = useState("_all");
  const [uf, setUf] = useState("_all");
  const [pais, setPais] = useState("_all");
  const [tipo, setTipo] = useState<"EXP" | "IMP">("EXP");

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "monthly" | "countries" | "ufs" | "table">("overview");

  // Autocomplete helpers
  const [sugA, setSugA] = useState<{code:string;description:string}[]>([]);
  const [showSugA, setShowSugA] = useState(false);
  const [sugB, setSugB] = useState<{code:string;description:string}[]>([]);
  const [showSugB, setShowSugB] = useState(false);
  const inputARef = useRef<HTMLInputElement>(null);
  const inputBRef = useRef<HTMLInputElement>(null);

  useSeo({
    title: "Comparar NCMs — Análise Lado a Lado",
    description: "Compare commodities e códigos NCM lado a lado. Análise detalhada de mercados, preços, volumes e países de origem para decisões de importação.",
    keywords: "comparação NCM, commodities Brasil, análise concorrência mercado",
  });

  // Fetch NCM suggestions
  useEffect(() => {
    const fetchSug = async (val: string, setter: any) => {
      const d = val.replace(/\D/g, '');
      if (d.length < 2) { setter([]); return; }
      const { data } = await supabase.from("ncms")
        .select("code, description")
        .like("code", d + "%")
        .limit(10);
      setter(data || []);
    };
    const t = setTimeout(() => fetchSug(ncmA, setSugA), 200);
    return () => clearTimeout(t);
  }, [ncmA]);
  useEffect(() => {
    const fetchSug = async (val: string, setter: any) => {
      const d = val.replace(/\D/g, '');
      if (d.length < 2) { setter([]); return; }
      const { data } = await supabase.from("ncms")
        .select("code, description")
        .like("code", d + "%")
        .limit(10);
      setter(data || []);
    };
    const t = setTimeout(() => fetchSug(ncmB, setSugB), 200);
    return () => clearTimeout(t);
  }, [ncmB]);

  // Click outside
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!inputARef.current?.contains(e.target as Node)) setShowSugA(false);
      if (!inputBRef.current?.contains(e.target as Node)) setShowSugB(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const searchOne = async (ncm: string): Promise<SearchResult> => {
    const params: Record<string, string> = {
      ncm: ncm.replace(/\D/g, ""),
      ano,
      tipo,
    };
    if (mes !== "_all") params.mes = mes;
    if (uf !== "_all") params.uf = uf;
    if (pais !== "_all") params.pais = pais;

    const res = await fetch('/api/export-data-vps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return { registros: data.registros || [], total: data.total || 0 };
  };

  const { consume } = useUsage();

  const handleCompare = async () => {
    if (!ncmA.trim() || !ncmB.trim()) {
      showError("Informe os dois NCMs para comparar.");
      return;
    }
    const consumed = await consume("search");
    if (!consumed) return;
    setLoading(true);
    setError(null);
    setResultA(null);
    setResultB(null);

    try {
      const [a, b] = await Promise.all([searchOne(ncmA), searchOne(ncmB)]);
      setResultA(a);
      setResultB(b);
      showSuccess(`Comparação completa: ${a.total} x ${b.total} registros`);
    } catch (err: any) {
      setError(err.message);
      showError("Erro na comparação: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Derived KPIs
  const kpis = useMemo(() => {
    const rA = resultA?.registros || [];
    const rB = resultB?.registros || [];
    const make = (arr: Registro[]) => ({
      fob: arr.reduce((s, r) => s + r.vl_fob, 0),
      kg: arr.reduce((s, r) => s + r.kg_liquido, 0),
      count: arr.length,
      paises: new Set(arr.map(r => r.pais_nome)).size,
      ufs: new Set(arr.map(r => r.sg_uf)).size,
    });
    return { a: make(rA), b: make(rB) };
  }, [resultA, resultB]);

  // Monthly comparison
  const monthlyData = useMemo(() => {
    const mapA = new Map<string, number>();
    const mapB = new Map<string, number>();
    (resultA?.registros || []).forEach(r => {
      const k = `${r.mes_nome}/${r.co_ano.slice(2)}`;
      mapA.set(k, (mapA.get(k) || 0) + r.vl_fob);
    });
    (resultB?.registros || []).forEach(r => {
      const k = `${r.mes_nome}/${r.co_ano.slice(2)}`;
      mapB.set(k, (mapB.get(k) || 0) + r.vl_fob);
    });
    const all = Array.from(new Set([...mapA.keys(), ...mapB.keys()])).sort();
    return all.map(k => ({ name: k, ncmA: mapA.get(k) || 0, ncmB: mapB.get(k) || 0 }));
  }, [resultA, resultB, ncmA, ncmB]);

  // Top countries
  const countryData = useMemo(() => {
    const mapA = new Map<string, number>();
    const mapB = new Map<string, number>();
    (resultA?.registros || []).forEach(r => mapA.set(r.pais_nome, (mapA.get(r.pais_nome) || 0) + r.vl_fob));
    (resultB?.registros || []).forEach(r => mapB.set(r.pais_nome, (mapB.get(r.pais_nome) || 0) + r.vl_fob));
    const all = Array.from(new Set([...mapA.keys(), ...mapB.keys()])).sort();
    return all.map(name => ({ name, ncmA: mapA.get(name) || 0, ncmB: mapB.get(name) || 0 }))
      .sort((a, b) => (b.ncmA + b.ncmB) - (a.ncmA + a.ncmB))
      .slice(0, 20);
  }, [resultA, resultB, ncmA, ncmB]);

  // Top UF comparison
  const ufData = useMemo(() => {
    const mapA = new Map<string, number>();
    const mapB = new Map<string, number>();
    (resultA?.registros || []).forEach(r => mapA.set(r.uf_nome, (mapA.get(r.uf_nome) || 0) + r.vl_fob));
    (resultB?.registros || []).forEach(r => mapB.set(r.uf_nome, (mapB.get(r.uf_nome) || 0) + r.vl_fob));
    const all = Array.from(new Set([...mapA.keys(), ...mapB.keys()])).sort();
    return all.map(name => ({ name, ncmA: mapA.get(name) || 0, ncmB: mapB.get(name) || 0 }))
      .sort((a, b) => (b.ncmA + b.ncmB) - (a.ncmA + a.ncmB));
  }, [resultA, resultB, ncmA, ncmB]);

  // Color helpers for bars
  const colorA = "#DC2626"; // red-600
  const colorB = "#EA580C"; // orange-600

  return (
    
      <div className="space-y-6">
        <PageHeader
          title="Compare NCMs lado a lado"
          subtitle="Analise dois produtos simultaneamente e identifique oportunidades comerciais."
          variant="red"
          badges={[
            { label: "Comparativo", icon: <ArrowLeftRight className="w-3 h-3 mr-1" /> },
          ]}
        />

        {/* Search Card */}
        <Card className="glass-card glow-border rounded-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* NCM A */}
              <div className="relative">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 block">NCM A (Produto 1)</Label>
                <div className="relative">
                  <Input
                    ref={inputARef}
                    value={ncmA}
                    onChange={e => { setNcmA(e.target.value); setShowSugA(true); }}
                    onFocus={() => setShowSugA(true)}
                    placeholder="Ex: 8703 (carros)"
                    className="h-14 text-lg font-bold bg-white border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                  {showSugA && sugA.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {sugA.map((s, i) => (
                        <button key={i} className="w-full px-4 py-3 text-left hover:bg-[hsl(var(--brand-soft))] flex justify-between"
                          onClick={() => { setNcmA(s.code); setShowSugA(false); }}>
                          <span className="font-bold text-sm">{s.code}</span>
                          <span className="text-xs text-slate-600 truncate max-w-[200px]">{s.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* NCM B */}
              <div className="relative">
                <Label className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-2 block">NCM B (Produto 2)</Label>
                <div className="relative">
                  <Input
                    ref={inputBRef}
                    value={ncmB}
                    onChange={e => { setNcmB(e.target.value); setShowSugB(true); }}
                    onFocus={() => setShowSugB(true)}
                    placeholder="Ex: 8517 (telefones)"
                    className="h-14 text-lg font-bold bg-white border-2 border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
                  />
                  {showSugB && sugB.length > 0 && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                      {sugB.map((s, i) => (
                        <button key={i} className="w-full px-4 py-3 text-left hover:bg-orange-50 flex justify-between"
                          onClick={() => { setNcmB(s.code); setShowSugB(false); }}>
                          <span className="font-bold text-sm">{s.code}</span>
                          <span className="text-xs text-slate-600 truncate max-w-[200px]">{s.description}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shared Filters Row */}
            <div className="flex flex-wrap items-end gap-3 mb-6">
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Ano</Label>
                <Select value={ano} onValueChange={setAno}>
                  <SelectTrigger className="w-24 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{ANOS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Mês</Label>
                <Select value={mes} onValueChange={setMes}>
                  <SelectTrigger className="w-28 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{MESES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">UF</Label>
                <Select value={uf} onValueChange={setUf}>
                  <SelectTrigger className="w-20 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{UFS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">País</Label>
                <Select value={pais} onValueChange={setPais}>
                  <SelectTrigger className="w-28 font-bold rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">Todos</SelectItem>
                    <SelectItem value="243">China</SelectItem>
                    <SelectItem value="300">EUA</SelectItem>
                    <SelectItem value="452">México</SelectItem>
                    <SelectItem value="160">Argentina</SelectItem>
                    <SelectItem value="531">Portugal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Tipo</Label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button onClick={() => setTipo("EXP")} className={`px-4 py-2 text-xs font-black uppercase tracking-widest ${tipo === "EXP" ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>EXP</button>
                  <button onClick={() => setTipo("IMP")} className={`px-4 py-2 text-xs font-black uppercase tracking-widest ${tipo === "IMP" ? "bg-primary text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>IMP</button>
                </div>
              </div>
              <Button onClick={handleCompare} disabled={loading} className="h-10 bg-primary hover:bg-primary/90 font-black gap-2 ml-auto rounded-xl shadow-[var(--shadow-brand)]">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Comparar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 font-bold">
            <AlertCircle className="w-5 h-5" /> {error}
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {resultA && resultB && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI label="FOB Total" a={kpis.a.fob} b={kpis.b.fob} />
                <KPI label="KG Total" a={kpis.a.kg} b={kpis.b.kg} raw />
                <KPI label="Registros" a={kpis.a.count} b={kpis.b.count} raw />
                <KPI label="Países/UFs" a={`${kpis.a.paises} / ${kpis.a.ufs}`} b={`${kpis.b.paises} / ${kpis.b.ufs}`} raw text />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[{k:"overview",l:"Visão Geral",i:BarChart3},{k:"monthly",l:"Tendência Mensal",i:TrendingUp},{k:"countries",l:"Países",i:Globe},{k:"ufs",l:"UFs",i:MapPin},{k:"table",l:"Dados",i:Filter}].map(t => (
                  <button key={t.k} onClick={() => setActiveTab(t.k as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap ${activeTab===t.k ? "bg-primary text-white shadow-[var(--shadow-brand)]" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                    <t.i className="w-3.5 h-3.5" /> {t.l}
                  </button>
                ))}
              </div>

              {/* Monthly Chart */}
              {activeTab === "monthly" && (
                <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Tendência Mensal (FOB)</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} barCategoryGap="20%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tickFormatter={v => new Intl.NumberFormat('pt-BR', { notation:'compact' }).format(v)} tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(v: number) => fmtUSD(v)} labelStyle={{ fontWeight: 700 }} />
                          <Legend />
                          <Bar dataKey="ncmA" fill={colorA} radius={[4,4,0,0]} name={`NCM ${ncmA}`} />
                          <Bar dataKey="ncmB" fill={colorB} radius={[4,4,0,0]} name={`NCM ${ncmB}`} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Countries */}
              {activeTab === "countries" && (
                <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Top Países</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={countryData} layout="vertical" barCategoryGap="10%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                          <XAxis type="number" tickFormatter={v => new Intl.NumberFormat('pt-BR', { notation:'compact' }).format(v)} tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                          <Tooltip formatter={(v: number) => fmtUSD(v)} />
                          <Legend />
                          <Bar dataKey="ncmA" fill={colorA} radius={[0,4,4,0]} name={`NCM ${ncmA}`} />
                          <Bar dataKey="ncmB" fill={colorB} radius={[0,4,4,0]} name={`NCM ${ncmB}`} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* UFs */}
              {activeTab === "ufs" && (
                <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-4">Top UFs</h3>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ufData} layout="vertical" barCategoryGap="10%">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                          <XAxis type="number" tickFormatter={v => new Intl.NumberFormat('pt-BR', { notation:'compact' }).format(v)} tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                          <Tooltip formatter={(v: number) => fmtUSD(v)} />
                          <Legend />
                          <Bar dataKey="ncmA" fill={colorA} radius={[0,4,4,0]} name={`NCM ${ncmA}`} />
                          <Bar dataKey="ncmB" fill={colorB} radius={[0,4,4,0]} name={`NCM ${ncmB}`} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Data Table */}
              {activeTab === "table" && (
                <Card className="glass-card glow-border rounded-2xl overflow-hidden">
                  <CardContent className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>NCM</TableHead>
                          <TableHead>Mês</TableHead>
                          <TableHead>País</TableHead>
                          <TableHead>UF</TableHead>
                          <TableHead className="text-right">FOB</TableHead>
                          <TableHead className="text-right">KG</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultA.registros.map((r, i) => (
                          <TableRow key={`a-${i}`} className="bg-red-50/30">
                            <TableCell><Badge className="bg-primary text-white font-bold">{ncmA}</Badge></TableCell>
                            <TableCell className="text-xs text-slate-600">{r.mes_nome}/{r.co_ano}</TableCell>
                            <TableCell className="text-xs">{r.pais_nome}</TableCell>
                            <TableCell className="text-xs">{r.uf_nome}</TableCell>
                            <TableCell className="text-right font-bold text-primary">{fmtUSD(r.vl_fob)}</TableCell>
                            <TableCell className="text-right text-xs">{fmtNUM(r.kg_liquido)}</TableCell>
                          </TableRow>
                        ))}
                        {resultB.registros.map((r, i) => (
                          <TableRow key={`b-${i}`} className="bg-orange-50/30">
                            <TableCell><Badge className="bg-orange-500 text-white font-bold">{ncmB}</Badge></TableCell>
                            <TableCell className="text-xs text-slate-600">{r.mes_nome}/{r.co_ano}</TableCell>
                            <TableCell className="text-xs">{r.pais_nome}</TableCell>
                            <TableCell className="text-xs">{r.uf_nome}</TableCell>
                            <TableCell className="text-right font-bold text-orange-700">{fmtUSD(r.vl_fob)}</TableCell>
                            <TableCell className="text-right text-xs">{fmtNUM(r.kg_liquido)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Overview (default) */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass-card glow-border rounded-2xl overflow-hidden border-t-4 border-t-primary">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-primary text-white font-black text-sm">NCM {ncmA}</Badge>
                        <span className="text-3xl font-black text-slate-900">{fmtUSD(kpis.a.fob)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>KG total:</span><span className="font-bold">{fmtNUM(kpis.a.kg)}</span></div>
                        <div className="flex justify-between"><span>Registros:</span><span className="font-bold">{fmtNUM(kpis.a.count)}</span></div>
                        <div className="flex justify-between"><span>Países:</span><span className="font-bold">{kpis.a.paises}</span></div>
                        <div className="flex justify-between"><span>UFs:</span><span className="font-bold">{kpis.a.ufs}</span></div>
                        <div className="flex justify-between"><span>Preço médio/kg:</span><span className="font-bold">{fmtUSD(kpis.a.kg ? kpis.a.fob / kpis.a.kg : 0)}</span></div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card glow-border rounded-2xl overflow-hidden border-t-4 border-t-orange-500">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-orange-500 text-white font-black text-sm">NCM {ncmB}</Badge>
                        <span className="text-3xl font-black text-slate-900">{fmtUSD(kpis.b.fob)}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>KG total:</span><span className="font-bold">{fmtNUM(kpis.b.kg)}</span></div>
                        <div className="flex justify-between"><span>Registros:</span><span className="font-bold">{fmtNUM(kpis.b.count)}</span></div>
                        <div className="flex justify-between"><span>Países:</span><span className="font-bold">{kpis.b.paises}</span></div>
                        <div className="flex justify-between"><span>UFs:</span><span className="font-bold">{kpis.b.ufs}</span></div>
                        <div className="flex justify-between"><span>Preço médio/kg:</span><span className="font-bold">{fmtUSD(kpis.b.kg ? kpis.b.fob / kpis.b.kg : 0)}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    
  );
}

// ── KPI card ──────────────────────────────────
function KPI({ label, a, b, raw, text }: { label: string; a: any; b: any; raw?: boolean; text?: boolean }) {
  const fmt = text ? String : (raw ? fmtNUM : fmtUSD);
  const ratio = typeof a === 'number' && typeof b === 'number' && b > 0 ? (a / b) : null;
  const winner = ratio !== null ? (ratio > 1 ? "A" : "B") : null;

  return (
    <Card className={cn("glass-card glow-border rounded-2xl overflow-hidden", winner === "A" ? "border-l-4 border-l-primary" : winner === "B" ? "border-l-4 border-l-orange-500" : "border-l-4 border-l-slate-300")}>
      <CardContent className="p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">{label}</p>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-primary font-black text-lg block">{fmt(a)}</span>
            <span className="text-orange-600 font-bold text-sm block">{fmt(b)}</span>
          </div>
          {ratio !== null && (
            <div className={`text-xs font-black px-2 py-1 rounded-full ${ratio > 1 ? "bg-red-100 text-primary" : "bg-orange-100 text-orange-700"}`}>
              {ratio > 1 ? `+${((ratio - 1) * 100).toFixed(0)}%` : `-${((1 - ratio) * 100).toFixed(0)}%`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}