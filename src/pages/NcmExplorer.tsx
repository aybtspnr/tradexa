"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Loader2, ChevronRight, ChevronDown,
  Package, Globe, DollarSign, TrendingUp, TrendingDown,
  BookOpen, Layers, FolderTree, AlertCircle,
  ArrowLeft, X, Hash, FileText,
} from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import { GlassKpi, GlassCard } from "@/components/GlassKpi";
import { cn } from "@/lib/utils";
import { comexstat } from "@/services/comexstat";
import GlobalMarketSection from "@/components/intel/GlobalMarketSection";

/* ═══════════════════ TYPES ═══════════════════ */

interface NcmSuggestion {
  code: string;
  description: string;
}

interface NcmTradeData {
  importFob: number;
  exportFob: number;
  importKg: number;
  exportKg: number;
  importCountries: number;
  exportCountries: number;
  totalCountries: number;
  importPartners: { pais_nome: string; vl_fob: number; kg_liquido: number }[];
  exportPartners: { pais_nome: string; vl_fob: number; kg_liquido: number }[];
}

interface HierarchyNode {
  code: string;
  description: string;
  level: "chapter" | "position" | "subposition" | "item";
  children?: HierarchyNode[];
  hasTradeData?: boolean;
}

type DrillLevel = "chapters" | "positions" | "subpositions" | "items";

/* ═══════════════════ CONSTANTS ═══════════════════ */

