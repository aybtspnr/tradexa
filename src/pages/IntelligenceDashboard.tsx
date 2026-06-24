"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { showError } from "@/utils/toast";
import {
  Globe, TrendingUp, TrendingDown, DollarSign, Package,
  Ship, Plane, Truck, BarChart3, Search, Hash,
  MapPin, Loader2, ChevronDown, ChevronUp, X,
  Anchor, ArrowRight, List, Layers
} from "lucide-react";

/* ═══════════════════ TYPES ═══════════════════ */
interface NcmItem { ncm: string; hs4: string; hs2: string; fob: number; kg: number; count: number; rank: number; frete: number; seguro: number; }
interface CountryItem { code: string; name: string; fob: number; kg: number; count: number; rank: number; frete: number; seguro: number; }
interface MonthlyItem { month: string; fob: number; count: number; frete: number; }
interface StateItem { uf: string; fob: number; count: number; rank: number; }
interface ViaItem { via: string; name: string; fob: number; count: number; rank: number; }
interface MunicipioItem { code: string; uf: string; name: string; fob: number; kg: number; count: number; rank: number; }
interface TradeData {
  total_fob: number; total_kg: number; total_lines: number;
  total_frete: number; total_seguro: number;
  ncm_count: number; country_count: number;
  top_ncms: NcmItem[]; top_countries: CountryItem[];
  all_ncms: {ncm: string; hs4: string; hs2: string; fob: number; kg: number}[];
  monthly: MonthlyItem[]; by_state: StateItem[]; by_via: ViaItem[];
  top_municipios: MunicipioItem[]; all_municipios: MunicipioItem[]; municipio_total_fob: number;
  all_countries: CountryItem[];
}
interface ComexData { meta: { source: string; period: string; total_lines: number; }; export: TradeData; import: TradeData; countries: Record<string, string>; }

const STEPS = [
  { id: "overview", label: "Visão Geral", icon: BarChart3 },
  { id: "products", label: "Produtos", icon: Package },
  { id: "countries", label: "Países & Rotas", icon: Globe },
  { id: "freight", label: "Frete", icon: Ship },
  { id: "cities", label: "Municípios", icon: MapPin },
] as const;
type StepId = typeof STEPS[number]["id"];

const MONTH_NAMES: Record<string, string> = { "01":"Jan","02":"Fev","03":"Mar","04":"Abr","05":"Mai","06":"Jun","07":"Jul","08":"Ago","09":"Set","10":"Out","11":"Nov","12":"Dez" };
const VIA_MAP: Record<string, string> = { "01": "Marítimo", "04": "Rodoviário", "07": "Aéreo", "15": "Ferroviário" };

const PORT_NAMES: Record<string, string> = {
  "BRSSZ":"Santos","BRRIO":"Rio de Janeiro","BRITJ":"Itajaí","BRPNG":"Paranaguá","BRVIX":"Vitória",
  "BRSTM":"São Luís","BRSPB":"Sepetiba","BRSUA":"Suape","BRFOR":"Fortaleza","BRSFN":"São Francisco do Sul","BRRIG":"Rio Grande",
  "CNSHA":"Xangai","CNNGB":"Ningbo","CNSZX":"Shenzhen","CNQDG":"Qingdao","CNXMN":"Xiamen","CNYTN":"Yantian",
  "USLAX":"Los Angeles","USLGB":"Long Beach","USNYC":"New York","USSAV":"Savannah","USHOU":"Houston","USCHS":"Charleston","USMIA":"Miami","USORF":"Norfolk",
  "NLRDM":"Roterdã","DEHAM":"Hamburgo","BEANR":"Antuérpia","FRLEH":"Le Havre","GBFXT":"Felixstowe","ESBCN":"Barcelona","ITGOA":"Gênova",
  "SGJUR":"Cingapura","MYTPP":"Tanjung Pelepas","MYPKG":"Port Klang",
  "INNSA":"Nhava Sheva","INMAA":"Chennai","JPTYO":"Tóquio","JPYOK":"Yokohama","KRBUS":"Busan",
  "IDJKT":"Jacarta","VNHPH":"Haiphong","VNCLI":"Cai Mep","PHPHL":"Manila","AESGH":"Jebel Ali",
};
const PORT_COORDS: Record<string, [number, number]> = {
  INNSA:[18.95,72.95],INMUN:[22.78,69.68],CNSHA:[31.23,121.47],CNSZX:[22.54,114.06],CNNGB:[29.87,121.54],
  CNQDG:[36.07,120.38],CNXMN:[24.48,118.09],CNYTN:[22.55,114.31],
  VNSGN:[10.82,106.63],VNHPH:[20.86,106.68],
  BRPEE:[-3.53,-38.80],BRRIG:[-32.04,-52.11],BRRIO:[-22.91,-43.17],BRSSZ:[-23.96,-46.33],BRITJ:[-26.91,-48.66],
  BRPNG:[-25.52,-48.51],BRSUA:[-8.39,-34.96],BRSTM:[-2.53,-44.30],BRVIX:[-20.32,-40.34],
  USNYC:[40.71,-74.01],USLAX:[33.94,-118.41],USLGB:[33.76,-118.19],USSAV:[32.08,-81.09],USHOU:[29.75,-95.09],
  NLRDM:[51.90,4.46],DEHAM:[53.55,9.99],BEANR:[51.23,4.41],FRLEH:[49.49,0.11],GBFXT:[51.96,1.34],
  ESBCN:[41.37,2.18],ITGOA:[44.41,8.93],SGJUR:[1.34,103.73],MYTPP:[1.35,103.53],
  MYPKG:[3.00,101.39],IDJKT:[-6.12,106.85],
};

