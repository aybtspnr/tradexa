import { useState, useEffect, useMemo } from "react";
import {
  Calendar, TrendingUp, TrendingDown, Package, Search,
  Loader2, AlertTriangle, Sparkles, BarChart3, Clock,
  ArrowUp, ArrowDown, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { groqChat } from "@/services/groq";
import { fetchCensusSeasonality } from "@/services/marketIntelligence";
import { useUsage } from "@/hooks/use-usage";

/* ── Types ── */
interface MonthlyData {
  month: number;
  monthName: string;
  value: number;
  percentile: number; // 0-100
}

interface YearData {
  year: number;
  months: MonthlyData[];
  total: number;
}

/* ── Constants ── */
const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MONTH_ABBR = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/* ── Helpers ── */
function heatmapColor(percentile: number): { bg: string; text: string } {
  if (percentile >= 90) return { bg: "bg-red-500", text: "text-white" };
  if (percentile >= 75) return { bg: "bg-orange-400", text: "text-white" };
  if (percentile >= 60) return { bg: "bg-amber-300", text: "text-amber-900" };
  if (percentile >= 40) return { bg: "bg-yellow-200", text: "text-yellow-800" };
  if (percentile >= 25) return { bg: "bg-lime-200", text: "text-lime-800" };
  return { bg: "bg-green-100", text: "text-green-700" };
}

function seasonalityLabel(months: MonthlyData[]): string {
  const top3 = months.filter(m => m.percentile >= 75).length;
  if (top3 >= 6) return "Estável ao longo do ano";
  if (top3 >= 3) return "Concentrado em picos sazonais";
  return "Altamente sazonal";
}

/* ── Component ── */
export default function SeasonalCalendar() {
  const { consume } = useUsage();
  const [query, setQuery] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState("");
  const [loading, setLoading] = useState(false);
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [error, setError] = useState("");
  const [comparingYear, setComparingYear] = useState<number | null>(null);

  /* ── Classify product ── */
  const handleClassify = async () => {
    if (!query.trim()) return;
    const consumed = await consume("search");
    if (!consumed) return;
    setClassifying(true);
    setClassifyError("");
    try {
      const response = await groqChat([
        { role: "system", content: "Classificador HS. Retorne APENAS JSON: {\"hs\":\"XXXX\",\"desc\":\"breve descrição\"}" },
        { role: "user", content: `Classifique: "${query}". Retorne HS de 4 dígitos.` },
      ], { temperature: 0.1, max_tokens: 100 });
      const clean = response.replace(/```json|```/g, "").trim();
      const guess = JSON.parse(clean);
      const hs = guess.hs?.replace(/[.\s-]/g, "").substring(0, 4) || "";
      setHsCode(hs);
      if (hs) fetchSeasonalData(hs);
    } catch (e: any) {
      setClassifyError("Erro ao classificar. Tente digitar o código HS manualmente.");
    }
    setClassifying(false);
  };

  /* ── Fetch via Census Bureau edge function ── */
  const fetchSeasonalData = async (hs: string) => {
    setLoading(true);
    setError("");
    setYearData([]);

    const years = [2024, 2023];
    const allYears: YearData[] = [];

    for (const year of years) {
      try {
        const data = await fetchCensusSeasonality(hs, String(year));

        // Build month map from edge function response
        const monthMap: Record<string, number> = {};
        for (const m of data.monthly_data || []) {
          monthMap[m.month] = m.value_usd || 0;
        }

        // Fill all 12 months
        const months: MonthlyData[] = [];
        let total = 0;
        for (let m = 1; m <= 12; m++) {
          const monthKey = String(m).padStart(2, "0");
          const monthVal = monthMap[monthKey] || 0;
          months.push({
            month: m,
            monthName: MONTH_NAMES[m - 1],
            value: monthVal,
            percentile: 0,
          });
          total += monthVal;
        }

        // Calculate percentiles relative to max month
        if (total > 0) {
          const maxVal = Math.max(...months.map(m => m.value));
          months.forEach(m => {
            m.percentile = maxVal > 0 ? Math.round((m.value / maxVal) * 100) : 0;
          });
        }

        if (total > 0) {
          allYears.push({ year, months, total });
        }
      } catch (e: any) {
        console.warn(`Census seasonality failed for ${year}:`, e);
      }
    }

    if (allYears.length === 0) {
      setError("Nenhum dado sazonal disponível para este produto. Tente outro código HS.");
    } else {
      setYearData(allYears);
      setSelectedYear(allYears[0].year);
    }

    setLoading(false);
  };

  /* ── Current year data ── */
  const currentData = useMemo(() =>
    yearData.find(y => y.year === selectedYear) || null,
    [yearData, selectedYear],
  );

  const compareData = useMemo(() =>
    comparingYear ? yearData.find(y => y.year === comparingYear) || null : null,
    [yearData, comparingYear],
  );

  /* ── Insights ── */
  const bestMonth = useMemo(() => {
    if (!currentData) return null;
    return [...currentData.months].sort((a, b) => b.value - a.value)[0];
  }, [currentData]);

  const seasonalityType = useMemo(() => {
    if (!currentData) return "";
    return seasonalityLabel(currentData.months);
  }, [currentData]);

  const totalExports = currentData?.total || 0;

  return (
    <div className="space-y-6">
      {/* ── Search ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-[#D80E16]" />
          Analisar Sazonalidade
        </h2>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleClassify()}
            placeholder='Ex: "café", "soja", "calçados", ou código HS 0901...'
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium
                       focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]"
          />
          <button
            onClick={handleClassify}
            disabled={classifying || !query.trim()}
            className="px-5 py-3 rounded-xl bg-[#D80E16] text-white font-bold text-sm
                       hover:bg-[#b80c12] disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {classifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Analisar
          </button>
        </div>

        {classifyError && (
          <div className="mt-3 flex gap-2">
            <input
              value={hsCode}
              onChange={(e) => setHsCode(e.target.value)}
              placeholder="Ou digite o código HS (4 dígitos)..."
              className="flex-1 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-amber-400/20"
            />
            <button
              onClick={() => hsCode.length >= 4 && fetchSeasonalData(hsCode)}
              disabled={hsCode.length < 4}
              className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-sm
                         hover:bg-amber-700 disabled:opacity-50 transition-all"
            >
              Buscar
            </button>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#D80E16]" />
          <span className="ml-2 text-slate-600">Buscando dados de exportação BR→EUA...</span>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* ── Results ── */}
      {currentData && (
        <div className="space-y-4">
          {/* Year selector */}
          <div className="flex items-center gap-2">
            {yearData.map(y => (
              <button
                key={y.year}
                onClick={() => setSelectedYear(y.year)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  selectedYear === y.year
                    ? "bg-[#D80E16] text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
              >
                {y.year}
              </button>
            ))}
            {yearData.length > 1 && (
              <button
                onClick={() => setComparingYear(comparingYear ? null : yearData[1].year)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all ml-auto",
                  comparingYear
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-blue-600 hover:bg-blue-50",
                )}
              >
                {comparingYear ? `Comparando com ${comparingYear}` : "Comparar anos"}
              </button>
            )}
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-[10px] font-bold text-slate-600 uppercase">Total Exportado</p>
              <p className="text-lg font-black text-slate-800 mt-1">
                {totalExports >= 1_000_000_000
                  ? `$${(totalExports / 1_000_000_000).toFixed(1)}B`
                  : totalExports >= 1_000_000
                    ? `$${(totalExports / 1_000_000).toFixed(1)}M`
                    : `$${totalExports.toLocaleString("pt-BR")}`}
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-[10px] font-bold text-slate-600 uppercase">Melhor Mês</p>
              <p className="text-lg font-black text-slate-800 mt-1">
                {bestMonth?.monthName || "—"}
              </p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-4">
              <p className="text-[10px] font-bold text-slate-600 uppercase">Padrão</p>
              <p className="text-lg font-black text-slate-800 mt-1 text-sm">
                {seasonalityType}
              </p>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#D80E16]" />
              Calendário de Exportações BR→EUA — {selectedYear}
            </h3>

            <div className="grid grid-cols-12 gap-2">
              {currentData.months.map((m) => {
                const color = heatmapColor(m.percentile);
                return (
                  <div
                    key={m.month}
                    className={cn(
                      "rounded-xl p-3 text-center transition-all hover:scale-105 cursor-default",
                      color.bg,
                      compareData && "relative",
                    )}
                  >
                    <p className={cn("text-[10px] font-bold uppercase", color.text)}>
                      {MONTH_ABBR[m.month - 1]}
                    </p>
                    <p className={cn("text-lg font-black mt-1", color.text)}>
                      {m.percentile}%
                    </p>
                    {compareData && (
                      <div className="mt-1">
                        {(() => {
                          const cmp = compareData.months.find(cm => cm.month === m.month);
                          if (!cmp || cmp.value === m.value) return null;
                          const diff = ((m.value - cmp.value) / cmp.value * 100);
                          if (Math.abs(diff) < 1) return null;
                          return (
                            <span className={cn(
                              "text-[9px] font-bold",
                              diff > 0 ? "text-green-600" : "text-red-600",
                            )}>
                              {diff > 0 ? "+" : ""}{diff.toFixed(0)}%
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
              <span className="text-[9px] text-slate-600 font-bold">BAIXA</span>
              <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-green-100 via-yellow-200 via-orange-400 to-red-500" />
              <span className="text-[9px] text-slate-600 font-bold">ALTA</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D80E16]" />
              Recomendações Sazonais
            </h3>

            <div className="space-y-3">
              {bestMonth && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                  <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      Melhor período: {bestMonth.monthName}
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Concentre seus esforços de venda e marketing neste mês para maximizar resultados.
                    </p>
                  </div>
                </div>
              )}

              {currentData.months.filter(m => m.percentile >= 75).length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <Calendar className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">
                      Planejamento logístico
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Reserve contêineres e frete com 4-6 semanas de antecedência para os meses de pico:{" "}
                      {currentData.months.filter(m => m.percentile >= 75).slice(0, 3).map(m => m.monthName).join(", ")}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && !currentData && !classifying && (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 mx-auto text-slate-200 mb-4" />
          <p className="text-slate-600 font-medium">
            Busque um produto ou código HS para ver a sazonalidade
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Dados de exportação Brasil → EUA — Fontes oficiais
          </p>
        </div>
      )}
    </div>
  );
}
