import { useState, useMemo } from "react";
import {
  Trophy, Globe, TrendingUp, DollarSign, Ship, Loader2,
  AlertTriangle, Search, ArrowRight, Package, Percent, BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { groqChat } from "@/services/groq";
import { lookupCTSTariff } from "@/services/ctsTariffs";
import { useSeo } from "@/hooks/use-seo";

import { ProtectedFeature } from "@/components/ProtectedFeature";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useUsage } from "@/hooks/use-usage";
import { calculateCost } from "@/lib/usage-costs";

/* ── Hardcoded VAT for countries not in the JSON ── */
const HARDCODED_VAT: Record<string, number> = {
  "Germany": 19,
  "France": 20,
  "Italy": 22,
  "Spain": 21,
  "Netherlands": 21,
  "Paraguay": 10,
};

/* ── Constants ── */
interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  vatName: string;
  ctsName: string; // name in CTS data (e.g. "South Korea", "European Union")
  freightFactor: number;
  riskScore: number;
}

const DESTINATIONS: CountryConfig[] = [
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", vatName: "United States of America", ctsName: "United States of America", freightFactor: 0.08, riskScore: 3 },
  { code: "CHN", name: "China", flag: "🇨🇳", vatName: "China", ctsName: "China", freightFactor: 0.12, riskScore: 5 },
  { code: "GBR", name: "Reino Unido", flag: "🇬🇧", vatName: "United Kingdom", ctsName: "United Kingdom", freightFactor: 0.10, riskScore: 3 },
  { code: "DEU", name: "Alemanha", flag: "🇩🇪", vatName: "Germany", ctsName: "European Union", freightFactor: 0.10, riskScore: 2 },
  { code: "FRA", name: "França", flag: "🇫🇷", vatName: "France", ctsName: "European Union", freightFactor: 0.10, riskScore: 2 },
  { code: "ITA", name: "Itália", flag: "🇮🇹", vatName: "Italy", ctsName: "European Union", freightFactor: 0.10, riskScore: 3 },
  { code: "ESP", name: "Espanha", flag: "🇪🇸", vatName: "Spain", ctsName: "European Union", freightFactor: 0.10, riskScore: 3 },
  { code: "NLD", name: "Holanda", flag: "🇳🇱", vatName: "Netherlands", ctsName: "European Union", freightFactor: 0.10, riskScore: 2 },
  { code: "JPN", name: "Japão", flag: "🇯🇵", vatName: "Japan", ctsName: "Japan", freightFactor: 0.11, riskScore: 3 },
  { code: "KOR", name: "Coreia do Sul", flag: "🇰🇷", vatName: "South Korea", ctsName: "South Korea", freightFactor: 0.11, riskScore: 4 },
  { code: "ARG", name: "Argentina", flag: "🇦🇷", vatName: "Argentina", ctsName: "Argentina", freightFactor: 0.06, riskScore: 7 },
  { code: "CHL", name: "Chile", flag: "🇨🇱", vatName: "Chile", ctsName: "Chile", freightFactor: 0.06, riskScore: 4 },
  { code: "COL", name: "Colômbia", flag: "🇨🇴", vatName: "Colombia", ctsName: "Colombia", freightFactor: 0.06, riskScore: 5 },
  { code: "MEX", name: "México", flag: "🇲🇽", vatName: "Mexico", ctsName: "Mexico", freightFactor: 0.07, riskScore: 5 },
  { code: "PER", name: "Peru", flag: "🇵🇪", vatName: "Peru", ctsName: "Peru", freightFactor: 0.07, riskScore: 5 },
  { code: "URY", name: "Uruguai", flag: "🇺🇾", vatName: "Uruguay", ctsName: "Uruguay", freightFactor: 0.06, riskScore: 4 },
  { code: "PRY", name: "Paraguai", flag: "🇵🇾", vatName: "Paraguay", ctsName: "Paraguay", freightFactor: 0.06, riskScore: 6 },
  { code: "TUR", name: "Turquia", flag: "🇹🇷", vatName: "Türkiye", ctsName: "Türkiye", freightFactor: 0.10, riskScore: 6 },
];