const COUNTRY_PORTS: Record<string, string[]> = {
  "160":["CNSHA","CNNGB","CNSZX","CNQDG"],"105":["USLAX","USLGB","USNYC","USSAV","USHOU"],
  "108":["FRLEH"],"023":["DEHAM"],"114":["NLRDM"],"087":["ESBCN"],"207":["GBFXT"],
  "155":["JPYOK","JPTYO"],"076":["KRBUS"],"134":["INNSA","INMAA"],"150":["ITGOA"],
  "053":["BEANR"],"258":["VNHPH","VNCLI"],"169":["MYPKG","MYTPP"],"136":["IDJKT"],
};

const COUNTRY_COORDS: Record<string, [number, number]> = {
  "160":[35.86,104.19],"105":[37.09,-95.71],"108":[46.60,1.88],"023":[51.16,10.45],
  "114":[52.13,5.29],"087":[40.46,-3.75],"207":[55.38,-3.44],"155":[36.20,138.25],
  "076":[35.91,127.77],"134":[20.59,78.96],"150":[41.87,12.57],"053":[50.85,4.35],
  "040":[-38.42,-63.62],"058":[56.13,-106.35],"059":[-35.68,-71.54],"069":[4.57,-74.30],
  "136":[-0.79,113.92],"169":[4.21,101.98],"180":[23.63,-102.55],"195":[-23.44,-58.44],
  "255":[-32.52,-55.77],"258":[14.06,108.28],"283":[23.42,53.85],
};

function fmt$(v: number): string { if (v >= 1e9) return `${(v/1e9).toFixed(1)}B`; if (v >= 1e6) return `${(v/1e6).toFixed(1)}M`; return `${(v/1e3).toFixed(0)}K`; }
function fmtKg(v: number): string { if (v >= 1e9) return `${(v/1e9).toFixed(1)}B kg`; if (v >= 1e6) return `${(v/1e6).toFixed(1)}M kg`; return `${(v/1e3).toFixed(0)}K kg`; }
function ncmLabel(ncm: string): string { const ch=ncm.slice(0,2); const l:Record<string,string>={"01":"Animais","02":"Carnes","03":"Peixes","04":"Laticínios","07":"Hortaliças","08":"Frutas","09":"Café","10":"Cereais","12":"Oleaginosas","15":"Gorduras","17":"Açúcares","20":"Conservas","22":"Bebidas","23":"Resíduos","25":"Sal","26":"Minérios","27":"Combustíveis","28":"Químicos","29":"Químicos org.","30":"Farmoquímicos","31":"Adubos","32":"Extratos","33":"Óleos","38":"Químicos","39":"Plásticos","40":"Borracha","41":"Peles","42":"Couro","44":"Madeira","47":"Celulose","48":"Papel","49":"Livros","52":"Algodão","54":"Filamentos","55":"Fibras","61":"Vestuário","62":"Vestuário","63":"Têxteis","64":"Calçados","68":"Pedra","70":"Vidro","71":"Metais","72":"Ferro/Aço","73":"Ferro/Aço","74":"Cobre","76":"Alumínio","82":"Ferramentas","84":"Máquinas","85":"Eletrônicos","86":"Ferrovias","87":"Veículos","88":"Aeronaves","89":"Embarcações","90":"Instrumentos","94":"Móveis","95":"Brinquedos",}; return l[ch]||`Cap.${ch}`; }

function MiniBar({val,max,color="bg-red-500",height="h-3"}:{val:number;max:number;color?:string;height?:string}) {
  const pct=max>0?Math.max((val/max)*100,1):0;
  return <div className={`w-full ${height} bg-slate-100 rounded-full overflow-hidden`}><div className={`${height} ${color} rounded-full transition-all`} style={{width:`${pct}%`}}/></div>;
}

