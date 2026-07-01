import { useState, Fragment, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Search, Loader2, Hash, BadgeCheck, Calculator, Trophy,
  AlertTriangle, MapPin, Percent, Landmark, TrendingDown, Clock, ArrowUpDown,
  ChevronDown, ChevronUp, X, BarChart3, ArrowRight, Info, TrendingUp, Medal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { searchWits, compareWits, getCountries, type WitsTariffItem, type WitsCompareItem } from "@/services/witsTariffs";
// ═══════════════════ CONSTANTS ═══════════════════
const VAT_URL = "https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/world_vat_rates.json";
const HISTORY_KEY = "global_tariff_history";

// Countries will be loaded dynamically from WITS API

const VAT_COUNTRY_MAP: Record<string, string> = {
  "United Arab Emirates": "UAE", "United States of America": "USA",
};

const HS2_CHAPTERS_PT: Record<string, string> = {
  "01":"Animais vivos","02":"Carnes e miudezas","03":"Peixes e crustáceos","04":"Laticínios; ovos; mel",
  "05":"Produtos de origem animal","06":"Plantas vivas e flores","07":"Hortaliças e raízes","08":"Frutas",
  "09":"Café, chá, mate e especiarias","10":"Cereais","11":"Produtos da moagem","12":"Sementes",
  "13":"Gomas e resinas","14":"Matérias para trançar","15":"Gorduras e óleos","16":"Preparações de carne/peixe",
  "17":"Açúcares","18":"Cacau","19":"Preparações de cereais","20":"Preparações de hortaliças/frutas",
  "21":"Preparações alimentícias","22":"Bebidas e vinagre","23":"Resíduos alimentares","24":"Tabaco",
  "25":"Sal; enxofre; gesso","26":"Minérios","27":"Combustíveis minerais","28":"Químicos inorgânicos",
  "29":"Químicos orgânicos","30":"Farmacêuticos","31":"Adubos","32":"Pigmentos e tintas",
  "33":"Perfumaria","34":"Sabões e ceras","35":"Colas e enzimas","36":"Explosivos","37":"Fotografia",
  "38":"Químicos diversos","39":"Plásticos","40":"Borracha","41":"Peles e couros","42":"Obras de couro",
  "43":"Peles com pelos","44":"Madeira","45":"Cortiça","46":"Espartaria","47":"Pastas de madeira",
  "48":"Papel e cartão","49":"Livros e gráficos","50":"Seda","51":"Lã e pelos","52":"Algodão",
  "53":"Fibras têxteis vegetais","54":"Filamentos sintéticos","55":"Fibras sintéticas","56":"Pastas e feltros",
  "57":"Tapetes","58":"Tecidos especiais","59":"Tecidos revestidos","60":"Malhas","61":"Vestuário de malha",
  "62":"Vestuário (exceto malha)","63":"Outros têxteis","64":"Calçados","65":"Chapéus","66":"Guarda-chuvas",
  "67":"Penas e flores artificiais","68":"Pedra, gesso, cimento","69":"Cerâmicos","70":"Vidro",
  "71":"Joalheria","72":"Ferro e aço","73":"Obras de ferro/aço","74":"Cobre","75":"Níquel","76":"Alumínio",
  "78":"Chumbo","79":"Zinco","80":"Estanho","81":"Outros metais","82":"Ferramentas","83":"Obras de metais",
  "84":"Máquinas mecânicas","85":"Máquinas elétricas","86":"Veículos férreas","87":"Veículos automóveis",
  "88":"Aeronaves","89":"Embarcações","90":"Instrumentos de precisão","91":"Relojoaria","92":"Instrumentos musicais",
  "93":"Armas","94":"Móveis","95":"Brinquedos e esportes","96":"Obras diversas","97":"Objetos de arte",
  "98":"Conjuntos industriais","99":"Transações especiais",
};

const POPULAR_HS2 = ["09","02","84","85","87","61","62","22","72","39","27","10"];

// ═══════════════════ TYPES ═══════════════════
type Severity = "emerald" | "amber" | "red";
type Tab = "tariffs" | "best" | "vat" | "simulator";
type Sector = "all" | "Ag" | "Non-Ag";
type SortOrder = "asc" | "desc" | "none";

interface TariffItem { hs_code: string; description: string; base_duty: string; final_duty: string; sector: string; }
interface VatInfo { Country: string; "Standard Rate (%)": number | string; "Tax Type": string; "Reduced Rates (%)": string; Notes: string; }
interface CountryRank { code: string; name: string; flag: string; avgRate: number; minRate: number; maxRate: number; count: number; }
interface HistoryEntry { hs: string; country: string; countryName: string; flag: string; }

// ═══════════════════ HELPERS ═══════════════════
function sev(rate: number): Severity { if (rate <= 5) return "emerald"; if (rate <= 15) return "amber"; return "red"; }
function sevLabel(rate: number): string { if (rate <= 5) return "Baixa"; if (rate <= 15) return "Média"; return "Alta"; }
function pDuty(d: string): number { const m = String(d).match(/([\d.]+)/); return m ? parseFloat(m[1]) : 0; }
function hs2Name(hs: string): string { return HS2_CHAPTERS_PT[hs.slice(0, 2)] || `Cap. ${hs.slice(0, 2)}`; }
function getEffTariff(countryCode: string, wtoRate: number): { rate: number; note?: string } {
  // Section 122 (Trade Act 1974): tarifa universal de 10% para importações nos EUA
  if (countryCode === "USA") {
    const effectiveRate = wtoRate + 10;
    return { rate: effectiveRate, note: `Base ${wtoRate}% + 10% Section 122` };
  }
  return { rate: wtoRate };
}
function fmt(n: number): string { return n.toLocaleString("pt-BR"); }
function fmtR$(n: number): string { return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 }); }
function heatColor(count: number, max: number): string {
  const pct = max > 0 ? count / max : 0;
  if (pct > 0.8) return "bg-red-50 border-red-200 text-red-700";
  if (pct > 0.5) return "bg-orange-50 border-orange-200 text-orange-700";
  if (pct > 0.3) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-emerald-50 border-emerald-200 text-emerald-700";
}

