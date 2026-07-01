import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Radar, Globe, TrendingDown, Building2, ArrowRight, Loader2,
  Sparkles, Anchor, DollarSign, AlertTriangle, MapPin, Target,
  BarChart3, TrendingUp, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedFeature } from "@/components/ProtectedFeature";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useUsage } from "@/hooks/use-usage";
import { getCTSCountries, getCTSCountryAvg } from "@/services/ctsTariffs";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const API = "/api/intel/global";

/* ── Types ── */
interface ChapterData { hs_chapter: string; description: string; count: number; }
interface TariffCountry { country: string; avg_tariff: number; hs_count: number; avg_vat: number; }
interface BrazilMacro { gdp?: number; population?: number; gdp_growth?: number; inflation?: number; exports?: number; imports?: number; }
interface TradeData { country: string; value: number; sharePct: number; }

interface Opportunity {
  id: string;
  chapter: string;
  description: string;
  importerVolume: number;
  bestMarket: string;
  bestMarketTariff: number;
  bestMarketVat: number;
  bestMarketFlag: string;
  opportunityScore: number;
  reason: string;
  tradeVolume?: number;
  tradeShare?: number;
  brazilExportTotal?: number;
}

/* ── Helpers ── */
function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("pt-BR");
}

const FLAG_MAP: Record<string, string> = Object.fromEntries([
  ["Argentina", "🇦🇷"], ["Australia", "🇦🇺"], ["Bangladesh", "🇧🇩"], ["Belarus", "🇧🇾"],
  ["Bolivia", "🇧🇴"], ["Bosnia and Herzegovina", "🇧🇦"], ["Brazil", "🇧🇷"],
  ["Brunei", "🇧🇳"], ["Canada", "🇨🇦"], ["Chile", "🇨🇱"], ["China", "🇨🇳"],
  ["Colombia", "🇨🇴"], ["Costa Rica", "🇨🇷"], ["Croatia", "🇭🇷"],
  ["Czech Republic", "🇨🇿"], ["Ecuador", "🇪🇨"], ["Egypt", "🇪🇬"],
  ["El Salvador", "🇸🇻"], ["Georgia", "🇬🇪"], ["Guatemala", "🇬🇹"],
  ["Hong Kong, China", "🇭🇰"], ["Iceland", "🇮🇸"], ["India", "🇮🇳"],
  ["Indonesia", "🇮🇩"], ["Israel", "🇮🇱"], ["Japan", "🇯🇵"], ["Jordan", "🇯🇴"],
  ["Kazakhstan", "🇰🇿"], ["Korea, Republic of", "🇰🇷"], ["Malaysia", "🇲🇾"],
  ["Mauritius", "🇲🇺"], ["Mexico", "🇲🇽"], ["Moldova", "🇲🇩"],
  ["Mongolia", "🇲🇳"], ["Montenegro", "🇲🇪"], ["Morocco", "🇲🇦"],
  ["New Zealand", "🇳🇿"], ["North Macedonia", "🇲🇰"], ["Norway", "🇳🇴"],
  ["Oman", "🇴🇲"], ["Pakistan", "🇵🇰"], ["Panama", "🇵🇦"], ["Paraguay", "🇵🇾"],
  ["Peru", "🇵🇪"], ["Philippines", "🇵🇭"], ["Russian Federation", "🇷🇺"],
  ["Saudi Arabia", "🇸🇦"], ["Singapore", "🇸🇬"], ["South Africa", "🇿🇦"],
  ["Sri Lanka", "🇱🇰"], ["Switzerland", "🇨🇭"], ["Taiwan", "🇹🇼"],
  ["Thailand", "🇹🇭"], ["Tunisia", "🇹🇳"], ["Türkiye", "🇹🇷"],
  ["Ukraine", "🇺🇦"], ["United Arab Emirates", "🇦🇪"],
  ["United Kingdom", "🇬🇧"], ["United States of America", "🇺🇸"],
  ["Uruguay", "🇺🇾"], ["Viet Nam", "🇻🇳"],
  ["South Korea", "🇰🇷"], ["European Union", "🇪🇺"],
]);

const CONTAINER_FREIGHT: Record<string, number> = Object.fromEntries([
  ["Argentina", 1200], ["Chile", 1400], ["Colombia", 1300], ["Mexico", 1800],
  ["Peru", 1500], ["Uruguay", 1100], ["Paraguay", 900], ["USA", 2500],
  ["China", 2000], ["Japan", 2800], ["Korea, Republic of", 2600],
  ["United Kingdom", 2200], ["Germany", 2400], ["France", 2400], ["Spain", 2100],
  ["Italy", 2300], ["Netherlands", 2300],
  ["South Korea", 2600],
]);

