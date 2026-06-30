"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Globe, Building2, MapPin, TrendingUp, ArrowRight, ArrowLeft,
  Loader2, Sparkles, Zap, Crown, Users, Package, ChevronRight, Filter,
  BarChart3, Target, CheckCircle2, Star, X, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useSeo } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";
import { groqChat } from "@/services/groq";
import { toast } from "sonner";
import { ProtectedFeature } from "@/components/ProtectedFeature";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useUsage } from "@/hooks/use-usage";
import { calculateCost } from "@/lib/usage-costs";

const API_EDGE_FN = "importadores-api";

async function apiFetch(path: string) {
  // Direct Vercel rewrite to VPS Intel API (HTTPS proxy)
  try {
    const url = `/api/intel/importadores${path}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (res.ok) return res.json();
  } catch {}
  return null;
}

// ── Types ──
interface HsGuess { hs: string; desc: string; confidence: number; }
interface CountryCount { country: string; company_count: number; }
interface Importer {
  id: string;
  company_name: string;
  country: string;
  city: string | null;
  category: string | null;
  employees: number | null;
  products_count: number | null;
  turnover: string | null;
  source: string;
}

// ── Data ──
const TOP_COUNTRIES = [
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "DEU", name: "Alemanha", flag: "🇩🇪" },
  { code: "CHN", name: "China", flag: "🇨🇳" },
  { code: "FRA", name: "França", flag: "🇫🇷" },
  { code: "JPN", name: "Japão", flag: "🇯🇵" },
  { code: "GBR", name: "Reino Unido", flag: "🇬🇧" },
  { code: "ITA", name: "Itália", flag: "🇮🇹" },
  { code: "ESP", name: "Espanha", flag: "🇪🇸" },
  { code: "NLD", name: "Holanda", flag: "🇳🇱" },
  { code: "CAN", name: "Canadá", flag: "🇨🇦" },
  { code: "MEX", name: "México", flag: "🇲🇽" },
  { code: "BEL", name: "Bélgica", flag: "🇧🇪" },
  { code: "KOR", name: "Coreia do Sul", flag: "🇰🇷" },
  { code: "AUS", name: "Austrália", flag: "🇦🇺" },
  { code: "TUR", name: "Turquia", flag: "🇹🇷" },
];

const ALL_COUNTRIES = [
  ...TOP_COUNTRIES,
  { code: "ARG", name: "Argentina", flag: "🇦🇷" },
  { code: "CHL", name: "Chile", flag: "🇨🇱" },
  { code: "COL", name: "Colômbia", flag: "🇨🇴" },
  { code: "SWE", name: "Suécia", flag: "🇸🇪" },
  { code: "CHE", name: "Suíça", flag: "🇨🇭" },
  { code: "POL", name: "Polônia", flag: "🇵🇱" },
  { code: "AUT", name: "Áustria", flag: "🇦🇹" },
  { code: "DNK", name: "Dinamarca", flag: "🇩🇰" },
  { code: "NOR", name: "Noruega", flag: "🇳🇴" },
  { code: "FIN", name: "Finlândia", flag: "🇫🇮" },
  { code: "RUS", name: "Rússia", flag: "🇷🇺" },
  { code: "BRA", name: "Brasil", flag: "🇧🇷" },
  { code: "IND", name: "Índia", flag: "🇮🇳" },
  { code: "ZAF", name: "África do Sul", flag: "🇿🇦" },
  { code: "SGP", name: "Singapura", flag: "🇸🇬" },
  { code: "MYS", name: "Malásia", flag: "🇲🇾" },
  { code: "THA", name: "Tailândia", flag: "🇹🇭" },
  { code: "VNM", name: "Vietnã", flag: "🇻🇳" },
  { code: "IDN", name: "Indonésia", flag: "🇮🇩" },
  { code: "PHL", name: "Filipinas", flag: "🇵🇭" },
  { code: "ISR", name: "Israel", flag: "🇮🇱" },
  { code: "ARE", name: "Emirados Árabes", flag: "🇦🇪" },
  { code: "SAU", name: "Arábia Saudita", flag: "🇸🇦" },
  { code: "EGY", name: "Egito", flag: "🇪🇬" },
  { code: "UKR", name: "Ucrânia", flag: "🇺🇦" },
  { code: "ROU", name: "Romênia", flag: "🇷🇴" },
  { code: "CZE", name: "Rep. Tcheca", flag: "🇨🇿" },
  { code: "HUN", name: "Hungria", flag: "🇭🇺" },
  { code: "BGR", name: "Bulgária", flag: "🇧🇬" },
  { code: "HRV", name: "Croácia", flag: "🇭🇷" },
  { code: "SVN", name: "Eslovênia", flag: "🇸🇮" },
  { code: "SVK", name: "Eslováquia", flag: "🇸🇰" },
  { code: "LTU", name: "Lituânia", flag: "🇱🇹" },
  { code: "LVA", name: "Letônia", flag: "🇱🇻" },
  { code: "EST", name: "Estônia", flag: "🇪🇪" },
  { code: "LUX", name: "Luxemburgo", flag: "🇱🇺" },
  { code: "MLT", name: "Malta", flag: "🇲🇹" },
  { code: "CYP", name: "Chipre", flag: "🇨🇾" },
  { code: "ISL", name: "Islândia", flag: "🇮🇸" },
  { code: "NZL", name: "Nova Zelândia", flag: "🇳🇿" },
  { code: "PAK", name: "Paquistão", flag: "🇵🇰" },
  { code: "BGD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "KAZ", name: "Cazaquistão", flag: "🇰🇿" },
  { code: "UZB", name: "Uzbequistão", flag: "🇺🇿" },
  { code: "MAR", name: "Marrocos", flag: "🇲🇦" },
  { code: "TUN", name: "Tunísia", flag: "🇹🇳" },
  { code: "DZA", name: "Argélia", flag: "🇩🇿" },
  { code: "KEN", name: "Quênia", flag: "🇰🇪" },
  { code: "NGA", name: "Nigéria", flag: "🇳🇬" },
  { code: "GHA", name: "Gana", flag: "🇬🇭" },
  { code: "ETH", name: "Etiópia", flag: "🇪🇹" },
  { code: "TWN", name: "Taiwan", flag: "🇹🇼" },
  { code: "HKG", name: "Hong Kong", flag: "🇭🇰" },
  { code: "MAC", name: "Macau", flag: "🇲🇴" },
  { code: "CHN-HK", name: "China (HK)", flag: "🇭🇰" },
];

// Map country codes to VPS country names for filtering
// VPS uses English names — these were verified against actual VPS data
const COUNTRY_CODE_TO_VPS: Record<string, string> = {
  USA: "United States", DEU: "Germany", CHN: "China", FRA: "France",
  JPN: "Japan", GBR: "United Kingdom", ITA: "Italy", ESP: "Spain",
  NLD: "Netherlands", CAN: "Canada", MEX: "Mexico", BEL: "Belgium",
  KOR: "South Korea", AUS: "Australia", TUR: "Türkiye", ARG: "Argentina",
  CHL: "Chile", COL: "Colombia", SWE: "Sweden", CHE: "Switzerland",
  POL: "Poland", AUT: "Austria", DNK: "Denmark", NOR: "Norway",
  FIN: "Finland", RUS: "Russian Federation", BRA: "Brazil", IND: "India",
  ZAF: "South Africa", SGP: "Singapore", MYS: "Malaysia", THA: "Thailand",
  VNM: "Viet Nam", IDN: "Indonesia", PHL: "Philippines", ISR: "Israel",
  ARE: "United Arab Emirates", SAU: "Saudi Arabia", EGY: "Egypt",
  UKR: "Ukraine", ROU: "Romania", CZE: "Czech Republic", HUN: "Hungary",
  BGR: "Bulgaria", HRV: "Croatia", SVN: "Slovenia", SVK: "Slovakia",
  LTU: "Lithuania", LVA: "Latvia", EST: "Estonia", LUX: "Luxembourg",
  MLT: "Malta", CYP: "Cyprus", ISL: "Iceland", NZL: "New Zealand",
  PAK: "Pakistan", BGD: "Bangladesh", KAZ: "Kazakhstan", UZB: "Uzbekistan",
  MAR: "Morocco", TUN: "Tunisia", DZA: "Algeria", KEN: "Kenya",
  NGA: "Nigeria", GHA: "Ghana", ETH: "Ethiopia", TWN: "Taiwan",
  HKG: "Hong Kong", MAC: "Macau", "CHN-HK": "China",
  // Countries found in VPS data not in our list
  PER: "Peru", IRL: "Ireland", BIH: "Bosnia and Herzegovina",
  LBN: "Lebanon", ALB: "Albania", BHR: "Bahrain", MDG: "Madagascar",
  MKD: "Macedonia, North", SYR: "Syrian Arab Republic",
};

const HS_NAMES: Record<string, string> = {
  "01": "Animais vivos", "02": "Carnes", "03": "Peixes e frutos do mar",
  "04": "Leite e laticínios", "05": "Produtos de origem animal", "06": "Plantas e flores",
  "07": "Vegetais", "08": "Frutas", "09": "Café, chá e especiarias",
  "10": "Cereais", "11": "Produtos de moagem", "12": "Óleos vegetais",
  "13": "Gomas e resinas", "14": "Matérias de entrançar", "15": "Gorduras e óleos",
  "16": "Preparações de carne/peixe", "17": "Açúcares", "18": "Cacau",
  "19": "Preparações de cereais", "20": "Preparações de vegetais", "21": "Preparações alimentícias",
  "22": "Bebidas", "23": "Resíduos alimentares", "24": "Tabaco",
  "25": "Sal e minerais", "26": "Minérios", "27": "Combustíveis",
  "28": "Químicos inorgânicos", "29": "Químicos orgânicos", "30": "Farmacêuticos",
  "31": "Adubos", "32": "Tintas", "33": "Óleos essenciais",
  "34": "Sabões", "35": "Albuminóides", "36": "Explosivos",
  "37": "Fotográficos", "38": "Químicos diversos", "39": "Plásticos",
  "40": "Borracha", "41": "Couros", "42": "Obras de couro",
  "43": "Peleteria", "44": "Madeira", "45": "Cortiça",
  "46": "Espartaria", "47": "Pasta de papel", "48": "Papel",
  "49": "Impressos", "50": "Seda", "60": "Tecidos de malha",
  "61": "Vestuário de malha", "62": "Vestuário (não malha)", "63": "Outros têxteis",
  "64": "Calçados", "65": "Chapéus", "66": "Guarda-chuvas",
  "67": "Penas e flores artificiais", "68": "Obras de pedra/gesso", "69": "Cerâmicos",
  "70": "Vidro", "71": "Joias", "72": "Ferro e aço",
  "73": "Obras de ferro/aço", "74": "Cobre", "75": "Níquel",
  "76": "Alumínio", "78": "Chumbo", "79": "Zinco",
  "80": "Estanho", "81": "Outros metais", "82": "Ferramentas",
  "83": "Artigos de metal", "84": "Máquinas e equipamentos", "85": "Máquinas elétricas",
  "86": "Veículos ferroviários", "87": "Veículos automóveis", "88": "Aeronaves",
  "89": "Embarcações", "90": "Instrumentos de óptica", "91": "Relógios",
  "92": "Instrumentos musicais", "93": "Armas", "94": "Mobiliário",
  "95": "Brinquedos", "96": "Artigos diversos", "97": "Obras de arte",
  "98": "Especiais", "99": "Operações especiais",
};

const HS_ICONS: Record<string, string> = {};
const HS_ICONS_FALLBACK = "";

// ── Steps ──
const STEPS = [
  { id: "product", label: "Seu produto", icon: Package },
  { id: "countries", label: "Países-alvo", icon: Globe },
  { id: "preview", label: "Oportunidade", icon: BarChart3 },
  { id: "results", label: "Importadores", icon: Building2 },
];

export default function PotentialImporters() {
  useSeo({
    title: "Importadores Potenciais — Encontre Compradores",
    description: "Encontre empresas importadoras reais no mundo inteiro. Banco de dados com milhões de importadores verificados para prospecção comercial.",
    keywords: "importadores, compradores internacionais, exportação, empresas importadoras, market intelligence",
  });

  const { consume } = useUsage();

  // Wizard state
  const [step, setStep] = useState(0);
  const [productQuery, setProductQuery] = useState("");
  const [selectedHs, setSelectedHs] = useState<string | null>(null);
  const [hsGuess, setHsGuess] = useState<HsGuess | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dynamic chapters from VPS
  const [vpsChapters, setVpsChapters] = useState<any[]>([]);
  const [hsSearch, setHsSearch] = useState("");

  useEffect(() => {
    apiFetch("/index").then((data) => {
      if (data && Array.isArray(data)) {
        setVpsChapters(data);
      }
    }).catch(() => {});
  }, []);

  const filteredHsChapters = useMemo(() => {
    const chapters = vpsChapters.length > 0
      ? vpsChapters.map((ch: any) => ({
          code: ch.hs_chapter,
          name: ch.description || HS_NAMES[ch.hs_chapter] || ch.hs_chapter,
          count: ch.count || 0,
          categories: ch.categories || [],
        }))
      : Object.entries(HS_NAMES).map(([code, name]) => ({
          code,
          name,
          count: 0,
          categories: [],
        }));
    if (!hsSearch.trim()) return chapters;
    const q = hsSearch.toLowerCase();
    return chapters.filter((ch) =>
      ch.code.includes(q) || ch.name.toLowerCase().includes(q)
    );
  }, [vpsChapters, hsSearch]);

  // Preview / Results
  const [previewData, setPreviewData] = useState<CountryCount[] | null>(null);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [importers, setImporters] = useState<Importer[]>([]);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [resultsFilter, setResultsFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Company detail modal
  const [selectedCompany, setSelectedCompany] = useState<Importer | null>(null);
  const [companyDetail, setCompanyDetail] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Step 1: Classify product with AI ──
  const classifyProduct = useCallback(async () => {
    if (!productQuery.trim()) { toast.error("Descreva seu produto"); return; }
    // Consume AI query credit
    const ok = await consume("ai_query");
    if (!ok) { toast.error("Créditos insuficientes. Faça upgrade."); return; }
    setLoading(true);
    setError(null);
    try {
      const response = await groqChat([
        {
          role: 'system',
          content: `Você é um especialista em classificação fiscal NCM/HS. Dado um produto descrito em português, retorne APENAS um JSON com: {"hs":"XX","desc":"Descrição do capítulo HS","confidence":0.XX}.
O campo "hs" deve ser o código de 2 dígitos do capítulo HS (01-99).
O campo "confidence" deve ser um número entre 0 e 1 indicando sua confiança.
Exemplo: {"hs":"09","desc":"Café, chá e especiarias","confidence":0.95}`
        },
        {
          role: 'user',
          content: `Classifique no HS (2 dígitos): "${productQuery.trim()}"`
        }
      ], {
        temperature: 0.1,
        max_tokens: 150,
      });
      // Parse JSON from response
      const cleaned = response.replace(/```json|```/g, '').trim();
      const guess = JSON.parse(cleaned) as HsGuess;
      setHsGuess(guess);
      setSelectedHs(guess.hs);
      toast.success(`IA identificou: HS ${guess.hs} — ${guess.desc} (${(guess.confidence * 100).toFixed(0)}%)`);
    } catch (e: any) {
      setError("IA indisponível. Escolha manualmente o HS.");
      toast.error("IA indisponível");
    } finally {
      setLoading(false);
    }
  }, [productQuery]);

  // ── Step 2: Load preview / opportunity data ──
  const fetchPreview = useCallback(async () => {
    if (!selectedHs) { toast.error("Selecione um produto primeiro"); return; }
    const ok = await consume("search");
    if (!ok) { toast.error("Créditos insuficientes."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/chapter/${selectedHs}?page=1&per_page=100`);
      const chapterData = data as any;
      const total = chapterData.total || 0;
      setPreviewTotal(total);

      const importersList: any[] = chapterData.importers || [];
      const countryMap: Record<string, number> = {};
      importersList.forEach((imp: any) => {
        const c = imp.country || "Desconhecido";
        countryMap[c] = (countryMap[c] || 0) + 1;
      });
      const scaleFactor = importersList.length > 0 ? total / importersList.length : 1;

      // Show worldwide opportunities — top countries by count
      const allCounts: CountryCount[] = Object.entries(countryMap)
        .map(([country, count]) => ({ country, company_count: Math.round(count * scaleFactor) }))
        .sort((a, b) => b.company_count - a.company_count);

      // Mark selected countries
      const selectedVpsNames = new Set(
        selectedCountries.map(code => COUNTRY_CODE_TO_VPS[code]).filter(Boolean)
      );
      const selected = allCounts.filter(c => selectedVpsNames.has(c.country));
      const others = allCounts.filter(c => !selectedVpsNames.has(c.country));

      setPreviewData([...selected, ...others.slice(0, 10)]);
    } catch (e: any) {
      setError("Erro ao carregar preview. Tente novamente.");
      toast.error("Erro no preview");
    } finally {
      setLoading(false);
    }
  }, [selectedHs, selectedCountries]);

  // ── Step 4: Fetch real importers ──
  const fetchResults = useCallback(async (page = 1) => {
    if (!selectedHs) return;
    const ok = await consume("search");
    if (!ok) { toast.error("Créditos insuficientes."); return; }
    setLoading(true);
    setError(null);
    try {
      let allImporters: Importer[] = [];
      let totalAll = 0;

      // Helper to fetch one page and map importers
      const fetchPage = async (p: number) => {
        const params = new URLSearchParams({ page: String(p), per_page: "20" });
        if (resultsFilter.trim()) params.set("search", resultsFilter.trim());
        const data = await apiFetch(`/chapter/${selectedHs}?${params.toString()}`);
        const cd = data as any;
        if (!totalAll) totalAll = cd.total || 0;
        return (cd.importers || []).map((imp: any) => ({
          id: imp.company || String(Math.random()),
          company_name: imp.company || "",
          country: imp.country || "",
          city: imp.city || null,
          category: imp.product_category || null,
          employees: imp.employees || null,
          products_count: imp.categories_traded || null,
          turnover: imp.turnover_usd || null,
          source: "tradexa_intelligence",
        }));
      };

      // Fetch from VPS with native pagination
      allImporters = await fetchPage(page);

      // Client-side filter by selected countries
      if (selectedCountries.length > 0) {
        const selectedVpsNames = new Set(
          selectedCountries.map(code => COUNTRY_CODE_TO_VPS[code]).filter(Boolean)
        );
        const filtered = allImporters.filter(imp => selectedVpsNames.has(imp.country));
        if (filtered.length > 0) {
          allImporters = filtered;
        } else {
          toast.info("Nenhum importador nos países selecionados nesta página. Navegue para ver mais.", { duration: 4000 });
        }
      }

      setImporters(allImporters);
      setResultsTotal(totalAll);
      setResultsPage(page);
    } catch (e: any) {
      setError("Erro ao buscar importadores. Tente novamente.");
      toast.error("Erro ao buscar importadores");
    } finally {
      setLoading(false);
    }
  }, [selectedHs, selectedCountries, resultsFilter]);

  // ── Company research with AI ──
  const researchCompany = useCallback(async (company: Importer) => {
    const ok = await consume("ai_query");
    if (!ok) { toast.error("Créditos insuficientes. Faça upgrade."); return; }
    setSelectedCompany(company);
    setCompanyDetail(null);
    setDetailLoading(true);
    try {
      const location = [company.city, company.country].filter(Boolean).join(', ');
      const response = await groqChat([
        {
          role: 'system',
          content: `Você é um pesquisador de inteligência comercial. Pesquise informações sobre empresas importadoras.
Responda SEMPRE em português do Brasil, usando Markdown com emojis.
Formato da resposta:
**Nome:** ...
**Website:** ... (se encontrar)
**Setor:** ...
**Porte:** Pequeno | Médio | Grande
**Principais produtos importados:** ...
**Contato:** ... (se encontrar)
**Observações:** ... (dados relevantes)

Se não encontrar informações específicas, indique "Não encontrado" e explique o que sabe sobre o setor na região.`
        },
        {
          role: 'user',
          content: `Pesquise: Empresa "${company.company_name}" em ${location}. Setor: ${company.category || 'não especificado'}. Funcionários: ${company.employees || 'N/A'}.`
        }
      ], {
        temperature: 0.3,
        max_tokens: 1024,
      });
      setCompanyDetail(response);
    } catch (e: any) {
      // Fallback: show what we already have from DB
      const info = [
        `**${company.company_name}**`,
        ``,
        `📍 **Localização:** ${[company.city, company.country].filter(Boolean).join(', ')}`,
        `🏷️ **Categoria:** ${company.category || 'N/A'}`,
        `👥 **Funcionários:** ${company.employees?.toLocaleString() || 'N/A'}`,
        `📦 **Categorias comercializadas:** ${company.products_count || 'N/A'}`,
        ``,
        `⚠️ *IA indisponível no momento. Mostrando dados do banco Tradexa.*`,
      ].join('\n');
      setCompanyDetail(info);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // ── Navigation ──
  // Auto-load preview when arriving at step 2
  useEffect(() => {
    if (step === 2 && selectedHs) {
      fetchPreview();
    }
  }, [step]);

  // Auto-load results when arriving at step 3
  useEffect(() => {
    if (step === 3 && selectedHs) {
      fetchResults(1);
    }
  }, [step]);

  const goNext = () => {
    if (step === 0 && !selectedHs) { toast.error("Classifique seu produto primeiro"); return; }
    if (step === 1 && selectedCountries.length === 0) { toast.error("Selecione pelo menos um país"); return; }
    setStep((s) => Math.min(s + 1, 3));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const progressPercent = ((step + 1) / 4) * 100;

  // ── Render helpers ──
  const countriesToShow = showAllCountries ? ALL_COUNTRIES : TOP_COUNTRIES;

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <ProtectedFeature featureKey="potential_importers">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#D80E16]/10 to-orange-500/10 border border-[#D80E16]/20">
            <Sparkles className="w-4 h-4 text-[#D80E16]" />
            <span className="text-sm font-bold text-[#D80E16]">IA + 3.8M Empresas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">
            Encontre Importadores Reais
          </h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Descreva seu produto. A IA classifica em HS. Você vê os melhores mercados.
          </p>
        </div>

        {/* Stepper */}
        <div className="relative">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              const done = i < step;
              return (
                <div key={s.id} className={`flex flex-col items-center gap-1 ${active ? "text-[#D80E16]" : done ? "text-emerald-600" : "text-slate-600"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${active ? "border-[#D80E16] bg-[#D80E16]/10" : done ? "border-emerald-500 bg-emerald-50" : "border-slate-300 bg-white"}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:block">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STEP 0: Product ── */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">O que você exporta?</h2>
                    <p className="text-slate-600">Descreva em português. A IA identifica o código HS automaticamente.</p>
                  </div>

                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                      <Input
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && classifyProduct()}
                        placeholder="Ex: café orgânico, calçados de couro, máquinas agrícolas..."
                        className="pl-12 h-14 text-lg rounded-2xl border-2 border-slate-200 focus:border-[#D80E16]"
                      />
                    </div>
                    <Button
                      onClick={classifyProduct}
                      disabled={loading || !productQuery.trim()}
                      className="h-14 px-6 rounded-2xl bg-gradient-to-r from-[#D80E16] to-orange-600 hover:from-[#b00b12] hover:to-orange-700 text-white font-bold text-base"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 mr-2" /> Classificar</>}
                    </Button>
                  </div>

                  {hsGuess && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg">
                          {hsGuess.hs}
                        </div>
                        <div>
                          <p className="font-bold text-emerald-900">{hsGuess.desc}</p>
                          <p className="text-sm text-emerald-600">Confiança da IA: {(hsGuess.confidence * 100).toFixed(0)}%</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setHsGuess(null); setSelectedHs(null); }} className="ml-auto">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Manual HS fallback */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Ou escolha manualmente ({filteredHsChapters.length} capítulos)
                      </p>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                      <Input
                        value={hsSearch}
                        onChange={(e) => setHsSearch(e.target.value)}
                        placeholder="Buscar por código ou descrição (ex: café, 84, máquinas...)"
                        className="pl-10 h-9 text-sm rounded-xl border-slate-200"
                      />
                    </div>
                    <div className="max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {filteredHsChapters.map((ch) => (
                          <button
                            key={ch.code}
                            onClick={() => { setSelectedHs(ch.code); setHsGuess({ hs: ch.code, desc: ch.name, confidence: 1 }); }}
                            className={`p-2.5 rounded-xl text-center border-2 transition-all text-xs font-bold group ${
                              selectedHs === ch.code
                                ? "border-[#D80E16] bg-gradient-to-br from-[#D80E16]/10 to-orange-500/10 text-[#D80E16] shadow-sm"
                                : "border-slate-200 hover:border-[#D80E16]/30 hover:shadow-sm text-slate-600"
                            }`}
                          >
                            <span className="block text-lg mb-0.5">{HS_ICONS[ch.code] || HS_ICONS_FALLBACK}</span>
                            <span className="block text-[11px] font-black">{ch.code}</span>
                            <span className="block text-[9px] font-normal truncate leading-tight">{ch.name}</span>
                            {ch.count > 0 && (
                              <span className="block text-[8px] text-slate-600 mt-0.5">{ch.count.toLocaleString()} importadores</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 1: Countries ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Para quais países?</h2>
                    <p className="text-slate-600">Selecione os mercados-alvo. Quanto mais, mais oportunidades.</p>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedCountries.map((code) => {
                      const c = ALL_COUNTRIES.find((x) => x.code === code);
                      return (
                        <Badge key={code} variant="outline" className="px-3 py-1.5 rounded-full bg-[#D80E16]/10 border-[#D80E16]/30 text-[#D80E16] font-bold">
                          {c?.flag} {c?.name} <button onClick={() => toggleCountry(code)} className="ml-1"><X className="w-3 h-3" /></button>
                        </Badge>
                      );
                    })}
                    {selectedCountries.length === 0 && (
                      <span className="text-sm text-slate-600 italic">Nenhum país selecionado</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {countriesToShow.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => toggleCountry(c.code)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${selectedCountries.includes(c.code) ? "border-[#D80E16] bg-[#D80E16]/10" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                      >
                        <span className="text-xl mr-2">{c.flag}</span>
                        <span className="text-sm font-bold text-slate-700">{c.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="text-center">
                    <Button variant="ghost" onClick={() => setShowAllCountries(!showAllCountries)} className="text-sm font-bold text-slate-600">
                      {showAllCountries ? "Mostrar menos" : `Mostrar todos os ${ALL_COUNTRIES.length} países`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 2: Preview ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Sua oportunidade</h2>
                    <p className="text-slate-600">Dados agregados do Tradexa Intelligence Database.</p>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-10 h-10 animate-spin text-[#D80E16]" />
                      <span className="ml-3 text-slate-600 font-medium">Analisando mercados...</span>
                    </div>
                  ) : previewData && previewData.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#D80E16]/10 to-orange-500/10 border border-[#D80E16]/20 text-center">
                          <p className="text-4xl font-black text-[#D80E16]">{previewTotal.toLocaleString()}</p>
                          <p className="text-sm font-bold text-slate-600 mt-1">Importadores totais</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 text-center">
                          <p className="text-4xl font-black text-emerald-600">{previewData.length}</p>
                          <p className="text-sm font-bold text-slate-600 mt-1">Países com dados</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200 text-center">
                          <p className="text-4xl font-black text-blue-600">{previewData[0]?.country || "—"}</p>
                          <p className="text-sm font-bold text-slate-600 mt-1">Maior mercado</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#D80E16]" /> Top mercados
                        </h3>
                        {previewData.map((c, i) => {
                          const isSelected = selectedCountries.some(code => COUNTRY_CODE_TO_VPS[code] === c.country);
                          return (
                          <div key={c.country} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'bg-[#D80E16]/5 border-[#D80E16]/20 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                            <div className={`w-8 h-8 rounded-lg shadow-sm flex items-center justify-center font-black text-sm ${isSelected ? 'bg-[#D80E16] text-white' : 'bg-white text-[#D80E16]'}`}>
                              {isSelected ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <div className="flex-1">
                              <p className={`font-bold ${isSelected ? 'text-[#D80E16]' : 'text-slate-800'}`}>{c.country}</p>
                              <div className="h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(c.company_count / (previewData[0]?.company_count || 1)) * 100}%` }}
                                  transition={{ duration: 0.8, delay: i * 0.1 }}
                                  className="h-full bg-gradient-to-r from-[#D80E16] to-orange-500 rounded-full"
                                />
                              </div>
                            </div>
                            <p className="font-black text-slate-700">{c.company_count.toLocaleString()}</p>
                          </div>
                        )})}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-600">
                      <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Nenhum dado encontrado para este produto/países.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ── STEP 3: Results ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Importadores</h2>
                      <p className="text-slate-600">HS {selectedHs} — {resultsTotal.toLocaleString()} empresas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                        <Input
                          value={resultsFilter}
                          onChange={(e) => { setResultsFilter(e.target.value); fetchResults(1); }}
                          placeholder="Filtrar por nome..."
                          className="pl-9 rounded-xl"
                        />
                      </div>
                      <Badge variant="outline" className="bg-slate-50">
                        {importers.length} / {resultsTotal.toLocaleString()}
                      </Badge>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="w-10 h-10 animate-spin text-[#D80E16]" />
                      <span className="ml-3 text-slate-600 font-medium">Carregando empresas...</span>
                    </div>
                  ) : importers.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                          {importers.map((company, idx) => (
                            <motion.div
                              key={company.id}
                              layout
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ delay: idx * 0.03 }}
                            >
                              <Card
                                className="border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-[#D80E16]/30 transition-all h-full bg-white/90 backdrop-blur-sm cursor-pointer group"
                                onClick={() => researchCompany(company)}
                              >
                                <CardContent className="p-4 space-y-3">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D80E16]/20 to-orange-500/20 flex items-center justify-center shrink-0">
                                      <Building2 className="w-5 h-5 text-[#D80E16]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 group-hover:text-[#D80E16] transition-colors">
                                        {company.company_name}
                                      </p>
                                      <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">
                                          {[company.city, company.country].filter(Boolean).join(', ')}
                                        </span>
                                      </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#D80E16] shrink-0 transition-colors" />
                                  </div>

                                  {company.category && (
                                    <div className="w-full overflow-hidden">
                                      <span className="inline-block text-[10px] font-medium text-slate-600 bg-slate-100 rounded-full px-2 py-0.5 truncate max-w-full">
                                        {company.category}
                                      </span>
                                    </div>
                                  )}

                                  {company.employees && company.employees > 0 && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                      <Users className="w-3.5 h-3.5" />
                                      <span className="font-semibold text-slate-700">{company.employees.toLocaleString()}</span>
                                      <span>funcionários</span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1 text-[10px] text-slate-600">
                                    <Star className="w-3 h-3" /> Tradexa Intelligence
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between pt-4">
                        <Button
                          variant="outline"
                          onClick={() => fetchResults(resultsPage - 1)}
                          disabled={resultsPage <= 1 || loading}
                          className="rounded-xl"
                        >
                          <ArrowLeft className="w-4 h-4 mr-1" /> Anterior
                        </Button>
                        <span className="text-sm text-slate-600 font-medium">
                          Página {resultsPage} de {Math.ceil(resultsTotal / 20)}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => fetchResults(resultsPage + 1)}
                          disabled={resultsPage >= Math.ceil(resultsTotal / 20) || loading}
                          className="rounded-xl"
                        >
                          Próxima <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-600">
                      <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>Nenhum importador encontrado com os filtros atuais.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-xl h-12 px-6 font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>

          {step < 3 && (
            <Button
              onClick={goNext}
              disabled={loading || (step === 0 && !selectedHs) || (step === 1 && selectedCountries.length === 0)}
              className="rounded-xl h-12 px-8 font-bold text-base bg-gradient-to-r from-[#D80E16] to-orange-600 hover:from-[#b00b12] hover:to-orange-700 text-white"
            >
              {step === 2 ? (
                <><Building2 className="w-4 h-4 mr-2" /> Ver importadores</>
              ) : (
                <><ChevronRight className="w-4 h-4 mr-2" /> Continuar</>
              )}
            </Button>
          )}
          {step === 3 && <div />}
        </div>

        {/* ── Company Detail Modal ── */}
        <AnimatePresence>
          {selectedCompany && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => { setSelectedCompany(null); setCompanyDetail(null); }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[88vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 p-5 flex items-start gap-4 rounded-t-3xl">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D80E16] to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-[#D80E16]/20">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black text-slate-900 text-base leading-tight">
                      {selectedCompany.company_name}
                    </h3>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D80E16]" />
                      {[selectedCompany.city, selectedCompany.country].filter(Boolean).join(', ')}
                    </p>
                    {selectedCompany.category && (
                      <span className="inline-block mt-1.5 text-[10px] font-semibold text-[#D80E16] bg-[#D80E16]/10 rounded-full px-2.5 py-0.5">
                        {selectedCompany.category}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => { setSelectedCompany(null); setCompanyDetail(null); }}
                    className="rounded-xl shrink-0 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-center">
                      <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-blue-700">
                        {selectedCompany.employees && selectedCompany.employees > 0 
                          ? selectedCompany.employees.toLocaleString() : "—"}
                      </p>
                      <p className="text-[10px] text-blue-500 font-semibold">Funcionários</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-center">
                      <Package className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-emerald-700">
                        {selectedCompany.products_count && selectedCompany.products_count > 0 
                          ? selectedCompany.products_count : "—"}
                      </p>
                      <p className="text-[10px] text-emerald-500 font-semibold">Categorias</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-center">
                      <TrendingUp className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <p className="text-lg font-black text-amber-700">
                        {selectedCompany.turnover || "—"}
                      </p>
                      <p className="text-[10px] text-amber-500 font-semibold">Faturamento</p>
                    </div>
                  </div>

                  {/* AI Research Section */}
                  <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-[#D80E16]/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[#D80E16]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Análise com IA</h4>
                        <p className="text-[10px] text-slate-600">IA TRADEXA</p>
                      </div>
                    </div>

                    {detailLoading ? (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#D80E16]" />
                        <span className="text-sm text-slate-600">Pesquisando {selectedCompany.company_name}...</span>
                      </div>
                    ) : companyDetail ? (
                      <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed space-y-2">
                        {companyDetail}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-600">Os dados da IA estão sendo carregados...</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-center text-[10px] text-slate-600">
                    <Star className="w-3 h-3" />
                    Tradexa Intelligence Database
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedFeature>
  );
}
