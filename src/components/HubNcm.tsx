// src/components/HubNcm.tsx
// Detalhamento completo de um NCM — dados reais do Comex Stat

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Hash, TrendingUp, TrendingDown, Globe, DollarSign,
  Package, Loader2, Ship, BarChart3, ArrowRight, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NcmDetail {
  ncm: string;
  name: string;
  hs4: string;
  hs2: string;
  fob: number;
  kg: number;
  count: number;
  frete: number;
  seguro: number;
  countries: { code: string; name: string; fob: number; kg: number; share: number }[];
  monthly: { month: string; fob: number }[];
}

const MONTH_NAMES: Record<string, string> = {
  "01":"Jan","02":"Fev","03":"Mar","04":"Abr","05":"Mai","06":"Jun",
  "07":"Jul","08":"Ago","09":"Set","10":"Out","11":"Nov","12":"Dez"
};

function fmt$(v: number): string {
  if (!v) return "$0";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtKg(v: number): string {
  if (!v) return "0 kg";
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B kg`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M kg`;
  return `${(v / 1e3).toFixed(0)}K kg`;
}

function ncmLabel(ncm: string): string {
  const ch = ncm.slice(0, 2);
  const l: Record<string, string> = {
    "01":"Animais","02":"Carnes","03":"Peixes","04":"Laticínios","07":"Hortaliças",
    "08":"Frutas","09":"Café","10":"Cereais","12":"Oleaginosas","15":"Gorduras",
    "17":"Açúcares","20":"Conservas","22":"Bebidas","23":"Resíduos","25":"Sal",
    "26":"Minérios","27":"Combustíveis","28":"Químicos","29":"Químicos org.",
    "30":"Farmoquímicos","31":"Adubos","32":"Extratos","33":"Óleos","38":"Químicos",
    "39":"Plásticos","40":"Borracha","41":"Peles","42":"Couro","44":"Madeira",
    "47":"Celulose","48":"Papel","49":"Livros","52":"Algodão","54":"Filamentos",
    "55":"Fibras","61":"Vestuário","62":"Vestuário","63":"Têxteis","64":"Calçados",
    "68":"Pedra","70":"Vidro","71":"Metais preciosos","72":"Ferro/Aço",
    "73":"Ferro/Aço","74":"Cobre","76":"Alumínio","82":"Ferramentas",
    "84":"Máquinas","85":"Eletrônicos","86":"Ferrovias","87":"Veículos",
    "88":"Aeronaves","89":"Embarcações","90":"Instrumentos","94":"Móveis",
    "95":"Brinquedos"
  };
  return l[ch] || `Cap. ${ch}`;
}

export default function HubNcm() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<NcmDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flow, setFlow] = useState<"import" | "export">("import");
  const [showAllCountries, setShowAllCountries] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setDetail(null);

    const ts = Date.now();
    fetch(`/api/comex-intelligence?_=${ts}`)
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => {
        const trade = data?.[flow];
        const allNcms = trade?.all_ncms || trade?.top_ncms || [];
        const ncmData = allNcms.find((n: any) => n.ncm === query);
        const topNcm = (trade?.top_ncms || []).find((n: any) => n.ncm === query);

        if (!ncmData && !topNcm) {
          setError(`NCM ${query} não encontrado nos dados de ${flow === "import" ? "importação" : "exportação"}`);
          setDetail(null);
          setLoading(false);
          return;
        }

        const merged = { ...ncmData, ...topNcm };

        // Build countries list
        const countries: NcmDetail["countries"] = (trade?.top_countries || []).slice(0, 20).map((c: any) => ({
          code: c.code,
          name: c.name,
          fob: c.fob || 0,
          kg: c.kg || 0,
          share: trade?.total_fob ? ((c.fob || 0) / trade.total_fob) * 100 : 0,
        }));

        setDetail({
          ncm: merged.ncm,
          name: ncmLabel(merged.ncm),
          hs4: merged.hs4 || merged.ncm?.slice(0, 4) || "",
          hs2: merged.hs2 || merged.ncm?.slice(0, 2) || "",
          fob: merged.fob || 0,
          kg: merged.kg || 0,
          count: merged.count || 0,
          frete: merged.frete || 0,
          seguro: merged.seguro || 0,
          countries,
          monthly: (trade?.monthly || []).map((m: any) => ({
            month: m.month,
            fob: m.fob || 0,
          })),
        });
        setLoading(false);
      })
      .catch(err => {
        setError("Erro ao carregar dados: " + err.message);
        setLoading(false);
      });
  }, [query, flow]);

  const maxMonthFob = Math.max(...(detail?.monthly || []).map(m => m.fob), 1);
  const maxCountryFob = Math.max(...(detail?.countries || []).map(c => c.fob), 1);

  return (
    <div className="space-y-4">
      {/* Search header */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") setQuery(search); }}
                placeholder="Digite um NCM (ex: 12019000)"
                className="h-10 pl-9 rounded-xl border-slate-200 text-sm font-mono"
              />
            </div>
            <Button onClick={() => setQuery(search)} className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold px-5">
              <Search className="w-3.5 h-3.5 mr-1" /> Buscar
            </Button>
            <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100">
              <button onClick={() => setFlow("import")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${flow === "import" ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}>
                <TrendingDown className="w-3 h-3 inline mr-1" />Importação
              </button>
              <button onClick={() => setFlow("export")}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${flow === "export" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>
                <TrendingUp className="w-3 h-3 inline mr-1" />Exportação
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-red-500" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* NCM Detail */}
      {detail && !loading && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Header */}
          <Card className="border-slate-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-500 to-amber-400" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <Hash className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 font-mono">{detail.ncm}</h2>
                    <p className="text-sm text-slate-600">{detail.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px] font-mono">HS4: {detail.hs4}</Badge>
                      <Badge variant="outline" className="text-[9px] font-mono">HS2: {detail.hs2}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["FOB Total", fmt$(detail.fob), "text-emerald-600", "bg-emerald-50 border-emerald-200", DollarSign],
              ["Peso Líquido", fmtKg(detail.kg), "text-blue-600", "bg-blue-50 border-blue-200", Package],
              ["Linhas", detail.count?.toLocaleString("pt-BR") || "—", "text-purple-600", "bg-purple-50 border-purple-200", BarChart3],
              ["Frete", detail.frete ? fmt$(detail.frete) : "—", "text-amber-600", "bg-amber-50 border-amber-200", Ship],
            ].map(([label, val, tc, bg, Icon]) => (
              <Card key={String(label)} className={`border ${bg}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${tc}`} />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">{String(label)}</p>
                    <p className={`text-sm font-black ${tc}`}>{String(val)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Evolution */}
          <Card className="border-slate-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-500 to-amber-400" />
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-red-500" />Evolução Mensal
              </h3>
              <div className="space-y-2">
                {detail.monthly.map(m => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 w-10">
                      {MONTH_NAMES[m.month] || m.month}
                    </span>
                    <div className="flex-1">
                      <div className="w-full h-5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${flow === "import" ? "bg-red-500" : "bg-emerald-500"} transition-all flex items-center justify-end pr-2`}
                          style={{ width: `${(m.fob / maxMonthFob) * 100}%` }}
                        >
                          <span className="text-[9px] font-bold text-white drop-shadow-sm">
                            {fmt$(m.fob)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {detail.monthly.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">Dados mensais não disponíveis para este NCM</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card className="border-slate-200 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-sky-500 to-blue-400" />
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-red-500" />
                {flow === "import" ? "Principais Origem" : "Principais Destinos"}
              </h3>
              <div className="space-y-1">
                {(showAllCountries ? detail.countries : detail.countries.slice(0, 10)).map((c, i) => (
                  <div key={c.code} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50">
                    <span className="text-xs font-bold text-slate-400 w-6 text-right">{i + 1}º</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 truncate">{c.name}</span>
                        <Badge className="text-[8px] bg-slate-100 text-slate-500 font-mono">{c.code}</Badge>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${flow === "import" ? "bg-orange-500" : "bg-sky-500"}`}
                          style={{ width: `${(c.fob / maxCountryFob) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-700">{fmt$(c.fob)}</p>
                      <p className="text-[10px] text-slate-500">{c.share.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
              {detail.countries.length > 10 && (
                <button
                  onClick={() => setShowAllCountries(!showAllCountries)}
                  className="w-full mt-2 text-xs font-bold text-red-500 hover:text-red-700 py-2 flex items-center justify-center gap-1"
                >
                  {showAllCountries ? <><ChevronUp className="w-3 h-3" /> Mostrar top 10</> : <><ChevronDown className="w-3 h-3" /> Ver todos os {detail.countries.length} países</>}
                </button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty state */}
      {!query && !loading && (
        <div className="text-center py-12">
          <Hash className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Busque um NCM para ver os detalhes</p>
          <p className="text-xs text-slate-400 mt-1">Ex: 12019000 (Soja), 84713000 (Computadores), 87032300 (Automóveis)</p>
        </div>
      )}
    </div>
  );
}