/* ═══════════════════ PREMIUM STEP NAV ═══════════════════ */
function StepNav({steps,active,onChange}:{steps:readonly typeof STEPS[number][];active:StepId;onChange:(s:StepId)=>void}) {
  return (
    <div className="flex gap-0.5 p-0.5 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-x-auto">
      {steps.map(s => {
        const Icon = s.icon;
        const isActive = s.id === active;
        return (
          <button key={s.id} onClick={()=>onChange(s.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              isActive ? "bg-red-600 text-white shadow-md shadow-red-200 scale-105" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export default function IntelligenceDashboard() {
  useSeo({
    title: "Inteligência Comercial — comércio exterior 2026",
    description: "Dashboard completo de comércio exterior brasileiro com dados de importação, exportação, frete e análise por países, NCMs e municípios. Dados oficiais MDIC.",
    keywords: "inteligência comercial, comércio exterior, importação, exportação, comex stat, dados MDIC, análise de mercado",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Inteligência Comercial TRADEXA",
      "description": "Dashboard interativo de comércio exterior brasileiro com dados atualizados do comércio exterior",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript",
    },
  });
  const navigate = useNavigate();

  const [data, setData] = useState<ComexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"export"|"import">("import");
  const [step, setStep] = useState<StepId>("overview");
  const { consume } = useUsage();

  const handleStepChange = useCallback(async (s: StepId) => {
    if (s === step) return;
    const ok = await consume("page_view");
    if (!ok) { showError("Limite de uso atingido. Faça upgrade do seu plano."); return; }
    setStep(s);
  }, [step, consume]);

  const [ncmSearch, setNcmSearch] = useState("");
  const [ncmSearchQuery, setNcmSearchQuery] = useState("");
  const [showAllNcms, setShowAllNcms] = useState(false);
  const [selectedNcm, setSelectedNcm] = useState<NcmItem|null>(null);
  const [ncmPage, setNcmPage] = useState(1);
  const NCM_PER_PAGE = 25;


  const [showAllMun, setShowAllMun] = useState(false);
  const [munSearch, setMunSearch] = useState("");
  const [munPage, setMunPage] = useState(1);

  // ─── Countries search & pagination ───
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [countryPage, setCountryPage] = useState(1);
  const COUNTRY_PER_PAGE = 25;

  // ─── Load trade data ───
  useEffect(() => {
    const ts = Date.now();
    fetch(`/api/comex-intelligence?_=${ts}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setData)
      .catch(() => { fetch(`/data/comex_intelligence.json?_=${ts}`).then(r=>r.json()).then(setData).catch(()=>setData(null)).finally(()=>setLoading(false)); })
      .finally(()=>setLoading(false));
  }, []);


  const trade = data?.[tab];
  const allNcmsList = trade?.all_ncms || [];
  const totalNcmPages = useMemo(() => {
    if (!trade) return 0;
    if (ncmSearchQuery) return Math.ceil(allNcmsList.length / NCM_PER_PAGE);
    if (showAllNcms) return Math.ceil(allNcmsList.length / NCM_PER_PAGE);
    return 0;
  }, [trade, showAllNcms, ncmSearchQuery]);
  const filteredNcms = useMemo(() => {
    if (!trade) return [];
    if (ncmSearchQuery) {
      const q = ncmSearchQuery.toLowerCase();
      const filtered = allNcmsList.filter(n => n.ncm.includes(q) || (n.hs4||'').includes(q) || (n.hs2||'').includes(q));
      const start = (ncmPage - 1) * NCM_PER_PAGE;
      return filtered.slice(start, start + NCM_PER_PAGE);
    }
    if (showAllNcms) {
      const start = (ncmPage - 1) * NCM_PER_PAGE;
      return allNcmsList.slice(start, start + NCM_PER_PAGE);
    }
    // Default: show top NCMs with rank
    return (trade.top_ncms||[]).slice(0, 10);
  }, [trade, ncmSearchQuery, showAllNcms, ncmPage]);
  const searchTotalResults = useMemo(() => {
    if (!trade || !ncmSearchQuery) return 0;
    const q = ncmSearchQuery.toLowerCase();
    return allNcmsList.filter(n => n.ncm.includes(q) || (n.hs4||'').includes(q) || (n.hs2||'').includes(q)).length;
  }, [trade, ncmSearchQuery]);
  const maxFob = Math.max(...(trade?.top_ncms||[]).map(n=>n.fob), 1);
  const maxCountryFob = Math.max(...(trade?.top_countries||[]).map(c=>c.fob), 1);
  const maxMonthFob = Math.max(...(trade?.monthly||[]).map(m=>m.fob), 1);

  // ─── Country filter / pagination ───
  const allCountriesList = (trade?.all_countries && trade.all_countries.length > 0)
    ? trade.all_countries
    : (trade?.top_countries || []).map((c, i) => ({ ...c, rank: i + 1 }));
  const totalCountryPages = useMemo(() => {
    if (!trade) return 0;
    if (countrySearchQuery) return Math.ceil(allCountriesList.length / COUNTRY_PER_PAGE);
    if (showAllCountries) return Math.ceil(allCountriesList.length / COUNTRY_PER_PAGE);
    return 0;
  }, [trade, showAllCountries, countrySearchQuery]);
  const filteredCountries = useMemo(() => {
    if (!trade) return [];
    if (countrySearchQuery) {
      const q = countrySearchQuery.toLowerCase();
      const filtered = allCountriesList.filter(c => c.name.toLowerCase().includes(q) || c.code.includes(q));
      const start = (countryPage - 1) * COUNTRY_PER_PAGE;
      return filtered.slice(start, start + COUNTRY_PER_PAGE);
    }
    if (showAllCountries) {
      const start = (countryPage - 1) * COUNTRY_PER_PAGE;
      return allCountriesList.slice(start, start + COUNTRY_PER_PAGE);
    }
    return (trade.top_countries||[]).slice(0, 15);
  }, [trade, countrySearchQuery, showAllCountries, countryPage]);
  const countrySearchTotal = useMemo(() => {
    if (!trade || !countrySearchQuery) return 0;
    const q = countrySearchQuery.toLowerCase();
    return allCountriesList.filter(c => c.name.toLowerCase().includes(q) || c.code.includes(q)).length;
  }, [trade, countrySearchQuery]);



  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-3"/><p className="text-sm text-slate-600">Carregando dados...</p></div>
    </div>;
  }
  if (!data) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-slate-600 font-medium">Dados indisponíveis</p></div>;
  }

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shadow-md shadow-red-200">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-800">Inteligência Comercial</h1>
                <p className="text-[10px] text-slate-500">{data.meta.period} • {(data.meta.total_lines/1e6).toFixed(1)}M linhas</p>
              </div>
            </div>
            <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100">
              <button onClick={()=>setTab("export")} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tab==="export" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <TrendingUp className="w-3 h-3 inline mr-1"/>Exportação
              </button>
              <button onClick={()=>setTab("import")} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${tab==="import" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <TrendingDown className="w-3 h-3 inline mr-1"/>Importação
              </button>
            </div>
          </div>
          <StepNav steps={STEPS} active={step} onChange={handleStepChange} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* ═══ STEP 1: OVERVIEW ═══ */}
        {step === "overview" && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["FOB Total", `$${fmt$(trade?.total_fob||0)}`, "text-emerald-600", "bg-emerald-50 border-emerald-200", DollarSign],
                ["Peso Líquido", fmtKg(trade?.total_kg||0), "text-blue-600", "bg-blue-50 border-blue-200", Package],
                ["Linhas", (trade?.total_lines||0).toLocaleString("pt-BR"), "text-purple-600", "bg-purple-50 border-purple-200", BarChart3],
                ["Países", String(trade?.country_count||0), "text-amber-600", "bg-amber-50 border-amber-200", Globe],
              ].map(([label, val, tc, bg, Icon]) => (
                <Card key={String(label)} className={`border ${bg} overflow-hidden`}>
                  <div className={`h-1 w-full ${(tc as string).replace("text-","bg-").replace("600","500")}`} />
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm">
                      <Icon className={`w-5 h-5 ${tc}`} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase font-bold">{String(label)}</p>
                      <p className={`text-lg font-black ${tc}`}>{String(val)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monthly + States */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-slate-200 shadow-sm lg:col-span-2 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-500 to-amber-400" />
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-red-500"/>Evolução Mensal</h3>
                  <div className="space-y-3">
                    {(trade?.monthly||[]).map(m=><div key={m.month} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600 w-10">{MONTH_NAMES[m.month]||m.month}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1"><span className="font-semibold text-slate-700">${fmt$(m.fob)}</span><span className="text-slate-500">{m.count.toLocaleString("pt-BR")} linhas</span></div>
                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${tab==="export"?"bg-emerald-500":"bg-red-500"} transition-all flex items-center justify-end pr-2`} style={{width:`${(m.fob/maxMonthFob)*100}%`}}>
                            <span className="text-[9px] font-bold text-white drop-shadow-sm">${fmt$(m.fob)}</span>
                          </div>
                        </div>
                      </div>
                    </div>)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-500 to-purple-400" />
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-red-500"/>Por Estado</h3>
                  <div className="space-y-1.5">
                    {(trade?.by_state||[]).slice(0, 10).map(s=><div key={s.uf} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-500 w-5">{s.rank}º</span><span className="text-sm font-bold text-slate-700">{s.uf}</span></div>
                      <p className="text-xs font-bold text-slate-600">${fmt$(s.fob)}</p>
                    </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balance */}
            <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-slate-50 to-slate-100 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 via-slate-200 to-red-400" />
              <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2"><Globe className="w-5 h-5 text-slate-500"/><span className="text-sm font-bold text-slate-700">Balança Comercial</span></div>
                <div className="flex gap-6 flex-wrap justify-center">
                  <div><p className="text-[10px] text-slate-600 uppercase font-bold">Exportação</p><p className="text-lg font-black text-emerald-600">${fmt$(data.export.total_fob)}</p></div>
                  <div><p className="text-[10px] text-slate-600 uppercase font-bold">Importação</p><p className="text-lg font-black text-red-600">${fmt$(data.import.total_fob)}</p></div>
                  <div className="border-l border-slate-300 pl-6"><p className="text-[10px] text-slate-600 uppercase font-bold">Saldo</p><p className={`text-lg font-black ${data.export.total_fob>data.import.total_fob?"text-emerald-600":"text-red-600"}`}>${fmt$(data.export.total_fob-data.import.total_fob)}</p></div>
                </div>
                <Badge className="ml-auto bg-slate-200 text-slate-600 text-[10px]">{data.meta.period}</Badge>
              </CardContent>
            </Card>

            {/* Freight Cost (from CSV data) */}
            {tab === "import" && trade?.total_frete ? (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-400" />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Ship className="w-4 h-4 text-red-500" />Custos de Frete (Importação)
                    </h3>
                    <Badge className="bg-blue-50 text-blue-600 text-[10px]">
                      {(trade.total_frete / trade.total_fob * 100).toFixed(1)}% do FOB
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      ["Frete Total", `$${fmt$(trade.total_frete)}`, "text-blue-600", "bg-blue-50"],
                      ["Seguro", `$${fmt$(trade.total_seguro)}`, "text-emerald-600", "bg-emerald-50"],
                      ["CIF Médio", `$${(trade.total_frete + trade.total_seguro).toLocaleString("pt-BR", {minimumFractionDigits:0})}`, "text-purple-600", "bg-purple-50"],
                      ["Relação Frete/FOB", `${(trade.total_frete / trade.total_fob * 100).toFixed(1)}%`, "text-amber-600", "bg-amber-50"],
                    ].map(([l,v,tc,bg]) => (
                      <div key={String(l)} className={`px-3 py-2 rounded-xl ${bg} border border-slate-100`}>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">{String(l)}</p>
                        <p className={`text-sm font-black ${tc}`}>{String(v)}</p>
                      </div>
                    ))}
                  </div>
                  {/* Top countries by freight cost */}
                  <h4 className="text-[10px] font-bold text-slate-600 mb-2">Top países por custo de frete</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(trade?.top_countries||[]).filter(c=>c.frete).slice(0,6).map(c=>{
                      const ratio = ((c.frete||0) / (trade?.total_frete||1) * 100);
                      const fobRatio = ((c.frete||0) / (c.fob||1) * 100);
                      return (
                        <div key={c.code} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-100">
                          <div>
                            <p className="text-xs font-bold text-slate-700">{c.name}</p>
                            <p className="text-[9px] text-slate-500">{ratio.toFixed(1)}% do frete total</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-blue-600">${fmt$(c.frete||0)}</p>
                            <p className="text-[9px] text-slate-500">{fobRatio.toFixed(1)}% FOB</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : tab === "export" ? (
              <Card className="border-slate-200 shadow-sm bg-slate-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Ship className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-600">Custos de Frete</p>
                    <p className="text-[10px] text-slate-500">Dados de frete disponíveis apenas para operações de importação</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Transport Mode */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-sky-400" />
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4"><Ship className="w-4 h-4 text-red-500"/>Modal de Transporte</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(trade?.by_via||[]).map(v=>{
                    const icons:Record<string,any>={"01":Ship,"04":Truck,"07":Plane,"15":Truck};const Icon=icons[v.via]||Package;
                    const colors:Record<string,string>={"01":"bg-blue-50 border-blue-200 text-blue-700","04":"bg-green-50 border-green-200 text-green-700","07":"bg-sky-50 border-sky-200 text-sky-700","15":"bg-amber-50 border-amber-200 text-amber-700"};
                    const color=colors[v.via]||"bg-slate-50 border-slate-200 text-slate-700";
                    return <Card key={v.via} className={`border ${color}`}><CardContent className="p-4 flex items-center gap-3"><Icon className="w-5 h-5 shrink-0"/><div><p className="text-xs font-bold uppercase">{v.name}</p><p className="text-lg font-black">${fmt$(v.fob)}</p><p className="text-[10px] opacity-70">{((v.fob/(trade?.total_fob||1))*100).toFixed(1)}%</p></div></CardContent></Card>;
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ STEP 2: PRODUCTS (NCMs) ═══ */}
        {step === "products" && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 to-amber-400" />
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-red-500"/>NCMs — {tab==="export"?"Exportação":"Importação"}
                    <span className="text-xs font-normal text-slate-400 ml-1">({trade?.ncm_count?.toLocaleString("pt-BR")} total)</span>
                  </h3>
                  <div className="flex gap-2 w-full sm:w-80">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                      <Input
                        value={ncmSearch}
                        onChange={e=>setNcmSearch(e.target.value)}
                        onKeyDown={e=>{if(e.key==='Enter'){setNcmSearchQuery(ncmSearch);setNcmPage(1);}}}
                        placeholder={`Buscar NCM em ${tab==='export'?'exportação':'importação'}...`}
                        className="h-9 pl-9 rounded-xl border-slate-200 text-sm"
                      />
                    </div>
                    <Button
                      onClick={()=>{setNcmSearchQuery(ncmSearch); setNcmPage(1);}}
                      className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-xs font-bold px-4"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" />
                      Buscar
                    </Button>
                  </div>
                </div>

                {ncmSearchQuery && (
                  <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-2">
                    <span>{searchTotalResults} resultado{searchTotalResults !== 1 ? "s" : ""} para "{ncmSearchQuery}" em {tab === 'export' ? 'exportação' : 'importação'}</span>
                    <button onClick={()=>{setNcmSearchQuery(""); setNcmSearch(""); setNcmPage(1); setShowAllNcms(false);}} className="text-red-500 hover:text-red-700 font-bold text-[10px] underline">Limpar</button>
                  </p>
                )}
                {showAllNcms && !ncmSearchQuery && (
                  <p className="text-[11px] text-slate-500 mb-3">
                    Página {ncmPage} de {totalNcmPages} — {(trade?.ncm_count || 0).toLocaleString("pt-BR")} NCMs no total
                  </p>
                )}

                {/* NCM list */}
                <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                  {filteredNcms.map((n:any,i:number)=>{
                    const globalIdx = (showAllNcms || ncmSearchQuery) ? (ncmPage - 1) * NCM_PER_PAGE + i + 1 : i + 1;
                    const rank = n.rank || globalIdx;
                    return (
                    <div key={n.ncm} onClick={()=>{
                      const enriched = trade?.top_ncms?.find(tn => tn.ncm === n.ncm);
                      setSelectedNcm(selectedNcm?.ncm===n.ncm ? null : {...n, ...enriched, rank} as NcmItem);
                    }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                        selectedNcm?.ncm===n.ncm ? "bg-red-50 border border-red-200 shadow-sm" : "hover:bg-slate-50"
                      }`}>
                      <span className="text-xs font-bold text-slate-500 w-8 text-right">{ncmSearch ? "—" : `${rank}º`}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className="font-mono font-bold text-sm text-slate-800">{n.ncm}</span><span className="text-[10px] text-slate-500 truncate">{ncmLabel(n.ncm)}</span></div>
                        <MiniBar val={n.fob} max={maxFob} color={tab==="export"?"bg-emerald-500":"bg-red-500"} height="h-2"/>
                      </div>
                      <div className="text-right"><p className="text-sm font-black text-slate-700">${fmt$(n.fob)}</p><p className="text-[10px] text-slate-500">{fmtKg(n.kg)}</p></div>
                    </div>
                  );})}
                  {filteredNcms.length === 0 && ncmSearch && (
                    <div className="text-center py-10 text-slate-400">
                      <p className="text-sm font-medium">Nenhum NCM encontrado para "{ncmSearch}"</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {(showAllNcms || ncmSearchQuery) && totalNcmPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={()=>setNcmPage(Math.max(1, ncmPage-1))} disabled={ncmPage===1}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50">
                      Anterior
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      {ncmPage} / {totalNcmPages}
                    </span>
                    <button onClick={()=>setNcmPage(Math.min(totalNcmPages, ncmPage+1))} disabled={ncmPage===totalNcmPages}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50">
                      Próximo
                    </button>
                  </div>
                )}

                {!ncmSearchQuery && (trade?.ncm_count || 0) > 10 && (
                  <button onClick={()=>{setShowAllNcms(!showAllNcms); setNcmPage(1);}} className="w-full mt-3 text-xs font-bold text-red-500 hover:text-red-700 py-2 flex items-center justify-center gap-1">
                    {showAllNcms?<><ChevronUp className="w-3 h-3"/> Mostrar top 10</>:<><ChevronDown className="w-3 h-3"/> Ver todos os {(trade?.ncm_count || 0).toLocaleString("pt-BR")} NCMs</>}
                  </button>
                )}
              </CardContent>
            </Card>

            {/* NCM detail panel */}
            {selectedNcm && (
              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
                <Card className="border-red-200 shadow-sm bg-gradient-to-r from-red-50 to-amber-50 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-red-500 to-amber-400" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Hash className="w-5 h-5 text-red-600"/></div>
                        <div><h3 className="text-lg font-black text-slate-800 font-mono">{selectedNcm.ncm}</h3><p className="text-sm text-slate-600">{ncmLabel(selectedNcm.ncm)}</p></div>
                      </div>
                      <button onClick={()=>setSelectedNcm(null)} className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"><X className="w-4 h-4 text-slate-500"/></button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[["FOB",`$${fmt$(selectedNcm.fob)}`,"text-emerald-600","bg-emerald-50"],["Peso",fmtKg(selectedNcm.kg),"text-blue-600","bg-blue-50"],["Linhas",selectedNcm.count?selectedNcm.count.toLocaleString("pt-BR"):"—","text-purple-600","bg-purple-50"],["Rank",selectedNcm.rank?`${selectedNcm.rank}º`:"—","text-amber-600","bg-amber-50"]].map(([l,v,tc,bg])=>
                        <div key={String(l)} className={`px-3 py-2 rounded-xl ${bg}`}><p className="text-[9px] text-slate-500 uppercase font-bold">{String(l)}</p><p className={`text-sm font-black ${tc}`}>{String(v)}</p></div>
                      )}
                    </div>
                    {/* Freight cost for this NCM */}
                    {tab === "import" && (selectedNcm.frete || 0) > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <h4 className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Ship className="w-3 h-3 text-blue-500" /> Custo de frete
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Frete</p>
                            <p className="text-sm font-black text-blue-700">${fmt$(selectedNcm.frete)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold">Seguro</p>
                            <p className="text-sm font-black text-emerald-700">${fmt$(selectedNcm.seguro)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-3"><button onClick={()=>navigate(`/trade-intelligence?ncm=${selectedNcm.ncm}`)} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"><ArrowRight className="w-3 h-3"/>Analisar NCM em detalhe</button></div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══ STEP 3: COUNTRIES & ROUTES ═══ */}
        {step === "countries" && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-400" />
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-red-500"/>Países — {tab==="export"?"Destino":"Origem"}
                    <span className="text-xs font-normal text-slate-400 ml-1">({trade?.country_count?.toLocaleString("pt-BR")} total)</span>
                  </h3>
                  <div className="flex gap-2 w-full sm:w-80">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                      <Input
                        value={countrySearch}
                        onChange={e=>setCountrySearch(e.target.value)}
                        onKeyDown={e=>{if(e.key==='Enter'){setCountrySearchQuery(countrySearch);setCountryPage(1);setShowAllCountries(true);}}}
                        placeholder="Buscar país por nome ou código..."
                        className="h-9 pl-9 rounded-xl border-slate-200 text-sm"
                      />
                    </div>
                    <Button
                      onClick={()=>{setCountrySearchQuery(countrySearch);setCountryPage(1);setShowAllCountries(true);}}
                      className="h-9 rounded-xl bg-primary hover:bg-primary/90 text-xs font-bold px-4"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" />
                      Buscar
                    </Button>
                  </div>
                </div>

                {countrySearchQuery && (
                  <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-2">
                    <span>{countrySearchTotal} resultado{countrySearchTotal!==1?"s":""} para "{countrySearchQuery}" em {tab==='export'?'exportação':'importação'}</span>
                    <button onClick={()=>{setCountrySearchQuery("");setCountrySearch("");setCountryPage(1);setShowAllCountries(false);}} className="text-red-500 hover:text-red-700 font-bold text-[10px] underline">Limpar</button>
                  </p>
                )}
                {showAllCountries && !countrySearchQuery && (
                  <p className="text-[11px] text-slate-500 mb-3">
                    Página {countryPage} de {totalCountryPages} — {(trade?.country_count||0).toLocaleString("pt-BR")} países no total
                  </p>
                )}

                <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                  {filteredCountries.map((c,i)=>{
                    const globalIdx = (showAllCountries||countrySearchQuery) ? (countryPage-1)*COUNTRY_PER_PAGE+i+1 : i+1;
                    return <div key={c.code} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                      {!countrySearchQuery && <span className="text-xs font-bold text-slate-400 w-8 text-right">{globalIdx}º</span>}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-800 truncate">{c.name}</span><Badge className="text-[9px] bg-slate-100 text-slate-500 font-mono">{c.code}</Badge></div>
                        <MiniBar val={c.fob} max={maxCountryFob} color={tab==="export"?"bg-sky-500":"bg-orange-500"} height="h-2"/>
                        {tab === "import" && (c.frete||0) > 0 && <p className="text-[9px] text-blue-500 mt-0.5"><Ship className="w-2.5 h-2.5 inline mr-0.5"/>Frete: ${fmt$(c.frete)} ({((c.frete||0)/c.fob*100).toFixed(1)}% FOB)</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-700">${fmt$(c.fob)}</p>
                        <p className="text-[10px] text-slate-500">{((c.fob/(trade?.total_fob||1))*100).toFixed(1)}%</p>
                      </div>
                    </div>;
                  })}
                  {filteredCountries.length === 0 && countrySearchQuery && (
                    <div className="text-center py-10 text-slate-400">
                      <p className="text-sm font-medium">Nenhum país encontrado para "{countrySearchQuery}"</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {(showAllCountries||countrySearchQuery) && totalCountryPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button onClick={()=>setCountryPage(Math.max(1, countryPage-1))} disabled={countryPage===1}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50">
                      Anterior
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      {countryPage} / {totalCountryPages}
                    </span>
                    <button onClick={()=>setCountryPage(Math.min(totalCountryPages, countryPage+1))} disabled={countryPage===totalCountryPages}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50">
                      Próximo
                    </button>
                  </div>
                )}

                {!countrySearchQuery && (trade?.country_count||0) > 15 && (
                  <button onClick={()=>{setShowAllCountries(!showAllCountries); setCountryPage(1);}} className="w-full mt-3 text-xs font-bold text-red-500 hover:text-red-700 py-2 flex items-center justify-center gap-1">
                    {showAllCountries ? <><ChevronUp className="w-3 h-3"/> Mostrar top 15</> : <><ChevronDown className="w-3 h-3"/> Ver todos os {(trade?.country_count||0).toLocaleString("pt-BR")} países</>}
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Freight Cost by Country (from CSVs) */}
            {tab === "import" && (
              <Card className="border-slate-200 shadow-sm overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-400" />
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4"><Ship className="w-4 h-4 text-red-500"/>Custo de Frete por País</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(trade?.top_countries||[]).filter(c=>c.frete).slice(0,8).map(c=>{
                      const ratio = (c.frete||0) / (trade?.total_frete||1) * 100;
                      return <Card key={c.code} className="border-slate-200"><CardContent className="p-3">
                        <p className="text-xs font-bold text-slate-700 truncate">{c.name}</p>
                        <p className="text-[10px] font-black text-blue-600 mt-1">${fmt$(c.frete||0)}</p>
                        <p className="text-[9px] text-slate-500">{ratio.toFixed(1)}% do frete total • {((c.frete||0)/c.fob*100).toFixed(1)}% FOB</p>
                      </CardContent></Card>;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* ═══ STEP 4: FREIGHT (from CSVs) ═══ */}
        {step === "freight" && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
            {tab === "import" && trade?.total_frete ? (
              <>
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-400" />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Ship className="w-4 h-4 text-red-500" />Custos de Frete (Importação)
                      </h3>
                      <Badge className="bg-blue-50 text-blue-600 text-[10px]">{trade.top_countries.filter(c=>c.frete).length} países com frete</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        ["Frete Total", `$${fmt$(trade.total_frete)}`, "text-blue-600", "bg-blue-50"],
                        ["Seguro Total", `$${fmt$(trade.total_seguro)}`, "text-emerald-600", "bg-emerald-50"],
                        ["Média Frete/FOB", `${(trade.total_frete / trade.total_fob * 100).toFixed(1)}%`, "text-purple-600", "bg-purple-50"],
                        ["CIF + Seguro", `$${fmt$(trade.total_frete + trade.total_seguro)}`, "text-amber-600", "bg-amber-50"],
                      ].map(([l,v,tc,bg]) => (
                        <div key={String(l)} className={`px-3 py-2 rounded-xl ${bg} border border-slate-100`}>
                          <p className="text-[9px] text-slate-500 uppercase font-bold">{String(l)}</p>
                          <p className={`text-sm font-black ${tc}`}>{String(v)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Freight by country table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-80 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-slate-50"><tr className="border-b border-slate-200">
                          <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">País</th>
                          <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">FOB</th>
                          <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Frete</th>
                          <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Seguro</th>
                          <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">% FOB</th>
                        </tr></thead>
                        <tbody>{(trade?.top_countries||[]).filter(c=>c.frete).map(c=>
                          <tr key={c.code} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2 text-xs font-bold text-slate-700">{c.name}</td>
                            <td className="px-3 py-2 text-right text-xs text-slate-700">${fmt$(c.fob)}</td>
                            <td className="px-3 py-2 text-right text-xs font-bold text-blue-700">${fmt$(c.frete||0)}</td>
                            <td className="px-3 py-2 text-right text-xs text-slate-600">${fmt$(c.seguro||0)}</td>
                            <td className="px-3 py-2 text-right text-xs text-slate-500">{((c.frete||0)/c.fob*100).toFixed(1)}%</td>
                          </tr>
                        )}</tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Freight by NCM */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
                  <CardContent className="p-5">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4"><Hash className="w-4 h-4 text-red-500"/>Top NCMs por Custo de Frete</h3>
                    <div className="space-y-1.5">
                      {(trade?.top_ncms||[]).filter(n=>n.frete).slice(0,15).map(n=>{
                        const maxF = Math.max(...(trade?.top_ncms||[]).filter(x=>x.frete).map(x=>x.frete), 1);
                        return <div key={n.ncm} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50">
                          <span className="text-xs font-bold text-slate-500 w-8 text-right">{n.rank}º</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2"><span className="font-mono font-bold text-sm text-slate-800">{n.ncm}</span><span className="text-[10px] text-slate-500 truncate">{ncmLabel(n.ncm)}</span></div>
                            <MiniBar val={n.frete} max={maxF} color="bg-blue-500" height="h-2"/>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-blue-700">${fmt$(n.frete)}</p>
                            <p className="text-[9px] text-slate-500">{((n.frete||0)/n.fob*100).toFixed(1)}% FOB</p>
                          </div>
                        </div>;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-8 text-center">
                  <Ship className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-600 mb-1">Dados de frete indisponíveis para exportação</p>
                  <p className="text-xs text-slate-500">Os dados de frete estão disponíveis apenas na aba Importação.</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* ═══ STEP 6: CITIES ═══ */}
        {step === "cities" && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-4">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-500 to-amber-400" />
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500"/>Municípios — {tab==="export"?"Exportação":"Importação"}</h3>
                  {!showAllMun&&trade?.all_municipios&&trade.all_municipios.length>12&&(
                    <button onClick={()=>setShowAllMun(true)} className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"><ChevronDown className="w-3 h-3"/>Ver todos {trade.all_municipios.length} municípios</button>)}
                  {showAllMun&&(<button onClick={()=>{setShowAllMun(false);setMunSearch("");setMunPage(1);}} className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"><ChevronUp className="w-3 h-3"/>Top 12</button>)}
                </div>

                {showAllMun ? (
                  <><div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                    <Input value={munSearch} onChange={e=>{setMunSearch(e.target.value);setMunPage(1);}} placeholder="Buscar cidade, UF, código..." className="h-9 pl-9 rounded-xl border-slate-200 text-sm w-full sm:w-72"/></div>
                    {(()=>{
                      const all=trade?.all_municipios||[];const q=munSearch.toLowerCase();const filtered=q?all.filter(m=>m.name.toLowerCase().includes(q)||m.uf.toLowerCase().includes(q)||m.code.includes(q)):all;
                      const pp=25;const tp=Math.max(1,Math.ceil(filtered.length/pp));const start=(munPage-1)*pp;const items=filtered.slice(start,start+pp);
                      return <><p className="text-[11px] text-slate-500 mb-3">{filtered.length} {q?"resultados":"municípios"}</p>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-sm"><thead><tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">#</th>
                            <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Município</th>
                            <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">FOB</th>
                            <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Kg</th>
                            <th className="text-right px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">%</th>
                          </tr></thead><tbody>{items.map(m=><tr key={m.code} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2 text-xs font-bold text-slate-400">{m.rank}º</td>
                            <td className="px-3 py-2"><div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-800">{m.name}</span><span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{m.code}</span></div></td>
                            <td className="px-3 py-2 text-right text-sm font-black text-slate-700">${fmt$(m.fob)}</td>
                            <td className="px-3 py-2 text-right text-xs text-slate-600">{fmtKg(m.kg)}</td>
                            <td className="px-3 py-2 text-right text-xs text-slate-500">{((m.fob/(trade?.total_fob||1))*100).toFixed(2)}%</td>
                          </tr>)}</tbody></table>
                        </div>
                        {tp>1&&<div className="flex items-center justify-center gap-2 mt-4">
                          <button onClick={()=>setMunPage(Math.max(1,munPage-1))} disabled={munPage===1} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50">Anterior</button>
                          {Array.from({length:Math.min(tp,7)},(_,i)=>{let pn:number;if(tp<=7)pn=i+1;else if(munPage<=4)pn=i+1;else if(munPage>=tp-3)pn=tp-6+i;else pn=munPage-3+i;return(<button key={pn} onClick={()=>setMunPage(pn)} className={`w-8 h-8 text-xs font-bold rounded-lg ${pn===munPage?"bg-red-600 text-white":"text-slate-600 hover:bg-slate-50 border border-slate-200"}`}>{pn}</button>);})}
                          <button onClick={()=>setMunPage(Math.min(tp,munPage+1))} disabled={munPage===tp} className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50">Próximo</button>
                        </div>}</>
                    })()}
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(trade?.top_municipios||[]).slice(0,12).map(m=><div key={m.code} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                      <span className="text-lg font-bold text-slate-300 w-6 text-center">{m.rank}</span>
                      <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><span className="text-sm font-bold text-slate-800 truncate">{m.name}</span><span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{m.uf}</span></div>
                        <p className="text-[10px] text-slate-500">{((m.fob/(trade?.total_fob||1))*100).toFixed(1)}% do total</p></div>
                      <p className="text-sm font-black text-slate-700">${fmt$(m.fob)}</p>
                    </div>)}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <p className="text-[10px] text-slate-400 text-center pb-6">Período: {data.meta.period}</p>
      </div>
    </div>
  );
}
