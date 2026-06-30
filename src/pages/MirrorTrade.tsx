import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { comexstat } from "@/services/comexstat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";

/* ── Country mapping: COMEXSTAT numeric code → Census code ── */
const COUNTRIES = [
  { name: "Estados Unidos", comexstatCode: "249", censusCode: "3510" },
  { name: "China", comexstatCode: "243", censusCode: "5700" },
  { name: "Argentina", comexstatCode: "160", censusCode: "3570" },
  { name: "Alemanha", comexstatCode: "105", censusCode: "4280" },
  { name: "Itália", comexstatCode: "400", censusCode: "4750" },
  { name: "França", comexstatCode: "309", censusCode: "4279" },
  { name: "Japão", comexstatCode: "411", censusCode: "5880" },
  { name: "Reino Unido", comexstatCode: "538", censusCode: "4120" },
  { name: "Bélgica", comexstatCode: "196", censusCode: "4231" },
  { name: "Canadá", comexstatCode: "226", censusCode: "1220" },
  { name: "Chile", comexstatCode: "239", censusCode: "3370" },
  { name: "México", comexstatCode: "452", censusCode: "2010" },
];

interface MirrorData {
  country: string;
  comexstatTotal: number;
  censusTotal: number;
  diff: number;
  diffPct: number;
}

const CENSUS_KEY = import.meta.env.VITE_CENSUS_API_KEY || "";
const CENSUS_BASE = "https://api.census.gov/data/timeseries/intltrade/imports/hs";

/* ── Helpers ── */
function fmtUSD(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

/* ── COMEXSTAT fetch — annual total by country ── */
async function fetchComexstatAnnual(
  countryCode: string,
  year: string
): Promise<number> {
  const body = {
    flow: "export",
    period: { from: `${year}-01`, to: `${year}-12` },
    details: ["country"],
    filters: [{ filter: "country", values: [countryCode] }],
  };

  const data = await comexstat.queryGeneral(body);
  const list = data?.data?.list || [];
  for (const r of list) {
    if (r.country || r.metricFOB) {
      return Number(r.metricFOB || 0);
    }
  }
  return 0;
}

/* ── US Census fetch — annual total by summing months ── */
async function fetchCensusAnnual(
  censusCode: string,
  year: string
): Promise<number> {
  const monthStrs = ["01","02","03","04","05","06","07","08","09","10","11","12"];
  let total = 0;

  for (const m of monthStrs) {
    const url = `${CENSUS_BASE}?get=GEN_VAL_MO&CTY_CODE=${censusCode}&YEAR=${year}&MONTH=${m}&key=${CENSUS_KEY}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 1 && data[1]?.[0]) {
        const val = Number(data[1][0]);
        if (val > 0) total += val;
      }
    } catch {
      // skip month
    }
  }
  return total;
}

export default function MirrorTrade() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [data, setData] = useState<MirrorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [year] = useState("2025");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [comexTotal, censusTotal] = await Promise.all([
        fetchComexstatAnnual(selectedCountry.comexstatCode, year),
        fetchCensusAnnual(selectedCountry.censusCode, year),
      ]);

      if (comexTotal === 0 && censusTotal === 0) {
        throw new Error("Nenhum dado disponível para o período selecionado.");
      }

      const diff = censusTotal - comexTotal;
      const diffPct = comexTotal > 0 ? (diff / comexTotal) * 100 : 0;

      setData({
        country: selectedCountry.name,
        comexstatTotal: comexTotal,
        censusTotal: censusTotal,
        diff,
        diffPct,
      });
    } catch (e: any) {
      setError(e.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [selectedCountry, year]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Mirror Trade
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Compare o valor declarado pelo Brasil na exportação com o valor
            declarado pelo país de destino na importação.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedCountry.comexstatCode}
            onValueChange={(v) => {
              const c = COUNTRIES.find((x) => x.comexstatCode === v);
              if (c) setSelectedCountry(c);
            }}
          >
            <SelectTrigger className="w-[200px] rounded-xl border-slate-200">
              <SelectValue placeholder="Selecione o país" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.comexstatCode} value={c.comexstatCode}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={load}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              O serviço possui limitação de requisições. Aguarde alguns
              segundos e tente novamente.
            </p>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-600">
                  Exportação Brasil → {data.country}
                </CardTitle>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Base Brasil — valor FOB (sem frete/seguro)
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-black text-slate-900">
                  {fmtUSD(data.comexstatTotal)}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Valor declarado pelo exportador</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-600">
                  Importação {data.country} ← Brasil
                </CardTitle>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Base {data.country} — valor CIF (com frete/seguro)
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-black text-slate-900">
                  {fmtUSD(data.censusTotal)}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                  <TrendingDown className="h-3.5 w-3.5 text-blue-600" />
                  <span>Valor declarado pelo importador</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-600">
                  Divergência
                </CardTitle>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Diferença entre as bases
                </p>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-black ${
                    data.diffPct > 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {data.diffPct > 0 ? "+" : ""}
                  {data.diffPct.toFixed(1)}%
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  {fmtUSD(Math.abs(data.diff))}
                </p>
                <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-600">
                  <Info className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    A diferença representa, em média, o frete + seguro +
                    possíveis atrasos de embarque.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Explanation */}
          <Card className="rounded-2xl border-slate-200 shadow-sm bg-slate-50">
            <CardContent className="p-5">
              <h3 className="text-sm font-black text-slate-900 mb-3">
                Por que existe divergência?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">
                    1. Diferença de método de valoração
                  </p>
                  <p>
                    O Brasil declara em <strong>FOB</strong> (Free On Board) —
                    valor do produto até o porto de embarque, sem frete nem
                    seguro. O país importador declara em{" "}
                    <strong>CIF</strong> (Cost + Insurance + Freight) — inclui
                    transporte internacional e seguro.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">
                    2. Timing de registro
                  </p>
                  <p>
                    O embarque pode ocorrer em um mês e a chegada em outro.
                    Além disso, documentos podem ser processados em meses
                    diferentes nos dois países.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">
                    3. Underinvoicing / Overinvoicing
                  </p>
                  <p>
                    Divergências muito acima de 20-25% podem indicar
                    declaração inconsistente de valor. Importadores podem declarar
                    valores maiores (CIF) para fins aduaneiros.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">
                    4. Re-exportações
                  </p>
                  <p>
                    O país importador pode registrar mercadorias que passaram
                    por armazém ou foram re-rotadas de outro país, enquanto o
                    Brasil registrou o destino original.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
