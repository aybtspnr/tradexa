"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Globe, Search, Loader2, AlertTriangle, TrendingUp, TrendingDown,
  ArrowUpDown, ChevronDown, ChevronUp, DollarSign, Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import { comexstat } from "@/services/comexstat";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

/* ═══════════════════ TYPES ═══════════════════ */

interface CountryInfo {
  code: string;
  name: string;
}

interface CountryRanking {
  rank: number;
  code: string;
  name: string;
  importFob: number;
  exportFob: number;
  totalFob: number;
  sharePct: number;
  importKg: number;
  exportKg: number;
  totalKg: number;
}

interface ChartData {
  name: string;
  totalFob: number;
  importFob: number;
  exportFob: number;
}

/* ═══════════════════ HELPERS ═══════════════════ */

function formatFOB(n: number): string {
  if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `US$ ${(n / 1_000).toFixed(2)}K`;
  return `US$ ${n.toFixed(2)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toLocaleString("pt-BR");
}

function formatPct(n: number): string {
  return n.toFixed(1) + "%";
}

const CHART_COLORS = [
  "#c9a84c", "#d4b85e", "#dfc770", "#ead682", "#f4e594",
  "#b8943a", "#a88030", "#986c26", "#88581c", "#784412",
];

const AVAILABLE_YEARS = Array.from({ length: 12 }, (_, i) => String(2015 + i));

type SortField = "rank" | "name" | "import" | "export" | "total" | "share";
type FlowFilter = "all" | "import" | "export";

/* ═══════════════════ COMPONENT ═══════════════════ */

export default function HubRankings() {
  useSeo({
    title: "Rankings — Comércio Exterior TRADEXA",
    description: "Ranking de países por volume de comércio exterior: importação e exportação, com gráficos e tabela ordenável.",
    keywords: "ranking, países, comércio exterior, importação, exportação, volume, tradexa",
  });

  const [year, setYear] = useState("2025");
  const [flowFilter, setFlowFilter] = useState<FlowFilter>("all");
  const [sortField, setSortField] = useState<SortField>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [rankings, setRankings] = useState<CountryRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // ── Fetch trade data for selected year ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrors([]);

    const yearFrom = `${year}-01`;
    const yearTo = `${year}-12`;

    Promise.all([
      comexstat.queryGeneral({
        flow: "import",
        monthDetail: false,
        period: { from: yearFrom, to: yearTo },
      }).catch(() => null),
      comexstat.queryGeneral({
        flow: "export",
        monthDetail: false,
        period: { from: yearFrom, to: yearTo },
      }).catch(() => null),
    ]).then(([impData, expData]) => {
      if (cancelled) return;

      const errs: string[] = [];
      if (!impData) errs.push("Importação");
      if (!expData) errs.push("Exportação");

      // Build maps: country code -> { fob, kg }
      const importMap = new Map<string, { fob: number; kg: number }>();
      const exportMap = new Map<string, { fob: number; kg: number }>();

      const aggregate = (data: any, map: Map<string, { fob: number; kg: number }>) => {
        (data?.data?.list || []).forEach((r: any) => {
          if (!r.country) return;
          const prev = map.get(r.country) || { fob: 0, kg: 0 };
          prev.fob += Number(r.metricFOB) || 0;
          prev.kg += Number(r.metricKG ?? r.metricKg ?? 0) || 0;
          map.set(r.country, prev);
        });
      };

      aggregate(impData, importMap);
      aggregate(expData, exportMap);

      // Build ranking rows
      const allCodes = new Set([...importMap.keys(), ...exportMap.keys()]);
      const rows: CountryRanking[] = [];
      let grandTotal = 0;

      for (const code of allCodes) {
        const imp = importMap.get(code) || { fob: 0, kg: 0 };
        const exp = exportMap.get(code) || { fob: 0, kg: 0 };
        const totalFob = imp.fob + exp.fob;
        grandTotal += totalFob;
        rows.push({
          rank: 0,
          code,
          name: code,
          importFob: imp.fob,
          exportFob: exp.fob,
          totalFob,
          sharePct: 0,
          importKg: imp.kg,
          exportKg: exp.kg,
          totalKg: imp.kg + exp.kg,
        });
      }

      // Compute shares
      for (const r of rows) {
        r.sharePct = grandTotal > 0 ? (r.totalFob / grandTotal) * 100 : 0;
      }

      // Initial sort by total FOB desc
      rows.sort((a, b) => b.totalFob - a.totalFob);
      rows.forEach((r, i) => { r.rank = i + 1; });

      setRankings(rows);
      if (errs.length) setErrors(errs);
    }).catch(() => {
      if (!cancelled) {
        setErrors(["Falha ao carregar dados"]);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [year]);

  // ── Resolve country names from reference table ──
  useEffect(() => {
    if (rankings.length === 0) return;
    let cancelled = false;

    comexstat.getCountries().then((data: any) => {
      if (cancelled) return;
      const nameMap = new Map<string, string>();
      const list = Array.isArray(data) ? data : data?.data?.list || [];
      for (const c of list) {
        const code = String(c.codigo || c.code || "");
        const name = c.nome_pais || c.name || "";
        if (code && name) nameMap.set(code, name);
      }
      setRankings(prev =>
        prev.map(r => ({
          ...r,
          name: nameMap.get(r.code) || r.code,
        }))
      );
    }).catch(() => {
      // Leave codes as names
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankings.length > 0]);

  // ── Sort / filter logic ──
  const filteredRankings = useMemo(() => {
    let result = [...rankings];

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q));
    }

    // Flow filter
    if (flowFilter === "import") {
      result = result.filter(r => r.importFob > 0);
    } else if (flowFilter === "export") {
      result = result.filter(r => r.exportFob > 0);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "rank": cmp = a.rank - b.rank; break;
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "import": cmp = a.importFob - b.importFob; break;
        case "export": cmp = a.exportFob - b.exportFob; break;
        case "total": cmp = a.totalFob - b.totalFob; break;
        case "share": cmp = a.sharePct - b.sharePct; break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    // Re-assign ranks after sort
    return result.map((r, i) => ({ ...r, rank: i + 1 }));
  }, [rankings, search, flowFilter, sortField, sortDir]);

  // ── Chart data (top 10 by total volume) ──
  const chartData = useMemo((): ChartData[] => {
    return [...rankings]
      .sort((a, b) => b.totalFob - a.totalFob)
      .slice(0, 10)
      .map(r => ({
        name: r.name.length > 18 ? r.name.slice(0, 16) + "…" : r.name,
        totalFob: r.totalFob,
        importFob: r.importFob,
        exportFob: r.exportFob,
      }));
  }, [rankings]);

  // ── Toggle sort ──
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // ── Sort indicator helper ──
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-30" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3 h-3 ml-1 inline" />
      : <ChevronUp className="w-3 h-3 ml-1 inline" />;
  };

  /* ── Loading state ── */
  if (loading && rankings.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a84c] mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Carregando rankings...</p>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="p-6 space-y-6">
      {/* Error banner */}
      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Algumas consultas não responderam: {errors.join(", ")}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#c9a84c]" />
            Rankings de Comércio Exterior
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Países com maior volume de comércio com o Brasil
          </p>
        </div>

        {/* Year selector */}
        <div className="flex gap-2">
          {AVAILABLE_YEARS.filter(y => Number(y) >= 2022).map(y => (
            <Button
              key={y}
              variant={year === y ? "default" : "outline"}
              size="sm"
              onClick={() => setYear(y)}
              className={year === y ? "bg-[#c9a84c] hover:bg-[#b8943a]" : ""}
            >
              {y}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "import", "export"] as FlowFilter[]).map(f => (
            <Button
              key={f}
              variant={flowFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFlowFilter(f)}
              className={flowFilter === f ? "bg-[#c9a84c] hover:bg-[#b8943a]" : ""}
            >
              {f === "all" ? "Total" : f === "import" ? "Importação" : "Exportação"}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Summary cards ── */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Países</p>
              <p className="text-lg font-bold text-slate-800 mt-1">{rankings.length}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Importação</p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {formatFOB(rankings.reduce((s, r) => s + r.importFob, 0))}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Exportação</p>
              <p className="text-lg font-bold text-blue-600 mt-1">
                {formatFOB(rankings.reduce((s, r) => s + r.exportFob, 0))}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total</p>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {formatFOB(rankings.reduce((s, r) => s + r.totalFob, 0))}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Bar Chart (Top 10) ── */}
      {chartData.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#c9a84c]" />
              Top 10 Países por Volume ({year})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    angle={-35}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(v: number) => formatFOB(v)}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatFOB(value), "Volume FOB"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="totalFob" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Rankings Table ── */}
      {filteredRankings.length > 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th
                    className="px-4 py-3 text-left font-semibold text-slate-600 cursor-pointer select-none w-14"
                    onClick={() => toggleSort("rank")}
                  >
                    # <SortIcon field="rank" />
                  </th>
                  <th
                    className="px-4 py-3 text-left font-semibold text-slate-600 cursor-pointer select-none"
                    onClick={() => toggleSort("name")}
                  >
                    País <SortIcon field="name" />
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold text-slate-600 cursor-pointer select-none"
                    onClick={() => toggleSort("import")}
                  >
                    Importação <SortIcon field="import" />
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold text-slate-600 cursor-pointer select-none"
                    onClick={() => toggleSort("export")}
                  >
                    Exportação <SortIcon field="export" />
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold text-slate-600 cursor-pointer select-none"
                    onClick={() => toggleSort("total")}
                  >
                    Total <SortIcon field="total" />
                  </th>
                  <th
                    className="px-4 py-3 text-right font-semibold text-slate-600 cursor-pointer select-none"
                    onClick={() => toggleSort("share")}
                  >
                    Share <SortIcon field="share" />
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-600">
                    Peso (KG)
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRankings.map((r) => (
                  <tr
                    key={r.code}
                    className={cn(
                      "border-b border-slate-100 hover:bg-slate-50 transition-colors",
                      r.rank <= 3 && "bg-amber-50/40"
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-xs",
                          r.rank === 1 && "bg-amber-100 text-amber-800 border-amber-200",
                          r.rank === 2 && "bg-slate-100 text-slate-700 border-slate-200",
                          r.rank === 3 && "bg-orange-50 text-orange-700 border-orange-200",
                        )}
                      >
                        {r.rank}º
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">
                      {r.name}
                    </td>
                    <td className="px-4 py-2.5 text-right text-green-600 font-mono text-xs">
                      {r.importFob > 0 ? formatFOB(r.importFob) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right text-blue-600 font-mono text-xs">
                      {r.exportFob > 0 ? formatFOB(r.exportFob) : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800 font-mono text-xs">
                      {formatFOB(r.totalFob)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500 font-mono text-xs">
                      {formatPct(r.sharePct)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500 font-mono text-xs">
                      {r.totalKg > 0 ? formatNumber(r.totalKg) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Package className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">
              {search ? "Nenhum país encontrado para esta busca." : "Nenhum dado disponível para o período selecionado."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
