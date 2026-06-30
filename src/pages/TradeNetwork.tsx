"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search, Loader2, Globe, DollarSign, Package,
  AlertCircle, BarChart3, MapPin, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { GlassKpi, GlassCard } from "@/components/GlassKpi";
import { cn } from "@/lib/utils";
import { showError, showSuccess } from "@/utils/toast";
import { saveSearchHistory } from "@/hooks/use-search-history";

/* ═══════════════════ TYPES ═══════════════════ */

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
  municipios: { co_mun: string; mun_nome: string; kg_liquido: number; vl_fob: number }[];
}

interface NcmSuggestion {
  code: string;
  description: string;
}

interface PartnerRow {
  pais_nome: string;
  co_pais: string;
  fobTotal: number;
  kgTotal: number;
  sharePct: number;
  isExport: boolean;
}

/* ═══════════════════ HELPERS ═══════════════════ */

function formatNcmCode(code: string): string {
  const digits = (code || "").replace(/\D/g, "");
  if (digits.length === 8) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  return code;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `US$ ${(n / 1_000).toFixed(2)}K`;
  return `US$ ${n.toFixed(2)}`;
}

function formatCurrencyFull(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

/* ── Country 2-letter code mapping (ISO → flag emoji helper) ── */
const COUNTRY_CODES: Record<string, string> = {
  "África do Sul": "ZA", "Alemanha": "DE", "Argentina": "AR",
  "Austrália": "AU", "Bélgica": "BE", "Bolívia": "BO",
  "Canadá": "CA", "Chile": "CL", "China": "CN",
  "Colômbia": "CO", "Coreia do Sul": "KR", "Dinamarca": "DK",
  "Egito": "EG", "Emirados Árabes Unidos": "AE", "Equador": "EC",
  "Espanha": "ES", "Estados Unidos": "US", "França": "FR",
  "Gana": "GH", "Holanda (Países Baixos)": "NL", "Índia": "IN",
  "Indonésia": "ID", "Inglaterra": "GB", "Irã": "IR",
  "Iraque": "IQ", "Itália": "IT", "Japão": "JP",
  "Malásia": "MY", "México": "MX", "Nigéria": "NG",
  "Noruega": "NO", "Paraguai": "PY", "Peru": "PE",
  "Polônia": "PL", "Portugal": "PT", "Reino Unido": "GB",
  "Rússia": "RU", "Suécia": "SE", "Suíça": "CH",
  "Tailândia": "TH", "Turquia": "TR", "Uruguai": "UY",
  "Venezuela": "VE", "Vietnã": "VN",
};

function getCountryCode(nome: string): string {
  return COUNTRY_CODES[nome] || nome.slice(0, 2).toUpperCase();
}

/* ═══════════════════ COMPONENT ═══════════════════ */

export default function TradeNetwork() {
  const { consume } = useUsage();

  /* ── Search state ── */
  const [searchNcm, setSearchNcm] = useState("");
  const [ncmDescription, setNcmDescription] = useState("");
  const [ncmSuggestions, setNcmSuggestions] = useState<NcmSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /* ── Data state ── */
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [importRegistros, setImportRegistros] = useState<Registro[]>([]);
  const [exportRegistros, setExportRegistros] = useState<Registro[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  /* ── Derived state ── */
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [totalFob, setTotalFob] = useState(0);
  const [totalKg, setTotalKg] = useState(0);
  const [partnerCount, setPartnerCount] = useState(0);
  const [topProduct, setTopProduct] = useState("");

  /* ── SVG dimensions ── */
  const SVG_SIZE = 420;
  const RADIUS = 160;

  useSeo({
    title: "Conexões Comerciais — Rede de Comércio Exterior",
    description:
      "Visualize as conexões comerciais do Brasil por NCM. Mapa radial de parceiros, gráficos de participação e indicadores de comércio exterior.",
    keywords:
      "conexões comerciais, rede comércio exterior, parceiros comerciais Brasil, NCM, exportação, importação, trade network",
  });

  /* ── Close suggestions on outside click ── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (
        !inputRef.current?.contains(e.target as Node) &&
        !suggestionsRef.current?.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* ── Fetch NCM suggestions ── */
  useEffect(() => {
    const fetchSuggestions = async () => {
      const digits = searchNcm.replace(/\D/g, "");
      if (digits.length < 2) {
        setNcmSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("ncms")
          .select("code, description")
          .like("code", `${digits}%`)
          .limit(10);
        setNcmSuggestions(data || []);
        setShowSuggestions((data || []).length > 0);
      } catch {
        setNcmSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [searchNcm]);

  /* ── Select NCM from suggestion ── */
  const selectNcm = useCallback((code: string) => {
    setSearchNcm(formatNcmCode(code));
    setShowSuggestions(false);
  }, []);

  /* ── Aggregation helpers ── */
  function aggregatePartners(
    importData: Registro[],
    exportData: Registro[],
  ): {
    partners: PartnerRow[];
    totalFob: number;
    totalKg: number;
    partnerCount: number;
  } {
    const countryMap = new Map<
      string,
      { fob: number; kg: number; isExport: boolean }
    >();

    for (const r of importData) {
      const key = r.pais_nome || r.co_pais || "ZZ";
      const prev = countryMap.get(key) || { fob: 0, kg: 0, isExport: false };
      prev.fob += Number(r.vl_fob) || 0;
      prev.kg += Number(r.kg_liquido) || 0;
      countryMap.set(key, prev);
    }

    for (const r of exportData) {
      const key = r.pais_nome || r.co_pais || "ZZ";
      const prev = countryMap.get(key) || { fob: 0, kg: 0, isExport: false };
      prev.fob += Number(r.vl_fob) || 0;
      prev.kg += Number(r.kg_liquido) || 0;
      prev.isExport = true;
      countryMap.set(key, prev);
    }

    let totalFob = 0;
    let totalKg = 0;
    const rows: PartnerRow[] = [];

    for (const [pais_nome, vals] of countryMap.entries()) {
      if (pais_nome && pais_nome !== "ZZ") {
        totalFob += vals.fob;
        totalKg += vals.kg;
        rows.push({
          pais_nome,
          co_pais: getCountryCode(pais_nome),
          fobTotal: vals.fob,
          kgTotal: vals.kg,
          sharePct: 0,
          isExport: vals.isExport,
        });
      }
    }

    const sorted = rows.sort((a, b) => b.fobTotal - a.fobTotal);

    // Compute share percentages
    for (const r of sorted) {
      r.sharePct = totalFob > 0 ? (r.fobTotal / totalFob) * 100 : 0;
    }

    return {
      partners: sorted,
      totalFob,
      totalKg,
      partnerCount: sorted.length,
    };
  }

  /* ── Main search ── */
  const handleSearch = useCallback(async () => {
    if (!searchNcm.trim()) {
      showError("Digite um código NCM.");
      return;
    }

    const ok = await consume("search");
    if (!ok) return;

    setLoading(true);
    setHasSearched(true);
    setImportError(null);
    setExportError(null);
    setImportRegistros([]);
    setExportRegistros([]);
    setPartners([]);
    setTotalFob(0);
    setTotalKg(0);
    setPartnerCount(0);
    setTopProduct("");

    const ncmClean = searchNcm.replace(/\D/g, "");
    const params = { ncm: ncmClean, tipo: "" };

    try {
      const results = await Promise.allSettled([
        supabase.functions.invoke("import-data", { body: { ...params, tipo: "IMP" } }),
        supabase.functions.invoke("export-data", { body: { ...params, tipo: "EXP" } }),
      ]);

      let importData: Registro[] = [];
      let exportData: Registro[] = [];
      let importDesc = "";
      let exportDesc = "";

      // Process import result
      if (results[0].status === "fulfilled") {
        const value = results[0].value;
        const { data, error: funcError } = value;
        if (funcError) {
          setImportError(funcError.message);
        } else if (data?.error) {
          setImportError(data.error);
        } else {
          importData = data?.registros || [];
          setImportRegistros(importData);
          if (data?.ncm_description) importDesc = data.ncm_description;
        }
      } else {
        const reason = results[0].reason;
        setImportError(reason?.message || "Erro ao buscar dados de importação");
      }

      // Process export result
      if (results[1].status === "fulfilled") {
        const value = results[1].value;
        const { data, error: funcError } = value;
        if (funcError) {
          setExportError(funcError.message);
        } else if (data?.error) {
          setExportError(data.error);
        } else {
          exportData = data?.registros || [];
          setExportRegistros(exportData);
          if (data?.ncm_description) exportDesc = data.ncm_description;
        }
      } else {
        const reason = results[1].reason;
        setExportError(reason?.message || "Erro ao buscar dados de exportação");
      }

      // Set NCM description
      const desc = importDesc || exportDesc;
      if (desc) setNcmDescription(desc);

      // Aggregate
      const agg = aggregatePartners(importData, exportData);
      setPartners(agg.partners);
      setTotalFob(agg.totalFob);
      setTotalKg(agg.totalKg);
      setPartnerCount(agg.partnerCount);

      // Top product = the searched NCM description or formatted NCM
      setTopProduct(desc || formatNcmCode(ncmClean));

      // Show success
      const totalRecords = importData.length + exportData.length;
      showSuccess(`${formatNumber(totalRecords)} registros encontrados — ${agg.partnerCount} parceiros comerciais`);
      saveSearchHistory("Conexões Comerciais", `NCM ${searchNcm}`, "trade_network");
    } catch (err: any) {
      const msg = err.message || "Erro inesperado";
      showError("Erro: " + msg);
      setImportError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchNcm, consume]);

  /* ── Has any data? ── */
  const hasData = importRegistros.length > 0 || exportRegistros.length > 0;
  const hasAnyError = importError || exportError;

  /* ── Top 8 for the radial viz ── */
  const topPartners = partners.slice(0, 8);

  /* ── Top 10 for bar chart ── */
  const barData = partners.slice(0, 10).map((p) => ({
    name: p.pais_nome.length > 12 ? p.pais_nome.slice(0, 10) + "…" : p.pais_nome,
    fullName: p.pais_nome,
    fob: p.fobTotal,
    kg: p.kgTotal,
    share: parseFloat(p.sharePct.toFixed(1)),
  }));

  const BAR_COLORS = [
    "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
    "#ef4444", "#06b6d4", "#ec4899", "#84cc16",
    "#f97316", "#6366f1",
  ];

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Conexões Comerciais"
        subtitle="Visualize a rede de parceiros comerciais do Brasil por NCM — dados oficiais COMEXSTAT"
        badges={[
          { label: "REDE COMERCIAL", className: "bg-sky-500/20 text-sky-300" },
          { label: "BRA", className: "bg-emerald-500/20 text-emerald-300" },
        ]}
        variant="default"
      />

      {/* ── Search Card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl border border-slate-700/30 bg-slate-900/30 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* NCM input */}
              <div className="lg:col-span-8 relative">
                <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  Código NCM
                </label>
                <Input
                  ref={inputRef}
                  placeholder="Ex: 8471, 84, 02023000…"
                  className="h-9 mt-1 border border-slate-700/30 bg-slate-800/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500"
                  value={searchNcm}
                  onChange={(e) => {
                    setSearchNcm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                {showSuggestions && ncmSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700/50 rounded-xl shadow-xl max-h-48 overflow-y-auto"
                  >
                    {ncmSuggestions.map((s) => (
                      <button
                        key={s.code}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-800/80 flex justify-between items-center"
                        onClick={() => selectNcm(s.code)}
                      >
                        <span className="font-bold text-xs text-slate-200">
                          {formatNcmCode(s.code)}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[250px] ml-2">
                          {s.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search button */}
              <div className="lg:col-span-4 flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-9 w-full bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold gap-1.5 text-xs shadow-lg shadow-emerald-900/30"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Buscar Conexões
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Loading overlay ── */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-slate-400 text-sm font-medium">
              Buscando conexões comerciais...
            </p>
          </div>
        </motion.div>
      )}

      {/* ── Error banners ── */}
      {!loading && importError && (
        <Card className="rounded-2xl border border-red-800/40 bg-red-900/20 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">Importação: {importError}</p>
          </CardContent>
        </Card>
      )}
      {!loading && exportError && (
        <Card className="rounded-2xl border border-red-800/40 bg-red-900/20 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-bold text-sm">Exportação: {exportError}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Empty state (before first search) ── */}
      {!loading && !hasSearched && (
        <GlassCard>
          <div className="p-10 text-center">
            <Share2 className="w-14 h-14 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-200 mb-1">
              Explore a Rede Comercial
            </h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Digite um código NCM para visualizar as conexões comerciais do Brasil com seus
              parceiros ao redor do mundo — dados oficiais de importação e exportação.
            </p>
          </div>
        </GlassCard>
      )}

      {/* ── No results ── */}
      {!loading && hasSearched && !hasData && !hasAnyError && (
        <GlassCard>
          <div className="p-10 text-center">
            <Globe className="w-14 h-14 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-slate-200 mb-1">
              Nenhuma conexão encontrada
            </h3>
            <p className="text-slate-400 text-xs">
              Nenhum dado disponível para o NCM selecionado.
            </p>
          </div>
        </GlassCard>
      )}

      {/* ── RESULTS ── */}
      {!loading && hasSearched && hasData && (
        <motion.div
          key="results"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* ── NCM Description ── */}
          {ncmDescription && (
            <GlassCard>
              <div className="p-4">
                <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] px-3 py-1 rounded-full">
                  NCM {formatNcmCode(searchNcm.replace(/\D/g, ""))}
                </Badge>
                <p className="mt-2 text-sm text-slate-300 font-medium">
                  {ncmDescription}
                </p>
              </div>
            </GlassCard>
          )}

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassKpi
              label="Valor Total Comercializado"
              value={formatCurrency(totalFob)}
              variant="emerald"
              delay={0}
              icon={DollarSign}
            />
            <GlassKpi
              label="Parceiros Comerciais"
              value={String(partnerCount)}
              variant="blue"
              delay={0.05}
              icon={Globe}
            />
            <GlassKpi
              label="Peso Total"
              value={formatNumber(totalKg) + " kg"}
              variant="violet"
              delay={0.1}
              icon={Package}
            />
            <GlassKpi
              label="Principal Produto"
              value={topProduct.length > 25 ? topProduct.slice(0, 22) + "…" : topProduct || "—"}
              variant="amber"
              delay={0.15}
              icon={BarChart3}
            />
          </div>

          {/* ── Two-column: Radial Viz + BarChart ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ── Radial Network Viz ── */}
            <GlassCard>
              <div className="p-5">
                <h3 className="text-sm font-black text-slate-200 mb-3 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Rede de Conexões — Brasil → Mundo
                </h3>
                {topPartners.length > 0 ? (
                  <div className="flex justify-center">
                    <svg
                      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                      className="w-full max-w-[420px] h-auto"
                    >
                      {/* Concentric rings */}
                      <circle
                        cx={SVG_SIZE / 2}
                        cy={SVG_SIZE / 2}
                        r={RADIUS}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                      />
                      <circle
                        cx={SVG_SIZE / 2}
                        cy={SVG_SIZE / 2}
                        r={RADIUS / 2}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth={1}
                        strokeDasharray="2 4"
                      />

                      {/* Connecting lines */}
                      {topPartners.map((p, i) => {
                        const angle = (2 * Math.PI * i) / topPartners.length - Math.PI / 2;
                        const x = SVG_SIZE / 2 + RADIUS * Math.cos(angle);
                        const y = SVG_SIZE / 2 + RADIUS * Math.sin(angle);
                        const midX = (SVG_SIZE / 2 + x) / 2;
                        const midY = (SVG_SIZE / 2 + y) / 2;
                        const intensity = Math.min(1, p.sharePct / 40);
                        const opacity = 0.2 + intensity * 0.6;
                        return (
                          <g key={p.pais_nome + i}>
                            {/* Glow line */}
                            <line
                              x1={SVG_SIZE / 2}
                              y1={SVG_SIZE / 2}
                              x2={x}
                              y2={y}
                              stroke={p.isExport ? "#10b981" : "#3b82f6"}
                              strokeWidth={1.5 + intensity * 3}
                              strokeOpacity={opacity}
                              strokeLinecap="round"
                            />
                            {/* Animated dot */} 
                            <circle cx={midX} cy={midY} r={3} fill="#fff" opacity={0.6}>
                              <animate
                                attributeName="opacity"
                                values="0.3;0.9;0.3"
                                dur="2s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          </g>
                        );
                      })}

                      {/* Country nodes */}
                      {topPartners.map((p, i) => {
                        const angle = (2 * Math.PI * i) / topPartners.length - Math.PI / 2;
                        const x = SVG_SIZE / 2 + RADIUS * Math.cos(angle);
                        const y = SVG_SIZE / 2 + RADIUS * Math.sin(angle);
                        const labelOffset = angle > Math.PI / 2 || angle < -Math.PI / 2 ? -8 : 8;
                        const textAnchor =
                          angle > Math.PI / 2 || angle < -Math.PI / 2
                            ? "end"
                            : "start";
                        return (
                          <g key={`node-${p.pais_nome}`}>
                            {/* Node circle */}
                            <circle
                              cx={x}
                              cy={y}
                              r={Math.max(6, Math.min(16, 8 + p.sharePct * 0.3))}
                              fill={p.isExport ? "#065f46" : "#1e3a5f"}
                              stroke={p.isExport ? "#10b981" : "#3b82f6"}
                              strokeWidth={2}
                            />
                            <text
                              x={x}
                              y={y + 1}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#fff"
                              fontSize="8"
                              fontWeight="bold"
                            >
                              {p.co_pais}
                            </text>
                            {/* Country name label */}
                            <text
                              x={x + labelOffset}
                              y={y}
                              textAnchor={textAnchor}
                              dominantBaseline="central"
                              fill="#94a3b8"
                              fontSize="9"
                            >
                              {p.pais_nome.length > 14
                                ? p.pais_nome.slice(0, 12) + "…"
                                : p.pais_nome}
                            </text>
                          </g>
                        );
                      })}

                      {/* Center: Brazil */}
                      <circle
                        cx={SVG_SIZE / 2}
                        cy={SVG_SIZE / 2}
                        r={24}
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth={2.5}
                      />
                      <text
                        x={SVG_SIZE / 2}
                        y={SVG_SIZE / 2 - 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#fff"
                        fontSize="11"
                        fontWeight="black"
                      >
                        BR
                      </text>
                      <text
                        x={SVG_SIZE / 2}
                        y={SVG_SIZE / 2 + 12}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#6ee7b7"
                        fontSize="6"
                        fontWeight="bold"
                      >
                        BRASIL
                      </text>

                      {/* Center pulse */}
                      <circle
                        cx={SVG_SIZE / 2}
                        cy={SVG_SIZE / 2}
                        r={24}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth={2}
                        opacity={0.4}
                      >
                        <animate
                          attributeName="r"
                          values="24;32;24"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.4;0;0.4"
                          dur="3s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-8">
                    Dados insuficientes para visualização.
                  </p>
                )}
              </div>
            </GlassCard>

            {/* ── BarChart: Top Countries ── */}
            <GlassCard>
              <div className="p-5">
                <h3 className="text-sm font-black text-slate-200 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                  Top 10 Países por Valor (FOB)
                </h3>
                {barData.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        layout="vertical"
                        margin={{ top: 4, right: 20, bottom: 4, left: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1e293b"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                          tickFormatter={(v: number) => formatCurrency(v)}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fill: "#cbd5e1", fontSize: 9 }}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                            color: "#e2e8f0",
                            fontSize: "11px",
                          }}
                          formatter={(value: number) => [
                            formatCurrencyFull(value),
                            "Valor FOB",
                          ]}
                          labelFormatter={(label, payload) =>
                            payload?.[0]?.payload?.fullName || label
                          }
                        />
                        <Bar
                          dataKey="fob"
                          radius={[0, 4, 4, 0]}
                          barSize={14}
                        >
                          {barData.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={BAR_COLORS[idx % BAR_COLORS.length]}
                              fillOpacity={0.85}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-8">
                    Dados insuficientes para gráfico.
                  </p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* ── Trading Partners Table ── */}
          <GlassCard>
            <div className="p-5">
              <h3 className="text-sm font-black text-slate-200 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                Parceiros Comerciais
              </h3>
              {partners.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-700/30">
                        <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">
                          #
                        </th>
                        <th className="pb-2 font-black text-slate-400 uppercase tracking-wider">
                          País
                        </th>
                        <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                          Valor FOB (USD)
                        </th>
                        <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                          Peso (kg)
                        </th>
                        <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-right">
                          % Participação
                        </th>
                        <th className="pb-2 font-black text-slate-400 uppercase tracking-wider text-center">
                          Tipo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.slice(0, 50).map((row, idx) => (
                        <tr
                          key={row.pais_nome + idx}
                          className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-2.5 text-slate-500 font-medium w-8">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 font-medium text-slate-200">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              {row.pais_nome}
                            </div>
                          </td>
                          <td className="py-2.5 text-right text-emerald-400 tabular-nums font-medium">
                            {formatCurrencyFull(row.fobTotal)}
                          </td>
                          <td className="py-2.5 text-right text-slate-400 tabular-nums">
                            {formatNumber(row.kgTotal)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, row.sharePct)}%` }}
                                />
                              </div>
                              <span className="text-slate-400 w-10 text-right">
                                {row.sharePct.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border",
                                row.isExport
                                  ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                  : "text-blue-400 border-blue-500/30 bg-blue-500/10",
                              )}
                            >
                              {row.isExport ? "EXP" : "IMP"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {partners.length > 50 && (
                    <p className="text-slate-500 text-[10px] text-center mt-3">
                      Mostrando 50 de {formatNumber(partners.length)} países
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  Nenhum parceiro encontrado.
                </p>
              )}
            </div>
          </GlassCard>

          {/* ── Data source footer ── */}
          <div className="text-center">
            <p className="text-[10px] text-slate-500">
              Fonte: MDIC / COMEXSTAT — Dados oficiais do comércio exterior brasileiro.
              Atualizado mensalmente.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