const NCM_CHAPTERS: { code: string; description: string }[] = [
  { code: "01", description: "Animais vivos" },
  { code: "02", description: "Carnes e miudezas comestíveis" },
  { code: "03", description: "Peixes e crustáceos" },
  { code: "04", description: "Leite e laticínios; ovos; mel" },
  { code: "05", description: "Produtos de origem animal, não especificados" },
  { code: "06", description: "Plantas vivas e produtos de floricultura" },
  { code: "07", description: "Produtos hortícolas" },
  { code: "08", description: "Frutas e frutos próprios para consumo" },
  { code: "09", description: "Café, chá, mate e especiarias" },
  { code: "10", description: "Cereais" },
  { code: "11", description: "Produtos da indústria de moagem" },
  { code: "12", description: "Sementes e frutos oleaginosos" },
  { code: "13", description: "Gomas, resinas e outros sucos vegetais" },
  { code: "14", description: "Matérias para entrançar" },
  { code: "15", description: "Gorduras e óleos animais/vegetais" },
  { code: "16", description: "Preparações de carne, peixe ou crustáceos" },
  { code: "17", description: "Açúcares e produtos de confeitaria" },
  { code: "18", description: "Cacau e suas preparações" },
  { code: "19", description: "Preparações à base de cereais" },
  { code: "20", description: "Preparações de produtos hortícolas/frutas" },
  { code: "21", description: "Preparações alimentícias diversas" },
  { code: "22", description: "Bebidas, líquidos alcoólicos e vinagre" },
  { code: "23", description: "Resíduos das indústrias alimentares" },
  { code: "24", description: "Tabaco e seus sucedâneos" },
  { code: "25", description: "Sal; enxofre; terras e pedras" },
  { code: "26", description: "Minérios, escórias e cinzas" },
  { code: "27", description: "Combustíveis minerais, óleos minerais" },
  { code: "28", description: "Produtos químicos inorgânicos" },
  { code: "29", description: "Produtos químicos orgânicos" },
  { code: "30", description: "Produtos farmacêuticos" },
  { code: "31", description: "Adubos ou fertilizantes" },
  { code: "32", description: "Extratos tanantes e tintoriais" },
  { code: "33", description: "Óleos essenciais e resinoides" },
  { code: "34", description: "Sabões, agentes orgânicos de superfície" },
  { code: "35", description: "Matérias albuminoideas; colas" },
  { code: "36", description: "Pólvora e explosivos" },
  { code: "37", description: "Produtos para fotografia e cinema" },
  { code: "38", description: "Produtos químicos diversos" },
  { code: "39", description: "Plásticos e suas obras" },
  { code: "40", description: "Borracha e suas obras" },
  { code: "41", description: "Peles e couros" },
  { code: "42", description: "Obras de couro; artigos de viagem" },
  { code: "43", description: "Peles com pelo e suas obras" },
  { code: "44", description: "Madeira e obras de madeira" },
  { code: "45", description: "Cortiça e suas obras" },
  { code: "46", description: "Obras de cestaria" },
  { code: "47", description: "Pastas de madeira" },
  { code: "48", description: "Papel e cartão" },
  { code: "49", description: "Livros, jornais e gravuras" },
  { code: "50", description: "Seda" },
  { code: "51", description: "Lã, pelos finos/grosseiros" },
  { code: "52", description: "Algodão" },
  { code: "53", description: "Outras fibras têxteis vegetais" },
  { code: "54", description: "Filamentos sintéticos/artificiais" },
  { code: "55", description: "Fibras sintéticas/artificiais descontínuas" },
  { code: "56", description: "Pastas, feltros e não-tecidos" },
  { code: "57", description: "Tapetes e revestimentos para pavimentos" },
  { code: "58", description: "Tecidos especiais" },
  { code: "59", description: "Tecidos impregnados/revestidos" },
  { code: "60", description: "Tecidos de malha" },
  { code: "61", description: "Vestuário de malha" },
  { code: "62", description: "Vestuário exceto de malha" },
  { code: "63", description: "Outros artefatos têxteis" },
  { code: "64", description: "Calçados e suas partes" },
  { code: "65", description: "Chapéus e artefatos de uso semelhante" },
  { code: "66", description: "Guarda-chuvas, bengalas" },
  { code: "67", description: "Penas e flores artificiais" },
  { code: "68", description: "Obras de pedra, gesso, cimento" },
  { code: "69", description: "Produtos cerâmicos" },
  { code: "70", description: "Vidro e suas obras" },
  { code: "71", description: "Pérolas, pedras preciosas" },
  { code: "72", description: "Ferro fundido, ferro e aço" },
  { code: "73", description: "Obras de ferro fundido, ferro e aço" },
  { code: "74", description: "Cobre e suas obras" },
  { code: "75", description: "Níquel e suas obras" },
  { code: "76", description: "Alumínio e suas obras" },
  { code: "77", description: "(Reservado)" },
  { code: "78", description: "Chumbo e suas obras" },
  { code: "79", description: "Zinco e suas obras" },
  { code: "80", description: "Estanho e suas obras" },
  { code: "81", description: "Outros metais comuns" },
  { code: "82", description: "Ferramentas e artefatos de metais comuns" },
  { code: "83", description: "Obras diversas de metais comuns" },
  { code: "84", description: "Máquinas e aparelhos mecânicos" },
  { code: "85", description: "Máquinas e aparelhos elétricos" },
  { code: "86", description: "Veículos e material para vias férreas" },
  { code: "87", description: "Automóveis, tratores e ciclos" },
  { code: "88", description: "Aeronaves e veículos espaciais" },
  { code: "89", description: "Embarcações e estruturas flutuantes" },
  { code: "90", description: "Instrumentos de óptica, fotografia, cinema" },
  { code: "91", description: "Relojoaria" },
  { code: "92", description: "Instrumentos musicais" },
  { code: "93", description: "Armas e munições" },
  { code: "94", description: "Móveis; mobiliário médico-cirúrgico" },
  { code: "95", description: "Brinquedos, jogos, artigos esportivos" },
  { code: "96", description: "Obras diversas" },
  { code: "97", description: "Objetos de arte, coleção e antiguidades" },
  { code: "98", description: "(Reservado)" },
  { code: "99", description: "(Reservado)" },
];

const SECTION_NAMES: { chapters: [number, number]; name: string }[] = [
  { chapters: [1, 5], name: "I — Animais vivos e produtos do reino animal" },
  { chapters: [6, 14], name: "II — Produtos do reino vegetal" },
  { chapters: [15, 15], name: "III — Gorduras e óleos animais/vegetais" },
  { chapters: [16, 24], name: "IV — Indústrias alimentares" },
  { chapters: [25, 27], name: "V — Produtos minerais" },
  { chapters: [28, 38], name: "VI — Produtos químicos" },
  { chapters: [39, 40], name: "VII — Plásticos e borracha" },
  { chapters: [41, 43], name: "VIII — Peles e couros" },
  { chapters: [44, 46], name: "IX — Madeira e obras" },
  { chapters: [47, 49], name: "X — Pastas de madeira e papel" },
  { chapters: [50, 63], name: "XI — Têxteis" },
  { chapters: [64, 67], name: "XII — Calçados e artefatos" },
  { chapters: [68, 70], name: "XIII — Obras de pedra, cerâmica, vidro" },
  { chapters: [71, 71], name: "XIV — Pérolas e pedras preciosas" },
  { chapters: [72, 83], name: "XV — Metais comuns" },
  { chapters: [84, 85], name: "XVI — Máquinas e equipamentos" },
  { chapters: [86, 89], name: "XVII — Material de transporte" },
  { chapters: [90, 92], name: "XVIII — Instrumentos e relojoaria" },
  { chapters: [93, 93], name: "XIX — Armas e munições" },
  { chapters: [94, 96], name: "XX — Mercadorias diversas" },
  { chapters: [97, 97], name: "XXI — Objetos de arte" },
];