const COUNTRY_NORMALIZE: Record<string, string> = Object.fromEntries([
  ["united states of america", "United States"], ["united states", "United States"],
  ["korea, republic of", "South Korea"], ["south korea", "South Korea"],
  ["russian federation", "Russia"], ["viet nam", "Vietnam"],
  ["türkiye", "Turkey"], ["czech republic", "Czech Republic"],
  ["united arab emirates", "UAE"], ["hong kong, china", "Hong Kong"],
]);

function normalizeCountry(name: string): string {
  const lower = name.toLowerCase().trim();
  return COUNTRY_NORMALIZE[lower] || name;
}

export default function OpportunityRadar() {
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [tariffCountries, setTariffCountries] = useState<TariffCountry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  // Global macro data
  const [macro, setMacro] = useState<{ exchangeRate: number | null; brazil: BrazilMacro | null }>({ exchangeRate: null, brazil: null });

  // Trade data per chapter
  const [chapterTradeData, setChapterTradeData] = useState<Record<string, TradeData[]>>({});

  const { consume, plan } = useUsage();
  const { canAccess } = useFeatureAccess("opportunity_radar");

  /* ── Fetch macro indicators ── */
  const fetchMacro = useCallback(async () => {
    try {
      const [exRes, wbRes] = await Promise.allSettled([
        fetch(`${API}/bcb/exchange-rate`).then(r => r.json()),
        fetch(`${API}/worldbank/country/BRA`).then(r => r.json()),
      ]);
      let exchangeRate: number | null = null;
      let brazil: BrazilMacro | null = null;
      if (exRes.status === "fulfilled") {
        const d = exRes.value as any;
        exchangeRate = typeof d === "object" ? Number(d.value || d.valor || 0) : null;
      }
      if (wbRes.status === "fulfilled") brazil = wbRes.value as BrazilMacro;
      setMacro({ exchangeRate, brazil });
    } catch {}
  }, []);

  /* ── Fetch trade data for a chapter ── */
  const fetchTradeForChapter = useCallback(async (chapter: string) => {
    if (chapterTradeData[chapter]) return;
    try {
      const res = await fetch(`${API}/market-share/${chapter}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.partners?.length) {
        const total = data.brazil?.export_total || 0;
        const partners: TradeData[] = data.partners.map((p: any) => ({
          country: normalizeCountry(p.country),
          value: p.value,
          sharePct: total > 0 ? (p.value / total) * 100 : 0,
        }));
        setChapterTradeData(prev => ({ ...prev, [chapter]: partners }));
      }
    } catch {}
  }, [chapterTradeData]);

  // When user selects a chapter, fetch trade data
  useEffect(() => {
    if (selectedChapter) fetchTradeForChapter(selectedChapter);
  }, [selectedChapter, fetchTradeForChapter]);

  /* ── Fetch main data ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch macro first
      fetchMacro();

      // Importers chapters
      const chRes = await fetch("/api/vps/importadores/index");
      if (!chRes.ok) throw new Error("Falha ao carregar importadores");
      const chData: ChapterData[] = await chRes.json();
      setChapters(chData.sort((a, b) => b.count - a.count));

      // CTS tariff + VAT
      const [ctsCountries, vatRes] = await Promise.all([
        getCTSCountries(),
        fetch("https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/world_vat_rates.json"),
      ]);
      const vatData = await vatRes.json();

      const summaries: TariffCountry[] = [];
      for (const country of ctsCountries.slice(0, 30)) {
        try {
          const { avgRate, count } = await getCTSCountryAvg(country);
          if (avgRate <= 0) continue;
          const vatEntry = vatData.find((v: any) =>
            v.Country?.toLowerCase() === country.toLowerCase()
          );
          const vatRate = vatEntry ? parseFloat(vatEntry["Standard Rate (%)"] || "0") : 0;
          summaries.push({ country, avg_tariff: avgRate, hs_count: count, avg_vat: vatRate });
        } catch {}
      }
      setTariffCountries(summaries.sort((a, b) => a.avg_tariff - b.avg_tariff));
    } catch (e: any) {
      setError(e.message || "Erro ao carregar dados");
    }
    setLoading(false);
  }, [fetchMacro]);

  const handleAnalyze = async () => {
    if (!canAccess) return;
    const consumed = await consume("ranking_run");
    if (!consumed) {
      setError("Créditos insuficientes. Faça upgrade para continuar.");
      return;
    }
    await fetchData();
    // After data loaded, also fetch trade data for top chapters
    if (chapters.length > 0) {
      chapters.slice(0, 10).forEach(ch => fetchTradeForChapter(ch.hs_chapter));
    }
  };

  /* ── Opportunities ── */
  const opportunities: Opportunity[] = useMemo(() => {
    if (!chapters.length || !tariffCountries.length) return [];

    const results: Opportunity[] = [];
    const topChapters = chapters.slice(0, 10);
    const lowTariffMarkets = tariffCountries.filter(t => t.avg_tariff > 0 && t.avg_tariff <= 8);

    for (const ch of topChapters) {
      let bestMarket = tariffCountries[0];
      let bestScore = -1;

      const chapterTrade = chapterTradeData[ch.hs_chapter] || [];
      // Total trade volume for this chapter
      const totalTrade = chapterTrade.reduce((sum, t) => sum + t.value, 0);

      for (const market of lowTariffMarkets) {
        const normalizedMarket = normalizeCountry(market.country);
        // Check if this country is actually a trade partner
        const tradePartner = chapterTrade.find(t =>
          t.country.toLowerCase() === normalizedMarket.toLowerCase() ||
          t.country.toLowerCase() === market.country.toLowerCase()
        );
        const tradeVolume = tradePartner?.value || 0;
        const tradeBoost = tradeVolume > 0 ? Math.min(tradeVolume / 1_000_000, 5) : 0;

        const freight = CONTAINER_FREIGHT[market.country] || 2000;
        const freightPct = (freight / 10000) * 100;
        const totalCost = market.avg_tariff + market.avg_vat + freightPct;
        const volumeScore = Math.min(ch.count / 10000, 10);
        const costScore = Math.max(0, 30 - totalCost);
        const score = volumeScore * 2 + costScore + tradeBoost;

        if (score > bestScore) {
          bestScore = score;
          bestMarket = market;
        }
      }

      const freight = CONTAINER_FREIGHT[bestMarket.country] || 2000;
      const freightPct = (freight / 10000) * 100;

      // Find trade data for best market
      const bestTrade = chapterTrade.find(t =>
        t.country.toLowerCase() === normalizeCountry(bestMarket.country).toLowerCase() ||
        t.country.toLowerCase() === bestMarket.country.toLowerCase()
      );

      results.push({
        id: `${ch.hs_chapter}-${bestMarket.country}`,
        chapter: ch.hs_chapter,
        description: ch.description,
        importerVolume: ch.count,
        bestMarket: bestMarket.country,
        bestMarketTariff: bestMarket.avg_tariff,
        bestMarketVat: bestMarket.avg_vat,
        bestMarketFlag: FLAG_MAP[bestMarket.country] || "🌐",
        opportunityScore: Math.round(bestScore),
        reason: `Tarifa média ${bestMarket.avg_tariff.toFixed(1)}% + VAT ${bestMarket.avg_vat.toFixed(1)}% + Frete ~$${freight.toLocaleString()}. Volume: ${ch.count.toLocaleString()} importadores.`,
        tradeVolume: bestTrade?.value,
        tradeShare: bestTrade?.sharePct,
        brazilExportTotal: totalTrade > 0 ? totalTrade : undefined,
      });
    }

    return results.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }, [chapters, tariffCountries, chapterTradeData]);

  const filteredOpps = selectedChapter
    ? opportunities.filter(o => o.chapter === selectedChapter)
    : opportunities;

  /* ── Score badge ── */
  const ScoreBadge = ({ score }: { score: number }) => {
    let color = "bg-green-100 text-green-700";
    let label = "Boa";
    if (score >= 25) { color = "bg-emerald-100 text-emerald-700"; label = "Excelente"; }
    if (score >= 35) { color = "bg-[#D80E16]/10 text-[#D80E16]"; label = "Oportunidade"; }
    if (score < 15) { color = "bg-slate-100 text-slate-600"; label = "Moderada"; }
    return (
      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${color}`}>
        {label} · {score}pts
      </span>
    );
  };

  return (
    <ProtectedFeature featureKey="opportunity_radar">
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Radar className="w-6 h-6 text-[#D80E16]" />
          Radar de Oportunidades
        </h1>
        <p className="text-sm text-slate-600">
          Cruza volume de importadores com tarifas baixas e dados de comércio exterior para identificar os melhores mercados para exportar.
        </p>
      </div>

      {/* Macro Indicators Bar (appears after analysis) */}
      {(macro.exchangeRate !== null || macro.brazil) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-slate-500">USD/BRL</span>
              <Activity className="w-3 h-3 text-slate-400" />
            </div>
            <span className={cn("text-sm font-bold", macro.exchangeRate && macro.exchangeRate > 5.5 ? "text-red-600" : "text-emerald-600")}>
              R$ {macro.exchangeRate?.toFixed(3) || "—"}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">PTAX</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-slate-500">PIB</span>
              <TrendingUp className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-sm font-bold text-slate-800">{macro.brazil?.gdp ? formatCurrency(macro.brazil.gdp) : "—"}</span>
            <span className="text-[10px] text-slate-400 ml-1">{macro.brazil?.gdp_growth?.toFixed(1) || "—"}%</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-slate-500">Exportações</span>
              <BarChart3 className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-sm font-bold text-emerald-600">{macro.brazil?.exports ? formatCurrency(macro.brazil.exports) : "—"}</span>
            <span className="text-[10px] text-slate-400 ml-1">Brasil total</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium text-slate-500">Balança</span>
              <DollarSign className="w-3 h-3 text-slate-400" />
            </div>
            <span className={cn("text-sm font-bold",
              macro.brazil?.exports && macro.brazil?.imports && (macro.brazil.exports - macro.brazil.imports) > 0
                ? "text-emerald-600" : "text-red-600"
            )}>
              {macro.brazil?.exports && macro.brazil?.imports
                ? formatCurrency(macro.brazil.exports - macro.brazil.imports)
                : "—"}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">
              {macro.brazil?.exports && macro.brazil?.imports && (macro.brazil.exports - macro.brazil.imports) > 0 ? "superávit" : "déficit"}
            </span>
          </div>
        </motion.div>
      )}

      {/* CTA */}
      {!opportunities.length && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D80E16]/10 flex items-center justify-center mx-auto">
            <Target className="w-8 h-8 text-[#D80E16]" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Descubra onde exportar</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Analisamos 3.8M+ importadores, alíquotas de 18+ países e dados reais de exportação do Brasil para cada categoria de produto.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-[#D80E16] text-white font-bold text-sm hover:bg-[#b80c12] disabled:opacity-50 transition-all inline-flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analisar Oportunidades (3 créditos)</>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D80E16] mx-auto" />
            <p className="text-sm text-slate-600">Analisando importadores e tarifas...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {opportunities.length > 0 && !loading && (
        <>
          {/* Filters - Chapters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedChapter("")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                !selectedChapter ? "bg-[#D80E16] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Todas ({opportunities.length})
            </button>
            {chapters.slice(0, 8).map(ch => (
              <button
                key={ch.hs_chapter}
                onClick={() => setSelectedChapter(ch.hs_chapter)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                  selectedChapter === ch.hs_chapter ? "bg-[#D80E16] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                HS {ch.hs_chapter}
              </button>
            ))}
          </div>

          {/* Trade data chart for selected chapter */}
          {selectedChapter && chapterTradeData[selectedChapter] && chapterTradeData[selectedChapter].length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Exportações Brasileiras — HS {selectedChapter}
                </h3>
                <Badge variant="secondary" className="text-[10px]">Exportações</Badge>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chapterTradeData[selectedChapter].slice(0, 8)} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v: number) => formatNumber(v)} />
                  <YAxis dataKey="country" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={100} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(v: number) => [formatCurrency(v), "Exportado"]}
                  />
                  <Bar dataKey="value" fill="#D80E16" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Opportunities grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOpps.map((opp) => (
              <div
                key={opp.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900">HS {opp.chapter}</span>
                      <ScoreBadge score={opp.opportunityScore} />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{opp.description}</p>
                  </div>
                  <div className="text-2xl">{opp.bestMarketFlag}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 text-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">Importadores</p>
                    <p className="text-sm font-black text-slate-900">{opp.importerVolume.toLocaleString()}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-green-50 text-center">
                    <p className="text-[10px] font-bold text-green-700 uppercase">Tarifa</p>
                    <p className="text-sm font-black text-green-800">{opp.bestMarketTariff.toFixed(1)}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 text-center">
                    <p className="text-[10px] font-bold text-blue-700 uppercase">VAT</p>
                    <p className="text-sm font-black text-blue-800">{opp.bestMarketVat.toFixed(1)}%</p>
                  </div>
                  <div className={cn(
                    "p-2.5 rounded-xl text-center",
                    opp.tradeVolume ? "bg-amber-50" : "bg-slate-50"
                  )}>
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Exportado</p>
                    <p className="text-sm font-black text-slate-900">
                      {opp.tradeVolume ? formatCurrency(opp.tradeVolume) : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-[#D80E16]" />
                  <span className="font-bold">Melhor mercado:</span> {opp.bestMarket}
                  {opp.tradeShare && (
                    <span className="ml-auto text-[10px] text-slate-400">
                      {opp.tradeShare.toFixed(1)}% do total exportado
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">{opp.reason}</p>

                <button
                  onClick={() => window.open(`/export-simulator?hs=${opp.chapter}&destination=${opp.bestMarket}`, "_self")}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  Simular Exportação <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Re-analyze */}
          <div className="text-center pt-4">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-xs font-bold hover:border-slate-400 transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Nova Análise (3 créditos)
            </button>
          </div>
        </>
      )}
    </div>
    </ProtectedFeature>
  );
}
