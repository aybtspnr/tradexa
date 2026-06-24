import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Radar, Globe, TrendingDown, Building2, ArrowRight, Loader2,
  Sparkles, Anchor, DollarSign, AlertTriangle, MapPin, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedFeature } from "@/components/ProtectedFeature";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useUsage } from "@/hooks/use-usage";
import { calculateCost } from "@/lib/usage-costs";
import { getCTSCountries, getCTSCountryAvg } from "@/services/ctsTariffs";

interface ChapterData {
  hs_chapter: string;
  description: string;
  count: number;
}

interface TariffCountry {
  country: string;
  avg_tariff: number;
  hs_count: number;
  avg_vat: number;
}

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
}

/* ── Constants ── */
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
  // CTS country names that differ from VPS
  ["South Korea", "🇰🇷"], ["European Union", "🇪🇺"],
]);

const CONTAINER_FREIGHT: Record<string, number> = Object.fromEntries([
  ["Argentina", 1200], ["Chile", 1400], ["Colombia", 1300], ["Mexico", 1800],
  ["Peru", 1500], ["Uruguay", 1100], ["Paraguay", 900], ["USA", 2500],
  ["China", 2000], ["Japan", 2800], ["Korea, Republic of", 2600],
  ["United Kingdom", 2200], ["Germany", 2400], ["France", 2400], ["Spain", 2100],
  ["Italy", 2300], ["Netherlands", 2300],
  // CTS names
  ["South Korea", 2600],
]);

export default function OpportunityRadar() {
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [tariffCountries, setTariffCountries] = useState<TariffCountry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");

  const { consume, plan } = useUsage();
  const { canAccess } = useFeatureAccess("opportunity_radar");

  /* ── Fetch data ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Importer chapters (from VPS — unrelated to tariffs)
      const chRes = await fetch("/api/vps/importadores/index");
      if (!chRes.ok) throw new Error("Falha ao carregar importadores");
      const chData: ChapterData[] = await chRes.json();
      setChapters(chData.sort((a, b) => b.count - a.count));

      // CTS tariff data + VAT
      const [ctsCountries, vatRes] = await Promise.all([
        getCTSCountries(),
        fetch("https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/world_vat_rates.json"),
      ]);
      const vatData = await vatRes.json();

      // Build tariff + VAT summary for each CTS country
      const summaries: TariffCountry[] = [];
      for (const country of ctsCountries.slice(0, 30)) {
        try {
          const { avgRate, count } = await getCTSCountryAvg(country);
          if (avgRate <= 0) continue; // skip countries with no data

          const vatEntry = vatData.find((v: any) =>
            v.Country?.toLowerCase() === country.toLowerCase()
          );
          const vatRate = vatEntry ? parseFloat(vatEntry["Standard Rate (%)"] || "0") : 0;

          summaries.push({
            country,
            avg_tariff: avgRate,
            hs_count: count,
            avg_vat: vatRate,
          });
        } catch {}
      }
      setTariffCountries(summaries.sort((a, b) => a.avg_tariff - b.avg_tariff));
    } catch (e: any) {
      setError(e.message || "Erro ao carregar dados");
    }
    setLoading(false);
  }, []);

  const handleAnalyze = async () => {
    if (!canAccess) return;
    const consumed = await consume("ranking_run");
    if (!consumed) {
      setError("Créditos insuficientes. Faça upgrade para continuar.");
      return;
    }
    await fetchData();
  };

  /* ── Opportunities ── */
  const opportunities: Opportunity[] = useMemo(() => {
    if (!chapters.length || !tariffCountries.length) return [];

    const results: Opportunity[] = [];
    const topChapters = chapters.slice(0, 10);
    const lowTariffMarkets = tariffCountries.filter(t => t.avg_tariff > 0 && t.avg_tariff <= 8);

    for (const ch of topChapters) {
      // Find best market for this category
      let bestMarket = tariffCountries[0];
      let bestScore = -1;

      for (const market of lowTariffMarkets) {
        const freight = CONTAINER_FREIGHT[market.country] || 2000;
        const freightPct = (freight / 10000) * 100;
        const totalCost = market.avg_tariff + market.avg_vat + freightPct;
        const volumeScore = Math.min(ch.count / 10000, 10); // 0-10
        const costScore = Math.max(0, 30 - totalCost); // lower cost = higher score
        const score = volumeScore * 2 + costScore;

        if (score > bestScore) {
          bestScore = score;
          bestMarket = market;
        }
      }

      const freight = CONTAINER_FREIGHT[bestMarket.country] || 2000;
      const freightPct = (freight / 10000) * 100;

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
      });
    }

    return results.sort((a, b) => b.opportunityScore - a.opportunityScore);
  }, [chapters, tariffCountries]);

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
          Cruza volume de importadores com tarifas baixas para identificar os melhores mercados.
        </p>
      </div>

      {/* CTA */}
      {!opportunities.length && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D80E16]/10 flex items-center justify-center mx-auto">
            <Target className="w-8 h-8 text-[#D80E16]" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Descubra onde exportar</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Analisamos 3.8M+ importadores e alíquotas de importação de 18+ países para encontrar as melhores oportunidades para cada categoria de produto.
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
          {/* Filters */}
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

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 text-center">
                    <p className="text-[10px] font-bold text-slate-600 uppercase">Importadores</p>
                    <p className="text-lg font-black text-slate-900">{opp.importerVolume.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-50 text-center">
                    <p className="text-[10px] font-bold text-green-700 uppercase">Tarifa</p>
                    <p className="text-lg font-black text-green-800">{opp.bestMarketTariff.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 text-center">
                    <p className="text-[10px] font-bold text-blue-700 uppercase">VAT</p>
                    <p className="text-lg font-black text-blue-800">{opp.bestMarketVat.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-[#D80E16]" />
                  <span className="font-bold">Melhor mercado:</span> {opp.bestMarket}
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