/* ═══════════════════ HELPERS ═══════════════════ */

function formatNcmCode(code: string): string {
  const digits = (code || "").replace(/\D/g, "");
  if (digits.length >= 8) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
  if (digits.length >= 6) return `${digits.slice(0, 4)}.${digits.slice(4, 6)}`;
  if (digits.length >= 4) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}`;
  return code;
}

function formatCurrencyShort(n: number): string {
  if (!n) return "US$ 0";
  if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `US$ ${(n / 1_000).toFixed(2)}K`;
  return `US$ ${n.toFixed(0)}`;
}

function formatCurrencyFull(n: number): string {
  if (!n) return "US$ 0";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function getChapterNumber(code: string): string {
  return code.replace(/\D/g, "").substring(0, 2);
}

function getChapterDescription(chapter: string): string {
  const ch = NCM_CHAPTERS.find((c) => c.code === chapter);
  return ch?.description || `Capítulo ${chapter}`;
}

function getSectionForChapter(chapter: string): string {
  const num = parseInt(chapter, 10);
  const section = SECTION_NAMES.find((s) => num >= s.chapters[0] && num <= s.chapters[1]);
  return section?.name || "";
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function NcmExplorer() {
  useSeo({
    title: "NCM Explorer — TRADEXA",
    description: "Navegue pela classificação completa de NCMs. Explore capítulos, posições e subposições do Sistema Harmonizado.",
    keywords: "NCM, classificação fiscal, capítulos NCM, posições NCM, comércio exterior, classificação mercadorias",
    ogType: "website",
  });

  /* ── State ── */

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<NcmSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedSubposition, setSelectedSubposition] = useState<string | null>(null);
  const [selectedNcm, setSelectedNcm] = useState<string | null>(null);
  const [selectedNcmDesc, setSelectedNcmDesc] = useState("");

  const [drillData, setDrillData] = useState<NcmSuggestion[]>([]);
  const [loadingDrill, setLoadingDrill] = useState(false);
  const [tradeData, setTradeData] = useState<NcmTradeData | null>(null);
  const [loadingTrade, setLoadingTrade] = useState(false);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const [availableYears, setAvailableYears] = useState<string[]>(["2025", "2026"]);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [activeTab, setActiveTab] = useState<"explorer" | "search">("explorer");

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  /* ── Fetch available years ── */

  useEffect(() => {
    (async () => {
      try {
        const yearsData = await comexstat.getAvailableYears();
        if (yearsData?.data?.list) {
          const years = yearsData.data.list.map((y: any) => String(y)).sort();
          if (years.length > 0) {
            setAvailableYears(years);
            setSelectedYear(years[years.length - 1]);
          }
        }
      } catch {
        // fallback to defaults
      }
    })();
  }, []);

  /* ── NCM search autocomplete ── */

  useEffect(() => {
    const fetchSuggestions = async () => {
      const digits = searchTerm.replace(/\D/g, "");
      if (digits.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const { data } = await supabase
          .from("ncms")
          .select("code, description")
          .like("code", `${digits}%`)
          .limit(10);
        setSuggestions(data || []);
        setShowSuggestions((data || []).length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!inputRef.current?.contains(e.target as Node) && !suggestionsRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selectSuggestion = useCallback((code: string) => {
    setSearchTerm(formatNcmCode(code));
    setShowSuggestions(false);
    selectNcmFull(code);
  }, []);

  /* ── Chapter drill logic ── */

  const loadDrillData = useCallback(async (prefix: string) => {
    setLoadingDrill(true);
    try {
      const { data } = await supabase
        .from("ncms")
        .select("code, description")
        .like("code", `${prefix}%`)
        .limit(200);
      setDrillData(data || []);
    } catch {
      setDrillData([]);
    } finally {
      setLoadingDrill(false);
    }
  }, []);

  const selectChapter = useCallback((chapter: string) => {
    setSelectedChapter(chapter);
    setSelectedPosition(null);
    setSelectedSubposition(null);
    setSelectedNcm(null);
    setSelectedNcmDesc("");
    setTradeData(null);
    setTradeError(null);
    loadDrillData(chapter);
  }, [loadDrillData]);

  const selectPosition = useCallback((position: string, desc: string) => {
    setSelectedPosition(position);
    setSelectedSubposition(null);
    setSelectedNcm(null);
    setSelectedNcmDesc(desc || "");
    setTradeData(null);
    setTradeError(null);
    loadDrillData(position);
  }, [loadDrillData]);

  const selectSubposition = useCallback((sub: string, desc: string) => {
    setSelectedSubposition(sub);
    setSelectedNcm(null);
    setSelectedNcmDesc(desc || "");
    setTradeData(null);
    setTradeError(null);
    loadDrillData(sub);
  }, [loadDrillData]);

  const selectNcmFull = useCallback((code: string, desc?: string) => {
    const clean = code.replace(/\D/g, "");
    setSelectedNcm(clean);
    setSelectedNcmDesc(desc || "");
    setSelectedChapter(getChapterNumber(clean));
    setSelectedPosition(clean.substring(0, 4));
    setSelectedSubposition(clean.substring(0, 6));
    setDrillData([]);
    setTradeData(null);
    setTradeError(null);
  }, []);

  /* ── Trade data fetching ── */

  const fetchTradeData = useCallback(async (ncmClean: string) => {
    if (!ncmClean || ncmClean.length < 4) return;
    setLoadingTrade(true);
    setTradeError(null);
    try {
      const [importResult, exportResult] = await Promise.allSettled([
        supabase.functions.invoke("import-data", {
          body: { ncm: ncmClean, tipo: "IMP", anoDe: selectedYear, mesDe: "_all", anoAte: selectedYear, mesAte: "_all" },
        }),
        supabase.functions.invoke("export-data", {
          body: { ncm: ncmClean, tipo: "EXP", anoDe: selectedYear, mesDe: "_all", anoAte: selectedYear, mesAte: "_all" },
        }),
      ]);

      const importRegistros: any[] = [];
      const exportRegistros: any[] = [];

      if (importResult.status === "fulfilled") {
        const d = importResult.value;
        if (!d.error && !d.data?.error && d.data?.registros) {
          importRegistros.push(...d.data.registros);
        }
      }
      if (exportResult.status === "fulfilled") {
        const d = exportResult.value;
        if (!d.error && !d.data?.error && d.data?.registros) {
          exportRegistros.push(...d.data.registros);
        }
      }

      // Aggregate partners
      const importPartnerMap = new Map<string, { vl_fob: number; kg_liquido: number }>();
      for (const r of importRegistros) {
        const key = r.pais_nome || r.co_pais || "outros";
        const existing = importPartnerMap.get(key) || { vl_fob: 0, kg_liquido: 0 };
        existing.vl_fob += r.vl_fob || 0;
        existing.kg_liquido += r.kg_liquido || 0;
        importPartnerMap.set(key, existing);
      }

      const exportPartnerMap = new Map<string, { vl_fob: number; kg_liquido: number }>();
      for (const r of exportRegistros) {
        const key = r.pais_nome || r.co_pais || "outros";
        const existing = exportPartnerMap.get(key) || { vl_fob: 0, kg_liquido: 0 };
        existing.vl_fob += r.vl_fob || 0;
        existing.kg_liquido += r.kg_liquido || 0;
        exportPartnerMap.set(key, existing);
      }

      const importFob = importRegistros.reduce((sum, r) => sum + (r.vl_fob || 0), 0);
      const exportFob = exportRegistros.reduce((sum, r) => sum + (r.vl_fob || 0), 0);
      const importKg = importRegistros.reduce((sum, r) => sum + (r.kg_liquido || 0), 0);
      const exportKg = exportRegistros.reduce((sum, r) => sum + (r.kg_liquido || 0), 0);

      setTradeData({
        importFob,
        exportFob,
        importKg,
        exportKg,
        importCountries: importPartnerMap.size,
        exportCountries: exportPartnerMap.size,
        totalCountries: new Set([...importPartnerMap.keys(), ...exportPartnerMap.keys()]).size,
        importPartners: Array.from(importPartnerMap.entries())
          .map(([pais_nome, v]) => ({ pais_nome, ...v }))
          .sort((a, b) => b.vl_fob - a.vl_fob)
          .slice(0, 10),
        exportPartners: Array.from(exportPartnerMap.entries())
          .map(([pais_nome, v]) => ({ pais_nome, ...v }))
          .sort((a, b) => b.vl_fob - a.vl_fob)
          .slice(0, 10),
      });
    } catch (err: any) {
      setTradeError(err.message || "Erro ao carregar dados comerciais");
    } finally {
      setLoadingTrade(false);
    }
  }, [selectedYear]);

  /* ── Select NCM item from drill data / fetch trade data ── */

  const selectNcmFromDrill = useCallback((code: string, desc: string) => {
    const clean = code.replace(/\D/g, "");
    setSelectedNcm(clean);
    setSelectedNcmDesc(desc);
    fetchTradeData(clean);
  }, [fetchTradeData]);

  /* ── Group drill data by level ── */

  const groupedByPosition = useMemo(() => {
    if (!selectedChapter || !drillData.length) return [];
    const map = new Map<string, { count: number; example: string }>();
    for (const item of drillData) {
      const pos = item.code.replace(/\D/g, "").substring(0, 4);
      const existing = map.get(pos) || { count: 0, example: "" };
      existing.count++;
      if (!existing.example) existing.example = item.description;
      map.set(pos, existing);
    }
    return Array.from(map.entries())
      .map(([code, info]) => ({ code, description: info.example || `Posição ${code}`, count: info.count }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [selectedChapter, drillData]);

  const groupedBySubposition = useMemo(() => {
    if (!selectedPosition || !drillData.length) return [];
    const map = new Map<string, { count: number; example: string }>();
    for (const item of drillData) {
      const sub = item.code.replace(/\D/g, "").substring(0, 6);
      const existing = map.get(sub) || { count: 0, example: "" };
      existing.count++;
      if (!existing.example) existing.example = item.description;
      map.set(sub, existing);
    }
    return Array.from(map.entries())
      .map(([code, info]) => ({ code, description: info.example || `Subposição ${code}`, count: info.count }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [selectedPosition, drillData]);

  const itemsList = useMemo(() => {
    if (!selectedSubposition || !drillData.length) return [];
    return drillData
      .map((d) => ({ ...d, codeClean: d.code.replace(/\D/g, "") }))
      .sort((a, b) => a.codeClean.localeCompare(b.codeClean));
  }, [selectedSubposition, drillData]);

  /* ── Breadcrumb ── */

  const breadcrumb = useMemo(() => {
    const crumbs: { label: string; code: string; onClick: () => void }[] = [];

    if (selectedChapter) {
      crumbs.push({
        label: `Cap. ${selectedChapter} — ${getChapterDescription(selectedChapter).slice(0, 30)}`,
        code: selectedChapter,
        onClick: () => selectChapter(selectedChapter),
      });
    }
    if (selectedPosition) {
      crumbs.push({
        label: formatNcmCode(selectedPosition),
        code: selectedPosition,
        onClick: () => selectPosition(selectedPosition, selectedNcmDesc),
      });
    }
    if (selectedSubposition) {
      crumbs.push({
        label: formatNcmCode(selectedSubposition),
        code: selectedSubposition,
        onClick: () => selectSubposition(selectedSubposition, selectedNcmDesc),
      });
    }
    if (selectedNcm) {
      crumbs.push({
        label: formatNcmCode(selectedNcm),
        code: selectedNcm,
        onClick: () => {},
      });
    }
    return crumbs;
  }, [selectedChapter, selectedPosition, selectedSubposition, selectedNcm, selectedNcmDesc, selectChapter, selectPosition, selectSubposition]);

  /* ── Fetch trade data when NCM selected ── */

  useEffect(() => {
    if (selectedNcm && selectedNcm.length >= 4) {
      fetchTradeData(selectedNcm);
    }
  }, [selectedNcm, fetchTradeData]);

  /* ── View switching for search results ── */

  const hasSearchSelection = !!selectedNcm;
  const isExploring = !hasSearchSelection && !selectedChapter;

  /* ═══════════════════ RENDER ═══════════════════ */

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1600px] mx-auto" style={{ paddingTop: "8px" }}>
      <PageHeader
        title="NCM Explorer"
        subtitle="Navegue pela classificação completa de NCMs — capítulos, posições, subposições e dados comerciais"
        badges={[
          { label: `${NCM_CHAPTERS.length} Capítulos` },
          { label: "Sistema Harmonizado", className: "bg-emerald-500/30" },
          { label: selectedYear, className: "bg-blue-500/30" },
        ]}
        variant="emerald"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white/10 border border-white/20 text-white text-xs font-bold rounded-lg px-3 py-2 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 [&>option]:bg-slate-800"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* ── Search Bar ── */}
      <div className="relative" ref={inputRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Buscar NCM por código (mín. 2 dígitos) ou descrição..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-slate-700/40 bg-slate-900/60 backdrop-blur-xl text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(""); setSuggestions([]); setShowSuggestions(false); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-700/40 bg-slate-900/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              {suggestions.map((s) => (
                <button
                  key={s.code}
                  onClick={() => selectSuggestion(s.code)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-800/60 transition-colors border-b border-slate-700/20 last:border-0"
                >
                  <Hash className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white font-mono">{formatNcmCode(s.code)}</span>
                    <p className="text-xs text-slate-400 truncate">{s.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Breadcrumb (when drilling) ── */}
      {breadcrumb.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center flex-wrap gap-1.5 text-sm"
        >
          <button
            onClick={() => {
              setSelectedChapter(null);
              setSelectedPosition(null);
              setSelectedSubposition(null);
              setSelectedNcm(null);
              setSelectedNcmDesc("");
              setTradeData(null);
              setDrillData([]);
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-800/40"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Capítulos</span>
          </button>
          {breadcrumb.map((crumb, i) => (
            <div key={crumb.code + i} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <button
                onClick={crumb.onClick}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                  i === breadcrumb.length - 1
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/40"
                )}
              >
                {crumb.label}
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Main content area ── */}
      <AnimatePresence mode="wait">
        {isExploring && !hasSearchSelection && (
          /* ═══════ CHAPTERS GRID ═══════ */
          <motion.div
            key="chapters"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            {/* Section overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {SECTION_NAMES.map((section, i) => {
                const chStart = String(section.chapters[0]).padStart(2, "0");
                const chEnd = String(section.chapters[1]).padStart(2, "0");
                return (
                  <GlassCard key={i} className="p-4" delay={i * 0.02}>
                    <div className="flex items-start gap-3">
                      <Layers className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                          Cap. {chStart}{chStart !== chEnd ? `–${chEnd}` : ""}
                        </p>
                        <p className="text-sm font-bold text-white truncate">{section.name.replace(/^[—\s]+/, "")}</p>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {/* Chapter cards grid */}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Todos os Capítulos ({NCM_CHAPTERS.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {NCM_CHAPTERS.map((ch, i) => (
                  <motion.button
                    key={ch.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.008 }}
                    onClick={() => selectChapter(ch.code)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border border-slate-700/30",
                      "bg-slate-900/40 backdrop-blur-xl p-3.5 text-left",
                      "transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10",
                      "hover:-translate-y-0.5 hover:border-emerald-500/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <span className="text-xs font-black text-emerald-400 font-mono">{ch.code}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] leading-snug font-semibold text-white line-clamp-2">
                          {ch.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedChapter && !selectedPosition && (
          /* ═══════ POSITIONS VIEW ═══════ */
          <motion.div
            key="positions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">
                  Capítulo {selectedChapter} — {getChapterDescription(selectedChapter)}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {groupedByPosition.length} posições encontradas
                  {getSectionForChapter(selectedChapter) && (
                    <span className="ml-2 text-xs text-slate-500">
                      ({getSectionForChapter(selectedChapter)})
                    </span>
                  )}
                </p>
              </div>
            </div>

            {loadingDrill ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {groupedByPosition.map((pos, i) => (
                  <motion.button
                    key={pos.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.01 }}
                    onClick={() => selectPosition(pos.code, pos.description)}
                    className="group relative overflow-hidden rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-xl p-4 text-left transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 hover:border-emerald-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <span className="text-xs font-black text-blue-400 font-mono">{formatNcmCode(pos.code)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug font-medium text-white line-clamp-2 mb-1">
                          {pos.description}
                        </p>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {pos.count} {pos.count === 1 ? "item" : "itens"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {selectedPosition && !selectedSubposition && (
          /* ═══════ SUBPOSITIONS VIEW ═══════ */
          <motion.div
            key="subpositions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg font-black text-white">
                Posição {formatNcmCode(selectedPosition)}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {groupedBySubposition.length} subposições encontradas
              </p>
            </div>

            {loadingDrill ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {groupedBySubposition.map((sub, i) => (
                  <motion.button
                    key={sub.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.01 }}
                    onClick={() => selectSubposition(sub.code, sub.description)}
                    className="group relative overflow-hidden rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-xl p-4 text-left transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 hover:border-emerald-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <span className="text-xs font-black text-violet-400 font-mono">{formatNcmCode(sub.code)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-snug font-medium text-white line-clamp-2 mb-1">
                          {sub.description}
                        </p>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {sub.count} {sub.count === 1 ? "item" : "itens"}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-emerald-400 transition-all" />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {selectedSubposition && !selectedNcm && (
          /* ═══════ ITEMS VIEW ═══════ */
          <motion.div
            key="items"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-lg font-black text-white">
                Subposição {formatNcmCode(selectedSubposition)}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {itemsList.length} NCMs encontrados
              </p>
            </div>

            {loadingDrill ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : itemsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <AlertCircle className="w-10 h-10 mb-3" />
                <p className="font-medium">Nenhum NCM completo encontrado nesta subposição</p>
                <p className="text-sm">Tente buscar diretamente pelo código</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {itemsList.map((item, i) => (
                  <motion.button
                    key={item.code}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.008 }}
                    onClick={() => selectNcmFromDrill(item.code, item.description)}
                    className="group relative overflow-hidden rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-xl p-4 text-left transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5 hover:border-emerald-500/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white font-mono">
                          {formatNcmCode(item.code)}
                        </p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                          {item.description || "Sem descrição"}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {hasSearchSelection && (
          /* ═══════ NCM DETAIL VIEW ═══════ */
          <motion.div
            key="ncm-detail"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-6"
          >
            {/* Back button */}
            {!selectedSubposition && (
              <button
                onClick={() => {
                  setSelectedNcm(null);
                  setSelectedSubposition(null);
                  setSelectedPosition(null);
                  setSelectedChapter(null);
                  setTradeData(null);
                }}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para capítulos
              </button>
            )}

            {/* NCM header */}
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                  <Hash className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black text-white font-mono">
                    {formatNcmCode(selectedNcm || "")}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1 line-clamp-3">
                    {selectedNcmDesc || "NCM sem descrição disponível"}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-full">
                      Cap. {selectedChapter}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-full">
                      Pos. {formatNcmCode(selectedPosition || "")}
                    </span>
                    {selectedSubposition && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-full">
                        Sub. {formatNcmCode(selectedSubposition)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* ── KPI Cards ── */}
            {loadingTrade ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : tradeError ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <AlertCircle className="w-8 h-8 mb-2 text-amber-400" />
                <p className="text-sm font-medium text-amber-400">{tradeError}</p>
              </div>
            ) : tradeData ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <GlassKpi
                    label="Importação FOB"
                    value={formatCurrencyShort(tradeData.importFob)}
                    variant="blue"
                    delay={0}
                  />
                  <GlassKpi
                    label="Exportação FOB"
                    value={formatCurrencyShort(tradeData.exportFob)}
                    variant="emerald"
                    delay={0.1}
                  />
                  <GlassKpi
                    label="Países Importadores"
                    value={String(tradeData.importCountries)}
                    variant="violet"
                    delay={0.2}
                  />
                  <GlassKpi
                    label="Países Exportadores"
                    value={String(tradeData.exportCountries)}
                    variant="amber"
                    delay={0.3}
                  />
                </div>

                {/* Trade totals in full format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassCard className="p-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-3.5 h-3.5 text-blue-400" />
                      Importação — Top Países
                    </h3>
                    {tradeData.importPartners.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum dado de importação disponível</p>
                    ) : (
                      <div className="space-y-2">
                        {tradeData.importPartners.map((p, i) => (
                          <div key={p.pais_nome} className="flex items-center justify-between py-1.5 border-b border-slate-700/20 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] font-bold text-slate-600 w-4 shrink-0">{i + 1}</span>
                              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="text-sm text-slate-300 truncate">{p.pais_nome}</span>
                            </div>
                            <span className="text-sm font-bold text-blue-400 tabular-nums shrink-0 ml-2">
                              {formatCurrencyShort(p.vl_fob)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>

                  <GlassCard className="p-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Exportação — Top Países
                    </h3>
                    {tradeData.exportPartners.length === 0 ? (
                      <p className="text-sm text-slate-500">Nenhum dado de exportação disponível</p>
                    ) : (
                      <div className="space-y-2">
                        {tradeData.exportPartners.map((p, i) => (
                          <div key={p.pais_nome} className="flex items-center justify-between py-1.5 border-b border-slate-700/20 last:border-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[10px] font-bold text-slate-600 w-4 shrink-0">{i + 1}</span>
                              <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="text-sm text-slate-300 truncate">{p.pais_nome}</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-400 tabular-nums shrink-0 ml-2">
                              {formatCurrencyShort(p.vl_fob)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassCard>
                </div>

                {/* Trade summary metrics */}
                <GlassCard className="p-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    Resumo Comercial — {selectedYear}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Imp. FOB Total</p>
                      <p className="text-lg font-black text-blue-400">{formatCurrencyFull(tradeData.importFob)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Exp. FOB Total</p>
                      <p className="text-lg font-black text-emerald-400">{formatCurrencyFull(tradeData.exportFob)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Imp. Kg</p>
                      <p className="text-lg font-black text-blue-300/80">
                        {tradeData.importKg >= 1_000_000
                          ? `${(tradeData.importKg / 1_000_000).toFixed(1)}M kg`
                          : `${(tradeData.importKg / 1_000).toFixed(0)}K kg`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Exp. Kg</p>
                      <p className="text-lg font-black text-emerald-300/80">
                        {tradeData.exportKg >= 1_000_000
                          ? `${(tradeData.exportKg / 1_000_000).toFixed(1)}M kg`
                          : `${(tradeData.exportKg / 1_000).toFixed(0)}K kg`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Países (imp.)</p>
                      <p className="text-lg font-black text-violet-400">{tradeData.importCountries}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Países (exp.)</p>
                      <p className="text-lg font-black text-amber-400">{tradeData.exportCountries}</p>
                    </div>
                  </div>
                </GlassCard>
              </>
            ) : (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <DollarSign className="w-8 h-8 mb-2 text-slate-600" />
                <p className="text-sm font-medium">Selecione um NCM completo (8 dígitos) para ver dados comerciais</p>
              </div>
            )}

            {/* ── Hierarchy Tree / Accordion ── */}
            {selectedNcm && (
              <GlassCard className="p-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                  Hierarquia NCM
                </h3>
                <div className="space-y-0">
                  {/* Chapter */}
                  <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-slate-800/40 border border-slate-700/20">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <span className="text-[10px] font-black text-emerald-400">01–{selectedChapter}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white">
                        Capítulo {selectedChapter}
                      </p>
                      <p className="text-[10px] text-slate-400">{getChapterDescription(selectedChapter || "")}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Seção {getSectionForChapter(selectedChapter || "").split("—")[0]?.trim() || "—"}</span>
                  </div>

                  {/* Vertical connector */}
                  <div className="flex items-center justify-center">
                    <div className="w-px h-5 bg-slate-700/40" />
                  </div>

                  {/* Position */}
                  <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-slate-800/40 border border-slate-700/20">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <span className="text-[10px] font-black text-blue-400">{formatNcmCode(selectedPosition || "")}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white">
                        Posição {formatNcmCode(selectedPosition || "")}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {drillData.find((d) => d.code.replace(/\D/g, "").startsWith(selectedPosition || ""))?.description || selectedNcmDesc.slice(0, 60) || "—"}
                      </p>
                    </div>
                  </div>

                  {selectedSubposition && (
                    <>
                      <div className="flex items-center justify-center">
                        <div className="w-px h-5 bg-slate-700/40" />
                      </div>

                      {/* Subposition */}
                      <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-slate-800/40 border border-slate-700/20">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                          <span className="text-[10px] font-black text-violet-400">{formatNcmCode(selectedSubposition)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white">
                            Subposição {formatNcmCode(selectedSubposition)}
                          </p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {drillData.find((d) => d.code.replace(/\D/g, "").startsWith(selectedSubposition))?.description || selectedNcmDesc.slice(0, 60) || "—"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-center">
                    <div className="w-px h-5 bg-slate-700/40" />
                  </div>

                  {/* Item (NCM) */}
                  <div className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-emerald-400">
                        NCM {formatNcmCode(selectedNcm || "")}
                      </p>
                      <p className="text-[10px] text-slate-300 line-clamp-2">{selectedNcmDesc || "—"}</p>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-500/60 px-2 py-1 rounded bg-emerald-500/10">
                      Item
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* ── Global Market Context ── */}
            {selectedNcm && (
              <div className="mt-8">
                <GlobalMarketSection ncm={selectedNcm.replace(/\D/g, "").slice(0, 6)} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