interface RankResult {
  country: CountryConfig;
  hsCode: string;
  hsDesc: string;
  tariffRate: number;
  hasTariffData: boolean;
  vatRate: number;
  freightCost: number;
  insuranceCost: number;
  cifValue: number;
  tariffAmount: number;
  vatAmount: number;
  totalCost: number;
  totalMarkup: number;
  smartScore: number; // 0-100
}

/* ── Helper: safe VAT parse ── */
function parseVatRate(raw: string | number | undefined): number {
  if (raw === undefined || raw === null) return 0;
  if (typeof raw === "number") return raw;
  if (raw === "N/A" || raw === "n/a" || raw === "") return 0;
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

/* ── Component ── */
export default function SmartRank() {
  useSeo({
    title: "Smart Rank — Ranking de Oportunidades de Exportação",
    description: "Ranking inteligente de países e produtos para exportação. Descubra as melhores oportunidades de mercado com análise de demanda e concorrência.",
    keywords: "ranking exportação, oportunidades exportação, smart rank, tradexa",
  });

  const [productQuery, setProductQuery] = useState("");
  const [fobValue, setFobValue] = useState("10000");
  const [hsCode, setHsCode] = useState("");
  const [hsDesc, setHsDesc] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState("");
  const [ranking, setRanking] = useState<RankResult[] | null>(null);
  const [loadingRank, setLoadingRank] = useState(false);
  const [rankError, setRankError] = useState("");

  const { consume, plan } = useUsage();
  const { canAccess, lockedByPlan, upgradePlan } = useFeatureAccess("smart_rank");

  const fob = parseFloat(fobValue) || 0;

  const handleClassify = async () => {
    if (!productQuery.trim()) return;
    setClassifying(true);
    setClassifyError("");
    try {
      const response = await groqChat([
        { role: "system", content: "Classificador HS. Retorne APENAS JSON: {\"hs\":\"XXXX.XX\",\"desc\":\"breve descrição\",\"confidence\":0.XX}" },
        { role: "user", content: `Classifique o produto: "${productQuery}". Retorne HS de 6 dígitos.` },
      ], { temperature: 0.1, max_tokens: 150 });
      const clean = response.replace(/```json|```/g, "").trim();
      const guess = JSON.parse(clean);
      setHsCode(guess.hs || "");
      setHsDesc(guess.desc || "");
      if (guess.confidence && guess.confidence < 0.5) {
        setClassifyError("Classificação com baixa confiança. Verifique o código HS.");
      }
    } catch {
      setClassifyError("Erro ao classificar produto. Tente novamente.");
    }
    setClassifying(false);
  };

  const handleRank = async () => {
    if (!hsCode || !fobValue) return;

    // Consume credits
    if (canAccess) {
      const cost = 2;
      const consumed = await consume("ranking_run");
      if (!consumed) {
        setRankError("Créditos insuficientes para gerar o ranking.");
        return;
      }
    }

    setLoadingRank(true);
    setRankError("");

    // Fetch VAT data once
    let vatData: any[] = [];
    try {
      const res = await fetch(
        "https://ocivkbocmywinwqmaqac.supabase.co/storage/v1/object/public/trade-data/world_vat_rates.json"
      );
      vatData = await res.json();
    } catch {}

    const hsPrefix = hsCode.replace(".", "").substring(0, 4);

    // Fetch tariffs from CTS data (local dataset, no network calls needed after initial load)
    const tariffPromiseCache: Record<string, Promise<{ rate: number; hasData: boolean }>> = {};
    const fetchTariff = (ctsName: string): Promise<{ rate: number; hasData: boolean }> => {
      if (!tariffPromiseCache[ctsName]) {
        tariffPromiseCache[ctsName] = lookupCTSTariff(ctsName, hsPrefix);
      }
      return tariffPromiseCache[ctsName];
    };

    // Fetch all tariffs in parallel with dedup
    const tariffPromises = DESTINATIONS.map(async (dest) => {
      const { rate, hasData } = await fetchTariff(dest.ctsName);
      return { dest, tariffRate: rate, hasTariffData: hasData };
    });

    const tariffResults = await Promise.all(tariffPromises);

    // Build results
    const results: RankResult[] = tariffResults.map(({ dest, tariffRate, hasTariffData }) => {
      let tr = tariffRate;

      // USA universal 10% tariff (2025) — applies on top of WTO rate
      if (dest.code === "USA") {
        tr += 10;
      }

      const freight = fob * dest.freightFactor;
      const insurance = fob * 0.0015;
      const cif = fob + freight + insurance;
      const tariffAmount = cif * (tr / 100);

      // VAT lookup
      let vatRate = 0;
      let hasVatData = false;
      const vatLookupKey = dest.code === "USA" ? "USA" : dest.vatName;
      const vatEntry = vatData.find((v: any) =>
        v.Country?.toLowerCase() === vatLookupKey.toLowerCase()
      );

      if (vatEntry) {
        vatRate = parseVatRate(vatEntry["Standard Rate (%)"]);
        hasVatData = true;
      }

      // Fallback: hardcoded VAT for countries not in the JSON
      if (vatRate === 0 && HARDCODED_VAT[dest.vatName]) {
        vatRate = HARDCODED_VAT[dest.vatName];
        hasVatData = true;
      }

      const vatAmount = (cif + tariffAmount) * (vatRate / 100);
      const totalCost = cif + tariffAmount + vatAmount;
      const totalMarkup = ((totalCost - fob) / fob) * 100;

      // Smart Score: lower total markup = higher score, adjusted by risk
      let score = Math.max(0, 100 - totalMarkup);
      score -= dest.riskScore * 2;
      if (hasTariffData && tr > 0) score += 5;
      if (!hasTariffData) score -= 10; // penalty for unknown tariff
      score = Math.max(0, Math.min(100, Math.round(score)));

      return {
        country: dest,
        hsCode,
        hsDesc,
        tariffRate: tr,
        hasTariffData,
        vatRate,
        freightCost: freight,
        insuranceCost: insurance,
        cifValue: cif,
        tariffAmount,
        vatAmount,
        totalCost,
        totalMarkup,
        smartScore: score,
      };
    });

    // Filter out countries with no tariff AND no VAT data at all
    const filtered = results.filter(r => r.tariffRate > 0 || r.vatRate > 0);

    // Sort by smart score descending, then by total cost ascending
    filtered.sort((a, b) => {
      if (b.smartScore !== a.smartScore) return b.smartScore - a.smartScore;
      return a.totalCost - b.totalCost;
    });

    setRanking(filtered);
    setLoadingRank(false);
  };

  const top3 = ranking?.slice(0, 3) || [];
  const others = ranking?.slice(3) || [];

  return (
    <ProtectedFeature featureKey="smart_rank">
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D80E16]/10 text-[#D80E16] text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          Tradexa Smart Rank
        </div>
        <h1 className="text-2xl font-black text-slate-800">
          Qual o melhor mercado para seu produto?
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Comparamos alíquotas de importação, VAT e frete estimado nos principais destinos. Rankeados por menor custo total e risco comercial.
        </p>
      </div>

      {/* Input section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex gap-3">
          <input
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleClassify()}
            placeholder='Ex: "café verde", "autopeças", "couro"...'
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium
                       focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]"
          />
          <button
            onClick={handleClassify}
            disabled={classifying || !productQuery.trim()}
            className="px-5 py-3 rounded-xl bg-[#D80E16] text-white font-bold text-sm
                       hover:bg-[#b80c12] disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {classifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Classificar HS
          </button>
        </div>

        {classifyError && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4" /> {classifyError}
          </div>
        )}

        {hsCode && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
            <Package className="w-4 h-4 text-green-600" />
            <span className="text-sm font-bold text-green-800">HS {hsCode}</span>
            <span className="text-xs text-green-700">{hsDesc}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Valor FOB (USD)</label>
            <input
              type="number"
              value={fobValue}
              onChange={(e) => setFobValue(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold
                         focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleRank}
              disabled={loadingRank || !hsCode || !fobValue}
              className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold text-sm
                         hover:bg-slate-900 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loadingRank ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analisando mercados...</>
              ) : (
                <><BarChart3 className="w-4 h-4" /> Gerar Ranking</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {ranking && (
        <div className="space-y-4">
          {/* Top 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3.map((r, i) => (
              <div
                key={r.country.code}
                className={cn(
                  "rounded-2xl border p-5 space-y-3",
                  i === 0
                    ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
                    : i === 1
                    ? "border-slate-300 bg-gradient-to-br from-slate-50 to-white"
                    : "border-orange-200 bg-gradient-to-br from-orange-50/50 to-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{r.country.flag}</span>
                    <div>
                      <p className="text-sm font-black text-slate-800">{r.country.name}</p>
                      <p className="text-[10px] text-slate-600 font-bold">#{i + 1} Melhor Destino</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-black",
                    r.smartScore >= 80 ? "bg-green-500 text-white" :
                    r.smartScore >= 60 ? "bg-amber-500 text-white" :
                    "bg-red-500 text-white"
                  )}>
                    {r.smartScore}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Alíquota</span>
                    <span className="font-bold text-slate-800">{r.hasTariffData ? `${r.tariffRate.toFixed(1)}%` : "N/D"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">VAT/IVA</span>
                    <span className="font-bold text-slate-800">{r.vatRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Frete estimado</span>
                    <span className="font-bold text-slate-800">USD {r.freightCost.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1.5 border-t border-slate-200">
                    <span className="text-slate-600 font-bold">Custo Total</span>
                    <span className="font-black text-slate-800">USD {r.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-bold">Markup sobre FOB</span>
                    <span className={cn(
                      "font-black",
                      r.totalMarkup > 30 ? "text-red-600" : r.totalMarkup > 15 ? "text-amber-600" : "text-green-600"
                    )}>
                      +{r.totalMarkup.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {i === 0 && (
                  <div className="p-2 rounded-lg bg-amber-100/50 border border-amber-200 text-center">
                    <p className="text-[10px] font-bold text-amber-800">MELHOR OPÇÃO</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Full table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-black text-slate-800">Ranking Completo</h3>
              <span className="ml-auto text-xs text-slate-600">{ranking.length} mercados analisados</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">#</th>
                    <th className="px-4 py-2.5 text-left font-bold text-slate-600">País</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600">Tarifa</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600">VAT</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600">Frete</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600">Custo Total</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600">Markup</th>
                    <th className="px-4 py-2.5 text-right font-bold text-slate-600">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((r, i) => (
                    <tr key={r.country.code} className={cn(
                      "border-t border-slate-100",
                      i < 3 && "bg-green-50/30"
                    )}>
                      <td className="px-4 py-2.5 font-black text-slate-800">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <span className="mr-1">{r.country.flag}</span>
                        <span className="font-bold text-slate-700">{r.country.name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-700">{r.hasTariffData ? `${r.tariffRate.toFixed(1)}%` : "N/D"}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-700">{r.vatRate}%</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-700">
                        {r.freightCost.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="px-4 py-2.5 text-right font-black text-slate-900">
                        {r.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={cn(
                        "px-4 py-2.5 text-right font-bold",
                        r.totalMarkup > 30 ? "text-red-600" : r.totalMarkup > 15 ? "text-amber-600" : "text-green-600"
                      )}>
                        +{r.totalMarkup.toFixed(1)}%
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          r.smartScore >= 80 ? "bg-green-100 text-green-700" :
                          r.smartScore >= 60 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {r.smartScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedFeature>
  );
}