const S_BG: Record<Severity, string> = { emerald: "bg-emerald-50 border-emerald-200", amber: "bg-amber-50 border-amber-200", red: "bg-red-50 border-red-200" };
const S_TXT: Record<Severity, string> = { emerald: "text-emerald-700", amber: "text-amber-700", red: "text-red-700" };
const S_BADGE: Record<Severity, string> = { emerald: "bg-emerald-100 text-emerald-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700" };
const S_BAR: Record<Severity, string> = { emerald: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500" };
const S_DOT: Record<Severity, string> = { emerald: "bg-emerald-400", amber: "bg-amber-400", red: "bg-red-400" };

function loadHistory(): HistoryEntry[] { try { const raw = localStorage.getItem(HISTORY_KEY); return raw ? JSON.parse(raw) : []; } catch { return []; } }
function saveHistory(entry: HistoryEntry) {
  const h = loadHistory().filter(e => !(e.hs === entry.hs && e.country === entry.country));
  h.unshift(entry); localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 5)));
}

// ═══════════════════ COMPONENT ═══════════════════
export default function GlobalTariffLookup() {
  useSeo({ title: "Alíquotas por País — Tarifário Global", description: "Alíquotas de importação, VAT, ranking e simulação de custos para 31 países. Dados atualizados.", keywords: "alíquota, tarifa, VAT, imposto importação" });

  const { consume } = useUsage();

  const [tab, setTab] = useState<Tab>("tariffs");
  const [destination, setDestination] = useState("USA");
  const [hs6, setHs6] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tariffs, setTariffs] = useState<TariffItem[]>([]);
  const [totalTariffs, setTotalTariffs] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [showAc, setShowAc] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [sectorFilter, setSectorFilter] = useState<Sector>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [countryCounts, setCountryCounts] = useState<Record<string, number>>({});
  const [witsCountries, setWitsCountries] = useState<WitsCountryInfo[]>([]);
  const [witsLoading, setWitsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const [vatData, setVatData] = useState<VatInfo[]>([]);
  const [vatSearch, setVatSearch] = useState("");
  const [simFob, setSimFob] = useState("10000"); const [simFreight, setSimFreight] = useState("500"); const [simInsurance, setSimInsurance] = useState("100");
  const [selectedHsRate, setSelectedHsRate] = useState<number | null>(null);
  const [bestHs, setBestHs] = useState(""); const [bestLoading, setBestLoading] = useState(false); const [bestRanking, setBestRanking] = useState<CountryRank[]>([]);

  const destCountry = witsCountries.find((c) => c.iso3 === destination) ? { code: destination, name: witsCountries.find(c => c.iso3 === destination)!.nome, flag: "" } : null;

  // Load VAT + WITS countries on mount
  useEffect(() => {
    fetch(VAT_URL).then(r => r.json()).then(setVatData).catch(() => {});
    fetch("/wits_tariffs_summary.json")
      .then(r => r.json())
      .then((list: any[]) => {
        setWitsCountries(list.map(c => ({ iso3: c.iso3, nome: c.country, linhas: c.hs6 })));
        const map: Record<string, number> = {};
        for (const c of list) map[c.iso3] = c.hs6 || 0;
        setCountryCounts(map);
        setWitsLoading(false);
      })
      .catch(() => setWitsLoading(false));
  }, []);

  const maxCount = Math.max(...Object.values(countryCounts), 1);

  const countryVat = useMemo(() => {
    if (!destCountry) return null;
    const vatLookupName = VAT_COUNTRY_MAP[destCountry.name] || destCountry.name;
    const name = destCountry.name?.toLowerCase() || "";
    return vatData.find(v => v.Country?.toLowerCase() === vatLookupName.toLowerCase() || v.Country?.toLowerCase().includes(name)) || null;
  }, [vatData, destCountry]);

  const stats = useMemo(() => {
    const rates = tariffs.map(t => {
      const base = pDuty(t.final_duty || t.base_duty);
      const { rate } = getEffTariff(destination, base);
      return rate;
    }).filter(r => r > 0);
    if (rates.length === 0) return null;
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    return { avg, min: Math.min(...rates), max: Math.max(...rates), count: tariffs.length, avgColor: sev(avg) };
  }, [tariffs, destination]);

  // Raw (original) average without Section 122 — for the simulator
  const rawAvg = useMemo(() => {
    const rates = tariffs.map(t => pDuty(t.final_duty || t.base_duty)).filter(r => r > 0);
    return rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  }, [tariffs]);

  // Simulator rate: use selected HS rate or effective average (já com Section 122)
  const simRate = useMemo(() => {
    if (selectedHsRate !== null) return selectedHsRate;
    return stats?.avg || 0;
  }, [selectedHsRate, stats]);

  const simResult = useMemo(() => {
    const cif = parseFloat(simFob) + parseFloat(simFreight) + parseFloat(simInsurance);
    // Tarifa TOTAL (já inclui Section 122 para EUA)
    const tariffAmount = cif * (simRate / 100);
    // Section 122: adicional extra sobre CIF (soma ao total)
    const section122Amount = destination === "USA" ? cif * 0.10 : 0;
    const vatRate = typeof countryVat?.["Standard Rate (%)"] === "number" ? countryVat["Standard Rate (%)"] as number : parseFloat(String(countryVat?.["Standard Rate (%)"] || "0")) || 0;
    const vatAmount = (cif + tariffAmount + section122Amount) * (vatRate / 100);
    return { cif, simRate, tariffAmount, section122Amount, vatRate, vatAmount, total: cif + tariffAmount + section122Amount + vatAmount };
  }, [simFob, simFreight, simInsurance, simRate, countryVat, destination]);

  const autocompleteSuggestions = useMemo(() => {
    if (hs6.length < 1) return [];
    return Object.entries(HS2_CHAPTERS_PT).filter(([code, name]) => code.startsWith(hs6) || name.toLowerCase().includes(hs6)).slice(0, 6);
  }, [hs6]);

  const sectorStats = useMemo(() => {
    const ag = tariffs.filter(t => t.sector === "Ag");
    const nonAg = tariffs.filter(t => t.sector === "Non-Ag");
    const agRates = ag.map(t => pDuty(t.final_duty || t.base_duty)).filter(r => r > 0);
    const naRates = nonAg.map(t => pDuty(t.final_duty || t.base_duty)).filter(r => r > 0);
    return { agCount: ag.length, nonAgCount: nonAg.length, agAvg: agRates.length ? agRates.reduce((a,b)=>a+b,0)/agRates.length : 0, nonAgAvg: naRates.length ? naRates.reduce((a,b)=>a+b,0)/naRates.length : 0 };
  }, [tariffs]);

  // Filtered + sorted tariffs
  const filteredTariffs = useMemo(() => {
    let list = tariffs.filter(t => pDuty(t.final_duty || t.base_duty) > 0);
    if (sectorFilter !== "all") list = list.filter(t => t.sector === sectorFilter);
    if (sortOrder !== "none") {
      list = [...list].sort((a, b) => {
        const ra = pDuty(a.final_duty || a.base_duty);
        const rb = pDuty(b.final_duty || b.base_duty);
        return sortOrder === "asc" ? ra - rb : rb - ra;
      });
    }
    return list;
  }, [tariffs, sectorFilter, sortOrder]);
  const displayedTariffs = expanded ? filteredTariffs : filteredTariffs.slice(0, 30);

  async function handleSearch(hs?: string) {
    const query = hs || hs6;
    setLoading(true); setError(""); setTariffs([]); setExpanded(false); setSelectedHsRate(null); setSortOrder("none");
    try {
      // Consume usage credit
      const ok = await consume("search");
      if (!ok) { setError("Créditos insuficientes. Faça upgrade."); setLoading(false); return; }

      const witsCountry = witsCountries.find(c => c.iso3 === destination);
      if (!witsCountry) throw new Error("País não mapeado no WITS");
      if (query.length < 2) throw new Error("Digite pelo menos 2 dígitos");
      const results = await searchWits(query, 200);
      // Filter by destination country and convert to TariffItem format
      const countryResults = results.filter(r => r.pais_iso3 === destination);
      if (countryResults.length === 0) throw new Error("Nenhuma tarifa encontrada para este país.");
      const items: TariffItem[] = countryResults.map(d => {
        const ch = parseInt(d.hs_code.slice(0, 2), 10);
        const sector = (ch >= 1 && ch <= 24) ? "Ag" : "Non-Ag";
        const rate = d.tariff_applied ?? d.tariff_mfn ?? 0;
        return { hs_code: d.hs_code, description: d.descricao || hs2Name(d.hs_code), base_duty: `${rate}`, final_duty: `${rate}`, sector };
      });
      items.sort((a, b) => a.hs_code.localeCompare(b.hs_code));
      setTariffs(items); setTotalTariffs(items.length);
      saveHistory({ hs: query, country: destination, countryName: destCountry?.name || "", flag: destCountry?.flag || "" });
      setHistory(loadHistory());
    } catch (e: any) { setError(e.message || "Erro"); }
    finally { setLoading(false); }
  }

  async function handleBestCountry(hs?: string) {
    const query = hs || bestHs;
    setBestLoading(true); setBestRanking([]); setError("");
    try {
      // Consume usage credit (country comparison = more expensive)
      const ok = await consume("ranking_run");
      if (!ok) { setError("Créditos insuficientes. Faça upgrade."); setBestLoading(false); return; }

      if (query.length < 2) throw new Error("Digite pelo menos 2 dígitos");
      // Use WITS compare to get tariff ranking across countries
      const compareResults = await compareWits(query, 50);
      const items: CountryRank[] = compareResults
        .filter(r => (r.tariff_applied ?? r.tariff_mfn ?? 0) > 0)
        .map(r => {
          const rate = r.tariff_applied ?? r.tariff_mfn ?? 0;
          const { rate: adjRate } = getEffTariff(r.pais_iso3, rate);
          return {
            code: r.pais_iso3,
            name: r.pais_nome,
            flag: "",
            avgRate: adjRate,
            minRate: adjRate,
            maxRate: adjRate,
            count: 1
          } as CountryRank;
        });
      items.sort((a, b) => a.avgRate - b.avgRate);
      setBestRanking(items);
      if (items.length === 0) setError("Nenhum país com tarifas.");
    } catch (e: any) { setError(e.message || "Erro"); }
    finally { setBestLoading(false); }
  }

  function goToCountryDetail(code: string) { setDestination(code); setTab("tariffs"); }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Alíquotas por País" subtitle="Alíquotas de importação, VAT, ranking e simulação para 160+ países"
        badges={[{ label: "160+ Países", icon: <Globe className="w-3 h-3 mr-1" /> },{ label: "860K+ Tarifas", icon: <Hash className="w-3 h-3 mr-1" /> },{ label: "Alíquotas", icon: <BadgeCheck className="w-3 h-3 mr-1" /> }]} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* ════ TABS ════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-1 p-1 rounded-xl bg-white border border-slate-200 shadow-sm w-fit mb-4 flex-wrap">
          {(["tariffs","best","vat","simulator"] as const).map((id) => (
            <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === id ? "bg-red-600 text-white shadow-md shadow-red-200" : "text-slate-600 hover:text-slate-700 hover:bg-slate-50"}`}>
              {id === "tariffs" && <Percent className="w-4 h-4" />}
              {id === "best" && <Trophy className="w-4 h-4" />}
              {id === "vat" && <Landmark className="w-4 h-4" />}
              {id === "simulator" && <Calculator className="w-4 h-4" />}
              {id === "tariffs" ? "Alíquotas" : id === "best" ? "Melhor País" : id === "vat" ? "VAT / Impostos" : "Simulador"}
            </button>
          ))}
        </motion.div>

        {/* ════ COUNTRY GRID ════ */}
        {tab !== "best" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-red-500" /> Selecione o país de destino</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2">
              {witsCountries.map((c) => {
                const cnt = countryCounts[c.iso3] || 0;
                const heatClass = cnt > 0 && maxCount > 0 ? heatColor(cnt, maxCount) : "";
                return (
                  <button key={c.iso3} onClick={() => setDestination(c.iso3)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center
                      ${c.iso3 === destination ? "border-red-300 bg-red-50 shadow-md shadow-red-100 scale-105 z-10" : `border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm`}`}>
                    <span className="text-xl">🌍</span>
                    <span className={`text-[10px] font-semibold leading-tight ${c.iso3 === destination ? "text-red-700" : "text-slate-600"}`}>{c.nome}</span>
                    {cnt > 0 && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${heatClass}`}>{fmt(cnt)}</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* ═══════════════════ TARIFFS TAB ═══════════════════ */}
          {tab === "tariffs" && (
            <motion.div key="tariffs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {destination === "USA" && (
                <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                  <div><b>Section 122: +10% sobre tarifa base.</b> Todas as tarifas já incluem os 10% adicionais.</div>
                </div>
              )}
              <Card className="border-slate-200 shadow-sm mb-4">
                <CardContent className="p-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3"><Hash className="w-4 h-4 text-red-500" /> Código HS</label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Input ref={inputRef} value={hs6} onChange={(e) => { setHs6(e.target.value.replace(/[^0-9]/g, "").slice(0, 10)); setShowAc(true); }}
                        onFocus={() => setShowAc(true)} onBlur={() => setTimeout(() => setShowAc(false), 150)}
                        placeholder="Ex: 0901 (Café)" className="h-12 rounded-xl border-slate-200 text-lg font-mono pr-8"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                      {hs6 && <button onClick={() => setHs6("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"><X className="w-4 h-4" /></button>}
                      {showAc && autocompleteSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
                          {autocompleteSuggestions.map(([code, name]) => (
                            <button key={code} onMouseDown={() => { setHs6(code); handleSearch(code); setShowAc(false); }}
                              className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm flex items-center gap-2 border-b border-slate-50 last:border-0">
                              <span className="font-mono font-bold text-red-500">{code}</span><span className="text-slate-600">{name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={() => handleSearch()} disabled={loading || hs6.length < 2} className="h-12 px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-4 h-4 mr-2" /> Consultar</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <AnimatePresence>{error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</motion.div>}</AnimatePresence>

              <AnimatePresence>
                {filteredTariffs.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <span className="text-2xl">{destCountry?.flag}</span>
                      <h3 className="text-lg font-bold text-slate-800">{destCountry?.name}</h3>
                      <Badge className="bg-slate-100 text-slate-600">{totalTariffs} tarifas</Badge>
                      {stats && (<><Badge className={`${S_BADGE[stats.avgColor]} font-semibold`}><Percent className="w-3 h-3 mr-1" /> Média {stats.avg.toFixed(1)}%</Badge><Badge className="bg-slate-50 text-slate-600"><BarChart3 className="w-3 h-3 mr-1" /> {stats.min}% – {stats.max}%</Badge></>)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {displayedTariffs.map((t, i) => {
                        const wtoRate = pDuty(t.final_duty || t.base_duty);
                        const { rate, note } = getEffTariff(destination, wtoRate);
                        const color = sev(rate);
                        return (
                          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}>
                            <Card className={`border shadow-sm hover:shadow-md transition-shadow ${S_BG[color]}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div><span className="text-xs font-mono font-bold text-slate-600">{t.hs_code}</span><p className="text-[11px] text-slate-600 mt-0.5">{hs2Name(t.hs_code)}</p></div>
                                  <div className="flex items-center gap-1.5"><span className={`text-[9px] px-1.5 py-0.5 rounded ${t.sector === "Ag" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-600"}`}>{t.sector === "Ag" ? "Ag" : "Ind"}</span><div className={`w-2 h-2 rounded-full ${S_DOT[color]}`} /></div>
                                </div>
                                <div className="flex items-end justify-between">
                                  <div><span className={`text-2xl font-black ${S_TXT[color]}`}>{rate > 0 ? `${rate}%` : "N/D"}</span>{note && <span className="block text-[10px] text-amber-600 mt-0.5">{note}</span>}</div>
                                  <Badge className={`${S_BADGE[color]} text-[10px]`}>{sevLabel(rate)}</Badge>
                                </div>
                                <div className="mt-2 h-1 rounded-full bg-slate-200 overflow-hidden"><div className={`h-full rounded-full ${S_BAR[color]} transition-all`} style={{ width: `${Math.min(rate, 100)}%` }} /></div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                    {filteredTariffs.length > 30 && (
                      <div className="text-center pt-2"><Button variant="outline" onClick={() => setExpanded(!expanded)} className="text-sm border-slate-200">{expanded ? <><ChevronUp className="w-4 h-4 mr-1" /> Mostrar menos</> : <><ChevronDown className="w-4 h-4 mr-1" /> Ver todas {filteredTariffs.length} tarifas</>}</Button></div>
                    )}
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-700"><Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Dados de <b>alíquotas de importação</b>. Tarifas reais variam conforme acordos preferenciais.</div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!loading && !error && filteredTariffs.length === 0 && tariffs.length === 0 && (
                <div className="text-center py-16"><div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-3"><TrendingUp className="w-6 h-6 text-slate-300" /></div><p className="text-slate-600 font-medium">Selecione um país e digite um código HS</p><p className="text-xs text-slate-300 mt-1">Ex: EUA + 0901 = tarifas de café nos EUA</p></div>
              )}
            </motion.div>
          )}

          {/* ═══════════════════ BEST COUNTRY TAB ═══════════════════ */}
          {tab === "best" && (
            <motion.div key="best" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="border-slate-200 shadow-sm mb-5 bg-gradient-to-r from-amber-50 to-yellow-50">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Trophy className="w-5 h-5 text-amber-600" /></div><div><h2 className="text-lg font-bold text-slate-800">Melhor País para Importar</h2><p className="text-sm text-slate-600">Menor tarifa entre 31 países</p></div></div>
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3"><Hash className="w-4 h-4 text-red-500" /> Código HS</label>
                  <div className="flex gap-3">
                    <Input value={bestHs} onChange={(e) => setBestHs(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))} placeholder="Ex: 0901 (Café)" className="h-12 rounded-xl border-slate-200 text-lg font-mono" onKeyDown={(e) => e.key === "Enter" && handleBestCountry()} />
                    <Button onClick={() => handleBestCountry()} disabled={bestLoading || bestHs.length < 2} className="h-12 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-200">{bestLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Trophy className="w-4 h-4 mr-2" /> Comparar 31 países</>}</Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3"><span className="text-[10px] text-slate-600 mr-1 pt-0.5">Sugestões:</span>{POPULAR_HS2.map((ch) => (<button key={ch} onClick={() => { setBestHs(ch); handleBestCountry(ch); }} className="px-2.5 py-1 text-[11px] rounded-lg bg-white hover:bg-amber-50 hover:text-amber-700 text-slate-600 font-medium transition-colors border border-slate-100">{ch} {HS2_CHAPTERS_PT[ch]?.split(";")[0].split(",")[0]}</button>))}</div>
                </CardContent>
              </Card>

              <AnimatePresence>{error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center gap-3 text-sm"><AlertTriangle className="w-4 h-4" /> {error}</motion.div>}</AnimatePresence>

              <AnimatePresence>
                {bestRanking.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    {/* Podium top 3 — layout: 🥈 | 🥇(meio/maior) | 🥉 */}
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 0, 2].map((rankIdx, displayIdx) => {
                        const r = bestRanking[rankIdx];
                        if (!r) return null;
                        const medals = ["🥇","🥈","🥉"];
                        const isGold = rankIdx === 0;
                        const styles = [
                          "bg-gradient-to-b from-slate-50 to-gray-50 border-slate-300 shadow-md",           // left = 2nd
                          "bg-gradient-to-b from-yellow-50 to-amber-50 border-amber-300 shadow-lg shadow-amber-100 scale-110 z-10", // center = 1st (bigger)
                          "bg-gradient-to-b from-orange-50 to-amber-50 border-orange-200 shadow-md",        // right = 3rd
                        ];
                        return (
                          <Card key={r.code} className={`border-2 ${styles[displayIdx]} rounded-2xl text-center`}>
                            <CardContent className="p-4">
                              <span className="text-3xl">{medals[rankIdx]}</span>
                              <div className="text-3xl my-2">{r.flag}</div>
                              <h3 className="font-bold text-slate-800 text-sm">{r.name}</h3>
                              <div className="mt-2"><span className={`text-2xl font-black ${isGold ? "text-emerald-600" : "text-slate-600"}`}>{r.avgRate.toFixed(1)}%</span><p className="text-[10px] text-slate-600">tarifa média</p></div>
                              <Badge className="mt-1 bg-white text-slate-600 text-[10px]">{r.count} tarifas</Badge>
                              <button onClick={() => goToCountryDetail(r.code)} className="mt-2 text-[10px] text-red-500 hover:text-red-700 font-medium">Ver detalhes →</button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Bar chart */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardContent className="p-5">
                        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-red-500" /> Tarifa média por país (menor → maior)</h3>
                        <div className="space-y-2">
                          {bestRanking.map((r) => {
                            const maxBar = Math.max(...bestRanking.map(x => x.avgRate), 1);
                            const pct = (r.avgRate / maxBar) * 100;
                            const color = sev(r.avgRate);
                            return (
                              <button key={r.code} onClick={() => goToCountryDetail(r.code)} className="w-full flex items-center gap-3 group hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors">
                                <span className="text-lg w-7">{r.flag}</span><span className="text-xs font-semibold text-slate-700 w-20 truncate">{r.name}</span>
                                <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${S_BAR[color]} transition-all flex items-center justify-end pr-2`} style={{ width: `${Math.max(pct, 3)}%` }}><span className="text-[9px] font-bold text-white drop-shadow">{r.avgRate.toFixed(1)}%</span></div></div>
                                <span className="text-[10px] text-slate-600 w-16 text-right">{r.minRate.toFixed(0)}–{r.maxRate.toFixed(0)}%</span>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Full ranking */}
                    <Card className="border-slate-200 shadow-sm">
                      <CardContent className="p-4">
                        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-emerald-500" /> Ranking completo</h3>
                        <div className="space-y-1">
                          {bestRanking.map((r, i) => {
                            const color = sev(r.avgRate);
                            return (
                              <div key={r.code} onClick={() => goToCountryDetail(r.code)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                                <span className="text-xs font-bold text-slate-600 w-6 text-right">{i + 1}º</span><span className="text-xl">{r.flag}</span><span className="text-sm font-semibold text-slate-700 flex-1">{r.name}</span>
                                <Badge className={`${S_BADGE[color]} font-bold`}>{r.avgRate.toFixed(1)}%</Badge>
                                <span className="text-[10px] text-slate-600 w-16 text-right">{r.minRate.toFixed(0)}–{r.maxRate.toFixed(0)}%</span>
                                <span className="text-[10px] text-slate-300 w-12 text-right">{r.count}</span>
                                <ArrowRight className="w-3 h-3 text-slate-300" />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-700"><Info className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Média de alíquotas efetivas. Clique num país para detalhes.</div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!bestLoading && bestRanking.length === 0 && (<div className="text-center py-12"><div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-3"><Trophy className="w-6 h-6 text-slate-300" /></div><p className="text-slate-600 font-medium">Digite um código HS para comparar tarifas</p></div>)}
            </motion.div>
          )}

          {/* ═══════════════════ VAT TAB ═══════════════════ */}
          {tab === "vat" && (
            <motion.div key="vat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Landmark className="w-5 h-5 text-amber-600" /></div><div><h2 className="text-lg font-bold text-slate-800">VAT & Impostos sobre Consumo</h2><p className="text-sm text-slate-600">País selecionado</p></div></div>
                  
                  {/* EUA Special Section 122 Info */}
                  {destination === "USA" && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 mb-5">
                      <h3 className="text-sm font-bold text-red-800 mb-2">EUA — Impostos de Importação</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-white border border-red-100">
                          <p className="text-[10px] text-slate-600 uppercase">Section 122</p>
                          <p className="text-2xl font-black text-red-600">10%</p>
                          <p className="text-[10px] text-slate-600">Tarifa universal sobre importações</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white border border-red-100">
                          <p className="text-[10px] text-slate-600 uppercase">MPF</p>
                          <p className="text-2xl font-black text-red-600">0,3464%</p>
                          <p className="text-[10px] text-slate-600">Merchandise Processing Fee</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">Sem VAT federal nos EUA. Os impostos acima são cobrados na importação.</p>
                    </div>
                  )}
                  
                  {countryVat ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                      <div className="flex items-center gap-3 mb-4"><span className="text-2xl">{destCountry?.flag}</span><div><h3 className="text-lg font-bold text-slate-800">{countryVat.Country}</h3><p className="text-xs text-slate-600">{countryVat["Tax Type"] || "VAT/GST"}</p></div></div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white/80 border border-amber-100"><p className="text-[10px] text-slate-600 uppercase">Alíquota Padrão</p>{countryVat["Standard Rate (%)"] === "N/A" || countryVat["Standard Rate (%)"] === 0 ? <div><p className="text-sm font-bold text-slate-600">Sem VAT</p><p className="text-[10px] text-slate-600 mt-0.5">Estadual/municipal</p></div> : <p className="text-2xl font-black text-amber-600">{countryVat["Standard Rate (%)"]}%</p>}</div>
                        <div className="p-3 rounded-xl bg-white/80 border border-amber-100"><p className="text-[10px] text-slate-600 uppercase">Reduzida</p><p className="text-sm font-bold text-slate-700">{countryVat["Reduced Rates (%)"] || "N/A"}</p></div>
                        <div className="p-3 rounded-xl bg-white/80 border border-amber-100 sm:col-span-2"><p className="text-[10px] text-slate-600 uppercase">Observações</p><p className="text-xs text-slate-600">{countryVat.Notes || "—"}</p></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-sm text-slate-600">Selecione um país no grid acima para ver os detalhes do VAT.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══════════════════ SIMULATOR TAB ═══════════════════ */}
          {tab === "simulator" && (
            <motion.div key="simulator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Calculator className="w-5 h-5 text-purple-600" /></div><div><h2 className="text-lg font-bold text-slate-800">Simulador de Custo</h2><p className="text-sm text-slate-600">CIF + tarifa + VAT</p></div></div>

                  <div className="flex flex-wrap items-center gap-3 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">{destCountry?.flag} {destCountry?.name}</span>
                    {hs6 && <Badge className="bg-slate-200 text-slate-600">HS {hs6} — {hs2Name(hs6)}</Badge>}
                    <Badge className={simRate === stats?.avg ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700"}>
                      Tarifa {simRate.toFixed(1)}% {selectedHsRate !== null ? "(específica)" : "(média)"} {destination === "USA" && "incl. Sec.122"}
                    </Badge>
                    {countryVat && <Badge className="bg-amber-100 text-amber-700">VAT {countryVat["Standard Rate (%)"]}%</Badge>}
                  </div>

                  {/* HS rate selector */}
                  {filteredTariffs.length > 1 && (
                    <div className="mb-4">
                      <label className="text-xs font-bold text-slate-600 uppercase mb-1.5 block">Taxa usada no cálculo</label>
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setSelectedHsRate(null)}
                          className={`px-3 py-1.5 text-[11px] rounded-lg font-medium transition-all ${selectedHsRate === null ? "bg-purple-100 text-purple-700 border border-purple-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                          Média ({stats?.avg.toFixed(1)}%)
                        </button>
                        {filteredTariffs.slice(0, 8).map((t, i) => {
                          const rawR = pDuty(t.final_duty || t.base_duty);
                          const effR = getEffTariff(destination, rawR).rate;
                          return (
                            <button key={i} onClick={() => setSelectedHsRate(effR)}
                              className={`px-3 py-1.5 text-[11px] rounded-lg font-medium font-mono transition-all ${selectedHsRate === effR ? "bg-red-100 text-red-700 border border-red-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                              {t.hs_code}: {effR}%
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div><label className="text-xs font-bold text-slate-600 uppercase mb-1.5 block">FOB (R$)</label><Input value={simFob} onChange={(e) => setSimFob(e.target.value.replace(/[^0-9]/g, ""))} className="h-12 rounded-xl border-slate-200 text-lg font-mono" /></div>
                    <div><label className="text-xs font-bold text-slate-600 uppercase mb-1.5 block">Frete (R$)</label><Input value={simFreight} onChange={(e) => setSimFreight(e.target.value.replace(/[^0-9]/g, ""))} className="h-12 rounded-xl border-slate-200 text-lg font-mono" /></div>
                    <div><label className="text-xs font-bold text-slate-600 uppercase mb-1.5 block">Seguro (R$)</label><Input value={simInsurance} onChange={(e) => setSimInsurance(e.target.value.replace(/[^0-9]/g, ""))} className="h-12 rounded-xl border-slate-200 text-lg font-mono" /></div>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-200 mb-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-sm">
                      {(() => {
                        const flowItems: [string, number, string, string][] = [
                          ["CIF", simResult.cif, "text-slate-800", "bg-white border-slate-200"],
                          [`Tarifa ${simResult.simRate.toFixed(1)}%`, simResult.tariffAmount, "text-red-600", "bg-red-50 border-red-100"],
                        ];
                        if (simResult.section122Amount > 0) {
                          flowItems.push(["Section 122 10%", simResult.section122Amount, "text-orange-600", "bg-orange-50 border-orange-100"]);
                        }
                        flowItems.push(
                          [`VAT ${simResult.vatRate}%`, simResult.vatAmount, "text-amber-600", "bg-amber-50 border-amber-100"],
                          ["Total", simResult.total, "text-white", "bg-red-600"]
                        );
                        return flowItems.map(([l, v, tc, bg], i) => (
                          <Fragment key={l}>
                            {i > 0 && <ArrowRight className="w-5 h-5 text-slate-300 shrink-0 rotate-90 sm:rotate-0" />}
                            <div className={`flex-1 w-full p-3 rounded-xl border text-center ${bg}`}>
                              <p className="text-[10px] text-slate-600 uppercase">{l}</p>
                              <p className={`text-xl font-black ${tc}`}>R$ {fmtR$(v)}</p>
                            </div>
                          </Fragment>
                        ));
                      })()}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm space-y-2">
                    {(() => {
                      const items: [string, number][] = [
                        ["FOB", parseFloat(simFob)],
                        ["Frete", parseFloat(simFreight)],
                        ["Seguro", parseFloat(simInsurance)],
                        [`Tarifa ${simResult.simRate.toFixed(1)}%`, simResult.tariffAmount],
                      ];
                      if (simResult.section122Amount > 0) {
                        items.push(["Section 122 10%", simResult.section122Amount]);
                      }
                      items.push([`VAT ${simResult.vatRate}%`, simResult.vatAmount]);
                      return items.map(([l, v]) => (
                        <div key={l} className="flex justify-between">
                          <span className="text-slate-600">{l}</span>
                          <span className="font-semibold text-slate-700">R$ {fmtR$(v)}</span>
                        </div>
                      ));
                    })()}
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="font-black text-lg text-red-600">R$ {fmtR$(simResult.total)}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] text-slate-600 text-center">*Simulação com tarifa selecionada. Consulte um despachante.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
