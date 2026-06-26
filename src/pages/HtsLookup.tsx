"use client";

import { useState, useCallback, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search, Loader2, Globe, Info, Sparkles, ChevronDown, ChevronUp,
  DollarSign, ShieldCheck, AlertTriangle, BookOpen,
  FileText, Hash, Trophy, CheckCircle2,
  Layers, BarChart3, Zap, Database,
  Building2, Ship, Package, MapPin, Users, Flag, Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { showError, showSuccess } from "@/utils/toast";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { cn } from "@/lib/utils";
import {
  PremiumButton, PremiumBadge,
  PageTransition, SpotlightCard
} from "@/components/premium";

// ── Types ──
interface HtsRecord {
  htsno?: string;
  description?: string;
  general?: string;
  special?: string;
  other?: string;
  units?: string[];
  unit?: string;
  indent?: number | string;
  superior?: boolean;
}

interface HtsDetail {
  code: string;
  description: string;
  rates: { general: string; special: string; column2: string };
  unit: string;
  ancestors: HtsRecord[];
  children: HtsRecord[];
  explanation: string | null;
  aiAvailable: boolean;
}

interface ImportCompany {
  name: string;
  slug: string;
  bol_count: number;
  buyer_count: number;
  top_buyers: string[];
  commodities: string[];
  origin_ports: string[];
  dest_ports: string[];
}

interface BolRecord {
  run_date: string;
  master_bol: string;
  vessel: string;
  arrival_date: string;
  us_port: string;
  foreign_port: string;
  foreign_port_country: string;
  weight_kg: number;
  quantity: number;
  shipper: string;
  consignee: string;
  commodity: string;
}

function toSh6(code: string): string {
  return code.replace(/[^0-9]/g, "").substring(0, 6);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatWeight(kg: number): string {
  if (kg >= 1_000_000) return (kg / 1_000_000).toFixed(1) + "M kg";
  if (kg >= 1_000) return (kg / 1_000).toFixed(1) + "K kg";
  return Math.round(kg).toLocaleString("en-US") + " kg";
}

// ── Column Info Card ──
function ColumnInfoCard() {
  const [open, setOpen] = useState(false);
  return (
    <SpotlightCard className="rounded-2xl">
      <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <span className="text-sm font-black text-blue-900">
                Entendendo as tarifas do HTS
              </span>
              <p className="text-[10px] font-bold text-blue-600/70">
                Como interpretar as alíquotas
              </p>
            </div>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-5 h-5 text-blue-500" />
          </motion.div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-4 border-t border-blue-100">
                <p className="text-[11px] font-bold text-blue-800/70 leading-relaxed">
                  O Harmonized Tariff Schedule (HTS) dos EUA define 3 colunas de tarifas para cada código. 
                  Entenda cada uma:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      icon: DollarSign,
                      label: "Tarifa Geral (MFN)",
                      desc: "Alíquota padrão para países com Status de Nação Mais Favorecida (MFN). Aplica-se à maioria dos países, incluindo o Brasil.",
                      bg: "from-amber-50 to-orange-50",
                      border: "border-amber-200",
                      iconBg: "bg-amber-100",
                      iconColor: "text-amber-600",
                    },
                    {
                      icon: ShieldCheck,
                      label: "Tarifa Especial",
                      desc: "Alíquotas reduzidas ou zero para países com acordos comerciais (USMCA, GSP, Israel, Chile, Singapura, etc.).",
                      bg: "from-emerald-50 to-green-50",
                      border: "border-emerald-200",
                      iconBg: "bg-emerald-100",
                      iconColor: "text-emerald-600",
                    },
                    {
                      icon: AlertTriangle,
                      label: "Coluna 2",
                      desc: "Tarifa mais alta, aplicada apenas a países sem NTR (Normal Trade Relations) com os EUA. Hoje apenas Cuba e Coreia do Norte.",
                      bg: "from-red-50 to-rose-50",
                      border: "border-red-200",
                      iconBg: "bg-red-100",
                      iconColor: "text-red-600",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`bg-gradient-to-br ${item.bg} rounded-xl p-4 border ${item.border}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                          <item.icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SpotlightCard>
  );
}

// ── Premium Result Card ──
function ResultCard({ record, index, selected, onSelect }: {
  record: HtsRecord;
  index: number;
  selected?: boolean;
  onSelect?: (hts: string) => void;
}) {
  const [detail, setDetail] = useState<HtsDetail | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  const loadExplanation = useCallback(async () => {
    if (!record.htsno) return;
    if (detail?.explanation) return;
    setLoadingExplain(true);
    try {
      const res = await fetch(`/api/hts-ai?code=${encodeURIComponent(record.htsno)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDetail(data);
    } catch {
      showError("Erro ao carregar explicação");
    } finally {
      setLoadingExplain(false);
    }
  }, [record.htsno, detail]);

  const htsno = record.htsno || "";
  const isHeader = !htsno;
  const indent = typeof record.indent === "string" ? parseInt(record.indent) : (record.indent || 0);
  const isSuperior = record.superior;
  const unit = Array.isArray(record.units) ? record.units.join(", ") : (record.unit || "");

  // ── Rate severity badge ──
  const rateColor = (rate: string) => {
    const v = parseFloat(rate.replace(/[^0-9.]/g, ""));
    if (isNaN(v)) return "bg-slate-100 text-slate-600";
    if (v <= 5) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (v <= 15) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const hasRates = record.general || record.special || record.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <SpotlightCard
        spotlightColor="rgba(216, 14, 22, 0.08)"
        hoverScale={1.005}
        className="rounded-2xl"
      >
        <div
          className={cn(
            "bg-white rounded-2xl overflow-hidden border transition-all duration-300",
            selected
              ? "border-[#D80E16]/40 shadow-md shadow-red-200/20"
              : "hover:shadow-lg hover:border-[#D80E16]/20",
            indent <= 1 ? "border-slate-200/60 shadow-sm" : "border-slate-100 shadow-[0_1px_6px_-3px_rgba(15,17,26,0.06)]"
          )}
        >
          <div className="p-5">
            {/* Header row: code + badges */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {htsno ? (
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black font-mono tracking-wide",
                      isSuperior
                        ? "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200"
                        : "bg-gradient-to-r from-[#D80E16]/10 to-red-50 text-[#D80E16] border border-[#D80E16]/20"
                    )}>
                      <Hash className="w-3 h-3" />
                      {htsno}
                    </div>
                    {isSuperior && (
                      <span className="text-[8px] font-black uppercase tracking-[0.15em] bg-slate-200 text-slate-500 px-2 py-1 rounded-full">
                        Cabeçalho
                      </span>
                    )}
                    {unit && (
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                        {unit}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-200 text-[11px] font-black">
                    <Layers className="w-3 h-3" />
                    Seção / Capítulo
                  </div>
                )}
              </div>

              {/* Rates column */}
              {!isHeader && !isSuperior && hasRates && (
                <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 shrink-0 min-w-0 max-w-full">
                  {record.general && (
                    <div className="text-right">
                      <span className="text-[7px] font-black uppercase tracking-[0.15em] text-amber-600 block leading-none mb-0.5">MFN</span>
                      <span className={cn("text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md border whitespace-nowrap", rateColor(record.general))}>
                        {record.general.length > 8 ? record.general.substring(0, 8) + "..." : record.general}
                      </span>
                    </div>
                  )}
                  {record.special && record.special !== record.general && (
                    <div className="text-right">
                      <span className="text-[7px] font-black uppercase tracking-[0.15em] text-emerald-600 block leading-none mb-0.5">Esp.</span>
                      <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 max-w-[180px] truncate block">
                        {record.special}
                      </span>
                    </div>
                  )}
                  {record.other && (
                    <div className="text-right">
                      <span className="text-[7px] font-black uppercase tracking-[0.15em] text-red-600 block leading-none mb-0.5">Col.2</span>
                      <span className={cn("text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md border", rateColor(record.other))}>
                        {record.other.length > 10 ? record.other.substring(0, 10) + "..." : record.other}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Superior/cabeçalho sem tarifas */}
              {!isHeader && isSuperior && !hasRates && (
                <div className="flex gap-2 shrink-0">
                  <span className="text-[8px] font-black uppercase tracking-[0.15em] bg-purple-50 text-purple-500 px-2 py-1 rounded-full border border-purple-200">
                    Agrupador
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p
              className={cn(
                "text-[13px] font-semibold leading-snug break-words",
                isSuperior ? "text-purple-800" : "text-[#0F111A]",
              )}
              style={{ paddingLeft: indent > 0 ? `${Math.min(indent, 4) * 16}px` : "0" }}
            >
              {record.description}
            </p>

            {/* Full rates row (mobile-friendly) */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {record.general && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  Geral: <span className="font-black">{record.general}</span>
                </span>
              )}
              {record.special && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 max-w-full">
                  Especial: <span className="font-black break-all">{record.special}</span>
                </span>
              )}
              {record.other && (
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                  Col. 2: <span className="font-black">{record.other}</span>
                </span>
              )}
            </div>

            {/* Actions row */}
            {htsno && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadExplanation}
                  disabled={loadingExplain}
                  className={cn(
                    "text-[11px] font-bold h-8 px-3 rounded-lg transition-all gap-1.5",
                    detail?.explanation
                      ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      : "text-slate-500 hover:text-[#D80E16] hover:bg-[#D80E16]/5"
                  )}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${loadingExplain ? "animate-pulse text-amber-500" : detail?.explanation ? "text-emerald-600" : ""}`} />
                  {loadingExplain
                    ? "Carregando..."
                    : detail?.explanation
                      ? "Explicacao IA"
                      : "Explicação IA"
                  }
                </Button>
                {onSelect && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(htsno)}
                    className={cn(
                      "text-[11px] font-bold h-8 px-3 rounded-lg transition-all gap-1.5",
                      selected
                        ? "text-[#D80E16] bg-[#D80E16]/10"
                        : "text-slate-500 hover:text-[#D80E16] hover:bg-[#D80E16]/5",
                    )}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    {selected ? "Selecionado" : "Analisar"}
                  </Button>
                )}
                {detail?.explanation && (
                  <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    IA gerou explicação
                  </span>
                )}
              </div>
            )}

            {/* AI Explanation */}
            {detail?.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 pt-4 border-t border-sky-100"
              >
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-700">
                      IA Explica
                    </span>
                  </div>
                  <div className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-line font-medium break-words overflow-hidden max-w-full">
                    {detail.explanation}
                  </div>
                </div>
              </motion.div>
            )}

            {loadingExplain && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-3 text-[11px] text-slate-400 font-medium"
              >
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                Gerando explicação com IA...
              </motion.div>
            )}
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}

// ── KPI Card ──
function KpiCard({ icon: Icon, label, value, accentColor = "text-[#D80E16]", bgColor = "bg-[#D80E16]/10" }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accentColor?: string;
  bgColor?: string;
}) {
  return (
    <Card className="border border-slate-200 rounded-2xl shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgColor)}>
            <Icon className={cn("w-5 h-5", accentColor)} />
          </div>
          <div>
            <p className="text-xs text-slate-600 font-medium">{label}</p>
            <p className="text-xl font-black text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──
const HtsLookup = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<HtsRecord[]>([]);
  const [searched, setSearched] = useState(false);

  // ImportInfo data
  const [selectedHts, setSelectedHts] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tarifas");
  const [importCompanies, setImportCompanies] = useState<ImportCompany[]>([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [bols, setBols] = useState<BolRecord[]>([]);
  const [loadingBols, setLoadingBols] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

  useSeo({
    title: "Classificador HTS — TRADEXA",
    description: "Classifique produtos no sistema HTS americano com IA. Compare códigos NCM, HS e HTS automaticamente.",
    canonical: "https://www.tradexa.com.br/hts-lookup",
  });

  const { consume } = useUsage();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showError("Digite um código HTS ou descrição.");
      return;
    }

    const consumed = await consume("search");
    if (!consumed) return;

    setLoading(true);
    setSearched(true);
    setSelectedHts(null);
    setImportCompanies([]);
    setBols([]);
    setActiveTab("tarifas");
    try {
      const res = await fetch(`/api/hts-search?keyword=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const rawRecords: any[] = data?.results || [];
      const records: HtsRecord[] = rawRecords.map((r: any) => ({
        htsno: r.htsno || undefined,
        description: r.description || "",
        general: r.general || undefined,
        special: r.special || undefined,
        other: r.other || undefined,
        units: r.units || [],
        unit: Array.isArray(r.units) ? r.units[0] : (r.unit || ""),
        indent: r.indent ?? 0,
        superior: r.superior || false,
      }));

      setResults(records);
      if (records.length > 0) {
        showSuccess(`${records.length} resultados encontrados`);
      } else {
        showError("Nenhum resultado encontrado.");
      }
    } catch (err: any) {
      showError("Erro na consulta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Stats from results ──
  const resultStats = useMemo(() => {
    const withRates = results.filter(r => r.general || r.special || r.other);
    const withHts = results.filter(r => r.htsno);
    return {
      total: results.length,
      withRates: withRates.length,
      withHts: withHts.length,
    };
  }, [results]);

  // ── Select HTS code → Load ImportInfo ──
  const handleSelectHts = useCallback(async (hts: string) => {
    setSelectedHts(hts);
    setActiveTab("importacoes");
    setImportCompanies([]);
    setBols([]);

    const sh6 = toSh6(hts);
    if (sh6.length < 6) {
      showError("Codigo HTS invalido para analise.");
      return;
    }

    setLoadingImport(true);
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(`/api/intel/ncm/${sh6}/real-companies`, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const companies = (data?.confirmed_exporters || data?.companies || []).map((c: any) => ({
        name: c.name || "",
        slug: c.slug || "",
        bol_count: c.bol_count || 0,
        buyer_count: c.buyer_count || 0,
        top_buyers: c.top_buyers || [],
        commodities: c.commodities || [],
        origin_ports: c.origin_ports || [],
        dest_ports: c.dest_ports || [],
      }));
      setImportCompanies(companies);
    } catch (err: any) {
      console.error("Erro ao carregar ImportInfo companies:", err);
      showError("Erro ao carregar dados de importadores.");
    } finally {
      setLoadingImport(false);
    }
  }, []);

  // ── Load BOLs for a specific company ──
  const handleLoadBols = useCallback(async (slug: string) => {
    if (expandedCompany === slug) {
      setExpandedCompany(null);
      setBols([]);
      return;
    }
    setExpandedCompany(slug);
    setLoadingBols(true);
    setBols([]);
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const res = await fetch(`/api/intel/company/${slug}/bols`, { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const bolList = (data?.bols || []).map((b: any) => ({
        run_date: b.run_date || "",
        master_bol: b.master_bol || "",
        vessel: b.vessel || "",
        arrival_date: b.arrival_date || "",
        us_port: b.us_port || "",
        foreign_port: b.foreign_port || "",
        foreign_port_country: b.foreign_port_country || "",
        weight_kg: b.weight_kg || 0,
        quantity: b.quantity || 0,
        shipper: b.shipper || "",
        consignee: b.consignee || "",
        commodity: b.commodity || "",
      }));
      setBols(bolList);
    } catch (err: any) {
      console.error("Erro ao carregar BOLs:", err);
      showError("Erro ao carregar detalhes da empresa.");
    } finally {
      setLoadingBols(false);
    }
  }, [expandedCompany]);

  const showTabs = results.length > 0;

  // ── Import analysis ──
  const importAnalysis = useMemo(() => {
    const totalBols = importCompanies.reduce((s, c) => s + c.bol_count, 0);
    const totalCompanies = importCompanies.length;
    const ports = new Set<string>();
    importCompanies.forEach(c => {
      c.origin_ports.forEach(p => ports.add(p));
      c.dest_ports.forEach(p => ports.add(p));
    });
    return { totalBols, totalCompanies, totalPorts: ports.size };
  }, [importCompanies]);

  return (
    <PageTransition>
      <div className="w-full space-y-6">
        <PageHeader
          title="HTS dos EUA"
          subtitle="Harmonized Tariff Schedule 2026 Rev 8 — dados atualizados internacionais."
          variant="red"
          badges={[
            { label: "US HTS", icon: <Globe className="w-3 h-3 mr-1" /> },
            { label: "35.496 registros", icon: <Hash className="w-3 h-3 mr-1" /> },
            { label: "ImportInfo", icon: <Ship className="w-3 h-3 mr-1" /> },
            { label: "Dados Oficiais", icon: <CheckCircle2 className="w-3 h-3 mr-1" />, className: "bg-emerald-400/30 text-emerald-200" },
          ]}
        />

        {/* ═══ SEARCH ═══ */}
        <SpotlightCard className="rounded-2xl">
          <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative min-w-0">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none z-10">
                    <Search className="w-5 h-5 text-slate-400" />
                  </div>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Ex: 6403123000, 6403.12.30.00, ou 'footwear with rubber soles'"
                    className="pl-12 h-14 rounded-xl border-2 border-slate-200 text-sm font-medium focus:border-[#D80E16] focus:ring-4 focus:ring-[#D80E16]/10 transition-all placeholder:text-slate-400"
                  />
                </div>
                <PremiumButton
                  onClick={handleSearch}
                  disabled={loading}
                  variant="primary"
                  size="lg"
                  className="shadow-lg shadow-red-200/50 h-14 w-full sm:w-auto sm:min-w-[140px]"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Buscando...</>
                  ) : (
                    <><Search className="w-4 h-4" /> Buscar</>
                  )}
                </PremiumButton>
              </div>

              {/* Dicas de busca */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Dicas:</span>
                {[
                  { label: "Código sem pontos", icon: Hash },
                  { label: "Código com pontos", icon: FileText },
                ].map((tip, i) => (
                  <span key={i} className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                    <tip.icon className="w-3 h-3 text-slate-400" />
                    {tip.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </SpotlightCard>

        {/* ═══ TABS SECTION (only when results loaded) ═══ */}
        {showTabs && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm p-1">
              <TabsList className="w-full bg-transparent h-auto p-0 gap-1">
                <TabsTrigger
                  value="tarifas"
                  className={cn(
                    "flex-1 h-11 rounded-xl text-xs font-black transition-all data-[state=active]:bg-[#D80E16] data-[state=active]:text-white data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100",
                  )}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Tarifas
                </TabsTrigger>
                <TabsTrigger
                  value="importacoes"
                  className={cn(
                    "flex-1 h-11 rounded-xl text-xs font-black transition-all data-[state=active]:bg-[#D80E16] data-[state=active]:text-white data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100",
                  )}
                >
                  <Ship className="w-4 h-4 mr-2" />
                  Importacoes
                </TabsTrigger>
                <TabsTrigger
                  value="empresas"
                  className={cn(
                    "flex-1 h-11 rounded-xl text-xs font-black transition-all data-[state=active]:bg-[#D80E16] data-[state=active]:text-white data-[state=inactive]:text-slate-600 data-[state=inactive]:hover:bg-slate-100",
                  )}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Empresas
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ─── TAB: TARIFAS ─── */}
            <TabsContent value="tarifas" className="mt-4 space-y-4">
              <ColumnInfoCard />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#D80E16] to-rose-600 rounded-xl flex items-center justify-center shadow-md shadow-red-200/40 shrink-0">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0F111A]">
                        {resultStats.total} resultado{resultStats.total !== 1 ? "s" : ""}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-500">
                        {resultStats.withRates} com tarifas &middot; {resultStats.withHts} codigos HTS
                      </p>
                    </div>
                  </div>
                </div>
                <PremiumBadge variant="info" className="text-[9px]">
                  <Zap className="w-3 h-3" />
                  HTS Rev 8 &middot; 2026
                </PremiumBadge>
              </motion.div>

              <div className="space-y-2">
                {results.map((record, i) => (
                  <ResultCard
                    key={record.htsno || `hdr-${i}`}
                    record={record}
                    index={i}
                    selected={selectedHts === record.htsno}
                    onSelect={handleSelectHts}
                  />
                ))}
              </div>
            </TabsContent>

            {/* ─── TAB: IMPORTACOES ─── */}
            <TabsContent value="importacoes" className="mt-4 space-y-4">
              {!selectedHts && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-2xl mb-4 border border-blue-200">
                      <Ship className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
                      Selecione um codigo HTS
                    </h3>
                    <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                      Clique em &quot;Analisar&quot; em um resultado da aba Tarifas para ver dados de importacao.
                    </p>
                  </div>
                </motion.div>
              )}

              {selectedHts && (
                <>
                  <SpotlightCard className="rounded-2xl">
                    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 bg-[#D80E16]/10 rounded-xl flex items-center justify-center">
                          <Hash className="w-5 h-5 text-[#D80E16]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-600">HS Code Selecionado</p>
                          <p className="text-lg font-black text-slate-900 font-mono">{selectedHts}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          SH6: {toSh6(selectedHts)}
                        </span>
                      </div>
                    </div>
                  </SpotlightCard>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KpiCard icon={Ship} label="Total BOLs" value={loadingImport ? "..." : formatNumber(importAnalysis.totalBols)} accentColor="text-blue-600" bgColor="bg-blue-100" />
                    <KpiCard icon={Users} label="Importadores" value={loadingImport ? "..." : formatNumber(importAnalysis.totalCompanies)} accentColor="text-emerald-600" bgColor="bg-emerald-100" />
                    <KpiCard icon={MapPin} label="Portos Envolvidos" value={loadingImport ? "..." : formatNumber(importAnalysis.totalPorts)} accentColor="text-amber-600" bgColor="bg-amber-100" />
                  </div>

                  <Card className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#D80E16]" />
                        Principais Importadores (ImportInfo BOLs)
                      </h3>
                      {loadingImport && (
                        <div className="space-y-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                              <div className="h-6 bg-slate-200 rounded-full w-28 animate-pulse" />
                            </div>
                          ))}
                        </div>
                      )}
                      {!loadingImport && importCompanies.length === 0 && (
                        <div className="text-center py-8">
                          <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                          <p className="text-sm font-bold text-slate-600">Nenhum importador encontrado para este SH6.</p>
                        </div>
                      )}
                      {!loadingImport && importCompanies.length > 0 && (
                        <div className="space-y-2">
                          {importCompanies.slice(0, 10).map((company, i) => (
                            <motion.div
                              key={company.slug}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-8 h-8 rounded-lg bg-[#D80E16]/10 flex items-center justify-center text-[#D80E16] font-bold text-sm shrink-0">
                                  {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-900 text-sm truncate">{company.name}</p>
                                  <p className="text-xs text-slate-500">
                                    {company.bol_count} BOLs &middot; {company.buyer_count} compradores
                                  </p>
                                </div>
                              </div>
                              <div className="text-left sm:text-right shrink-0 ml-11 sm:ml-0">
                                <span className="text-xs font-bold text-slate-600">
                                  {company.origin_ports.slice(0, 2).join(", ") || "N/A"}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* ─── TAB: EMPRESAS ─── */}
            <TabsContent value="empresas" className="mt-4 space-y-4">
              {!selectedHts && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-12 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-amber-50 rounded-2xl mb-4 border border-amber-200">
                      <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
                      Selecione um codigo HTS
                    </h3>
                    <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                      Clique em &quot;Analisar&quot; em um resultado HTS para ver as empresas importadoras.
                    </p>
                  </div>
                </motion.div>
              )}

              {selectedHts && (
                <>
                  <Card className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-[#D80E16]" />
                          Importadores dos EUA
                        </h3>
                        {importCompanies.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            {importCompanies.length} empresas
                          </span>
                        )}
                      </div>

                      {loadingImport && (
                        <div className="space-y-2">
                          {[1,2,3].map(i => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
                              <div className="h-6 bg-slate-200 rounded-full w-28 animate-pulse" />
                            </div>
                          ))}
                        </div>
                      )}

                      {!loadingImport && importCompanies.length === 0 && (
                        <div className="text-center py-10">
                          <Building2 className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                          <p className="text-lg font-bold text-slate-700">Nenhuma empresa encontrada</p>
                          <p className="text-sm text-slate-500 mt-1">Tente outro codigo HTS.</p>
                        </div>
                      )}

                      {!loadingImport && importCompanies.length > 0 && (
                        <div className="overflow-x-auto -mx-5 px-0">
                          <div className="min-w-[500px]">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="border-b border-slate-100">
                                  <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">#</th>
                                  <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Empresa</th>
                                  <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">BOLs</th>
                                  <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Compradores</th>
                                  <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Portos</th>
                                  <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {importCompanies.map((company, i) => (
                                  <motion.tr
                                    key={company.slug}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className={cn(
                                      "border-b border-slate-50 transition-colors",
                                      expandedCompany === company.slug ? "bg-[#D80E16]/5" : "hover:bg-slate-50/50",
                                    )}
                                  >
                                    <td className="px-5 py-4 text-xs font-black text-slate-400">{i + 1}</td>
                                    <td className="px-5 py-4">
                                      <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{company.name}</p>
                                      {company.commodities.length > 0 && (
                                        <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{company.commodities.slice(0, 2).join(", ")}</p>
                                      )}
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className="text-sm font-black text-slate-900">{formatNumber(company.bol_count)}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                      <span className="text-sm font-bold text-slate-700">{company.buyer_count}</span>
                                      {company.top_buyers.length > 0 && (
                                        <p className="text-[9px] text-slate-500 truncate max-w-[120px]">{company.top_buyers.slice(0, 2).join(", ")}</p>
                                      )}
                                    </td>
                                    <td className="px-5 py-4">
                                      <div className="flex flex-col gap-0.5">
                                        {company.dest_ports.slice(0, 2).map((p, pi) => (
                                          <span key={pi} className="text-[10px] font-medium text-slate-600">{p}</span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleLoadBols(company.slug)}
                                        className="text-[10px] font-bold h-8 px-2 rounded-lg"
                                      >
                                        {loadingBols && expandedCompany === company.slug ? (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : expandedCompany === company.slug ? (
                                          <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                          <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                      </Button>
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <AnimatePresence>
                    {expandedCompany && bols.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <Card className="border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                          <CardContent className="p-5 space-y-4">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                              <Ship className="w-5 h-5 text-[#D80E16]" />
                              BOLs Detalhados — {expandedCompany}
                            </h3>
                            <div className="overflow-x-auto -mx-5 px-0">
                              <div className="min-w-[550px]">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="border-b border-slate-100">
                                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Data</th>
                                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">BOL</th>
                                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Navio</th>
                                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Porto US</th>
                                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500">Origem</th>
                                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-wider text-slate-500 text-right">Peso</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bols.slice(0, 15).map((bol, i) => (
                                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3 text-xs font-medium text-slate-800 whitespace-nowrap">{bol.arrival_date || bol.run_date}</td>
                                        <td className="px-5 py-3 text-[10px] font-mono text-slate-600 max-w-[100px] truncate">{bol.master_bol}</td>
                                        <td className="px-5 py-3 text-xs font-medium text-slate-700 max-w-[100px] truncate">{bol.vessel}</td>
                                        <td className="px-5 py-3 text-xs text-slate-600">{bol.us_port}</td>
                                        <td className="px-5 py-3 text-xs text-slate-600">{bol.foreign_port}</td>
                                        <td className="px-5 py-3 text-xs font-bold text-right text-slate-800 whitespace-nowrap">{formatWeight(bol.weight_kg)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            {bols.length > 15 && (
                              <p className="text-[10px] font-bold text-slate-500 text-center">
                                Mostrando 15 de {bols.length} BOLs
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* ═══ NO RESULTS YET (initial) ═══ */}
        {!loading && results.length === 0 && !searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 sm:p-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-2xl mb-5 border border-white/10 backdrop-blur-sm">
                <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-white/60" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mb-3">
                HTS dos Estados Unidos
              </h2>
              <p className="text-sm font-medium text-slate-400 max-w-lg mx-auto leading-relaxed mb-6">
                Consulte o Harmonized Tariff Schedule — tarifas de importação dos EUA atualizadas (2026 Rev 8).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                {[
                  { label: "35.496", desc: "Registros indexados", icon: Database },
                  { label: "EUA", desc: "Tarifário oficial", icon: Globe },
                  { label: "ImportInfo", desc: "Dados de importação", icon: Ship },
                  { label: "IA", desc: "Explicações inteligentes", icon: Sparkles },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <stat.icon className="w-5 h-5 text-[#D80E16] mx-auto mb-2" />
                    <p className="text-base font-black text-white">{stat.label}</p>
                    <p className="text-[9px] font-bold text-slate-500">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ EMPTY STATE ═══ */}
        {!loading && results.length === 0 && searched && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl mb-4 border border-amber-200">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
                Nenhum resultado
              </h3>
              <p className="text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
                Tente buscar por um codigo HTS de 6 a 10 digitos ou uma descricao em ingles do produto.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {["6403.12.30", "8471.30.01", "6204.62.30", "electronic integrated circuits"].map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setSearchQuery(ex)}
                    className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:border-[#D80E16]/30 hover:text-[#D80E16] transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ LOADING SKELETON ═══ */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-6 bg-slate-200 rounded-full w-28 animate-pulse" />
                  <div className="h-5 bg-slate-200 rounded-md w-16 animate-pulse" />
                </div>
                <div className="h-4 bg-slate-100 rounded-lg w-3/4 animate-pulse mb-2" />
                <div className="h-4 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default HtsLookup;
